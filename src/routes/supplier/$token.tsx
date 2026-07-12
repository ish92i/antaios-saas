import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { api } from "@cvx/_generated/api"
import { SupplierQuestionStepper } from "@/components/supplier/SupplierQuestionStepper"
import { Loader2, AlertTriangle } from "lucide-react"
import { Helmet } from "react-helmet-async"
import type { BilingualLabel } from "@/lib/i18n-utils"

export const Route = createFileRoute("/supplier/$token")({
  component: SupplierPage,
})

function SupplierPage() {
  const { token } = Route.useParams()
  const shipment = useQuery(api.shipments.getShipmentBySupplierToken, {
    token,
  })

  if (shipment === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }

  if (!shipment) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="h-10 w-10 text-yellow-500" />
          <h1 className="text-lg font-semibold text-foreground">Lien invalide</h1>
          <p className="text-sm text-muted-foreground">
            Ce lien n'est pas valide ou a expiré. Contactez votre opérateur pour obtenir un nouveau lien.
          </p>
        </div>
      </main>
    )
  }

  const alreadyDone = shipment.status === "submitted" || shipment.supplierFormCompleted

  if (alreadyDone) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <Helmet>
          <title>Questions fournisseur — Antaios</title>
        </Helmet>
        <div className="w-full max-w-lg rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-foreground">Questionnaire déjà complété</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Les informations ont déjà été transmises à votre opérateur. Merci de votre participation.
          </p>
        </div>
      </main>
    )
  }

  const pendingQuestions = (shipment.pendingQuestions ?? []) as {
    id: string
    field: string
    label: string | BilingualLabel
    type: string
  }[]

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Helmet>
        <title>Questions fournisseur — Antaios</title>
      </Helmet>
      <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-foreground">
            Questions concernant votre envoi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Votre opérateur vous a sollicité pour compléter les informations suivantes.
          </p>
        </div>

        <SupplierQuestionStepper
          token={token}
          questions={pendingQuestions}
        />
      </div>
    </main>
  )
}
