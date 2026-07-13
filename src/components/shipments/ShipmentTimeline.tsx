import { cn } from "@/lib/utils"
import { Check, ChevronRight } from "lucide-react"
import { useTranslation } from "react-i18next"

export function ShipmentTimeline({
  currentStep,
}: {
  currentStep: string
}) {
  const { t } = useTranslation()
  const stepKeys = ["documents", "extraction", "verification", "supplier", "scan", "ready", "submitted"]
  const currentIdx = stepKeys.indexOf(currentStep)

  return (
    <div className="flex justify-between items-start">
      {stepKeys.flatMap((key, i) => {
        const done = i < currentIdx
        const active = i === currentIdx
        const lineDone = i + 1 < currentIdx
        const items: React.ReactNode[] = [
          <div key={key} className="flex flex-col items-center gap-1.5 flex-1">
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center",
                done && "bg-green-600 text-white",
                active && "bg-primary text-primary-foreground",
                !done && !active && "border border-border",
              )}
              style={!done && !active ? { borderWidth: "0.5px" } : undefined}
            >
              {done ? (
                <Check className="size-[13px]" />
              ) : active ? (
                <ChevronRight className="size-3" />
              ) : (
                <div className="size-2 rounded-full bg-border" />
              )}
            </div>
            <span
              className={cn(
                "text-[10px] leading-tight",
                active && "font-medium text-primary",
                !active && "text-muted-foreground",
              )}
            >
              {t(`timeline.${key}`)}
            </span>
          </div>,
        ]
        if (i < stepKeys.length - 1) {
          items.push(
            <div
              key={`${key}-line`}
              className={cn(
                "h-px flex-1 self-start mt-3",
                lineDone ? "bg-green-600" : "bg-border",
              )}
            />,
          )
        }
        return items
      })}
    </div>
  )
}

export function getTimelineStep(shipment: {
  status?: string
  pendingQuestions?: unknown[] | null
  scanResult?: string | null
  supplierToken?: string | null
  completeness?: string
}): string {
  if (shipment.status === "submitted") return "submitted"
  if (shipment.status === "ready" || (shipment.completeness === "green" && shipment.scanResult)) return "ready"
  if (shipment.status === "submitting") return "ready"
  if (shipment.status === "scanning") return "scan"
  if (shipment.status === "pending_scan" || shipment.scanResult) return "scan"
  if (shipment.supplierToken) return "supplier"
  if (shipment.pendingQuestions && shipment.pendingQuestions.length > 0) return "verification"
  if (shipment.status === "extracting" || shipment.status === "resolving") return "extraction"
  return "documents"
}
