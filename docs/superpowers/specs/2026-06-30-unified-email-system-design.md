# Unified Email System with Dynamic Sender & React Email

## Problem

- Hardcoded `from` addresses (`"Antaios <noreply@antaios.fr>"` in supplier email, `"Convex SaaS <onboarding@resend.dev>"` fallback in subscription email)
- Two separate sending systems (direct fetch + `@convex-dev/resend` component)
- Two Resend API keys (`AUTH_RESEND_KEY`, `RESEND_API_KEY`)
- Boilerplate/placeholder content in subscription email templates
- Supplier email uses raw HTML string instead of React Email

## Solution

### Env Vars

| Variable | Value | Purpose |
|----------|-------|---------|
| `RESEND_EMAIL` | `antaios.fr` | Domain only — `from` address auto-constructed as `noreply@antaios.fr` |
| `RESEND_API_KEY` | `re_...` | Single Resend API key for all sends |
| ~~`AUTH_RESEND_KEY`~~ | — | Removed |
| ~~`AUTH_EMAIL`~~ | — | Removed |

### Architecture

```
convex/email/
├── index.ts              # Unified sendEmail() — direct fetch to Resend API
├── templates/
│   ├── antaios-theme.ts  # Brand tokens: colors, fonts, logo path
│   ├── components/
│   │   └── AntaiosLayout.tsx  # Shared wrapper (header logo + branded footer)
│   ├── subscription.tsx  # SubscriptionSuccess + SubscriptionError components
│   └── supplier.tsx      # SupplierNotification component
```

### Email Flows

1. **Subscription Success** — Dodo webhook `onSubscriptionActive` → `sendSubscriptionSuccessEmail()` → `render(<SubscriptionSuccess />)` → `sendEmail()`
2. **Subscription Error** — (same pattern, not currently triggered)
3. **Supplier Notification** — `finalizeModal` schedules `sendSupplierEmail` action → renders `<SupplierNotification />` (with translated text) → `sendEmail()`

### React Email Templates

All templates use a shared `AntaiosLayout` that includes:
- Antaios icon logo from `public/images/logo.png`
- Brand colors extracted from `src/index.css` (`--primary` equivalent)
- Inter font loaded via Google Fonts
- Clean footer with company description

Styled in the style of the Collage React Email examples (Tailwind-based, clean typography, proper spacing).

### Files Changed

| File | Action |
|------|--------|
| `convex/env.ts` | Add `RESEND_EMAIL`, remove `AUTH_EMAIL` (keep `RESEND_API_KEY`) |
| `convex/email/index.ts` | Rewrite: use `RESEND_API_KEY`, construct `from` as `noreply@${RESEND_EMAIL}` |
| `convex/email/templates/subscriptionEmail.tsx` | Delete (replaced by `subscription.tsx`) |
| — | New: `convex/email/templates/antaios-theme.ts` |
| — | New: `convex/email/templates/components/AntaiosLayout.tsx` |
| — | New: `convex/email/templates/subscription.tsx` |
| — | New: `convex/email/templates/supplier.tsx` |
| `convex/supplier_email.ts` | Use React Email template instead of raw HTML |
| `errors.ts` | Keep `AUTH_EMAIL_NOT_SENT` (rename to `EMAIL_NOT_SENT`) |
