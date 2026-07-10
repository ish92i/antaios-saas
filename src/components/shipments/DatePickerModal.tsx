import { useState, useCallback } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useMutation } from "convex/react"
import { api } from "@cvx/_generated/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import type { Id } from "@cvx/_generated/dataModel"

export function DatePickerModal({
  open,
  onOpenChange,
  shipmentId,
  currentDate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  shipmentId: string
  currentDate?: string
}) {
  const [date, setDate] = useState<Date | undefined>(
    currentDate ? parseISODate(currentDate) : undefined,
  )
  const updateShipmentField = useMutation(api.shipments.updateShipmentField)
  const [saving, setSaving] = useState(false)

  const handleSave = useCallback(async () => {
    if (!date) return
    setSaving(true)
    try {
      const iso = format(date, "yyyy-MM-dd")
      await updateShipmentField({
        shipmentId: shipmentId as Id<"shipments">,
        field: "productionDate",
        value: iso,
      })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }, [date, shipmentId, updateShipmentField, onOpenChange])

  const handleCancel = useCallback(() => {
    setDate(currentDate ? parseISODate(currentDate) : undefined)
    onOpenChange(false)
  }, [currentDate, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Date de récolte</DialogTitle>
          <DialogDescription>
            Sélectionnez la date de récolte.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-2">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={fr}
            startMonth={new Date(2020, 0)}
            endMonth={new Date(2030, 11)}
          />
        </div>

        {date && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="size-3.5" />
            <span>{format(date, "dd MMMM yyyy", { locale: fr })}</span>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving || !date}>
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function parseISODate(value: string): Date | undefined {
  if (!value) return undefined
  const d = new Date(value)
  if (isNaN(d.getTime())) return undefined
  return d
}
