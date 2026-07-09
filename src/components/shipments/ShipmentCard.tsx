import { Badge } from "@/components/ui/badge"
import { statusLabel, completenessLabel, completenessTone } from "@/lib/shipment-ui"
import { formatDateFr } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import type { Doc } from "@cvx/_generated/dataModel"

type Shipment = Doc<"shipments">

const toneColors: Record<string, string> = {
  red: "bg-red-100 text-red-800 border-red-200",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
  green: "bg-green-100 text-green-800 border-green-200",
}

const progressPct: Record<string, number> = {
  red: 15,
  yellow: 55,
  green: 100,
}

export function ShipmentCard({
  shipment,
  isSelected,
  onSelect,
}: {
  shipment: Shipment
  isSelected: boolean
  onSelect: () => void
}) {
  const tone = completenessTone(shipment.completeness)
  const subtitle = (() => {
    const ed = shipment.extractedData as Record<string, unknown> | undefined | null
    const name = ed?.commodityName
    if (typeof name === "string" && name.trim().length > 0) return name.trim()
    const ref = ed?.shipmentRef
    if (typeof ref === "string" && ref.trim().length > 0) return ref.trim()
    return "Nouvel envoi"
  })()
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-sm",
        isSelected && "border-primary ring-1 ring-primary",
        shipment.status === "submitted" && "opacity-75",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium text-foreground">
            {shipment.internalRef || shipment._id}
          </h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {subtitle}
          </p>
        </div>
        <Badge
          variant={tone === "red" ? "destructive" : tone === "yellow" ? "secondary" : "default"}
          className={toneColors[tone]}
        >
          {completenessLabel(shipment.completeness)}
        </Badge>
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        <span>{statusLabel(shipment.status)}</span>
        {shipment._creationTime && <span>{formatDateFr(shipment._creationTime)}</span>}
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            tone === "red" && "bg-red-500",
            tone === "yellow" && "bg-yellow-500",
            tone === "green" && "bg-green-500",
          )}
          style={{ width: `${progressPct[tone]}%` }}
        />
      </div>
    </button>
  )
}


