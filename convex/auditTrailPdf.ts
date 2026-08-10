"use node"

import { action } from "@cvx/_generated/server"
import { v } from "convex/values"
import { internal } from "@cvx/_generated/api"
import type { Id } from "@cvx/_generated/dataModel"
import { execFile } from "node:child_process"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)

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
    retention_notice: "Conservé conformément à l'art. 12 EUDR — 5 ans à compter de la génération de l'évaluation",
    dds_reference: "Référence DDS",
    not_submitted: "Non soumis",
    flagged_criteria: "Critères ayant déclenché un risque non négligeable",
    rationale: "Justification",
    document_stamp: "Version / hash",
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
    retention_notice: "Retained per Art. 12 EUDR — 5 years from risk-assessment generation",
    dds_reference: "DDS reference",
    not_submitted: "Not submitted",
    flagged_criteria: "Criteria that drove a non-negligible result",
    rationale: "Rationale",
    document_stamp: "Version / hash",
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
    retention_notice: "Aufbewahrt gemäß Art. 12 EUDR — 5 Jahre ab Erstellung der Risikobewertung",
    dds_reference: "DDS-Referenz",
    not_submitted: "Nicht übermittelt",
    flagged_criteria: "Kriterien, die zu einem nicht geringen Risiko geführt haben",
    rationale: "Begründung",
    document_stamp: "Version / Hash",
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
    retention_notice: "Conservado conforme al art. 12 EUDR — 5 años desde la generación de la evaluación de riesgos",
    dds_reference: "Referencia DDS",
    not_submitted: "No presentado",
    flagged_criteria: "Criterios que dieron lugar a un resultado no insignificante",
    rationale: "Justificación",
    document_stamp: "Versión / hash",
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
    retention_notice: "Bewaard conform art. 12 EUDR — 5 jaar na generatie van de risicobeoordeling",
    dds_reference: "DDS-referentie",
    not_submitted: "Niet ingediend",
    flagged_criteria: "Criteria die hebben geleid tot een niet-verwaarloosbaar resultaat",
    rationale: "Motivering",
    document_stamp: "Versie / hash",
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
    retention_notice: "Conservado nos termos do art. 12.º EUDR — 5 anos a contar da geração da avaliação de risco",
    dds_reference: "Referência DDS",
    not_submitted: "Não apresentado",
    flagged_criteria: "Critérios que originaram um resultado não insignificante",
    rationale: "Justificação",
    document_stamp: "Versão / hash",
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
    retention_notice: "Conservato ai sensi dell'art. 12 EUDR — 5 anni dalla generazione della valutazione del rischio",
    dds_reference: "Riferimento DDS",
    not_submitted: "Non presentato",
    flagged_criteria: "Criteri che hanno determinato un risultato non trascurabile",
    rationale: "Motivazione",
    document_stamp: "Versione / hash",
    none: "Nessuno",
    parcel: "Particella geolocalizzata",
    no_parcel: "Nessuna particella",
    risk_assessment_unavailable: "Valutazione del rischio non disponibile — la spedizione è stata creata prima dell'introduzione di questa funzionalità",
  },
}

function t(key: string, locale: string): string {
  return LABELS[locale]?.[key] ?? LABELS["fr"]?.[key] ?? key
}

const NUM_FMT = new Intl.NumberFormat("fr-FR")
const SUPPORTED_TYPST_LOCALES = ["fr", "en", "de", "es", "nl", "pt", "it"] as const

type TypstLocale = typeof SUPPORTED_TYPST_LOCALES[number]

type RiskAssessmentForPdf = {
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
  criteria?: Array<{
    id: string
    article10Criterion: string
    label: string
    evaluation: string
    source: string
    rationale: string
    mitigationTrigger: string
    flagged: boolean
  }>
  verdictRationale?: string
  retentionAnchor?: { date: number; source: "risk_assessment_generation" }
  documentVersion?: string
  documentHash?: string
}

