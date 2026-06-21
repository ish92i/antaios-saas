# Dodo Payments Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Stripe with Dodo Payments, removing the `plans` table and simplifying to a single "Direct" plan configured via env var.

**Architecture:** Use `@dodopayments/convex` Convex component for checkout, customer portal, and webhook handling. Remove all Stripe-specific code and schema fields. Track subscriptions with minimal fields — rely on Dodo's customer portal for detailed management.

**Tech Stack:** Convex, Dodo Payments (`@dodopayments/convex`), Clerk auth, TanStack React

---

### Task 1: Install Package and Add Component Registration

**Files:**
- Create: `convex/convex.config.ts`

- [ ] **Step 1: Install @dodopayments/convex**

```bash
pnpm add @dodopayments/convex
```

- [ ] **Step 2: Create convex/convex.config.ts**

```ts
import { defineApp } from "convex/server";
import dodopayments from "@dodopayments/convex/convex.config";

const app = defineApp();
app.use(dodopayments);
export default app;
```

- [ ] **Step 3: Commit**

```bash
git add convex/convex.config.ts package.json pnpm-lock.yaml
git commit -m "feat: add @dodopayments/convex component"
```

---

### Task 2: Update Schema

**Files:**
- Modify: `convex/schema.ts`

- [ ] **Step 1: Remove `plans` table, simplify `subscriptions` table, remove `customerId` from `users`**

Replace the schema content:

```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
  })
    .index("clerkUserId", ["clerkUserId"])
    .index("email", ["email"]),
  subscriptions: defineTable({
    userId: v.string(),
    dodoSubscriptionId: v.optional(v.string()),
    dodoProductId: v.optional(v.string()),
    planName: v.optional(v.string()),
    status: v.optional(v.string()),
    email: v.optional(v.string()),
  })
    .index("userId", ["userId"])
    .index("dodoSubscriptionId", ["dodoSubscriptionId"]),
});

export default schema;
```

- [ ] **Step 2: Commit**

```bash
git add convex/schema.ts
git commit -m "refactor: remove plans table, simplify subscriptions schema"
```

---

### Task 3: Update Environment Variables

**Files:**
- Modify: `convex/env.ts`

- [ ] **Step 1: Replace Stripe env vars with Dodo env vars**

```ts
export const AUTH_RESEND_KEY = process.env.AUTH_RESEND_KEY;
export const AUTH_EMAIL = process.env.AUTH_EMAIL;
export const SITE_URL = process.env.SITE_URL;
export const APP_URL = process.env.APP_URL;
export const DODO_PAYMENTS_API_KEY = process.env.DODO_PAYMENTS_API_KEY;
export const DODO_PAYMENTS_ENVIRONMENT = process.env.DODO_PAYMENTS_ENVIRONMENT;
export const DODO_PAYMENTS_WEBHOOK_SECRET = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
export const DIRECT_PLAN_ID = process.env.DIRECT_PLAN_ID;
```

- [ ] **Step 2: Commit**

```bash
git add convex/env.ts
git commit -m "refactor: replace Stripe env vars with Dodo Payments env vars"
```

---

### Task 4: Create Dodo Payments Component Setup

**Files:**
- Create: `convex/dodo.ts`

- [ ] **Step 1: Create convex/dodo.ts**

```ts
import { DodoPayments } from "@dodopayments/convex";
import { components } from "./_generated/api";
import { APP_URL, DODO_PAYMENTS_API_KEY, DODO_PAYMENTS_ENVIRONMENT, DIRECT_PLAN_ID } from "@cvx/env";

export const dodo = new DodoPayments(components.dodopayments, {
  identify: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return { dodoCustomerId: identity.subject };
  },
  apiKey: DODO_PAYMENTS_API_KEY!,
  environment: DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode",
});

export const { checkout, customerPortal } = dodo.api();

export const planNameFromProductId = (productId: string): string => {
  if (productId === DIRECT_PLAN_ID) return "Direct";
  return "Inconnu";
};
```

- [ ] **Step 2: Commit**

```bash
git add convex/dodo.ts
git commit -m "feat: add Dodo Payments component setup"
```

---

### Task 5: Create Payment Actions/Mutations/Queries

**Files:**
- Create: `convex/payments.ts`

- [ ] **Step 1: Create convex/payments.ts**

