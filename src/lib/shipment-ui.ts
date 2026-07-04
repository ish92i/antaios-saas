export type CompletenessTone = "red" | "yellow" | "green"

export function statusLabel(status?: string): string {
  const labels: Record<string, string> = {
    draft: "Brouillon",
    extracting: "Extraction en cours",
    resolving: "Vérification",
    pending_scan: "En attente scan",
    scanning: "Scan déforestation",
    ready: "Prêt",
    pending_supplier: "En attente fournisseur",
    submitting: "Soumission en cours",
    submitted: "Soumis",
    error: "Erreur",
  }
  return labels[status ?? ""] ?? status ?? "Inconnu"
}

export function completenessLabel(completeness?: string): string {
  const labels: Record<string, string> = {
    red: "Complétude insuffisante",
    yellow: "Complétude partielle",
    green: "Complet",
  }
  return labels[completeness ?? ""] ?? "Non évalué"
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
    title: "Opérateur",
    fields: [
      { key: "operatorName", label: "Nom de l'opérateur" },
      { key: "eoriNumber", label: "Numéro EORI" },
    ],
  },
  {
    title: "Fournisseur",
    fields: [
      { key: "supplierName", label: "Nom du fournisseur" },
      { key: "supplierEmail", label: "Email fournisseur" },
    ],
  },
  {
    title: "Marchandise",
    fields: [
      { key: "commodityName", label: "Dénomination" },
      { key: "hsCode", label: "Code SH" },
      { key: "quantity", label: "Quantité" },
      { key: "quantityUnit", label: "Unité" },
    ],
  },
  {
    title: "Géographie",
    fields: [
      { key: "countryOfProduction", label: "Pays de production" },
      { key: "region", label: "Région" },
    ],
  },
  {
    title: "Certifications",
    fields: [
      { key: "certificationType", label: "Type de certification" },
      { key: "certificationBody", label: "Organisme certificateur" },
    ],
  },
  {
    title: "Géolocalisation",
    fields: [
      { key: "geoJson", label: "Données géospatiales" },
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
  if (typeof value === "boolean") return value ? "Oui" : "Non"
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
