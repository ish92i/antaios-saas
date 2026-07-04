import { useAuth, useClerk, CreateOrganization } from "@clerk/clerk-react";
import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";
import { useConvexAuth } from "convex/react";

export const Route = createFileRoute("/_app/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const clerk = useClerk();
  const location = useLocation();
  const {
    isLoading: isConvexAuthLoading,
    isAuthenticated: isConvexAuthenticated,
  } = useConvexAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    data: currentUser,
    isLoading: isCurrentUserLoading,
    isFetched: isCurrentUserFetched,
  } = useQuery(convexQuery(api.app.getCurrentUser, {}));
  const {
    data: currentOrg,
    isLoading: isCurrentOrgLoading,
    isFetched: isCurrentOrgFetched,
  } = useQuery(convexQuery(api.orgs.getCurrentOrg, {}));
  const userCreationRequested = useRef(false);
  const {
    mutate: createUser,
    isPending: isCreatingUser,
    isError: isCreateUserError,
    error: createUserError,
  } = useMutation({
    mutationFn: useConvexMutation(api.app.createUserIfNeeded),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: convexQuery(api.app.getCurrentUser, {}).queryKey,
      });
    },
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      if (!clerk.session) {
        navigate({ to: "/login" });
      }
      return;
    }
    if (
      currentOrg?.eoriNumber &&
      location.pathname.startsWith("/onboarding")
    ) {
      navigate({ to: "/dashboard", replace: true });
    }
    if (
      isLoaded &&
      isSignedIn &&
      isConvexAuthenticated &&
      isCurrentUserFetched &&
      isCurrentOrgFetched &&
      currentUser &&
      currentOrg &&
      !currentOrg.eoriNumber &&
      !location.pathname.startsWith("/onboarding")
    ) {
      navigate({ to: "/onboarding/organization", replace: true });
    }
    if (
      isLoaded &&
      isSignedIn &&
      isConvexAuthenticated &&
      isCurrentUserFetched &&
      !currentUser &&
      !isCreatingUser &&
      !userCreationRequested.current
    ) {
      userCreationRequested.current = true;
      createUser({});
    }
  }, [
    isLoaded,
    isSignedIn,
    clerk.session,
    isConvexAuthenticated,
    isCurrentUserFetched,
    isCurrentOrgFetched,
    currentOrg,
    currentUser,
    isCreatingUser,
    createUser,
    navigate,
    location.pathname,
  ]);

  if (isLoaded && !isSignedIn) {
    if (clerk.session) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
          <section className="mx-auto flex w-full max-w-96 flex-col items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-center text-2xl font-medium text-primary">
                Create your organization
              </h3>
              <p className="text-center text-base font-normal text-primary/60">
                Set up your organization to get started.
              </p>
            </div>
            <CreateOrganization
              afterCreateOrganizationUrl="/onboarding/organization"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none bg-transparent w-full p-0",
                  headerTitle: "text-lg font-medium text-primary",
                  headerSubtitle: "hidden",
                  formHeaderTitle: "hidden",
                  formHeaderSubtitle: "hidden",
                  socialButtonsBlockButton:
                    "w-full border border-border bg-transparent text-primary/80 hover:bg-primary/5",
                  dividerRow: "my-4",
                  dividerText: "text-xs font-medium uppercase text-primary/60",
                  formFieldLabel: "text-sm text-primary/60",
                  formFieldInput:
                    "bg-transparent border-border text-primary placeholder:text-primary/40",
                  formButtonPrimary:
                    "inline-flex items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 h-10 px-4 py-2 w-full",
                  footerActionText: "hidden",
                  footerActionLink: "hidden",
                },
              }}
            />
          </section>
        </main>
      );
    }
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <section className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-card-foreground">
            Redirecting to sign in...
          </h1>
        </section>
      </main>
    );
  }

  if (!isLoaded || !isSignedIn || isConvexAuthLoading || isCurrentUserLoading || isCurrentOrgLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <section className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-5 w-40 animate-pulse rounded bg-muted" />
              <div className="h-4 w-64 animate-pulse rounded bg-muted" />
            </div>
            <div className="space-y-3">
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!isConvexAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <section className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-card-foreground">
            Waiting for auth
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Clerk sign-in completed. Waiting for Convex to accept the session.
          </p>
        </section>
      </main>
    );
  }

  if (isCreateUserError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <section className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-card-foreground">
            Account setup failed
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {createUserError instanceof Error
              ? createUserError.message
              : "The account creation request did not complete."}
          </p>
        </section>
      </main>
    );
  }

  if (isCreatingUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <section className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-card-foreground">
            Preparing workspace
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Creating your account record.
          </p>
        </section>
      </main>
    );
  }

  if (!currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <section className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-5 w-48 animate-pulse rounded bg-muted" />
              <div className="h-4 w-60 animate-pulse rounded bg-muted" />
            </div>
            <div className="space-y-3">
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
              <div className="h-3 w-3/5 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </section>
      </main>
    );
  }

  return <Outlet />;
}
