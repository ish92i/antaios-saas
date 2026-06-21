# Clerk Auth Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Convex Auth (`@convex-dev/auth`) with Clerk for authentication, using Clerk's `<SignIn />`, `<UserButton />`, and `<OrganizationSwitcher />` components.

**Architecture:** Clerk manages auth entirely — Convex trusts Clerk's JWTs via `ConvexProviderWithClerk`. A `convex/auth.ts` helper wraps `ctx.auth.getUserIdentity()` and manages a `users` table linked by `clerkUserId`. Existing app queries use the new helper. Subscription email notifications via Resend are kept.

**Tech Stack:** Vite + React 18 + TanStack Router + Convex + Clerk + shadcn/ui + Tailwind CSS v4

---

### Task 1: Update dependencies & remove old auth files

**Files:**
- Modify: `package.json`
- Remove: `convex/auth.ts`, `convex/auth.config.ts`, `convex/otp/ResendOTP.ts`, `convex/otp/VerificationCodeEmail.tsx`

- [ ] **Step 1: Remove old packages and install Clerk**

```bash
pnpm remove @convex-dev/auth @auth/core oslo
pnpm add @clerk/clerk-react@latest
```

- [ ] **Step 2: Remove old auth files**

```bash
rm convex/auth.ts convex/auth.config.ts
rm -rf convex/otp
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "chore: remove @convex-dev/auth, install @clerk/clerk-react"
```

---

### Task 2: Update Convex schema

**Files:**
- Modify: `convex/schema.ts`

- [ ] **Step 1: Update `convex/schema.ts`**

Replace the entire file content:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v, Infer } from "convex/values";

export const CURRENCIES = {
  USD: "usd",
  EUR: "eur",
} as const;
export const currencyValidator = v.union(
  v.literal(CURRENCIES.USD),
  v.literal(CURRENCIES.EUR),
);
export type Currency = Infer<typeof currencyValidator>;

export const INTERVALS = {
  MONTH: "month",
  YEAR: "year",
} as const;
export const intervalValidator = v.union(
  v.literal(INTERVALS.MONTH),
  v.literal(INTERVALS.YEAR),
);
export type Interval = Infer<typeof intervalValidator>;

export const PLANS = {
  FREE: "free",
  PRO: "pro",
} as const;
export const planKeyValidator = v.union(
  v.literal(PLANS.FREE),
  v.literal(PLANS.PRO),
);
export type PlanKey = Infer<typeof planKeyValidator>;

const priceValidator = v.object({
  stripeId: v.string(),
  amount: v.number(),
});
const pricesValidator = v.object({
  [CURRENCIES.USD]: priceValidator,
  [CURRENCIES.EUR]: priceValidator,
});

const schema = defineSchema({
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
  plans: defineTable({
    key: planKeyValidator,
    stripeId: v.string(),
    name: v.string(),
    description: v.string(),
    prices: v.object({
      [INTERVALS.MONTH]: pricesValidator,
      [INTERVALS.YEAR]: pricesValidator,
    }),
  })
    .index("key", ["key"])
    .index("stripeId", ["stripeId"]),
  subscriptions: defineTable({
    userId: v.id("users"),
    planId: v.id("plans"),
    priceStripeId: v.string(),
    stripeId: v.string(),
    currency: currencyValidator,
    interval: intervalValidator,
    status: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
  })
    .index("userId", ["userId"])
    .index("stripeId", ["stripeId"]),
});

