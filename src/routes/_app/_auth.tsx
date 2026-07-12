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
import { Logo } from "@/components/logo";
import { DashboardSkeleton } from "@/routes/_app/_auth/dashboard/_layout";

export const Route = createFileRoute("/_app/_auth")({
  component: AuthLayout,
});

function LoadingUnauthed() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <Logo width={96} height={96} className="animate-pulse" />
    </main>
  );
}

function LoadingAuthed() {
  return <DashboardSkeleton />;
}

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
    return <LoadingUnauthed />;
  }

  if (!isLoaded || !isSignedIn || isConvexAuthLoading || isCurrentUserLoading || isCurrentOrgLoading) {
    if (isLoaded && isSignedIn) {
      return <LoadingAuthed />;
    }
    return <LoadingUnauthed />;
  }

  if (!isConvexAuthenticated) {
    return <LoadingAuthed />;
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
    return <LoadingAuthed />;
  }

  if (!currentUser) {
    return <LoadingAuthed />;
  }

  return <Outlet />;
}
