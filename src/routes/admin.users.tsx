import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";
import { getAdminSecret } from "@/routes/admin";
import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
  beforeLoad: () => ({
    title: "Antaios — Admin Users",
  }),
});

const SUBSCRIPTION_COLORS: Record<string, string> = {
  active: "text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400",
  canceled: "text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400",
  pending: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30 dark:text-yellow-400",
  past_due: "text-orange-600 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-400",
};

function AdminUsersPage() {
  const secret = getAdminSecret();
  if (!secret) return null;
  const [search, setSearch] = useState("");
  const { data: users, isLoading } = useQuery(
    convexQuery(api.admin.listUsers, { adminSecret: secret, search: search || undefined }),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Users</h1>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, email, or Clerk ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full max-w-md rounded-lg border border-input bg-background py-2 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        />
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Subscription</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
              </tr>
            </thead>
            <tbody>
              {users?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              ) : (
                users?.map((u) => (
                  <tr key={u._id} className="border-b border-border last:border-b-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">{u.name || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email || "—"}</td>
                    <td className="px-4 py-3">
                      {u.subscription ? (
                        <span
                          className={cn(
                            "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
                            SUBSCRIPTION_COLORS[u.subscription.status ?? ""] || "bg-muted text-muted-foreground",
                          )}
                        >
                          {u.subscription.status || "unknown"}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.subscription?.planName || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(u._creationTime).toLocaleDateString()}
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