type TypstAuditTrailData = {
  locale: TypstLocale
  logoPath: string
  title: string
  shipmentReference: string
  generatedOn: string
  labels: Record<string, string>
  brand: Record<string, string>
  shipment: {
    company: string
    eori: string
    commodity: string
    hsCode: string
    countryOfProduction: string
    supplier: string
    quantity: string
    plotReference: string
    ddsReference: string
  }
  criteria: Array<{
    id: string
    article10Criterion: string
    label: string
    evaluation: string
    source: string
    rationale: string
    mitigationTrigger: string
    flagged: boolean
  }>
  verdict: "negligible" | "non_negligible" | "not_evaluated"
  verdictLabel: string
  verdictRationale: string
  flaggedCriteria: Array<{ id: string; label: string; mitigationTrigger: string }>
  mitigationActions: Array<{ action: string; date: string }>
  retentionNotice: string
  retentionAnchor: string
  documentVersion: string
  documentHash: string
}

const EXTRA_TYPST_LABELS: Record<TypstLocale, Record<string, string>> = {
  fr: { article10: "Article 10(2)", mitigation_trigger: "Déclencheur de mitigation", page: "Page" },
  en: { article10: "Article 10(2)", mitigation_trigger: "Mitigation trigger", page: "Page" },
  de: { article10: "Artikel 10(2)", mitigation_trigger: "Auslöser für Abhilfemaßnahmen", page: "Seite" },
  es: { article10: "Artículo 10(2)", mitigation_trigger: "Activador de mitigación", page: "Página" },
  nl: { article10: "Artikel 10(2)", mitigation_trigger: "Trigger voor mitigerende maatregelen", page: "Pagina" },
  pt: { article10: "Artigo 10(2)", mitigation_trigger: "Acionador de mitigação", page: "Página" },
  it: { article10: "Articolo 10(2)", mitigation_trigger: "Attivatore di mitigazione", page: "Pagina" },
}

const DATE_LOCALES: Record<string, string> = {
  fr: "fr-FR",
  en: "en-GB",
  de: "de-DE",
  es: "es-ES",
  nl: "nl-NL",
  pt: "pt-PT",
  it: "it-IT",
}

function normalizeTypstLocale(locale: string): TypstLocale {
  return SUPPORTED_TYPST_LOCALES.includes(locale as TypstLocale) ? locale as TypstLocale : "fr"
}

