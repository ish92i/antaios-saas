import { useState } from "react"
import { useTranslation } from "react-i18next"
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
  Plus,
  Scale,
  Truck,
} from "lucide-react"
import { CertificationModal } from "./CertificationModal"
import { DatePickerModal } from "./DatePickerModal"

interface RowDef {
  icon: React.ComponentType<{ className?: string }>
  label: string
  isActionRow?: boolean
  getValue: (data: Record<string, unknown>) => string | null
  isWarning: (data: Record<string, unknown>, questions: Array<Record<string, unknown>>) => boolean
}

export function ExtractedDataGrid({
  extractedData,
  pendingQuestions,
  shipmentId,
}: {
  extractedData?: Record<string, unknown> | null
  pendingQuestions?: unknown[] | null
  shipmentId?: string
}) {
  const { t } = useTranslation()
  const data = extractedData ?? {}
  const questions = (pendingQuestions ?? []).filter(
    (q: unknown) => typeof q === "object" && q !== null && "field" in (q as Record<string, unknown>),
  ) as Array<Record<string, unknown>>
  const hasQuestions = questions.length > 0

  const [certModalOpen, setCertModalOpen] = useState(false)
  const [dateModalOpen, setDateModalOpen] = useState(false)

  const isMissing = (val: unknown) => val === null || val === undefined || val === ""

  function formatCertifications(certs: unknown): string | null {
    if (!Array.isArray(certs) || certs.length === 0) return null
    return certs
      .map((c) => {
        if (typeof c === "string") return c
        if (typeof c !== "object" || c === null) return ""
        const entry = c as Record<string, unknown>
        const type = String(entry.type ?? "")
        const body = entry.body ? String(entry.body) : ""
        return body ? `${type} (${body})` : type
      })
      .filter(Boolean)
      .join(", ")
  }

  const rows: RowDef[] = [
    {
      icon: Building2,
      label: t("extracted_grid.operator"),
      getValue: (d) => {
        const val = d.operatorName
        return isMissing(val) ? null : displayValue(val)
      },
      isWarning: () => false,
    },
    {
      icon: Hash,
      label: t("extracted_grid.eori"),
      getValue: (d) => {
        const val = d.eoriNumber
        return isMissing(val) ? null : displayValue(val)
      },
      isWarning: () => false,
    },
    {
      icon: Truck,
      label: t("extracted_grid.supplier"),
      getValue: (d) => {
        const val = d.supplierName
        return isMissing(val) ? null : displayValue(val)
      },
      isWarning: () => false,
    },
    {
      icon: Mail,
      label: t("extracted_grid.supplier_email"),
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
      label: t("extracted_grid.hs_code"),
      getValue: (d) => {
        const val = d.hsCode
        return isMissing(val) ? null : displayValue(val)
      },
      isWarning: () => false,
    },
    {
      icon: Scale,
      label: t("extracted_grid.quantity"),
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
      label: t("extracted_grid.origin"),
      getValue: (d) => {
        const val = d.countryOfProduction
        return isMissing(val) ? null : countryName(String(val))
      },
      isWarning: () => false,
    },
    {
      icon: Map,
      label: t("extracted_grid.region"),
      getValue: (d) => {
        const val = d.region
        return isMissing(val) ? null : displayValue(val)
      },
      isWarning: (_, q) => q.some((qq) => qq.field === "region"),
    },
    {
      icon: Award,
      label: t("extracted_grid.certification"),
      getValue: (d) => formatCertifications(d.certifications),
      isWarning: () => false,
    },
    {
      icon: Calendar,
      label: t("extracted_grid.harvest_date"),
      getValue: (d) => {
        const val = d.productionDate
        return isMissing(val) ? null : displayValue(val)
      },
      isWarning: () => false,
    },
  ]

  const hasAnyData = rows.some((r) => r.getValue(data) !== null)

  if (!hasAnyData && !hasQuestions) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
        {t("extracted_data.empty")}
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border border-border overflow-hidden">
        {rows.map((row, i) => {
          const Icon = row.icon
          const value = row.getValue(data)
          const isValMissing = value === null
          const isCertRow = row.icon === Award
          const isDateRow = row.icon === Calendar
          const isActionRow = (isCertRow || isDateRow) && isValMissing
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

              {isValMissing && !isActionRow ? (
                <span className="text-sm text-muted-foreground">—</span>
              ) : isActionRow ? (
                <button
                  onClick={() => {
                    if (isCertRow) setCertModalOpen(true)
                    if (isDateRow) setDateModalOpen(true)
                  }}
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  <Plus className="size-3.5" />
                  {t("add")}
                </button>
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

      {shipmentId && (
        <>
          <CertificationModal
            open={certModalOpen}
            onOpenChange={setCertModalOpen}
            shipmentId={shipmentId}
            certifications={
              Array.isArray(data.certifications)
                ? (data.certifications as Array<{ type: string; body?: string }>)
                : []
            }
          />
          <DatePickerModal
            open={dateModalOpen}
            onOpenChange={setDateModalOpen}
            shipmentId={shipmentId}
            currentDate={typeof data.productionDate === "string" ? data.productionDate : undefined}
          />
        </>
      )}
    </>
  )
}
