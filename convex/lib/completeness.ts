import type { ExtractedData } from "./validators"

export const REQUIRED_FIELDS = [
  "operatorName",
  "eoriNumber",
  "supplierName",
  "commodityName",
  "hsCode",
  "quantity",
  "quantityUnit",
  "countryOfProduction",
  "shipmentRef",
] as const

export type Completeness = "red" | "yellow" | "green"

export function recomputeCompleteness(
  extractedData: ExtractedData | undefined | null,
  scanResult: string | undefined | null,
  _pendingQuestions?: unknown[] | undefined | null,
): Completeness {
  if (!extractedData) return "red"

  const data = extractedData as Record<string, unknown>

  let presentCount = 0
  for (const field of REQUIRED_FIELDS) {
    const val = data[field]
    if (field === "quantity") {
      if (typeof val === "number" && val > 0) presentCount++
    } else {
      if (typeof val === "string" && val.trim().length > 0) presentCount++
    }
  }

  if (presentCount < 3) return "red"

  if (presentCount >= REQUIRED_FIELDS.length) {
    if (scanResult) return "green"
    return "yellow"
  }

  return "yellow"
}