```ts
import { v } from "convex/values"
import type { UserIdentity } from "convex/server"
import { action, internalMutation, mutation, query } from "./_generated/server"
import type { MutationCtx } from "./_generated/server"
import { api, internal } from "./_generated/api"
import { APP_URL, DIRECT_PLAN_ID } from "@cvx/env"
import { checkout, customerPortal } from "./dodo"

const claimString = (identity: UserIdentity, claim: string) => {
  const value = identity[claim]
  return typeof value === "string" && value.length > 0 ? value : null
}

const orgIdFromClaims = (identity: UserIdentity) =>
  claimString(identity, "org_id") ??
  claimString(identity, "organization_id") ??
  claimString(identity, "organizationId")

const clean = <T extends Record<string, unknown>>(value: T) =>
  Object.fromEntries(
    Object.entries(value).filter(([, field]) => field !== undefined)
  ) as T

const upsertSubscription = async (
  ctx: MutationCtx,
  args: {
    convexUserId: string
    orgId?: string
    dodoSubscriptionId: string
    dodoProductId: string
    planName: string
    email: string
    status: string
  }
) => {
  const existing = await ctx.db
    .query("subscriptions")
    .withIndex("userId", (q) => q.eq("userId", args.convexUserId))
    .first()

  if (existing) {
    await ctx.db.patch(
      existing._id,
      clean({
        dodoSubscriptionId: args.dodoSubscriptionId,
        dodoProductId: args.dodoProductId,
        planName: args.planName,
        status: args.status,
        email: args.email,
      })
    )
    return existing._id
  }

  return await ctx.db.insert(
    "subscriptions",
    clean({
      userId: args.convexUserId,
      dodoSubscriptionId: args.dodoSubscriptionId,
      dodoProductId: args.dodoProductId,
      planName: args.planName,
      status: args.status,
      email: args.email,
    })
  )
}

export const createCheckoutSession = action({
  args: {
    orgId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")
    const orgId = orgIdFromClaims(identity)

    const productId = DIRECT_PLAN_ID
    if (!productId) throw new Error("DIRECT_PLAN_ID env var not set")

    const returnUrl = `${APP_URL ?? "http://localhost:3000"}/dashboard`

    const session = await checkout(ctx, {
      payload: {
        product_cart: [{ product_id: productId, quantity: 1 }],
        customer: { email: identity.email ?? "" },
        return_url: returnUrl,
        metadata: {
          convex_user_id: identity.subject,
          ...(orgId ? { convex_org_id: orgId } : {}),
        },
      },
    })

    await ctx.runMutation(api.payments.storeSubscription, {
      convexUserId: identity.subject,
      orgId: orgId ?? undefined,
      dodoProductId: productId,
      planName: "Direct",
      email: identity.email ?? "",
      status: "pending",
    })

    return { checkoutUrl: session.checkout_url }
  },
})

export const getCustomerPortal = action({
  args: {
    send_email: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")

    const portal = await customerPortal(ctx, { send_email: args.send_email ?? false })
    if (!portal?.portal_url) {
      throw new Error("Customer portal did not return a portal_url")
    }
    return portal
  },
})

export const storeSubscriptionFromWebhook = internalMutation({
  args: {
    convexUserId: v.string(),
    orgId: v.optional(v.string()),
    dodoSubscriptionId: v.string(),
    dodoProductId: v.string(),
    planName: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await upsertSubscription(ctx, {
      convexUserId: args.convexUserId,
      orgId: args.orgId,
      dodoSubscriptionId: args.dodoSubscriptionId,
      dodoProductId: args.dodoProductId,
      planName: args.planName,
      email: args.email,
      status: "active",
    })
  },
})

export const storeSubscription = mutation({
  args: {
    convexUserId: v.string(),
    orgId: v.optional(v.string()),
    dodoSubscriptionId: v.optional(v.string()),
    dodoProductId: v.optional(v.string()),
    planName: v.optional(v.string()),
    email: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("UNAUTHORIZED")

    const orgId = orgIdFromClaims(identity)

    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", identity.subject))
      .first()

    if (existing) {
      await ctx.db.patch(
        existing._id,
        clean({
          dodoSubscriptionId: args.dodoSubscriptionId,
          dodoProductId: args.dodoProductId,
          planName: args.planName,
          status: args.status ?? "active",
          email: identity.email ?? args.email,
        })
      )
      return existing._id
    }

    return await ctx.db.insert(
      "subscriptions",
      clean({
        userId: identity.subject,
        dodoSubscriptionId: args.dodoSubscriptionId,
        dodoProductId: args.dodoProductId ?? "",
        planName: args.planName ?? "Direct",
        email: identity.email ?? args.email,
        status: args.status ?? "active",
      })
    )
  },
})

export const updateSubscriptionStatusFromWebhook = internalMutation({
  args: {
    dodoSubscriptionId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("dodoSubscriptionId", (q) =>
        q.eq("dodoSubscriptionId", args.dodoSubscriptionId)
      )
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, { status: args.status })
    }
  },
})

export const updateSubscriptionPlan = internalMutation({
  args: {
    dodoSubscriptionId: v.string(),
    dodoProductId: v.string(),
    planName: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("dodoSubscriptionId", (q) =>
        q.eq("dodoSubscriptionId", args.dodoSubscriptionId)
      )
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        dodoProductId: args.dodoProductId,
        planName: args.planName,
      })
    }
  },
})

export const updateSubscriptionStatus = mutation({
  args: {
    dodoSubscriptionId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("UNAUTHORIZED")

    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("dodoSubscriptionId", (q) =>
        q.eq("dodoSubscriptionId", args.dodoSubscriptionId)
      )
      .first()

    if (!existing) return

    const ownsSubscription = existing.userId === identity.subject
    if (!ownsSubscription) throw new Error("NOT_FOUND")

    if (existing) {
      await ctx.db.patch(existing._id, { status: args.status })
    }
  },
})

export const getUserSubscription = query({
  args: {
    orgId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    if (args.orgId) {
      const orgId = orgIdFromClaims(identity)
      if (!orgId) throw new Error("ORG_REQUIRED")
      if (orgId !== args.orgId) throw new Error("ORG_MISMATCH")
      const subscription = await ctx.db
        .query("subscriptions")
        .withIndex("userId", (q) => q.eq("userId", orgId))
        .first()
      return subscription
    }

    const userId = identity.subject
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first()

    return subscription
  },
})
```

