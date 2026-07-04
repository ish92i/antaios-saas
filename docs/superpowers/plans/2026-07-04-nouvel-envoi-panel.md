# CreateShipmentPanel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `NewShipmentDialog` modal with a `CreateShipmentPanel` that renders inline in the right panel, with a prominent name field, file cards with preview, and an "Envoyer" button.

**Architecture:** The route layout's view state goes from `selectedId`/`isNewOpen` to a `ViewState` union. When `mode: "create"`, the right panel renders `CreateShipmentPanel` instead of `ShipmentDetailPanel` or the idle placeholder. The upload/dropzone keeps using `react-dropzone` + Convex upload flow. File preview uses `URL.createObjectURL` in a shadcn Dialog.

**Tech Stack:** React 18, TanStack Router, TanStack Query + `convexQuery`, Convex mutations, shadcn/ui Dialog, Tailwind v4, `react-dropzone`.

---

## File Structure

- Create: `src/components/shipments/CreateShipmentPanel.tsx` — big form panel
- Create: `src/components/shipments/FilePreview.tsx` — file preview lightbox
- Modify: `src/components/shipments/UploadDropzone.tsx` — grid of cards instead of list
- Modify: `src/routes/_app/_auth/dashboard/_layout.shipments.tsx` — `ViewState` type, routing logic
- Delete: `src/components/shipments/NewShipmentDialog.tsx` — replaced

---

### Task 1: Add ViewState to layout, render CreateShipmentPanel

**Files:**
- Modify: `src/routes/_app/_auth/dashboard/_layout.shipments.tsx`
- Delete: `src/components/shipments/NewShipmentDialog.tsx`

- [ ] **Step 1: Read the route file**

Run: `cat src/routes/_app/_auth/dashboard/_layout.shipments.tsx`

- [ ] **Step 2: Replace state management and rendering**

Replace the entire file content with:

```tsx
import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { convexQuery } from "@convex-dev/react-query"
import { api } from "@cvx/_generated/api"
import { useState, useCallback } from "react"
import { ShipmentList } from "@/components/shipments/ShipmentList"
import { ShipmentDetailPanel } from "@/components/shipments/ShipmentDetailPanel"
import { CreateShipmentPanel } from "@/components/shipments/CreateShipmentPanel"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

type ViewState =
  | { mode: "idle" }
  | { mode: "create" }
  | { mode: "detail"; id: string }

export const Route = createFileRoute("/_app/_auth/dashboard/_layout/shipments")({
  component: ShipmentsPage,
  beforeLoad: () => ({
    title: "Antaios - Expéditions",
    headerTitle: "Expéditions",
    headerDescription: "Gérez vos envois et leur conformité EUDR",
  }),
})

function ShipmentsPage() {
  const { data: shipments, isLoading } = useQuery(
    convexQuery(api.shipments.listShipments, {}),
  )
  const [view, setView] = useState<ViewState>({ mode: "idle" })
  const isMobile = useMediaQuery("(max-width: 767px)")
  const showDetail = view.mode !== "idle"

  const handleSelect = useCallback((id: string) => {
    setView((prev) =>
      prev.mode === "detail" && prev.id === id
        ? { mode: "idle" }
        : { mode: "detail", id },
    )
  }, [])

  const handleBack = useCallback(() => {
    setView({ mode: "idle" })
  }, [])

  const handleCreated = useCallback((id: string) => {
    setView({ mode: "detail", id })
  }, [])

  return (
    <div className="flex h-[calc(100vh-10rem)] overflow-hidden">
      {(!isMobile || !showDetail) && (
        <div className="flex w-full flex-col overflow-y-auto border-r border-border md:w-96 md:min-w-96">
          <ShipmentList
            shipments={shipments}
            isLoading={isLoading}
            selectedId={view.mode === "detail" ? view.id : undefined}
            onSelect={handleSelect}
            onCreate={() => setView({ mode: "create" })}
          />
        </div>
      )}
      {view.mode === "detail" && (
        <div className="flex flex-1 flex-col overflow-hidden">
          {isMobile && (
            <div className="flex items-center border-b border-border px-4 py-2">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
            </div>
          )}
          <ShipmentDetailPanel
            shipmentId={view.id}
            onClose={handleBack}
          />
        </div>
      )}
      {view.mode === "create" && (
        <div className="flex flex-1 flex-col overflow-hidden">
          {isMobile && (
            <div className="flex items-center border-b border-border px-4 py-2">
              <Button variant="ghost" size="sm" onClick={() => setView({ mode: "idle" })}>
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
            </div>
          )}
          <CreateShipmentPanel
            onCreated={handleCreated}
            onCancel={() => setView({ mode: "idle" })}
          />
        </div>
      )}
      {view.mode === "idle" && !isMobile && (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Sélectionnez un envoi pour voir les détails
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Delete NewShipmentDialog**

Run: `rm src/components/shipments/NewShipmentDialog.tsx`

- [ ] **Step 4: Verify typecheck**

Run: `pnpm typecheck`
Expected: Errors about missing `CreateShipmentPanel` import — expected, will resolve in next task.

---

### Task 2: Create CreateShipmentPanel

**Files:**
- Create: `src/components/shipments/CreateShipmentPanel.tsx`

- [ ] **Step 1: Write the component**

Create `src/components/shipments/CreateShipmentPanel.tsx`:

```tsx
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
          shipmentId: shipmentId as any,
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
    <div className="flex h-full flex-col">
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
          className="w-full"
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
```

- [ ] **Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: Errors about missing `FilePreview` and `onFileClick` prop on `UploadDropzone` — expected, will resolve next.

---

### Task 3: Create FilePreview component

**Files:**
- Create: `src/components/shipments/FilePreview.tsx`

- [ ] **Step 1: Write the component**

Create `src/components/shipments/FilePreview.tsx`:

```tsx
import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatFileSize } from "@/lib/formatters"
import { FileText } from "lucide-react"

