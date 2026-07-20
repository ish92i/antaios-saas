import { useCallback } from "react"
import { useDropzone, type FileRejection } from "react-dropzone"
import { Upload, FileText, X, FileWarning } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatFileSize } from "@/lib/formatters"
import { useTranslation, Trans } from "react-i18next"

const ACCEPTED_TYPES: Record<string, string[]> = {
  "application/*": [".pdf", ".docx", ".xlsx", ".geojson", ".kml", ".zip"],
  "text/*": [".csv", ".txt"],
}

const MAX_FILES = 10
const MAX_SIZE = 10 * 1024 * 1024

const FORMAT_LABELS = ["PDF", "DOCX", "XLSX", "CSV", "TXT", "GeoJSON", "KML", "ZIP"]

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
  const { t } = useTranslation()
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
          t("upload.max_files_error", { count: MAX_FILES }),
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
          message: t("upload.file_too_large", { size: formatFileSize(MAX_SIZE) }),
        }
      }
      const ext = "." + file.name.split(".").pop()?.toLowerCase()
      const allowed = Object.values(ACCEPTED_TYPES).flat()
      if (!allowed.includes(ext)) {
        return {
          code: "invalid-extension",
          message: t("upload.unsupported_type", { ext }),
        }
      }
      return null
    },
  })

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "group relative cursor-pointer rounded-xl border-2 border-dashed border-border bg-background transition-all duration-200 hover:border-primary/50 hover:bg-primary/[0.02]",
          isDragActive && "border-primary bg-primary/5",
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center px-6 py-8 text-center">
          <div
            className={cn(
              "mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted transition-colors",
              isDragActive && "bg-primary/10",
            )}
          >
            <Upload
              className={cn(
                "h-6 w-6 text-muted-foreground transition-colors",
                isDragActive && "text-primary",
              )}
            />
          </div>
          <p className="text-sm font-medium text-foreground">
            {isDragActive ? t("upload.dropzone_active") : t("upload.dropzone_idle")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            <Trans i18nKey="upload.browse">
              or <span className="font-medium text-primary underline-offset-2 hover:underline">browse</span> your files
            </Trans>
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
            {FORMAT_LABELS.map((fmt) => (
              <span
                key={fmt}
                className="inline-flex items-center rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {fmt}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground/60">
            {t("upload.max_file_size", { size: formatFileSize(MAX_SIZE) })}
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {files.map((f, i) => (
            <div
              key={i}
              className={cn(
                "group relative flex flex-col gap-2.5 rounded-lg border p-3 transition-colors",
                f.errors.length > 0
                  ? "border-destructive/30 bg-destructive/[0.02]"
                  : "border-border bg-card hover:bg-muted/30",
                onFileClick && "cursor-pointer",
              )}
              onClick={() => onFileClick?.(i)}
              role={onFileClick ? "button" : undefined}
              tabIndex={onFileClick ? 0 : undefined}
              onKeyDown={(e) => {
                if (onFileClick && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault()
                  onFileClick(i)
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    f.errors.length > 0 ? "bg-destructive/10" : "bg-muted",
                  )}
                >
                  {f.errors.length > 0 ? (
                    <FileWarning className="h-4 w-4 text-destructive" />
                  ) : (
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(i)
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
                  aria-label={t("upload.remove_file")}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-foreground">
                  {f.file.name}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span>{formatFileSize(f.file.size)}</span>
                  {f.errors.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-destructive">
                      <span aria-hidden="true">&middot;</span>
                      {f.errors[0]}
                    </span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export type { UploadFile }