- [ ] **Step 2: Commit**

```bash
git add convex/payments.ts
git commit -m "feat: add Dodo Payments actions/mutations/queries"
```

---

### Task 6: Rewrite Webhook Handler

**Files:**
- Modify: `convex/http.ts`

- [ ] **Step 1: Replace Stripe webhook with Dodo webhook handler**

```ts
import { createDodoWebhookHandler } from "@dodopayments/convex";
import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { planNameFromProductId } from "./dodo";

const http = httpRouter();

http.route({
  path: "/webhooks/dodoWebhook",
  method: "POST",
  handler: createDodoWebhookHandler({
    onSubscriptionActive: async (ctx, payload) => {
      if (!payload.data.subscription_id) return
      const metadata = payload.data.metadata ?? {}
      const convexUserId = metadata.convex_user_id
      const convexOrgId = metadata.convex_org_id
      const productId = payload.data.product_id
      const planName = planNameFromProductId(productId)
      if (convexUserId) {
        await ctx.runMutation(internal.payments.storeSubscriptionFromWebhook, {
          convexUserId,
          orgId: convexOrgId,
          dodoSubscriptionId: payload.data.subscription_id,
          dodoProductId: productId,
          planName,
          email: payload.data.customer?.email || "",
        })
      } else {
        await ctx.runMutation(
          internal.payments.updateSubscriptionStatusFromWebhook,
          {
            dodoSubscriptionId: payload.data.subscription_id,
            status: "active",
          }
        )
      }
    },
    onPaymentSucceeded: async (ctx, payload) => {
      if (!payload.data.subscription_id) return
      await ctx.runMutation(
        internal.payments.updateSubscriptionStatusFromWebhook,
        {
          dodoSubscriptionId: payload.data.subscription_id,
          status: "active",
        }
      )
    },
    onSubscriptionPlanChanged: async (ctx, payload) => {
      if (!payload.data.subscription_id) return
      const productId = payload.data.product_id
      const planName = planNameFromProductId(productId)
      await ctx.runMutation(internal.payments.updateSubscriptionPlan, {
        dodoSubscriptionId: payload.data.subscription_id,
        dodoProductId: productId,
        planName,
      })
    },
    onSubscriptionCancelled: async (ctx, payload) => {
      if (payload.data.subscription_id) {
        await ctx.runMutation(
          internal.payments.updateSubscriptionStatusFromWebhook,
          {
            dodoSubscriptionId: payload.data.subscription_id,
            status: "canceled",
          }
        )
      }
    },
    onSubscriptionExpired: async (ctx, payload) => {
      if (payload.data.subscription_id) {
        await ctx.runMutation(
          internal.payments.updateSubscriptionStatusFromWebhook,
          {
            dodoSubscriptionId: payload.data.subscription_id,
            status: "expired",
          }
        )
      }
    },
  }),
})

export default http
```

