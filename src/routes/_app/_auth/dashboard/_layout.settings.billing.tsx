import { useAction, useQuery } from "convex/react";
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
      <div className="flex h-full w-full items-center justify-center bg-secondary px-6 dark:bg-black">
        <section className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm dark:bg-black">
          <h1 className="text-xl font-semibold text-primary">Loading billing</h1>
          <p className="mt-2 text-sm text-primary/60">
            Fetching your account data.
          </p>
        </section>
      </div>
    );
  }

  const isSubscribed = user.subscription?.status === "active";

  return (
    <div className="flex h-full w-full flex-col gap-6">
      {/* Plan */}
      <div className="flex w-full flex-col items-start rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-2 p-6">
          <h2 className="text-xl font-medium text-primary">Plan</h2>
          <p className="flex items-start gap-1 text-sm font-normal text-primary/60">
            You are currently on the{" "}
            <span className="flex h-[18px] items-center rounded-md bg-primary/10 px-1.5 text-sm font-medium text-primary/80">
              {user.subscription ? user.subscription.planName ?? "Direct" : "No plan"}
            </span>
            {user.subscription && (user.subscription.status === "canceled" || user.subscription.status === "expired") && (
              <span className="flex h-[18px] items-center text-sm font-medium text-red-500">
                {" "}({user.subscription.status})
              </span>
            )}
          </p>
        </div>

        {!isSubscribed && (
          <div className="flex w-full flex-col items-center justify-evenly gap-2 border-border p-6 pt-0">
            <div
              tabIndex={0}
              className="flex w-full select-none items-center rounded-md border border-border hover:border-primary/60"
            >
              <div className="flex w-full flex-col items-start p-4">
                <div className="flex items-center gap-2">
                  <span className="text-base font-medium text-primary">
                    Direct
                  </span>
                </div>
                <p className="text-start text-sm font-normal text-primary/60">
                  Access to all features.
                </p>
              </div>
            </div>
          </div>
        )}

        {isSubscribed && (
          <div className="flex w-full flex-col items-center justify-evenly gap-2 border-border p-6 pt-0">
            <div className="flex w-full items-center overflow-hidden rounded-md border border-primary/60">
              <div className="flex w-full flex-col items-start p-4">
                <div className="flex items-end gap-2">
                  <span className="text-base font-medium text-primary">
                    Direct
                  </span>
                </div>
                <p className="text-start text-sm font-normal text-primary/60">
                  Access to all features.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex min-h-14 w-full items-center justify-between rounded-lg rounded-t-none border-t border-border bg-secondary px-6 py-3 dark:bg-card">
          <p className="text-sm font-normal text-primary/60">
            {isSubscribed
              ? "Manage your subscription via the customer portal."
              : "Purchase the Direct plan to unlock all features."}
          </p>
          {!isSubscribed && (
            <Button type="submit" size="sm" onClick={handlePurchase}>
              Purchase Direct
            </Button>
          )}
        </div>
      </div>

      {/* Manage Subscription */}
      {isSubscribed && (
        <div className="flex w-full flex-col items-start rounded-lg border border-border bg-card">
          <div className="flex flex-col gap-2 p-6">
            <h2 className="text-xl font-medium text-primary">
              Manage Subscription
            </h2>
            <p className="flex items-start gap-1 text-sm font-normal text-primary/60">
              Update your payment method, billing address, and more.
            </p>
          </div>

          <div className="flex min-h-14 w-full items-center justify-between rounded-lg rounded-t-none border-t border-border bg-secondary px-6 py-3 dark:bg-card">
            <p className="text-sm font-normal text-primary/60">
              You will be redirected to the Dodo Payments Customer Portal.
            </p>
            <Button type="submit" size="sm" onClick={handleManageSubscription}>
              Manage
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
