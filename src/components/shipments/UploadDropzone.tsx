import { useCallback } from "react"
import { useDropzone, type FileRejection } from "react-dropzone"
import { Upload, FileText, AlertCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatFileSize } from "@/lib/formatters"

const ACCEPTED_TYPES: Record<string, string[]> = {
  "application/*": [".pdf", ".docx", ".xlsx", ".geojson", ".kml", ".zip"],
  "text/*": [".csv", ".txt"],
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
