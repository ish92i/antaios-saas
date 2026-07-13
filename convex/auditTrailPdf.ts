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
  },
}

function t(key: string, locale: string): string {
  return LABELS[locale]?.[key] ?? LABELS["fr"]?.[key] ?? key
}

function dateFmt(locale: string): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

const NUM_FMT = new Intl.NumberFormat("fr-FR")

export const generateAuditTrailPdf = action({
  args: {
    shipmentId: v.id("shipments"),
    locale: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ url: string; filename: string }> => {
    const locale = args.locale ?? "fr"

    const shipment = await ctx.runQuery(internal.shipments.getShipmentById, {
      shipmentId: args.shipmentId,
    })
    if (!shipment) throw new Error("Shipment not found")

    const extractedData = (shipment.extractedData ?? {}) as Record<string, unknown>
    const ref = (shipment.internalRef ?? extractedData.shipmentRef ?? "unknown") as string
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "")
    const filename = `audit-trail-${ref}-${today}.pdf`

    const riskAssessment = shipment.riskAssessment as
      | {
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
      | undefined
    if (!riskAssessment) throw new Error("Risk assessment not found for shipment")

    const org = shipment.orgId
      ? await ctx.runQuery(internal.orgs.getOrgById, { orgId: shipment.orgId as Id<"organizations"> })
      : null

    const fmtDate = dateFmt(locale).format(new Date(riskAssessment.generatedAt))
    const fmtTs = (ts: number) => dateFmt(locale).format(new Date(ts))

    function evalLabel(key: string): string {
      return t(key, locale)
    }

    const countryRiskSource = riskAssessment.countryRisk.source || "Banque mondiale — AG.LND.FRST.ZS (2023)"
    const deforestationSource = riskAssessment.deforestationRisk.source || "Scan satellitaire — Global Forest Watch"

    const docDefinition: any = {
      pageSize: "A4",
      pageMargins: [40, 40, 40, 80],
      content: [
        { text: t("title", locale), style: "header", alignment: "center" },

        { text: "\n" },

        {
          table: {
            widths: ["35%", "65%"],
            body: [
              [{ text: t("shipment_ref", locale), bold: true }, ref],
              [{ text: t("company", locale), bold: true }, org?.name ?? "-"],
              [{ text: t("eori", locale), bold: true }, org?.eoriNumber ?? "-"],
              [{ text: t("generated_on", locale), bold: true }, fmtDate],
              [
                { text: t("commodity", locale), bold: true },
                (extractedData.commodityName as string) ?? "-",
              ],
              [
                { text: t("hs_code", locale), bold: true },
                (extractedData.hsCode as string) ?? "-",
              ],
              [
                { text: t("country_of_production", locale), bold: true },
                (extractedData.countryOfProduction as string) ?? "-",
              ],
              [
                { text: t("supplier", locale), bold: true },
                (extractedData.supplierName as string) ?? "-",
              ],
              [
                { text: t("quantity", locale), bold: true },
                `${NUM_FMT.format((extractedData.quantity as number) ?? 0)} ${(extractedData.quantityUnit as string) ?? ""}`,
              ],
              [
                { text: t("plot_reference", locale), bold: true },
                (extractedData.plotReference as string) ?? t("no_parcel", locale),
              ],
              [
                { text: t("dds_reference", locale), bold: true },
                shipment.tracesRef ?? t("not_submitted", locale),
              ],
            ],
          },
          layout: "noBorders",
        },

        { text: "\n" },
        { text: t("risk_assessment", locale), style: "sectionHeader" },

        {
          table: {
            widths: ["30%", "35%", "35%"],
            headerRows: 1,
            body: [
              [
                { text: t("criterion", locale), bold: true },
                { text: t("evaluation", locale), bold: true },
                { text: t("source", locale), bold: true },
              ],
              [
                t("country_risk", locale),
                evalLabel(riskAssessment.countryRisk.classification),
                countryRiskSource,
              ],
              [
                t("deforestation_risk", locale),
                evalLabel(riskAssessment.deforestationRisk.result),
                deforestationSource,
              ],
              [
                t("supply_chain_complexity", locale),
                t("not_evaluated", locale),
                t("not_evaluated", locale),
              ],
              [
                t("documentation_risk", locale),
                riskAssessment.documentationRisk.complete ? t("complete", locale) : t("incomplete", locale),
                "",
              ],
              [
                t("indigenous_rights", locale),
                t("not_evaluated", locale),
                t("not_evaluated", locale),
              ],
            ],
          },
          layout: "lightHorizontalLines",
        },

        { text: "\n" },
        {
          text: [
            { text: `${t("verdict", locale)} : `, bold: true },
            {
              text:
                riskAssessment.verdict === "negligible"
                  ? t("negligible", locale)
                  : t("non_negligible", locale),
              color: riskAssessment.verdict === "negligible" ? "green" : "red",
              bold: true,
            },
          ],
        },

        ...(riskAssessment.verdict === "non_negligible"
          ? [
              { text: "\n" },
              { text: t("flagged_criteria", locale), style: "sectionHeader" },
              {
                ul: riskAssessment.flaggedCriteria.map((c) => t(c, locale)),
              },
            ]
          : []),

        ...(riskAssessment.verdict === "non_negligible" &&
        riskAssessment.mitigationActions &&
        riskAssessment.mitigationActions.length > 0
          ? [
              { text: "\n" },
              { text: t("mitigation_actions", locale), style: "sectionHeader" },
              {
                table: {
                  widths: ["60%", "40%"],
                  headerRows: 1,
                  body: [
                    [
                      { text: t("action", locale), bold: true },
                      { text: t("date", locale), bold: true },
                    ],
                    ...riskAssessment.mitigationActions.map((m) => [
                      m.action,
                      fmtTs(m.date),
                    ]),
                  ],
                },
                layout: "lightHorizontalLines",
              },
            ]
          : []),

        { text: "\n\n" },
        { text: `${t("evaluated_by", locale)} : ${t("system", locale)} — ${fmtDate}`, italics: true, fontSize: 9 },
      ],
      styles: {
        header: { fontSize: 16, bold: true, margin: [0, 0, 0, 12] },
        sectionHeader: { fontSize: 11, bold: true, margin: [0, 8, 0, 4] },
      },
      defaultStyle: { font: "Helvetica", fontSize: 9 },
      footer: {
        columns: [
          { text: t("retention_notice", locale), alignment: "center", fontSize: 7, italics: true, margin: [40, 0, 40, 0] },
        ],
      },
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
    const storageId = await ctx.storage.store(
      new Blob([new Uint8Array(pdfBuffer)], { type: "application/pdf" }),
    )

    const url = await ctx.storage.getUrl(storageId)
    if (!url) throw new Error("Failed to generate storage URL")

    return { url, filename }
  },
})
