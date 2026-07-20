# Free Tool, Landing Page & Tracking Implementation Design

**Date:** 2026-07-14
**Status:** Draft for review

## Overview

Implement three interrelated systems: a free EUDR diagnostic tool (`/free-tool`), a redesigned landing page (`/`), and a tracking/cookie-consent infrastructure (PostHog + Partytown + CNIL-compliant consent banner). These share an SEO layer tying them together.

---

## 1. Free Tool — `/free-tool`

### Route

New route at `src/routes/free-tool.tsx` (TanStack Router file-based). Locale-untranslated URL slug shared across all locales.

### Component Structure

- `FreeToolPage` — route component, manages overall flow state
- `FreeToolQuestion` — renders one question at a time (8 variants by question type)
- `FreeToolProgress` — "Question X/8" indicator
- `FreeToolResult` — the compliance snapshot screen
- `FreeToolScoreEngine` — pure function module (no React), computes tier from answers

### Question Types

1. Commodity multi-select (checkboxes)
2. Annual revenue / headcount (radio, tiers → determines deadline)
3. Geographic origin known? (yes/no)
4. Documented due-diligence process? (yes/no)
5. Third-party traceability? (yes/no)
6. Supplier attestations on file? (yes/no)
7. Legality of production assessed? (yes/no)
8. Shipment tracking level? (individual vs batch)

### State Management

React state in `FreeToolPage` via `useReducer`:
```typescript
type FreeToolState = {
  currentQuestion: number; // 0-7
  answers: Record<number, AnswerValue>;
  result: ComplianceResult | null;
};
```

Back navigation preserves answers. Progress indicator updates immediately.

### Scoring Logic (`src/utils/free-tool-scoring.ts`)

Pure functions:

- `scoreCriteria(answers) → CriteriaResult` — evaluates 5 Article 10(2) criteria
- `assignTier(criteria, companySize, currentDate) → { tier, deadline }` — tier assignment with urgency adjustments
- `deadlineAdjustment(companySize, currentDate) → deadline date` — computes deadline + urgency windows

All date math uses `date-fns` (already in dependencies).

### Result Screen

- No email/PDF gate — content shown immediately
- Section: Deadline (computed date)
- Section: Risk tier with color-coded badge
- Section: Per-criterion ✓/✗ with regulatory sub-clause citations
- Section: 3 concrete next actions (mapped from failing criteria)
- Optional: "Copy link to clipboard" / "Download as PDF" buttons
- Support email: support@antaios.app
- CTA button per tier logic

### CTA Routing

| Tier | Button | Destination |
|---|---|---|
| High | "Start with Antaios — €500/month" | `/login` |
| Medium | "See how Antaios solves this" | `/` |
| Low | "Stay informed" | `/resources` |

### Result Storage

`localStorage` only (no auth required). Key: `antaios:free-tool-result`. JSON with answers + computed result + timestamp.

### Convex Schema

No changes needed (localStorage-only).

---

## 2. Landing Page — `/`

### Route

Existing `src/routes/index.tsx` — full rewrite.

### Section Structure

1. **Hero** — headline (outcome-vs-pain), subhead, primary CTA → `/free-tool`, secondary → `/login`
2. **Trust bar** — regulation citation, no fake social proof
3. **Problem framing** — rhetorical questions, contrast vs enterprise tools
4. **How it works** (4 steps) — shipments → risk scoring → DDS generation → audit trail
5. **Mid-page CTA** — solid button → `/free-tool`
6. **Pricing section** — €500/month, ×10 annual, comparison anchors, honest caveat
7. **FAQ block** — 4+ questions re: TRACES, enterprise scope, trader fit, data security
8. **Final CTA** — primary → `/free-tool`, secondary → `/login`

### CTA Hierarchy

Free-tool CTA = solid/primary button. Login = text link or ghost button. Never equal visual weight.

---

## 3. Cookie Consent Banner (CNIL-compliant)

### Implementation

Custom component using Radix UI primitives (matching codebase patterns). NOT a Dialog — sits as a fixed bottom-corner banner to avoid blocking content.

### Consent Model

Two-tier:
- **Pre-consent:** Essential/anonymized tracking only — no persistent `distinct_id`, aggregate events
- **Post-consent:** Full PostHog tracking — persistent ID, autocapture, session recording

### Banner Behavior

