import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { convexQuery } from "@convex-dev/react-query"
import { api } from "@cvx/_generated/api"
import { useState, useCallback } from "react"
import { ShipmentList } from "@/components/shipments/ShipmentList"
import { ShipmentDetailPanel } from "@/components/shipments/ShipmentDetailPanel"
import { NewShipmentDialog } from "@/components/shipments/NewShipmentDialog"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import {
  useMediaQuery,
} from "@/hooks/use-media-query"

export const Route = createFileRoute("/_app/_auth/dashboard/_layout/shipments")({
  component: ShipmentsPage,
  beforeLoad: () => ({
    title: "Antaios - Expéditions",
    headerTitle: "Expéditions",
    headerDescription: "Gérez vos envois et leur conformité EUDR",
  }),
})

function ShipmentsPage() {
  const { data: shipments, isLoading } = useQuery(
    convexQuery(api.shipments.listShipments, {}),
  )
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const [isNewOpen, setIsNewOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 767px)")
  const showDetail = !!selectedId

  const handleSelect = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? undefined : id))
  }, [])

  const handleBack = useCallback(() => {
    setSelectedId(undefined)
  }, [])

  const handleCreated = useCallback((id: string) => {
    setSelectedId(id)
    setIsNewOpen(false)
  }, [])

  return (
    <div className="flex h-[calc(100vh-10rem)] overflow-hidden">
      {(!isMobile || !showDetail) && (
        <div className="flex w-full flex-col overflow-y-auto border-r border-border md:w-96 md:min-w-96">
          <ShipmentList
            shipments={shipments}
            isLoading={isLoading}
            selectedId={selectedId}
            onSelect={handleSelect}
            onCreate={() => setIsNewOpen(true)}
          />
        </div>
      )}
      {showDetail && (
        <div className="flex flex-1 flex-col overflow-hidden">
          {isMobile && (
            <div className="flex items-center border-b border-border px-4 py-2">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
            </div>
          )}
          <ShipmentDetailPanel
            shipmentId={selectedId}
            onClose={handleBack}
          />
        </div>
      )}
      {!showDetail && !isMobile && (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Sélectionnez un envoi pour voir les détails
        </div>
      )}
      <NewShipmentDialog
        open={isNewOpen}
        onOpenChange={setIsNewOpen}
        onCreated={handleCreated}
      />
    </div>
  )
}
