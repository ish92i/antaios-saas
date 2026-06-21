# Clerk Auth Migration Design

## Overview

Replace the existing Convex Auth (`@convex-dev/auth`) with Clerk as the authentication provider. Clerk handles user identities, sessions, and organizations. Convex trusts Clerk's JWTs. App-specific user data (username, customerId, subscription) is stored in a Convex `users` table linked by Clerk's userId.

## Scope

- Replace Convex Auth with Clerk for authentication
- Use Clerk `<SignIn />` component on the existing login page
- Use Clerk `<UserButton />`, `<OrganizationSwitcher />` for account/org management
- Keep Convex backend for app data (users, subscriptions, plans, Stripe integration)
- Keep Resend for subscription notification emails
- Remove OTP auth, Resend OTP provider, and related Convex auth machinery

---

## 1. Backend Schema Changes

### `convex/schema.ts`

- **Remove:** `...authTables` spread (Clerk manages auth state, not Convex)
- **Remove from `users` table:** `phone`, `phoneVerificationTime`, `emailVerificationTime`, `isAnonymous` (Clerk manages these)
- **Keep in `users`:** `name`, `username`, `imageId`, `image`, `email`, `customerId`
- **Add to `users`:** `clerkUserId: v.string()` — links Clerk's user identity to the app record
- **Add index:** `.index("clerkUserId", ["clerkUserId"])`

Updated `users` table:
```
users: defineTable({
  clerkUserId: v.string(),
  name: v.optional(v.string()),
  username: v.optional(v.string()),
  imageId: v.optional(v.id("_storage")),
  image: v.optional(v.string()),
  email: v.optional(v.string()),
  customerId: v.optional(v.string()),
})
  .index("clerkUserId", ["clerkUserId"])
  .index("email", ["email"])
  .index("customerId", ["customerId"]),
```

`plans` and `subscriptions` tables remain unchanged.

---

## 2. Backend Auth Layer

### Remove files

- `convex/auth.ts` — convexAuth from `@convex-dev/auth/server` is no longer used
- `convex/auth.config.ts` — provider domain config no longer needed
- `convex/otp/ResendOTP.ts` — OTP auth provider removed
- `convex/otp/VerificationCodeEmail.tsx` — OTP email template removed

### New `convex/auth.ts` (replacement)

