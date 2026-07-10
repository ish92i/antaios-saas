import { v } from "convex/values"

export const extractedDataValidator = v.object({
  operatorName: v.optional(v.string()),
  operatorAddress: v.optional(v.string()),
  operatorEmail: v.optional(v.string()),
  operatorPhone: v.optional(v.string()),
  eoriNumber: v.optional(v.string()),
  supplierName: v.optional(v.string()),
  supplierAddress: v.optional(v.string()),
  commodityName: v.optional(v.string()),
  scientificName: v.optional(v.string()),
  hsCode: v.optional(v.string()),
  quantity: v.optional(v.number()),
  quantityUnit: v.optional(v.string()),
  shipmentRef: v.optional(v.string()),
  countryOfExport: v.optional(v.string()),
  countryOfProduction: v.optional(v.string()),
  productionDate: v.optional(v.string()),
  portOfLoading: v.optional(v.string()),
  portOfEntry: v.optional(v.string()),
  geoJson: v.optional(v.any()),
  farmName: v.optional(v.string()),
  villageName: v.optional(v.string()),
  mitigationMeasures: v.optional(v.string()),
  declarationText: v.optional(v.string()),
  certifications: v.optional(v.array(v.object({
    type: v.string(),
    body: v.optional(v.string()),
  }))),
  missingFields: v.optional(v.array(v.string())),
})

export type ExtractedData = {
  operatorName?: string
  operatorAddress?: string
  operatorEmail?: string
  operatorPhone?: string
  eoriNumber?: string
  supplierName?: string
  supplierAddress?: string
  commodityName?: string
  scientificName?: string
  hsCode?: string
  quantity?: number
  quantityUnit?: string
  shipmentRef?: string
  countryOfExport?: string
  countryOfProduction?: string
  productionDate?: string
  portOfLoading?: string
  portOfEntry?: string
  geoJson?: unknown
  farmName?: string
  villageName?: string
  mitigationMeasures?: string
  declarationText?: string
  certifications?: Array<{ type: string; body?: string }>
  missingFields?: string[]
}

export function validateExtractedData(raw: unknown): raw is ExtractedData {
  if (raw === null || typeof raw !== "object") return false
  const obj = raw as Record<string, unknown>

  const stringFields = ["operatorName","operatorAddress","operatorEmail","operatorPhone","eoriNumber","supplierName","supplierAddress","commodityName","scientificName","hsCode","quantityUnit","shipmentRef","countryOfExport","countryOfProduction","productionDate","portOfLoading","portOfEntry","farmName","villageName","mitigationMeasures","declarationText"]
  for (const field of stringFields) {
    if (obj[field] !== undefined && obj[field] !== null && typeof obj[field] !== "string") return false
  }

  if (obj.quantity !== undefined && obj.quantity !== null && typeof obj.quantity !== "number") return false
  if (obj.quantity !== undefined && obj.quantity !== null && obj.quantity < 0) return false

  if (obj.certifications !== undefined && obj.certifications !== null) {
    if (!Array.isArray(obj.certifications)) return false
    for (const c of obj.certifications) {
      if (typeof c !== "object" || c === null) return false
      if (typeof (c as Record<string, unknown>).type !== "string") return false
      const body = (c as Record<string, unknown>).body
      if (body !== undefined && body !== null && typeof body !== "string") return false
    }
  }

  if (obj.missingFields !== undefined && obj.missingFields !== null) {
    if (!Array.isArray(obj.missingFields)) return false
    for (const f of obj.missingFields) {
      if (typeof f !== "string") return false
    }
  }

  return true
}
