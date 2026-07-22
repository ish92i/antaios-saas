import { createFileRoute, Outlet, useRouter, useLocation } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutDashboard, Users, Building2, CreditCard, Package, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_STORAGE_KEY = "antaios:admin_secret";

export function getAdminSecret(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ADMIN_STORAGE_KEY);
}

export function setAdminSecret(secret: string): void {
  sessionStorage.setItem(ADMIN_STORAGE_KEY, secret);
}

export function clearAdminSecret(): void {
  sessionStorage.removeItem(ADMIN_STORAGE_KEY);
}

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  beforeLoad: () => ({
    title: "Antaios — Admin",
  }),
});

const NAV_ITEMS = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/organizations", label: "Organizations", icon: Building2 },
  { to: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { to: "/admin/shipments", label: "Shipments", icon: Package },
];

function AdminLayout() {
  const router = useRouter();
  const location = useLocation();
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const secret = getAdminSecret();
    if (secret) {
      setAuthed(true);
    } else {
      setAuthed(false);
    }
    setChecked(true);
  }, [location.pathname]);

  useEffect(() => {
    if (checked && !authed && location.pathname !== "/admin/login") {
      router.navigate({ to: "/admin/login", replace: true });
    }
  }, [checked, authed, location.pathname, router]);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Shield className="h-8 w-8 animate-pulse text-muted-foreground" />
      </div>
    );
  }

  if (!authed && location.pathname !== "/admin/login") {
    return null;
  }

  const isLoginPage = location.pathname === "/admin/login";

  if (isLoginPage) {
    return <Outlet />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="flex w-64 flex-col border-r border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-6 py-4">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold text-card-foreground">Admin Panel</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to) && (item.to === "/admin" || location.pathname !== "/admin");
            return (
              <Link
                key={item.to}
                to={item.to as string}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <button
            onClick={() => {
              clearAdminSecret();
              router.navigate({ to: "/admin/login", replace: true });
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
