import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@cvx/_generated/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UploadDropzone, type UploadFile } from "./UploadDropzone"
import { Loader2 } from "lucide-react"
import type { Id } from "@cvx/_generated/dataModel"

export function NewShipmentDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (id: string) => void
}) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [internalRef, setInternalRef] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const generateUploadUrl = useMutation(api.app.generateUploadUrl)
  const createShipment = useMutation(api.shipments.createShipment)
  const addDocument = useMutation(api.documents.addDocument)

  const handleSubmit = async () => {
    if (files.length === 0) return
    setIsSubmitting(true)
    setError(null)

    try {
      const shipmentId = await createShipment({
        internalRef: internalRef.trim() || undefined,
      })

      for (const f of files) {
        if (f.errors.length > 0) continue
        const uploadUrl = await generateUploadUrl()
        const uploadResp = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": f.file.type },
          body: f.file,
        })
        const { storageId } = (await uploadResp.json()) as { storageId: string }
        await addDocument({
          shipmentId: shipmentId as any,
          storageId: storageId as unknown as Id<"_storage">,
          fileName: f.file.name,
          mimeType: f.file.type,
        })
      }

      onCreated(shipmentId as unknown as string)
      setFiles([])
      setInternalRef("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création de l'envoi")
    } finally {
      setIsSubmitting(false)
    }
  }

  const validFiles = files.filter((f) => f.errors.length === 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouvel envoi</DialogTitle>
          <DialogDescription>
            Importez les documents liés à votre envoi pour démarrer l'extraction.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Référence interne (optionnelle)
            </label>
            <Input
              placeholder="Ex: Commande #2024-056"
              value={internalRef}
              onChange={(e) => setInternalRef(e.target.value)}
            />
          </div>

          <UploadDropzone files={files} onFilesChange={setFiles} />

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={validFiles.length === 0 || isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? "Création en cours..." : "Créer l'envoi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
