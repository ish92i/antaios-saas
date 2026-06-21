import { useAuth } from "@clerk/clerk-react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";

export const Route = createFileRoute("/_app/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const { mutate: createUser } = useMutation({
    mutationFn: useConvexMutation(api.app.createUserIfNeeded),
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate({ to: "/login" });
    }
    if (isLoaded && isSignedIn) {
      createUser({});
    }
  }, [isLoaded, isSignedIn, createUser, navigate]);

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return <Outlet />;
}
