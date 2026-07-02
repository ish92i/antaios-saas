import { fieldGroups, displayValue } from "@/lib/shipment-ui"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

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

        return (
          <div key={group.title}>
            <h5 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {group.title}
            </h5>
            <div className="divide-y divide-border rounded-md border border-border">
              {group.fields.map((field) => {
                const value = data[field.key]
                const isMissing = value === null || value === undefined
                const hasPendingQuestion = questions.some(
                  (q) => q.field === field.key,
                )

                return (
                  <div key={field.key} className="flex items-center justify-between px-3 py-2 text-sm">
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
                      ) : (
                        <span className="font-medium text-foreground">
                          {displayValue(value)}
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
