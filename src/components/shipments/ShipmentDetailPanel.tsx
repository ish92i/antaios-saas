import { ConflictResolutionDialog } from "./ConflictResolutionDialog"
import { TracesCredentialsModal } from "./TracesCredentialsModal"
import { useQuery } from "convex/react"
import { api } from "@cvx/_generated/api"
import { ShipmentTimeline, getTimelineStep } from "./ShipmentTimeline"
import { ExtractedDataGrid } from "./ExtractedDataGrid"
import { DeforestationScanSection } from "./DeforestationScanSection"
import { Button } from "@/components/ui/button"
import { completenessTone } from "@/lib/shipment-ui"
import { X, Paperclip, CircleDot, ArrowRight, CheckCircle2 } from "lucide-react"
import { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useRef } from "react"
import type { Id } from "@cvx/_generated/dataModel"

const statusBadge: Record<string, { label: string }> = {
  draft: { label: "Brouillon" },
  extracting: { label: "Extraction en cours" },
  resolving: { label: "Vérification" },
  pending_scan: { label: "En attente scan" },
  scanning: { label: "Scan en cours" },
  ready: { label: "Prêt à soumettre" },
  pending_supplier: { label: "En attente fournisseur" },
  submitting: { label: "Soumission en cours" },
  submitted: { label: "Soumis" },
  error: { label: "Erreur" },
}

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
        const d = s.extractedData as Record<string, unknown> | undefined
        const hasGeoJson = !!d?.geoJson
        const hasResult = !!s.scanResult
        const recentlyRun = !!s.scanRunAt && Date.now() - s.scanRunAt < 60_000
        if (hasGeoJson && !hasResult && !recentlyRun) setScanTrigger((n) => n + 1)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const shipment = useQuery(api.shipments.getShipment, shipmentId ? { shipmentId: shipmentId as Id<"shipments"> } : "skip")
  const documents = useQuery(api.documents.getDocuments, shipmentId ? { shipmentId: shipmentId as Id<"shipments"> } : "skip")

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
  const data = (shipment.extractedData ?? {}) as Record<string, unknown>
  const hasExtractionData = Object.values(data).some((v) => v !== null && v !== undefined)
  const hasExtractionQuestions = Boolean(
    (shipment.pendingQuestions as unknown[] | null | undefined)?.some(
      (q) => typeof q === "object" && q !== null && "field" in (q as Record<string, unknown>),
    ),
  )
  const pendingQuestionCount = (shipment.pendingQuestions as unknown[] | null | undefined)?.filter(
    (q) => typeof q === "object" && q !== null && "field" in (q as Record<string, unknown>),
  ).length ?? 0
  const showExtractionPanel = hasExtractionData || hasExtractionQuestions || shipment.status === "extracting" || shipment.status === "resolving"
  const docCount = documents?.length ?? 0
  const statusCfg = statusBadge[shipment.status as string] ?? statusBadge.draft

  const formatDate = (ts?: number | null) => {
    if (!ts) return ""
    return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(ts)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between px-4 pt-4 pb-1">
        <div>
          <p className="text-xs text-muted-foreground m-0 mb-0.5">{(data?.operatorName as string) ?? shipment.internalRef ?? shipment._id}</p>
          <h2 className="text-xl font-semibold text-foreground m-0 leading-tight">{(data?.commodityName as string) ?? "Raw Cocoa Beans"}</h2>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center shrink-0 rounded-md hover:bg-muted transition-colors" aria-label="Fermer">
          <X className="size-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-1.5 mt-3.5 mb-5 px-4">
        <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent-foreground bg-accent px-2.5 py-1 rounded-md">
          <CircleDot className="size-3.5" />
          {statusCfg.label}
        </span>
        <span className="text-[13px] text-muted-foreground">·</span>
        <span className="text-[13px] text-muted-foreground">{formatDate(shipment._creationTime)}</span>
      </div>

      <div className="px-4 mb-6">
        <ShipmentTimeline currentStep={timelineStep} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-5">
          <DeforestationScanSection
            shipmentId={shipmentId}
            scanResult={shipment.scanResult}
            geoJson={data?.geoJson}
            scanRunAt={shipment.scanRunAt}
            triggerScan={scanTrigger}
          />

          {showExtractionPanel && (
            <>
              {(shipment.status === "extracting" || shipment.status === "resolving") && !hasExtractionData ? (
                <div className="rounded-xl border border-border bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary shrink-0" />
                    <span>Extraction en cours, les données vont apparaître dès que les documents auront été traités.</span>
                  </div>
                </div>
              ) : (
                <ExtractedDataGrid
                  extractedData={data}
                  pendingQuestions={shipment.pendingQuestions as unknown[] | null | undefined}
                  shipmentId={shipmentId}
                />
              )}
            </>
          )}
        </div>
      </div>

      <div className="border-t border-border px-4 py-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Paperclip className="size-3.5" />
          {docCount} fichier{docCount !== 1 ? "s" : ""} extrait{docCount !== 1 ? "s" : ""}
        </span>
        {isSubmitted ? (
          <span className="flex items-center gap-1.5 text-sm text-green-600">
            <CheckCircle2 className="size-4" />
            Envoi soumis
          </span>
        ) : (
          <div className="flex items-center gap-2">
            {pendingQuestionCount > 0 && (
              <button
                onClick={() => setIsConflictOpen(true)}
                className="text-sm inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-yellow-600/40 text-yellow-600 hover:bg-yellow-50 transition-colors"
              >
                <kbd className="text-[11px] leading-none px-1 py-px rounded border border-yellow-600/40">R</kbd>
                Résoudre
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-semibold px-1">
                  {pendingQuestionCount}
                </span>
              </button>
            )}
            {isReadyToSubmit && (
              <Button size="sm" onClick={() => setIsTracesOpen(true)}>
                Soumettre <ArrowRight className="size-3.5 ml-1" />
              </Button>
            )}
          </div>
        )}
      </div>

      <ConflictResolutionDialog
        open={isConflictOpen}
        onOpenChange={setIsConflictOpen}
        shipment={shipment as never}
      />

      <TracesCredentialsModal
        open={isTracesOpen}
        onOpenChange={setIsTracesOpen}
        shipmentId={shipmentId}
      />
    </div>
  )
})
