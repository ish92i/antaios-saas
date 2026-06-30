import { useAction } from "convex/react"
import { api } from "@cvx/_generated/api"
import { Button } from "@/components/ui/button"
import { Globe, ShieldCheck, MapPin, Loader2, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import type { Id } from "@cvx/_generated/dataModel"

const scanStateConfig: Record<string, { icon: typeof Globe; label: string; color: string }> = {
  ready: { icon: Globe, label: "Scan disponible", color: "text-muted-foreground" },
  no_polygon: { icon: MapPin, label: "Données géospatiales manquantes", color: "text-yellow-600" },
  scanning: { icon: Loader2, label: "Scan en cours...", color: "text-primary" },
  clean: { icon: ShieldCheck, label: "Aucune alerte", color: "text-green-600" },
  alerts_found: { icon: AlertTriangle, label: "Alertes détectées", color: "text-destructive" },
}

export function DeforestationScanSection({
  shipmentId,
  scanResult,
  geoJson,
}: {
  shipmentId: string
  scanResult?: string | null
  geoJson?: unknown | null
}) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const runScan = useAction(api.scan.runDeforestationScan)

  const status = scanResult ?? (geoJson ? "ready" : "no_polygon")
  const cfg = scanStateConfig[status] ?? scanStateConfig.ready
  const Icon = isScanning ? Loader2 : cfg.icon

  const handleScan = async () => {
    setIsScanning(true)
    setError(null)
    try {
      await runScan({ shipmentId: shipmentId as Id<"shipments"> })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du scan")
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-foreground">Scan déforestation</h4>
      <div className="flex items-center justify-between rounded-md border border-border p-3">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", isScanning && "animate-spin", cfg.color)} />
          <span className={cn("text-sm", cfg.color)}>{cfg.label}</span>
        </div>
        {status === "ready" && (
          <Button size="xs" onClick={handleScan} disabled={isScanning}>
            Lancer le scan
          </Button>
        )}
        {(status === "no_polygon" || status === "alerts_found") && !scanResult && (
          <Button size="xs" variant="outline" onClick={handleScan} disabled={isScanning}>
            Réessayer
          </Button>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
