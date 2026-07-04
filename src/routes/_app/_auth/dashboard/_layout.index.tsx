import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/_auth/dashboard/_layout/")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/shipments" });
  },
});
