import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Check } from "lucide-react";
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

const STEPS = ["Company Details", "Contact Info"];

export default function OnboardingOrganization() {
  const { data: org } = useQuery(convexQuery(api.orgs.getCurrentOrg, {}));
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { mutateAsync: updateOrg } = useMutation({
    mutationFn: useConvexMutation(api.orgs.updateOrg),
  });
  const navigate = useNavigate();

  const form = useForm({
    validatorAdapter: zodValidator(),
    defaultValues: {
      eoriNumber: "",
      street: "",
      city: "",
      postalCode: "",
      phone: "",
      country: "",
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      const address = `${value.street}\n${value.postalCode} ${value.city}`;
      await updateOrg({
        eoriNumber: value.eoriNumber,
        address,
        phone: value.phone || undefined,
        country: value.country,
      });
      setShowSuccess(true);
      setIsSubmitting(false);
      setTimeout(() => {
        navigate({ to: DashboardRoute.fullPath });
      }, 800);
    },
  });

  useEffect(() => {
    if (org?.eoriNumber) {
      navigate({ to: DashboardRoute.fullPath });
    }
  }, [org?.eoriNumber]);

  if (showSuccess) {
    return (
      <div className="mx-auto flex h-full w-full max-w-96 flex-col items-center justify-center gap-4 animate-in fade-in zoom-in-75 duration-300">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Check className="h-8 w-8 text-primary" />
        </div>
        <p className="text-lg font-medium text-primary">All set!</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-96 flex-col items-center justify-center gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-2">
        <h3 className="text-center text-2xl font-medium text-primary">
          Set up your organization
        </h3>
        <p className="text-center text-base font-normal text-primary/60">
          {step === 0
            ? "Your EORI is your EU identifier for customs clearance."
            : "How can we reach you about your shipments?"}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium shrink-0 transition-colors ${
            step === 0
              ? "bg-primary text-primary-foreground"
              : "bg-primary/20 text-primary"
          }`}
        >
          1
        </div>
        <span
          className={`text-sm whitespace-nowrap ${
            step === 0 ? "text-foreground font-medium" : "text-muted-foreground"
          }`}
        >
          Company Details
        </span>
        <div className="w-20 h-px bg-border mx-2">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: step > 0 ? "100%" : "0%" }}
          />
        </div>
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium shrink-0 transition-colors ${
            step >= 1
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          2
        </div>
        <span
          className={`text-sm whitespace-nowrap ${
            step >= 1 ? "text-foreground font-medium" : "text-muted-foreground"
          }`}
        >
          Contact Info
        </span>
      </div>

      <form
        className="flex w-full flex-col items-start gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        {step === 0 && (
          <div className="w-full space-y-3 animate-in fade-in slide-in-from-right-2 duration-300">
            <form.Field
              name="eoriNumber"
              validators={{ onSubmit: validators.eoriNumber }}
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
                    <span className="text-sm text-destructive">
                      {field.state.meta.errors.join(" ")}
                    </span>
                  )}
                </div>
              )}
            />

            <form.Field
              name="country"
              validators={{ onSubmit: validators.country }}
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
                    <span className="text-sm text-destructive">
                      {field.state.meta.errors.join(" ")}
                    </span>
                  )}
                </div>
              )}
            />
          </div>
        )}

        {step === 1 && (
          <div className="w-full space-y-3 animate-in fade-in slide-in-from-right-2 duration-300">
            <form.Field
              name="phone"
              children={(field) => (
                <div className="flex w-full flex-col gap-1.5">
                  <label htmlFor="phone" className="text-sm font-medium text-primary/80">
                    Phone <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <PhoneInput
                    international
                    value={field.state.value || undefined}
                    onChange={(value) => field.handleChange(value || "")}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
              )}
            />

            <form.Field
              name="street"
              validators={{ onSubmit: validators.street }}
              children={(field) => (
                <div className="flex w-full flex-col gap-1.5">
                  <label htmlFor="street" className="text-sm font-medium text-primary/80">
                    Street
                  </label>
                  <Input
                    placeholder="e.g. 123 Rue de Paris"
                    autoComplete="street-address"
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
                    <span className="text-sm text-destructive">
                      {field.state.meta.errors.join(" ")}
                    </span>
                  )}
                </div>
              )}
            />

            <div className="flex w-full gap-3">
              <form.Field
                name="postalCode"
                validators={{ onSubmit: validators.postalCode }}
                children={(field) => (
                  <div className="flex w-full flex-col gap-1.5">
                    <label htmlFor="postalCode" className="text-sm font-medium text-primary/80">
                      Postal Code
                    </label>
                    <Input
                      placeholder="e.g. 75001"
                      autoComplete="postal-code"
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
                      <span className="text-sm text-destructive">
                        {field.state.meta.errors.join(" ")}
                      </span>
                    )}
                  </div>
                )}
              />

              <form.Field
                name="city"
                validators={{ onSubmit: validators.city }}
                children={(field) => (
                  <div className="flex w-full flex-col gap-1.5">
                    <label htmlFor="city" className="text-sm font-medium text-primary/80">
                      City
                    </label>
                    <Input
                      placeholder="e.g. Paris"
                      autoComplete="address-level2"
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
                      <span className="text-sm text-destructive">
                        {field.state.meta.errors.join(" ")}
                      </span>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        )}

        <div className="flex w-full gap-2 mt-1">
          {step > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setStep(0)}
            >
              Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              size="sm"
              className="flex-1"
              onClick={() => setStep(1)}
            >
              Next
            </Button>
          ) : (
            <Button type="submit" size="sm" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Continue"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
