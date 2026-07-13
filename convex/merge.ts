import { internalAction } from "@cvx/_generated/server"
import { v } from "convex/values"
import { internal } from "@cvx/_generated/api"
import { callLiteLLM, parseLlmJson } from "@cvx/lib/litellm"

const COUNTRY_NORMALIZE: Record<string, string> = {
  "côte d'ivoire": "CI", "ivory coast": "CI", "cote d'ivoire": "CI",
  "france": "FR", "germany": "DE", "deutschland": "DE",
  "spain": "ES", "españa": "ES", "espagne": "ES",
  "italy": "IT", "italia": "IT",
  "netherlands": "NL", "nederland": "NL", "holland": "NL",
  "belgium": "BE", "belgië": "BE", "belgique": "BE",
  "portugal": "PT",
  "united kingdom": "GB", "uk": "GB", "great britain": "GB",
  "united states": "US", "usa": "US", "united states of america": "US",
  "ghana": "GH", "nigeria": "NG", "cameroon": "CM", "cameroun": "CM",
  "indonesia": "ID", "malaysia": "MY", "brazil": "BR", "brasil": "BR",
  "colombia": "CO", "peru": "PE", "ecuador": "EC",
}

function normalizeCountry(val: unknown): string | null {
  if (typeof val !== "string") return null
  const trimmed = val.trim().toLowerCase()
  return COUNTRY_NORMALIZE[trimmed] ?? (trimmed.length === 2 ? trimmed.toUpperCase() : null)
}

function normalizeDate(val: unknown): string | null {
  if (typeof val !== "string") return null
  const trimmed = val.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  const dm = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (dm) return `${dm[3]}-${dm[2]}-${dm[1]}`
  const dd = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (dd) return `${dd[3]}-${dd[2]}-${dd[1]}`
  if (/^\d{4}\/\d{4}$/.test(trimmed)) return trimmed
  return trimmed
}

function normalizeString(val: unknown): string | null {
  if (typeof val !== "string") return null
  return val.trim().normalize("NFC")
}

const ALL_FIELDS = [
  "operatorName", "operatorAddress", "operatorEmail", "operatorPhone", "eoriNumber",
  "supplierName", "supplierAddress", "supplierEmail",
  "commodityName", "scientificName", "hsCode", "quantity", "quantityUnit", "shipmentRef",
  "countryOfExport", "countryOfProduction", "productionDate",
  "region",
  "portOfLoading", "portOfEntry",
  "farmName", "villageName", "certifications",
  "certificationType", "certificationBody",
  "geoJson",
]

