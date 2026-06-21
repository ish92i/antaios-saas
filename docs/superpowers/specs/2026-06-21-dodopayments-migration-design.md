# Dodo Payments Migration Design

## Overview

Replace Stripe with Dodo Payments as the payment provider. Simplify the billing model to a single "Direct" plan where the product ID is configured via an environment variable. Remove the `plans` table and all Stripe-specific schema fields. Use the `@dodopayments/convex` Convex component for checkout, customer portal, and webhook handling.

## Scope

- Replace Stripe SDK with `@dodopayments/convex` component
- Remove `plans` table — plan ID comes from `DIRECT_PLAN_ID` env var
- Strip `subscriptions` table to minimal fields (userId, dodoSubscriptionId, dodoProductId, planName, status, email)
- Remove `customerId` from `users` table
- Remove `convex/init.ts` seed script (no Stripe products to create)
- Rewrite `convex/http.ts` webhooks for Dodo Payments
- Create `convex/dodo.ts` with DodoPayments component setup
- Create `convex/payments.ts` with API actions
- Simplify frontend billing/checkout pages
- Update `convex/env.ts` environment variables

---

## 1. Backend Schema Changes

### `convex/schema.ts`

**Remove:** `plans` table entirely.

**Remove from `subscriptions` table:** `planId`, `priceStripeId`, `stripeId`, `currency`, `interval`, `currentPeriodStart`, `currentPeriodEnd`, `cancelAtPeriodEnd`.

**Remove from `subscriptions` indexes:** `stripeId`.

**Remove from `users` table:** `customerId`, `customerId` index.

**New `subscriptions` table:**
```
subscriptions: defineTable({
  userId: v.id("users"),
  dodoSubscriptionId: v.optional(v.string()),
  dodoProductId: v.optional(v.string()),
  planName: v.optional(v.string()),
  status: v.optional(v.string()),
  email: v.optional(v.string()),
})
  .index("userId", ["userId"])
  .index("dodoSubscriptionId", ["dodoSubscriptionId"])
```

### `convex/env.ts`

**Remove:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.

**Add:** `DODO_PAYMENTS_API_KEY`, `DODO_PAYMENTS_ENVIRONMENT`, `DODO_PAYMENTS_WEBHOOK_SECRET`, `DIRECT_PLAN_ID`, `APP_URL`.

---

## 2. Convex Config & Dodo Component

### `convex/convex.config.ts` (new)

Register the `@dodopayments/convex` component:
```ts
import { defineApp } from "convex/server";
import dodopayments from "@dodopayments/convex/convex.config";

const app = defineApp();
app.use(dodopayments);
export default app;
```

### `convex/dodo.ts` (new)

Instantiate `DodoPayments` with:
- `identify` function mapping Clerk `identity.subject` to a Dodo customer ID
- `apiKey` and `environment` from env vars
- Export `checkout` and `customerPortal` from `dodo.api()`
- Export `planNameFromProductId` helper (returns "Direct" when product ID matches `DIRECT_PLAN_ID` env var, otherwise "Inconnu")

---

## 3. Payment Actions

### `convex/payments.ts` (new)

Contains all payment-related Convex functions:

| Function | Type | Purpose |
|---|---|---|
| `createCheckoutSession` | action | Creates Dodo checkout for Direct plan using `DIRECT_PLAN_ID`. Takes optional `orgId`. Inserts pending subscription. Returns `{ checkoutUrl }`. |
| `getCustomerPortal` | action | Returns Dodo customer portal URL. |
| `getUserSubscription` | query | Returns user's subscription (public, no auth requirement returns null). |
| `storeSubscription` | mutation | Upserts subscription record (called from frontend). |
| `storeSubscriptionFromWebhook` | internal mutation | Creates/updates subscription from webhook events. |
| `updateSubscriptionStatus` | mutation | Updates subscription status. |
| `updateSubscriptionStatusFromWebhook` | internal mutation | Updates status from webhook events. |
| `updateSubscriptionPlan` | internal mutation | Updates product ID and plan name (for plan changes). |

### `convex/app.ts`

- **Remove** `completeOnboarding` mutation's Stripe customer creation (`internal.stripe.PREAUTH_createStripeCustomer`)
- **Remove** `deleteCurrentUserAccount` mutation's Stripe subscription cancellation
- **Keep** `getCurrentUser` query but simplify — no plan lookup, just check subscription status
- **Remove** `getActivePlans` query (no plans table)
- **Remove** references to `PLANS` constant and imports from `@cvx/schema`

### `convex/auth.ts` / auth flow

- When a user signs up, no subscription is created automatically — they will be paywalled until they purchase Direct.

---

## 4. Webhook Handling

### `convex/http.ts` (rewritten)

Replace Stripe webhook with `createDodoWebhookHandler` from `@dodopayments/convex`:

| Event | Handler |
|---|---|
| `onSubscriptionActive` | Upsert subscription with status "active". Uses metadata `convex_user_id` if available, otherwise updates by subscription ID. |
| `onPaymentSucceeded` | Updates subscription status to "active" if subscription_id present. |
| `onSubscriptionPlanChanged` | Updates product ID and plan name. |
| `onSubscriptionCancelled` | Updates status to "canceled". |
| `onSubscriptionExpired` | Updates status to "expired". |

Route: `POST /webhooks/dodoWebhook`

### `convex/init.ts` (removed)

No Stripe products to seed — the Direct plan's product ID is configured via `DIRECT_PLAN_ID` env var in Dodo Payments dashboard.

---

## 5. Frontend Changes

### `src/routes/_app/_auth/dashboard/_layout.settings.billing.tsx`

- Replace `api.stripe.createSubscriptionCheckout` with `api.dodo.createCheckoutSession`
- Replace `api.stripe.createCustomerPortal` with `api.dodo.getCustomerPortal`
- Remove plan comparison UI (only Direct plan)
- Show subscription status: if no subscription, show "No active plan" with a "Purchase Direct" CTA
- If subscribed, show plan name "Direct" and status
- Remove Stripe test card references

### `src/routes/_app/_auth/dashboard/_layout.checkout.tsx`

- Simplify: no free/pro plan switching
- Loading state while checkout URL is being generated
- Redirect to Dodo checkout URL

### `src/routes/index.tsx`

- Remove Stripe logo/references from landing page

### `types.ts`

- Update `User` type — `subscription` no longer has `planKey` (plans table removed)

---

## 6. Files to Remove

- `convex/stripe.ts` — all Stripe logic
- `convex/init.ts` — Stripe seed script
- `convex/email/templates/subscriptionEmail.tsx` (if Stripe-specific, otherwise keep)

## 7. Files to Create

- `convex/convex.config.ts` — Dodo component registration
- `convex/dodo.ts` — DodoPayments component setup
- `convex/payments.ts` — payment actions/queries/mutations

## 8. Environment Variables

### Removed
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### Added
- `DODO_PAYMENTS_API_KEY` — Dodo Payments API key
- `DODO_PAYMENTS_ENVIRONMENT` — `test_mode` or `live_mode`
- `DODO_PAYMENTS_WEBHOOK_SECRET` — Webhook verification secret
- `DIRECT_PLAN_ID` — Dodo product ID for the Direct plan
- `APP_URL` — Application base URL (for return URLs)
