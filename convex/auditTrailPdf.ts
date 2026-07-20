"use node"

import { action } from "@cvx/_generated/server"
import { v } from "convex/values"
import { internal } from "@cvx/_generated/api"
import type { Id } from "@cvx/_generated/dataModel"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

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
    risk_assessment_unavailable: "Évaluation des risques non disponible — l'expédition a été créée avant la mise en place de cette fonctionnalité",
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
    risk_assessment_unavailable: "Risk assessment not available — shipment was created before this feature was introduced",
  },
  de: {
    title: "Prüfpfad — EUDR-Rückverfolgbarkeit",
    shipment_ref: "Sendungsreferenz",
    company: "Unternehmen",
    eori: "EORI-/SIRET-Nummer",
    generated_on: "Erstellt am",
    commodity: "Ware",
    hs_code: "HS-Code",
    country_of_production: "Erzeugerland",
    supplier: "Lieferant",
    quantity: "Menge / Nettomasse",
    plot_reference: "Parzellenreferenz",
    risk_assessment: "Risikobewertung (Art. 10 Abs. 2)",
    criterion: "Kriterium",
    evaluation: "Bewertung",
    source: "Quelle",
    country_risk: "Länderrisiko",
    deforestation_risk: "Entwaldungsrisiko",
    supply_chain_complexity: "Komplexität der Lieferkette",
    documentation_risk: "Dokumentenzuverlässigkeit",
    indigenous_rights: "Landrechte / indigene Völker",
    verdict: "Fazit",
    negligible: "Geringes Risiko",
    non_negligible: "Nicht geringes Risiko",
    not_evaluated: "Nicht bewertet",
    low: "Niedrig",
    standard: "Standard",
    high: "Hoch",
    clear: "Keine Alarme",
    flagged: "Alarme gefunden",
    unknown: "Unbekannt",
    complete: "Vollständig",
    incomplete: "Unvollständig",
    mitigation_actions: "Abhilfemaßnahmen",
    action: "Maßnahme",
    date: "Datum",
    evaluated_by: "Bewertet von",
    system: "Antaios — Risk Engine v1",
    retention_notice: "Aufbewahrt gemäß Art. 12 EUDR — 5 Jahre ab DDS-Übermittlung",
    dds_reference: "DDS-Referenz",
    not_submitted: "Nicht übermittelt",
    flagged_criteria: "Kriterien, die zu einem nicht geringen Risiko geführt haben",
    none: "Keine",
    parcel: "Geolokalisierte Parzelle",
    no_parcel: "Keine Parzelle",
    risk_assessment_unavailable: "Risikobewertung nicht verfügbar — die Sendung wurde vor Einführung dieser Funktion erstellt",
  },
  es: {
    title: "Pista de auditoría — Trazabilidad EUDR",
    shipment_ref: "Referencia del envío",
    company: "Empresa",
    eori: "N.º EORI / SIRET",
    generated_on: "Generado el",
    commodity: "Producto básico",
    hs_code: "Código SA",
    country_of_production: "País de producción",
    supplier: "Proveedor",
    quantity: "Cantidad / Masa neta",
    plot_reference: "Referencia de la parcela",
    risk_assessment: "Evaluación de riesgos (art. 10, apdo. 2)",
    criterion: "Criterio",
    evaluation: "Evaluación",
    source: "Fuente",
    country_risk: "Riesgo país",
    deforestation_risk: "Riesgo de deforestación",
    supply_chain_complexity: "Complejidad de la cadena de suministro",
    documentation_risk: "Fiabilidad documental",
    indigenous_rights: "Derechos territoriales / pueblos indígenas",
    verdict: "Conclusión",
    negligible: "Riesgo insignificante",
    non_negligible: "Riesgo no insignificante",
    not_evaluated: "No evaluado",
    low: "Bajo",
    standard: "Estándar",
    high: "Alto",
    clear: "Sin alertas",
    flagged: "Alertas detectadas",
    unknown: "Desconocido",
    complete: "Completo",
    incomplete: "Incompleto",
    mitigation_actions: "Acciones de mitigación",
    action: "Acción",
    date: "Fecha",
    evaluated_by: "Evaluado por",
    system: "Antaios — Risk Engine v1",
    retention_notice: "Conservado conforme al art. 12 EUDR — 5 años desde la presentación DDS",
    dds_reference: "Referencia DDS",
    not_submitted: "No presentado",
    flagged_criteria: "Criterios que dieron lugar a un resultado no insignificante",
    none: "Ninguno",
    parcel: "Parcela geolocalizada",
    no_parcel: "Sin parcela",
    risk_assessment_unavailable: "Evaluación de riesgos no disponible — el envío se creó antes de implementar esta funcionalidad",
  },
  nl: {
    title: "Auditpad — EUDR-traceerbaarheid",
    shipment_ref: "Zendingreferentie",
    company: "Bedrijf",
    eori: "EORI-/SIRET-nummer",
    generated_on: "Gegenereerd op",
    commodity: "Grondstof",
    hs_code: "GS-code",
    country_of_production: "Productieland",
    supplier: "Leverancier",
    quantity: "Hoeveelheid / nettogewicht",
    plot_reference: "Perceelreferentie",
    risk_assessment: "Risicobeoordeling (art. 10, lid 2)",
    criterion: "Criterium",
    evaluation: "Beoordeling",
    source: "Bron",
    country_risk: "Landenrisico",
    deforestation_risk: "Ontbossingsrisico",
    supply_chain_complexity: "Complexiteit van de toeleveringsketen",
    documentation_risk: "Documentatiebetrouwbaarheid",
    indigenous_rights: "Grondrechten / inheemse volken",
    verdict: "Conclusie",
    negligible: "Verwaarloosbaar risico",
    non_negligible: "Niet-verwaarloosbaar risico",
    not_evaluated: "Niet geëvalueerd",
    low: "Laag",
    standard: "Standaard",
    high: "Hoog",
    clear: "Geen meldingen",
    flagged: "Meldingen gevonden",
    unknown: "Onbekend",
    complete: "Volledig",
    incomplete: "Onvolledig",
    mitigation_actions: "Mitigerende maatregelen",
    action: "Actie",
    date: "Datum",
    evaluated_by: "Beoordeeld door",
    system: "Antaios — Risk Engine v1",
    retention_notice: "Bewaard conform art. 12 EUDR — 5 jaar na DDS-indiening",
    dds_reference: "DDS-referentie",
    not_submitted: "Niet ingediend",
    flagged_criteria: "Criteria die hebben geleid tot een niet-verwaarloosbaar resultaat",
    none: "Geen",
    parcel: "Geogelokaliseerd perceel",
    no_parcel: "Geen perceel",
    risk_assessment_unavailable: "Risicobeoordeling niet beschikbaar — de zending is aangemaakt voordat deze functie werd geïntroduceerd",
  },
  pt: {
    title: "Pista de auditoria — Rastreabilidade EUDR",
    shipment_ref: "Referência da remessa",
    company: "Empresa",
    eori: "N.º EORI / SIRET",
    generated_on: "Gerado em",
    commodity: "Mercadoria",
    hs_code: "Código SH",
    country_of_production: "País de produção",
    supplier: "Fornecedor",
    quantity: "Quantidade / Massa líquida",
    plot_reference: "Referência da parcela",
    risk_assessment: "Avaliação de risco (art. 10, n.º 2)",
    criterion: "Critério",
    evaluation: "Avaliação",
    source: "Fonte",
    country_risk: "Risco país",
    deforestation_risk: "Risco de desmatamento",
    supply_chain_complexity: "Complexidade da cadeia de abastecimento",
    documentation_risk: "Fiabilidade documental",
    indigenous_rights: "Direitos fundiários / povos indígenas",
    verdict: "Conclusão",
    negligible: "Risco insignificante",
    non_negligible: "Risco não insignificante",
    not_evaluated: "Não avaliado",
    low: "Baixo",
    standard: "Padrão",
    high: "Alto",
    clear: "Sem alertas",
    flagged: "Alertas encontrados",
    unknown: "Desconhecido",
    complete: "Completo",
    incomplete: "Incompleto",
    mitigation_actions: "Ações de mitigação",
    action: "Ação",
    date: "Data",
    evaluated_by: "Avaliado por",
    system: "Antaios — Risk Engine v1",
    retention_notice: "Conservado nos termos do art. 12.º EUDR — 5 anos a contar da apresentação DDS",
    dds_reference: "Referência DDS",
    not_submitted: "Não apresentado",
    flagged_criteria: "Critérios que originaram um resultado não insignificante",
    none: "Nenhum",
    parcel: "Parcela geolocalizada",
    no_parcel: "Sem parcela",
    risk_assessment_unavailable: "Avaliação de risco não disponível — a remessa foi criada antes da introdução desta funcionalidade",
  },
  it: {
    title: "Traccia di audit — Tracciabilità EUDR",
    shipment_ref: "Riferimento spedizione",
    company: "Azienda",
    eori: "N. EORI / SIRET",
    generated_on: "Generato il",
    commodity: "Materia prima",
    hs_code: "Codice SA",
    country_of_production: "Paese di produzione",
    supplier: "Fornitore",
    quantity: "Quantità / Massa netta",
    plot_reference: "Riferimento particella",
    risk_assessment: "Valutazione del rischio (art. 10, par. 2)",
    criterion: "Criterio",
    evaluation: "Valutazione",
    source: "Fonte",
    country_risk: "Rischio paese",
    deforestation_risk: "Rischio deforestazione",
    supply_chain_complexity: "Complessità della catena di approvvigionamento",
    documentation_risk: "Affidabilità documentale",
    indigenous_rights: "Diritti fondiari / popoli indigeni",
    verdict: "Giudizio",
    negligible: "Rischio trascurabile",
    non_negligible: "Rischio non trascurabile",
    not_evaluated: "Non valutato",
    low: "Basso",
    standard: "Standard",
    high: "Alto",
    clear: "Nessun allarme",
    flagged: "Allarmi rilevati",
    unknown: "Sconosciuto",
    complete: "Completo",
    incomplete: "Incompleto",
    mitigation_actions: "Azioni di mitigazione",
    action: "Azione",
    date: "Data",
    evaluated_by: "Valutato da",
    system: "Antaios — Risk Engine v1",
    retention_notice: "Conservato ai sensi dell'art. 12 EUDR — 5 anni dalla presentazione DDS",
    dds_reference: "Riferimento DDS",
    not_submitted: "Non presentato",
    flagged_criteria: "Criteri che hanno determinato un risultato non trascurabile",
    none: "Nessuno",
    parcel: "Particella geolocalizzata",
    no_parcel: "Nessuna particella",
    risk_assessment_unavailable: "Valutazione del rischio non disponibile — la spedizione è stata creata prima dell'introduzione di questa funzionalità",
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

function sanitize(s: string): string {
  return s.replace(/\u202f/g, " ")
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
    const org = shipment.orgId
      ? await ctx.runQuery(internal.orgs.getOrgById, { orgId: shipment.orgId as Id<"organizations"> })
      : null

    const fmtDate = dateFmt(locale).format(new Date(shipment._creationTime))
    const fmtTs = (ts: number) => dateFmt(locale).format(new Date(ts))

    function evalLabel(key: string): string {
      return t(key, locale)
    }

    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595.28, 841.89])

    const font = await pdfDoc.embedStandardFont(StandardFonts.Helvetica)
    const fontBold = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold)
    const fontOblique = await pdfDoc.embedStandardFont(StandardFonts.HelveticaOblique)

    const BLACK = rgb(0, 0, 0)
    const DARK_GRAY = rgb(0.3, 0.3, 0.3)
    const GRAY = rgb(0.5, 0.5, 0.5)
    const LIGHT_GRAY = rgb(0.75, 0.75, 0.75)
    const GREEN = rgb(0, 0.55, 0)
    const RED = rgb(0.8, 0.1, 0.1)
    const LINE_COLOR = rgb(0.82, 0.84, 0.86)

    const ML = 40
    const PAGE_W = 595.28
    const CW = PAGE_W - 2 * ML
    let y = 841.89 - 36

    function drawTableCell(yPos: number, text: string, x: number, font_: typeof font, size: number, color: typeof BLACK) {
      page.drawText(sanitize(text), { x, y: yPos, font: font_, size, color })
    }

    page.drawLine({ start: { x: ML, y: y - 2 }, end: { x: PAGE_W - ML, y: y - 2 }, thickness: 0.5, color: GRAY })
    y -= 8

    const titleText = t("title", locale)
    const titleW = fontBold.widthOfTextAtSize(titleText, 18)
    page.drawText(sanitize(titleText), {
      x: (PAGE_W - titleW) / 2, y: y - 18,
      font: fontBold, size: 18, color: BLACK,
    })
    y -= 24

    const subtitleText = `${t("generated_on", locale)} : ${fmtDate}  |  ${t("shipment_ref", locale)} : ${ref}`
    const subtitleW = font.widthOfTextAtSize(subtitleText, 8)
    page.drawText(sanitize(subtitleText), {
      x: (PAGE_W - subtitleW) / 2, y: y - 8,
      font, size: 8, color: DARK_GRAY,
    })
    y -= 14

    page.drawLine({ start: { x: ML, y }, end: { x: PAGE_W - ML, y }, thickness: 0.3, color: GRAY })
    y -= 14

    const RH = 20
    y -= 4

    const infoRows: { label: string; value: string }[] = [
      { label: t("shipment_ref", locale), value: ref },
      { label: t("company", locale), value: (extractedData.operatorName as string) ?? org?.name ?? "-" },
      { label: t("eori", locale), value: org?.eoriNumber ?? "-" },
      { label: t("commodity", locale), value: (extractedData.commodityName as string) ?? "-" },
      { label: t("hs_code", locale), value: (extractedData.hsCode as string) ?? "-" },
      { label: t("country_of_production", locale), value: (extractedData.countryOfProduction as string) ?? "-" },
      { label: t("supplier", locale), value: (extractedData.supplierName as string) ?? "-" },
      { label: t("quantity", locale), value: `${NUM_FMT.format((extractedData.quantity as number) ?? 0)} ${(extractedData.quantityUnit as string) ?? ""}` },
      { label: t("plot_reference", locale), value: (extractedData.plotReference as string) ?? (extractedData.geoJson ? t("parcel", locale) : t("no_parcel", locale)) },
      { label: t("dds_reference", locale), value: shipment.tracesRef ?? t("not_submitted", locale) },
    ]

    infoRows.forEach((row) => {
      const labelW = fontBold.widthOfTextAtSize(row.label + " : ", 8)
      drawTableCell(y - 5, row.label + " : ", ML + 6, fontBold, 8, DARK_GRAY)
      drawTableCell(y - 5, row.value, ML + 6 + labelW, font, 8, BLACK)
      y -= RH
    })
    y -= 16

    page.drawLine({ start: { x: ML, y }, end: { x: PAGE_W - ML, y }, thickness: 0.3, color: GRAY })
    y -= 16

    if (riskAssessment) {
      const countryRiskSource = riskAssessment.countryRisk.source || "Banque mondiale — AG.LND.FRST.ZS (2023)"
      const deforestationSource = riskAssessment.deforestationRisk.source || "Scan satellitaire — Global Forest Watch"

      page.drawText(sanitize(t("risk_assessment", locale)), {
        x: ML, y: y - 6, font: fontBold, size: 10, color: DARK_GRAY,
      })
      y -= 22

      const colWidths = [195, 120, CW - 315]
      drawTableCell(y - 5, t("criterion", locale), ML + 6, fontBold, 8, DARK_GRAY)
      drawTableCell(y - 5, t("evaluation", locale), ML + 6 + colWidths[0] + 4, fontBold, 8, DARK_GRAY)
      drawTableCell(y - 5, t("source", locale), ML + 6 + colWidths[0] + colWidths[1] + 4, fontBold, 8, DARK_GRAY)
      y -= 15
      page.drawLine({ start: { x: ML, y }, end: { x: PAGE_W - ML, y }, thickness: 0.3, color: GRAY })
      y -= 5

      const raRows: [string, string, string][] = [
        [t("country_risk", locale), evalLabel(riskAssessment.countryRisk.classification), countryRiskSource],
        [t("deforestation_risk", locale), evalLabel(riskAssessment.deforestationRisk.result), deforestationSource],
        [t("supply_chain_complexity", locale), t("not_evaluated", locale), t("not_evaluated", locale)],
        [t("documentation_risk", locale), riskAssessment.documentationRisk.complete ? t("complete", locale) : t("incomplete", locale), "Antaios"],
        [t("indigenous_rights", locale), t("not_evaluated", locale), t("not_evaluated", locale)],
      ]

      raRows.forEach(([criterion, evaluation, source], i) => {
        drawTableCell(y - 5, criterion, ML + 6, font, 8, BLACK)
        drawTableCell(y - 5, evaluation, ML + 6 + colWidths[0] + 4, font, 8, BLACK)
        drawTableCell(y - 5, source, ML + 6 + colWidths[0] + colWidths[1] + 4, font, 8, GRAY)
        y -= 15
        if (i < raRows.length - 1) {
          page.drawLine({ start: { x: ML, y }, end: { x: PAGE_W - ML, y }, thickness: 0.3, color: LINE_COLOR })
        }
        y -= 5
      })

      const verdictLabel = `${t("verdict", locale)} : `
      const verdictValue = riskAssessment.verdict === "negligible" ? t("negligible", locale) : t("non_negligible", locale)
      const verdictColor = riskAssessment.verdict === "negligible" ? GREEN : RED
      drawTableCell(y - 5, verdictLabel, ML + 6, fontBold, 9, BLACK)
      const vlW = fontBold.widthOfTextAtSize(verdictLabel, 9)
      drawTableCell(y - 5, verdictValue, ML + 6 + vlW, font, 9, verdictColor)
      y -= 22

      if (riskAssessment.verdict === "non_negligible" && riskAssessment.flaggedCriteria.length > 0) {
        page.drawLine({ start: { x: ML, y }, end: { x: PAGE_W - ML, y }, thickness: 0.3, color: GRAY })
        y -= 12

        page.drawText(sanitize(t("flagged_criteria", locale)), {
          x: ML, y: y - 5, font: fontBold, size: 9, color: DARK_GRAY,
        })
        y -= 14

        riskAssessment.flaggedCriteria.forEach((c) => {
          page.drawText(sanitize(`•  ${t(c, locale)}`), { x: ML + 6, y: y - 4, font, size: 8, color: BLACK })
          y -= 14
        })
        y -= 4

        const mitigationActions = riskAssessment.mitigationActions
        if (mitigationActions && mitigationActions.length > 0) {
          page.drawLine({ start: { x: ML, y }, end: { x: PAGE_W - ML, y }, thickness: 0.3, color: GRAY })
          y -= 12

          page.drawText(sanitize(t("mitigation_actions", locale)), {
            x: ML, y: y - 5, font: fontBold, size: 9, color: DARK_GRAY,
          })
          y -= 14

          const mColW = [CW - 100, 100]
          drawTableCell(y - 5, t("action", locale), ML + 6, fontBold, 8, DARK_GRAY)
          drawTableCell(y - 5, t("date", locale), ML + mColW[0] + 10, fontBold, 8, DARK_GRAY)
          y -= RH
          page.drawLine({ start: { x: ML, y }, end: { x: PAGE_W - ML, y }, thickness: 0.3, color: GRAY })
          y -= 4

          mitigationActions.forEach((m, i) => {
            drawTableCell(y - 5, m.action, ML + 6, font, 8, BLACK)
            drawTableCell(y - 5, fmtTs(m.date), ML + mColW[0] + 10, font, 8, BLACK)
            y -= RH
            if (i < mitigationActions.length - 1) {
              page.drawLine({ start: { x: ML, y }, end: { x: PAGE_W - ML, y }, thickness: 0.3, color: LINE_COLOR })
              y -= 4
            }
          })
          y -= 6
        }
      }

      y -= 6
    } else {
      y -= 4
      const fallbackW = fontOblique.widthOfTextAtSize(t("risk_assessment_unavailable", locale), 9)
      page.drawText(sanitize(t("risk_assessment_unavailable", locale)), {
        x: (PAGE_W - fallbackW) / 2, y: y - 9,
        font: fontOblique, size: 9, color: LIGHT_GRAY,
      })
    }

    const footerText = t("retention_notice", locale)
    const footerW = fontOblique.widthOfTextAtSize(footerText, 7)
    page.drawText(sanitize(footerText), {
      x: (PAGE_W - footerW) / 2, y: 45,
      font: fontOblique, size: 7, color: GRAY,
    })

    const pdfBytes = await pdfDoc.save()
    const storageId = await ctx.storage.store(
      new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" }),
    )
    const url = await ctx.storage.getUrl(storageId)
    if (!url) throw new Error("Failed to generate storage URL")
    return { url, filename }
  },
})
