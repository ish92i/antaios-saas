# Resources SEO & Content Improvements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add proper SEO metadata (JSON-LD schemas, OG tags, meta descriptions) to all resource pages and fix duplicated nav/footer.

**Architecture:** Create one shared `ArticleSeo` component that renders all per-article SEO tags + JSON-LD. Extract shared Nav/Footer into a reusable component. Apply to all 4 resource files.

**Tech Stack:** React, TanStack Router, react-helmet-async, @tabler/icons-react

## Global Constraints

- Import Helmet from `react-helmet-async`
- Use `siteConfig` from `~/site.config` for base URL, site title, default OG image
- All text strings use `useTranslation()` with English fallback
- JSON-LD schemas must be valid `application/ld+json`
- Each article must have unique `title`, `description`, `og:*`, `twitter:*` meta tags
- `Article` schema must include: `@type: Article`, `headline`, `description`, `datePublished`, `author`, `publisher`
- `BreadcrumbList` schema must include: `@type: BreadcrumbList`, items for Resources → Article

---
## File Structure

**Create:**
- `src/components/resources/article-seo.tsx` — shared ArticleSeo component (SEO head tags + JSON-LD)

**Modify:**
- `src/routes/resources.tsx` — replace inline Nav/Footer with shared ones, add list-page SEO
- `src/routes/resources.eudr-checklist.tsx` — ArticleSeo, shared Nav/Footer, `<table>` for evidence requirements
- `src/routes/resources.eudr-overview.tsx` — ArticleSeo, shared Nav/Footer, `<table>` for deadlines + commodities
- `src/routes/resources.traceability-guide.tsx` — ArticleSeo, shared Nav/Footer

---

### Task 1: Create shared ArticleSeo component

**Files:**
- Create: `src/components/resources/article-seo.tsx`

**Interfaces:**
- Produces: `<ArticleSeo>` component that accepts `{ title, description, path, datePublished, category }` and renders Helmet + JSON-LD

- [ ] **Create `src/components/resources/article-seo.tsx`**

```tsx
import { Helmet } from "react-helmet-async";
import siteConfig from "~/site.config";

interface ArticleSeoProps {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  category?: string;
}

export function ArticleSeo({ title, description, path, datePublished, category }: ArticleSeoProps) {
  const url = `${siteConfig.siteUrl}${path}`;
  const fullTitle = `${title} — Antaios Resources`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished,
    author: {
      "@type": "Organization",
      name: siteConfig.siteTitle,
      url: siteConfig.siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.siteTitle,
      url: siteConfig.siteUrl,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Resources", item: `${siteConfig.siteUrl}/resources` },
      { "@type": "ListItem", position: 2, name: title, item: url },
    ],
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="article" />
      <meta property="og:image" content={`${siteConfig.siteUrl}${siteConfig.siteImage}`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <link rel="canonical" href={url} />
      <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
    </Helmet>
  );
}
```

- [ ] **Run typecheck**

Run: `npx tsc -p tsconfig.app.json --noEmit`
Expected: no errors in new file

- [ ] **Commit**

```bash
git add src/components/resources/article-seo.tsx
git commit -m "feat: add ArticleSeo shared component with JSON-LD schemas"
```

---

### Task 2: Update resources list page (`resources.tsx`) — SEO + shared Nav/Footer

**Files:**
- Modify: `src/routes/resources.tsx`

