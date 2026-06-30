# Antaios — Shipments Frontend Spec

## Stack & Constraints

- TanStack Start (file-based routing)
- shadcn/ui components — use what exists in `src/components/ui`, do not invent new primitives
- Theme from `src/index.css` — never hardcode colors, always use CSS variables
- Design tokens from the Antaios design system (see design token spec)
- i18n via General Translation (`generaltranslation.com`) for supplier portal route only; main app is French
- Convex for all data — `useQuery` for reactive reads, `useMutation` for writes, `useAction` for one-off triggers
- No `<form>` tags — use `onClick`/`onChange` handlers only

---

## Routes

```
/shipments                    ← list view (this spec)
/shipments/$shipmentId        ← not a separate route — detail opens as a Sheet over the list
/supplier/$token              ← separate public route, no auth, GT i18n
```

---

## Page Layout — `/shipments`

### Shell

Full-height page within the existing layout shell. Two-column when a shipment is selected (list + sheet), single-column otherwise.

```
┌─────────────────────────────────────────────────┐
│  Navbar (existing)                              │
├──────────────────┬──────────────────────────────┤
│                  │                              │
│  Shipment list   │  Detail sheet (when open)   │
│  (scrollable)    │  (fixed right, ~480px)       │
│                  │                              │
└──────────────────┴──────────────────────────────┘
```

The sheet is NOT a shadcn Sheet component — it's an inline panel that pushes the list to the left (like a mail client). It does not overlay. On mobile it goes full width.

### Page Header

```
Expéditions                    [+ Nouvelle expédition]
3 expéditions · 1 en attente
```

- Title: `h1` 24px/500
- Subtitle: count of total + count needing action (yellow or failed docs)
- Button: shadcn `Button` variant default, opens the new shipment upload flow (full-screen Dialog)

---

## Shipment List

### List item card

Each shipment is a card with:

```
┌─────────────────────────────────────────────────┐
│  ● Café — Éthiopie               [JAUNE badge]  │
│  Réf. LOT-2024-ETH-00412                        │
│  Créée le 24 juin 2026 · 3 documents            │
│                                                  │
│  ████████░░  80%  En attente du scan            │
└─────────────────────────────────────────────────┘
```

- **Completeness dot** (left of title): filled circle, color matches completeness
  - `red` → `#DC2626`
  - `yellow` → `#D97706`
  - `green` → `#16A34A`
- **Title:** `commodityName — countryOfProduction` or "Nouvelle expédition" if no data yet
- **Reference:** `shipmentRef` in mono 12px, muted
- **Meta:** created date + document count
- **Progress bar:** visual representation of completeness (count of present required fields / total required fields), using brand blue `#1570EF`
- **Status label:** plain text, muted, describes current state (see status label map below)
- **Selected state:** `border: 2px solid #1570EF`, slight background tint `#EBF3FF`
- **Hover state:** `background: var(--color-surface-tertiary)`

**Status label map:**

| `status` field | Label shown |
|---|---|
| `draft` | Brouillon |
| `extracting` | Extraction en cours… |
| `resolving` | En attente de vérification |
| `pending_scan` | Prêt pour le scan |
| `scanning` | Scan en cours… |
| `ready` | Prêt à soumettre |
| `submitting` | Soumission en cours… |
| `submitted` | Soumis ✓ |
| `error` | Erreur — action requise |

**Failed document badge:** If any document in the shipment has `extractionStatus: "failed"`, show a small red badge on the card: "1 document en échec".

### Empty state

```
        [upload icon]
   Aucune expédition pour le moment
   Créez votre première expédition pour
   commencer votre conformité EUDR.

        [+ Nouvelle expédition]
```

---

## New Shipment Flow — Full-Screen Dialog

Triggered by "+ Nouvelle expédition" button. Full-screen Dialog (shadcn Dialog, `max-w-2xl`).

### Step 1 — Upload

```
Nouvelle expédition

Déposez vos documents d'importation
──────────────────────────────────────────
│                                        │
│   [↑]  Glissez vos fichiers ici       │
│        ou cliquez pour parcourir      │
│                                        │
│   PDF, DOCX, Excel, CSV, GeoJSON      │
│   Max 10 fichiers · 10 Mo par fichier │
──────────────────────────────────────────

[Fichier 1.pdf  ✓  2.3 Mo]  [×]
[Contrat.docx   ✓  180 Ko]  [×]
[data.csv       ✓  45 Ko]   [×]

                    [Annuler]  [Lancer l'extraction →]
```

