import { useCallback } from "react"
import { useDropzone, type FileRejection } from "react-dropzone"
import { Upload, File, AlertCircle, Trash2 } from "lucide-react"
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
}: {
  files: UploadFile[]
  onFilesChange: (files: UploadFile[]) => void
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
        <ul className="space-y-1">
          {files.map((f, i) => (
            <li
              key={i}
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
            >
              <File className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{f.file.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatFileSize(f.file.size)}
              </span>
              {f.errors.length > 0 ? (
                <span className="flex items-center gap-1 text-xs text-destructive" title={f.errors.join(", ")}>
                  <AlertCircle className="h-3.5 w-3.5" />
                  Erreur
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Retirer
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export type { UploadFile }
