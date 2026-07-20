# EUDR Audit Trail PDF Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add risk scoring + downloadable "audit trail" PDF to shipment detail panel for EUDR Article 12 compliance.

**Architecture:** Convex action computes risk assessment from existing shipment data + World Bank API (no key), persists on shipment. Separate Convex action generates PDF via pdfmake with locale dict. Frontend button in detail panel bottom bar with shadcn Tooltip.

**Tech Stack:** Convex (schema/mutations/actions), pdfmake, World Bank API (free), @radix-ui/react-tooltip, i18next, Tailwind v4

## Global Constraints

- All display strings in PDF must come from locale dict — no hardcoded text in render function
- French-only for v1 (`fr`), `en` skeleton ready
- Dates: `DD/MM/YYYY` via `Intl.DateTimeFormat("fr-FR")`
- Numbers: comma as decimal separator via `Intl.NumberFormat("fr-FR")`
- PDF filename: `audit-trail-{shipmentRef}-{YYYYMMDD}.pdf`
- Supply chain complexity = "Non évalué" (no data)
- Indigenous rights = "Non évalué" with stub flag (no data source)
- Mitigation section only appears when verdict = `non_negligible`
- Button in bottom bar, less prominent than Resolve/Submit
- Tooltip on hover: "Certaines données peuvent être manquantes"
- Run `npm run typecheck && npm run lint` after each task

---

### Task 1: Add `riskAssessment` schema field + create risk scoring action

**Files:**
- Modify: `convex/schema.ts` — add `riskAssessment` field to `shipments` table
- Create: `convex/riskAssessment.ts` — risk computation action

**Interfaces:**
- Produces: `convex/riskAssessment.ts` exports `computeRiskAssessment` (action) and `riskAssessmentValidator` (validator)
- The `riskAssessmentValidator` is used by `schema.ts` and by `auditTrailPdf.ts` (Task 2)

- [ ] **Step 1: Add riskAssessment field to schema**

In `convex/schema.ts`, add `riskAssessment` field to the `shipments` defineTable call, after `lockedAt`:

```typescript
riskAssessment: v.optional(v.object({
  shipmentId: v.id("shipments"),
  generatedAt: v.number(),
  countryRisk: v.object({
    classification: v.union(v.literal("low"), v.literal("standard"), v.literal("high")),
    deforestationRate: v.union(v.string(), v.null()),
    source: v.string(),
  }),
  deforestationRisk: v.object({
    result: v.union(v.literal("clear"), v.literal("flagged"), v.literal("unknown")),
    scanDate: v.number(),
    source: v.string(),
  }),
  supplyChainComplexity: v.object({
    intermediaryCount: v.number(),
    mixingRisk: v.boolean(),
  }),
  documentationRisk: v.object({
    complete: v.boolean(),
    redFlags: v.array(v.string()),
  }),
  indigenousRights: v.object({
    flagged: v.boolean(),
    note: v.union(v.string(), v.null()),
  }),
  verdict: v.union(v.literal("negligible"), v.literal("non_negligible")),
  flaggedCriteria: v.array(v.string()),
  mitigationActions: v.union(v.array(v.object({
    action: v.string(),
    date: v.number(),
  })), v.null()),
})),
```

- [ ] **Step 2: Create `convex/riskAssessment.ts`**

