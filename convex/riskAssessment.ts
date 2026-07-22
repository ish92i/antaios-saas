"use node"

import { internalAction } from "@cvx/_generated/server"
import { v } from "convex/values"
import { internal } from "@cvx/_generated/api"
import type { Doc, Id } from "@cvx/_generated/dataModel"
import { classifyCountryRisk } from "@cvx/lib/countryRisk"

interface RiskAssessmentResult {
  shipmentId: Id<"shipments">
  generatedAt: number
  countryRisk: {
    classification: "low" | "standard" | "high"
    deforestationRate: string | null
    source: string
  }
  deforestationRisk: {
    result: "clear" | "flagged" | "unknown"
    scanDate: number
    source: string
  }
  supplyChainComplexity: {
    intermediaryCount: number
    mixingRisk: boolean
  }
  documentationRisk: {
    complete: boolean
    redFlags: string[]
  }
  indigenousRights: {
    flagged: boolean
    note: string | null
  }
  verdict: "negligible" | "non_negligible"
  flaggedCriteria: string[]
  mitigationActions: { action: string; date: number }[] | null
  criteria: RiskCriterionAssessment[]
  verdictRationale: string
  retentionAnchor: {
    date: number
    source: "risk_assessment_generation"
  }
  documentVersion: string
  documentHash: string
}

type RiskLevel = "low" | "standard" | "high" | "clear" | "flagged" | "unknown" | "complete" | "incomplete"

interface RiskCriterionAssessment {
  id: string
  article10Criterion: string
  label: string
  evaluation: RiskLevel
  source: string
  rationale: string
  mitigationTrigger: string
  flagged: boolean
}

const COUNTRY_RISK_SOURCE = "Classification européenne — European Commission EUDR country benchmarking (Article 29), published May 2025"
const DEFORESTATION_SOURCE = "Scan satellitaire — Global Forest Watch"
const DECLARED_DATA_SOURCE = "Données déclarées / documents fournis"
const RISK_ENGINE_VERSION = "Antaios Risk Engine v2"

function firstString(data: Record<string, unknown>, fields: string[]): string | null {
  for (const field of fields) {
    const value = data[field]
    if (typeof value === "string" && value.trim()) return value.trim()
    if (typeof value === "number" && Number.isFinite(value)) return String(value)
    if (typeof value === "boolean") return value ? "true" : "false"
  }
  return null
}

function stringList(data: Record<string, unknown>, fields: string[]): string[] {
  const values: string[] = []
  for (const field of fields) {
    const value = data[field]
    if (typeof value === "string" && value.trim()) values.push(value.trim())
    if (Array.isArray(value)) {
      values.push(...value.map((item) => {
        if (typeof item === "string") return item.trim()
        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>
          return [record.type, record.body].filter((v) => typeof v === "string" && v.trim()).join(" ")
        }
        return ""
      }).filter(Boolean))
    }
  }
  return values
}

function parseIntermediaryCount(data: Record<string, unknown>): number | null {
  const numeric = data.intermediaryCount ?? data.numberOfIntermediaries ?? data.intermediariesCount
  if (typeof numeric === "number" && Number.isFinite(numeric) && numeric >= 0) return Math.floor(numeric)
  if (typeof numeric === "string" && numeric.trim()) {
    const parsed = Number.parseInt(numeric, 10)
    if (Number.isFinite(parsed) && parsed >= 0) return parsed
  }

  const intermediaries = data.intermediaries ?? data.supplyChainIntermediaries
  if (Array.isArray(intermediaries)) return intermediaries.length

  return null
}

function hasAffirmativeValue(data: Record<string, unknown>, fields: string[]): boolean {
  return fields.some((field) => {
    const value = data[field]
    if (value === true) return true
    if (typeof value === "string") return /^(yes|oui|true|provided|fourni|clear|verified|valid)/i.test(value.trim())
    return false
  })
}

