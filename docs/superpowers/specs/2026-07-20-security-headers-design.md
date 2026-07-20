# Security Headers — Design Doc

**Date:** 2026-07-20
**Status:** Approved
**Author:** AI Agent

## Problem

Antaios has no Content-Security-Policy, HSTS, X-Frame-Options, or other security headers on either:
- Convex HTTP API responses (webhooks)
- Netlify-served frontend (SPA)

This leaves the app vulnerable to XSS, clickjacking, MIME-type sniffing, and downgrade attacks.

## External Services Audit

| Service | Domain | Usage | CSP Directive |
|---------|--------|-------|---------------|
| Clerk Auth | `clerk.accounts.dev` | Auth UI, sessions, user mgmt | script-src, connect-src, frame-src, img-src, style-src |
| Clerk Images | `img.clerk.accounts.dev` | User avatar images | img-src |
| PostHog | `app.posthog.com` | Product analytics, session recording | script-src, connect-src |
| Convex API | `*.convex.cloud` | Backend queries/mutations, WebSocket | connect-src, wss connect-src |
| Convex Site | `*.convex.site` | File serving, HTTP actions | connect-src, img-src |
| Partytown | inline/self | 3rd-party script offloading via web worker | worker-src blob: |

Server-side-only (no CSP impact): Resend, Dodo Payments, Litellm, GFW API, DeepL.

## Approach: Wrapper Pattern + netlify.toml

### Recommendation: Approach A

Two independent layers — no shared state needed:

1. **Convex side:** A `withSecurityHeaders()` wrapper HOF applied to all HTTP route handlers in `convex/http.ts`. Lightweight, zero-dependency, fully typed.
2. **Netlify side:** `[[headers]]` blocks in `netlify.toml` for all frontend routes. Netlify applies these at the CDN edge.

## Header Configuration

### Content-Security-Policy

```
default-src 'self';
script-src 'self' https://clerk.accounts.dev https://app.posthog.com 'unsafe-inline';
style-src 'self' https://clerk.accounts.dev 'unsafe-inline';
connect-src 'self' https://*.convex.cloud https://*.convex.site https://clerk.accounts.dev https://app.posthog.com wss://*.convex.cloud;
img-src 'self' https://img.clerk.accounts.dev data: blob:;
font-src 'self' data:;
frame-src 'self' https://clerk.accounts.dev;
media-src 'self' blob:;
worker-src 'self' blob:;
manifest-src 'self';
base-uri 'self';
form-action 'self';
```

Rationale:
- `'unsafe-inline'` on script-src: Clerk and PostHog inject inline scripts; Vite runtime injects module scripts during dev.
- `'unsafe-inline'` on style-src: Tailwind CSS v4 and shadcn/ui components inject inline styles, Clerk UI also injects inline styles.
- `blob:` on img/media/worker: document previews (PDF, GeoJSON renders) and Partytown web workers.
- `wss://*.convex.cloud`: Convex real-time WebSocket connection.
- CSP_REPORT_URI can be set via env var `VITE_CSP_REPORT_URI` (optional).

### Other Headers

| Header | Value | Reason |
|--------|-------|--------|
| Strict-Transport-Security | `max-age=63072000; includeSubDomains; preload` | 2-year HSTS, include subdomains, preload ready |
| X-Frame-Options | `DENY` | Block clickjacking |
| X-Content-Type-Options | `nosniff` | Prevent MIME sniffing |
| Referrer-Policy | `strict-origin-when-cross-origin` | Send origin-only to external, full URL same-origin |
| Permissions-Policy | `camera=(), microphone=(), geolocation=(), interest-cohort=()` | Disable unused permissions |

## Implementation

### 1. Convex HTTP Router (`convex/http.ts`)

Add a `withSecurityHeaders` wrapper function that:
- Extends the existing `Response` with security headers
- Applies to all existing routes (Dodo webhook, Clerk webhook)
- Uses headers from a shared config
- CSP_REPORT_URI optionally sourced from `process.env.CSP_REPORT_URI`

### 2. Netlify Configuration (`netlify.toml`)

Add `[[headers]]` blocks that match all paths (`/*`):
- Same CSP and security headers as Convex
- Netlify applies headers at edge — no origin roundtrip needed

## Verification

- `npm run typecheck` — TypeScript compilation must pass
- `npm run lint` — ESLint must pass with zero warnings
- Manual review: headers present in both convex/http.ts and netlify.toml
