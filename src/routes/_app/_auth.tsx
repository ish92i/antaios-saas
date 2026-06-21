import { useAuth } from "@clerk/clerk-react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
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
      navigate({ to: "/login" });
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
    isConvexAuthenticated,
    isCurrentUserFetched,
    currentUser,
    isCreatingUser,
    createUser,
    navigate,
  ]);

  if (!isLoaded || !isSignedIn || isConvexAuthLoading || isCurrentUserLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <section className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-card-foreground">
            Loading workspace
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Preparing your account and dashboard.
          </p>
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

  return <Outlet />;
}
