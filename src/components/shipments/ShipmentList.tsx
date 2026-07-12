import type { Doc } from "@cvx/_generated/dataModel"
import { ShipmentCard } from "./ShipmentCard"
import { Button } from "@/components/ui/button"
import { Search, Plus, Inbox } from "lucide-react"
import { useModifierSymbol } from "@/hooks/use-modifier-symbol"
import { useTranslation } from "react-i18next"

type Shipment = Doc<"shipments">

export function ShipmentList({
  shipments,
  isLoading,
  selectedId,
  onSelect,
  onCreate,
  onOpenCommand,
}: {
  shipments?: Shipment[]
  isLoading: boolean
  selectedId?: string
  onSelect: (id: string) => void
  onCreate: () => void
  onOpenCommand?: () => void
}) {
  const { t } = useTranslation()
  const modSymbol = useModifierSymbol()

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
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 -mt-20 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted relative top-3">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-foreground">{t("shipment.empty_title")}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("shipment.empty_desc")}
          </p>
        </div>
        <Button onClick={onCreate} size="sm">
          <Plus className="h-4 w-4" />
          {t("shipment.create")}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 px-5 pt-5 pb-16">
      <button
        onClick={onOpenCommand}
        className="flex w-full items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">{t("shipment.search")}</span>
        <kbd className="flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
          {modSymbol}K
        </kbd>
      </button>

      <div className="flex items-center justify-between px-0.5">
        <h2 className="text-base font-bold text-foreground">
          {t("shipment.title")}{" "}
          <span className="text-sm font-normal text-muted-foreground">
            ({shipments.length})
          </span>
        </h2>
        <Button onClick={onCreate} size="xs" variant="default">
          <Plus className="h-3.5 w-3.5" />
          {t("shipment.create")}
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
