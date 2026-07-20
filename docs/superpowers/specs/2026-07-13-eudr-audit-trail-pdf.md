# EUDR Shipment Audit Trail PDF with Risk Scoring

> **Status:** Draft spec
> **Goal:** Add a risk-scoring layer + downloadable "audit trail" PDF to the shipment detail panel for EUDR Article 12 retention / Article 10(2) compliance.

## Architecture

### Data flow

```
Shipment finalized (status=ready)
         │
         ▼
Convex mutation: computeRiskAssessment
  - Reads shipment.extractedData, shipment.scanResult
  - Calls World Bank API (server-side fetch, no key) for country forest cover
  - Computes verdict: negligible | non_negligible
  - Persists riskAssessment on shipment
         │
         ▼
User clicks "Download audit trail" button
         │
         ▼
Convex action: generateAuditTrailPdf
  - Reads shipment + riskAssessment
  - Builds pdfmake doc definition from locale dict
  - Generates PDF, stores in Convex storage
  - Returns storageId → download URL
```

### Risk criteria (Article 10(2))

| # | Criterion | Data source | V1 status |
|---|-----------|-------------|-----------|
| 1 | Country risk | World Bank API `AG.LND.FRST.ZS` (forest area %) — free, no key | Live |
| 2 | Deforestation risk | Existing `shipment.scanResult` (clean/alerts_found/no_polygon) | Live |
| 3 | Supply chain complexity | No data available | "Non évalué" |
| 4 | Documentation risk | `shipmentDocuments` extraction status + completeness red flags | Live |
| 5 | Indigenous / land rights | No usable public API for commodity-specific disputes | "Non évalué" + stub |

### Verdict logic

- All 5 criteria evaluated independently
- Any criterion flagged as non-compliant → verdict = `non_negligible`
- All clear → `negligible`
- Flagged criteria array lists which criteria drove the verdict
- `mitigationActions` populated only when `non_negligible` (pulled from `extractedData.mitigationMeasures` if present)

## File changes

### Backend (Convex)

| File | Action | Purpose |
|------|--------|---------|
| `convex/schema.ts` | Modify | Add `riskAssessment` field to `shipments` table |
| `convex/riskAssessment.ts` | **Create** | Risk scoring logic + World Bank API call |
| `convex/auditTrailPdf.ts` | **Create** | Audit trail PDF generation using pdfmake + locale dict |
| `convex/shipments.ts` | Modify | Trigger risk computation on shipment finalization |

### Frontend

| File | Action | Purpose |
|------|--------|---------|
| `src/components/ui/tooltip.tsx` | **Create** | Official shadcn/ui Tooltip component |
| `src/components/shipments/ShipmentDetailPanel.tsx` | Modify | Add "Download audit trail" button in bottom bar |
| `src/app.tsx` | Modify | Add `TooltipProvider` wrapper to Providers |
| `package.json` | Modify | Add `@radix-ui/react-tooltip` dependency |

### Configuration

| File | Action | Purpose |
|------|--------|---------|
| `package.json` | Modify | Install `@radix-ui/react-tooltip` |

## Component design

### `convex/riskAssessment.ts` — Risk scoring action

```
computeRiskAssessment(shipmentId): { riskAssessment }
```

Steps:
1. Fetch shipment + extractedData
2. Get country ISO code from `countryOfProduction`
3. Call `api.worldbank.org/v2/country/{iso}/indicator/AG.LND.FRST.ZS?format=json` for forest cover %
4. Classify: < 20% forest cover = high, 20-50% = standard, > 50% = low
5. Read scanResult for deforestation risk
6. Set supplyChainComplexity as "non évalué"
7. Check document extraction statuses for documentation completeness
8. Set indigenousRights as "non évalué"
9. Compute verdict
10. Persist to `shipment.riskAssessment`

### `convex/auditTrailPdf.ts` — PDF generation

```
generateAuditTrailPdf(shipmentId, locale): { storageId, url }
```

- Uses `pdfmake` (existing dependency)
- Accepts `locale: "fr"` param — selects matching locale dict
- PDF structure (single page):
  1. **Header:** Shipment reference, company, SIRET/EORI, timestamp, commodity + HS code
  2. **Shipment info:** Country of production, supplier, quantity, plot reference summary
  3. **Risk assessment table:** 5 criteria rows (criterion | evaluation | source)
  4. **Verdict + metadata:** System + logic version + timestamp
  5. **Mitigation** (conditional on non_negligible): list of actions + dates
  6. **Footer:** Retention notice, DDS reference (if submitted)
- Filename: `audit-trail-{shipmentRef}-{YYYYMMDD}.pdf`

### Locale dict structure

```ts
const labels: Record<string, Record<string, string>> = {
  fr: {
    title: "Piste d'audit — Traçabilité EUDR",
    shipment_ref: "Référence expédition",
    company: "Société",
    generated_on: "Généré le",
    country_of_production: "Pays de production",
    supplier: "Fournisseur",
    quantity: "Quantité",
    country_risk: "Risque pays",
    deforestation_risk: "Risque de déforestation",
    supply_chain_complexity: "Complexité de la chaîne d'approvisionnement",
    documentation_risk: "Fiabilité documentaire",
    indigenous_rights: "Droits fonciers / peuples autochtones",
    verdict: "Conclusion",
    negligible: "Risque négligeable",
    non_negligible: "Risque non négligeable",
    mitigation_actions: "Actions de mitigation",
    retention_notice: "Conservé conformément à l'art. 12 EUDR — 5 ans à compter de la soumission DDS",
    dds_reference: "Référence DDS",
    // ... all display strings
  },
  en: {
    // skeleton for future
  }
}
```

All display strings pulled from dict — no hardcoded text in render function. `Intl.DateTimeFormat("fr-FR")` and `Intl.NumberFormat("fr-FR")` for French formatting.

### UI: Button placement

In `ShipmentDetailPanel.tsx` bottom bar, next to Resolve/Submit but visually muted:

```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <button className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors py-1">
      <FileText className="size-3" />
      {t("detail.download_audit_trail")}
    </button>
  </TooltipTrigger>
  <TooltipContent>
    <p>{t("detail.audit_trail_hint")}</p>
  </TooltipContent>
</Tooltip>
```

- `variant="ghost"` minimal styling — much less prominent than the yellow Resolve or primary Submit buttons
- Tooltip on hover: "Certaines données peuvent être manquantes"
- Calls `api.auditTrailPdf.generateAuditTrailPdf` action on click

### i18n strings added

New keys in `fr.json` and `en.json`:
- `detail.download_audit_trail`: "Télécharger la piste d'audit" / "Download audit trail"
- `detail.audit_trail_hint`: "Certaines données peuvent être manquantes" / "Some data may be missing"

### Risk assessment schema addition

Add to `convex/schema.ts` shipments table:

```ts
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

### Tooltip component

Official shadcn/ui Tooltip — `src/components/ui/tooltip.tsx`:

```tsx
import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className, sideOffset = 4, children, ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 max-w-sm rounded-md border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
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

## Exclusions

- No "submit to authority" flow — PDF is for internal retention only
- Single-page report, table-driven, no prose paragraphs
- No LLM-generated content (unlike the existing RiskPdfDialog which uses LiteLLM)
- No geolocation plot raw GeoJSON in PDF — only summary reference
