import { ConflictResolutionDialog } from "./ConflictResolutionDialog"
import { TracesCredentialsModal } from "./TracesCredentialsModal"
import { useQuery } from "convex/react"
import { api } from "@cvx/_generated/api"
import { ShipmentTimeline, getTimelineStep } from "./ShipmentTimeline"
import { DocumentList } from "./DocumentList"
import { ExtractedDataGrid } from "./ExtractedDataGrid"
import { DeforestationScanSection } from "./DeforestationScanSection"
import { Button } from "@/components/ui/button"
import { completenessTone, statusLabel } from "@/lib/shipment-ui"
import { CheckCircle2, X, ChevronRight } from "lucide-react"
import { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useRef } from "react"
import type { Id } from "@cvx/_generated/dataModel"

export const ShipmentDetailPanel = forwardRef<
  { triggerResolve: () => void },
  { shipmentId?: string; onClose: () => void }
>(function ShipmentDetailPanel({ shipmentId, onClose }, ref) {
  const [isConflictOpen, setIsConflictOpen] = useState(false)
  const [isTracesOpen, setIsTracesOpen] = useState(false)
  const [scanTrigger, setScanTrigger] = useState(0)

  const triggerResolve = useCallback(() => {
    setIsConflictOpen(true)
  }, [])

  useImperativeHandle(ref, () => ({ triggerResolve }), [triggerResolve])

  const shipmentRef = useRef<typeof shipment>(undefined)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const s = shipmentRef.current
      if (!s) return
      if (e.key === "r" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        const hasQuestions = (s.pendingQuestions as unknown[] | null | undefined)?.some(
          (q) => typeof q === "object" && q !== null && "field" in (q as Record<string, unknown>),
        )
        if (hasQuestions) setIsConflictOpen(true)
      }
      if (e.key === "s" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        const data = s.extractedData as Record<string, unknown> | undefined
        const hasGeoJson = !!data?.geoJson
        const hasResult = !!s.scanResult
        const recentlyRun = !!s.scanRunAt && Date.now() - s.scanRunAt < 60_000
        if (hasGeoJson && !hasResult && !recentlyRun) setScanTrigger((n) => n + 1)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const shipment = useQuery(api.shipments.getShipment, shipmentId ? { shipmentId: shipmentId as Id<"shipments"> } : "skip")

  useEffect(() => {
    shipmentRef.current = shipment
  }, [shipment])

  if (!shipmentId) return null

  if (!shipment) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 w-64 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  const tone = completenessTone(shipment.completeness)
  const timelineStep = getTimelineStep(shipment)
  const isSubmitted = shipment.status === "submitted"
  const isReadyToSubmit = shipment.status === "ready" && tone === "green" && !shipment.lockedAt
  const hasExtractionData = Boolean(
    shipment.extractedData &&
      Object.values(shipment.extractedData as Record<string, unknown>).some(
        (value) => value !== null && value !== undefined,
      ),
  )
  const hasExtractionQuestions = Boolean(
    (shipment.pendingQuestions as unknown[] | null | undefined)?.some(
      (q) => typeof q === "object" && q !== null && "field" in (q as Record<string, unknown>),
    ),
  )
  const showExtractionPanel = hasExtractionData || hasExtractionQuestions || shipment.status === "extracting" || shipment.status === "resolving"

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-foreground">
            {(shipment.extractedData as Record<string, unknown> | undefined)?.commodityName as string ?? "Envoi"}
          </h2>
          <p className="truncate text-xs text-muted-foreground">
            {shipment.internalRef || shipment._id}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Statut
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {statusLabel(shipment.status)}
              </span>
              <span className="text-xs text-muted-foreground">
                {shipment.completeness === "green"
                  ? "Prêt côté données"
                  : shipment.completeness === "yellow"
                    ? "Données partielles"
                    : "Données incomplètes"}
              </span>
            </div>
          </div>

          <ShipmentTimeline currentStep={timelineStep} />

          <section>
            <h3 className="mb-2 text-sm font-medium text-foreground">Documents</h3>
            <DocumentList shipmentId={shipmentId} />
          </section>

          {showExtractionPanel && (
            <section>
              {(shipment.status === "extracting" || shipment.status === "resolving") && !hasExtractionData ? (
                <div className="rounded-lg border border-border bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 animate-pulse rounded-full bg-primary" />
                    <span>Extraction en cours, les données vont apparaître dès que les documents auront été traités.</span>
                  </div>
                </div>
              ) : (
                <ExtractedDataGrid
                  extractedData={shipment.extractedData as Record<string, unknown> | undefined | null}
                  pendingQuestions={shipment.pendingQuestions as unknown[] | null | undefined}
                  onResolve={() => setIsConflictOpen(true)}
                />
              )}
            </section>
          )}

          <section>
            <DeforestationScanSection
              shipmentId={shipmentId}
              scanResult={shipment.scanResult}
              geoJson={(shipment.extractedData as Record<string, unknown> | undefined)?.geoJson}
              scanRunAt={shipment.scanRunAt}
              triggerScan={scanTrigger}
            />
          </section>
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-border bg-card p-4">
        {isSubmitted ? (
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              Envoi soumis
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <kbd className="inline-flex h-4 w-4 items-center justify-center rounded border border-border bg-muted text-[9px] font-medium">R</kbd>
                Résoudre
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <kbd className="inline-flex h-4 w-4 items-center justify-center rounded border border-border bg-muted text-[9px] font-medium">S</kbd>
                Scan
              </span>
            </div>
            {isReadyToSubmit && (
              <Button size="sm" onClick={() => setIsTracesOpen(true)}>
                Soumettre
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      <ConflictResolutionDialog
        open={isConflictOpen}
        onOpenChange={setIsConflictOpen}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        shipment={shipment as any}
      />

      <TracesCredentialsModal
        open={isTracesOpen}
        onOpenChange={setIsTracesOpen}
        shipmentId={shipmentId}
      />
    </div>
  )
})
