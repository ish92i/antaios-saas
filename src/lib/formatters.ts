import { format } from "date-fns"
import { fr } from "date-fns/locale"

export function formatDateFr(timestamp?: number): string {
  if (!timestamp) return "Date inconnue"
  try {
    return format(new Date(timestamp), "dd/MM/yyyy", { locale: fr })
  } catch {
    return "Date inconnue"
  }
}

export function formatDateTimeFr(timestamp?: number): string {
  if (!timestamp) return "Date inconnue"
  try {
    return format(new Date(timestamp), "dd/MM/yyyy à HH:mm", { locale: fr })
  } catch {
    return "Date inconnue"
  }
}

export function formatNumberFr(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(value)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 o"
  const units = ["o", "Ko", "Mo", "Go"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = bytes / Math.pow(1024, i)
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}
