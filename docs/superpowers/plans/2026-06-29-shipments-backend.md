# Shipments Backend Implementation Plan

> **For agentic workers:** Use caveman mode. Tasks use checkbox syntax.

**Goal:** Build Convex backend for EUDR compliance shipments pipeline — upload → extract → merge → resolve → scan → DDS → PDF.

**Architecture:** 3 new schema tables (shipments, shipmentDocuments, shipmentAuditLog) + lib helpers + CRUD functions + actions pipeline. LiteLLM for all LLM calls. Pure JS extraction (no Python).

**Tech Stack:** Convex, TypeScript, pdf-parse, pdf-lib, pdfjs-dist, tesseract.js, papaparse, xlsx, togeojson, proj4, pdfmake, date-fns, uuid, eudr-api-client, Resend

---

### Task 1: Schema + env.ts

**Files:**
- Modify: `convex/schema.ts` — add 3 new tables
- Modify: `convex/env.ts` — add new env vars

Schema additions:
- `shipments` table with orgId, createdBy, internalRef, status (draft|extracting|resolving|pending_scan|scanning|ready|submitting|submitted|error), completeness (red|yellow|green), extractedData, pendingQuestions, supplierEmail, supplierToken, supplierFormCompleted, scanResult (clean|alerts_found|no_polygon), scanAlertCount, scanRunAt, ddsStorageId, riskPdfStorageId, tracesRef, lockedAt. Indexes: orgId, supplierToken.
- `shipmentDocuments` table with shipmentId, orgId, storageId, fileName, mimeType, pageCount, extractionStatus (pending|processing|done|failed), failureReason, partialExtraction, extractedJson, providerUsed, lastAttemptAt. Index: shipmentId.
- `shipmentAuditLog` table with shipmentId, orgId, timestamp, actor (user|system|supplier), actorId, eventType (field_changed|document_uploaded|extraction_completed|extraction_failed|question_answered|supplier_email_sent|supplier_form_submitted|scan_completed|dds_submitted|pdf_generated|shipment_locked), payload. Indexes: shipmentId, orgId_timestamp.

env.ts additions: LITELLM_BASE_URL, LITELLM_API_KEY, GFW_API_KEY, RESEND_API_KEY, GT_API_KEY

### Task 2: lib/* helpers

**Files:**
- Create: `convex/lib/validators.ts` — extractedDataValidator using Convex v, validateExtractedData() runtime check
- Create: `convex/lib/completeness.ts` — recomputeCompleteness() pure function, required fields list
- Create: `convex/lib/litellm.ts` — callLiteLLM(modelGroup, messages, options) fetch wrapper
- Create: `convex/lib/gfw.ts` — queryGfwAlerts(geoJson) fetch wrapper

### Task 3: CRUD functions

**Files:**
- Create: `convex/audit.ts` — insertAuditLog internal mutation, getAuditLogs query
- Create: `convex/shipments.ts` — createShipment, getShipment, listShipments, getShipmentBySupplierToken, answerQuestion, flagForSupplier, finalizeModal, initiateDdsGeneration, updateSupplierEmail, resetStuckDocuments (internal), checkAllExtracted (internal)
- Create: `convex/documents.ts` — addDocument, getDocuments, retryDocument
- Create: `convex/supplier.ts` — getSupplierForm (public), submitSupplierAnswers (public)
- Create: `convex/crons.ts` — stuck extraction reset cron

### Task 4: Actions pipeline

**Files:**
- Create: `convex/actions/extract.ts` — "use node" — hybrid extraction: detect type → PDF text/OCR/images → LLM → validate → store
- Create: `convex/actions/merge.ts` — deterministic merge + LLM conflict labels → store merged + pendingQuestions
- Create: `convex/actions/scan.ts` — GFW deforestation scan POST
- Create: `convex/actions/supplier.ts` — Resend email to supplier with token link
- Create: `convex/actions/dds.ts` — "use node" — eudr-api-client TRACES submission
- Create: `convex/actions/pdf.ts` — "use node" — two-pass LLM risk PDF generation via pdfmake