- [ ] **Step 2: Commit**

```bash
git add convex/http.ts
git commit -m "refactor: replace Stripe webhooks with Dodo Payments webhooks"
```

---

### Task 7: Update App Backend

**Files:**
- Modify: `convex/app.ts`

- [ ] **Step 1: Remove Stripe references, simplify getCurrentUser, remove getActivePlans, remove completeOnboarding Stripe customer creation**

```ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { User } from "~/types";
import { getUserId, ensureUser } from "@cvx/auth";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx): Promise<User | undefined> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const user = await ctx.db
      .query("users")
      .withIndex("clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();
    if (!user) return;

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", identity.subject))
      .first();

    const avatarUrl = user.imageId
      ? await ctx.storage.getUrl(user.imageId)
      : user.image;
    return {
      ...user,
      avatarUrl: avatarUrl || undefined,
      subscription: subscription ?? undefined,
    };
  },
});

export const createUserIfNeeded = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await ensureUser(ctx);
    if (!user) {
      throw new Error("Unable to create a user before auth is ready.");
    }
    return user._id;
  },
});

export const updateUsername = mutation({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return;
    await ctx.db.patch(userId, { username: args.username });
  },
});

export const completeOnboarding = mutation({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ensureUser(ctx);
    if (!user) return;
    await ctx.db.patch(user._id, { username: args.username });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("User not found");
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateUserImage = mutation({
  args: {
    imageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return;
    ctx.db.patch(userId, { imageId: args.imageId });
  },
});

export const removeUserImage = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return;
    ctx.db.patch(userId, { imageId: undefined, image: undefined });
  },
});

export const deleteCurrentUserAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return;

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", identity.subject))
      .first();
    if (subscription) {
      await ctx.db.delete(subscription._id);
    }
    await ctx.db.delete(userId);
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add convex/app.ts
git commit -m "refactor: remove Stripe references from app backend"
```

---

### Task 8: Remove Old Files

**Files:**
- Remove: `convex/stripe.ts`
- Remove: `convex/init.ts`

- [ ] **Step 1: Delete files**

```bash
git rm convex/stripe.ts convex/init.ts
```

- [ ] **Step 2: Commit**

```bash
git commit -m "refactor: remove Stripe and init seed files"
```

---

### Task 9: Update Errors and Types

**Files:**
- Modify: `errors.ts`
- Modify: `types.ts`

- [ ] **Step 1: Remove Stripe error messages from errors.ts**

```ts
export const ERRORS = {
  // Authentication.
  AUTH_EMAIL_NOT_SENT: "Unable to send email.",
  AUTH_USER_NOT_CREATED: "Unable to create user.",
  AUTH_SOMETHING_WENT_WRONG:
    "Something went wrong while trying to authenticate.",
  // Onboarding.
  ONBOARDING_USERNAME_ALREADY_EXISTS: "Username already exists.",
  ONBOARDING_SOMETHING_WENT_WRONG:
    "Something went wrong while trying to onboard.",
  // Misc.
  UNKNOWN: "Unknown error.",
  ENVS_NOT_INITIALIZED: "Environment variables not initialized.",
  SOMETHING_WENT_WRONG: "Something went wrong.",
} as const;
```

- [ ] **Step 2: Update types.ts — remove `planKey` from subscription type**

```ts
import { Doc } from "~/convex/_generated/dataModel";

export type User = Doc<"users"> & {
  avatarUrl?: string;
  subscription?: Doc<"subscriptions">;
};
```

- [ ] **Step 3: Commit**

```bash
git add errors.ts types.ts
git commit -m "refactor: remove Stripe errors, simplify types"
```

---

### Task 10: Update Billing Page

**Files:**
- Modify: `src/routes/_app/_auth/dashboard/_layout.settings.billing.tsx`

- [ ] **Step 1: Rewrite billing page for Dodo Payments**

