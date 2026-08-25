import { useEffect, useMemo, useState } from "react"
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
    let cancelled = false
    const shouldReadText = file.type.startsWith("text/") || file.name.endsWith(".csv") || file.name.endsWith(".geojson") || file.name.endsWith(".json") || file.name.endsWith(".kml")
    if (shouldReadText) {
      file.text().then(content => {
        if (!cancelled) setTextContent(content as string)
      }).catch(() => {
        if (!cancelled) setTextContent("Erreur de lecture")
      })
    }
    return () => { cancelled = true }
  }, [file])

  const isImage = file.type.startsWith("image/")
  const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf")
  const isText = textContent !== null
  const objectUrl = useMemo(() => {
    return isImage || isPdf ? URL.createObjectURL(file) : null
  }, [file, isImage, isPdf])

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])

  let preview: React.ReactNode

  if (isImage && objectUrl) {
    preview = (
      <img
        src={objectUrl}
        alt={file.name}
        loading="lazy"
        className="max-h-[60vh] w-full rounded-lg object-contain"
      />
    )
  } else if (isPdf && objectUrl) {
    preview = (
      <iframe
        src={objectUrl}
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