- Appears on first visit, persists until explicit choice
- Three buttons: Accept All / Reject All / Customize
- "Reject" has equal visual prominence to "Accept"
- Customize panel: separate toggle for analytics vs essential
- Stores choice in localStorage (`antaios:consent`) with timestamp
- Re-prompts after 6 months
- Links to `/legal/privacy`
- No implicit consent via scrolling

### State Check Order

1. Check localStorage for existing consent
2. No consent → show banner
3. Reject → PostHog anonymized mode
4. Accept → PostHog full mode
5. On explicit accept after prior anonymized session → start fresh identity

---

## 4. PostHog + Partytown Tracking

### Dependencies

- `posthog-js` (PostHog JS client)
- `@builder.io/partytown` (web worker offloading)

### Configuration

- PostHog API key via `VITE_POSTHOG_KEY` env var (placeholder for now)
- Partytown configured in `vite.config.ts` via `@builder.io/partytown/vite` plugin
- Partytown worker served from `/~partytown/` path

### Consent-Gated Init

In `src/lib/analytics.ts`:
1. Check consent on page load
2. No consent → init PostHog via Partytown in anonymized mode (ephemeral session ID, no persistence)
3. Consent → init PostHog via Partytown in full mode (persistent ID, autocapture)
4. On accept event → upgrade instance to full mode
5. Minimal bundle pre-consent, full bundle post-consent

### Events

**Free tool:**
- `free_tool_started`
- `free_tool_question_answered` (props: question_number)
- `free_tool_completed` (props: risk_tier, failing_criteria_count)
- `free_tool_abandoned` (last question reached)
- `free_tool_cta_clicked` (props: risk_tier, destination)

**Landing page:**
- `landing_cta_clicked` (props: cta_position, destination)
- `landing_faq_expanded` (props: question_id)

**Cross-cutting:**
- `signup_completed`

### Performance

- Partytown worker loaded from CDN/self-hosted
- Minimal PostHog bundle pre-consent
- Test Core Web Vitals (INP especially) with vs without PostHog

---

## 5. Resources — `/resources`

### Route

New route at `src/routes/resources.tsx` (index page listing articles). Individual articles as sub-routes or hash-anchored sections.

### Content Creation

3 initial articles matching the risk-tiers:
1. "EUDR Compliance Checklist: Your 5-Step Guide to Article 10(2)" — general/Medium-tier audience
2. "Importer's Guide to Supply Chain Traceability Under EUDR" — High-tier audience
3. "Is Your Business Ready for EUDR? A Practical Overview" — Low-tier audience

Each article links contextually to `/free-tool`.

---

## 6. SEO Layer

### Structured Data
- `/`: Organization schema + FAQPage schema on FAQ block
- `/free-tool`: Semantic HTML (H1=title, H2 per result section)
- `/resources`: Article schema per post

### Internal Linking
- Every resource page → links to `/free-tool`
- `/free-tool` result → links to relevant resource post(s) by risk category
- `/` → links to `/free-tool` (3x: hero, mid-page, final) + `/login` (secondary)

### Crawlability
- No client-side-only rendering
- No AI crawler blocking in robots.txt
- Cookie banner does not block content render for crawlers

---

## 7. i18n

### New Translation Keys

All new strings added to existing JSON locale files:

**free-tool keys:**
- `freeTool.title`, `freeTool.progress` (question X/8)
- `freeTool.questions.q1`–`q8` (question text + options)
- `freeTool.result.*` (deadline, tier, criteria breakdown, actions)
- `freeTool.cta.*` (3 CTA variants)

**landing keys:**
- `landing.hero.*` (headline, subhead, CTAs)
- `landing.trust.*` (regulation citation)
- `landing.problem.*` (problem framing)
- `landing.how.*` (4 steps)
- `landing.pricing.*` (pricing content)
- `landing.faq.*` (FAQ Q&A)

**common keys:**
- `common.cookieBanner.*` (consent banner copy)

### Implementation

Keys added to `en.json` (English) as authoritative source. Other locale files get basic translations or fall back to English via i18next's `fallbackLng`.

---

## 8. Implementation Decisions (from clarifications)

| Decision | Choice |
|---|---|
| PostHog API key | Placeholder env var (`VITE_POSTHOG_KEY`) |
| High-tier CTA destination | `/login` (existing Clerk SignIn page) |
| Result storage | localStorage only |
| Landing page | Full rewrite of index.tsx |
| Cookie consent | Custom component (corner banner, not Dialog) |
| Partytown | Set up now with `@builder.io/partytown` |
| Resource pages | Create `/resources` with actual content |
