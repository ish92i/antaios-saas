# Shipments Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the authenticated `/dashboard/shipments` operator workflow and public `/supplier/$token` workflow connected to the existing Convex backend.

**Architecture:** Keep route files responsible for data wiring and local workflow state. Put reusable shipment UI under `src/components/shipments` and public supplier UI under `src/components/supplier`. Use small helper modules for French formatting, labels, completeness, and field display so components stay focused.

**Tech Stack:** React 18, TanStack Router, TanStack Query with `convexQuery`, Convex React mutations/actions, shadcn/ui, Tailwind v4, `react-dropzone`, `date-fns`.

## Global Constraints

- Route is `/dashboard/shipments` inside the current authenticated dashboard shell.
- Public supplier route is `/supplier/$token` without dashboard navigation.
- Main app copy is French.
- Supplier route has translation-ready copy but no new translation library unless already present.
- Use existing shadcn primitives from `src/components/ui`; add missing local primitives only when needed.
- Use CSS variables and Tailwind tokens from `src/index.css`.
- Compliance colors keep exact meanings: red `#DC2626`, yellow `#D97706`, green `#16A34A`.
- Brand blue `#1570EF` is for primary actions, selected states, focus, and progress.
- No `<form>` tags. Use `onClick` and `onChange`.
- Install `react-dropzone`.
- No decorative motion, no fake screenshots, no marketing visuals.
- DDS submit uses current backend shape: `api.shipments.initiateDdsGeneration({ shipmentId })`.
- Do not modify unrelated dirty worktree files.

---

## File Structure

- Create `src/lib/formatters.ts`: French date/number/file-size formatting.
- Create `src/lib/shipment-ui.ts`: shipment labels, status text, field labels, completeness helpers, value formatting.
- Create `src/components/ui/dialog.tsx`: Radix Dialog wrapper aligned with local shadcn style.
- Create `src/components/ui/badge.tsx`: small badge primitive for statuses.
- Create `src/components/shipments/ShipmentCard.tsx`: one shipment row/card.
- Create `src/components/shipments/ShipmentList.tsx`: list, skeleton, and empty state.
- Create `src/components/shipments/UploadDropzone.tsx`: `react-dropzone` file picker and validation.
- Create `src/components/shipments/NewShipmentDialog.tsx`: storage upload, shipment creation, document attachment.
- Create `src/components/shipments/ShipmentTimeline.tsx`: compact status stepper.
- Create `src/components/shipments/DocumentList.tsx`: document rows and retry.
- Create `src/components/shipments/ExtractedDataGrid.tsx`: grouped key/value display and conflict CTA.
- Create `src/components/shipments/DeforestationScanSection.tsx`: scan states and run action.
- Create `src/components/shipments/ConflictResolutionDialog.tsx`: operator question workflow and supplier-email step.
- Create `src/components/shipments/TracesCredentialsModal.tsx`: credentials UI and DDS submit.
- Create `src/components/shipments/RiskPdfDialog.tsx`: PDF question flow and generation.
- Create `src/components/shipments/ShipmentDetailPanel.tsx`: composed detail panel.
- Create `src/routes/_app/_auth/dashboard/_layout.shipments.tsx`: authenticated shipments route.
- Modify `src/routes/_app/_auth/dashboard/-ui.navigation.tsx`: add `Expeditions` nav item.
- Create `src/components/supplier/SupplierQuestionStepper.tsx`: public question workflow.
- Create `src/routes/supplier/$token.tsx`: public supplier route.
- Modify `package.json` and lockfile by installing `react-dropzone`.

---

### Task 1: Dependency And UI Primitives

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `src/components/ui/dialog.tsx`
- Create: `src/components/ui/badge.tsx`