export default schema;
```

Changes: removed `authTables` spread, removed `phone`/`phoneVerificationTime`/`emailVerificationTime`/`isAnonymous` fields, added `clerkUserId` with index.

- [ ] **Step 2: Commit**

```bash
git add convex/schema.ts && git commit -m "feat: update users schema for Clerk"
```

---

### Task 3: Rewrite `convex/auth.ts` with Clerk-based helper

**Files:**
- Create: `convex/auth.ts` (rewrite)

- [ ] **Step 1: Write `convex/auth.ts`**

```typescript
import { QueryCtx, MutationCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

export async function getUserId(
  ctx: QueryCtx | MutationCtx,
): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const user = await ctx.db
    .query("users")
    .withIndex("clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
    .unique();

  return user?._id ?? null;
}

export async function ensureUser(
  ctx: MutationCtx,
): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const existing = await ctx.db
    .query("users")
    .withIndex("clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
    .unique();

  if (existing) return existing;

  const userId = await ctx.db.insert("users", {
    clerkUserId: identity.subject,
    name: identity.name ?? undefined,
    email: identity.email ?? undefined,
    image: identity.pictureUrl ?? undefined,
  });

  return (await ctx.db.get(userId)) as Doc<"users">;
}
```

- [ ] **Step 2: Commit**

```bash
git add convex/auth.ts && git commit -m "feat: rewrite convex/auth.ts with Clerk identity helper"
```

---

### Task 4: Update `convex/env.ts`

**Files:**
- Modify: `convex/env.ts`

- [ ] **Step 1: Strip auth env vars, keep Stripe**

```typescript
export const SITE_URL = process.env.SITE_URL;
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
```

Removed: `AUTH_RESEND_KEY`, `AUTH_EMAIL`, `HOST_URL`.

- [ ] **Step 2: Commit**

```bash
git add convex/env.ts && git commit -m "chore: remove auth env vars from convex/env.ts"
```

---

### Task 5: Update `convex/app.ts` for Clerk identity

**Files:**
- Modify: `convex/app.ts`

- [ ] **Step 1: Rewrite `convex/app.ts`**

Replace entire file:

```typescript
import { internal } from "@cvx/_generated/api";
import { mutation, query } from "@cvx/_generated/server";
import { currencyValidator, PLANS } from "@cvx/schema";
import { asyncMap } from "convex-helpers";
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
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .unique();

    const plan = subscription?.planId
      ? await ctx.db.get(subscription.planId)
      : undefined;
    const avatarUrl = user.imageId
      ? await ctx.storage.getUrl(user.imageId)
      : user.image;
    return {
      ...user,
      avatarUrl: avatarUrl || undefined,
      subscription:
        subscription && plan
          ? {
              ...subscription,
              planKey: plan.key,
            }
          : undefined,
    };
  },
});

export const createUserIfNeeded = mutation({
  args: {},
  handler: async (ctx) => {
    return (await ensureUser(ctx))?._id;
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
    currency: currencyValidator,
  },
  handler: async (ctx, args) => {
    const user = await ensureUser(ctx);
    if (!user) return;

    await ctx.db.patch(user._id, { username: args.username });
    if (user.customerId) return;

    await ctx.scheduler.runAfter(
      0,
      internal.stripe.PREAUTH_createStripeCustomer,
      {
        currency: args.currency,
        userId: user._id,
      },
    );
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

export const getActivePlans = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const [free, pro] = await asyncMap(
      [PLANS.FREE, PLANS.PRO] as const,
      (key) =>
        ctx.db
          .query("plans")
          .withIndex("key", (q) => q.eq("key", key))
          .unique(),
    );
    if (!free || !pro) {
      throw new Error("Plan not found");
    }
    return { free, pro };
  },
});

