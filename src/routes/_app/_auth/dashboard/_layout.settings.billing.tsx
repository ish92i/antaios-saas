import { useAction, useQuery } from "convex/react";
import { Sparkles, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "@cvx/_generated/api";

export const Route = createFileRoute(
  "/_app/_auth/dashboard/_layout/settings/billing",
)({
  component: BillingSettings,
  beforeLoad: () => ({
    title: "Antaios - Billing",
    headerTitle: "Billing",
    headerDescription: "Manage billing and your subscription plan.",
  }),
});

const subscriptionBadge = (status: string | undefined) => {
  switch (status) {
    case "active":
      return <Badge variant="success">Active</Badge>;
    case "canceled":
      return <Badge variant="warning">Canceled</Badge>;
    case "expired":
      return <Badge variant="destructive">Expired</Badge>;
    default:
      return null;
  }
};

export default function BillingSettings() {
  const user = useQuery(api.app.getCurrentUser);
  const createCheckout = useAction(api.payments.createCheckoutSession);
  const getPortal = useAction(api.payments.getCustomerPortal);

  const handlePurchase = async () => {
    const { checkoutUrl } = await createCheckout({});
    if (checkoutUrl) window.location.href = checkoutUrl;
  };

  const handleManageSubscription = async () => {
    const { portal_url } = await getPortal({ send_email: false });
    if (portal_url) window.location.href = portal_url;
  };

  if (!user) {
    return (
      <div className="flex h-full w-full items-center justify-center px-6">
        <section className="w-full max-w-md rounded-xl border border-border/50 bg-card p-6 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary/40" />
            <h1 className="text-sm font-medium text-muted-foreground">
              Loading billing
            </h1>
          </div>
        </section>
      </div>
    );
  }

  const isSubscribed = user.subscription?.status === "active";
  const planName = user.subscription?.planName ?? "Direct";
  const status = user.subscription?.status;

  return (
    <div className="flex h-full w-full flex-col gap-6">
      {/* Plan */}
      <section className="w-full rounded-xl border border-border/50 bg-card shadow-xs">
        <div className="flex flex-col gap-6 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-foreground">Plan</h2>
                <p className="text-xs text-muted-foreground">
                  Your current subscription
                </p>
              </div>
            </div>
            {status && subscriptionBadge(status)}
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-lg font-semibold tracking-tight text-foreground">
              {planName}
            </span>
            <p className="text-sm text-muted-foreground">
              {isSubscribed
                ? "Access to all features."
                : "Purchase the Direct plan to unlock all features."}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-b-xl border-t border-border/50 bg-muted/50 px-5 py-3">
          <p className="text-xs text-muted-foreground">
            {isSubscribed
              ? "Manage your subscription via the customer portal."
              : "You are not currently subscribed to a plan."}
          </p>
          {!isSubscribed && (
            <Button size="sm" onClick={handlePurchase}>
              Purchase Direct
            </Button>
          )}
        </div>
      </section>

      {/* Manage Subscription */}
      {isSubscribed && (
        <section className="w-full rounded-xl border border-border/50 bg-card shadow-xs">
          <div className="flex flex-col gap-6 p-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-foreground">
                  Manage Subscription
                </h2>
                <p className="text-xs text-muted-foreground">
                  Update your payment method, billing address, and more.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-b-xl border-t border-border/50 bg-muted/50 px-5 py-3">
            <p className="text-xs text-muted-foreground">
              You will be redirected to the Dodo Payments Customer Portal.
            </p>
            <Button size="sm" onClick={handleManageSubscription}>
              Manage
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