- Use `react-dropzone` for the drop zone
- Validate file size client-side before adding to list: reject > 10MB with inline error under the file
- Validate max 10 files: show error if exceeded
- Accepted types: `.pdf`, `.docx`, `.xlsx`, `.csv`, `.txt`, `.geojson`, `.kml`, `.zip` (shapefiles)
- Files upload to Convex storage via `generateUploadUrl` one by one as they're added (not on submit)
- "Lancer l'extraction" calls `shipments:createShipment` + `shipments:addDocument` for each already-uploaded file, closes dialog, opens the detail sheet for the new shipment immediately

---

## Detail Sheet (Right Panel)

Opens when a shipment card is clicked. 480px wide, pushes list to ~calc(100% - 480px). Not a modal — user can still see and interact with the list.

### Sheet Header

```
← [×]   Café — Éthiopie           [JAUNE]
         Réf. LOT-2024-ETH-00412
```

- Back arrow closes the sheet
- Completeness badge (colored pill): "Incomplet" / "Partiel" / "Complet"
- Sticky header, content below scrolls

### Sheet Content — 3 sections

#### 1. Timeline Stepper (always visible, top of sheet)

Vertical stepper, compact, always rendered:

```
✓  Documents uploadés          3 fichiers
⟳  Extraction                  En cours…
○  Vérification des données    En attente
○  Données fournisseur          —
○  Scan déforestation           —
○  Prêt à soumettre             —
```

Icons:
- `✓` green checkmark — completed
- `⟳` animated spinner — in progress
- `○` gray circle — not started
- `✗` red × — failed/error

Each step shows a one-line status. Clicking a completed step scrolls to that section below.

#### 2. Documents Section

List of uploaded documents with per-document status:

```
📄 Facture-fournisseur.pdf
   ✓ Extraction complète · Mistral · 8 pages

📄 Certificat-origine.pdf
   ⟳ Extraction en cours…

📄 geolocation.geojson
   ✓ Géométrie extraite

📄 Contrat.docx
   ✗ Échec de l'extraction  [Réessayer]
```

- File icon by type (use Tabler icons: `ti-file-type-pdf`, `ti-file-type-csv`, etc.)
- `providerUsed` shown in muted text for successfully extracted docs
- `partialExtraction: true` → yellow warning: "Document tronqué — 30 premières pages analysées"
- Retry button on failed docs: calls mutation to reset + re-schedule

#### 3. Extracted Data Section

Show the current `extractedData` fields in a two-column key/value grid. Group by category:

**Opérateur** | **Fournisseur**
**Marchandise** | **Géographie**
**Certifications** | **Géolocalisation**

Each field:
- Present value → show value in normal text
- Missing/null → show "—" in muted text with a small yellow dot
- Conflicted (still in `pendingQuestions`) → show "⚠ À résoudre" in amber

If `pendingQuestions.length > 0`, show a prominent CTA above this section:

```
┌─────────────────────────────────────────────┐
│  ⚠  5 champs nécessitent votre attention   │
│     [Résoudre les conflits →]               │
└─────────────────────────────────────────────┘
```

Button opens the Conflict Resolution Dialog.

#### 4. Deforestation Scan Section

Shown after extraction is complete.

**If `geoJson` present and `scanResult` not set:**
```
Scan déforestation
Prêt — polygone détecté (12 coordonnées)
[Lancer le scan]
```

**If `scanResult: "no_polygon"`:**
```
Scan déforestation
Aucun polygone disponible — scan ignoré
ℹ Ce point sera noté dans le rapport de risque
```

**If scanning:**
```
Scan déforestation
⟳ Analyse en cours via Global Forest Watch…
```

**If `scanResult: "clean"`:**
```
Scan déforestation
✓ Aucune alerte détectée depuis le 31/12/2020
```

**If `scanResult: "alerts_found"`:**
```
Scan déforestation
⚠ 3 alertes détectées depuis le 31/12/2020
  Ces alertes seront incluses dans le rapport de risque.
```

#### 5. Action Bar (bottom of sheet, sticky)

```
[Télécharger le PDF de risque]   [Soumettre la DDS →]
```

- Both buttons gray/disabled until `completeness === "green"`
- "Soumettre la DDS" → opens TRACES credentials modal (see below)
- "Télécharger le PDF de risque" → triggers PDF generation flow if not done, or downloads directly if `riskPdfStorageId` is set
- Submitted shipments show: "Expédition soumise le [date] · Réf. TRACES: [tracesRef]" with no action buttons (read-only)