```tsx
import { useAction, useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "@cvx/_generated/api";

export const Route = createFileRoute(
  "/_app/_auth/dashboard/_layout/settings/billing",
)({
  component: BillingSettings,
  beforeLoad: () => ({
    title: "Billing",
    headerTitle: "Billing",
    headerDescription: "Manage billing and your subscription plan.",
  }),
});

export default function BillingSettings() {
  const user = useQuery(api.app.getCurrentUser);
  const createCheckout = useAction(api.payments.createCheckoutSession);
  const getPortal = useAction(api.payments.getCustomerPortal);

  const handlePurchase = async () => {
    const { checkoutUrl } = await createCheckout({});
    if (checkoutUrl) window.location.href = checkoutUrl;
  };

  const handleManageSubscription = async () => {
    const { portal_url } = await getPortal({ send_email: false });
    if (portal_url) window.location.href = portal_url;
  };

  if (!user) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-secondary px-6 dark:bg-black">
        <section className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm dark:bg-black">
          <h1 className="text-xl font-semibold text-primary">Loading billing</h1>
          <p className="mt-2 text-sm text-primary/60">
            Fetching your account data.
          </p>
        </section>
      </div>
    );
  }

  const isSubscribed = user.subscription?.status === "active";

  return (
    <div className="flex h-full w-full flex-col gap-6">
      {/* Plan */}
      <div className="flex w-full flex-col items-start rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-2 p-6">
          <h2 className="text-xl font-medium text-primary">Plan</h2>
          <p className="flex items-start gap-1 text-sm font-normal text-primary/60">
            You are currently on the{" "}
            <span className="flex h-[18px] items-center rounded-md bg-primary/10 px-1.5 text-sm font-medium text-primary/80">
              {user.subscription ? user.subscription.planName ?? "Direct" : "No plan"}
            </span>
            {user.subscription && (
              <>
                {user.subscription.status === "canceled"
                  ? " (canceled)"
                  : user.subscription.status === "expired"
                    ? " (expired)"
                    : ""}
              </>
            )}
          </p>
        </div>

        {!isSubscribed && (
          <div className="flex w-full flex-col items-center justify-evenly gap-2 border-border p-6 pt-0">
            <div
              tabIndex={0}
              className="flex w-full select-none items-center rounded-md border border-border hover:border-primary/60"
            >
              <div className="flex w-full flex-col items-start p-4">
                <div className="flex items-center gap-2">
                  <span className="text-base font-medium text-primary">
                    Direct
                  </span>
                </div>
                <p className="text-start text-sm font-normal text-primary/60">
                  Access to all features.
                </p>
              </div>
            </div>
          </div>
        )}

        {isSubscribed && (
          <div className="flex w-full flex-col items-center justify-evenly gap-2 border-border p-6 pt-0">
            <div className="flex w-full items-center overflow-hidden rounded-md border border-primary/60">
              <div className="flex w-full flex-col items-start p-4">
                <div className="flex items-end gap-2">
                  <span className="text-base font-medium text-primary">
                    Direct
                  </span>
                </div>
                <p className="text-start text-sm font-normal text-primary/60">
                  Access to all features.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex min-h-14 w-full items-center justify-between rounded-lg rounded-t-none border-t border-border bg-secondary px-6 py-3 dark:bg-card">
          <p className="text-sm font-normal text-primary/60">
            {isSubscribed
              ? "Manage your subscription via the customer portal."
              : "Purchase the Direct plan to unlock all features."}
          </p>
          {!isSubscribed && (
            <Button type="submit" size="sm" onClick={handlePurchase}>
              Purchase Direct
            </Button>
          )}
        </div>
      </div>

      {/* Manage Subscription */}
      <div className="flex w-full flex-col items-start rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-2 p-6">
          <h2 className="text-xl font-medium text-primary">
            Manage Subscription
          </h2>
          <p className="flex items-start gap-1 text-sm font-normal text-primary/60">
            Update your payment method, billing address, and more.
          </p>
        </div>

        <div className="flex min-h-14 w-full items-center justify-between rounded-lg rounded-t-none border-t border-border bg-secondary px-6 py-3 dark:bg-card">
          <p className="text-sm font-normal text-primary/60">
            You will be redirected to the Dodo Payments Customer Portal.
          </p>
          <Button type="submit" size="sm" onClick={handleManageSubscription}>
            Manage
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/_app/_auth/dashboard/_layout.settings.billing.tsx
git commit -m "feat: update billing page for Dodo Payments"
```

---

### Task 11: Update Checkout Page

**Files:**
- Modify: `src/routes/_app/_auth/dashboard/_layout.checkout.tsx`

- [ ] **Step 1: Simplify checkout page for single plan**

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, BadgeCheck, AlertTriangle, ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/button-util";
import { Route as DashboardRoute } from "@/routes/_app/_auth/dashboard/_layout.index";
import siteConfig from "~/site.config";