```typescript
"use node"

import { action } from "@cvx/_generated/server"
import { v } from "convex/values"
import { internal } from "@cvx/_generated/api"
import type { Id } from "@cvx/_generated/dataModel"
import type { Doc } from "@cvx/_generated/dataModel"

const COUNTRY_RISK_SOURCE = "Banque mondiale — AG.LND.FRST.ZS (2023)"
const DEFORESTATION_SOURCE = "Scan satellitaire — Global Forest Watch"
const SUPPLY_CHAIN_SOURCE = "Déclaration opérateur"
const DOCUMENTATION_SOURCE = "Extraction documentaire"
const INDIGENOUS_SOURCE = "Données non disponibles"

const COUNTRY_ISO_MAP: Record<string, string> = {
  france: "FR", germany: "DE", italy: "IT", spain: "ES",
  portugal: "PT", netherlands: "NL", belgium: "BE", "côte d'ivoire": "CI",
  "cote d'ivoire": "CI", ghana: "GH", cameroon: "CM", indonesia: "ID",
  malaysia: "MY", brazil: "BR", colombia: "CO", peru: "PE",
  "democratic republic of the congo": "CD", "drc": "CD", nigeria: "NG",
  china: "CN", india: "IN", "united states": "US", "us": "US",
  uk: "GB", "united kingdom": "GB",
}

const COMMODITY_DEFORESTATION_RISK: Record<string, "high" | "medium" | "low"> = {
  cocoa: "high", palm: "high", "palm oil": "high",
  rubber: "high", beef: "high", soy: "high",
  coffee: "medium", "café": "medium",
  timber: "high", wood: "high",
}

function classifyForestCover(pct: number | null): "low" | "standard" | "high" {
  if (pct === null) return "standard"
  if (pct < 20) return "high"
  if (pct < 50) return "standard"
  return "low"
}

function getIsoFromCountry(country: string | undefined): string | null {
  if (!country) return null
  const key = country.toLowerCase().trim()
  return COUNTRY_ISO_MAP[key] ?? null
}

export const riskAssessmentValidator = v.object({
  shipmentId: v.id("shipments"),
  generatedAt: v.number(),
  countryRisk: v.object({
    classification: v.union(v.literal("low"), v.literal("standard"), v.literal("high")),
    deforestationRate: v.union(v.string(), v.null()),
    source: v.string(),
  }),
  deforestationRisk: v.object({
    result: v.union(v.literal("clear"), v.literal("flagged"), v.literal("unknown")),
    scanDate: v.number(),
    source: v.string(),
  }),
  supplyChainComplexity: v.object({
    intermediaryCount: v.number(),
    mixingRisk: v.boolean(),
  }),
  documentationRisk: v.object({
    complete: v.boolean(),
    redFlags: v.array(v.string()),
  }),
  indigenousRights: v.object({
    flagged: v.boolean(),
    note: v.union(v.string(), v.null()),
  }),
  verdict: v.union(v.literal("negligible"), v.literal("non_negligible")),
  flaggedCriteria: v.array(v.string()),
  mitigationActions: v.union(v.array(v.object({
    action: v.string(),
    date: v.number(),
  })), v.null()),
})

export type RiskAssessment = {
  shipmentId: Id<"shipments">
  generatedAt: number
  countryRisk: { classification: "low" | "standard" | "high"; deforestationRate: string | null; source: string }
  deforestationRisk: { result: "clear" | "flagged" | "unknown"; scanDate: number; source: string }
  supplyChainComplexity: { intermediaryCount: number; mixingRisk: boolean }
  documentationRisk: { complete: boolean; redFlags: string[] }
  indigenousRights: { flagged: boolean; note: string | null }
  verdict: "negligible" | "non_negligible"
  flaggedCriteria: string[]
  mitigationActions: { action: string; date: number }[] | null
}

export const computeRiskAssessment = action({
  args: { shipmentId: v.id("shipments") },
  handler: async (ctx, args): Promise<RiskAssessment> => {
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
              deforestationRate = pct !== null ? `${pct.toFixed(1)}%` : null
              countryClassification = classifyForestCover(pct)
            }
          }
        }
      } catch {
        countryClassification = "standard"
      }
    }

    if (countryClassification === "high") flaggedCriteria.push("country_risk")

    // 2. Deforestation risk — from scan result
    const scanMap: Record<string, "clear" | "flagged" | "unknown"> = {
      clean: "clear",
      alerts_found: "flagged",
      no_polygon: "unknown",
    }
    const deforestationResult = scanMap[shipment.scanResult ?? "no_polygon"] ?? "unknown"
    if (deforestationResult === "flagged") flaggedCriteria.push("deforestation_risk")

    // 3. Supply chain complexity — no data, mark as not evaluated
    const supplyChain = { intermediaryCount: 0, mixingRisk: false }

    // 4. Documentation risk — check document extraction + missing fields
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

    // Mitigation actions from extractedData
    const mitigationRaw = extractedData.mitigationMeasures as string | undefined
    const mitigationActions = mitigationRaw?.trim()
      ? [{ action: mitigationRaw.trim(), date: Date.now() }]
      : null

    const assessment: RiskAssessment = {
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

    return assessment
  },
})
```

