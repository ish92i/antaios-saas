# Resources Page: Content, Routing & SEO Improvements

## Problem

1. **Routing**: Clicking resource cards on `/resources` does not navigate to the article pages (URL stays at `/resources`)
2. **SEO**: Article pages have minimal metadata — only `<title>` overridden, no unique OG tags, no article JSON-LD schema, no breadcrumbs
3. **Code duplication**: Nav and Footer components are duplicated across all 4 resource files (180+ lines of repetition)

## Solution

### Task 1: Fix Routing
- Regenerate `routeTree.gen.ts` via TanStack Router plugin
- Ensure `to` prop on `<Link>` components resolves correctly for nested child routes under `/resources`
- Quick verification: run build and confirm route compilation

### Task 2: SEO Components (shared)
- Create `src/components/resources/article-seo.tsx` — reusable component for article-level SEO:
  - Unique `<title>`, `<meta name="description">` per article
  - OG tags (`og:title`, `og:description`, `og:url`, `og:type="article"`)
  - Twitter card tags
  - `Article` JSON-LD schema (BlogPosting) with headline, description, datePublished, author, publisher
  - `BreadcrumbList` JSON-LD schema
  - Canonical URL

### Task 3: Shared Layout Components
- Move Nav and Footer from duplicated inline definitions in `resources*.tsx` into shared components:
  - Either reuse `@/components/landing/nav.tsx` and `@/components/landing/footer.tsx`
  - Or create `@/components/resources/resource-nav.tsx` and `@/components/resources/resource-footer.tsx` if landing components don't match

### Task 4: Apply SEO to All Article Pages
- `resources.eudr-checklist.tsx`: apply `<ArticleSeo>` with article-specific data
- `resources.eudr-overview.tsx`: same
- `resources.traceability-guide.tsx`: same
- `resources.tsx`: apply list-page SEO (no article schema, but proper OG + description)

### Task 5: Content Enhancements
- Add structured tables for: deadlines (overview page), commodity list (overview page), evidence requirements (checklist page)
- Improve readability with callout boxes for tips/common pitfalls
- Add `lastModified` dates

## Files Changed
- `src/routes/resources.tsx`
- `src/routes/resources.eudr-checklist.tsx`
- `src/routes/resources.eudr-overview.tsx`
- `src/routes/resources.traceability-guide.tsx`
- `src/components/resources/article-seo.tsx` (new)
- `src/routeTree.gen.ts` (regenerated, not manually edited)
