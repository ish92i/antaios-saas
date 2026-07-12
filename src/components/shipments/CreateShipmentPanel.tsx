import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@cvx/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UploadDropzone, type UploadFile } from "./UploadDropzone"
import { FilePreview } from "./FilePreview"
import { X, Loader2, FileUp } from "lucide-react"
import type { Id } from "@cvx/_generated/dataModel"
import { motion } from "motion/react"
import { useTranslation } from "react-i18next"

export function CreateShipmentPanel({
  onCreated,
  onCancel,
}: {
  onCreated: (id: string) => void
  onCancel: () => void
}) {
  const { t } = useTranslation()
  const [files, setFiles] = useState<UploadFile[]>([])
  const [name, setName] = useState("")
  const [nameError, setNameError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const generateUploadUrl = useMutation(api.app.generateUploadUrl)
  const createShipment = useMutation(api.shipments.createShipment)
  const addDocument = useMutation(api.documents.addDocument)

  const validFiles = files.filter((f) => f.errors.length === 0)

  const handleSubmit = async () => {
    if (!name.trim()) {
      setNameError(t("shipment.name_required"))
      return
    }
    setNameError(null)
    if (validFiles.length === 0) return
    setIsSubmitting(true)
    setError(null)

    try {
      const shipmentId = await createShipment({
        internalRef: name.trim(),
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
      setError(err instanceof Error ? err.message : t("shipment.create_error"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-full flex-col bg-background"
    >
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{t("shipment.new_shipment_title")}</h2>
          <p className="text-xs text-muted-foreground">{t("shipment.new_shipment_subtitle")}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} disabled={isSubmitting}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="flex flex-col gap-8">
          <section>
            <div className="mb-1.5 flex items-center gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="shipment-name">
                {t("shipment.name_label")}
              </label>
              <span className="text-xs text-red-500">*</span>
            </div>
            <Input
              id="shipment-name"
              placeholder={t("shipment.name_placeholder")}
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (nameError) setNameError(null)
              }}
              className="h-10 text-base"
              aria-invalid={!!nameError}
            />
            {nameError ? (
              <p className="mt-1.5 text-xs text-red-500" role="alert">{nameError}</p>
            ) : (
              <p className="mt-1.5 text-xs text-muted-foreground">
                {t("shipment.name_hint")}
              </p>
            )}
          </section>

          <div className="border-t border-border" />

          <section>
            <div className="mb-1 flex items-center gap-2">
              <FileUp className="h-4 w-4 text-primary" />
              <label className="text-sm font-medium text-foreground">{t("shipment.files")}</label>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              {t("shipment.files_hint")}
            </p>
            <UploadDropzone
              files={files}
              onFilesChange={setFiles}
              onFileClick={(i) => setPreviewIndex(i)}
            />
          </section>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {error}
            </motion.p>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-[10px] font-semibold text-muted-foreground">
              {validFiles.length}
            </div>
            <span className="text-xs text-muted-foreground">
              {validFiles.length === 0
                ? t("shipment.no_files")
                : t("shipment.file_count", { count: validFiles.length })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={onCancel} disabled={isSubmitting}>
              {t("shipment.cancel")}
            </Button>
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={validFiles.length === 0 || isSubmitting}
              className="min-w-[150px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("shipment.creating")}
                </>
              ) : (
                {t("shipment.create_cta")}
              )}
            </Button>
          </div>
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