A minimal helper that wraps `ctx.auth.getUserIdentity()` (Clerk's identity accessor in Convex):

- `getUserId(ctx)` → returns Clerk's `subject` (userId) or null
- `getCurrentUser(ctx)` → looks up the user in `users` table by `clerkUserId`, creates a record if one doesn't exist

### Update backend files

**`convex/app.ts`:**
- Replace every `auth.getUserId(ctx)` with `getUserId(ctx)` from the new auth helper
- `getCurrentUser` query now uses the Clerk identity to look up/create the user
- `deleteCurrentUserAccount` no longer deletes from `authAccounts` table (Clerk manages that)

**`convex/stripe.ts`:**
- Replace `auth.getUserId(ctx)` in `getCurrentUserSubscription` and `createCustomerPortal`
- Keep all PREAUTH/UNAUTH functions unchanged (they use internal APIs)

**`convex/http.ts`:**
- Remove `auth.addHttpRoutes(http)` — Clerk handles auth HTTP routes
- Keep Stripe webhook handling, subscription email sending

### Environment variables

**Remove from Convex dashboard env vars:**
- `AUTH_RESEND_KEY`
- `AUTH_EMAIL`

**Add to Convex dashboard env vars:**
- `CLERK_ISSUER_URL` = `https://<your-clerk-instance>.clerk.accounts.dev`

**Add to `.env.local`:**
- `VITE_CLERK_PUBLISHABLE_KEY` = `pk_test_...`

---

## 3. Frontend Provider Setup

### Dependencies

**Add:**
- `@clerk/clerk-react` — Clerk React SDK

**Remove:**
- `@convex-dev/auth` — no longer needed (Clerk replaces it)
- `@auth/core` — no longer needed (Clerk handles OAuth)
- `oslo` — no longer needed (was used for OTP code generation)

### `src/app.tsx`

- **Replace** `ConvexAuthProvider` from `@convex-dev/auth/react`
- **Wrap with** `ClerkProvider` (provides Clerk context to the app)
- **Wrap with** `ConvexProviderWithClerk` from `convex/react-clerk` (bridges Clerk JWTs to Convex)
- The `convex` client and `QueryClient` setup stay the same

```
ClerkProvider publishableKey={VITE_CLERK_PUBLISHABLE_KEY}>
  ConvexProviderWithClerk client={convex}>
    QueryClientProvider client={queryClient}>
      InnerApp />
    /QueryClientProvider>
  /ConvexProviderWithClerk>
/ClerkProvider>
```

### `src/routes/_app/_auth.tsx` (auth guard)

- Replace `useConvexAuth()` from `@convex-dev/react-query` with `useAuth()` from `@clerk/clerk-react`
- `useAuth()` returns `{ isSignedIn, isLoaded }` — maps to `{ isAuthenticated, isLoading }`
- Redirect to `/login` when not signed in

### `src/utils/misc.ts`

- Replace `useAuthActions().signOut()` with `useClerk().signOut()`
- After sign out, invalidate router and navigate to `/login`

---

## 4. Login Page

### `src/routes/_app/login/_layout.index.tsx`

- Replace the entire custom form (email input, OTP verification, GitHub button) with Clerk's `<SignIn />` component
- `<SignIn />` handles email/password, social login (Google, GitHub, etc.), magic links — all on one page
- Remove the two-step flow logic (`signIn` → `verify` state machine)
- Remove `useAuthActions`, `useConvexAuth`, `useForm`, `zod` validators for email/code
- The `<SignIn />` component renders within the existing card layout

### `src/routes/_app/login/_layout.tsx`

- Remove `useConvexAuth()` loading check — Clerk's `ClerkProvider` handles global loading state
- Layout (two-panel: quote + form) stays the same

---

## 5. Navigation & Account/Org Management

### `src/routes/_app/_auth/dashboard/-ui.navigation.tsx`

- **Replace** the custom user dropdown with Clerk's `<UserButton />`
  - Shows avatar, username, email
  - Built-in manage account, sign out
- **Add** `<OrganizationSwitcher />` for org switching
- **Keep** `ThemeSwitcher` and `LanguageSwitcher` in the dropdown
- **Keep** subscription badge, plan info, and navigation tabs

### Account & Organization Management

Clerk provides these built-in components available at any route:
- `<UserProfile />` — full account management (password, security, connected accounts)
- `<OrganizationProfile />` — org settings, member management
- These can be rendered as pages or modals

**Plan:** Add `<UserButton />` with `afterSignOutUrl="/login"` for the user menu. Add org management via `<OrganizationSwitcher />` and an optional `<OrganizationProfile />` route.

---

## 6. What Stay the Same

- TanStack Router setup and routing structure
- Convex queries/mutations for app data (with updated auth helper)
- Stripe integration (checkout, portal, webhooks)
- Subscription email notifications (via Resend)
- i18n, theme switching, and all UI components
- Dashboard routes (dashboard index, settings, billing, checkout)
- Onboarding flow (username setup, Stripe customer creation)
- File upload for avatars

---

## 7. Clerk Dashboard Setup (manual steps)

1. Create a Clerk application at https://clerk.com
2. Configure sign-in methods: email + password, Google, GitHub
3. Enable Organizations in Clerk settings
4. Add redirect URLs: `http://localhost:5173/*` (dev), production URL
5. Copy `CLERK_PUBLISHABLE_KEY` (frontend) and `CLERK_SECRET_KEY` (backend)
6. In Convex dashboard → Environment Variables, add:
   - `CLERK_ISSUER_URL` = `https://<instance>.clerk.accounts.dev`
7. In `.env.local`, add:
   - `VITE_CLERK_PUBLISHABLE_KEY=pk_test_...`

---

## Files Removed

- `convex/auth.ts` (old, replaced)
- `convex/auth.config.ts`
- `convex/otp/ResendOTP.ts`
- `convex/otp/VerificationCodeEmail.tsx`
- `@convex-dev/auth` package dependency
- `@auth/core` package dependency
- `oslo` package dependency

## Files Modified

- `convex/schema.ts` — update users table
- `convex/auth.ts` (rewritten) — Clerk auth helper
- `convex/app.ts` — use Clerk identity
- `convex/stripe.ts` — use Clerk identity
- `convex/http.ts` — remove auth HTTP routes
- `convex/init.ts` — no change (already clean)
- `convex/env.ts` — remove AUTH env vars
- `src/app.tsx` — ClerkProvider + ConvexProviderWithClerk
- `src/routes/_app/_auth.tsx` — useAuth from Clerk
- `src/routes/_app/login/_layout.tsx` — remove convexAuth
- `src/routes/_app/login/_layout.index.tsx` — Clerk SignIn
- `src/routes/_app/_auth/dashboard/-ui.navigation.tsx` — UserButton, OrgSwitcher
- `src/utils/misc.ts` — Clerk signOut
- `.env.local` — VITE_CLERK_PUBLISHABLE_KEY
- `package.json` — add @clerk/clerk-react, remove @convex-dev/auth, @auth/core, oslo

## Files Added

- None new — all changes are modifications or removals of existing files