export const deleteCurrentUserAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return;

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .unique();
    if (!subscription) {
      console.error("No subscription found");
    } else {
      await ctx.db.delete(subscription._id);
      await ctx.scheduler.runAfter(
        0,
        internal.stripe.cancelCurrentUserSubscriptions,
      );
    }
    await ctx.db.delete(userId);
  },
});
```

Key changes:
- `getCurrentUser` uses `ctx.auth.getUserIdentity()` + clerkUserId lookup instead of `auth.getUserId(ctx)`
- New `createUserIfNeeded` mutation calls `ensureUser`
- `getUserId` helper replaces `auth.getUserId(ctx)` in all mutations
- `ensureUser` is used in `completeOnboarding` to auto-create user record on first onboarding
- `deleteCurrentUserAccount` no longer deletes from `authAccounts` table
- `getActivePlans` uses `ctx.auth.getUserIdentity()` for auth check

- [ ] **Step 2: Commit**

```bash
git add convex/app.ts && git commit -m "feat: update convex/app.ts for Clerk identity"
```

---

### Task 6: Update `convex/stripe.ts` for Clerk identity

**Files:**
- Modify: `convex/stripe.ts`

- [ ] **Step 1: Update imports and auth calls**

Replace the import `import { auth } from "@cvx/auth"` with `import { getUserId } from "@cvx/auth"`.

Replace `auth.getUserId(ctx)` with `getUserId(ctx)` in two places:
- `getCurrentUserSubscription` internal query (line 278)
- `createCustomerPortal` action (line 355)

**`getCurrentUserSubscription` change:**
```typescript
export const getCurrentUserSubscription = internalQuery({
  args: {
    planId: v.id("plans"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error(ERRORS.STRIPE_SOMETHING_WENT_WRONG);
    }
    // ... rest stays the same (using userId)
  },
});
```

**`createCustomerPortal` change:**
```typescript
export const createCustomerPortal = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return;
    // ... rest stays the same
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add convex/stripe.ts && git commit -m "feat: update convex/stripe.ts for Clerk identity"
```

---

### Task 7: Update `convex/http.ts`

**Files:**
- Modify: `convex/http.ts`

- [ ] **Step 1: Remove `auth.addHttpRoutes(http)` and auth import**

Remove the import `import { auth } from "./auth"` and the line `auth.addHttpRoutes(http);` at the bottom.

Also remove the import `import { ERRORS } from "~/errors"` if it's no longer needed (it is — keep it for Stripe errors).

The file should end with:
```typescript
http.route({ ... });
export default http;
```

Without the `auth.addHttpRoutes(http);` line.

- [ ] **Step 2: Commit**

```bash
git add convex/http.ts && git commit -m "feat: remove auth HTTP routes from convex/http.ts"
```

---

### Task 8: Update `src/app.tsx` — ClerkProvider + ConvexProviderWithClerk

**Files:**
- Modify: `src/app.tsx`

- [ ] **Step 1: Rewrite `src/app.tsx`**

```typescript
import { ConvexReactClient } from "convex/react";
import { ClerkProvider } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { RouterProvider } from "@tanstack/react-router";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { router } from "@/router";
import "@/i18n";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

const convexQueryClient = new ConvexQueryClient(convex);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
    },
  },
});

convexQueryClient.connect(queryClient);

const CLERK_PUBLISHABLE_KEY = import.meta.env
  .VITE_CLERK_PUBLISHABLE_KEY as string;

function InnerApp() {
  return <RouterProvider router={router} context={{ queryClient }} />;
}

const helmetContext = {};

export default function App() {
  return (
    <HelmetProvider context={helmetContext}>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <ConvexProviderWithClerk client={convex}>
          <QueryClientProvider client={queryClient}>
            <InnerApp />
          </QueryClientProvider>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </HelmetProvider>
  );
}
```

Changes:
- Removed `import { ConvexAuthProvider } from "@convex-dev/auth/react"`
- Added `import { ClerkProvider } from "@clerk/clerk-react"`
- Added `import { ConvexProviderWithClerk } from "convex/react-clerk"`
- Added `VITE_CLERK_PUBLISHABLE_KEY` env var reading
- Wrapped with `ClerkProvider` > `ConvexProviderWithClerk` instead of `ConvexAuthProvider`

- [ ] **Step 2: Commit**

```bash
git add src/app.tsx && git commit -m "feat: add ClerkProvider + ConvexProviderWithClerk"
```

---

### Task 9: Update auth guard to use Clerk

**Files:**
- Modify: `src/routes/_app/_auth.tsx`

- [ ] **Step 1: Rewrite `src/routes/_app/_auth.tsx`**

```typescript
import { useAuth } from "@clerk/clerk-react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";