---

## Conflict Resolution Dialog — Full-Screen

Opens from the "Résoudre les conflits" CTA. Full-screen Dialog — user must complete or explicitly close it.

### Layout

```
┌────────────────────────────────────────────────────────┐
│  Vérification des données          Question 3 sur 7    │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  TIMELINE (horizontal, top)                      │  │
│  │  ① ② ③[current] ④ ⑤ ⑥ ⑦                        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│                                                        │
│  [Question content — slides left/right]               │
│                                                        │
│                                                        │
│  [← Précédent]              [Continuer →] or [Envoyer]│
└────────────────────────────────────────────────────────┘
```

- Horizontal dot/number stepper at top shows all questions, current highlighted
- Clicking a past step navigates back to it
- Content area slides left (forward) or right (back) on navigation — CSS `transform: translateX` transition, 200ms ease
- Each answer is saved to Convex (`shipments:answerQuestion`) on "Continuer" click, before animation starts
- If save fails, show inline error and don't advance

### Question types

**Conflict (multiple options):**
```
Quantité
Deux valeurs ont été trouvées dans vos documents.
Laquelle est correcte ?

  [500 kg]    [5 000 kg]
```
- Buttons, selecting one highlights it (brand blue border), enables "Continuer"

**Missing (free text):**
```
Numéro EORI
Ce champ est absent de tous vos documents.

  [FR_________________]

  Vous ne l'avez pas ?  [Envoyer au fournisseur →]
```
- Text input, validates format if known (EORI: `/^[A-Z]{2}[0-9A-Z]{1,15}$/`)
- "Envoyer au fournisseur" opens email sub-step (see below)

**Missing (geo):**
```
Données de géolocalisation
Aucune coordonnée GPS n'a été trouvée.

  Uploader un fichier          Saisir manuellement
  [GeoJSON, KML, Shapefile]    Lat: [____]  Long: [____]
                               [+ Ajouter un point]

  Vous ne les avez pas ?  [Envoyer au fournisseur →]
```
- File upload: calls a Convex action to parse the geo file server-side, returns extracted GeoJSON
- Manual entry: allows multiple lat/long pairs (polygon), shows a simple point list

### "Envoyer au fournisseur" sub-step

When user clicks "Envoyer au fournisseur" for the first time:
```
Email du fournisseur
À quelle adresse envoyer les questions ?

  [contact@fournisseur.com___________]

  [← Retour]      [Confirmer →]
```

- Email stored on shipment, reused for all subsequent supplier questions without asking again
- After confirming: question is marked `pendingSupplier: true`, slides to next question automatically
- If supplier email already set: clicking "Envoyer au fournisseur" immediately marks the question and advances — no email prompt shown again

### Final step — Summary

```
Récapitulatif

✓  Pays de production    Côte d'Ivoire
✓  Quantité              5 000 kg
✉  Nom de la ferme       → Envoyé au fournisseur
✉  Géolocalisation       → Envoyé au fournisseur

Un email sera envoyé à contact@fournisseur.com
avec un lien vers le formulaire fournisseur.

Vous pouvez aussi copier le lien manuellement :
[https://app.antaios.fr/supplier/abc123]  [Copier]

         [Fermer et continuer]
```

- "Fermer et continuer" calls `shipments:finalizeModal`, closes dialog, returns to detail sheet
- Copy button uses `navigator.clipboard.writeText`

---

## TRACES Credentials Modal

Small Dialog (not full-screen), opens when user clicks "Soumettre la DDS".

```
Connexion TRACES

Pour soumettre votre déclaration, entrez vos
identifiants TRACES Next.

  Nom d'utilisateur TRACES
  [_________________________________]

  Clé d'authentification
  [_________________________________]

  Créer un compte TRACES ↗
  (opens new tab)

  [Annuler]    [Soumettre la déclaration →]
```

- Password-type input for auth key
- "Créer un compte" link: `target="_blank"` → `https://webgate.ec.europa.eu/tracesnt/`
- On submit: calls `shipments:initiateDdsGeneration` with credentials, closes modal, detail sheet shows "Soumission en cours…" state

---

## Risk PDF Generation Flow

When user clicks "Télécharger le PDF de risque" and `riskPdfStorageId` is not yet set:

1. Opens a small Dialog: "Génération du rapport de risque"
2. Shows the LLM-generated questions (same stepper UI as conflict resolution, but smaller)
3. On final step: calls `actions/pdf:generateRiskPdf` with user answers
4. Shows loading state: "Génération en cours… (30–60 secondes)"
5. On completion: auto-downloads the PDF via a Convex storage URL

