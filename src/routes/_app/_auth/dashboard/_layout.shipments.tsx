import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { convexQuery } from "@convex-dev/react-query"
import { api } from "@cvx/_generated/api"
import { useState, useCallback } from "react"
import { ShipmentList } from "@/components/shipments/ShipmentList"
import { ShipmentDetailPanel } from "@/components/shipments/ShipmentDetailPanel"
import { CreateShipmentPanel } from "@/components/shipments/CreateShipmentPanel"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

type ViewState =
  | { mode: "idle" }
  | { mode: "create" }
  | { mode: "detail"; id: string }

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
  const [view, setView] = useState<ViewState>({ mode: "idle" })
  const isMobile = useMediaQuery("(max-width: 767px)")
  const showDetail = view.mode !== "idle"

  const handleSelect = useCallback((id: string) => {
    setView((prev) =>
      prev.mode === "detail" && prev.id === id
        ? { mode: "idle" }
        : { mode: "detail", id },
    )
  }, [])

  const handleBack = useCallback(() => {
    setView({ mode: "idle" })
  }, [])

  const handleCreated = useCallback((id: string) => {
    setView({ mode: "detail", id })
  }, [])

  return (
    <div className="flex h-[calc(100vh-10rem)] overflow-hidden">
      {(!isMobile || !showDetail) && (
        <div className="flex w-full flex-col overflow-y-auto border-r border-border md:w-96 md:min-w-96">
          <ShipmentList
            shipments={shipments}
            isLoading={isLoading}
            selectedId={view.mode === "detail" ? view.id : undefined}
            onSelect={handleSelect}
            onCreate={() => setView({ mode: "create" })}
          />
        </div>
      )}
      {view.mode === "detail" && (
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
            shipmentId={view.id}
            onClose={handleBack}
          />
        </div>
      )}
      {view.mode === "create" && (
        <div className="flex flex-1 flex-col overflow-hidden h-full">
          {isMobile && (
            <div className="flex items-center border-b border-border px-4 py-2">
              <Button variant="ghost" size="sm" onClick={() => setView({ mode: "idle" })}>
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
            </div>
          )}
          <CreateShipmentPanel
            onCreated={handleCreated}
            onCancel={() => setView({ mode: "idle" })}
          />
        </div>
      )}
      {view.mode === "idle" && !isMobile && (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Sélectionnez un envoi pour voir les détails
        </div>
      )}
    </div>
  )
}
