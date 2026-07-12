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

const FIELD_LABELS: Record<string, { fr: string; en: string }> = {
  operatorName:     { fr: "Nom de l'opérateur",    en: "Operator name" },
  operatorAddress:  { fr: "Adresse de l'opérateur", en: "Operator address" },
  operatorEmail:    { fr: "Email de l'opérateur",   en: "Operator email" },
  operatorPhone:    { fr: "Téléphone de l'opérateur", en: "Operator phone" },
  eoriNumber:       { fr: "Numéro EORI",            en: "EORI number" },
  supplierName:     { fr: "Nom du fournisseur",     en: "Supplier name" },
  supplierAddress:  { fr: "Adresse du fournisseur", en: "Supplier address" },
  supplierEmail:    { fr: "Email du fournisseur",   en: "Supplier email" },
  commodityName:    { fr: "Dénomination",           en: "Commodity" },
  scientificName:   { fr: "Nom scientifique",       en: "Scientific name" },
  hsCode:           { fr: "Code SH",                en: "HS code" },
  quantity:         { fr: "Quantité",               en: "Quantity" },
  quantityUnit:     { fr: "Unité",                  en: "Unit" },
  shipmentRef:      { fr: "Référence d'envoi",      en: "Shipment reference" },
  countryOfExport:  { fr: "Pays d'exportation",     en: "Country of export" },
  countryOfProduction: { fr: "Pays de production",  en: "Country of production" },
  productionDate:   { fr: "Date de production",     en: "Production date" },
  region:           { fr: "Région",                 en: "Region" },
  portOfLoading:    { fr: "Port de chargement",     en: "Port of loading" },
  portOfEntry:      { fr: "Port d'entrée",          en: "Port of entry" },
  farmName:         { fr: "Nom de l'exploitation",  en: "Farm name" },
  villageName:      { fr: "Nom du village",         en: "Village name" },
  certifications:   { fr: "Certifications",         en: "Certifications" },
  certificationType: { fr: "Type de certification", en: "Certification type" },
  certificationBody: { fr: "Organisme certificateur", en: "Certification body" },
  geoJson:          { fr: "Données géospatiales",   en: "Geospatial data" },
}

function fieldLabel(field: string): { fr: string; en: string } {
  return FIELD_LABELS[field] ?? { fr: field, en: field }
}

const COUNTRY_FIELDS = ["countryOfExport", "countryOfProduction"]
const DATE_FIELDS = ["productionDate"]

function buildQuestion(question: {
  id: string
  field: string
  type: string
  label: { fr: string; en: string }
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
        label: { fr: `Veuillez fournir ${fieldLabel(field).fr}`, en: `Please provide ${fieldLabel(field).en}` },
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
            label: { fr: "Veuillez fournir les coordonnées géographiques ou télécharger un fichier", en: "Please provide geographic coordinates or upload a file" },
            geoType: null,
          })
        } else {
          questions.push({
            id: `missing-${field}`,
            field,
            type: "missing",
            label: { fr: `Veuillez fournir ${fieldLabel(field).fr}`, en: `Please provide ${fieldLabel(field).en}` },
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
          label: { fr: `Quantité divergente: ${nonNull.join(" vs ")}`, en: `Conflicting quantity: ${nonNull.join(" vs ")}` },
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
        label: { fr: `${fieldLabel(field).fr}: ${uniqueValues.join(" vs ")}`, en: `${fieldLabel(field).en}: ${uniqueValues.join(" vs ")}` },
        options: uniqueValues,
        geoType: null,
      })
    }

    if (questions.length > 0) {
      try {
        const conflictFields = questions.map((q) => `${q.field}: ${q.label.fr} / ${q.label.en}`).join("\n")
        const llmResult = await callLiteLLM("text-primary", [
          { role: "user", content: `Generate human-readable labels in French AND English for these missing/conflicting EUDR compliance fields:\n${conflictFields}\n\nReturn JSON array: [{ "id": "conflict-fieldName", "label": { "fr": "French label", "en": "English label" } }]\nReturn ONLY valid JSON.` },
        ])
        const content = llmResult.choices[0]?.message?.content
        if (content) {
          const labels = parseLlmJson<Array<{ id: string; label: { fr: string; en: string } }>>(content)
          for (const label of labels) {
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
