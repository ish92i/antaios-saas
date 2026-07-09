import { useAction } from "convex/react"
import { api } from "@cvx/_generated/api"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Map,
  ShieldCheck,
  MapPinOff,
  Upload,
  Loader2,
  CircleDashed,
  Check,
  AlertTriangle,
} from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import type { Id } from "@cvx/_generated/dataModel"

type GeoJsonGeometry = { type: string; coordinates: unknown }
type GeoJsonFeature = { type: "Feature"; geometry: GeoJsonGeometry }
type GeoJsonFeatureCollection = { type: "FeatureCollection"; features: GeoJsonFeature[] }
type GeoJsonInput = GeoJsonFeatureCollection | GeoJsonFeature

function extractPolygonPoints(geoJson: unknown): string | null {
  try {
    let geometry: GeoJsonGeometry | undefined
    const gj = geoJson as GeoJsonInput
    if (gj.type === "FeatureCollection") {
      geometry = gj.features?.[0]?.geometry
    } else if (gj.type === "Feature") {
      geometry = gj.geometry
    }
    if (geometry?.type !== "Polygon") return null
    const rings = geometry.coordinates as number[][][]
    if (!rings.length || !rings[0].length) return null

    const width = 300, height = 140, pad = 10
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    for (const ring of rings)
      for (const [x, y] of ring) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    const rangeX = maxX - minX || 1
    const rangeY = maxY - minY || 1
    const scale = Math.min((width - pad * 2) / rangeX, (height - pad * 2) / rangeY)
    const ox = (width - rangeX * scale) / 2
    const oy = (height - rangeY * scale) / 2
    return rings
      .map((ring) =>
        ring
          .map(([x, y]) => `${(x - minX) * scale + ox},${(y - minY) * scale + oy}`)
          .join(" "),
      )
      .join(" ")
  } catch {
    return null
  }
}

export function DeforestationScanSection({
  shipmentId,
  scanResult,
  geoJson,
  scanRunAt,
  triggerScan,
}: {
  shipmentId: string
  scanResult?: string | null
  geoJson?: unknown | null
  scanRunAt?: number | null
  triggerScan?: number
}) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const runScan = useAction(api.scan.runDeforestationScan)

  const recentlyRun = !!scanRunAt && Date.now() - scanRunAt < 60_000
  const hasGeo = !!geoJson
  const polygonPoints = hasGeo ? extractPolygonPoints(geoJson) : null
  const scanInProgress = isScanning || (recentlyRun && !scanResult && hasGeo)

  const handleScan = useCallback(async () => {
    setIsScanning(true)
    setError(null)
    try {
      await runScan({ shipmentId: shipmentId as Id<"shipments"> })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du scan")
    } finally {
      setIsScanning(false)
    }
  }, [runScan, shipmentId])

  useEffect(() => {
    if (triggerScan && triggerScan > 0 && !isScanning) {
      handleScan()
    }
  }, [triggerScan, handleScan, isScanning])

  const canRunScan = hasGeo && !isScanning && !recentlyRun && !scanResult

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="flex items-center gap-1.5 px-3.5 pb-2 pt-2.5">
          <Map className="size-3.5 text-muted-foreground" />
          <span className="text-[11px] font-medium text-muted-foreground tracking-wider">
            GÉOLOCALISATION
          </span>
        </div>

        {hasGeo ? (
          <>
            <svg
              viewBox="0 0 300 140"
              className="w-full h-[140px] block bg-muted"
              role="img"
              aria-label="Parcelle géolocalisée"
            >
              <polygon
                points={polygonPoints ?? "120,25 220,40 260,90 180,125 90,110 65,55"}
                fill="currentColor"
                fillOpacity={0.18}
                stroke="currentColor"
                strokeWidth={1.5}
                className="text-primary"
              />
            </svg>
            <div className="border-t border-border px-3.5 py-2.5 flex justify-between">
              <span className="text-xs text-muted-foreground font-mono">6.8206°N, 5.2767°W</span>
              <span className="text-xs text-muted-foreground">4.2 ha</span>
            </div>
          </>
        ) : (
          <>
            <div className="h-[140px] flex flex-col items-center justify-center gap-2 bg-muted">
              <MapPinOff className="size-5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground text-center max-w-[180px]">
                Aucune donnée géospatiale disponible
              </p>
            </div>
            <div className="border-t border-border px-3.5 py-2.5">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center text-xs gap-1.5"
              >
                <Upload className="size-3.5" />
                Ajouter une parcelle
              </Button>
            </div>
          </>
        )}
      </div>

      <div className={cn("rounded-xl border overflow-hidden flex flex-col", scanResult === "alert" ? "border-red-200" : "border-border")}>
        <div className="flex items-center gap-1.5 px-3.5 pb-2 pt-2.5">
          <ShieldCheck className="size-3.5 text-muted-foreground" />
          <span className="text-[11px] font-medium text-muted-foreground tracking-wider">
            DÉFORESTATION
          </span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-2 px-3.5 pb-4 text-center">
          {scanInProgress ? (
            <>
              <div className="size-10 rounded-full bg-muted flex items-center justify-center mb-1">
                <Loader2 className="size-5 text-muted-foreground animate-spin" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Scan en cours...</span>
            </>
          ) : scanResult === "clean" ? (
            <>
              <div className="size-10 rounded-full bg-green-600 flex items-center justify-center mb-1">
                <Check className="size-5 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600">Aucune alerte</span>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
                Vérifié via Global Forest Watch. Sans changement de couvert forestier depuis 2020.
              </p>
            </>
          ) : scanResult === "alert" ? (
            <>
              <div className="size-10 rounded-full bg-red-100 flex items-center justify-center mb-1">
                <AlertTriangle className="size-5 text-destructive" />
              </div>
              <span className="text-sm font-medium text-destructive">Alerte détectée</span>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
                Changement de couvert forestier signalé en 2023 sur cette parcelle (Global Forest Watch).
              </p>
              <Button
                size="xs"
                onClick={handleScan}
                disabled={isScanning}
                className="mt-1 gap-1"
              >
                Relancer le scan
              </Button>
            </>
          ) : (
            <>
              <div className="size-10 rounded-full bg-muted flex items-center justify-center mb-1">
                <CircleDashed className="size-5 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Scan non lancé</span>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
                Nécessite la géolocalisation de la parcelle pour être exécuté.
              </p>
              {canRunScan && (
                <Button
                  size="xs"
                  onClick={handleScan}
                  disabled={isScanning}
                  className="mt-1 gap-1"
                >
                  Lancer le scan
                </Button>
              )}
            </>
          )}
        </div>

        {error && <p className="text-xs text-destructive px-3.5 pb-3">{error}</p>}
      </div>
    </div>
  )
}
