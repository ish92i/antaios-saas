# Shipments Frontend Design

## Decision

Build the shipments experience inside the authenticated dashboard shell at `/dashboard/shipments`.

Design read: authenticated B2B compliance product UI for operators, with quiet enterprise SaaS language, leaning shadcn/ui plus Antaios CSS tokens. Dial values are `DESIGN_VARIANCE: 4`, `MOTION_INTENSITY: 2`, `VISUAL_DENSITY: 7`.

## Scope

The first frontend pass delivers:

- Dashboard navigation item for `Expeditions`.
- Shipment list with loading, empty, selected, submitted, failed-document, and status states.
- Inline right detail panel that pushes the list on desktop and becomes full-width on mobile.
- New shipment dialog with `react-dropzone`, client validation, Convex storage upload, shipment creation, and document attachment.
- Detail sections for timeline, documents, extracted data, deforestation scan, and sticky action bar.
- Conflict resolution dialog with save-on-advance behavior and supplier email sub-step.
- TRACES credentials modal wired to the existing DDS mutation shape.
- Risk PDF dialog wired to `api.pdf.generateRiskPdf`.
- Public supplier route at `/supplier/$token` with no dashboard shell.

## Route And Shell

Route path is `/dashboard/shipments`, implemented under the existing dashboard file route tree so it inherits:

- Clerk auth.
- Organization switcher.
- Current dashboard header/navigation shell.
- Convex React Query provider.

Navigation adds `Expeditions` next to existing dashboard entries. Dashboard home remains unchanged.

## Visual System

Use existing shadcn primitives from `src/components/ui` where present. Add missing local primitives only when needed for dialogs and badges, keeping style aligned with current shadcn code.

Use tokens from `src/index.css` and the Antaios design tokens:

- Brand blue for primary actions, selected states, focus, and progress.
- Red/yellow/green only for compliance meaning.
- Neutral surfaces for page, cards, and panels.
- Sentence case labels in French.
- Compact 8-12px radius scale.
- No decorative motion, no marketing images, no fake screenshots.

Because this is dense product UI, `design-taste-frontend` landing-page rules are applied only as quality guardrails: contrast, shape consistency, copy audit, mobile collapse, no AI-slop decorations.

## Backend API Mapping

The frontend uses real generated Convex API names, not aliases from the frontend spec:

- `api.shipments.listShipments`
- `api.shipments.getShipment`
- `api.shipments.createShipment`
- `api.shipments.answerQuestion`
- `api.shipments.flagForSupplier`
- `api.shipments.finalizeModal`
- `api.shipments.initiateDdsGeneration`
- `api.documents.getDocuments`
- `api.documents.addDocument`
- `api.documents.retryDocument`
- `api.scan.runDeforestationScan`
- `api.pdf.generateRiskPdf`

The current backend mutation for DDS submission does not accept TRACES credentials. The modal will collect the fields to match the UX spec, and submit will call the current mutation shape: `api.shipments.initiateDdsGeneration({ shipmentId })`.

## Component Boundaries

Shipments components live under `src/components/shipments`:

- `ShipmentCard`
- `ShipmentList`
- `ShipmentDetailPanel`
- `ShipmentTimeline`
- `DocumentList`
- `ExtractedDataGrid`
- `DeforestationScanSection`
- `ConflictResolutionDialog`
- `SupplierEmailStep`
- `TracesCredentialsModal`
- `RiskPdfDialog`
- `UploadDropzone`

Helpers live under `src/lib`:

- `formatters.ts` for French dates and numbers.
- `shipment-ui.ts` for status labels, field labels, completeness labels, and display helpers.

The route file owns selected shipment state, dialog open state, and query/mutation wiring. Presentational components receive data and callbacks.

## Data Flow

Shipment list subscribes with `useQuery(convexQuery(api.shipments.listShipments, {}))`.

When a card is selected, detail subscribes to:

- `api.shipments.getShipment`
- `api.documents.getDocuments`

New shipment flow:

1. `react-dropzone` collects files.
2. Client validates max 10 files and max 10 MB each.
3. Each accepted file uploads to Convex storage.
4. Submit creates shipment with `api.shipments.createShipment`.
5. Submit adds each uploaded document with `api.documents.addDocument`.
6. Dialog closes and the new shipment is selected.

Conflict flow saves on every advance with `api.shipments.answerQuestion` or `api.shipments.flagForSupplier`. Failed saves stay inline and do not advance.

Scan flow calls `api.scan.runDeforestationScan` and relies on reactive shipment updates.

Risk PDF flow calls `api.pdf.generateRiskPdf`; first call may return questions, final call stores the PDF.

## Loading And Error States

- List loading: three skeleton shipment cards.
- Empty list: centered upload icon, French copy, primary create button.
- Detail loading: panel skeleton.
- Document extraction: inline status per document.
- Failed document: inline error and retry button.
- Scan failure/no polygon: inline explanatory state.
- Mutation failures: inline error near the action, no critical toast.
- Copy-to-clipboard can use a small non-critical confirmation.

## Accessibility

- All controls are buttons or inputs with visible labels.
- Dropzone also exposes normal file picker behavior.
- Dialogs trap focus and return focus on close.
- Status colors always include text labels.
- Focus rings use token colors and pass contrast.
- Motion is limited to short transitions and respects reduced motion by avoiding essential animation.

## Implementation Notes

Install `react-dropzone`.

No `<form>` tags are used. Submit behavior is handled with `onClick` and controlled input state per `FRONTEND_SPEC.md`.

Mobile behavior:

- List and detail panel become single-column.
- Opening a shipment replaces the list view with the detail panel.
- Back button returns to the list.

## Verification

Run:

- `pnpm install` after adding `react-dropzone`.
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`

Manual checks:

- `/dashboard/shipments` renders in the authenticated shell.
- Navigation highlight works.
- Empty, loading, selected, failed-document, and submitted states render.
- Dropzone rejects invalid files and uploads valid files.
- Detail panel switches when selecting another shipment.
- Mobile viewport does not overlap or trap content.
