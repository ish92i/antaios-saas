import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/button-util";
import { Logo } from "@/components/logo";
import { Route as DashboardRoute } from "@/routes/_app/_auth/dashboard/_layout.index";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";
export const Route = createFileRoute("/_app/_auth/dashboard/_layout/checkout")({
  component: DashboardCheckout,
  beforeLoad: () => ({
    title: "Antaios - Checkout",
  }),
});

export default function DashboardCheckout() {
  const journey = useJourneyTracking();

  useEffect(() => {
    journey.trackCheckoutReturned();
  }, [journey]);
  return (
    <div className="flex h-full w-full bg-secondary px-6 py-8">
      <div className="z-10 mx-auto flex h-full w-full max-w-screen-xl gap-12">
        <div className="flex w-full flex-col rounded-lg border border-border bg-card">
          <div className="relative mx-auto flex w-full flex-col items-center p-6">
            <div className="relative flex w-full flex-col items-center justify-center gap-6 overflow-hidden rounded-lg border border-border bg-secondary px-6 py-24">
              <div className="z-10 flex flex-col items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/20 bg-card p-4">
                  <Logo className="h-12 w-12 animate-pulse" />
                </div>
              </div>
              <div className="z-10 flex items-center justify-center">
                <Link
                  to={DashboardRoute.fullPath}
                  className={`${buttonVariants({ variant: "ghost", size: "sm" })} gap-2`}
                >
                  <span className="text-sm font-medium text-primary/60 group-hover:text-primary">
                    Return to Dashboard
                  </span>
                  <ExternalLink className="h-4 w-4 stroke-[1.5px] text-primary/60 group-hover:text-primary" />
                </Link>
              </div>
              <div className="base-grid absolute h-full w-full opacity-40" />
              <div className="absolute bottom-0 h-full w-full bg-gradient-to-t from-[hsl(var(--card))] to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
