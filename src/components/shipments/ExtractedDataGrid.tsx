import { fieldGroups, displayValue, countryName } from "@/lib/shipment-ui"
import {
  AlertTriangle,
  Building2,
  Truck,
  Package,
  MapPin,
  Award,
  Map,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GeoJsonPreview, type GeoJsonInput } from "./GeoJsonPreview"

const groupIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Opérateur: Building2,
  Fournisseur: Truck,
  Marchandise: Package,
  Géographie: MapPin,
  Certifications: Award,
  Géolocalisation: Map,
}

export function ExtractedDataGrid({
  extractedData,
  pendingQuestions,
  onResolve,
}: {
  extractedData?: Record<string, unknown> | null
  pendingQuestions?: unknown[] | null
  onResolve: () => void
}) {
  const data = extractedData ?? {}
  const questions = (pendingQuestions ?? []).filter(
    (q: unknown) => typeof q === "object" && q !== null && "field" in (q as Record<string, unknown>),
  ) as Array<Record<string, unknown>>
  const hasQuestions = questions.length > 0
  const hasAnyData = fieldGroups.some((group) =>
    group.fields.some((f) => data[f.key] !== null && data[f.key] !== undefined),
  )

  if (!hasAnyData && !hasQuestions) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
        Aucune donnée extraite pour le moment.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">Données extraites</h4>
        {hasQuestions && (
          <Button variant="outline" size="xs" onClick={onResolve}>
            <AlertTriangle className="h-3.5 w-3.5 text-yellow-600" />
            Résoudre ({questions.length})
          </Button>
        )}
      </div>

      {fieldGroups.map((group) => {
        const hasData = group.fields.some((f) => data[f.key] !== null && data[f.key] !== undefined)
        if (!hasData && !hasQuestions) return null

        const GroupIcon = groupIcons[group.title]

        return (
          <div
            key={group.title}
            className="overflow-hidden rounded-lg border bg-card shadow-sm"
          >
            <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
              {GroupIcon && <GroupIcon className="h-3.5 w-3.5 text-muted-foreground" />}
              <h5 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.title}
              </h5>
            </div>
            <div className="divide-y divide-border">
              {group.fields.map((field) => {
                const value = data[field.key]
                const isMissing = value === null || value === undefined
                const hasPendingQuestion = questions.some(
                  (q) => q.field === field.key,
                )

                const display =
                  !isMissing && field.key === "countryOfProduction"
                    ? countryName(String(value))
                    : displayValue(value)

                return (
                  <div key={field.key} className="flex items-center justify-between px-3 py-1.5 text-sm">
                    <span className="text-muted-foreground">{field.label}</span>
                    <div className="flex items-center gap-2">
                      {isMissing ? (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          {hasPendingQuestion ? (
                            <>
                              <AlertTriangle className="h-3.5 w-3.5 text-yellow-600" />
                              <span className="text-yellow-700">A résoudre</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </span>
                      ) : field.key === "geoJson" && typeof value === "object" && value !== null && !Array.isArray(value) ? (
                        <GeoJsonPreview geoJson={value as unknown as GeoJsonInput} />
                      ) : (
                        <span className="font-medium text-foreground">
                          {display}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
