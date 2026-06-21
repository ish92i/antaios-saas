import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Navigation } from "./-ui.navigation";
import { Header } from "@/components/header";
import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/_auth/dashboard/_layout")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const routeContext = Route.useRouteContext();
  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(convexQuery(api.app.getCurrentUser, {}));

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-secondary px-6 dark:bg-black">
        <section className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm dark:bg-black">
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
      <main className="flex min-h-screen items-center justify-center bg-secondary px-6 dark:bg-black">
        <section className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm dark:bg-black">
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
  return (
    <div className="flex min-h-[100vh] w-full flex-col bg-secondary dark:bg-black">
      <Navigation user={user} />
      <Header
        title={routeContext.headerTitle}
        description={routeContext.headerDescription}
      />
      <Outlet />
    </div>
  );
}