**Interfaces:**
- Consumes: `ArticleSeo` from `@/components/resources/article-seo` (but for the list page, we don't need Article schema — just proper OG tags and description)

- [ ] **Update `resources.tsx` with proper list-page SEO**

Add list-page specific Helmet with unique description, OG tags, and `CollectionPage` schema.

- [ ] **Replace inline Nav/Footer** — Since the landing nav is too complex (auth, scroll behavior, mobile menu, motion animations), create simple shared Nav and Footer for resource pages.

Actually, let me simplify. Instead of extracting Nav/Footer (which adds complexity without fixing the core issue), I'll:

1. Replace inline Nav with simple `<Link>`-based nav (keep it minimal, just use the existing landing nav's Link pattern)
2. Replace inline Footer with simple one (or better, just keep it inline but cleaner)

OR even better: delete the duplicated Nav/Footer from all 4 article pages and import the landing ones. The landing Nav/Footer already work and use proper links.

Let me re-evaluate: the landing `Nav` uses scroll position, auth state, mobile menu — this is heavyweight for a resource article page. The landing `Footer` is fine though.

Better approach: Create lightweight `ResourceNav` and `ResourceFooter` shared components, or just inline simple nav/footer in each page (the duplication is only ~40 lines per page).

Actually, the simplest approach with most impact: keep Nav/Footer inline but replace them with the landing versions. The landing Nav works fine on any page — it shows the same links. Let me just import and use the landing `Nav` and `Footer` in the resource pages.

Let me update the plan to reflect this simpler approach.

- [ ] **Update `resources.tsx`** — Add list-page SEO, import landing Nav/Footer

In `resources.tsx`:
- Remove inline `Nav()` and `Footer()` components
- Import `{ Nav }` from `@/components/landing/nav` and `{ Footer }` from `@/components/landing/footer`
- Add list-page Helmet with `CollectionPage` JSON-LD

- [ ] **Run typecheck**

Run: `npx tsc -p tsconfig.app.json --noEmit`
Expected: no errors

- [ ] **Commit**

```bash
git add src/routes/resources.tsx
git commit -m "feat: add list-page SEO, use shared Nav/Footer on resources page"
```

---

### Task 3: Update eudr-checklist article page — SEO + shared Nav/Footer + content enhancements

**Files:**
- Modify: `src/routes/resources.eudr-checklist.tsx`

**Interfaces:**
- Consumes: `ArticleSeo` from `@/components/resources/article-seo`
- Consumes: landing `Nav` and `Footer`

- [ ] **Add ArticleSeo, replace Nav/Footer, add tables for evidence requirements**

In `resources.eudr-checklist.tsx`:
- Import `{ ArticleSeo }` from `@/components/resources/article-seo`
- Import `{ Nav }` from `@/components/landing/nav` and `{ Footer }` from `@/components/landing/footer`
- Remove inline Nav() and Footer() function definitions
- Replace `<Helmet>...</Helmet>` block with `<ArticleSeo title="..." description="..." path="/resources/eudr-checklist" datePublished="2024-11-15" category="Compliance Guide" />`
- Add `<table>` for the "What you need" evidence sections per step

- [ ] **Run typecheck**

Run: `npx tsc -p tsconfig.app.json --noEmit`
Expected: no errors

- [ ] **Commit**

```bash
git add src/routes/resources.eudr-checklist.tsx
git commit -m "feat: add ArticleSeo, shared Nav/Footer, evidence table to eudr-checklist"
```

---

### Task 4: Update eudr-overview article page — SEO + shared Nav/Footer + tables

**Files:**
- Modify: `src/routes/resources.eudr-overview.tsx`

- [ ] **Add ArticleSeo, replace Nav/Footer, add tables**

In `resources.eudr-overview.tsx`:
- Same pattern as Task 3
- Add `<table>` for key deadlines
- Add `<table>` for 7 regulated commodities (name + description)

- [ ] **Run typecheck**

Run: `npx tsc -p tsconfig.app.json --noEmit`
Expected: no errors

- [ ] **Commit**

```bash
git add src/routes/resources.eudr-overview.tsx
git commit -m "feat: add ArticleSeo, shared Nav/Footer, tables to eudr-overview"
```

---

### Task 5: Update traceability-guide article page — SEO + shared Nav/Footer

**Files:**
- Modify: `src/routes/resources.traceability-guide.tsx`

- [ ] **Add ArticleSeo, replace Nav/Footer**

Same pattern as Task 3/4, with traceability-specific SEO data.

- [ ] **Run typecheck**

Run: `npx tsc -p tsconfig.app.json --noEmit`
Expected: no errors

- [ ] **Commit**

```bash
git add src/routes/resources.traceability-guide.tsx
git commit -m "feat: add ArticleSeo, shared Nav/Footer to traceability-guide"
```

---

### Task 6: Verify build and routing

- [ ] **Run build**

Run: `npx vite build`
Expected: build succeeds

- [ ] **Verify no TypeScript errors**

Run: `npx tsc -p tsconfig.app.json --noEmit`
Expected: no type errors in modified files

- [ ] **Commit any remaining changes**

```bash
git add -A
git commit -m "chore: regenerate route tree and finalize resource SEO"
```
