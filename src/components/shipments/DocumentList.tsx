import { useMutation, useQuery } from "convex/react"
import { api } from "@cvx/_generated/api"
import { cn } from "@/lib/utils"
import { FileText, RefreshCw, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Id } from "@cvx/_generated/dataModel"

const extractionStatusConfig: Record<string, { icon: typeof FileText; label: string; className: string }> = {
  pending: { icon: Clock, label: "En attente", className: "text-muted-foreground" },
  processing: { icon: Clock, label: "Extraction en cours", className: "text-primary" },
  done: { icon: CheckCircle2, label: "Extrait", className: "text-green-600" },
  failed: { icon: AlertCircle, label: "Échec", className: "text-destructive" },
}

export function DocumentList({
  shipmentId,
}: {
  shipmentId: string
}) {
  const documents = useQuery(api.documents.getDocuments, {
    shipmentId: shipmentId as Id<"shipments">,
  })
  const retryDocument = useMutation(api.documents.retryDocument)

  if (!documents) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Aucun document importé</p>
    )
  }

  return (
    <div className="space-y-1">
      {documents.map((doc) => {
        const cfg = extractionStatusConfig[doc.extractionStatus] ?? extractionStatusConfig.pending
        const Icon = cfg.icon
        return (
          <div
            key={doc._id}
            className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
          >
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">{doc.fileName}</span>
            <span className={cn("flex items-center gap-1 text-xs", cfg.className)}>
              <Icon className="h-3.5 w-3.5" />
              {cfg.label}
            </span>
            {doc.extractionStatus === "failed" && (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => retryDocument({ documentId: doc._id as Id<"shipmentDocuments"> })}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Réessayer
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