- [ ] **Step 3: Add `storeRiskAssessment` internal mutation to `convex/shipments.ts`**

Add after `storePdfResult`:

```typescript
export const storeRiskAssessment = internalMutation({
  args: {
    shipmentId: v.id("shipments"),
    riskAssessment: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.shipmentId, {
      riskAssessment: args.riskAssessment,
    })
  },
})
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: passes without errors

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: passes without errors

---

### Task 2: Create audit trail PDF generation action

**Files:**
- Create: `convex/auditTrailPdf.ts` — PDF generation with locale dict

**Interfaces:**
- Consumes: `RiskAssessment` type from Task 1, `shipments.getShipmentById` internal query
- Produces: `generateAuditTrailPdf` action (takes `shipmentId` + `locale`, returns `{ url: string }`)

- [ ] **Step 1: Create `convex/auditTrailPdf.ts`**

```typescript
"use node"

import { action } from "@cvx/_generated/server"
import { v } from "convex/values"
import { internal } from "@cvx/_generated/api"
import type { Id } from "@cvx/_generated/dataModel"

const LABELS: Record<string, Record<string, string>> = {
  fr: {
    title: "Piste d'audit — Traçabilité EUDR",
    shipment_ref: "Référence expédition",
    company: "Société",
    eori: "N° EORI / SIRET",
    generated_on: "Généré le",
    commodity: "Marchandise",
    hs_code: "Code SH",
    country_of_production: "Pays de production",
    supplier: "Fournisseur",
    quantity: "Quantité / Masse nette",
    plot_reference: "Référence parcelle",
    risk_assessment: "Évaluation des risques (art. 10, para. 2)",
    criterion: "Critère",
    evaluation: "Évaluation",
    source: "Source",
    country_risk: "Risque pays",
    deforestation_risk: "Risque de déforestation",
    supply_chain_complexity: "Complexité de la chaîne d'approvisionnement",
    documentation_risk: "Fiabilité documentaire",
    indigenous_rights: "Droits fonciers / peuples autochtones",
    verdict: "Conclusion",
    negligible: "Risque négligeable",
    non_negligible: "Risque non négligeable",
    not_evaluated: "Non évalué",
    low: "Faible",
    standard: "Standard",
    high: "Élevé",
    clear: "Aucune alerte",
    flagged: "Alertes détectées",
    unknown: "Non déterminé",
    yes: "Oui",
    no: "Non",
    complete: "Complet",
    incomplete: "Incomplet",
    mitigation_actions: "Actions de mitigation",
    action: "Action",
    date: "Date",
    evaluated_by: "Évalué par",
    system: "Antaios — Risk Engine v1",
    retention_notice: "Conservé conformément à l'art. 12 EUDR — 5 ans à compter de la soumission DDS",
    dds_reference: "Référence DDS",
    not_submitted: "Non soumis",
    flagged_criteria: "Critères ayant déclenché un risque non négligeable",
    none: "Aucun",
    parcel: "Parcelle géolocalisée",
    no_parcel: "Aucune parcelle",
    country_risk_desc: "Classification basée sur le taux de couvert forestier (Banque mondiale)",
    deforestation_risk_desc: "Analyse satellitaire des parcelles",
    supply_chain_desc: "Nombre d'intermédiaires et risque de mélange — données non disponibles",
    documentation_desc: "Vérification de l'extraction des documents fournisseurs",
    indigenous_desc: "Conflits fonciers connus dans la région — données non disponibles",
  },
  en: {
    title: "Audit Trail — EUDR Traceability",
    shipment_ref: "Shipment reference",
    company: "Company",
    eori: "EORI / SIRET number",
    generated_on: "Generated on",
    commodity: "Commodity",
    hs_code: "HS code",
    country_of_production: "Country of production",
    supplier: "Supplier",
    quantity: "Quantity / Net mass",
    plot_reference: "Plot reference",
    risk_assessment: "Risk assessment (Art. 10(2))",
    criterion: "Criterion",
    evaluation: "Evaluation",
    source: "Source",
    country_risk: "Country risk",
    deforestation_risk: "Deforestation risk",
    supply_chain_complexity: "Supply chain complexity",
    documentation_risk: "Documentation reliability",
    indigenous_rights: "Indigenous / land rights",
    verdict: "Verdict",
    negligible: "Negligible risk",
    non_negligible: "Non-negligible risk",
    not_evaluated: "Not evaluated",
    low: "Low",
    standard: "Standard",
    high: "High",
    clear: "Clear",
    flagged: "Alerts found",
    unknown: "Unknown",
    yes: "Yes",
    no: "No",
    complete: "Complete",
    incomplete: "Incomplete",
    mitigation_actions: "Mitigation actions",
    action: "Action",
    date: "Date",
    evaluated_by: "Evaluated by",
    system: "Antaios — Risk Engine v1",
    retention_notice: "Retained per Art. 12 EUDR — 5 years from DDS submission",
    dds_reference: "DDS reference",
    not_submitted: "Not submitted",
    flagged_criteria: "Criteria that drove a non-negligible result",
    none: "None",
    parcel: "Geolocated parcel",
    no_parcel: "No parcel",
    country_risk_desc: "Classification based on forest cover rate (World Bank)",
    deforestation_risk_desc: "Satellite analysis of parcels",
    supply_chain_desc: "Intermediary count and mixing risk — data not available",
    documentation_desc: "Verification of supplier document extraction",
    indigenous_desc: "Known land rights disputes in region — data not available",
  },
}

