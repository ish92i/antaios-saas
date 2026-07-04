import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@cvx/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UploadDropzone, type UploadFile } from "./UploadDropzone"
import { FilePreview } from "./FilePreview"
import { X, Loader2 } from "lucide-react"
import type { Id } from "@cvx/_generated/dataModel"

export function CreateShipmentPanel({
  onCreated,
  onCancel,
}: {
  onCreated: (id: string) => void
  onCancel: () => void
}) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const generateUploadUrl = useMutation(api.app.generateUploadUrl)
  const createShipment = useMutation(api.shipments.createShipment)
  const addDocument = useMutation(api.documents.addDocument)

  const handleSubmit = async () => {
    if (validFiles.length === 0) return
    setIsSubmitting(true)
    setError(null)

    try {
      const shipmentId = await createShipment({
        internalRef: name.trim() || undefined,
      })

      for (const f of validFiles) {
        const uploadUrl = await generateUploadUrl()
        const uploadResp = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": f.file.type },
          body: f.file,
        })
        const { storageId } = (await uploadResp.json()) as { storageId: string }
        await addDocument({
          shipmentId,
          storageId: storageId as unknown as Id<"_storage">,
          fileName: f.file.name,
          mimeType: f.file.type,
        })
      }

      onCreated(shipmentId as unknown as string)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création de l'envoi")
    } finally {
      setIsSubmitting(false)
    }
  }

  const validFiles = files.filter((f) => f.errors.length === 0)

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Nouvel envoi</h2>
        <Button variant="ghost" size="icon" onClick={onCancel} disabled={isSubmitting}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Nom de l'envoi
            </label>
            <Input
              placeholder="Ex: Commande #2024-056"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 text-base"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Fichiers
            </label>
            <UploadDropzone
              files={files}
              onFilesChange={setFiles}
              onFileClick={(i) => setPreviewIndex(i)}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-border bg-card p-4">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={validFiles.length === 0 || isSubmitting}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Création en cours..." : "Envoyer"}
        </Button>
      </div>

      {previewIndex !== null && files[previewIndex] && (
        <FilePreview
          file={files[previewIndex].file}
          onClose={() => setPreviewIndex(null)}
        />
      )}
    </div>
  )
}
