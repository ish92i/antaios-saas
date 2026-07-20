# Journey Tracking & Cookie Banner Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Track user journey from first visit → paywall → payment via dedicated hook, verify cookie banner on all public pages.

**Architecture:** New `useJourneyTracking()` hook with sessionStorage for session state, injecting 7 PostHog events at 6 touchpoints. Cookie banner already in root layout — verify and fix hydration edge case.

**Tech Stack:** PostHog, TanStack Router, sessionStorage, React

## Global Constraints

- No new dependencies
- Follow existing patterns in `src/hooks/use-analytics.ts` and `src/hooks/use-consent.ts`
- Use `trackEvent` from `src/lib/analytics.ts` for all PostHog calls
- sessionStorage keys prefixed with `antaios:`
- Event names: snake_case

---

### Task 1: Create `useJourneyTracking` hook

**Files:**
- Create: `src/hooks/use-journey-tracking.ts`

**Interfaces:**
- Produces: `useJourneyTracking()` hook with methods:
  - `initJourney(): void`
  - `trackPageView(path: string): void`
  - `trackPaywallEncountered(): void`
  - `trackCheckoutInitiated(plan: string, price: number): void`
  - `trackCheckoutReturned(): void`
  - `trackSubscriptionActivated(plan: string): void`

- [ ] **Step 1: Write the hook**

```typescript
import { useCallback, useEffect, useRef } from "react"
import { trackEvent } from "@/lib/analytics"

const SESSION_ID_KEY = "antaios:session_id"
const SESSION_START_KEY = "antaios:session_start"
const PAGE_SEQUENCE_KEY = "antaios:page_sequence"
const SESSION_ENTRY_KEY = "antaios:session_entry"
const SESSION_REFERRER_KEY = "antaios:session_referrer"
const SESSION_UTM_KEY = "antaios:session_utm"
const PAYWALL_SHOWN_KEY = "antaios:paywall_shown_at"

function getSessionStorage(key: string): string | null {
  try { return sessionStorage.getItem(key) } catch { return null }
}

function setSessionStorage(key: string, value: string): void {
  try { sessionStorage.setItem(key, value) } catch { /* noop */ }
}

function generateUUID(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function getPageCategory(path: string): string {
  if (path === "/") return "landing"
  if (path.startsWith("/free-tool")) return "free_tool"
  if (path.startsWith("/resources")) return "resources"
  if (path.startsWith("/legal")) return "legal"
  if (path.startsWith("/supplier")) return "supplier"
  if (path.startsWith("/login")) return "login"
  if (path.startsWith("/dashboard")) return "dashboard"
  if (path.startsWith("/onboarding")) return "onboarding"
  return "other"
}

export function useJourneyTracking() {
  const initialized = useRef(false)

  const initJourney = useCallback(() => {
    if (initialized.current) return
    initialized.current = true

    let sessionId = getSessionStorage(SESSION_ID_KEY)
    if (!sessionId) {
      sessionId = generateUUID()
      setSessionStorage(SESSION_ID_KEY, sessionId)
      setSessionStorage(SESSION_START_KEY, String(Date.now()))
      setSessionStorage(PAGE_SEQUENCE_KEY, "0")
      setSessionStorage(SESSION_ENTRY_KEY, window.location.pathname)
      setSessionStorage(SESSION_REFERRER_KEY, document.referrer || "")

      const params = new URLSearchParams(window.location.search)
      const utm: Record<string, string> = {}
      for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
        const val = params.get(key)
        if (val) utm[key] = val
      }
      if (Object.keys(utm).length) {
        setSessionStorage(SESSION_UTM_KEY, JSON.stringify(utm))
      }

      trackEvent("journey_started", {
        entry_page: window.location.pathname,
        referrer: document.referrer || undefined,
        session_id: sessionId,
        ...utm,
      })
    }
  }, [])

  const trackPageView = useCallback((path: string) => {
    const seq = parseInt(getSessionStorage(PAGE_SEQUENCE_KEY) || "0", 10) + 1
    setSessionStorage(PAGE_SEQUENCE_KEY, String(seq))
    const start = parseInt(getSessionStorage(SESSION_START_KEY) || "0", 10)
    const duration = start ? Date.now() - start : 0

    trackEvent("page_viewed", {
      path,
      page_category: getPageCategory(path),
      page_sequence: seq,
      session_duration: duration,
      session_id: getSessionStorage(SESSION_ID_KEY),
    })
  }, [])

  const trackPaywallEncountered = useCallback(() => {
    setSessionStorage(PAYWALL_SHOWN_KEY, String(Date.now()))
    const start = parseInt(getSessionStorage(SESSION_START_KEY) || "0", 10)
    const pagesBefore = parseInt(getSessionStorage(PAGE_SEQUENCE_KEY) || "0", 10)

    trackEvent("paywall_encountered", {
      time_on_site: start ? Date.now() - start : 0,
      pages_before_paywall: pagesBefore,
      entry_page: getSessionStorage(SESSION_ENTRY_KEY),
      session_id: getSessionStorage(SESSION_ID_KEY),
    })
  }, [])

  const trackCheckoutInitiated = useCallback((plan: string, price: number) => {
    const start = parseInt(getSessionStorage(SESSION_START_KEY) || "0", 10)
    const paywallShown = parseInt(getSessionStorage(PAYWALL_SHOWN_KEY) || "0", 10)

    trackEvent("checkout_initiated", {
      plan,
      price,
      time_to_checkout: start ? Date.now() - start : 0,
      paywall_to_checkout: paywallShown ? Date.now() - paywallShown : 0,
      session_id: getSessionStorage(SESSION_ID_KEY),
    })
  }, [])

  const trackCheckoutReturned = useCallback(() => {
    trackEvent("checkout_returned", {
      session_id: getSessionStorage(SESSION_ID_KEY),
    })
  }, [])

  const trackSubscriptionActivated = useCallback((plan: string) => {
    const start = parseInt(getSessionStorage(SESSION_START_KEY) || "0", 10)

    trackEvent("subscription_activated", {
      time_to_conversion: start ? Date.now() - start : 0,
      plan,
      session_id: getSessionStorage(SESSION_ID_KEY),
    })
  }, [])

  return {
    initJourney,
    trackPageView,
    trackPaywallEncountered,
    trackCheckoutInitiated,
    trackCheckoutReturned,
    trackSubscriptionActivated,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/use-journey-tracking.ts
git commit -m "feat: add useJourneyTracking hook for funnel analytics"
```