function fmtDate(ts: number, locale: string): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    day: "2-digit", month: "2-digit", year: "numeric",
  }).format(new Date(ts))
}

function fmtNumber(n: number, locale: string): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB").format(n)
}

function fmtQty(qty: number | undefined, unit: string | undefined, locale: string): string {
  if (qty === undefined || qty === null) return "—"
  const u = unit ?? ""
  const n = fmtNumber(qty, locale)
  return locale === "fr" ? `${n} ${u}` : `${n} ${u}`
}

function l(locale: string, key: string): string {
  return (LABELS[locale] ?? LABELS.fr)[key] ?? key
}

export const generateAuditTrailPdf = action({
  args: {
    shipmentId: v.id("shipments"),
    locale: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ url: string }> => {
    const locale = args.locale ?? "fr"
    const shipment = await ctx.runQuery(internal.shipments.getShipmentById, {
      shipmentId: args.shipmentId,
    })
    if (!shipment) throw new Error("Shipment not found")

    const data = (shipment.extractedData ?? {}) as Record<string, unknown>
    const risk = shipment.riskAssessment as Record<string, unknown> | undefined
    const orgId = shipment.orgId

    const org = orgId
      ? await ctx.runQuery(internal.orgs.getOrgById, { orgId: orgId as Id<"organizations"> })
      : null

    const shipmentRef = (data.shipmentRef as string) ?? shipment.internalRef ?? shipment._id
    const dateStr = fmtDate(Date.now(), locale)
    const fileName = `audit-trail-${shipmentRef}-${dateStr.replace(/\//g, "")}.pdf`

    // PDF content
    const content: any[] = []

    // Header
    content.push(
      { text: l(locale, "title"), style: "header", alignment: "center" },
      { text: "\n" },
    )

    // Info table
    const infoRows: any[][] = [
      [l(locale, "shipment_ref"), shipmentRef],
      [l(locale, "company"), (data.operatorName as string) ?? org?.name ?? "—"],
      [l(locale, "eori"), (data.eoriNumber as string) ?? org?.eoriNumber ?? "—"],
      [l(locale, "generated_on"), fmtDate(Date.now(), locale)],
      [l(locale, "commodity"), (data.commodityName as string) ?? "—"],
      [l(locale, "hs_code"), (data.hsCode as string) ?? "—"],
      [l(locale, "country_of_production"), (data.countryOfProduction as string) ?? "—"],
      [l(locale, "supplier"), (data.supplierName as string) ?? "—"],
      [l(locale, "quantity"), fmtQty(data.quantity as number | undefined, data.quantityUnit as string | undefined, locale)],
      [l(locale, "plot_reference"), data.geoJson ? l(locale, "parcel") : l(locale, "no_parcel")],
    ]
    content.push({
      table: {
        headerRows: 0,
        widths: ["30%", "70%"],
        body: infoRows.map((row) => [
          { text: row[0], style: "tableLabel" },
          { text: row[1], style: "tableValue" },
        ]),
      },
      layout: { hLineWidth: () => 0, vLineWidth: () => 0, paddingLeft: () => 0, paddingRight: () => 4, paddingTop: () => 2, paddingBottom: () => 2 },
    })
    content.push({ text: "\n" })

    // Risk assessment
    content.push({ text: l(locale, "risk_assessment"), style: "sectionHeader" })
    content.push({ text: "\n" })

    const criteriaMap: Record<string, { eval: string; source: string }> = {}
    if (risk) {
      const r = risk as any
      criteriaMap.country_risk = {
        eval: r.countryRisk?.classification ? l(locale, r.countryRisk.classification) : l(locale, "not_evaluated"),
        source: r.countryRisk?.source ?? COUNTRY_RISK_SOURCE,
      }
      criteriaMap.deforestation_risk = {
        eval: r.deforestationRisk?.result ? l(locale, r.deforestationRisk.result) : l(locale, "not_evaluated"),
        source: r.deforestationRisk?.source ?? DEFORESTATION_SOURCE,
      }
      criteriaMap.supply_chain_complexity = {
        eval: l(locale, "not_evaluated"),
        source: l(locale, "supply_chain_desc"),
      }
      criteriaMap.documentation_risk = {
        eval: r.documentationRisk?.complete ? l(locale, "complete") : l(locale, "incomplete"),
        source: r.documentationRisk?.redFlags?.join("; ") ?? "—",
      }
      criteriaMap.indigenous_rights = {
        eval: l(locale, "not_evaluated"),
        source: l(locale, "indigenous_desc"),
      }
    }

    const criteriaKeys = ["country_risk", "deforestation_risk", "supply_chain_complexity", "documentation_risk", "indigenous_rights"]
    const criteriaLabels: Record<string, string> = {
      country_risk: l(locale, "country_risk"),
      deforestation_risk: l(locale, "deforestation_risk"),
      supply_chain_complexity: l(locale, "supply_chain_complexity"),
      documentation_risk: l(locale, "documentation_risk"),
      indigenous_rights: l(locale, "indigenous_rights"),
    }

    const tableBody: any[][] = [
      [
        { text: l(locale, "criterion"), style: "tableHeader" },
        { text: l(locale, "evaluation"), style: "tableHeader" },
        { text: l(locale, "source"), style: "tableHeader" },
      ],
    ]

    for (const key of criteriaKeys) {
      const entry = criteriaMap[key] ?? { eval: l(locale, "not_evaluated"), source: "—" }
      tableBody.push([
        { text: criteriaLabels[key] ?? key, style: "tableCell" },
        { text: entry.eval, style: "tableCell" },
        { text: entry.source, style: "tableCell" },
      ])
    }

    content.push({
      table: {
        headerRows: 1,
        widths: ["30%", "25%", "45%"],
        body: tableBody,
      },
      layout: {
        hLineWidth: (i: number) => (i === 0 || i === 1 ? 1 : 0.5),
        vLineWidth: () => 0.5,
        hLineColor: () => "#ccc",
        vLineColor: () => "#ccc",
        paddingLeft: () => 6,
        paddingRight: () => 6,
        paddingTop: () => 4,
        paddingBottom: () => 4,
      },
    })
    content.push({ text: "\n" })

    // Verdict
    if (risk) {
      const r = risk as any
      content.push({
        columns: [
          { text: l(locale, "verdict"), style: "tableLabel" },
          {
            text: r.verdict === "negligible" ? l(locale, "negligible") : l(locale, "non_negligible"),
            style: r.verdict === "negligible" ? "verdictGreen" : "verdictRed",
          },
        ],
      })
      content.push({ text: "\n" })

      // Flagged criteria
      const flagged = r.flaggedCriteria as string[] | undefined
      if (flagged && flagged.length > 0) {
        const flaggedLabels = flagged.map((k: string) => criteriaLabels[k] ?? k)
        content.push({
          columns: [
            { text: l(locale, "flagged_criteria"), style: "tableLabel" },
            { text: flaggedLabels.join(", "), style: "tableValue" },
          ],
        })
        content.push({ text: "\n" })
      }

      // Evaluated by
      content.push({
        columns: [
          { text: l(locale, "evaluated_by"), style: "tableLabel" },
          { text: `${l(locale, "system")} — ${fmtDate(r.generatedAt ?? Date.now(), locale)}`, style: "tableValue" },
        ],
      })
      content.push({ text: "\n" })
    }

    // Mitigation
    if (risk) {
      const r = risk as any
      const actions = r.mitigationActions as Array<{ action: string; date: number }> | null | undefined
      if (r.verdict === "non_negligible" && actions && actions.length > 0) {
        content.push({ text: l(locale, "mitigation_actions"), style: "sectionHeader" })
        const mitBody: any[][] = [
          [
            { text: l(locale, "action"), style: "tableHeader" },
            { text: l(locale, "date"), style: "tableHeader" },
          ],
        ]
        for (const a of actions) {
          mitBody.push([
            { text: a.action, style: "tableCell" },
            { text: fmtDate(a.date, locale), style: "tableCell" },
          ])
        }
        content.push({
          table: { headerRows: 1, widths: ["70%", "30%"], body: mitBody },
          layout: {
            hLineWidth: (i: number) => (i === 0 || i === 1 ? 1 : 0.5),
            vLineWidth: () => 0.5,
            hLineColor: () => "#ccc",
            vLineColor: () => "#ccc",
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 4,
            paddingBottom: () => 4,
          },
        })
        content.push({ text: "\n" })
      }
    }

    // Footer
    content.push({
      columns: [
        { text: l(locale, "retention_notice"), style: "footer" },
      ],
    })
    content.push({ text: "\n" })

    // DDS reference
    content.push({
      columns: [
        { text: l(locale, "dds_reference"), style: "footerLabel" },
        { text: shipment.tracesRef ?? l(locale, "not_submitted"), style: "footerValue" },
      ],
    })

    const docDefinition: any = {
      content,
      styles: {
        header: { fontSize: 16, bold: true, margin: [0, 0, 0, 8] },
        sectionHeader: { fontSize: 12, bold: true, margin: [0, 6, 0, 4] },
        tableHeader: { fontSize: 9, bold: true, fillColor: "#f3f4f6" },
        tableLabel: { fontSize: 9, bold: true, color: "#6b7280" },
        tableValue: { fontSize: 9 },
        tableCell: { fontSize: 9 },
        verdictGreen: { fontSize: 10, bold: true, color: "#16a34a" },
        verdictRed: { fontSize: 10, bold: true, color: "#dc2626" },
        footer: { fontSize: 7, color: "#9ca3af", italics: true },
        footerLabel: { fontSize: 8, bold: true, color: "#6b7280" },
        footerValue: { fontSize: 8, color: "#6b7280" },
      },
      defaultStyle: { font: "Helvetica", fontSize: 9 },
      pageSize: { width: 595, height: 842 },
      pageMargins: [40, 40, 40, 40],
    }

    const pdfMakePrinter = await import("pdfmake")
    const pdfmake = pdfMakePrinter.default ?? pdfMakePrinter
    const fonts = {
      Helvetica: {
        normal: "Helvetica",
        bold: "Helvetica-Bold",
        italics: "Helvetica-Oblique",
        bolditalics: "Helvetica-BoldOblique",
      },
    }
    pdfmake.fonts = fonts

    const printer = pdfmake.createPdf(docDefinition)
    const pdfBuffer: Buffer = await printer.getBuffer()
    const storageId = await ctx.storage.store(new Blob([new Uint8Array(pdfBuffer)], { type: "application/pdf" }))

    const url = await ctx.storage.getUrl(storageId)
    if (!url) throw new Error("Failed to get storage URL")

    await ctx.runMutation(internal.shipments.storePdfResult, {
      shipmentId: shipment._id,
      storageId,
    })

    return { url }
  },
})
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: passes without errors

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: passes without errors