const FIELD_LABELS: Record<string, Record<string, string>> = {
  operatorName:     { de: "Name des Betreibers", en: "Operator name", es: "Nombre del operador", fr: "Nom de l'opérateur", it: "Nome dell'operatore", nl: "Naam van de operator", pt: "Nome do operador" },
  operatorAddress:  { de: "Adresse des Betreibers", en: "Operator address", es: "Dirección del operador", fr: "Adresse de l'opérateur", it: "Indirizzo dell'operatore", nl: "Adres van de operator", pt: "Endereço do operador" },
  operatorEmail:    { de: "E-Mail des Betreibers", en: "Operator email", es: "Correo electrónico del operador", fr: "Email de l'opérateur", it: "Email dell'operatore", nl: "E-mail van de operator", pt: "E-mail do operador" },
  operatorPhone:    { de: "Telefon des Betreibers", en: "Operator phone", es: "Teléfono del operador", fr: "Téléphone de l'opérateur", it: "Telefono dell'operatore", nl: "Telefoon van de operator", pt: "Telefone do operador" },
  eoriNumber:       { de: "EORI-Nummer", en: "EORI number", es: "Número EORI", fr: "Numéro EORI", it: "Numero EORI", nl: "EORI-nummer", pt: "Número EORI" },
  supplierName:     { de: "Name des Lieferanten", en: "Supplier name", es: "Nombre del proveedor", fr: "Nom du fournisseur", it: "Nome del fornitore", nl: "Naam van de leverancier", pt: "Nome do fornecedor" },
  supplierAddress:  { de: "Adresse des Lieferanten", en: "Supplier address", es: "Dirección del proveedor", fr: "Adresse du fournisseur", it: "Indirizzo del fornitore", nl: "Adres van de leverancier", pt: "Endereço do fornecedor" },
  supplierEmail:    { de: "E-Mail des Lieferanten", en: "Supplier email", es: "Correo electrónico del proveedor", fr: "Email du fournisseur", it: "Email del fornitore", nl: "E-mail van de leverancier", pt: "E-mail do fornecedor" },
  commodityName:    { de: "Ware", en: "Commodity", es: "Producto básico", fr: "Dénomination", it: "Materia prima", nl: "Grondstof", pt: "Mercadoria" },
  scientificName:   { de: "Wissenschaftlicher Name", en: "Scientific name", es: "Nombre científico", fr: "Nom scientifique", it: "Nome scientifico", nl: "Wetenschappelijke naam", pt: "Nome científico" },
  hsCode:           { de: "HS-Code", en: "HS code", es: "Código SA", fr: "Code SH", it: "Codice SA", nl: "GS-code", pt: "Código SH" },
  quantity:         { de: "Menge", en: "Quantity", es: "Cantidad", fr: "Quantité", it: "Quantità", nl: "Hoeveelheid", pt: "Quantidade" },
  quantityUnit:     { de: "Einheit", en: "Unit", es: "Unidad", fr: "Unité", it: "Unità", nl: "Eenheid", pt: "Unidade" },
  shipmentRef:      { de: "Sendungsreferenz", en: "Shipment reference", es: "Referencia del envío", fr: "Référence d'envoi", it: "Riferimento spedizione", nl: "Zendingsreferentie", pt: "Referência da remessa" },
  countryOfExport:  { de: "Ausfuhrland", en: "Country of export", es: "País de exportación", fr: "Pays d'exportation", it: "Paese di esportazione", nl: "Land van uitvoer", pt: "País de exportação" },
  countryOfProduction: { de: "Erzeugerland", en: "Country of production", es: "País de producción", fr: "Pays de production", it: "Paese di produzione", nl: "Land van productie", pt: "País de produção" },
  productionDate:   { de: "Produktionsdatum", en: "Production date", es: "Fecha de producción", fr: "Date de production", it: "Data di produzione", nl: "Productiedatum", pt: "Data de produção" },
  region:           { de: "Region", en: "Region", es: "Región", fr: "Région", it: "Regione", nl: "Regio", pt: "Região" },
  portOfLoading:    { de: "Verladehafen", en: "Port of loading", es: "Puerto de carga", fr: "Port de chargement", it: "Porto di carico", nl: "Laadhaven", pt: "Porto de carregamento" },
  portOfEntry:      { de: "Eingangshafen", en: "Port of entry", es: "Puerto de entrada", fr: "Port d'entrée", it: "Porto di entrata", nl: "Haven van binnenkomst", pt: "Porto de entrada" },
  farmName:         { de: "Name des Betriebs", en: "Farm name", es: "Nombre de la finca", fr: "Nom de l'exploitation", it: "Nome dell'azienda agricola", nl: "Naam van het bedrijf", pt: "Nome da propriedade" },
  villageName:      { de: "Name des Dorfes", en: "Village name", es: "Nombre de la aldea", fr: "Nom du village", it: "Nome del villaggio", nl: "Naam van het dorp", pt: "Nome da vila" },
  certifications:   { de: "Zertifizierungen", en: "Certifications", es: "Certificaciones", fr: "Certifications", it: "Certificazioni", nl: "Certificeringen", pt: "Certificações" },
  certificationType: { de: "Zertifizierungsart", en: "Certification type", es: "Tipo de certificación", fr: "Type de certification", it: "Tipo di certificazione", nl: "Type certificering", pt: "Tipo de certificação" },
  certificationBody: { de: "Zertifizierungsstelle", en: "Certification body", es: "Organismo certificador", fr: "Organisme certificateur", it: "Ente certificatore", nl: "Certificerende instantie", pt: "Organismo certificador" },
  geoJson:          { de: "Geodaten", en: "Geospatial data", es: "Datos geoespaciales", fr: "Données géospatiales", it: "Dati geospaziali", nl: "Geospatiale gegevens", pt: "Dados geoespaciais" },
}

