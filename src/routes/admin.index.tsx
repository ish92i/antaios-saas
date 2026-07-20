import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";
import { getAdminSecret } from "@/routes/admin";
import { Users, Building2, CreditCard, Package, Activity } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
  beforeLoad: () => ({
    title: "Antaios — Admin Dashboard",
  }),
});

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold text-card-foreground">{value}</p>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const secret = getAdminSecret()!;
  const { data: stats, isLoading } = useQuery(
    convexQuery(api.admin.getStats, { adminSecret: secret }),
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return <p className="text-sm text-destructive">Failed to load stats.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} />
        <StatCard icon={Building2} label="Organizations" value={stats.totalOrgs} />
        <StatCard icon={Package} label="Shipments" value={stats.totalShipments} />
        <StatCard icon={CreditCard} label="Subscriptions" value={stats.totalSubscriptions} />
        <StatCard icon={Activity} label="Active Subscriptions" value={stats.activeSubscriptions} />
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-medium text-card-foreground">Shipments by Status</h2>
        {Object.keys(stats.shipmentsByStatus).length === 0 ? (
          <p className="text-sm text-muted-foreground">No shipments yet.</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(stats.shipmentsByStatus).map(([status, count]) => {
              const maxCount = Math.max(...Object.values(stats.shipmentsByStatus));
              const pct = maxCount > 0 ? ((count as number) / maxCount) * 100 : 0;
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className="w-32 text-sm capitalize text-muted-foreground">
                    {status.replace(/_/g, " ")}
                  </span>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-8 text-right text-sm font-medium text-card-foreground">
                    {count as number}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