export const Route = createFileRoute("/_app/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const { mutate: createUser } = useMutation({
    mutationFn: useConvexMutation(api.app.createUserIfNeeded),
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate({ to: "/login" });
    }
    if (isLoaded && isSignedIn) {
      createUser({});
    }
  }, [isLoaded, isSignedIn, createUser, navigate]);

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return <Outlet />;
}
```

Changes:
- Replaced `useConvexAuth()` with `useAuth()` from Clerk
- `isSignedIn` ↔ `isAuthenticated`, `isLoaded` ↔ `isLoading`
- Added `createUserIfNeeded` mutation call to ensure user record exists in Convex
- Added `useMutation` + `useConvexMutation` imports

- [ ] **Step 2: Commit**

```bash
git add src/routes/_app/_auth.tsx && git commit -m "feat: update auth guard to use Clerk useAuth()"
```

---

### Task 10: Update login layout

**Files:**
- Modify: `src/routes/_app/login/_layout.tsx`

- [ ] **Step 1: Remove `useConvexAuth` from login layout**

Remove the import `import { useConvexAuth } from "convex/react"` and the loading check.

```typescript
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Logo } from "@/components/logo";

const HOME_PATH = "/";

const QUOTES = [
  {
    quote: "There is nothing impossible to they who will try.",
    author: "Alexander the Great",
  },
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    quote: "The best way to predict the future is to create it.",
    author: "Peter Drucker",
  },
  {
    quote:
      "The only limit to our realization of tomorrow will be our doubts of today.",
    author: "Franklin D. Roosevelt",
  },
  {
    quote: "The only thing we have to fear is fear itself.",
    author: "Franklin D. Roosevelt",
  },
];

const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

export const Route = createFileRoute("/_app/login/_layout")({
  component: LoginLayout,
});

function LoginLayout() {
  return (
    <div className="flex h-screen w-full">
      <div className="absolute left-1/2 top-10 mx-auto flex -translate-x-1/2 transform lg:hidden">
        <Link
          to={HOME_PATH}
          className="z-10 flex h-10 flex-col items-center justify-center gap-2"
        >
          <Logo />
        </Link>
      </div>
      <div className="relative hidden h-full w-[50%] flex-col justify-between overflow-hidden bg-card p-10 lg:flex">
        <Link to={HOME_PATH} className="z-10 flex h-10 w-10 items-center gap-1">
          <Logo />
        </Link>

        <div className="z-10 flex flex-col items-start gap-2">
          <p className="text-base font-normal text-primary">
            {randomQuote.quote}
          </p>
          <p className="text-base font-normal text-primary/60">
            -{randomQuote.author}
          </p>
        </div>
        <div className="base-grid absolute left-0 top-0 z-0 h-full w-full opacity-40" />
      </div>
      <div className="flex h-full w-full flex-col border-l border-primary/5 bg-card lg:w-[50%]">
        <Outlet />
      </div>
    </div>
  );
}
```

Removed: `useConvexAuth` import and the loading check (`if (isLoading && !isAuthenticated) return null`).

- [ ] **Step 2: Commit**

```bash
git add src/routes/_app/login/_layout.tsx && git commit -m "refactor: remove useConvexAuth from login layout"
```

---

### Task 11: Replace login page with Clerk `<SignIn />`

**Files:**
- Modify: `src/routes/_app/login/_layout.index.tsx`

- [ ] **Step 1: Rewrite login page**

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { SignIn } from "@clerk/clerk-react";

export const Route = createFileRoute("/_app/login/_layout/")({
  component: Login,
});

function Login() {
  return (
    <div className="mx-auto flex h-full w-full max-w-96 flex-col items-center justify-center gap-6">
      <div className="mb-2 flex flex-col gap-2">
        <h3 className="text-center text-2xl font-medium text-primary">
          Sign in to Antaios
        </h3>
        <p className="text-center text-base font-normal text-primary/60">
          Welcome back! Please sign in to continue.
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
              "w-full border border-border bg-transparent text-primary/80 hover:bg-primary/5",
            dividerRow: "my-4",
            dividerText: "text-xs font-medium uppercase text-primary/60",
            formFieldLabel: "text-sm text-primary/60",
            formFieldInput:
              "bg-transparent border-border text-primary placeholder:text-primary/40",
            formButtonPrimary:
              "inline-flex items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 h-10 px-4 py-2 w-full",
            footerActionLink: "text-primary underline",
            footer: "hidden",
          },
        }}
      />
      <p className="px-12 text-center text-sm font-normal leading-normal text-primary/60">
        By clicking continue, you agree to our{" "}
        <a className="underline hover:text-primary">Terms of Service</a> and{" "}
        <a className="underline hover:text-primary">Privacy Policy.</a>
      </p>
    </div>
  );
}
```