export const Route = createFileRoute("/_app/_auth/dashboard/_layout/checkout")({
  component: DashboardCheckout,
  beforeLoad: () => ({
    title: `${siteConfig.siteTitle} - Checkout`,
  }),
});

export default function DashboardCheckout() {
  return (
    <div className="flex h-full w-full bg-secondary px-6 py-8 dark:bg-black">
      <div className="z-10 mx-auto flex h-full w-full max-w-screen-xl gap-12">
        <div className="flex w-full flex-col rounded-lg border border-border bg-card dark:bg-black">
          <div className="flex w-full flex-col rounded-lg p-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-medium text-primary">
                Completing your Checkout
              </h2>
              <p className="text-sm font-normal text-primary/60">
                We are completing your checkout, please wait ...
              </p>
            </div>
          </div>
          <div className="flex w-full px-6">
            <div className="w-full border-b border-border" />
          </div>
          <div className="relative mx-auto flex w-full flex-col items-center p-6">
            <div className="relative flex w-full flex-col items-center justify-center gap-6 overflow-hidden rounded-lg border border-border bg-secondary px-6 py-24 dark:bg-card">
              <div className="z-10 flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-card">
                  <Loader2 className="h-8 w-8 animate-spin stroke-[1.5px] text-primary/60" />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <p className="text-center text-base font-medium text-primary">
                    Processing your Direct plan purchase...
                  </p>
                </div>
              </div>
              <div className="z-10 flex items-center justify-center">
                <Link
                  to={DashboardRoute.fullPath}
                  className={`${buttonVariants({ variant: "ghost", size: "sm" })} gap-2`}
                >
                  <span className="text-sm font-medium text-primary/60 group-hover:text-primary">
                    Return to Dashboard
                  </span>
                  <ExternalLink className="h-4 w-4 stroke-[1.5px] text-primary/60 group-hover:text-primary" />
                </Link>
              </div>
              <div className="base-grid absolute h-full w-full opacity-40" />
              <div className="absolute bottom-0 h-full w-full bg-gradient-to-t from-[hsl(var(--card))] to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/_app/_auth/dashboard/_layout.checkout.tsx
git commit -m "feat: simplify checkout page for Direct plan"
```

---

### Task 12: Remove Stripe References from Landing Page

**Files:**
- Modify: `src/routes/index.tsx`

- [ ] **Step 1: Replace "Stripe integration" text and remove Stripe logo**

In `src/routes/index.tsx`, change line 140 from:
```
<br className="hidden lg:inline-block" /> Stripe integration.
```
to:
```
<br className="hidden lg:inline-block" /> Dodo Payments integration.
```

Remove the Stripe SVG logo block (lines 378-398) from the landing page.

- [ ] **Step 2: Commit**

```bash
git add src/routes/index.tsx
git commit -m "refactor: replace Stripe references with Dodo Payments on landing page"
```

---

### Task 13: Update Email Templates

**Files:**
- Modify: `convex/email/templates/subscriptionEmail.tsx`

- [ ] **Step 1: Replace "PRO" references with "Direct"**

In `subscriptionEmail.tsx`:
- Line 29: Change `Successfully Subscribed to PRO` to `Successfully Subscribed to Direct`
- Line 48: Change `subscription to PRO` to `subscription to Direct`
- Line 88: Change `subscription to PRO tier` to `subscription to Direct`
- Line 127: Change `Successfully Subscribed to PRO` to `Successfully Subscribed to Direct`
- Line 140: Change `Subscription Issue - Customer Support` to `Subscription Issue`

- [ ] **Step 2: Commit**

```bash
git add convex/email/templates/subscriptionEmail.tsx
git commit -m "refactor: update email templates from PRO to Direct"
```

---

### Self-Review Checklist

- [ ] Spec coverage: Every section in the design doc has a corresponding task (schema, env, convex.config, dodo.ts, payments.ts, http.ts, app.ts, stripe.ts removal, errors/types, billing page, checkout page, landing page, email templates)
- [ ] Placeholder scan: No TBDs, TODOs, or vague instructions
- [ ] Type consistency: All API references match (`api.payments.*`, `internal.payments.*`, `api.app.getCurrentUser`)
- [ ] The `userId` field in `convex/payments.ts` is stored as `identity.subject` (string), which matches how Clerk auth works in this codebase
