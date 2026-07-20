# Sentry Error Monitoring — Design

**Date**: 2026-07-20  
**Statut**: Design validé, prêt pour implémentation

---

## Objectif

Intégrer Sentry (https://sentry.io) pour la détection, le diagnostic et le monitoring des erreurs en production — côté frontend React et backend Convex.

---

## Stack

| Couche | SDK | Usage |
|--------|-----|-------|
| Frontend (React + Vite) | `@sentry/react` + `@sentry/vite-plugin` | Capture d'exceptions React, tracing performance, upload sourcemaps au build |
| Backend (Convex) | `convex/lib/sentry.ts` (envoi via `fetch` vers l'API Sentry) | Capture d'erreurs dans les actions/mutations HTTP côté serveur |
| Convex Node.js (`"use node"`) | Même utilitaire fetch | Fonctions Node.js dans Convex |

Pas de `@sentry/node` — Convex utilise un runtime V8 custom (sauf `"use node"` qui tourne en Node), mais un utilitaire fetch est plus portable et évite les dépendances lourdes.

---

## Architecture

### Env vars

Frontend (Vite, préfixe `VITE_`):
```
VITE_SENTRY_DSN=https://xxx@sentry.io/yyy
VITE_SENTRY_ENVIRONMENT=development|staging|production
```

Backend (Convex, via `process.env`):
```
SENTRY_DSN=https://xxx@sentry.io/yyy
SENTRY_ENVIRONMENT=development|staging|production
```

### Initialisation frontend (`src/main.tsx`)

```ts
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || "development",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### Error boundary (`src/app.tsx`)

Wrapper `<AppErrorBoundary>` existant. On le remplace par un `Sentry.ErrorBoundary` qui capture les erreurs React et les envoie à Sentry tout en gardant le fallback UI existant.

### Sourcemaps (`vite.config.ts`)

Le `@sentry/vite-plugin` est configuré pour uploader les sourcemaps au build (uniquement si `SENTRY_AUTH_TOKEN` est présent, donc en CI/CD).
On active `sourcemap: "hidden"` dans Vite pour générer les sourcemaps sans les exposer en prod.

### Backend utilitaire (`convex/lib/sentry.ts`)

Fonction `captureException(error, context?)` qui envoie l'erreur à l'API Sentry via `fetch`. Utilise l'enveloppe API de Sentry (envelope format) ou l'API store.

```ts
// Pseudo-code
export async function captureException(error: unknown, extra?: Record<string, unknown>) {
  const dsn = SENTRY_DSN;
  if (!dsn) return;
  // Parse DSN, build envelope JSON, POST to Sentry
}
```

### Remplacement des `console.error`

| Fichier | Ligne | Remplacement |
|---------|-------|-------------|
| `src/components/shipments/ShipmentDetailPanel.tsx:48` | `console.error("Audit trail download failed:", err)` | `Sentry.captureException(err)` |
| `convex/clerkWebhook.ts:40` | `console.error("CLERK_WEBHOOK_SECRET not set")` | Appel au utilitaire sentry |
| `convex/dds.ts:78` | `console.error("DDS API call failed...")` | Appel au utilitaire sentry |
| `convex/lib/translate.ts:37` | `console.error("DeepL error...")` | Appel au utilitaire sentry |
| `convex/email/index.ts:59,62` | `console.error(parsedErrorResult.data)` | Appel au utilitaire sentry |

---

## Fichiers modifiés

1. `package.json` — dépendances `@sentry/react` + `@sentry/vite-plugin` (dev)
2. `vite.config.ts` — plugin sentry + `sourcemap: "hidden"`
3. `src/main.tsx` — `Sentry.init()`
4. `src/app.tsx` — `Sentry.ErrorBoundary`
5. `src/components/shipments/ShipmentDetailPanel.tsx` — remplacer console.error
6. `convex/env.ts` — `SENTRY_DSN`, `SENTRY_ENVIRONMENT`
7. `convex/lib/sentry.ts` — utilitaire d'envoi Sentry
8. `convex/clerkWebhook.ts` — remplacer console.error
9. `convex/dds.ts` — remplacer console.error
10. `convex/lib/translate.ts` — remplacer console.error
11. `convex/email/index.ts` — remplacer console.error

---

## Vérification

- `pnpm run typecheck` — pas de régressions TypeScript
- `pnpm run lint` — pas de warning ESLint
- En local, Sentry s'initialise sans DSN (mode noop) ou avec DSN de dev
