# Admin Dashboard Design

## Overview

A simple password-protected admin dashboard for the Antaios platform. Password-based auth using a shared secret, stored as SHA-256 hash in Convex env var `ADMIN_SECRET_HASH`. No Clerk integration needed for admin.

## Auth Mechanism

- Password is `Abcdefg1234@@@@@` (hash: `e1185763c4d60ceaed981c88d784ada297c1581ce7d761855fdd6fac7bc2c575`)
- Hash stored in Convex env var `ADMIN_SECRET_HASH`
- Frontend stores raw password in `sessionStorage` after successful login
- Every Convex admin query receives `adminSecret` argument, hashes it server-side, compares with env var
- Login form POSTs to a Convex query (`admin.verifySecret`) to validate without revealing data

## Route Structure

All admin routes are direct children of root (not under `_app` auth layout):

| Route | File | Purpose |
|-------|------|---------|
| `/admin` | `admin.tsx` | Layout with password gate + sidebar nav |
| `/admin/` | `admin.index.tsx` | Overview dashboard with stats |
| `/admin/login` | `admin.login.tsx` | Password entry form |
| `/admin/users` | `admin.users.tsx` | User list with search |
| `/admin/organizations` | `admin.organizations.tsx` | Org list |
| `/admin/subscriptions` | `admin.subscriptions.tsx` | Subscription list with filter |
| `/admin/shipments` | `admin.shipments.tsx` | All shipments with filter |

## Convex Queries (`convex/admin.ts`)

All queries accept `adminSecret: v.string()` and verify via `verifyAdminSecret(ctx, adminSecret)`:

- `verifySecret` — quick validation query, returns `{ valid: boolean }`
- `getStats` — returns `{ totalUsers, totalOrgs, totalSubscriptions, totalShipments, activeSubscriptions, shipmentsByStatus }`
- `listUsers` — args: `{ search?: string }`, returns users with subscription info
- `getUserDetail` — args: `{ userId }`, returns user + subscription + org
- `listOrganizations` — args: `{}`, returns orgs with subscription
- `getOrganizationDetail` — args: `{ orgId }`, returns org + subscriptions + shipment count
- `listSubscriptions` — args: `{ statusFilter?: string }`, returns subscriptions with org name
- `listAllShipments` — args: `{ statusFilter?: string, orgId?: string }`, returns all shipments

## Frontend Components

- **AdminLayout** (`admin.tsx`): checks sessionStorage for password on mount & route changes; redirects to `/admin/login` if missing; renders sidebar nav + `<Outlet />`
- **AdminLoginPage** (`admin.login.tsx`): simple form with password input, calls `verifySecret` on submit, stores in sessionStorage on success
- **AdminDashboard** (`admin.index.tsx`): stat cards (total users, orgs, shipments, subscriptions, active subs), simple bar chart of shipments by status
- **AdminUsersPage** (`admin.users.tsx`): search input + table of users showing name, email, subscription status, org membership
- **AdminOrganizationsPage** (`admin.organizations.tsx`): table of orgs with name, member count, subscription info
- **AdminSubscriptionsPage** (`admin.subscriptions.tsx`): status filter tabs + table of subscriptions with org, plan, status, email
- **AdminShipmentsPage** (`admin.shipments.tsx`): status/org filter + table of all shipments

## UI Patterns

- Reuse existing `@/components/ui/button`, `@/components/ui/badge` components
- Use `@/lib/utils` `cn()` helper
- Tailwind CSS v4 styling consistent with existing dashboard
- Simple sidebar nav with Tabler icons
- Tables with consistent spacing and styling

## Security Notes

- Password hash is stored in Convex env var (not in code)
- Frontend never stores hash — stores raw password in sessionStorage (cleared on tab close)
- Every admin query validates the secret server-side
- No Clerk dependency for admin routes
- Admin routes are outside the `_app` auth layout tree entirely
