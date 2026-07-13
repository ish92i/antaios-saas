"use node"

import { internalAction } from "@cvx/_generated/server"
import { v } from "convex/values"
import { internal } from "@cvx/_generated/api"
import type { Doc, Id } from "@cvx/_generated/dataModel"

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
}

const COUNTRY_RISK_SOURCE = "Banque mondiale — AG.LND.FRST.ZS (2023)"
const DEFORESTATION_SOURCE = "Scan satellitaire — Global Forest Watch"
const COUNTRY_ISO_MAP: Record<string, string> = {
  france: "FR", germany: "DE", italy: "IT", spain: "ES",
  portugal: "PT", netherlands: "NL", belgium: "BE", "côte d'ivoire": "CI",
  "cote d'ivoire": "CI", ghana: "GH", cameroon: "CM", indonesia: "ID",
  malaysia: "MY", brazil: "BR", colombia: "CO", peru: "PE",
  "democratic republic of the congo": "CD", "drc": "CD", nigeria: "NG",
  china: "CN", india: "IN", "united states": "US", "us": "US",
  uk: "GB", "united kingdom": "GB",
}

function classifyForestCover(pct: number | null): "low" | "standard" | "high" {
  if (pct === null) return "standard"
  if (pct < 20) return "low"
  if (pct < 50) return "standard"
  return "high"
}

function getIsoFromCountry(country: string | undefined): string | null {
  if (!country) return null
  const key = country.toLowerCase().trim()
  return COUNTRY_ISO_MAP[key] ?? null
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

    // 1. Country risk — World Bank API
    const countryName = extractedData.countryOfProduction as string | undefined
    const iso = getIsoFromCountry(countryName)
    let countryClassification: "low" | "standard" | "high" = "standard"
    let deforestationRate: string | null = null

    if (iso) {
      try {
        const url = `https://api.worldbank.org/v2/country/${iso}/indicator/AG.LND.FRST.ZS?format=json`
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
        if (res.ok) {
          const json = await res.json()
          const records = json[1] as Array<{ value: string | null }> | undefined
          if (records) {
            const valid = records.filter((r) => r.value !== null)
            if (valid.length > 0) {
              const latest = valid[valid.length - 1]
              const pct = latest.value ? parseFloat(latest.value) : null
              deforestationRate = pct !== null ? `${new Intl.NumberFormat("fr-FR").format(pct)}%` : null
              countryClassification = classifyForestCover(pct)
            }
          }
        }
      } catch {
        countryClassification = "standard"
      }
    }

    if (countryClassification === "high") flaggedCriteria.push("country_risk")

    // 2. Deforestation risk
    const scanMap: Record<string, "clear" | "flagged" | "unknown"> = {
      clean: "clear", alerts_found: "flagged", no_polygon: "unknown",
    }
    const deforestationResult = scanMap[shipment.scanResult ?? "no_polygon"] ?? "unknown"
    if (deforestationResult === "flagged") flaggedCriteria.push("deforestation_risk")

    // 3. Supply chain complexity — no data
    const supplyChain = { intermediaryCount: -1, mixingRisk: false }

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

    // 5. Indigenous rights — stub
    const indigenous = { flagged: false, note: "Données non disponibles — évaluation non réalisée" }

    const verdict: "negligible" | "non_negligible" = flaggedCriteria.length > 0 ? "non_negligible" : "negligible"

    const mitigationRaw = extractedData.mitigationMeasures as string | undefined
    const mitigationActions = mitigationRaw?.trim()
      ? [{ action: mitigationRaw.trim(), date: 0 }]
      : null

    const assessment = {
      shipmentId: args.shipmentId,
      generatedAt: Date.now(),
      countryRisk: {
        classification: countryClassification,
        deforestationRate,
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
