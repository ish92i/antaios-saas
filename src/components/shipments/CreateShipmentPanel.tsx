import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@cvx/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UploadDropzone, type UploadFile } from "./UploadDropzone"
import { FilePreview } from "./FilePreview"
import { X, Loader2, PackagePlus, FileUp } from "lucide-react"
import type { Id } from "@cvx/_generated/dataModel"
import { motion } from "motion/react"

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
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-full flex-col bg-background"
    >
      <div className="flex items-center justify-between border-b border-border bg-card px-5 py-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <PackagePlus className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Nouvel envoi</h2>
            <p className="text-xs text-muted-foreground">Créez un envoi et importez ses documents</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} disabled={isSubmitting}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="mx-auto flex min-h-full max-w-xl flex-col gap-5">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-xl border border-border bg-card p-5 shadow-xs"
          >
            <label className="mb-2 block text-sm font-medium text-foreground">
              Nom de l'envoi
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">optionnel</span>
            </label>
            <Input
              placeholder="Ex: Commande #2024-056"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 text-base"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Un nom interne pour identifier facilement cet envoi dans la liste
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-xl border border-border bg-card p-5 shadow-xs"
          >
            <div className="mb-1 flex items-center gap-2">
              <FileUp className="h-4 w-4 text-primary" />
              <label className="text-sm font-medium text-foreground">Fichiers</label>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              Importez les documents liés à cet envoi (factures, documents douaniers, etc.)
            </p>
            <UploadDropzone
              files={files}
              onFilesChange={setFiles}
              onFileClick={(i) => setPreviewIndex(i)}
            />
          </motion.div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </motion.p>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-card px-5 py-4 shadow-xs">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-[10px] font-semibold text-muted-foreground">
              {validFiles.length}
            </div>
            <span className="text-xs text-muted-foreground">
              {validFiles.length === 0
                ? "Aucun fichier"
                : `${validFiles.length} fichier${validFiles.length > 1 ? "s" : ""}`}
            </span>
          </div>
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={validFiles.length === 0 || isSubmitting}
            className="min-w-[150px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              "Créer l'envoi"
            )}
          </Button>
        </div>
      </div>

      {previewIndex !== null && files[previewIndex] && (
        <FilePreview
          file={files[previewIndex].file}
          onClose={() => setPreviewIndex(null)}
        />
      )}
    </motion.div>
  )
}
