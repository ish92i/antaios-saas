import { countryName, displayValue } from "@/lib/shipment-ui"
import {
  AlertTriangle,
  Award,
  Building2,
  Calendar,
  Hash,
  Mail,
  Map,
  MapPin,
  Package,
  Scale,
  Truck,
} from "lucide-react"

interface RowDef {
  icon: React.ComponentType<{ className?: string }>
  label: string
  getValue: (data: Record<string, unknown>) => string | null
  isWarning: (data: Record<string, unknown>, questions: Array<Record<string, unknown>>) => boolean
}

export function ExtractedDataGrid({
  extractedData,
  pendingQuestions,
  onResolve,
}: {
  extractedData?: Record<string, unknown> | null
  pendingQuestions?: unknown[] | null
  onResolve: () => void
}) {
  const data = extractedData ?? {}
  const questions = (pendingQuestions ?? []).filter(
    (q: unknown) => typeof q === "object" && q !== null && "field" in (q as Record<string, unknown>),
  ) as Array<Record<string, unknown>>
  const hasQuestions = questions.length > 0

  const isMissing = (val: unknown) => val === null || val === undefined || val === ""

  const rows: RowDef[] = [
    {
      icon: Building2,
      label: "Opérateur",
      getValue: (d) => {
        const val = d.operatorName
        return isMissing(val) ? null : displayValue(val)
      },
      isWarning: () => false,
    },
    {
      icon: Hash,
      label: "EORI",
      getValue: (d) => {
        const val = d.eoriNumber
        return isMissing(val) ? null : displayValue(val)
      },
      isWarning: () => false,
    },
    {
      icon: Truck,
      label: "Fournisseur",
      getValue: (d) => {
        const val = d.supplierName
        return isMissing(val) ? null : displayValue(val)
      },
      isWarning: () => false,
    },
    {
      icon: Mail,
      label: "Email fournisseur",
      getValue: (d) => {
        const val = d.supplierEmail
        return isMissing(val) ? null : displayValue(val)
      },
      isWarning: (d, q) => {
        if (q.some((qq) => qq.field === "supplierEmail")) return true
        const email = d.supplierEmail
        if (typeof email === "string" && !email.includes("@")) return true
        return false
      },
    },
    {
      icon: Package,
      label: "Code SH",
      getValue: (d) => {
        const val = d.hsCode
        return isMissing(val) ? null : displayValue(val)
      },
      isWarning: () => false,
    },
    {
      icon: Scale,
      label: "Quantité",
      getValue: (d) => {
        const qty = d.quantity
        if (isMissing(qty)) return null
        const unit = d.quantityUnit
        const qtyStr = displayValue(qty)
        return !isMissing(unit) ? `${qtyStr} ${String(unit)}` : qtyStr
      },
      isWarning: () => false,
    },
    {
      icon: MapPin,
      label: "Origine",
      getValue: (d) => {
        const val = d.countryOfProduction
        return isMissing(val) ? null : countryName(String(val))
      },
      isWarning: () => false,
    },
    {
      icon: Map,
      label: "Région",
      getValue: (d) => {
        const val = d.region
        return isMissing(val) ? null : displayValue(val)
      },
      isWarning: (d, q) => q.some((qq) => qq.field === "region"),
    },
    {
      icon: Award,
      label: "Certification",
      getValue: (d) => {
        const val = d.certificationType
        return isMissing(val) ? null : displayValue(val)
      },
      isWarning: () => false,
    },
    {
      icon: Calendar,
      label: "Date de récolte",
      getValue: (d) => {
        const val = d.harvestDate
        return isMissing(val) ? null : displayValue(val)
      },
      isWarning: () => false,
    },
  ]

  const hasAnyData = rows.some((r) => r.getValue(data) !== null)

  if (!hasAnyData && !hasQuestions) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
        Aucune donnée extraite pour le moment.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {rows.map((row, i) => {
        const Icon = row.icon
        const value = row.getValue(data)
        const isValMissing = value === null
        const showWarning = !isValMissing && row.isWarning(data, questions)
        const isLast = i === rows.length - 1

        return (
          <div
            key={row.label}
            className={`flex items-center gap-3 px-4 py-2.5 ${isLast ? "" : "border-b border-border"}`}
          >
            <div className="flex items-center gap-2 w-[160px] shrink-0">
              <Icon className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[13px] text-muted-foreground">{row.label}</span>
            </div>

            {isValMissing ? (
              <span className="text-sm text-muted-foreground">—</span>
            ) : showWarning ? (
              <span className="text-sm text-yellow-600 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                {value}
              </span>
            ) : (
              <span className="text-sm text-foreground">{value}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