If `riskPdfStorageId` is already set: clicking the button directly triggers a download with no dialog.

---

## Supplier Portal — `/supplier/$token`

Completely separate route. No auth. No navbar. Full-page centered layout.

### Layout

```
        [Antaios logo]

   Votre client vous demande des informations
   pour sa conformité EUDR.

   Expédition : LOT-2024-ETH-00412
   ─────────────────────────────────

   [Question stepper — same UI as conflict resolution]

   Traduit automatiquement · Powered by Antaios
```

- Auto-detect browser language via GT, render all labels in detected language
- Same question stepper UI as the operator conflict flow
- Geo questions: file upload or manual lat/long entry
- On final step: submit button calls `shipments:submitSupplierAnswers`
- After submission: read-only confirmation screen "Merci, vos informations ont bien été reçues."
- If `supplierFormCompleted === true` on load: show read-only confirmation immediately (dedup)

---

## Reactive State & Loading Patterns

### Convex subscriptions

All list and detail views use `useQuery` — they update reactively without polling. No manual refresh needed.

Key queries:
- `shipments:listByOrg` → drives the shipment list
- `shipments:getById` → drives the detail sheet
- `shipments:getDocuments` → drives the documents section

### Loading states

- **List loading:** skeleton cards (3 placeholder cards with animated shimmer)
- **Extraction in progress:** per-document spinner inline in the documents section
- **Scan in progress:** spinner + "Analyse en cours…" in the scan section
- **DDS submitting:** full action bar replaced with spinner + "Soumission en cours…"

### Optimistic updates

Apply optimistic updates for:
- `answerQuestion` → immediately remove the question from the pending list visually, revert on error
- `flagForSupplier` → immediately mark question as "→ Fournisseur" visually

Do NOT apply optimistic updates for:
- File uploads (real progress needed)
- Scan trigger (async, must wait for result)
- DDS submission (too consequential to fake)

### Error states

- LLM extraction failed → per-document error state with retry button (do not block rest of UI)
- Scan failed → inline error in scan section with retry button
- DDS submission failed → Dialog with error message + "Réessayer" button, does NOT lock the shipment

---

## Shared UI Conventions

- **Completeness colors** always map to: red `#DC2626`, yellow `#D97706`, green `#16A34A` — never use semantic CSS variables for these as they have specific brand meaning
- **All dates** formatted as `DD MMM YYYY` in French (e.g. "24 juin 2026") using `date-fns/locale/fr`
- **All numbers** with French locale formatting (`5 000 kg`, not `5,000 kg`)
- **Mono font** for references, EORI numbers, tokens — `font-family: var(--font-mono)`
- **Sentence case everywhere** — no ALL CAPS, no Title Case in labels
- **No toast for destructive or async actions** — use inline feedback instead. Toasts only for non-critical confirmations (e.g. "Lien copié")

---

## File Structure (Frontend)

```
src/
  routes/
    shipments/
      index.tsx              ← list + detail sheet
    supplier/
      $token.tsx             ← public supplier portal
  components/
    shipments/
      ShipmentCard.tsx
      ShipmentList.tsx
      ShipmentDetailSheet.tsx
      ShipmentTimeline.tsx
      DocumentList.tsx
      ExtractedDataGrid.tsx
      DeforestationScanSection.tsx
      ConflictResolutionDialog.tsx
      SupplierEmailStep.tsx
      TracesCredentialsModal.tsx
      RiskPdfDialog.tsx
      UploadDropzone.tsx
    supplier/
      SupplierQuestionStepper.tsx
  lib/
    completeness.ts           ← shared pure function (mirrors backend logic)
    formatters.ts             ← date, number, country name formatting
```

---

## Key UX Rules

- **The detail sheet never blocks the list.** User can click a different shipment while the sheet is open — it switches content.
- **The conflict resolution dialog always saves on advance, never on close.** Closing the dialog mid-way leaves answers saved up to that point. Reopening resumes from the first unanswered question.
- **Never disable the "Résoudre les conflits" button** even if extraction is still running — show it as soon as any questions exist.
- **The supplier link is always copyable** once `supplierToken` is set, regardless of whether the email was sent. User may want to send it via WhatsApp or other channel.
- **Submitted shipments are visually distinct** — muted card style, "Soumis" badge, no action buttons. The detail sheet opens in read-only mode with a visible audit trail summary.
