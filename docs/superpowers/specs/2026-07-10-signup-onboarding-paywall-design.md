# Signup, Onboarding & Paywall Experience Design

## Overview

Delightful signup-to-paid flow for Antaios with a hard paywall after value is demonstrated (1 free shipment).

## Flow

```
Signup (Clerk, polished appearance)
  → Onboarding (2-step org form)
    → Dashboard (free — 1 shipment quota)
      → Create 1st shipment → complete full flow
        → Paywall overlay on 2nd shipment attempt
          → Purchase Direct (€500/mo) → full access
```

## 1. Signup Experience (Login Page)

- **File**: `src/routes/_app/login/_layout.index.tsx` + `_layout.tsx`
- Clerk `<SignIn>` component with custom `appearance` prop (brand colors, fonts, rounded elements)
- **Animations**: Form slides in on mount (CSS transition)
- **Value prop**: Tagline above Clerk form: "EUDR Compliance, Simplified" + short benefit line
- **Social proof**: "Trusted by [X] companies" micro-text below form
- **Loading state**: Skeleton while Clerk component loads
- **Transitions**: Smooth fade between SignIn/SignUp modes
- **No changes to signup URL or redirect logic** — stays on Clerk free plan

## 2. Onboarding Flow (Organization Form)

- **File**: `src/routes/_app/_auth/onboarding/_layout.organization.tsx` + `_layout.tsx`
- **Progressive disclosure**: 2 steps with step indicator
  - Step 1: EORI Number (validated), Country (dropdown)
  - Step 2: Phone (country code), Address (textarea)
- **Microcopy**: Each field explains why it's needed
- **Animations**: Fields fade/slide per step, progress bar fills
- **Success state**: Checkmark animation on submit → smooth redirect to dashboard
- **Error handling**: Inline validation per field, clear messages

## 3. Paywall Overlay

- **File**: `src/routes/_app/_auth/dashboard/_layout.tsx`
- **Check**: `api.payments.getUserSubscription` on mount
- **Condition**: If status !== `"active"` AND user has >= 1 completed shipment → show overlay
- **Design**: Full-screen centered card with backdrop blur of dashboard behind
  - Logo + "Upgrade to Direct" headline
  - Value prop paragraph
  - Feature comparison (3-4 bullets: shipments, deforestation scanning, risk assessment, etc.)
  - Pricing: "€500/month — Cancel anytime"
  - **CTA**: "Purchase Direct" → calls `createCheckoutSession` → Dodo checkout
  - **No dismiss option** — hard gate
  - **"Already subscribed?"** link for webhook delay edge case
- **Exempt routes from overlay**: `/dashboard/settings/billing`, `/dashboard/checkout`
- **Mobile**: Same overlay, full-width, bottom-sheet style, scrollable

## 4. Post-Purchase Flow

- **CTA**: calls `createCheckoutSession` (Convex action) → `checkoutUrl` → opens in same tab
- **Processing page**: `/dashboard/checkout` shows spinner + "Processing your purchase..."
- **Webhook**: `onSubscriptionActive` → stores subscription as `"active"`
- **Dashboard**: Re-fetches subscription → sees `"active"` → overlay gone → full access
- **Celebration**: Subtle success toast on first dashboard load after purchase
- **Edge cases**:
  - Webhook delay → "Already subscribed?" re-checks
  - Payment failed → error state, retry
  - Expired subscription → overlay returns with renewal copy

## 5. Shipment Quota (Free Tier)

- **File**: `convex/shipments.ts` (query)
- **Logic**: Count shipments for org. If >= 1 AND no active subscription → block creation
- **Frontend**: Show upgrade prompt in create shipment UI or let paywall handle it
- Paywall overlay appears when trying to create shipment #2

## Data Model Changes

None required. Existing `subscriptions` table (orgId, status, planName) covers needs.

## Convex Changes

- `convex/payments.ts`: Add `getUserSubscription` query (already exists — verify)
- `convex/shipments.ts`: Add `getShipmentCount` query for quota check
- `convex/http.ts`: Webhooks already handle subscription lifecycle

## Routes & Components

| Route | Component | Auth | Paywall |
|-------|-----------|------|---------|
| `/login` | LoginLayout | No | N/A |
| `/onboarding/organization` | OrganizationForm | Yes | N/A |
| `/dashboard/shipments` | ShipmentsPage | Yes | Hard gate (after 1 shipment) |
| `/dashboard/settings/billing` | BillingPage | Yes | Exempt |
| `/dashboard/checkout` | CheckoutPage | Yes | Exempt |
| `/dashboard/*` | (other routes) | Yes | Hard gate |