function fieldLabel(field: string): Record<string, string> {
  return FIELD_LABELS[field] ?? Object.fromEntries(["en", "fr", "es", "de", "nl", "pt", "it"].map(l => [l, field]))
}

const COUNTRY_FIELDS = ["countryOfExport", "countryOfProduction"]
const DATE_FIELDS = ["productionDate"]

function buildQuestion(question: {
  id: string
  field: string
  type: string
  label: Record<string, string>
  options?: string[]
  geoType?: "file" | "coordinates" | null
}) {
  return {
    id: question.id,
    field: question.field,
    type: question.type,
    label: question.label,
    ...(question.options ? { options: question.options } : {}),
    geoType: question.geoType ?? null,
  }
}

function normalizeField(field: string, val: unknown): string | null {
  if (COUNTRY_FIELDS.includes(field)) return normalizeCountry(val)
  if (DATE_FIELDS.includes(field)) return normalizeDate(val)
  return normalizeString(val)
}

export const mergeAndResolve = internalAction({
  args: {
    shipmentId: v.id("shipments"),
  },
  handler: async (ctx, args) => {
    const shipment = await ctx.runQuery(internal.shipments.getShipmentById, {
      shipmentId: args.shipmentId,
    })
    if (!shipment) throw new Error("Shipment not found")
    if (shipment.status !== "resolving") return

    const docs = await ctx.runQuery(internal.documents.getDocumentsByShipment, {
      shipmentId: args.shipmentId,
    })
    const extractedDocs = docs
      .filter((d: any) => d.extractionStatus === "done" && d.extractedJson)
      .map((d: any) => d.extractedJson)

    if (extractedDocs.length === 0) {
      const merged = {} as Record<string, unknown>
      const questions = ALL_FIELDS.map((field) => ({
        id: `missing-${field}`,
        field,
        type: "missing" as const,
        label: (() => { const l = fieldLabel(field); return { fr: `Veuillez fournir ${l.fr}`, en: `Please provide ${l.en}`, es: `Proporcione ${l.es}`, de: `${l.de} angeben`, nl: `Geef ${l.nl} op`, pt: `Forneça ${l.pt}`, it: `Fornisci ${l.it}` } })(),
        geoType: null,
      }))

      await ctx.runMutation(internal.shipments.storeMergeResult, {
        shipmentId: args.shipmentId,
        extractedData: merged,
        questions,
      })
      return
    }

    const merged: Record<string, unknown> = {}
    const questions: any[] = []

    for (const field of ALL_FIELDS) {
      const values = extractedDocs.map((d: any) => d[field])
      const nonNull = values.filter((v: any) => v !== null && v !== undefined)

      if (nonNull.length === 0) {
        merged[field] = null
        if (field === "scientificName") {
          continue
        }
        if (field === "geoJson") {
          questions.push({
            id: `missing-${field}`,
            field,
            type: "geo_missing",
            label: { fr: "Veuillez fournir les coordonnées géographiques ou télécharger un fichier", en: "Please provide geographic coordinates or upload a file", es: "Proporcione las coordenadas geográficas o suba un archivo", de: "Bitte geben Sie die geografischen Koordinaten an oder laden Sie eine Datei hoch", nl: "Geef de geografische coördinaten of upload een bestand", pt: "Forneça as coordenadas geográficas ou faça upload de um arquivo", it: "Fornisci le coordinate geografiche o carica un file" },
            geoType: null,
          })
        } else {
          questions.push({
            id: `missing-${field}`,
            field,
            type: "missing",
            label: (() => { const l = fieldLabel(field); return { fr: `Veuillez fournir ${l.fr}`, en: `Please provide ${l.en}`, es: `Proporcione ${l.es}`, de: `${l.de} angeben`, nl: `Geef ${l.nl} op`, pt: `Forneça ${l.pt}`, it: `Fornisci ${l.it}` } })(),
            geoType: null,
          })
        }
        continue
      }

      if (nonNull.length === 1) {
        merged[field] = nonNull[0]
        continue
      }

      const normalized = nonNull.map((v: any) => normalizeField(field, v))
      const firstNorm = normalized[0]
      const allSame = normalized.every((n: any) => n === firstNorm)

      if (allSame) {
        merged[field] = nonNull[0]
        continue
      }

      if (field === "quantity") {
        merged[field] = null
        questions.push({
          id: `conflict-${field}`,
          field,
          type: "conflict",
          label: { fr: `Quantité divergente: ${nonNull.join(" vs ")}`, en: `Conflicting quantity: ${nonNull.join(" vs ")}`, es: `Cantidad conflictiva: ${nonNull.join(" vs ")}`, de: `Mengenkonflikt: ${nonNull.join(" vs ")}`, nl: `Conflicterende hoeveelheid: ${nonNull.join(" vs ")}`, pt: `Quantidade conflitante: ${nonNull.join(" vs ")}`, it: `Quantità in conflitto: ${nonNull.join(" vs ")}` },
          options: nonNull.map(String),
          geoType: null,
        })
        continue
      }

      if (field === "certifications") {
        const certMap = new Map<string, string | undefined>()
        for (const arr of nonNull) {
          if (Array.isArray(arr)) {
            for (const c of arr) {
              if (typeof c === "string") {
                if (!certMap.has(c)) certMap.set(c, undefined)
              } else if (typeof c === "object" && c !== null) {
                const entry = c as { type: string; body?: string }
                if (entry.type && !certMap.has(entry.type)) {
                  certMap.set(entry.type, entry.body)
                }
              }
            }
          }
        }
        merged[field] = Array.from(certMap.entries()).map(([type, body]) => ({ type, ...(body ? { body } : {}) }))
        continue
      }

      merged[field] = null
      const uniqueValues = [...new Set(nonNull.map((v: any) => String(v)))]
      questions.push({
        id: `conflict-${field}`,
        field,
        type: "conflict",
        label: (() => { const l = fieldLabel(field); return { fr: `${l.fr}: ${uniqueValues.join(" vs ")}`, en: `${l.en}: ${uniqueValues.join(" vs ")}`, es: `${l.es}: ${uniqueValues.join(" vs ")}`, de: `${l.de}: ${uniqueValues.join(" vs ")}`, nl: `${l.nl}: ${uniqueValues.join(" vs ")}`, pt: `${l.pt}: ${uniqueValues.join(" vs ")}`, it: `${l.it}: ${uniqueValues.join(" vs ")}` } })(),
        options: uniqueValues,
        geoType: null,
      })
    }

    if (questions.length > 0) {
      try {
        const conflictFields = questions.map((q) => `${q.field}: ${["en", "fr", "es", "de", "nl", "pt", "it"].map(l => `${l}=${q.label[l]}`).join(", ")}`).join("\n")
        const llmResult = await callLiteLLM("text-primary", [
          { role: "user", content: `Generate human-readable labels in English, French, Spanish, German, Dutch, Portuguese, and Italian for these missing/conflicting EUDR compliance fields:

${conflictFields}

Return a JSON array. Each object must have "id" (string) and "label" (object with "en", "fr", "es", "de", "nl", "pt", "it" string properties).

Example:
[
  { "id": "conflict-supplierEmail", "label": { "en": "Missing supplier email", "fr": "Email du fournisseur manquant", "es": "Correo electrónico del proveedor faltante", "de": "Fehlende E-Mail des Lieferanten", "nl": "Ontbrekende e-mail van leverancier", "pt": "E-mail do fornecedor ausente", "it": "Email del fornitore mancante" } }
]

Return ONLY valid JSON.` },
        ])
        const content = llmResult.choices[0]?.message?.content
        if (content) {
          const labels = parseLlmJson<Array<{ id: string; label: Record<string, string> }>>(content)
          for (const label of labels) {
            if (!label.id || !label.label || typeof label.label !== "object") continue
            const q = questions.find((q) => q.id === label.id)
            if (q && label.label) q.label = label.label
          }
        }
      } catch {
        // LLM labels are optional — keep default labels
      }
    }

    await ctx.runMutation(internal.shipments.storeMergeResult, {
      shipmentId: args.shipmentId,
      extractedData: merged,
      questions: questions.map(buildQuestion),
    })
  },
})
