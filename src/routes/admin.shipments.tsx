import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";
import { getAdminSecret } from "@/routes/admin";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/shipments")({
  component: AdminShipmentsPage,
  beforeLoad: () => ({
    title: "Antaios — Admin Shipments",
  }),
});

const STATUS_COLORS: Record<string, string> = {
  draft: "text-gray-600 bg-gray-50 dark:bg-gray-950/30 dark:text-gray-400",
  extracting: "text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400",
  resolving: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30 dark:text-yellow-400",
  pending_scan: "text-purple-600 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400",
  scanning: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 dark:text-indigo-400",
  ready: "text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400",
  submitting: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30 dark:text-cyan-400",
  submitted: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400",
  error: "text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400",
};

function AdminShipmentsPage() {
  const secret = getAdminSecret();
  if (!secret) return null;
  const { data: shipments, isLoading } = useQuery(
    convexQuery(api.admin.listAllShipments, { adminSecret: secret }),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">All Shipments</h1>
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
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">ID</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Org</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Completeness</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ref</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
              </tr>
            </thead>
            <tbody>
              {shipments?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No shipments found.
                  </td>
                </tr>
              ) : (
                shipments?.map((s) => (
                  <tr key={s._id} className="border-b border-border last:border-b-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {s._id.slice(0, 12)}…
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{s.orgName || s.orgId}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_COLORS[s.status] || "bg-muted text-muted-foreground")}>
                        {s.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{s.completeness || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.internalRef || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(s._creationTime).toLocaleDateString()}
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
