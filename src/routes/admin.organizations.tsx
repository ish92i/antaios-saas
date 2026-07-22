import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";
import { getAdminSecret } from "@/routes/admin";
import { Building2, Package, CreditCard } from "lucide-react";

export const Route = createFileRoute("/admin/organizations")({
  component: AdminOrganizationsPage,
  beforeLoad: () => ({
    title: "Antaios — Admin Organizations",
  }),
});

function AdminOrganizationsPage() {
  const secret = getAdminSecret();
  if (!secret) return null;
  const { data: orgs, isLoading } = useQuery(
    convexQuery(api.admin.listOrganizations, { adminSecret: secret }),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Organizations</h1>
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
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Slug</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Shipments</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
              </tr>
            </thead>
            <tbody>
              {orgs?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No organizations found.
                  </td>
                </tr>
              ) : (
                orgs?.map((org) => (
                  <tr key={org._id} className="border-b border-border last:border-b-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {org.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{org.slug || "—"}</td>
                    <td className="px-4 py-3">
                      {org.subscription ? (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <CreditCard className="h-3 w-3" />
                          {org.subscription.planName || "—"}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Package className="h-3 w-3" />
                        {org.shipmentCount ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(org._creationTime).toLocaleDateString()}
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