Changes:
- Removed all old imports (useAuthActions, z, useForm, Loader2, etc.)
- Removed `LoginForm` and `VerifyForm` components
- Removed `useEffect` redirect logic (Clerk handles this)
- Added Clerk `<SignIn />` component with `appearance` prop to match the existing theme
- Used `routing="hash"` so Clerk handles navigation within the SPA
- Used `forceRedirectUrl="/dashboard"` to redirect after sign-in
- The `<SignIn />` includes both sign-in and sign-up tabs by default

- [ ] **Step 2: Commit**

```bash
git add src/routes/_app/login/_layout.index.tsx && git commit -m "feat: replace login form with Clerk SignIn component"
```

---

### Task 12: Update navigation with UserButton & OrganizationSwitcher

**Files:**
- Modify: `src/routes/_app/_auth/dashboard/-ui.navigation.tsx`

- [ ] **Step 1: Rewrite navigation component**

The right-side user dropdown is replaced with a cleaner layout: `UserButton` as a standalone element (Clerk handles its own menu with Manage Account + Sign Out), plus theme and language as icon buttons.

```typescript
import {
  ChevronUp,
  ChevronDown,
  Slash,
  Check,
  Settings,
} from "lucide-react";
import { cn } from "@/utils/misc";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { UserButton, OrganizationSwitcher } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/button-util";
import { Logo } from "@/components/logo";
import { Link, useMatchRoute, useNavigate } from "@tanstack/react-router";
import { Route as DashboardRoute } from "@/routes/_app/_auth/dashboard/_layout.index";
import { Route as SettingsRoute } from "@/routes/_app/_auth/dashboard/_layout.settings.index";
import { Route as BillingSettingsRoute } from "@/routes/_app/_auth/dashboard/_layout.settings.billing";
import { User } from "~/types";
import { PLANS } from "@cvx/schema";

export function Navigation({ user }: { user: User }) {
  const matchRoute = useMatchRoute();
  const navigate = useNavigate();
  const isDashboardPath = matchRoute({ to: DashboardRoute.fullPath });
  const isSettingsPath = matchRoute({ to: SettingsRoute.fullPath });
  const isBillingPath = matchRoute({ to: BillingSettingsRoute.fullPath });

  if (!user) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 flex w-full flex-col border-b border-border bg-card px-6">
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between py-3">
        <div className="flex h-10 items-center gap-2">
          <Link
            to={DashboardRoute.fullPath}
            className="flex h-10 items-center gap-1"
          >
            <Logo />
          </Link>
          <Slash className="h-6 w-6 -rotate-12 stroke-[1.5px] text-primary/10" />
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="gap-2 px-2 data-[state=open]:bg-primary/5"
              >
                <div className="flex items-center gap-2">
                  {user.avatarUrl ? (
                    <img
                      className="h-8 w-8 rounded-full object-cover"
                      alt={user.username ?? user.email}
                      src={user.avatarUrl}
                    />
                  ) : (
                    <span className="h-8 w-8 rounded-full bg-gradient-to-br from-lime-400 from-10% via-cyan-300 to-blue-500" />
                  )}

                  <p className="text-sm font-medium text-primary/80">
                    {user?.username || ""}
                  </p>
                  <span className="flex h-5 items-center rounded-full bg-primary/10 px-2 text-xs font-medium text-primary/80">
                    {(user.subscription?.planKey &&
                      user.subscription.planKey.charAt(0).toUpperCase() +
                        user.subscription.planKey.slice(1)) ||
                      "Free"}
                  </span>
                </div>
                <span className="flex flex-col items-center justify-center">
                  <ChevronUp className="relative top-[3px] h-[14px] w-[14px] stroke-[1.5px] text-primary/60" />
                  <ChevronDown className="relative bottom-[3px] h-[14px] w-[14px] stroke-[1.5px] text-primary/60" />
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              sideOffset={8}
              className="min-w-56 bg-card p-2"
            >
              <DropdownMenuLabel className="flex items-center text-xs font-normal text-primary/60">
                Personal Account
              </DropdownMenuLabel>
              <DropdownMenuItem className="h-10 w-full cursor-pointer justify-between rounded-md bg-secondary px-2">
                <div className="flex items-center gap-2">
                  {user.avatarUrl ? (
                    <img
                      className="h-6 w-6 rounded-full object-cover"
                      alt={user.username ?? user.email}
                      src={user.avatarUrl}
                    />
                  ) : (
                    <span className="h-6 w-6 rounded-full bg-gradient-to-br from-lime-400 from-10% via-cyan-300 to-blue-500" />
                  )}

                  <p className="text-sm font-medium text-primary/80">
                    {user.username || ""}
                  </p>
                </div>
                <Check className="h-[18px] w-[18px] stroke-[1.5px] text-primary/60" />
              </DropdownMenuItem>

              {user.subscription?.planKey === PLANS.FREE && (
                <>
                  <DropdownMenuSeparator className="mx-0 my-2" />
                  <DropdownMenuItem className="p-0 focus:bg-transparent">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        navigate({ to: BillingSettingsRoute.fullPath })
                      }
                    >
                      Upgrade to PRO
                    </Button>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <OrganizationSwitcher
            appearance={{
              elements: {
                rootBox: "flex items-center",
                organizationSwitcherTrigger:
                  "gap-2 px-2 py-1 rounded-md hover:bg-primary/5 text-sm text-primary/80",
                organizationSwitcherTriggerIcon: "text-primary/60",
              },
            }}
          />
        </div>

        <div className="flex h-10 items-center gap-3">
          <a
            href="https://github.com/get-convex/convex-saas/tree/main/docs"
            className={cn(
              `${buttonVariants({ variant: "outline", size: "sm" })} group hidden h-8 gap-2 rounded-full bg-transparent px-2 pr-2.5 md:flex`,
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-primary"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span className="text-sm text-primary/60 transition group-hover:text-primary group-focus:text-primary">
              Documentation
            </span>
          </a>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-full p-0"
            onClick={() => navigate({ to: SettingsRoute.fullPath })}
          >
            <Settings className="h-4 w-4 stroke-[1.5px] text-primary/60" />
          </Button>

          <ThemeSwitcher />
          <LanguageSwitcher />

          <UserButton
            afterSignOutUrl="/login"
            appearance={{
              elements: {
                userButtonAvatarBox: "h-8 w-8",
                userButtonTrigger: "focus:shadow-none",
              },
            }}
          />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-screen-xl items-center gap-3">
        <div
          className={cn(
            `flex h-12 items-center border-b-2`,
            isDashboardPath ? "border-primary" : "border-transparent",
          )}
        >
          <Link
            to={DashboardRoute.fullPath}
            className={cn(
              `${buttonVariants({ variant: "ghost", size: "sm" })} text-primary/80`,
            )}
          >
            Dashboard
          </Link>
        </div>
        <div
          className={cn(
            `flex h-12 items-center border-b-2`,
            isSettingsPath ? "border-primary" : "border-transparent",
          )}
        >
          <Link
            to={SettingsRoute.fullPath}
            className={cn(
              `${buttonVariants({ variant: "ghost", size: "sm" })} text-primary/80`,
            )}
          >
            Settings
          </Link>
        </div>
        <div
          className={cn(
            `flex h-12 items-center border-b-2`,
            isBillingPath ? "border-primary" : "border-transparent",
          )}
        >
          <Link
            to={BillingSettingsRoute.fullPath}
            className={cn(
              `${buttonVariants({ variant: "ghost", size: "sm" })} text-primary/80`,
            )}
          >
            Billing
          </Link>
        </div>
      </div>
    </nav>
  );
}
```

