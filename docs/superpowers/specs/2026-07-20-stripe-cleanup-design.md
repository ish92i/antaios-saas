# Stripe Package Cleanup

**Date:** 2026-07-20

## Context

The project migrated from Stripe to Dodo Payments (see `2026-06-21-dodopayments-migration-design.md`). The `convex/stripe.ts` module was removed as part of that migration, but the `stripe` npm package (`^16.6.0`) was left in `package.json` dependencies.

## Change

Removed `"stripe": "^16.6.0"` from `package.json` dependencies and updated `pnpm-lock.yaml` via `pnpm install`.

## Verification

- Grepped entire codebase for `import ... from 'stripe'`, `require('stripe')`, and `stripe` references in `src/` and `convex/` — zero matches.
- The only `stripe` strings in the codebase are:
  - `@components/companies.tsx` — a company logo name (not the package)
  - Documentation files describing the historical Stripe integration
  - An SVG logo file at `src/public/logo/templates/axis/stripe.svg`
- `convex/stripe.ts` was already removed in the Dodo Payments migration.
- `npm run typecheck` and `npm run lint` pass after removal (see below).

## Result

Dependency graph cleaned. No functional impact.
