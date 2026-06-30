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
  "supplierName", "supplierAddress",
  "commodityName", "scientificName", "hsCode", "quantity", "quantityUnit", "shipmentRef",
  "countryOfExport", "countryOfProduction", "productionDate",
  "portOfLoading", "portOfEntry",
  "farmName", "villageName", "certifications",
  "geoJson",
]

const COUNTRY_FIELDS = ["countryOfExport", "countryOfProduction"]
const DATE_FIELDS = ["productionDate"]

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
        label: `Veuillez fournir ${field}`,
        options: null,
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
        if (field === "geoJson") {
          questions.push({
            id: `missing-${field}`,
            field,
            type: "geo_missing",
            label: "Veuillez fournir les coordonnées géographiques ou télécharger un fichier",
            options: null,
            geoType: null,
          })
        } else {
          questions.push({
            id: `missing-${field}`,
            field,
            type: "missing",
            label: `Veuillez fournir ${field}`,
            options: null,
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
          label: `Quantité divergente: ${nonNull.join(" vs ")}`,
          options: nonNull.map(String),
          geoType: null,
        })
        continue
      }

      if (field === "certifications") {
        const allCerts = new Set<string>()
        for (const arr of nonNull) {
          if (Array.isArray(arr)) arr.forEach((c: string) => allCerts.add(c))
        }
        merged[field] = Array.from(allCerts)
        continue
      }

      merged[field] = null
      const uniqueValues = [...new Set(nonNull.map((v: any) => String(v)))]
      questions.push({
        id: `conflict-${field}`,
        field,
        type: "conflict",
        label: `${field}: ${uniqueValues.join(" vs ")}`,
        options: uniqueValues,
        geoType: null,
      })
    }

    if (questions.length > 0) {
      try {
        const conflictFields = questions.map((q) => `${q.field}: ${q.label}`).join("\n")
        const llmResult = await callLiteLLM("text-primary", [
          { role: "user", content: `Generate human-readable French labels for these missing/conflicting EUDR compliance fields:\n${conflictFields}\n\nReturn JSON array: [{ "id": "conflict-fieldName", "label": "French label describing what's needed" }]\nReturn ONLY valid JSON.` },
        ])
        const content = llmResult.choices[0]?.message?.content
        if (content) {
          const labels = parseLlmJson<Array<{ id: string; label: string }>>(content)
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
      questions,
    })
  },
})
