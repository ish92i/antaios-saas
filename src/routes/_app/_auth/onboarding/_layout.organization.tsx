import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "~/convex/_generated/api";
import { Route as DashboardRoute } from "@/routes/_app/_auth/dashboard/_layout.index";
import * as validators from "@/utils/validators";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_app/_auth/onboarding/_layout/organization")(
  {
    component: OnboardingOrganization,
    beforeLoad: () => ({
      title: "Antaios - Onboarding",
    }),
  },
);

export default function OnboardingOrganization() {
  const { data: org } = useQuery(convexQuery(api.orgs.getCurrentOrg, {}));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutateAsync: updateOrg } = useMutation({
    mutationFn: useConvexMutation(api.orgs.updateOrg),
  });
  const navigate = useNavigate();

  const form = useForm({
    validatorAdapter: zodValidator(),
    defaultValues: {
      eoriNumber: "",
      address: "",
      phone: "",
      country: "",
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      await updateOrg({
        eoriNumber: value.eoriNumber,
        address: value.address,
        phone: value.phone || undefined,
        country: value.country,
      });
      setIsSubmitting(false);
    },
  });

  useEffect(() => {
    if (org?.eoriNumber) {
      navigate({ to: DashboardRoute.fullPath });
    }
  }, [org?.eoriNumber]);

  return (
    <div className="mx-auto flex h-full w-full max-w-96 flex-col items-center justify-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <h3 className="text-center text-2xl font-medium text-primary">
          Set up your organization
        </h3>
        <p className="text-center text-base font-normal text-primary/60">
          Fill in your organization details to get started.
        </p>
      </div>
      <form
        className="flex w-full flex-col items-start gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <form.Field
          name="eoriNumber"
          validators={{
            onSubmit: validators.eoriNumber,
          }}
          children={(field) => (
            <div className="flex w-full flex-col gap-1.5">
              <label htmlFor="eoriNumber" className="text-sm font-medium text-primary/80">
                EORI Number
              </label>
              <Input
                placeholder="e.g. FR123456789"
                autoComplete="off"
                required
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className={`bg-transparent ${
                  field.state.meta?.errors.length > 0 &&
                  "border-destructive focus-visible:ring-destructive"
                }`}
              />
              {field.state.meta?.errors.length > 0 && (
                <span className="text-sm text-destructive dark:text-destructive-foreground">
                  {field.state.meta.errors.join(" ")}
                </span>
              )}
            </div>
          )}
        />

        <form.Field
          name="phone"
          children={(field) => (
            <div className="flex w-full flex-col gap-1.5">
              <label htmlFor="phone" className="text-sm font-medium text-primary/80">
                Phone
              </label>
              <PhoneInput
                value={field.state.value || undefined}
                onChange={(value) => field.handleChange(value || "")}
                placeholder="+33 1 23 45 67 89"
              />
              {field.state.meta?.errors.length > 0 && (
                <span className="text-sm text-destructive dark:text-destructive-foreground">
                  {field.state.meta.errors.join(" ")}
                </span>
              )}
            </div>
          )}
        />

        <div className="flex w-full gap-3">
          <form.Field
            name="address"
            validators={{
              onSubmit: validators.address,
            }}
            children={(field) => (
              <div className="flex w-full flex-col gap-1.5">
                <label htmlFor="address" className="text-sm font-medium text-primary/80">
                  Address
                </label>
                <Input
                  placeholder="e.g. 123 Rue de Paris"
                  autoComplete="off"
                  required
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={`bg-transparent ${
                    field.state.meta?.errors.length > 0 &&
                    "border-destructive focus-visible:ring-destructive"
                  }`}
                />
                {field.state.meta?.errors.length > 0 && (
                  <span className="text-sm text-destructive dark:text-destructive-foreground">
                    {field.state.meta.errors.join(" ")}
                  </span>
                )}
              </div>
            )}
          />

          <form.Field
            name="country"
            validators={{
              onSubmit: validators.country,
            }}
            children={(field) => (
              <div className="flex w-full flex-col gap-1.5">
                <label htmlFor="country" className="text-sm font-medium text-primary/80">
                  Country
                </label>
                <Input
                  placeholder="e.g. France"
                  autoComplete="off"
                  required
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={`bg-transparent ${
                    field.state.meta?.errors.length > 0 &&
                    "border-destructive focus-visible:ring-destructive"
                  }`}
                />
                {field.state.meta?.errors.length > 0 && (
                  <span className="text-sm text-destructive dark:text-destructive-foreground">
                    {field.state.meta.errors.join(" ")}
                  </span>
                )}
              </div>
            )}
          />
        </div>

        <Button type="submit" size="sm" className="w-full mt-1">
          {isSubmitting ? <Loader2 className="animate-spin" /> : "Continue"}
        </Button>
      </form>
    </div>
  );
}
