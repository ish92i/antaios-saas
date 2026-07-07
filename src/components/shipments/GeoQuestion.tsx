import { Upload, Plus, Trash2, Loader2, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function GeoQuestion({
  label,
  description,
  geoFile,
  isUploading,
  onFileSelect,
  onFileClear,
  latValue,
  lngValue,
  onLatChange,
  onLngChange,
  onSupplierClick,
}: {
  label: string
  description: string
  geoFile: File | null
  isUploading: boolean
  onFileSelect: (file: File) => void
  onFileClear: () => void
  latValue: string
  lngValue: string
  onLatChange: (value: string) => void
  onLngChange: (value: string) => void
  onSupplierClick: () => void
}) {
  return (
    <div>
      <p className={cn("text-sm font-medium text-foreground")}>{label}</p>
      <p className={cn("mt-1 text-xs text-muted-foreground")}>{description}</p>

      <div className={cn("mt-4 grid grid-cols-2 gap-3")}>
        {/* Upload zone */}
        <div
          className={cn("flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 px-3 py-5 text-center transition-colors hover:border-blue-600/50")}
          onClick={() => {
            if (!isUploading) document.getElementById("geo-file-input")?.click()
          }}
        >
          <input
            id="geo-file-input"
            type="file"
            accept=".geojson,.kml,.zip"
            className={cn("hidden")}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onFileSelect(f)
            }}
          />
          {geoFile ? (
            <div className={cn("flex items-center gap-2 text-sm")}>
              <span className={cn("truncate max-w-[120px]")}>{geoFile.name}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onFileClear() }}
                disabled={isUploading}
              >
                <Trash2 className={cn("h-3.5 w-3.5 text-destructive")} />
              </button>
            </div>
          ) : isUploading ? (
            <Loader2 className={cn("h-5 w-5 animate-spin text-muted-foreground")} />
          ) : (
            <>
              <Upload className={cn("h-5 w-5 text-muted-foreground")} />
              <p className={cn("mt-2 text-xs font-medium text-foreground")}>Uploader un fichier</p>
              <p className={cn("mt-0.5 text-[10px] text-muted-foreground")}>GeoJSON, KML, Shapefile</p>
            </>
          )}
        </div>

        {/* Manual entry */}
        <div className={cn("rounded-lg border border-border px-3 py-3")}>
          <p className={cn("text-xs font-medium text-foreground")}>Saisir manuellement</p>
          <div className={cn("mt-2 flex gap-1.5")}>
            <input
              type="text"
              placeholder="Lat"
              value={latValue}
              onChange={(e) => onLatChange(e.target.value)}
              className={cn("w-1/2 rounded-md border border-border px-2 py-1.5 text-[11px] font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600")}
            />
            <input
              type="text"
              placeholder="Long"
              value={lngValue}
              onChange={(e) => onLngChange(e.target.value)}
              className={cn("w-1/2 rounded-md border border-border px-2 py-1.5 text-[11px] font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600")}
            />
          </div>
          <button
            type="button"
            className={cn("mt-2 flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:underline")}
          >
            <Plus className={cn("h-3 w-3")} />
            Ajouter un point
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onSupplierClick}
        className={cn("mt-3 flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline")}
      >
        Vous ne les avez pas ? Envoyer au fournisseur
        <ArrowRight className={cn("h-3 w-3")} />
      </button>
    </div>
  )
}
