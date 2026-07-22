import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";
import { getAdminSecret } from "@/routes/admin";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/subscriptions")({
  component: AdminSubscriptionsPage,
  beforeLoad: () => ({
    title: "Antaios — Admin Subscriptions",
  }),
});

const STATUS_COLORS: Record<string, string> = {
  active: "text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400",
  canceled: "text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400",
  past_due: "text-orange-600 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-400",
  expired: "text-gray-600 bg-gray-50 dark:bg-gray-950/30 dark:text-gray-400",
};

function AdminSubscriptionsPage() {
  const secret = getAdminSecret();
  if (!secret) return null;
  const { data: subscriptions, isLoading } = useQuery(
    convexQuery(api.admin.listSubscriptions, { adminSecret: secret }),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Subscriptions</h1>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Org</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Dodo ID</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No subscriptions found.
                  </td>
                </tr>
              ) : (
                subscriptions?.map((sub) => (
                  <tr key={sub._id} className="border-b border-border last:border-b-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">{sub.orgName || sub.orgId}</td>
                    <td className="px-4 py-3 text-muted-foreground">{sub.planName || "—"}</td>
                    <td className="px-4 py-3">
                      {sub.status ? (
                        <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_COLORS[sub.status] || "bg-muted text-muted-foreground")}>
                          {sub.status}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      {sub.dodoSubscriptionId ? sub.dodoSubscriptionId.slice(0, 16) + "…" : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{sub.email || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(sub._creationTime).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