function hasAdverseValue(data: Record<string, unknown>, fields: string[]): boolean {
  return fields.some((field) => {
    const value = data[field]
    if (value === true) return true
    if (typeof value === "string") return /(complaint|plainte|violation|litige|dispute|alert|alerte|irregular|irrégular|non[- ]?compliant|non conforme)/i.test(value)
    if (Array.isArray(value)) return value.length > 0
    return false
  })
}

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest("SHA-256", bytes)
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("")
}

export const computeRiskAssessment = internalAction({
  args: { shipmentId: v.id("shipments") },
  handler: async (ctx, args): Promise<RiskAssessmentResult> => {
    const shipment = await ctx.runQuery(internal.shipments.getShipmentById, {
      shipmentId: args.shipmentId,
    })
    if (!shipment) throw new Error("Shipment not found")

    const extractedData = (shipment.extractedData ?? {}) as Record<string, unknown>
    const flaggedCriteria: string[] = []
    const criteria: RiskCriterionAssessment[] = []

    // 1. Country risk — EC EUDR country benchmarking (Article 29, May 2025)
    const countryOfProduction = extractedData.countryOfProduction as string | undefined
    const iso = countryOfProduction?.toUpperCase().trim()
    const countryClassification = classifyCountryRisk(iso)

    // Missing or unrecognized country → flagged as unknown (not silently low risk)
    const countryFlagged = countryClassification === "high" || countryClassification === null
    if (countryFlagged) flaggedCriteria.push("country_risk")
    criteria.push({
      id: "country_risk",
      article10Criterion: "10(2)(a)",
      label: "Risque pays / zone de production",
      evaluation: countryClassification ?? "unknown",
      source: COUNTRY_RISK_SOURCE,
      rationale: countryOfProduction
        ? countryClassification
          ? `Pays de production déclaré: ${countryOfProduction} (${iso}); classification ${countryClassification} selon benchmarking EC Art. 29.`
          : `Pays de production déclaré: ${countryOfProduction} (${iso}); code ISO non reconnu dans la classification EC.`
        : "Pays de production non déclaré; classification non déterminée.",
      mitigationTrigger: "Si la zone est classée à risque élevé ou si le code pays n'est pas reconnu, obtenir justificatifs supplémentaires avant DDS.",
      flagged: countryFlagged,
    })

    // 2. Deforestation risk
    const scanMap: Record<string, "clear" | "flagged" | "unknown"> = {
      clean: "clear", alerts_found: "flagged", no_polygon: "unknown",
    }
    const deforestationResult = scanMap[shipment.scanResult ?? "no_polygon"] ?? "unknown"
    const deforestationFlagged = deforestationResult !== "clear"
    if (deforestationFlagged) flaggedCriteria.push("deforestation_risk")
    criteria.push({
      id: "deforestation_risk",
      article10Criterion: "10(2)(b)",
      label: "Présence de forêt / déforestation illégale",
      evaluation: deforestationResult,
      source: DEFORESTATION_SOURCE,
      rationale: deforestationResult === "clear"
        ? "La parcelle géolocalisée ne présente aucune alerte de déforestation dans le scan disponible."
        : deforestationResult === "flagged"
          ? "Le scan satellitaire a détecté une ou plusieurs alertes sur la zone fournie."
          : "Aucune parcelle exploitable n'est disponible; le risque de déforestation ne peut pas être exclu.",
      mitigationTrigger: "En cas d'alerte ou d'absence de polygone, demander géolocalisation complète, preuves de date de production et vérification indépendante.",
      flagged: deforestationFlagged,
    })

    // 3. Supply chain complexity and mixing risk
    const intermediaryCount = parseIntermediaryCount(extractedData)
    const declaredChain = stringList(extractedData, ["supplierName", "countryOfExport", "portOfLoading", "portOfEntry", "shipmentRef"])
    const mixingDeclared = hasAffirmativeValue(extractedData, ["mixingRisk", "mixedOrigin", "bulkMixed", "unknownOriginMixed"])
    const originTraceable = Boolean(firstString(extractedData, ["farmName", "villageName", "plotReference"]) || extractedData.geoJson)
    const mixingRisk = mixingDeclared || !originTraceable
    const supplyChainFlagged = intermediaryCount === null || intermediaryCount > 2 || mixingRisk
    const supplyChain = { intermediaryCount: intermediaryCount ?? 0, mixingRisk }
    if (supplyChainFlagged) flaggedCriteria.push("supply_chain_complexity")
    criteria.push({
      id: "supply_chain_complexity",
      article10Criterion: "10(2)(c)-(d)",
      label: "Origine, complexité, intermédiaires et risque de mélange",
      evaluation: supplyChainFlagged ? (intermediaryCount === null ? "unknown" : "flagged") : "clear",
      source: DECLARED_DATA_SOURCE,
      rationale: intermediaryCount === null
        ? `Nombre d'intermédiaires non déclaré; ${declaredChain.length} élément(s) de chaîne fournis; risque de mélange ${mixingRisk ? "présent ou non exclu" : "non identifié"}.`
        : `${intermediaryCount} intermédiaire(s) déclaré(s); risque de mélange ${mixingRisk ? "présent ou non exclu" : "non identifié"}; origine ${originTraceable ? "rattachée à une parcelle ou exploitation" : "insuffisamment rattachée à une parcelle"}.`,
      mitigationTrigger: "Si le nombre d'intermédiaires est inconnu/élevé ou si un mélange est possible, obtenir liste complète des acteurs, lots, séparations physiques et preuves de traçabilité.",
      flagged: supplyChainFlagged,
    })

    // 4. Documentation risk
    const docs = await ctx.runQuery(internal.documents.getDocumentsByShipment, {
      shipmentId: args.shipmentId,
    })
    const redFlags: string[] = []
    const failedDocs = docs.filter((d: Doc<"shipmentDocuments">) => d.extractionStatus === "failed")
    if (failedDocs.length > 0) {
      redFlags.push(`${failedDocs.length} document(s) en échec d'extraction`)
    }
    const missingFields = extractedData.missingFields as string[] | undefined
    if (missingFields && missingFields.length > 0) {
      redFlags.push(`${missingFields.length} champ(s) manquant(s)`)
    }
    const docComplete = redFlags.length === 0
    if (!docComplete) flaggedCriteria.push("documentation_risk")
    criteria.push({
      id: "documentation_risk",
      article10Criterion: "10(2)(e)",
      label: "Communications d'autorités, plaintes et irrégularités documentaires",
      evaluation: docComplete ? "complete" : "incomplete",
      source: "Antaios — extraction documentaire",
      rationale: docComplete
        ? "Aucun échec d'extraction ni champ manquant n'a été relevé dans les documents fournis."
        : `Points documentaires à résoudre: ${redFlags.join("; ")}.`,
      mitigationTrigger: "En cas de document incomplet, plainte, communication d'autorité ou irrégularité, collecter pièces corrigées et preuves de vérification avant mise sur le marché.",
      flagged: !docComplete,
    })

    // 5. Other verifiable information: permits, land title, certifications, local rights, labour/human rights
    const certifications = stringList(extractedData, ["certifications"])
    const legalEvidence = firstString(extractedData, ["legalPermit", "legalPermits", "landTitle", "landUseRight", "harvestPermit"])
    const rightsEvidence = firstString(extractedData, ["indigenousRightsAssessment", "localStakeholderInput", "communityConsent", "fpicEvidence"])
    const labourEvidence = firstString(extractedData, ["labourRightsAssessment", "laborRightsAssessment", "humanRightsAssessment"])
    const adverseRights = hasAdverseValue(extractedData, [
      "authorityFindings",
      "complaints",
      "irregularities",
      "indigenousRightsComplaint",
      "landDispute",
      "labourViolations",
      "laborViolations",
      "humanRightsViolations",
    ])
    const plotSupplierFlagged = adverseRights || !legalEvidence || !rightsEvidence || !labourEvidence
    const indigenous = {
      flagged: plotSupplierFlagged,
      note: plotSupplierFlagged
        ? "Informations foncières, droits locaux ou droits humains incomplètes ou défavorables."
        : "Permis/titre, droits locaux et indicateurs sociaux déclarés sans alerte.",
    }
    if (plotSupplierFlagged) flaggedCriteria.push("plot_supplier_risk")
    criteria.push({
      id: "plot_supplier_risk",
      article10Criterion: "10(2)(f)",
      label: "Permis, titre foncier, peuples autochtones et droits humains",
      evaluation: plotSupplierFlagged ? (adverseRights ? "flagged" : "unknown") : "clear",
      source: certifications.length > 0 ? `${DECLARED_DATA_SOURCE}; certifications: ${certifications.join(", ")}` : DECLARED_DATA_SOURCE,
      rationale: [
        legalEvidence ? "permis/titre fourni" : "permis/titre non fourni",
        rightsEvidence ? "droits locaux/peuples autochtones documentés" : "droits locaux/peuples autochtones non documentés",
        labourEvidence ? "indicateurs sociaux documentés" : "indicateurs sociaux non documentés",
        adverseRights ? "plainte ou irrégularité déclarée/détectée" : "aucune plainte ou irrégularité déclarée",
      ].join("; ") + ".",
      mitigationTrigger: "Si une preuve foncière/sociale manque ou si une plainte existe, obtenir permis, titre, preuve FPIC/consultation, vérification sociale ou certification pertinente.",
      flagged: plotSupplierFlagged,
    })

    const verdict: "negligible" | "non_negligible" = flaggedCriteria.length > 0 ? "non_negligible" : "negligible"

    const mitigationRaw = extractedData.mitigationMeasures as string | undefined
    const mitigationActions = mitigationRaw?.trim()
      ? [{ action: mitigationRaw.trim(), date: 0 }]
      : null

    const generatedAt = Date.now()
    const verdictRationale = verdict === "negligible"
      ? "Tous les critères Article 10(2) évalués sont clairs, faibles ou complets; aucune indication de risque non négligeable n'a été retenue."
      : `Risque non négligeable retenu car ${flaggedCriteria.length} critère(s) nécessite(nt) information ou mitigation supplémentaire: ${flaggedCriteria.join(", ")}.`
    const hashPayload = JSON.stringify({
      shipmentId: args.shipmentId,
      generatedAt,
      criteria,
      verdict,
      flaggedCriteria,
      version: RISK_ENGINE_VERSION,
    })

    const assessment = {
      shipmentId: args.shipmentId,
      generatedAt,
      countryRisk: {
        classification: countryClassification ?? "low",
        deforestationRate: null,
        source: COUNTRY_RISK_SOURCE,
      },
      deforestationRisk: {
        result: deforestationResult,
        scanDate: shipment.scanRunAt ?? 0,
        source: DEFORESTATION_SOURCE,
      },
      supplyChainComplexity: supplyChain,
      documentationRisk: {
        complete: docComplete,
        redFlags,
      },
      indigenousRights: indigenous,
      verdict,
      flaggedCriteria,
      mitigationActions,
      criteria,
      verdictRationale,
      retentionAnchor: {
        date: generatedAt,
        source: "risk_assessment_generation" as const,
      },
      documentVersion: RISK_ENGINE_VERSION,
      documentHash: await sha256Hex(hashPayload),
    }

    await ctx.runMutation(internal.shipments.storeRiskAssessment, {
      shipmentId: args.shipmentId,
      riskAssessment: assessment,
    })

    await ctx.scheduler.runAfter(0, internal.audit.insertAuditLog, {
      shipmentId: args.shipmentId,
      orgId: shipment.orgId,
      actor: "system",
      eventType: "risk_assessment_generated",
      payload: { verdict: assessment.verdict, flaggedCriteria: assessment.flaggedCriteria },
    })

    return assessment
  },
})