Changes:
- Removed the right-side custom dropdown menu entirely
- Added `UserButton` as a standalone element (Clerk handles Manage Account + Sign Out)
- Added `OrganizationSwitcher` next to the personal account dropdown
- Added Settings gear button (navigates to `/dashboard/settings`)
- ThemeSwitcher and LanguageSwitcher are now standalone icon buttons
- Added `import { UserButton, OrganizationSwitcher } from "@clerk/clerk-react"`

- [ ] **Step 2: Commit**

```bash
git add src/routes/_app/_auth/dashboard/-ui.navigation.tsx && git commit -m "feat: add Clerk UserButton and OrganizationSwitcher to navigation"
```

---

### Task 13: Update signOut utility

**Files:**
- Modify: `src/utils/misc.ts`

- [ ] **Step 1: Rewrite `useSignOut` to use Clerk**

```typescript
import { useClerk } from "@clerk/clerk-react";
import { CURRENCIES } from "@cvx/schema";
import { useNavigate, useRouter } from "@tanstack/react-router";
import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function callAll<Args extends unknown[]>(
  ...fns: (((...args: Args) => unknown) | undefined)[]
) {
  return (...args: Args) => fns.forEach((fn) => fn?.(...args));
}

export function getLocaleCurrency() {
  return navigator.languages.includes("en-US")
    ? CURRENCIES.USD
    : CURRENCIES.EUR;
}

export const useSignOut = () => {
  const router = useRouter();
  const navigate = useNavigate();
  const clerk = useClerk();

  return async () => {
    await clerk.signOut();
    router.invalidate();
    navigate({ to: "/login" });
  };
};
```

