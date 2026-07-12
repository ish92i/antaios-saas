export type BilingualLabel = { fr: string; en: string }

export function resolveLabel(label: string | BilingualLabel): string {
  if (typeof label === "string") return label
  return label.fr
}