---

### Task 3: Install Tooltip + create component + add to root + i18n strings

**Files:**
- Modify: `package.json` — add `@radix-ui/react-tooltip`
- Create: `src/components/ui/tooltip.tsx` — shadcn Tooltip component
- Modify: `src/app.tsx` — add `TooltipProvider` wrapper
- Modify: `src/locales/fr.json` — add audit trail + tooltip strings
- Modify: `src/locales/en.json` — add audit trail + tooltip strings

- [ ] **Step 1: Install `@radix-ui/react-tooltip`**

```bash
npm install @radix-ui/react-tooltip
```

Expected: package added to `dependencies` in `package.json`

- [ ] **Step 2: Create `src/components/ui/tooltip.tsx`**

```typescript
import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipPrimitive.Root data-slot="tooltip" {...props} />
  )
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return (
    <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
  )
}

function TooltipContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 max-w-sm rounded-md border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className,
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
```

- [ ] **Step 3: Add `TooltipProvider` to `src/app.tsx`**

Add import at top:
```typescript
import { TooltipProvider } from "@/components/ui/tooltip"
```

Wrap children in `Providers` component:
```typescript
return (
  <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY as string}>
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>{children}</TooltipProvider>
      </QueryClientProvider>
    </ConvexProviderWithClerk>
  </ClerkProvider>
)
```