function typstDateFmt(locale: string): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(DATE_LOCALES[locale] ?? DATE_LOCALES.fr, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function typstTemplatePath(): string {
  return process.env.AUDIT_TRAIL_TYPST_TEMPLATE_PATH
    ? resolve(process.env.AUDIT_TRAIL_TYPST_TEMPLATE_PATH)
    : resolve(process.cwd(), "convex/templates/audit-trail.typ")
}

function typstLogoPath(): string {
  return process.env.AUDIT_TRAIL_LOGO_PATH
    ? resolve(process.env.AUDIT_TRAIL_LOGO_PATH)
    : resolve(process.cwd(), "convex/templates/audit-trail-logo.png")
}

function typstBrand(): Record<string, string> {
  return {
    ink: process.env.AUDIT_TRAIL_BRAND_INK ?? "#18201c",
    muted: process.env.AUDIT_TRAIL_BRAND_MUTED ?? "#647067",
    line: process.env.AUDIT_TRAIL_BRAND_LINE ?? "#dce4dc",
    soft: process.env.AUDIT_TRAIL_BRAND_SOFT ?? "#f4f7f1",
    accent: process.env.AUDIT_TRAIL_BRAND_ACCENT ?? "#2f6f4e",
    danger: process.env.AUDIT_TRAIL_BRAND_DANGER ?? "#b42318",
    fontMain: process.env.AUDIT_TRAIL_BRAND_FONT_MAIN ?? "Libertinus Sans",
    fontMono: process.env.AUDIT_TRAIL_BRAND_FONT_MONO ?? "DejaVu Sans Mono",
  }
}

function legacyCriteriaRows(
  riskAssessment: RiskAssessmentForPdf,
  locale: string,
): TypstAuditTrailData["criteria"] {
  return [
    {
      id: "country_risk",
      article10Criterion: "10(2)(a)",
      label: t("country_risk", locale),
      evaluation: riskAssessment.countryRisk.classification,
      source: riskAssessment.countryRisk.source || "Banque mondiale — AG.LND.FRST.ZS (2023)",
      rationale: riskAssessment.countryRisk.classification === "high"
        ? "Country/area risk is elevated and requires further verification."
        : "Country/area risk does not independently indicate non-negligible risk.",
      mitigationTrigger: "If country risk is elevated, obtain additional origin evidence before DDS.",
      flagged: riskAssessment.countryRisk.classification === "high",
    },
    {
      id: "deforestation_risk",
      article10Criterion: "10(2)(b)",
      label: t("deforestation_risk", locale),
      evaluation: riskAssessment.deforestationRisk.result,
      source: riskAssessment.deforestationRisk.source || "Scan satellitaire — Global Forest Watch",
      rationale: riskAssessment.deforestationRisk.result === "clear"
        ? "Geolocation scan returned no deforestation alert."
        : "Deforestation risk is not cleared by the available scan data.",
      mitigationTrigger: "If scan data is flagged or unavailable, obtain geolocation, production-date evidence, and independent verification.",
      flagged: riskAssessment.deforestationRisk.result !== "clear",
    },
    {
      id: "supply_chain_complexity",
      article10Criterion: "10(2)(c)-(d)",
      label: t("supply_chain_complexity", locale),
      evaluation: riskAssessment.supplyChainComplexity.mixingRisk || riskAssessment.supplyChainComplexity.intermediaryCount > 2 ? "flagged" : "clear",
      source: "Declared supply-chain data",
      rationale: `${riskAssessment.supplyChainComplexity.intermediaryCount} intermediary(ies); mixing risk ${riskAssessment.supplyChainComplexity.mixingRisk ? "identified or not excluded" : "not identified"}.`,
      mitigationTrigger: "If intermediaries are unknown/elevated or mixing is possible, collect full actor, lot, segregation, and traceability evidence.",
      flagged: riskAssessment.supplyChainComplexity.mixingRisk || riskAssessment.supplyChainComplexity.intermediaryCount > 2,
    },
    {
      id: "documentation_risk",
      article10Criterion: "10(2)(e)",
      label: t("documentation_risk", locale),
      evaluation: riskAssessment.documentationRisk.complete ? "complete" : "incomplete",
      source: "Antaios",
      rationale: riskAssessment.documentationRisk.complete ? "Documents are complete." : riskAssessment.documentationRisk.redFlags.join("; "),
      mitigationTrigger: "If documents are incomplete or irregular, collect corrected evidence and verify before placing on the market.",
      flagged: !riskAssessment.documentationRisk.complete,
    },
    {
      id: "plot_supplier_risk",
      article10Criterion: "10(2)(f)",
      label: t("indigenous_rights", locale),
      evaluation: riskAssessment.indigenousRights.flagged ? "flagged" : "clear",
      source: "Declared supplier / plot data",
      rationale: riskAssessment.indigenousRights.note ?? "No land-rights alert declared.",
      mitigationTrigger: "If land or social evidence is missing, obtain permits, FPIC/consultation evidence, social verification, or relevant certification.",
      flagged: riskAssessment.indigenousRights.flagged,
    },
  ]
}

function buildTypstAuditTrailData(input: {
  locale: string
  ref: string
  shipment: { _creationTime: number; tracesRef?: string; extractedData?: unknown }
  org: { name?: string; eoriNumber?: string } | null
  riskAssessment: RiskAssessmentForPdf | undefined
}): TypstAuditTrailData {
  const locale = normalizeTypstLocale(input.locale)
  const extractedData = (input.shipment.extractedData ?? {}) as Record<string, unknown>
  const fmtDate = typstDateFmt(locale).format(new Date(input.shipment._creationTime))
  const fmtTs = (ts: number | undefined) => ts && ts > 0 ? typstDateFmt(locale).format(new Date(ts)) : "-"
  const labels = { ...LABELS.fr, ...LABELS[locale], ...EXTRA_TYPST_LABELS[locale] }
  const riskAssessment = input.riskAssessment
  const criteria = riskAssessment
    ? riskAssessment.criteria && riskAssessment.criteria.length > 0
      ? riskAssessment.criteria
      : legacyCriteriaRows(riskAssessment, locale)
    : []
  const flaggedCriteria = riskAssessment
    ? criteria
      .filter((criterion) => riskAssessment.flaggedCriteria.includes(criterion.id) || criterion.flagged)
      .map((criterion) => ({
        id: criterion.id,
        label: criterion.label,
        mitigationTrigger: criterion.mitigationTrigger,
      }))
    : []

  return {
    locale,
    logoPath: typstLogoPath(),
    title: t("title", locale),
    shipmentReference: input.ref,
    generatedOn: fmtDate,
    labels,
    brand: typstBrand(),
    shipment: {
      company: (extractedData.operatorName as string) ?? input.org?.name ?? "-",
      eori: input.org?.eoriNumber ?? "-",
      commodity: (extractedData.commodityName as string) ?? "-",
      hsCode: (extractedData.hsCode as string) ?? "-",
      countryOfProduction: (extractedData.countryOfProduction as string) ?? "-",
      supplier: (extractedData.supplierName as string) ?? "-",
      quantity: `${NUM_FMT.format((extractedData.quantity as number) ?? 0)} ${(extractedData.quantityUnit as string) ?? ""}`.trim(),
      plotReference: (extractedData.plotReference as string) ?? (extractedData.geoJson ? t("parcel", locale) : t("no_parcel", locale)),
      ddsReference: input.shipment.tracesRef ?? t("not_submitted", locale),
    },
    criteria: criteria.map((criterion) => ({
      ...criterion,
      evaluation: t(criterion.evaluation, locale),
    })),
    verdict: riskAssessment?.verdict ?? "not_evaluated",
    verdictLabel: riskAssessment
      ? riskAssessment.verdict === "negligible" ? t("negligible", locale) : t("non_negligible", locale)
      : t("not_evaluated", locale),
    verdictRationale: riskAssessment?.verdictRationale ?? t("risk_assessment_unavailable", locale),
    flaggedCriteria,
    mitigationActions: (riskAssessment?.mitigationActions ?? []).map((action) => ({
      action: action.action,
      date: fmtTs(action.date),
    })),
    retentionNotice: t("retention_notice", locale),
    retentionAnchor: fmtTs(riskAssessment?.retentionAnchor?.date ?? riskAssessment?.generatedAt),
    documentVersion: riskAssessment?.documentVersion ?? "-",
    documentHash: riskAssessment?.documentHash ?? "-",
  }
}

async function renderTypstAuditTrailPdf(data: TypstAuditTrailData): Promise<Uint8Array> {
  const templatePath = typstTemplatePath()
  const logoPath = typstLogoPath()
  const typstBin = process.env.AUDIT_TRAIL_TYPST_BIN ?? "typst"
  const tmpDir = await mkdtemp(join(tmpdir(), "antaios-audit-trail-"))

  try {
    const dataPath = join(tmpDir, "audit-trail.json")
    const outputPath = join(tmpDir, "audit-trail.pdf")
    await writeFile(dataPath, JSON.stringify({ ...data, logoPath }, null, 2), "utf8")
    await execFileAsync(typstBin, [
      "compile",
      "--root", "/",
      "--input", `data=${dataPath}`,
      "--input", `logo=${logoPath}`,
      templatePath,
      outputPath,
    ], { timeout: 30_000 })
    return new Uint8Array(await readFile(outputPath))
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      throw new Error("Typst CLI not found. Install the typst binary in the deployment image or set AUDIT_TRAIL_TYPST_BIN.")
    }
    throw error
  } finally {
    await rm(tmpDir, { recursive: true, force: true })
  }
}

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

    const riskAssessment = shipment.riskAssessment as RiskAssessmentForPdf | undefined
    const org = shipment.orgId
      ? await ctx.runQuery(internal.orgs.getOrgById, { orgId: shipment.orgId as Id<"organizations"> })
      : null

    const pdfBytes = await renderTypstAuditTrailPdf(buildTypstAuditTrailData({
      locale,
      ref,
      shipment,
      org,
      riskAssessment,
    }))
    const base64 = Buffer.from(pdfBytes).toString("base64")
    const url = `data:application/pdf;base64,${base64}`
    return { url, filename }
  },
})
