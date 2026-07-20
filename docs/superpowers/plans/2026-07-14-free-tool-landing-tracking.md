# Free Tool, Landing Page & Tracking Implementation Plan

> **For agents:** Subagents implement tasks independently. NO file conflicts between agents.

**Goal:** Build free EUDR diagnostic tool, redesigned landing page, cookie consent, PostHog+Partytown tracking, resources, and SEO.

**Architecture:** SPA with TanStack Router + i18next + Convex backend. New routes: `/free-tool`, `/resources`, `/resources/*`. Existing routes rewritten: `/`. Infrastructure: Partytown-worker analytics, Radix-based cookie banner, localStorage-based consent.

**Tech Stack:** React 18, Vite 5, TanStack Router, Tailwind v4, shadcn/ui, i18next, posthog-js, @builder.io/partytown

---

### Task 1: Shared Types & Scoring Engine

**Files:** Create `src/utils/free-tool-types.ts`, `src/utils/free-tool-scoring.ts`

Pure functions module. Types for answers, criteria results, tier results. Scoring logic per spec §1.2. No React deps.

### Task 2: Free Tool Page — `/free-tool`

**Files:** Create `src/routes/free-tool.tsx`, `src/components/free-tool/question.tsx`, `src/components/free-tool/progress.tsx`, `src/components/free-tool/result.tsx`

8-question single-screen flow. Progress indicator. Back navigation preserves answers. Result screen with tier breakdown, CTAs per spec §1.4. localStorage result storage.

### Task 3: Landing Page Rewrite — `/`

**Files:** Rewrite `src/routes/index.tsx`

Full page per spec §2: hero, trust bar, problem framing, how it works, pricing, FAQ, CTAs. CTA hierarchy: free-tool = solid, login = ghost.

### Task 4: Cookie Consent Banner

**Files:** Create `src/components/cookie-consent-banner.tsx`, `src/hooks/use-consent.ts`

CNIL-compliant corner banner. Two-tier consent. Radix UI primitives. localStorage consent with 6-month re-prompt.

### Task 5: Analytics + Partytown

**Files:** Create `src/lib/analytics.ts`, `src/hooks/use-analytics.ts`. Modify `vite.config.ts`, `index.html`.

PostHog via Partytown web worker. Consent-gated init. Event definitions for tools + landing. Env var placeholder.

### Task 6: Resources Page

**Files:** Create `src/routes/resources.tsx`, `src/routes/resources.eudr-checklist.tsx`, `src/routes/resources.traceability-guide.tsx`, `src/routes/resources.eudr-overview.tsx`

Resources hub with 3 articles. Each links to `/free-tool`.

### Task 7: i18n Translations

**Files:** Modify all 7 locale files in `src/locales/`

Add all `freeTool.*`, `landing.*`, `common.cookieBanner.*`, `resources.*` keys. English = authoritative. Other locales = English as fallback.

### Task 8: Wire Everything Together

**Files:** Modify `src/app.tsx`, `src/routes/__root.tsx`

Register analytics init, cookie consent banner, route tree regeneration. SEO metadata + structured data.

---

## File Conflict Map

| Agent | Creates | Modifies | Conflicts |
|---|---|---|---|
| 1 (Types + Scoring) | `src/utils/free-tool-types.ts`, `src/utils/free-tool-scoring.ts` | — | None |
| 2 (Free Tool) | `src/routes/free-tool.tsx`, `src/components/free-tool/*.tsx` | — | None |
| 3 (Landing) | — | `src/routes/index.tsx` | None |
| 4 (Consent) | `src/components/cookie-consent-banner.tsx`, `src/hooks/use-consent.ts` | — | None |
| 5 (Analytics) | `src/lib/analytics.ts`, `src/hooks/use-analytics.ts` | `vite.config.ts`, `index.html` | None |
| 6 (Resources) | `src/routes/resources.tsx`, `src/routes/resources.*.tsx` | — | None |
| 7 (i18n) | — | `src/locales/*.json` (all 7) | None |
| 8 (Wire up) | — | `src/app.tsx`, `src/routes/__root.tsx` | None |