Changes:
- Removed `import { useAuthActions } from "@convex-dev/auth/react"`
- Added `import { useClerk } from "@clerk/clerk-react"`
- Replaced `useAuthActions().signOut()` with `clerk.signOut()`

- [ ] **Step 2: Commit**

```bash
git add src/utils/misc.ts && git commit -m "feat: update useSignOut to use Clerk"
```

---

### Task 14: Update env vars

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: Add Clerk publishable key**

```bash
# Keep existing
CONVEX_DEPLOYMENT=dev:neat-marlin-621
VITE_CONVEX_URL=https://neat-marlin-621.eu-west-1.convex.cloud
VITE_CONVEX_SITE_URL=https://neat-marlin-621.eu-west-1.convex.site

# Add Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...  # Replace with your actual Clerk key
```

- [ ] **Step 2: Commit**

```bash
git add .env.local && git commit -m "chore: add VITE_CLERK_PUBLISHABLE_KEY to .env.local"
```

---

### Task 15: Update routeTree.gen.ts (regenerate)

**Files:**
- Auto-generated: `src/routeTree.gen.ts`

- [ ] **Step 1: Regenerate route tree**

```bash
pnpm exec tanstack-router-codegen
```

If the command isn't available, running `pnpm dev` should trigger regeneration via the Vite plugin.

- [ ] **Step 2: Run typecheck to verify**

```bash
pnpm typecheck
```

Expected: No type errors. Any errors should be addressed by the above changes.

---

### Task 16: Verify the build

- [ ] **Step 1: Build the app**

```bash
pnpm build
```

Expected: Clean exit, no errors.

- [ ] **Step 2: Start dev server and test**

```bash
pnpm dev
```

Manual verification:
1. Open the app in a browser
2. See the login page with Clerk's `<SignIn />` component (email/password + social)
3. Sign in — should redirect to dashboard
4. See the UserButton and OrganizationSwitcher in the nav
5. Sign out — should redirect to login
6. Sign up a new account — should go through onboarding

---

## Clerk Dashboard Setup (manual, not in code)

1. Create a Clerk application at https://clerk.com
2. Configure sign-in methods: email + password, optionally Google/GitHub
3. Enable Organizations in Clerk settings
4. Add redirect URLs: `http://localhost:5173/*` (dev) and your production URL
5. Copy `CLERK_PUBLISHABLE_KEY` → add to `.env.local` as `VITE_CLERK_PUBLISHABLE_KEY`
6. In Convex dashboard → Environment Variables, add:
   - `CLERK_ISSUER_URL` = `https://<your-clerk-instance>.clerk.accounts.dev`
7. Remove old Convex env vars: `AUTH_RESEND_KEY`, `AUTH_EMAIL`
