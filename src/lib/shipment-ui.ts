import i18n from "@/lib/i18n"

export type CompletenessTone = "red" | "yellow" | "green"

export function statusLabel(status?: string): string {
  const key = status ?? ""
  const label = i18n.t(`status.${key}`, { defaultValue: "" })
  return label || status || i18n.t("completeness.unknown")
}

export function completenessLabel(completeness?: string): string {
  const key = completeness ?? ""
  const label = i18n.t(`completeness.${key}`, { defaultValue: "" })
  return label || i18n.t("completeness.unknown")
}

export function completenessTone(completeness?: string): CompletenessTone {
  if (completeness === "green") return "green"
  if (completeness === "yellow") return "yellow"
  return "red"
}

export function shipmentTitle(
  extractedData: Record<string, unknown> | undefined | null,
): string {
  const name = extractedData?.commodityName
  if (typeof name === "string" && name.trim().length > 0) return name.trim()
  const ref = extractedData?.shipmentRef
  if (typeof ref === "string" && ref.trim().length > 0) return ref.trim()
  return "Nouvel envoi"
}

export function shipmentReference(shipment: {
  internalRef?: string
  extractedData?: Record<string, unknown> | null
  _id?: string
}): string {
  if (shipment.internalRef) return shipment.internalRef
  const ref = (shipment.extractedData as Record<string, unknown> | undefined)?.shipmentRef
  if (typeof ref === "string" && ref.trim().length > 0) return ref.trim()
  return shipment._id ?? "—"
}

export const fieldGroups = [
  {
    title: i18n.t("fields_group.operator"),
    fields: [
      { key: "operatorName", label: i18n.t("fields.operatorName") },
      { key: "eoriNumber", label: i18n.t("fields.eoriNumber") },
    ],
  },
  {
    title: i18n.t("fields_group.supplier"),
    fields: [
      { key: "supplierName", label: i18n.t("fields.supplierName") },
      { key: "supplierEmail", label: i18n.t("fields.supplierEmail") },
    ],
  },
  {
    title: i18n.t("fields_group.commodity"),
    fields: [
      { key: "commodityName", label: i18n.t("fields.commodityName") },
      { key: "hsCode", label: i18n.t("fields.hsCode") },
      { key: "quantity", label: i18n.t("fields.quantity") },
      { key: "quantityUnit", label: i18n.t("fields.quantityUnit") },
    ],
  },
  {
    title: i18n.t("fields_group.geography"),
    fields: [
      { key: "countryOfProduction", label: i18n.t("fields.countryOfProduction") },
      { key: "region", label: i18n.t("fields.region") },
    ],
  },
  {
    title: i18n.t("fields_group.certifications"),
    fields: [
      { key: "certificationType", label: i18n.t("fields.certificationType") },
      { key: "certificationBody", label: i18n.t("fields.certificationBody") },
    ],
  },
  {
    title: i18n.t("fields_group.geolocation"),
    fields: [
      { key: "geoJson", label: i18n.t("fields.geoJson") },
    ],
  },
]

const countryMap: Record<string, string> = {
  CI: "Côte d'Ivoire",
  GH: "Ghana",
  NG: "Nigeria",
  CM: "Cameroun",
  FR: "France",
  DE: "Allemagne",
  BE: "Belgique",
  NL: "Pays-Bas",
  GB: "Royaume-Uni",
  US: "États-Unis",
  BR: "Brésil",
  CO: "Colombie",
  PE: "Pérou",
  EC: "Équateur",
  ID: "Indonésie",
  MY: "Malaisie",
}

export function countryName(code: string): string {
  return countryMap[code.toUpperCase()] ?? code
}

export function displayValue(value: unknown): string {
  if (value === null || value === undefined) return "-"
  if (typeof value === "number") return new Intl.NumberFormat("fr-FR").format(value)
  if (typeof value === "boolean") return value ? i18n.t("fields_value.yes") : i18n.t("fields_value.no")
  if (Array.isArray(value)) return value.join(", ")
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

export function fieldLabel(key: string): string {
  for (const group of fieldGroups) {
    const field = group.fields.find((f) => f.key === key)
    if (field) return field.label
  }
  return key
}
