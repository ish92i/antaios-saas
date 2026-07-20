# Journey Tracking & Cookie Banner Audit

## Problem

1. Analytics events are ad-hoc — no structured funnel tracking from first visit → paywall → payment.
2. Need to verify the cookie consent banner is on all public pages and working correctly.

## Approach

**Approach B: Dedicated journey tracking hook** with sessionStorage-based session management,
injecting 6 events at key funnel stages.

---

## Events Taxonomy

| Event | When | Key Properties |
|-------|------|----------------|
| `journey_started` | First page load in a browser session | `entry_page`, `referrer`, `utm_source`, `utm_medium`, `utm_campaign`, `session_id` |
| `page_viewed` | Every route change | `path`, `page_category`, `page_sequence`, `session_duration` |
| `paywall_encountered` | PaywallOverlay mounts | `time_on_site`, `pages_before_paywall`, `entry_page` |
| `checkout_initiated` | User clicks purchase button | `plan`, `price`, `time_to_checkout`, `paywall_to_checkout` |
| `checkout_returned` | User lands on `/dashboard/checkout` after Dodo redirect | `session_id` |
| `subscription_activated` | Dashboard detects subscription is active | `time_to_conversion`, `plan` |

(Also fire `subscription_failed` on payment errors.)

---

## Hook: `useJourneyTracking()`

**File:** `src/hooks/use-journey-tracking.ts`

### Session state (sessionStorage keys):

| Key | Value | Set when |
|-----|-------|----------|
| `antaios:session_id` | UUID v4 | First page load |
| `antaios:session_start` | `Date.now()` | First page load |
| `antaios:page_sequence` | Incrementing counter | Each page view |
| `antaios:session_entry` | First pathname | First page load |
| `antaios:session_referrer` | `document.referrer` | First page load |
| `antaios:session_utm` | Parsed UTM params | First page load |
| `antaios:paywall_shown_at` | `Date.now()` | PaywallOverlay mount |

### Exposed methods:

```typescript
interface JourneyTracking {
  initJourney(): void              // Call once on root mount
  trackPageView(path: string): void // Call on route change
  trackPaywallEncountered(): void   // Call when paywall renders
  trackCheckoutInitiated(plan: string, price: number): void
  trackCheckoutReturned(): void
  trackSubscriptionActivated(plan: string): void
  trackSubscriptionFailed(reason?: string): void
}
```

### Page categories

Derived from pathname:
- `/` → `landing`
- `/free-tool` → `free_tool`
- `/resources*` → `resources`
- `/legal*` → `legal`
- `/supplier/*` → `supplier`
- `/login*` → `login`
- `/dashboard*` → `dashboard`
- `/onboarding*` → `onboarding`

---

## Injection Points

### 1. `src/routes/__root.tsx` — Session init + page tracking

Add on mount:
```typescript
const journey = useJourneyTracking();
useEffect(() => { journey.initJourney(); }, []);
useEffect(() => { journey.trackPageView(pathname); }, [pathname]);
```

### 2. `src/components/paywall/PaywallOverlay.tsx` — Paywall + checkout events

- On mount: `journey.trackPaywallEncountered()`
- In `handlePurchase()` before redirect: `journey.trackCheckoutInitiated("direct", 500)`

### 3. `src/routes/_app/_auth/dashboard/_layout.checkout.tsx` — Checkout return

On mount: `journey.trackCheckoutReturned()`

### 4. `src/routes/_app/_auth/dashboard/_layout.tsx` — Subscription activated

When subscription status becomes active:
`journey.trackSubscriptionActivated(user.subscription.planName)`

---

## Cookie Banner Audit

### Current state

- `<CookieConsentBanner />` rendered in `__root.tsx:78` — the root layout wraps ALL routes (public + auth).
- `useConsent()` shows banner when `consent === null` (no stored decision).
- Consent stored in `localStorage` with 6-month expiry.
- Analytics before consent: anonymized mode (`persistence: "memory"`, `opt_out_capturing()`, no cookies).
- Analytics after consent: full mode (localStorage, autocapture, session recording).

### Verification checklist

1. Confirm root layout wraps all public routes — YES, TanStack Router root route wraps everything.
2. Confirm no premature cookie setting — YES, `persistence: "memory"` avoids cookies pre-consent.
3. Confirm `upgradeToFullAnalytics` called on consent — YES, in `__root.tsx:53-58`.
4. Confirm graceful degradation on consent reject — YES, `opt_out_capturing()` stays active.
5. Confirm localStorage key doesn't conflict — `antaios:consent`, unique prefix.
6. **Fix:** Add a check that the banner doesn't cause hydration mismatch on the `/dashboard/checkout` page (SSR edge case).

---

## Files Changed

| File | Change |
|------|--------|
| `src/hooks/use-journey-tracking.ts` | **New** — journey tracking hook |
| `src/lib/analytics.ts` | Add `SESSION_START_KEY` — export session start helper |
| `src/routes/__root.tsx` | Import & call `useJourneyTracking` — init + page tracking |
| `src/components/paywall/PaywallOverlay.tsx` | Track paywall encounter + checkout initiated |
| `src/routes/_app/_auth/dashboard/_layout.checkout.tsx` | Track checkout return |
| `src/routes/_app/_auth/dashboard/_layout.tsx` | Track subscription activated |
| `src/components/cookie-consent-banner.tsx` | Fix hydration/rendering edge case on checkout page |

No new dependencies required.
