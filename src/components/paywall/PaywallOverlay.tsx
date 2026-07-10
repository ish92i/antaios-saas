import { useAction } from "convex/react"
import { Loader2, Sparkles, Ship, Scan, FileText, Globe } from "lucide-react"
import { api } from "@cvx/_generated/api"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const features = [
  { icon: Ship, label: "Unlimited shipments" },
  { icon: Scan, label: "Deforestation scanning" },
  { icon: FileText, label: "Risk assessment reports" },
  { icon: Globe, label: "EUDR compliance tracking" },
]

export function PaywallOverlay() {
  const createCheckout = useAction(api.payments.createCheckoutSession)
  const [isLoading, setIsLoading] = useState(false)

  const handlePurchase = async () => {
    setIsLoading(true)
    try {
      const { checkoutUrl } = await createCheckout({})
      if (checkoutUrl) window.location.href = checkoutUrl
    } catch {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-lg">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Upgrade to Direct
            </h2>
            <p className="text-sm text-muted-foreground">
              You've used your free shipment. Unlock full access to all EUDR compliance tools.
            </p>
          </div>

          <div className="w-full space-y-2 rounded-xl bg-muted/50 p-4">
            {features.map((f) => (
              <div key={f.label} className="flex items-center gap-3 text-sm">
                <f.icon className="h-4 w-4 text-primary" />
                <span className="text-foreground">{f.label}</span>
              </div>
            ))}
          </div>

          <div className="w-full space-y-1">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              €500
            </span>
            <span className="text-sm text-muted-foreground"> /month — Cancel anytime</span>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handlePurchase}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Purchase Direct"
            )}
          </Button>

          <p className="text-xs text-muted-foreground">
            Already subscribed?{" "}
            <button
              type="button"
              className="underline hover:text-primary"
              onClick={() => window.location.reload()}
            >
              Refresh to check
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
