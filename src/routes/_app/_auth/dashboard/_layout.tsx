import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { Navigation } from "./-ui.navigation";

import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";
import { Button } from "@/components/ui/button";
import { PaywallOverlay } from "@/components/paywall/PaywallOverlay";
import { useEffect } from "react";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";

const EXEMPT_ROUTES = [
  "/dashboard/settings/billing",
  "/dashboard/checkout",
];

export const Route = createFileRoute("/_app/_auth/dashboard/_layout")({
  component: DashboardLayout,
});

export function DashboardSkeleton() {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-secondary">
      <nav className="flex w-full items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
          <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-md bg-muted" />
          <div className="h-11 w-11 animate-pulse rounded-full bg-muted" />
        </div>
      </nav>
      <div className="flex flex-1 overflow-hidden bg-secondary">
        <div className="w-96 border-r border-border">
          <div className="mx-4 my-3 h-9 animate-pulse rounded-md bg-muted" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="h-4 w-4 animate-pulse rounded bg-muted" />
              <div className="flex-1">
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 bg-secondary" />
      </div>
    </div>
  );
}

function DashboardLayout() {
  const location = useLocation();
  const isExempt = EXEMPT_ROUTES.some((r) => location.pathname.startsWith(r));
  const journey = useJourneyTracking();

  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(convexQuery(api.app.getCurrentUser, {}));

  if (isLoading) {
    return <DashboardSkeleton />;
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
  const showPaywall = !isSubscribed && !isExempt;

  useEffect(() => {
    if (isSubscribed) {
      journey.trackSubscriptionActivated(user.subscription?.planName || "direct");
    }
  }, [isSubscribed, journey, user.subscription?.planName]);

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
