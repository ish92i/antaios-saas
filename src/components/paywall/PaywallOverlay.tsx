import { useAction } from "convex/react"
import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { Check, Globe, Loader2, Scan, Ship } from "lucide-react"

import { api } from "@cvx/_generated/api"

import { Button } from "@/components/ui/button"
import { useJourneyTracking } from "@/hooks/use-journey-tracking"

const features = [
  { icon: Ship, label: "Unlimited shipments" },
  { icon: Scan, label: "Deforestation scanning" },
  { icon: Globe, label: "EUDR compliance tracking" },
]

const withoutPoints = ["Manual tracking", "Compliance risk", "Time lost per shipment"]

const withPoints = ["Automated scanning", "EUDR workflow", "Unlimited shipments"]

const manualCost = "~€19,200/yr"
const directCost = "€500/month"

export function PaywallOverlay() {
  const createCheckout = useAction(api.payments.createCheckoutSession)
  const [isLoading, setIsLoading] = useState(false)
  const journey = useJourneyTracking()

  useEffect(() => {
    journey.trackPaywallEncountered()
  }, [journey])

  const handlePurchase = async () => {
    journey.trackCheckoutInitiated("direct", 500)
    setIsLoading(true)
    try {
      const { checkoutUrl } = await createCheckout({})
      if (checkoutUrl) window.location.href = checkoutUrl
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 p-4 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto w-full max-w-4xl"
      >
        <div className="rounded-2xl border border-border/80 bg-card px-5 py-6 shadow-2xl shadow-black/10 sm:px-6 sm:py-7">
          <div className="space-y-5">
            <div className="space-y-3">
              <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Unlock unlimited compliant shipments
              </h2>
              <p className="max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
                Keep shipping without manual checks or compliance guesswork.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:border-r sm:border-border/70 sm:pr-4">
                <p className="text-sm font-semibold text-muted-foreground">
                  Without Antaios
                </p>
                <ul className="mt-3 space-y-2">
                  {withoutPoints.map((point) => (
                    <li key={point} className="flex items-center gap-2 text-base text-muted-foreground">
                      <span className="size-1.5 rounded-full bg-muted-foreground/50" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-base text-muted-foreground/60">
                  {manualCost}
                </p>
              </div>

              <div className="sm:pl-4">
                <p className="text-sm font-semibold text-primary">
                  With Antaios
                </p>
                <ul className="mt-3 space-y-2">
                  {withPoints.map((point) => (
                    <li key={point} className="flex items-center gap-2 text-base text-foreground">
                      <Check className="size-4 shrink-0 text-primary" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-base font-semibold text-foreground">
                  {directCost}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {features.map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-2 rounded-full border border-border bg-muted/20 px-3 py-2"
                >
                  <f.icon className="size-4 shrink-0 text-primary" />
                  <span className="text-sm text-foreground">{f.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-end gap-1">
                <span className="text-4xl font-semibold tracking-tight text-foreground">
                  €500
                </span>
                <span className="pb-1 text-sm text-muted-foreground">
                  /month
                </span>
              </div>

              <Button
                className="flex h-11 w-full items-center justify-center gap-2 text-sm font-medium sm:w-auto sm:px-6"
                onClick={handlePurchase}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Unlock Antaios"
                )}
              </Button>
            </div>


          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
