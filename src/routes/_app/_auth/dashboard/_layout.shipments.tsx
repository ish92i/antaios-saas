import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { convexQuery } from "@convex-dev/react-query"
import { api } from "@cvx/_generated/api"
import { useState, useCallback, useEffect } from "react"
import { ShipmentList } from "@/components/shipments/ShipmentList"
import { ShipmentDetailPanel } from "@/components/shipments/ShipmentDetailPanel"
import { CreateShipmentPanel } from "@/components/shipments/CreateShipmentPanel"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Search, Plus } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

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
  const [isCommandOpen, setIsCommandOpen] = useState(false)
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsCommandOpen(true)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const handleCommandSelect = useCallback((id: string) => {
    handleSelect(id)
    setIsCommandOpen(false)
  }, [handleSelect])

  const handleCommandCreate = useCallback(() => {
    setView({ mode: "create" })
    setIsCommandOpen(false)
  }, [])

  return (
    <div className="flex flex-1 overflow-hidden">
      {(!isMobile || !showDetail) && (
        <div className="flex w-full flex-col overflow-y-auto border-r border-border md:w-96 md:min-w-96">
          <ShipmentList
            shipments={shipments}
            isLoading={isLoading}
            selectedId={view.mode === "detail" ? view.id : undefined}
            onSelect={handleSelect}
            onCreate={() => setView({ mode: "create" })}
            onOpenCommand={() => setIsCommandOpen(true)}
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
        <div className="flex flex-1 flex-col overflow-hidden">
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

      <Dialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
          <DialogTitle className="sr-only">Recherche d'envois</DialogTitle>
          <DialogDescription className="sr-only">
            Recherchez des envois par fournisseur, référence ou marchandise
          </DialogDescription>
          <Command
            onKeyDown={(e) => {
              if (e.key >= "1" && e.key <= "9") {
                e.preventDefault()
                const idx = parseInt(e.key) - 1
                const items = e.currentTarget.querySelectorAll('[cmdk-item]')
                ;(items[idx] as HTMLElement)?.click()
              }
            }}
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
          >
            <CommandInput placeholder="Rechercher un envoi, fournisseur, référence..." />
            <CommandList>
              <CommandEmpty>Aucun résultat.</CommandEmpty>
              {shipments && shipments.length > 0 && (
                <CommandGroup heading="Envois">
                  {shipments.map((s, i) => {
                    const data = s.extractedData as Record<string, unknown> | null | undefined
                    const label = [data?.supplier, data?.commodityName, s.internalRef].filter(Boolean).join(" · ") || s._id
                    return (
                      <CommandItem
                        key={s._id}
                        value={`${data?.supplier} ${data?.commodityName} ${s.internalRef} ${s._id}`}
                        onSelect={() => handleCommandSelect(s._id)}
                      >
                        <Search className="h-4 w-4" />
                        <span className="flex-1 truncate">{label}</span>
                        {i < 9 && <CommandShortcut>{i + 1}</CommandShortcut>}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}
              <CommandGroup heading="Actions">
                <CommandItem onSelect={handleCommandCreate}>
                  <Plus className="h-4 w-4" />
                  <span>Nouvel envoi</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </div>
  )
}