export function FilePreview({
  file,
  onClose,
}: {
  file: File
  onClose: () => void
}) {
  const [textContent, setTextContent] = useState<string | null>(null)

  useEffect(() => {
    if (file.type.startsWith("text/") || file.name.endsWith(".csv") || file.name.endsWith(".geojson") || file.name.endsWith(".json") || file.name.endsWith(".kml")) {
      file.text().then(setTextContent).catch(() => setTextContent("Erreur de lecture"))
    }
  }, [file])

  const isImage = file.type.startsWith("image/")
  const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf")
  const isText = textContent !== null
  const objectUrl = isImage || isPdf ? URL.createObjectURL(file) : null

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])

  let preview: React.ReactNode

  if (isImage) {
    preview = (
      <img
        src={objectUrl!}
        alt={file.name}
        className="max-h-[60vh] w-full rounded-lg object-contain"
      />
    )
  } else if (isPdf) {
    preview = (
      <iframe
        src={objectUrl!}
        className="h-[60vh] w-full rounded-lg"
        title={file.name}
      />
    )
  } else if (isText) {
    preview = (
      <pre className="max-h-[60vh] overflow-auto rounded-lg border border-border bg-muted/20 p-4 text-xs leading-relaxed">
        {textContent}
      </pre>
    )
  } else {
    preview = (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
        <FileText className="h-12 w-12" />
        <p className="text-sm">Aperçu non disponible pour ce type de fichier</p>
      </div>
    )
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <span className="max-w-[30rem] truncate">{file.name}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {formatFileSize(file.size)}
            </span>
          </DialogTitle>
        </DialogHeader>
        {preview}
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: Should pass or only have errors about UploadDropzone props.

---

### Task 4: Update UploadDropzone to render file cards with click handler

**Files:**
- Modify: `src/components/shipments/UploadDropzone.tsx`

- [ ] **Step 1: Rewrite UploadDropzone**

Replace the entire file content with:

```tsx
import { useCallback } from "react"
import { useDropzone, type FileRejection } from "react-dropzone"
import { Upload, FileText, AlertCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatFileSize } from "@/lib/formatters"

const ACCEPTED_TYPES: Record<string, string[]> = {
  "application/*": [".pdf", ".docx", ".xlsx", ".csv", ".txt", ".geojson", ".kml", ".zip"],
}

const MAX_FILES = 10
const MAX_SIZE = 10 * 1024 * 1024

interface UploadFile {
  file: File
  errors: string[]
}

export function UploadDropzone({
  files,
  onFilesChange,
  onFileClick,
}: {
  files: UploadFile[]
  onFilesChange: (files: UploadFile[]) => void
  onFileClick?: (index: number) => void
}) {
  const onDrop = useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      const newFiles: UploadFile[] = [
        ...files,
        ...accepted.map((f) => ({ file: f, errors: [] as string[] })),
        ...rejections.map((r) => ({
          file: r.file,
          errors: r.errors.map((e) => e.message),
        })),
      ]

      if (newFiles.length > MAX_FILES) {
        newFiles.splice(MAX_FILES)
        newFiles[MAX_FILES - 1].errors.push(
          `Maximum ${MAX_FILES} fichiers autorisés`,
        )
      }

      onFilesChange(newFiles)
    },
    [files, onFilesChange],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: MAX_FILES,
    maxSize: MAX_SIZE,
    validator: (file) => {
      if (file.size > MAX_SIZE) {
        return {
          code: "file-too-large",
          message: `Fichier trop volumineux (max ${formatFileSize(MAX_SIZE)})`,
        }
      }
      const ext = "." + file.name.split(".").pop()?.toLowerCase()
      const allowed = Object.values(ACCEPTED_TYPES).flat()
      if (!allowed.includes(ext)) {
        return {
          code: "invalid-extension",
          message: `Type de fichier non supporté (${ext})`,
        }
      }
      return null
    },
  })

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index))
  }

  const hasErrors = files.some((f) => f.errors.length > 0)

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/50",
          isDragActive && "border-primary bg-primary/5",
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">
          {isDragActive
            ? "Déposez les fichiers ici"
            : "Glissez-déposez vos fichiers ici"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          PDF, DOCX, XLSX, CSV, TXT, GeoJSON, KML, ZIP (max {formatFileSize(MAX_SIZE)} par fichier)
        </p>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {files.map((f, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onFileClick?.(i)}
              className={cn(
                "group relative flex flex-col items-center gap-1.5 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted/50",
                f.errors.length > 0 && "border-destructive/50 bg-destructive/5",
              )}
            >
              <div className="flex w-full items-center justify-between">
                <FileText className={cn(
                  "h-5 w-5 shrink-0 text-muted-foreground",
                  f.errors.length > 0 && "text-destructive",
                )} />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(i)
                  }}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
              <span className="w-full truncate text-xs font-medium text-foreground">
                {f.file.name}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {formatFileSize(f.file.size)}
              </span>
              {f.errors.length > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  <span>{f.errors[0]}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export type { UploadFile }
```

- [ ] **Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS

---

### Task 5: Clean up imports and verify build

**Files:**
- All files from previous tasks

- [ ] **Step 1: Check for stale imports**

Run: `rg "NewShipmentDialog" src/ --quiet && echo "STALE IMPORT FOUND" || echo "OK"`
Expected: "OK" — no remaining imports of the deleted component.

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 3: Lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 4: Build**

Run: `pnpm build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/routes/_app/_auth/dashboard/_layout.shipments.tsx src/components/shipments/CreateShipmentPanel.tsx src/components/shipments/FilePreview.tsx src/components/shipments/UploadDropzone.tsx docs/superpowers/plans/2026-07-04-nouvel-envoi-panel.md
git rm src/components/shipments/NewShipmentDialog.tsx
git commit -m "feat: replace new-shipment modal with inline create panel"
```
