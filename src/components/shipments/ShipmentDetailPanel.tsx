import { ConflictResolutionDialog } from "./ConflictResolutionDialog"
import { TracesCredentialsModal } from "./TracesCredentialsModal"
import { RiskPdfDialog } from "./RiskPdfDialog"
import { useQuery } from "convex/react"
import { api } from "@cvx/_generated/api"
import { ShipmentTimeline, getTimelineStep } from "./ShipmentTimeline"
import { DocumentList } from "./DocumentList"
import { ExtractedDataGrid } from "./ExtractedDataGrid"
import { DeforestationScanSection } from "./DeforestationScanSection"
import { Button } from "@/components/ui/button"
import { completenessTone } from "@/lib/shipment-ui"
import { FileText, CheckCircle2, X, ChevronRight } from "lucide-react"
import { useState } from "react"
import type { Id } from "@cvx/_generated/dataModel"

export function ShipmentDetailPanel({
  shipmentId,
  onClose,
}: {
  shipmentId?: string
  onClose: () => void
}) {
  const [isConflictOpen, setIsConflictOpen] = useState(false)
  const [isTracesOpen, setIsTracesOpen] = useState(false)
  const [isRiskPdfOpen, setIsRiskPdfOpen] = useState(false)

  const shipment = useQuery(
    api.shipments.getShipment,
    shipmentId ? { shipmentId: shipmentId as Id<"shipments"> } : "skip",
  )

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
          <ShipmentTimeline currentStep={timelineStep} />

          <section>
            <h3 className="mb-2 text-sm font-medium text-foreground">Documents</h3>
            <DocumentList shipmentId={shipmentId} />
          </section>

          <section>
            <h3 className="mb-2 text-sm font-medium text-foreground">Données extraites</h3>
            <ExtractedDataGrid
              extractedData={shipment.extractedData as Record<string, unknown> | undefined | null}
              pendingQuestions={shipment.pendingQuestions as unknown[] | null | undefined}
              onResolve={() => setIsConflictOpen(true)}
            />
          </section>

          <section>
            <DeforestationScanSection
              shipmentId={shipmentId}
              scanResult={shipment.scanResult}
              geoJson={(shipment.extractedData as Record<string, unknown> | undefined)?.geoJson}
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
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsTracesOpen(true)}
              disabled={tone === "red" || tone === "yellow"}
            >
              <FileText className="h-4 w-4" />
              DDS
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsRiskPdfOpen(true)}
              disabled={tone === "red" || tone === "yellow"}
            >
              <FileText className="h-4 w-4" />
              PDF Risque
            </Button>
            {tone === "green" && (
              <Button size="sm" className="ml-auto">
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

      <RiskPdfDialog
        open={isRiskPdfOpen}
        onOpenChange={setIsRiskPdfOpen}
        shipmentId={shipmentId}
      />
    </div>
  )
}
