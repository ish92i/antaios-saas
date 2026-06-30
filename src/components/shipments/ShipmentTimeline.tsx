import { cn } from "@/lib/utils"
import { CheckCircle2, Circle, Clock, FileText, Search, UserCheck, Globe, ShieldCheck } from "lucide-react"

const steps = [
  { key: "documents", label: "Documents", icon: FileText },
  { key: "extraction", label: "Extraction", icon: Search },
  { key: "verification", label: "Vérification", icon: CheckCircle2 },
  { key: "supplier", label: "Fournisseur", icon: UserCheck },
  { key: "scan", label: "Scan déforestation", icon: Globe },
  { key: "ready", label: "Prêt", icon: ShieldCheck },
  { key: "submitted", label: "Soumis", icon: CheckCircle2 },
]

export function ShipmentTimeline({
  currentStep,
}: {
  currentStep: string
}) {
  const currentIdx = steps.findIndex((s) => s.key === currentStep)

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const isCompleted = i < currentIdx
        const isCurrent = i === currentIdx
        return (
          <div key={step.key} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors",
                  isCompleted && "bg-primary text-primary-foreground",
                  isCurrent && "border-2 border-primary text-primary",
                  !isCompleted && !isCurrent && "border border-border text-muted-foreground",
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : isCurrent ? (
                  <Clock className="h-3.5 w-3.5" />
                ) : (
                  <Circle className="h-3.5 w-3.5" />
                )}
              </div>
              <span
                className={cn(
                  "hidden text-[10px] leading-tight md:block",
                  isCompleted && "text-primary",
                  isCurrent && "font-medium text-foreground",
                  !isCompleted && !isCurrent && "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "mx-1 mb-5 h-px flex-1 md:mb-0",
                  i < currentIdx ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </div>
        )
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
  if (shipment.completeness === "green" && shipment.scanResult) return "ready"
  if (shipment.scanResult) return "scan"
  if (shipment.supplierToken) return "supplier"
  if (shipment.pendingQuestions && shipment.pendingQuestions.length > 0) return "verification"
  if (shipment.status === "extraction_done" || shipment.status === "resolving") return "extraction"
  return "documents"
}
