# Signup, Onboarding & Paywall Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a delightful signup-to-paid flow with a hard paywall after 1 free shipment.

**Architecture:** Clerk `<SignIn>` for auth (free plan), Convex queries for subscription + shipment count, TanStack Router dashboard layout for paywall overlay, Dodo Payments for checkout. No new data models — existing `subscriptions` and `shipments` tables suffice.

**Tech Stack:** React 19, TanStack Router + React Query, Convex, Clerk, Dodo Payments, Tailwind CSS v4, shadcn/ui

## Global Constraints

- Clerk free plan — cannot replace `<SignIn>` component, cannot remove Clerk branding
- Primary color: `oklch(0.488 0.243 264.376)` (indigo/purple)
- No new database tables
- Existing `getCurrentUser` already includes `subscription`
- Paywall overlay has NO dismiss option (hard gate)
- Exempt routes from paywall: `/dashboard/settings/billing`, `/dashboard/checkout`
- Dodo checkout flow: `createCheckoutSession` action → returns `checkoutUrl` → redirect

---

### Task 1: Shipment Count Convex Query

**Files:**
- Modify: `convex/shipments.ts`
- Test: `convex/shipments.ts` (add alongside existing exports)

**Interfaces:**
- Consumes: existing `getOrgId` from `@cvx/auth`
- Produces: `getShipmentCount` query → `number`

- [ ] **Step 1: Add `getShipmentCount` query**

After the existing `listShipments` export (around line 50), add:

```ts
export const getShipmentCount = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrgId(ctx)
    if (!orgId) return 0
    const shipments = await ctx.db
      .query("shipments")
      .withIndex("orgId", (q) => q.eq("orgId", orgId as string))
      .collect()
    return shipments.length
  },
})
```

- [ ] **Step 2: Run Convex codegen**

Run: `npx convex codegen`

Expected: TypeScript types regenerated in `convex/_generated/`.

- [ ] **Step 3: Commit**

```bash
git add convex/shipments.ts
git commit -m "feat: add getShipmentCount query for paywall quota"
```

---

### Task 2: Paywall Overlay Component

**Files:**
- Create: `src/components/paywall/PaywallOverlay.tsx`
- Create: `src/components/paywall/SubscribeButton.tsx` (optional — small helper)

**Interfaces:**
- Consumes: `closeModal` from dashboard layout (empty fn — overlay is not dismissable by user, but parent can unmount it)
- Produces: `<PaywallOverlay />` component

- [ ] **Step 1: Create `PaywallOverlay` component**

`src/components/paywall/PaywallOverlay.tsx`:

```tsx
import { useAction } from "convex/react"
import { Loader2, Shield, Sparkles, Ship, Scan, FileText, Globe } from "lucide-react"
import { api } from "@cvx/_generated/api"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const features = [
  { icon: Ship, label: "Unlimited shipments" },
  { icon: Scan, label: "Deforestation scanning" },
  { icon: FileText, label: "Risk assessment reports" },
  { icon: Globe, label: "EUDR compliance tracking" },
]

export function PaywallOverlay() {
  const createCheckout = useAction(api.payments.createCheckoutSession)
  const [isLoading, setIsLoading] = useState(false)

  const handlePurchase = async () => {
    setIsLoading(true)
    try {
      const { checkoutUrl } = await createCheckout({})
      if (checkoutUrl) window.location.href = checkoutUrl
    } catch {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-lg">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Upgrade to Direct
            </h2>
            <p className="text-sm text-muted-foreground">
              You've used your free shipment. Unlock full access to all EUDR compliance tools.
            </p>
          </div>

          <div className="w-full space-y-2 rounded-xl bg-muted/50 p-4">
            {features.map((f) => (
              <div key={f.label} className="flex items-center gap-3 text-sm">
                <f.icon className="h-4 w-4 text-primary" />
                <span className="text-foreground">{f.label}</span>
              </div>
            ))}
          </div>

          <div className="w-full space-y-1">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              €500
            </span>
            <span className="text-sm text-muted-foreground"> /month — Cancel anytime</span>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handlePurchase}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Purchase Direct"
            )}
          </Button>

          <p className="text-xs text-muted-foreground">
            Already subscribed?{" "}
            <button
              type="button"
              className="underline hover:text-primary"
              onClick={() => window.location.reload()}
            >
              Refresh to check
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/paywall/PaywallOverlay.tsx
git commit -m "feat: create PaywallOverlay component"
```

---

### Task 3: Dashboard Layout with Paywall Gate

**Files:**
- Modify: `src/routes/_app/_auth/dashboard/_layout.tsx`

- [ ] **Step 1: Add subscription + shipment count checks to dashboard layout**

Rewrite `_layout.tsx`:

```tsx
import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { Navigation } from "./-ui.navigation";

import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";
import { Button } from "@/components/ui/button";
import { PaywallOverlay } from "@/components/paywall/PaywallOverlay";

const EXEMPT_ROUTES = [
  "/dashboard/settings/billing",
  "/dashboard/checkout",
];

export const Route = createFileRoute("/_app/_auth/dashboard/_layout")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const location = useLocation();
  const isExempt = EXEMPT_ROUTES.some((r) => location.pathname.startsWith(r));

  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(convexQuery(api.app.getCurrentUser, {}));

  const { data: shipmentCount = 0 } = useQuery(
    convexQuery(api.shipments.getShipmentCount, {}),
  );

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-secondary px-6">
        <section className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
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
      <main className="flex min-h-screen items-center justify-center bg-secondary px-6">
        <section className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
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

  const isSubscribed = user.subscription?.status === "active";
  const showPaywall = !isSubscribed && shipmentCount >= 1 && !isExempt;

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-secondary">
      <Navigation user={user} />
      {showPaywall ? (
        <div className="relative flex flex-1">
          <div className="absolute inset-0 overflow-hidden blur-sm opacity-30 pointer-events-none">
            <Outlet />
          </div>
          <PaywallOverlay />
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/_app/_auth/dashboard/_layout.tsx
git commit -m "feat: add paywall gate to dashboard layout"
```

