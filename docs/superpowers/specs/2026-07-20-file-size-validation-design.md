# Server-Side File Size Validation

## Problem

The app enforces a 10MB file size limit client-side (`UploadDropzone.tsx:14`) but has **no server-side check**. A malicious or misconfigured client can bypass the frontend guard and upload arbitrarily large files directly to Convex storage via `generateUploadUrl`. This causes:

- Unbounded storage costs
- Extraction actions that may OOM or timeout on oversized files
- Poor UX — large files appear to upload successfully but fail silently during extraction

## Upload Paths Identified

| Path | Frontend | Backend Mutation/Action | Validation exists? |
|------|----------|------------------------|--------------------|
| User document upload | `CreateShipmentPanel.tsx` → `generateUploadUrl()` → `addDocument()` | `documents.ts:addDocument` | ❌ |
| Geo file in conflict resolution | `ConflictResolutionDialog.tsx` → `generateUploadUrl()` → `processAndAnswerGeo()` | `geoAnswer.ts:processAndAnswerGeo` | ❌ |
| Supplier geo file | `SupplierQuestionStepper.tsx` → `generateSupplierUploadUrl()` → `processGeoFile()` | `geoAnswer.ts:processGeoFile` | ❌ |

Server-side generated PDFs (`pdf.ts`, `auditTrailPdf.ts`) use `ctx.storage.store()` directly — these are always small and excluded from validation.

## Design

### Validation Location

Add size checks **after upload** in the Convex mutations/actions that receive the `storageId`, using `ctx.storage.getMetadata(storageId)`.

### Why not at `generateUploadUrl`?

Convex's `generateUploadUrl` returns a pre-signed URL with no server-side callback hook. The file is stored before any of our code runs. Post-upload validation in the consuming mutation/action is the only viable server-side enforcement point.

### Approach: Defensive Rejection + Cleanup

1. Call `ctx.storage.getMetadata(storageId)` to retrieve the stored file's size
2. If `size > 10MB`, delete the file from storage (`ctx.storage.delete(storageId)`) and throw — the client catches the error and displays it
3. If size is within limits, proceed normally

### Threshold

10MB — matches the existing client-side constant. Defined as a shared constant.

### Files Changed

| File | Change |
|------|--------|
| `convex/documents.ts` | Add `MAX_FILE_SIZE` constant and size check in `addDocument` before creating `shipmentDocuments` record |
| `convex/geoAnswer.ts` | Add `MAX_FILE_SIZE` constant and size check in `processGeoFile` and `processAndAnswerGeo` before processing blob |
| `docs/superpowers/specs/2026-07-20-file-size-validation-design.md` | This document |

No frontend changes needed — all three callers already catch errors and display them via `error`/`geoError` state variables:
- `CreateShipmentPanel.tsx:66` — `setError(err.message)`
- `ConflictResolutionDialog.tsx:188` — `setGeoError(err.message)`
- `SupplierQuestionStepper.tsx:71` — `setGeoError(err.message)`

## Error Message

The thrown error message is `"File too large. Maximum size is 10 MB."` which propagates to the frontend's existing error display. This is consistent with the client-side message `"File too large (max 10 MB)"`.

## Edge Cases

- **0-byte files**: Pass through (size ≤ 10MB). Handled by extraction logic downstream.
- **Missing metadata**: `getMetadata` returns `null` if storage ID is invalid. Treat as error and throw.
- **Concurrent deletion**: If `delete` is called on a file being processed by another action, the downstream `ctx.storage.get()` will return `null` — already handled by existing null checks in `extract.ts:167` and `geoAnswer.ts:15`.
- **Supplier path**: `generateSupplierUploadUrl` generates the URL, but the file is consumed by `processGeoFile` from `geoAnswer.ts` — validation there covers the supplier path.

## Future Considerations

- A shared `MAX_FILE_SIZE` constant could be extracted to `convex/lib/constants.ts` if more validations are added
- File type validation could be added server-side in a follow-up (currently only client-side)