---

### Task 2: Inject tracking into root layout

**Files:**
- Modify: `src/routes/__root.tsx:43-58`

- [ ] **Step 1: Add import and tracking calls**

Add import:
```typescript
import { useJourneyTracking } from "@/hooks/use-journey-tracking";
```

Add inside the component function, after `const matchWithTitle`:
```typescript
const journey = useJourneyTracking();

useEffect(() => {
  journey.initJourney();
}, [journey]);

useEffect(() => {
  journey.trackPageView(pathname);
}, [pathname, journey]);
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/__root.tsx
git commit -m "feat: add journey session init and page tracking to root layout"
```

---

### Task 3: Inject paywall tracking into PaywallOverlay

**Files:**
- Modify: `src/components/paywall/PaywallOverlay.tsx`

- [ ] **Step 1: Add import and tracking calls**

At top:
```typescript
import { useJourneyTracking } from "@/hooks/use-journey-tracking";
```

Inside `PaywallOverlay` component, after `const [isLoading, setIsLoading] = useState(false)`:
```typescript
const journey = useJourneyTracking();

useEffect(() => {
  journey.trackPaywallEncountered();
}, [journey]);
```

In `handlePurchase`, before `setIsLoading(true)`:
```typescript
journey.trackCheckoutInitiated("direct", 500);
```

- [ ] **Step 2: Commit**

```bash
git add src/components/paywall/PaywallOverlay.tsx
git commit -m "feat: track paywall encounter and checkout initiation events"
```

---

### Task 4: Inject checkout return tracking

**Files:**
- Modify: `src/routes/_app/_auth/dashboard/_layout.checkout.tsx`

- [ ] **Step 1: Add import and tracking call**

At top:
```typescript
import { useEffect } from "react";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";
```

Inside `DashboardCheckout`, before the return:
```typescript
const journey = useJourneyTracking();

useEffect(() => {
  journey.trackCheckoutReturned();
}, [journey]);
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/_app/_auth/dashboard/_layout.checkout.tsx
git commit -m "feat: track checkout return on checkout page"
```

---

### Task 5: Inject subscription activated tracking

**Files:**
- Modify: `src/routes/_app/_auth/dashboard/_layout.tsx`

- [ ] **Step 1: Add import and tracking call**

At top:
```typescript
import { useJourneyTracking } from "@/hooks/use-journey-tracking";
```

Inside `DashboardLayout`, after `const isExempt`:
```typescript
const journey = useJourneyTracking();
```

After `const isSubscribed = user.subscription?.status === "active"`, add:
```typescript
useEffect(() => {
  if (isSubscribed) {
    journey.trackSubscriptionActivated(user.subscription?.planName || "direct");
  }
}, [isSubscribed, journey, user.subscription?.planName]);
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/_app/_auth/dashboard/_layout.tsx
git commit -m "feat: track subscription activated when user becomes active"
```

---

### Task 6: Cookie banner audit

**Files:**
- Read: `src/routes/__root.tsx` — verify cookie banner is rendered
- Read: `src/components/cookie-consent-banner.tsx` — check for hydration/render issues
- Read: `src/hooks/use-consent.ts` — verify consent logic

**Verification checklist:**

- [ ] Cookie banner rendered in `__root.tsx` — YES (line 78), root route wraps ALL pages
- [ ] Analytics init order: `app.tsx` calls `initAnonymizedAnalytics()` first (memory-only, no cookies), then root layout checks consent → calls `upgradeToFullAnalytics()` — CORRECT
- [ ] No premature cookie setting — `persistence: "memory"` in anonymized mode avoids localStorage pre-consent
- [ ] `upgradeToFullAnalytics` called on consent — YES, `__root.tsx:53-58`
- [ ] Banner does not block UI — fixed bottom-right card, no z-index conflict
- [ ] i18n: all 7 locales have `common.cookieBanner.*` keys — VERIFIED

**Potential issue:** The checkout page (`_layout.checkout.tsx`) returns from external Dodo redirect. If user hasn't consented yet, the banner will show on checkout return page — this is CORRECT behavior (they should consent on all pages).

No changes needed. Banner is correctly on all public pages.

- [ ] **Step 1: Commit audit result**

```bash
git add docs/superpowers/specs/2026-07-20-journey-tracking-cookie-banner-design.md
git commit -m "docs: add journey tracking design doc (includes cookie banner audit)"
```