---

### Task 4: Create Shipment Quota Guard

**Files:**
- Modify: `convex/shipments.ts`

- [ ] **Step 1: Add quota check in `createShipment` mutation**

Modify the `createShipment` handler (line 13-30). After the orgId check, add:

```ts
const existingShipments = await ctx.db
  .query("shipments")
  .withIndex("orgId", (q) => q.eq("orgId", orgId as string))
  .collect()

const subscription = await ctx.db
  .query("subscriptions")
  .withIndex("orgId", (q) => q.eq("orgId", orgId as string))
  .first()

const hasActiveSub = subscription?.status === "active"

if (!hasActiveSub && existingShipments.length >= 1) {
  throw new Error(
    "Free tier limit reached. Upgrade to Direct to create more shipments.",
  )
}
```

Place this right before the `ctx.db.insert("shipments", ...)` call.

- [ ] **Step 2: Commit**

```bash
git add convex/shipments.ts
git commit -m "feat: add free tier quota check in createShipment mutation"
```

---

### Task 5: Login Page Polish

**Files:**
- Modify: `src/routes/_app/login/_layout.index.tsx`

- [ ] **Step 1: Polish Clerk appearance + add entry animation**

Rewrite `_layout.index.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { SignIn } from "@clerk/clerk-react";

export const Route = createFileRoute("/_app/login/_layout/")({
  component: Login,
  beforeLoad: () => ({
    title: "Antaios - Connexion",
  }),
});

function Login() {
  return (
    <div className="mx-auto flex h-full w-full max-w-96 flex-col items-center justify-center gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-2 flex flex-col gap-2">
        <h3 className="text-center text-2xl font-medium text-primary">
          Sign in to Antaios
        </h3>
        <p className="text-center text-base font-normal text-primary/60">
          EUDR Compliance, Simplified
        </p>
      </div>
      <SignIn
        routing="hash"
        signUpUrl="/login"
        forceRedirectUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-none bg-transparent w-full p-0",
            header: "hidden",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            socialButtonsBlockButton:
              "w-full border border-border bg-transparent text-primary/80 hover:bg-primary/5 transition-colors",
            dividerRow: "my-4",
            dividerText: "text-xs font-medium uppercase text-primary/60",
            formFieldLabel: "text-sm text-primary/60",
            formFieldInput:
              "bg-transparent border-border text-primary placeholder:text-primary/40 transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30",
            formButtonPrimary:
              "inline-flex items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 h-10 px-4 py-2 w-full transition-all active:scale-[0.98]",
            footerActionLink: "text-primary underline",
            footer: "hidden",
            identityPreviewEditButton: "text-primary",
          },
        }}
      />
      <p className="px-12 text-center text-sm font-normal leading-normal text-primary/60">
        By clicking continue, you agree to our{" "}
        <a className="underline hover:text-primary transition-colors">Terms of Service</a> and{" "}
        <a className="underline hover:text-primary transition-colors">Privacy Policy.</a>
      </p>
      <p className="text-xs text-muted-foreground">
        Trusted by European importers and customs agents
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/_app/login/_layout.index.tsx
git commit -m "feat: polish login page with animations and social proof"
```

---

### Task 6: Onboarding 2-Step Progressive Disclosure

**Files:**
- Modify: `src/routes/_app/_auth/onboarding/_layout.organization.tsx`
- Modify: `src/routes/_app/_auth/onboarding/_layout.tsx` (minor animation)

- [ ] **Step 1: Rewrite onboarding organization form with 2-step flow**

Full rewrite of `_layout.organization.tsx`:

```tsx
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

  const progress = ((step + 1) / STEPS.length) * 100;

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
      <div className="flex w-full items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                i === step
                  ? "bg-primary text-primary-foreground"
                  : i < step
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-sm hidden sm:block ${
                i === step ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px bg-border">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: i < step ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        ))}
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
              name="address"
              validators={{ onSubmit: validators.address }}
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
                    <span className="text-sm text-destructive">
                      {field.state.meta.errors.join(" ")}
                    </span>
                  )}
                </div>
              )}
            />
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
```

- [ ] **Step 2: Add entry animation to onboarding layout**

In `_layout.tsx`, add `animate-in` classes to the children wrapper:

```tsx
<div className="z-10 h-screen w-screen animate-in fade-in duration-700">
  <Outlet />
</div>
```

- [ ] **Step 3: Commit**

```bash
git add src/routes/_app/_auth/onboarding/_layout.organization.tsx src/routes/_app/_auth/onboarding/_layout.tsx
git commit -m "feat: onboarding 2-step progressive disclosure with animations"
```

---

## Self-Review

**Spec coverage:**
- Section 1 (Signup) → Task 5
- Section 2 (Onboarding) → Task 6
- Section 3 (Paywall Overlay) → Tasks 2, 3
- Section 4 (Post-Purchase) → Covered by existing infrastructure (Dodo webhooks)
- Section 5 (Shipment Quota) → Tasks 1, 4

**Placeholder scan:** No TBDs, TODOs, or incomplete sections. All code blocks are complete.

**Type consistency:** `getShipmentCount` returns `number`, `createCheckoutSession` returns `{ checkoutUrl: string }`, `getCurrentUser` returns `User` with `subscription` — all consistent with existing code.