- [ ] **Step 4: Add i18n strings to `fr.json`**

Add under `"detail"` section:
```json
"download_audit_trail": "Télécharger la piste d'audit",
"audit_trail_hint": "Certaines données peuvent être manquantes"
```

- [ ] **Step 5: Add i18n strings to `en.json`**

Add under `"detail"` section:
```json
"download_audit_trail": "Download audit trail",
"audit_trail_hint": "Some data may be missing"
```

- [ ] **Step 6: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: passes without errors

---

### Task 4: Add download button to ShipmentDetailPanel

**Files:**
- Modify: `src/components/shipments/ShipmentDetailPanel.tsx` — add download button in bottom bar

**Interfaces:**
- Consumes: `Tooltip`, `TooltipTrigger`, `TooltipContent` from Task 3, `detail.download_audit_trail` + `detail.audit_trail_hint` i18n keys from Task 3
- Calls: `api.auditTrailPdf.generateAuditTrailPdf` action

- [ ] **Step 1: Add imports to ShipmentDetailPanel.tsx**

Add to imports:
```typescript
import { useAction } from "convex/react"
import { FileText } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { api } from "@cvx/_generated/api"
```

Note: `useAction` is already available (check existing imports in the file — it's not there yet, useAction is from convex/react which is already available in the project).

- [ ] **Step 2: Add state and action hook inside component**

Add after `const [scanTrigger, setScanTrigger] = useState(0)`:
```typescript
const [isDownloading, setIsDownloading] = useState(false)
const generateAuditTrail = useAction(api.auditTrailPdf.generateAuditTrailPdf)

const handleDownloadAuditTrail = useCallback(async () => {
  if (!shipmentId || isDownloading) return
  setIsDownloading(true)
  try {
    const result = await generateAuditTrail({
      shipmentId: shipmentId as Id<"shipments">,
      locale: "fr",
    }) as { url: string }
    if (result?.url) {
      window.open(result.url, "_blank")
    }
  } catch {
    // silently fail — audit trail is non-critical
  } finally {
    setIsDownloading(false)
  }
}, [shipmentId, isDownloading, generateAuditTrail])
```

- [ ] **Step 3: Add download button in bottom bar**

After the submit button (or after the Resolve button div), add:
```typescriptx
{!isSubmitted && (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        onClick={handleDownloadAuditTrail}
        disabled={isDownloading}
        className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors ml-auto"
      >
        <FileText className="size-3.5 mr-1 inline" />
        {isDownloading ? "..." : t("detail.download_audit_trail")}
      </button>
    </TooltipTrigger>
    <TooltipContent side="top">
      <p>{t("detail.audit_trail_hint")}</p>
    </TooltipContent>
  </Tooltip>
)}
```

Placement: between the `{isSubmitted ? ... : (...)}` block's right side. The button should be on the far right of the action bar, using `ml-auto` to push it right, visually separated from the Resolve/Submit buttons.

- [ ] **Step 4: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: passes without errors

---

### Task 5: Wire risk computation into shipment finalization

**Files:**
- Modify: `convex/shipments.ts` — trigger risk assessment on finalization

- [ ] **Step 1: Add risk computation trigger to `finalizeModal`**

In `convex/shipments.ts`, at the end of `finalizeModal` handler, after `await ctx.db.patch(...)`:

```typescript
// Trigger risk assessment computation
await ctx.scheduler.runAfter(0, internal.riskAssessment.computeRiskAssessment, {
  shipmentId: args.shipmentId,
})
```

Add import at top:
```typescript
import { internal } from "@cvx/_generated/api"
```

(Note: `internal` import should already exist in this file — verify and only add if missing)

- [ ] **Step 2: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: passes without errors

---

### Task 6: Register internal query and export riskAssessment

**Files:**
- Modify: `convex/shipments.ts` — ensure `getShipmentById` is an `internalQuery`
- Modify: `convex/documents.ts` — ensure `getDocumentsByShipment` is exported as `internalQuery`

**Note:** Both `getShipmentById` and `getDocumentsByShipment` already exist as internal queries in the codebase. Verify they are registered in `convex/_generated/api.d.ts` or accessible via `internal.shipments.getShipmentById` and `internal.documents.getDocumentsByShipment`.

- [ ] **Step 1: Verify internal query exports**

Run: `npm run typecheck`
Expected: no errors for `internal.shipments.getShipmentById` or `internal.documents.getDocumentsByShipment`

If there are errors, check that `convex/shipments.ts` has:
```typescript
export const getShipmentById = internalQuery({
  args: { shipmentId: v.id("shipments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.shipmentId)
  },
})
```

And `convex/documents.ts` has:
```typescript
export const getDocumentsByShipment = internalQuery({
  args: { shipmentId: v.id("shipments") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("shipmentDocuments")
      .withIndex("shipmentId", (q) => q.eq("shipmentId", args.shipmentId))
      .collect()
  },
})
```

- [ ] **Step 2: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: passes without errors

---

### Task 7: Verify org query availability

**Files:**
- Verify: `convex/orgs.ts` exports `getOrgById` internal query (used by auditTrailPdf.ts)

- [ ] **Step 1: Check for org query**

The PDF generator calls `internal.orgs.getOrgById`. Check if this exists. If not, create it.

Check by running: `grep -rn "getOrgById" convex/`

If it doesn't exist, add to `convex/orgs.ts` (or create the file):
```typescript
import { internalQuery } from "@cvx/_generated/server"
import { v } from "convex/values"

export const getOrgById = internalQuery({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orgId)
  },
})
```

- [ ] **Step 2: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: passes without errors
