import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { Navigation } from "./-ui.navigation";

import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";
import { Button } from "@/components/ui/button";
import { PaywallOverlay } from "@/components/paywall/PaywallOverlay";

const EXEMPT_ROUTES = [
  "/dashboard/settings/billing",
  "/dashboard/checkout",
];

export const Route = createFileRoute("/_app/_auth/dashboard/_layout")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const location = useLocation();
  const isExempt = EXEMPT_ROUTES.some((r) => location.pathname.startsWith(r));

  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(convexQuery(api.app.getCurrentUser, {}));

  const { data: shipmentCount = 0 } = useQuery(
    convexQuery(api.shipments.getShipmentCount, {}),
  );

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-secondary px-6">
        <section className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-primary">Loading dashboard</h1>
          <p className="mt-2 text-sm text-primary/60">
            Fetching your workspace data.
          </p>
        </section>
      </main>
    );
  }

  if (isError || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-secondary px-6">
        <section className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-primary">
            Dashboard unavailable
          </h1>
          <p className="mt-2 text-sm text-primary/60">
            {isError
              ? error instanceof Error
                ? error.message
                : "An unexpected error occurred while loading your account."
              : "Your account record is not ready yet."}
          </p>
          <div className="mt-4">
            <Button onClick={() => void refetch()}>Try again</Button>
          </div>
        </section>
      </main>
    );
  }
  const isSubscribed = user.subscription?.status === "active";
  const showPaywall = !isSubscribed && shipmentCount >= 1 && !isExempt;

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-secondary">
      <Navigation user={user} />
      {showPaywall ? (
        <div className="relative flex flex-1">
          <div className="absolute inset-0 overflow-hidden blur-sm opacity-30 pointer-events-none">
            <Outlet />
          </div>
          <PaywallOverlay />
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  );
}
