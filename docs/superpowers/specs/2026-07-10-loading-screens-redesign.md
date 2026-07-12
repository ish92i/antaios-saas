# Loading Screens Redesign

## Problem

Text-based centered cards (border + bg-card + shadow-sm + h1 + p pattern)
are used for all loading/auth-transition states. They look like debug
placeholders rather than intentional design.

Affected screens:
- Dashboard layout loading ("Loading dashboard" card)
- Auth flow ("Redirecting to sign in...", "Waiting for auth",
  "Preparing workspace", skeleton-pulse card)
- Checkout processing (text-in-card with spinner)

## Approach

Replace centered text cards with **full-page skeleton screens** that
mirror the real page layout.

## Components

### LoadingDashboard (`src/routes/_app/_auth/dashboard/`)
Replaces lines 34-44 of `_layout.tsx`. No text.

- Sticky nav skeleton bar (full-width, border-bottom):
  - Logo placeholder (36x36 rounded square pulse block)
  - Org switcher pill skeleton (h-8 w-32 pulse)
  - User avatar circle (h-11 w-11 pulse)
- Two-panel body:
  - Left w-96: search skeleton bar + 5 shipment-row skeletons
    (each: checkbox pulse + 3 text-line pulses)
  - Right flex-1: empty muted panel (no idle text — skeleton
    already communicates loading)

### LoadingAuth (`src/routes/_app/_auth/`)
Replaces lines 151-246 of `_auth.tsx`. Single component, no text.

- Full-viewport centered, no card, no border
- Antaios logo (Logo component, 48x48) with a soft pulse ring
  (ring-2 ring-primary/20 animate-pulse rounded-full)
- The logo + animation is the loading signal — text would be
  redundant
- Error states remain as-is (actual error UI, not loading)

### LoadingCheckout (`src/routes/_app/_auth/dashboard/checkout`)
Refines lines 12-60 of `_layout.checkout.tsx`.

- Same page layout (max-w-screen-xl, card border)
- Remove "Completing your Checkout" header section
- Remove text entirely
- Centered loading area with logo mark (h-12 w-12) with subtle
  rotation animation instead of Loader2 — no text below

## Implementation Order

1. Create `LoadingDashboard` in dashboard layout file (inline)
2. Create `LoadingAuth` component
3. Refine checkout loading inline
4. Replace all text-card loading states in `_auth.tsx` with
   `LoadingAuth` calls

## Files Changed

- `src/routes/_app/_auth/dashboard/_layout.tsx`
- `src/routes/_app/_auth.tsx`
- `src/routes/_app/_auth/dashboard/_layout.checkout.tsx`