**Interfaces:**
- Produces: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`.
- Produces: `Badge({ variant?: "default" | "secondary" | "destructive" | "outline" })`.

- [ ] **Step 1: Install `react-dropzone`**

Run: `pnpm add react-dropzone`

Expected: `package.json` contains `react-dropzone`; lockfile updates.

- [ ] **Step 2: Add Dialog primitive**

Create `src/components/ui/dialog.tsx` with Radix Dialog wrappers using `radix-ui` and `cn`. Export all dialog parts listed above. Match existing shadcn class style: `rounded-lg`, `border`, `bg-background`, `text-foreground`, `shadow-lg`, `focus-visible:ring-3`.

- [ ] **Step 3: Add Badge primitive**

Create `src/components/ui/badge.tsx` with `cva`. Variants: `default`, `secondary`, `destructive`, `outline`. Base classes: `inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium`.

- [ ] **Step 4: Verify**

Run: `pnpm typecheck`

Expected: typecheck reaches existing project state with no new primitive import errors.

---

### Task 2: Formatting And Shipment UI Helpers

**Files:**
- Create: `src/lib/formatters.ts`
- Create: `src/lib/shipment-ui.ts`

**Interfaces:**
- Produces: `formatDateFr(timestamp?: number): string`
- Produces: `formatNumberFr(value: number): string`
- Produces: `formatFileSize(bytes: number): string`
- Produces: `statusLabel(status?: string): string`
- Produces: `completenessLabel(completeness?: string): string`
- Produces: `completenessTone(completeness?: string): "red" | "yellow" | "green"`
- Produces: `shipmentTitle(extractedData: unknown): string`
- Produces: `shipmentReference(shipment: { internalRef?: string; extractedData?: unknown; _id?: string }): string`
- Produces: `fieldGroups: Array<{ title: string; fields: Array<{ key: string; label: string }> }>`
- Produces: `displayValue(value: unknown): string`

- [ ] **Step 1: Write helper modules**

Use `date-fns/format` with `fr`. For unknown dates return `Date inconnue`. For missing values return `-`. Keep field groups: `Opérateur`, `Fournisseur`, `Marchandise`, `Géographie`, `Certifications`, `Géolocalisation`.

- [ ] **Step 2: Verify**

Run: `pnpm typecheck`

Expected: helpers compile with strict TypeScript and no unused exports.

---

### Task 3: Shipment List Route And Navigation

**Files:**
- Create: `src/components/shipments/ShipmentCard.tsx`
- Create: `src/components/shipments/ShipmentList.tsx`
- Create: `src/routes/_app/_auth/dashboard/_layout.shipments.tsx`
- Modify: `src/routes/_app/_auth/dashboard/-ui.navigation.tsx`

**Interfaces:**
- Consumes helpers from Task 2.
- Produces route `/dashboard/shipments`.
- `ShipmentList` props: `{ shipments?: Doc<"shipments">[]; isLoading: boolean; selectedId?: Id<"shipments">; onSelect(id: Id<"shipments">): void; onCreate(): void }`.

- [ ] **Step 1: Add list components**

`ShipmentCard` renders title, reference, date, document placeholder count, completeness badge, progress bar, status label, selected state, and failed/submitted styling. `ShipmentList` renders header, skeleton cards, empty state, and mapped cards.

- [ ] **Step 2: Add route**

Create route with `createFileRoute("/_app/_auth/dashboard/_layout/shipments")`. Query `api.shipments.listShipments` through `useQuery(convexQuery(...))`. Store `selectedShipmentId` and `isNewShipmentOpen`.

- [ ] **Step 3: Add nav item**

Import shipments route and add `Expeditions`. Active state uses `matchRoute({ to: ShipmentsRoute.fullPath })`.

- [ ] **Step 4: Verify route generation**

Run: `pnpm typecheck`

Expected: TanStack route types include `/dashboard/shipments` or Vite route generation updates during typecheck/dev.

---

### Task 4: New Shipment Dialog And Upload

**Files:**
- Create: `src/components/shipments/UploadDropzone.tsx`
- Create: `src/components/shipments/NewShipmentDialog.tsx`
- Modify: `src/routes/_app/_auth/dashboard/_layout.shipments.tsx`

**Interfaces:**
- Consumes `Dialog` from Task 1.
- Consumes `formatFileSize` from Task 2.
- `NewShipmentDialog` props: `{ open: boolean; onOpenChange(open: boolean): void; onCreated(id: Id<"shipments">): void }`.

- [ ] **Step 1: Implement `UploadDropzone`**

Use `useDropzone`. Accept `.pdf`, `.docx`, `.xlsx`, `.csv`, `.txt`, `.geojson`, `.kml`, `.zip`. Reject over 10 files and files over 10 MB with inline French errors.

- [ ] **Step 2: Implement upload flow**

Use `useConvexMutation(api.app.generateUploadUrl)`, `api.shipments.createShipment`, and `api.documents.addDocument`. Upload each file to generated URL with `fetch(uploadUrl, { method: "POST", headers: { "Content-Type": file.type }, body: file })`; read returned `{ storageId }`.

- [ ] **Step 3: Wire dialog in route**

Open from list header and empty state. On success close dialog and select new shipment.

- [ ] **Step 4: Verify**

Run: `pnpm typecheck`

Expected: no type errors around `Id<"_storage">`, upload response parsing, or dialog props.

---

### Task 5: Detail Panel Core Sections

**Files:**
- Create: `src/components/shipments/ShipmentTimeline.tsx`
- Create: `src/components/shipments/DocumentList.tsx`
- Create: `src/components/shipments/ExtractedDataGrid.tsx`
- Create: `src/components/shipments/DeforestationScanSection.tsx`
- Create: `src/components/shipments/ShipmentDetailPanel.tsx`
- Modify: `src/routes/_app/_auth/dashboard/_layout.shipments.tsx`

**Interfaces:**
- `ShipmentDetailPanel` props: `{ shipmentId?: Id<"shipments">; onClose(): void; onResolve(): void; onSubmit(): void; onRiskPdf(): void }`.
- `DocumentList` calls `api.documents.retryDocument`.
- `DeforestationScanSection` calls `api.scan.runDeforestationScan`.

- [ ] **Step 1: Implement timeline**

Map shipment status/documents to six steps: documents, extraction, verification, supplier, scan, ready. Use text icons from icon library or existing `lucide-react` dependency.

- [ ] **Step 2: Implement documents**

Query docs in parent detail panel with `api.documents.getDocuments`. Render file name, extraction status, provider, failure reason, retry button.

- [ ] **Step 3: Implement extracted data grid**

Render `fieldGroups`. Missing values show `-` plus yellow indicator text. Pending questions show `A résoudre`. CTA opens conflict dialog when questions exist.

- [ ] **Step 4: Implement scan section**

Show ready/no-polygon/scanning/clean/alerts states. Run action through `useAction(api.scan.runDeforestationScan)`.

- [ ] **Step 5: Compose detail panel**

Sticky header, scrollable content, sticky footer action bar. Submitted shipments render read-only audit summary instead of buttons.

- [ ] **Step 6: Verify**

Run: `pnpm typecheck`

Expected: detail panel compiles and route can switch selected shipments.

---

### Task 6: Conflict Resolution Dialog

**Files:**
- Create: `src/components/shipments/SupplierEmailStep.tsx`
- Create: `src/components/shipments/ConflictResolutionDialog.tsx`
- Modify: `src/routes/_app/_auth/dashboard/_layout.shipments.tsx`

**Interfaces:**
- `ConflictResolutionDialog` props: `{ open: boolean; onOpenChange(open: boolean): void; shipment: Doc<"shipments"> }`.
- Calls `api.shipments.answerQuestion`, `api.shipments.flagForSupplier`, and `api.shipments.finalizeModal`.

- [ ] **Step 1: Implement question navigation**

Display horizontal stepper, current question, previous/continue buttons. Save answer on continue before advancing. Inline error blocks advance.

- [ ] **Step 2: Implement question types**

Conflict questions render option buttons. Missing questions render labeled input. Geo questions render file input and manual lat/long list state.

- [ ] **Step 3: Implement supplier email step**

When supplier is needed and no email exists, ask for email. Validate with simple `^[^@\s]+@[^@\s]+\.[^@\s]+$`. Then call `flagForSupplier`.

- [ ] **Step 4: Implement summary**

Show answered fields and supplier-sent fields. Copy supplier link when `supplierToken` exists. Finish calls `finalizeModal`.

- [ ] **Step 5: Verify**

Run: `pnpm typecheck`

Expected: mutation args match generated Convex types.

---

### Task 7: DDS And Risk PDF Dialogs

**Files:**
- Create: `src/components/shipments/TracesCredentialsModal.tsx`
- Create: `src/components/shipments/RiskPdfDialog.tsx`
- Modify: `src/components/shipments/ShipmentDetailPanel.tsx`
- Modify: `src/routes/_app/_auth/dashboard/_layout.shipments.tsx`

**Interfaces:**
- `TracesCredentialsModal` props: `{ open: boolean; onOpenChange(open: boolean): void; shipmentId?: Id<"shipments"> }`.
- `RiskPdfDialog` props: `{ open: boolean; onOpenChange(open: boolean): void; shipmentId?: Id<"shipments"> }`.

- [ ] **Step 1: Implement TRACES modal**

Collect username and auth key with labels. Submit calls `api.shipments.initiateDdsGeneration({ shipmentId })`. Display inline error on failure.

- [ ] **Step 2: Implement risk PDF dialog**

First call `api.pdf.generateRiskPdf({ shipmentId })`. If questions return, collect answers. Final call uses `operatorAnswers`. Show generation state.

- [ ] **Step 3: Wire action bar**

Detail footer opens these dialogs. Buttons disabled unless completeness is `green`, except submitted state.

- [ ] **Step 4: Verify**

Run: `pnpm typecheck`

Expected: action/mutation signatures compile.

---

### Task 8: Public Supplier Route

**Files:**
- Create: `src/components/supplier/SupplierQuestionStepper.tsx`
- Create: `src/routes/supplier/$token.tsx`

**Interfaces:**
- Route uses `api.shipments.getShipmentBySupplierToken`.
- Stepper calls available backend mutations. If supplier answer submission mutation is not present, render read-only error explaining operator must update backend before supplier submit can complete.

- [ ] **Step 1: Add public route**

Create route with no auth shell. Query shipment by token and render loading, invalid token, completed, and active states.

- [ ] **Step 2: Add supplier stepper**

Reuse same visual question patterns as conflict dialog. Keep copy simple and translation-ready.

- [ ] **Step 3: Backend gap handling**

If generated API does not expose `submitSupplierAnswers`, do not fake success. Show inline message: `La soumission fournisseur n'est pas encore disponible côté serveur.`

- [ ] **Step 4: Verify**

Run: `pnpm typecheck`

Expected: public route compiles without dashboard dependencies.

---

### Task 9: Full Verification And Polish

**Files:**
- Modify any files from prior tasks only to fix verification failures.

**Interfaces:**
- Consumes all previous task outputs.
- Produces verified frontend.

- [ ] **Step 1: Run lint**

Run: `pnpm lint`

Expected: no new lint errors. Existing unrelated lint failures, if any, must be documented with exact file and line.

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck`

Expected: no new type errors.

- [ ] **Step 3: Run build**

Run: `pnpm build`

Expected: Vite build succeeds.

- [ ] **Step 4: Manual UI audit**

Check desktop and mobile widths. Confirm nav single line, list/detail layout, dialog labels, button contrast, no em-dashes in visible copy, no wrapped primary CTA text on desktop.

- [ ] **Step 5: Final status**

Summarize changed files, verification results, and any backend gaps not solvable from frontend.
