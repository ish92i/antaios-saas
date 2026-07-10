import { useState, useCallback } from "react"
import { useMutation } from "convex/react"
import { api } from "@cvx/_generated/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2 } from "lucide-react"
import type { Id } from "@cvx/_generated/dataModel"

interface CertificationEntry {
  type: string
  body?: string
}

function normalizeCertInput(certs: unknown): CertificationEntry[] {
  if (!Array.isArray(certs) || certs.length === 0) return [{ type: "", body: "" }]
  return certs.map((c) => {
    if (typeof c === "string") return { type: c, body: "" }
    if (typeof c === "object" && c !== null) {
      const obj = c as Record<string, unknown>
      return { type: String(obj.type ?? ""), body: obj.body ? String(obj.body) : "" }
    }
    return { type: "", body: "" }
  })
}

export function CertificationModal({
  open,
  onOpenChange,
  shipmentId,
  certifications,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  shipmentId: string
  certifications?: unknown
}) {
  const [entries, setEntries] = useState<CertificationEntry[]>(() =>
    normalizeCertInput(certifications),
  )
  const updateShipmentField = useMutation(api.shipments.updateShipmentField)
  const [saving, setSaving] = useState(false)

  const addEntry = useCallback(() => {
    setEntries((prev) => [...prev, { type: "", body: "" }])
  }, [])

  const removeEntry = useCallback((index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const updateEntry = useCallback((index: number, field: "type" | "body", value: string) => {
    setEntries((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }, [])

  const handleSave = useCallback(async () => {
    const filtered = entries.filter((e) => e.type.trim().length > 0)
    if (filtered.length === 0) return
    setSaving(true)
    try {
      await updateShipmentField({
        shipmentId: shipmentId as Id<"shipments">,
        field: "certifications",
        value: filtered.map((e) => ({
          type: e.type.trim(),
          ...(e.body?.trim() ? { body: e.body.trim() } : {}),
        })),
      })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }, [entries, shipmentId, updateShipmentField, onOpenChange])

  const handleCancel = useCallback(() => {
    setEntries(normalizeCertInput(certifications))
    onOpenChange(false)
  }, [certifications, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Certifications</DialogTitle>
          <DialogDescription>
            Ajoutez une ou plusieurs certifications avec leur organisme certificateur.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {entries.map((entry, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Type de certification (ex: Rainforest Alliance)"
                  value={entry.type}
                  onChange={(e) => updateEntry(i, "type", e.target.value)}
                />
                <Input
                  placeholder="Organisme certificateur (optionnel)"
                  value={entry.body ?? ""}
                  onChange={(e) => updateEntry(i, "body", e.target.value)}
                />
              </div>
              {entries.length > 1 && (
                <button
                  onClick={() => removeEntry(i)}
                  className="mt-1.5 size-7 shrink-0 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  aria-label="Supprimer"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
          ))}

          <Button variant="outline" size="sm" onClick={addEntry} className="w-full">
            <Plus className="size-3.5 mr-1.5" />
            Ajouter un certificat
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving || entries.every((e) => !e.type.trim())}>
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
