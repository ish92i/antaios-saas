import type { Doc } from "@cvx/_generated/dataModel"
import { ShipmentCard } from "./ShipmentCard"
import { Button } from "@/components/ui/button"
import { Plus, Inbox } from "lucide-react"

type Shipment = Doc<"shipments">

export function ShipmentList({
  shipments,
  isLoading,
  selectedId,
  onSelect,
  onCreate,
}: {
  shipments?: Shipment[]
  isLoading: boolean
  selectedId?: string
  onSelect: (id: string) => void
  onCreate: () => void
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-lg border border-border bg-card p-4">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
            <div className="mt-3 h-3 w-1/3 rounded bg-muted" />
            <div className="mt-2 h-1.5 w-full rounded-full bg-muted" />
          </div>
        ))}
      </div>
    )
  }

  if (!shipments || shipments.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-foreground">Aucun envoi</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Importez votre premier document pour créer un envoi.
          </p>
        </div>
        <Button onClick={onCreate} size="sm">
          <Plus className="h-4 w-4" />
          Nouvel envoi
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-foreground">
          Envois ({shipments.length})
        </h2>
        <Button onClick={onCreate} size="xs" variant="outline">
          <Plus className="h-3.5 w-3.5" />
          Nouvel envoi
        </Button>
      </div>
      {shipments.map((s) => (
        <ShipmentCard
          key={s._id}
          shipment={s}
          isSelected={selectedId === s._id}
          onSelect={() => onSelect(s._id)}
        />
      ))}
    </div>
  )
}
