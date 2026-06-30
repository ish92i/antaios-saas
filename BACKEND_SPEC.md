# Antaios — Shipments Feature Backend Spec

## Overview

The Shipments page is the core loop of Antaios. It lets an operator upload documents for a given import shipment, extracts structured EUDR compliance data via LLM, resolves conflicts and gaps via a user-facing modal stepper, triggers a deforestation scan, and finally generates a DDS (Due Diligence Statement) via the TRACES API and a Risk Assessment PDF — both locked behind a green completeness gate.

---

## Infrastructure Prerequisites

### LiteLLM Proxy (external sidecar)

Deploy a LiteLLM proxy as a separate service (Render or Railway recommended — Cloudflare Workers won't work as LiteLLM is a Python process). All Convex actions call this single OpenAI-compatible endpoint instead of calling providers directly.

**Provider rationale:**
- **OVH (primary)** — EU-hosted, GDPR-compliant, free anonymous tier (2 RPM) + $200 free credits with account, Qwen2.5-VL-72B is strong on vision
- **Mistral (fallback)** — EU-hosted, GDPR-compliant, free rate-limited tier, Pixtral-12B supports vision
- LLM7 dropped — free vision models unconfirmed, no SLA, not GDPR-reliable

**Config (`litellm_config.yaml`):**

```yaml
model_list:
  # PRIMARY — OVH, EU-hosted, GDPR-compliant, free credits
  - model_name: vision-primary
    litellm_params:
      model: openai/Qwen2.5-VL-72B-Instruct
      api_base: https://oai.endpoints.kepler.ai.cloud.ovh.net/v1
      api_key: os.environ/OVH_API_KEY

  # FALLBACK — Mistral, EU-hosted, GDPR-compliant, rate-limited free tier
  - model_name: vision-primary
    litellm_params:
      model: mistral/pixtral-12b-latest
      api_base: https://api.mistral.ai/v1
      api_key: os.environ/MISTRAL_API_KEY

  # text-only model group — used for merge, DDS deduction, PDF question gen (cheaper)
  - model_name: text-primary
    litellm_params:
      model: openai/Qwen2.5-VL-72B-Instruct
      api_base: https://oai.endpoints.kepler.ai.cloud.ovh.net/v1
      api_key: os.environ/OVH_API_KEY

  - model_name: text-primary
    litellm_params:
      model: mistral/mistral-small-latest
      api_base: https://api.mistral.ai/v1
      api_key: os.environ/MISTRAL_API_KEY

router_settings:
  routing_strategy: simple-shuffle
  num_retries: 2
  retry_after: 3
  timeout: 20                          # fail fast — Convex actions timeout at 30s
  fallbacks:
    - vision-primary: [vision-primary]
    - text-primary: [text-primary]

litellm_settings:
  drop_params: true
```

Two model groups: `vision-primary` for image calls, `text-primary` for text-only calls (merge, DDS, PDF gen). Text calls are cheaper and don't need vision capability. Convex sees one endpoint: `LITELLM_BASE_URL` env var pointing to your Render-hosted proxy.

---

## Convex Schema Extensions

Add to `convex/schema.ts`:

```typescript
shipments: defineTable({
  orgId: v.string(),
  createdBy: v.string(),               // clerkUserId

  // Metadata
  internalRef: v.optional(v.string()),
  status: v.union(
    v.literal("draft"),
    v.literal("extracting"),
    v.literal("resolving"),
    v.literal("pending_scan"),
    v.literal("scanning"),
    v.literal("ready"),
    v.literal("submitting"),           // idempotency gate for DDS
    v.literal("submitted"),
    v.literal("error"),
  ),
  completeness: v.union(
    v.literal("red"),
    v.literal("yellow"),
    v.literal("green"),
  ),

  // Extracted & resolved data (merged final state)
  extractedData: v.optional(v.any()),  // validated at write time via lib/validators.ts

  // Conflict resolution
  pendingQuestions: v.optional(v.array(v.any())),
  supplierEmail: v.optional(v.string()),
  supplierToken: v.optional(v.string()),   // UUID, for the public supplier form URL
  supplierFormCompleted: v.optional(v.boolean()),

  // Deforestation scan
  scanResult: v.optional(v.union(
    v.literal("clean"),
    v.literal("alerts_found"),
    v.literal("no_polygon"),
  )),
  scanAlertCount: v.optional(v.number()),
  scanRunAt: v.optional(v.number()),

  // Outputs
  ddsStorageId: v.optional(v.id("_storage")),
  riskPdfStorageId: v.optional(v.id("_storage")),
  tracesRef: v.optional(v.string()),       // reference number returned by TRACES

  // Lock (submitted shipments are read-only)
  lockedAt: v.optional(v.number()),
})
  .index("orgId", ["orgId"])
  .index("supplierToken", ["supplierToken"]),

shipmentDocuments: defineTable({
  shipmentId: v.id("shipments"),
  orgId: v.string(),
  storageId: v.id("_storage"),
  fileName: v.string(),
  mimeType: v.string(),
  pageCount: v.optional(v.number()),       // set after pre-scan
  totalChunks: v.optional(v.number()),     // how many chunk actions were scheduled
  chunksCompleted: v.optional(v.number()), // incremented as chunks finish
  extractionStatus: v.union(
    v.literal("pending"),
    v.literal("prescanning"),             // counting pages
    v.literal("processing"),
    v.literal("done"),
    v.literal("failed"),
  ),
  failureReason: v.optional(v.string()),
  partialExtraction: v.optional(v.boolean()),
  extractedJson: v.optional(v.any()),         // validated before write
  providerUsed: v.optional(v.string()),        // "mistral" | "llm7" | "ovh"
  lastAttemptAt: v.optional(v.number()),       // for stuck-detection cron
})
  .index("shipmentId", ["shipmentId"]),

shipmentAuditLog: defineTable({
  shipmentId: v.id("shipments"),
  orgId: v.string(),
  timestamp: v.number(),
  actor: v.union(
    v.literal("user"),
    v.literal("system"),
    v.literal("supplier"),
  ),
  actorId: v.optional(v.string()),   // clerkUserId if actor === "user"
  eventType: v.union(
    v.literal("field_changed"),
    v.literal("document_uploaded"),
    v.literal("extraction_completed"),
    v.literal("extraction_failed"),
    v.literal("question_answered"),
    v.literal("supplier_email_sent"),
    v.literal("supplier_form_submitted"),
    v.literal("scan_completed"),
    v.literal("dds_submitted"),
    v.literal("pdf_generated"),
    v.literal("shipment_locked"),
  ),
  payload: v.any(),
  // Payload shape per eventType:
  // field_changed       → { field, previousValue, newValue, source: "user"|"llm"|"supplier" }
  // extraction_completed→ { documentId, providerUsed, rawJson, pageCount, chunksUsed }
  // extraction_failed   → { documentId, failureReason }
  // question_answered   → { questionId, field, answer, previousValue }
  // scan_completed      → { scanResult, alertCount, gfwRawResponse }
  // dds_submitted       → { tracesRef, submittedPayload, tracesRawResponse, timestamp }
  // pdf_generated       → { storageId, generationDurationMs }
})
  .index("shipmentId", ["shipmentId"])
  .index("orgId_timestamp", ["orgId", "timestamp"]),
```

---

## Data Shape — `extractedData`

Canonical merged object. Validated at write time via `convex/lib/validators.ts` — never stored raw from LLM output.

```typescript
type ExtractedData = {
  // Operator
  operatorName?: string
  operatorAddress?: string
  operatorEmail?: string
  operatorPhone?: string
  eoriNumber?: string

  // Supplier
  supplierName?: string
  supplierAddress?: string

  // Commodity
  commodityName?: string
  scientificName?: string
  hsCode?: string
  quantity?: number
  quantityUnit?: string
  shipmentRef?: string

  // Geography
  countryOfExport?: string        // ISO 3166-1 alpha-2
  countryOfProduction?: string    // legally distinct from above
  productionDate?: string         // ISO date or "YYYY/YYYY" for harvest period
  portOfLoading?: string
  portOfEntry?: string

  // Geo data
  geoJson?: object                // parsed GeoJSON polygon/multipolygon
  farmName?: string               // UI hint for supplier portal only
  villageName?: string            // UI hint for supplier portal only

  // Certifications
  certifications?: string[]       // ["Rainforest Alliance", "Fairtrade", ...]

  // Computed completeness breakdown
  missingFields?: string[]
}
```

### Runtime Validator — `convex/lib/validators.ts`

```typescript
import { v } from "convex/values"

export const extractedDataValidator = v.object({
  operatorName: v.optional(v.string()),
  operatorAddress: v.optional(v.string()),
  operatorEmail: v.optional(v.string()),
  operatorPhone: v.optional(v.string()),
  eoriNumber: v.optional(v.string()),
  supplierName: v.optional(v.string()),
  supplierAddress: v.optional(v.string()),
  commodityName: v.optional(v.string()),
  scientificName: v.optional(v.string()),
  hsCode: v.optional(v.string()),
  quantity: v.optional(v.number()),
  quantityUnit: v.optional(v.string()),
  shipmentRef: v.optional(v.string()),
  countryOfExport: v.optional(v.string()),
  countryOfProduction: v.optional(v.string()),
  productionDate: v.optional(v.string()),
  portOfLoading: v.optional(v.string()),
  portOfEntry: v.optional(v.string()),
  geoJson: v.optional(v.any()),
  farmName: v.optional(v.string()),
  villageName: v.optional(v.string()),
  certifications: v.optional(v.array(v.string())),
  missingFields: v.optional(v.array(v.string())),
})

// Call before any ctx.runMutation that writes extractedData or extractedJson.
// On failure: set extractionStatus "failed", write audit log, never store.
export function validateExtractedData(raw: unknown): boolean {
  try {
    // Use Convex's Value.check or a manual field-by-field check
    // Return false if any field has wrong type
    return true
  } catch {
    return false
  }
}
```

---

## Upload Constraints (enforced at frontend before storage)

- **Max file size:** 10MB per file — rejected client-side before `generateUploadUrl` is called
- **Max documents per shipment:** 10 files
- **No page limit** — all pages processed
- **No full-page rendering** — PDFs are never converted to page images. Text is extracted natively via `pdfplumber`. Only embedded images within the PDF are extracted via `PyMuPDF` and sent to the vision LLM.

---

## Step-by-Step Flow

### Step 1 — Document Upload

**Frontend:** User uploads up to 10 files. Each file is validated client-side (≤10MB) before upload. Files over 10MB show an error: "Ce fichier dépasse 10 Mo. Compressez-le ou envoyez les pages pertinentes uniquement."

**Mutation: `shipments:createShipment`**
- Creates shipment with `status: "draft"`, `completeness: "red"`
- Returns shipmentId

**Mutation: `shipments:addDocument`**
- Accepts storageId (file already uploaded via `generateUploadUrl`) + metadata
- Creates `shipmentDocuments` record with `extractionStatus: "pending"`
- Sets `lastAttemptAt: Date.now()`
- Schedules `actions/extract:preScanDocument` for each document

---

### Step 2 — Hybrid Extraction Pipeline

Pure JS stack — no Python, no native binaries beyond what npm provides. PDFs are never converted wholesale to page images. Text is extracted natively first (perfect accuracy, cheap tokens). Only embedded images inside the PDF are sent to the vision LLM, and only if they appear to contain compliance-relevant visual data. Scanned/image-only PDFs fall back to `tesseract.js` OCR.

**Action: `actions/extract:extractDocument`** (`"use node"`)

Idempotency gate: check `extractionStatus`. If not `"pending"`, bail immediately. Set to `"processing"` + `lastAttemptAt` before starting.

#### Phase A — Route by file type

Fetch file from Convex storage, then branch:

**GeoJSON / KML / ZIP (shapefile):**
- Parse geometry using `togeojson` + `proj4` (pure JS)
- Store directly as `geoJson` in `extractedJson`, skip all LLM calls
- Set `extractionStatus: "done"`, call `checkAllExtracted`, return

**CSV / Excel / plain text:**
- CSV/TSV: parse with `papaparse`, convert to plain text table
- Excel: parse with `xlsx`, convert active sheets to plain text
- Send as text to LiteLLM (`text-primary`) with extraction prompt
- Go to Phase D

**Standalone image (PNG, JPG, TIFF, WEBP):**
- Encode as base64
- Send to LiteLLM (`vision-primary`) with image extraction prompt
- Go to Phase D

**PDF:**
- Go to Phase B

#### Phase B — PDF: detect text layer

Using `pdf-parse` (pure JS, no native deps):

```javascript
import pdf from 'pdf-parse'
const data = await pdf(buffer)
const hasTextLayer = data.text.trim().length > 50
```

- `hasTextLayer === true` → go to Phase C (text-layer PDF)
- `hasTextLayer === false` → go to Phase C-scanned (OCR path)

#### Phase C — Text-layer PDF

1. **Extract native text** via `pdf-parse`:
   - `data.text` gives full document text in reading order
2. **Detect embedded images** via `pdf-lib`:
```javascript
import { PDFDocument } from 'pdf-lib'
const pdfDoc = await PDFDocument.load(buffer)
let hasImages = false
for (const page of pdfDoc.getPages()) {
  const resources = page.node.Resources()
  if (resources?.XObject) { hasImages = true; break }
}
```

3. **If `hasImages === true` — process embedded images:**
   - Use `pdfjs-dist` (pure JS) to extract raw image data from XObject resources, cap at **10 images** total
   - For each image, determine if it's **potentially compliance-relevant** before sending to vision LLM:
     - Skip: images smaller than 50×50px (logos, decorative elements, watermarks)
     - Skip: images with a simple uniform color profile (background fills, borders)
     - Process: all others
   - For each relevant image, send to LiteLLM (`vision-primary`) with this prompt:

```
You are analyzing an image from a trade document for EUDR compliance.
Determine if this image contains any of the following:
- GPS coordinates or a map showing farm/plot locations
- A certification label or certificate (Rainforest Alliance, FSC, RSPO, Fairtrade, PEFC)
- A handwritten or stamped field with data (reference numbers, dates, quantities)
- A table with compliance-relevant data

If the image contains NONE of the above, return: { "relevant": false }
If it contains relevant data, return:
{
  "relevant": true,
  "description": "brief description of what this image contains",
  "data": {
    // only include fields found in this image, using the same field names as the extraction schema
  }
}
Return ONLY valid JSON. No explanation, no markdown.
```

   - Collect only responses where `relevant === true`
   - If `hasImages === false` OR no images pass the relevance check: skip vision entirely, proceed with text only

4. **Final extraction prompt** — send to LiteLLM (`text-primary`):

```
You are parsing a trade document for EUDR compliance.

DOCUMENT TEXT:
{nativeText}

{imageSection}
// imageSection is one of:
// "No embedded images found in this document." (if hasImages === false)
// "Embedded images were present but contained no compliance-relevant data." (if all filtered)
// "COMPLIANCE-RELEVANT IMAGE DATA:
{descriptions}" (if relevant images found)

Extract ALL of the following fields from the above content and return ONLY valid JSON.
No explanation, no markdown, no preamble. If a field is not found, set it to null.
{extractionSchema}
```

Go to Phase D.

#### Phase C-scanned — Scanned PDF (OCR fallback)

PDF has no text layer — it's a scan.

1. Convert pages to images using `pdf2pic` (wraps ImageMagick — available in Convex Node environment):
```javascript
import { fromBuffer } from 'pdf2pic'
const convert = fromBuffer(buffer, { density: 200, format: 'png', width: 1200 })
```
2. Run OCR on each page image using `tesseract.js` (pure JS WASM, no native deps):
```javascript
import { createWorker } from 'tesseract.js'
const worker = await createWorker(['eng', 'fra'])  // English + French for EU docs
const { data: { text } } = await worker.recognize(pageBuffer)
await worker.terminate()
```

3. Join all page texts into `nativeText`

4. Scanned PDFs rarely have embedded images worth extracting separately — skip image detection, set `imageSection: "Scanned document — text extracted via OCR."`

5. Continue with Phase C step 4 (final extraction prompt) using the OCR text

Note: `tesseract.js` downloads a ~10MB WASM binary on first use. In Convex Node actions this happens at cold start — acceptable for an async background action. `pdf2pic` requires ImageMagick; verify it's available in Convex's Node runtime. If not, fall back to rendering pages via `pdfjs-dist` canvas renderer instead.

#### Phase D — Validate & store

1. Parse LLM JSON response, strip any markdown fences if present
2. Validate with `validateExtractedData()` — on failure, write audit log and throw (Convex retries up to 2x)
3. Store in `extractedJson`, set `extractionStatus: "done"`, `providerUsed`, `lastAttemptAt`
4. Write `extraction_completed` audit log (includes `rawJson` for legal trail)
5. Call `shipments:checkAllExtracted`

**Mutation: `shipments:checkAllExtracted`**
- If all documents for the shipment are `done` or `failed`:
  - Set `status: "resolving"`
  - Schedule `actions/merge:mergeAndResolve`

#### JS dependencies for extraction

```
pdf-parse        — native text extraction from text-layer PDFs (pure JS)
pdf-lib          — detect embedded images in PDFs (pure JS)
pdfjs-dist       — extract raw image data from PDF XObjects (pure JS)
pdf2pic          — convert scanned PDF pages to PNG for OCR (requires ImageMagick)
tesseract.js     — OCR for scanned PDFs (pure JS WASM)
papaparse        — CSV/TSV parsing (pure JS)
xlsx             — Excel parsing (pure JS)
togeojson        — KML/GPX → GeoJSON (pure JS)
proj4            — coordinate reprojection for Shapefiles (pure JS)
```

#### Extraction Schema (used in final merge prompt)

```json
{
  "operatorName": "string | null",
  "operatorAddress": "string | null",
  "operatorEmail": "string | null",
  "operatorPhone": "string | null",
  "eoriNumber": "string | null",
  "supplierName": "string | null",
  "supplierAddress": "string | null",
  "commodityName": "string | null",
  "hsCode": "string | null",
  "quantity": "number | null",
  "quantityUnit": "string | null",
  "shipmentRef": "string | null",
  "countryOfExport": "string | null — ISO alpha-2 preferred",
  "countryOfProduction": "string | null — legally distinct from countryOfExport",
  "productionDate": "string | null — ISO 8601 or YYYY/YYYY harvest period",
  "portOfLoading": "string | null",
  "portOfEntry": "string | null",
  "geoJson": "object | null — only if explicit coordinates present",
  "farmName": "string | null",
  "villageName": "string | null",
  "certifications": "string[] | null — e.g. Rainforest Alliance, FSC, RSPO"
}
```

---

### Step 3 — Merge & Conflict Detection

**Action: `actions/merge:mergeAndResolve`**

Idempotency gate: only runs if `shipment.status === "resolving"`.

#### Phase A — Deterministic pre-pass (no LLM)

For each field across all `extractedJson` documents:

1. **Normalize first:**
   - Country fields: resolve to ISO alpha-2 via lookup table (`"Côte d'Ivoire"` → `"CI"`, `"France"` → `"FR"`, etc.)
   - Date fields: parse with `date-fns` supporting `YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY`, `DD.MM.YYYY` — normalize to ISO 8601
   - String fields: trim whitespace, normalize unicode

2. **Then merge deterministically:**
   - **One value, rest null** → take it, no question needed
   - **All null** → flag as `type: "missing"` question
   - **All identical after normalization** → take it, no question needed
   - **Numeric conflict** (e.g. `quantity: 500` vs `5000`) → always flag as `type: "conflict"` question, never auto-resolve
   - **Semantic conflict after normalization** (two different non-null values) → flag as `type: "conflict"` question

Only fields that remain genuinely unresolved after this pass are sent to the LLM.

#### Phase B — LLM conflict summary (optional, small payload)

If any conflicts remain after the deterministic pass, send only the conflicting fields to LiteLLM to generate human-readable question labels. The LLM does not make merge decisions — it only formats the question text.

#### Output

```typescript
{
  merged: ExtractedData,       // deterministically resolved fields
  questions: [
    {
      id: string,
      field: string,
      type: "conflict" | "missing" | "geo_missing",
      label: string,           // human-readable, in French
      options: string[] | null,
      geoType: "coordinates" | "file" | null
    }
  ]
}
```

Store `extractedData: merged` and `pendingQuestions` on the shipment. Validate `merged` with `validateExtractedData()` before writing. Recompute completeness. Write audit log for each field stored.

---

### Step 4 — User-Side Question Modal (Frontend Logic)

Multi-step modal driven by `pendingQuestions`, with left/right slide animation.

**For each question:**
- `type: "conflict"` with `options` → show option buttons
- `type: "missing"` with no options → show text input + "Send to supplier" button
- `type: "geo_missing"` → show file upload (GeoJSON, KML, Shapefile, Excel, PDF) OR manual lat/long entry + "Send to supplier" button

**Navigation:** Back button always visible. Each answer is persisted to Convex immediately on step advance — not batched at the end.

**"Send to supplier" flow:**
- Collects supplier email once (reused for all subsequent supplier questions)
- Does NOT send email yet — marks questions as `pendingSupplier: true`
- All supplier-flagged questions batched into one email at `finalizeModal`

**Mutation: `shipments:answerQuestion`**
- `{ shipmentId, questionId, answer, actorId }`
- Validates answer type
- Merges into `extractedData` at the relevant field
- Writes `question_answered` audit log: `{ questionId, field, answer, previousValue }`
- Removes question from `pendingQuestions`
- Recomputes completeness

**Mutation: `shipments:flagForSupplier`**
- `{ shipmentId, questionId, supplierEmail }`
- Stores `supplierEmail` on shipment (once, reused for subsequent)
- Marks question as `pendingSupplier: true`

**Mutation: `shipments:finalizeModal`**
- Schedules `actions/supplier:sendSupplierEmail` if any questions are `pendingSupplier: true`
- Generates `supplierToken` (UUID v4) if not already set
- If no geoJson present and no geo questions pending supplier → auto-sets `scanResult: "no_polygon"` (no user action needed)
- Recomputes completeness

---

### Step 5 — Supplier Portal

**Action: `actions/supplier:sendSupplierEmail`**

Sends via Resend a single email to `supplierEmail` containing:
- Intro in supplier's detected language (via GT)
- Link to `https://app.antaios.fr/supplier/{supplierToken}`
- List of specific fields requested

Writes `supplier_email_sent` audit log.

**Public query: `shipments:getSupplierForm`**
- Accepts `supplierToken`, returns pending supplier questions and shipment reference
- No auth required

**Mutation: `shipments:submitSupplierAnswers`**
- Accepts `{ supplierToken, answers: Record<questionId, string> }`
- Idempotency gate: rejects if `supplierFormCompleted === true`
- Validates token exists
- Merges answers into `extractedData` (validated before write)
- Writes `supplier_form_submitted` audit log for each field
- Sets `supplierFormCompleted: true`
- Recomputes completeness

**On the main Shipments page:**
- "Copy supplier link" button always visible after `supplierToken` is set
- Status badge: "En attente du fournisseur" / "Fournisseur a répondu"

---

### Step 6 — Shipment Timeline (Frontend)

Vertical stepper shown alongside the shipment detail:

1. Documents uploaded
2. Extraction complete
3. Data review (conflict resolution)
4. Supplier data (if applicable)
5. Deforestation scan
6. Ready to submit

Each step shows Red / Yellow / Green state reactively via Convex subscription.

---

### Step 7 — Deforestation Scan

Scan button unlocks when `extractedData.geoJson` is present and `scanResult` is not yet set.

If `geoJson` is absent when `finalizeModal` is called → `scanResult` is auto-set to `"no_polygon"` (no button shown, no user action needed).

Generate button is **grayed out** until `scanResult` is set (any value).

**Action: `actions/scan:runDeforestationScan`** (default Convex runtime, `fetch` only)

Idempotency gate: bail if `scanResult` is already set OR `scanRunAt` was set within the last 60 seconds.

1. Read `extractedData.geoJson`
2. POST to GFW:

```
POST https://data-api.globalforestwatch.org/dataset/gfw_integrated_alerts/latest/query/json
Headers:
  x-api-key: GFW_API_KEY
  Content-Type: application/json

Body:
{
  "sql": "SELECT COUNT(*) as alert_count FROM results WHERE gfw_integrated_alerts__date >= '2020-12-31'",
  "geometry": <extractedData.geoJson>
}
```

3. Parse response:
   - `alert_count === 0` → `scanResult: "clean"`
   - `alert_count > 0` → `scanResult: "alerts_found"`, store `scanAlertCount`
4. Set `scanRunAt: Date.now()`
5. Write `scan_completed` audit log: `{ scanResult, alertCount, gfwRawResponse }`
6. Recompute completeness → if green, set `status: "ready"`

---

### Step 8 — DDS Generation (TRACES)

Only available when `completeness === "green"`.

**Mutation: `shipments:initiateDdsGeneration`**
- Validates shipment is green and not locked
- **Atomically sets `status: "submitting"`** before scheduling action (idempotency gate)
- Schedules `actions/dds:generateDds`

**Action: `actions/dds:generateDds`** (`"use node"`)

Idempotency gate: bail immediately if `status !== "submitting"`.

1. Reads full `extractedData` + org data
2. Constructs TRACES payload (see original spec)
3. Derives stable idempotency key: `sha256(shipmentId + orgId)` — passed to `eudr-api-client` so duplicate calls return the existing submission
4. Submit via `eudr-api-client`
5. On success:
   - Write `dds_submitted` audit log: `{ tracesRef, submittedPayload, tracesRawResponse, timestamp: Date.now() }`
   - Set `tracesRef`, `status: "submitted"`, `lockedAt: Date.now()`
   - Write `shipment_locked` audit log
6. On failure: reset `status: "ready"`, write error to audit log

**Once `lockedAt` is set, all mutations on this shipment reject writes.**

---

### Step 9 — Risk Assessment PDF Generation

Runs in parallel with or after DDS generation.

**Action: `actions/pdf:generateRiskPdf`** (`"use node"`)

Idempotency gate: bail if `riskPdfStorageId` is already set.

Two-pass LLM approach:

**Pass 1:** Send `extractedData` + scan result + 6-section template structure to LiteLLM → returns JSON array of questions operator must answer to complete the document.

**Frontend:** Small stepper modal (same UI pattern) for these questions.

**Pass 2:** `extractedData` + scan result + operator answers → LiteLLM returns complete Risk Assessment as Markdown following the 6-section template.

**PDF conversion:**
- Parse Markdown into `pdfmake` document definition (pure JS, works in Node action)
- `storage.store(pdfBuffer)` → storageId
- Write `pdf_generated` audit log: `{ storageId, generationDurationMs }`
- Save `riskPdfStorageId` on shipment

---

## Idempotency Summary

| Action | Gate mechanism |
|--------|---------------|
| `extractDocumentChunk` | Check `extractionStatus === "processing"` at start |
| `mergeAndResolve` | Check `shipment.status === "resolving"` at start |
| `runDeforestationScan` | Check `scanResult` not set + `scanRunAt` not within 60s |
| `generateDds` | Mutation atomically sets `status: "submitting"` before scheduling; action bails if not `"submitting"` |
| `generateRiskPdf` | Check `riskPdfStorageId` not set |
| `submitSupplierAnswers` | Check `supplierFormCompleted !== true` |

All state transitions that gate an action are set by a **mutation before** the action is scheduled, making them atomic.

---

## Completeness Logic

```
red    → fewer than 3 required fields present
yellow → some required fields present but not all
       OR all required fields present but scanResult not yet set
       OR farmName/villageName present but geoJson absent (geo fallbacks never grant green)
green  → ALL required fields present
       AND scanResult is set (any of: "clean", "alerts_found", "no_polygon")
```

Required fields for green: `operatorName`, `eoriNumber`, `supplierName`, `commodityName`, `hsCode`, `quantity`, `quantityUnit`, `countryOfProduction`, `shipmentRef`

Note: `geoJson` is NOT a required field for green. Its absence auto-triggers `scanResult: "no_polygon"` at `finalizeModal`, satisfying the scan gate. `farmName`/`villageName` are supplier portal hints only and never affect completeness.

Completeness is recomputed by a single shared pure function (`convex/lib/completeness.ts`) called after every mutation that touches `extractedData`, `pendingQuestions`, or `scanResult`.

---

## Failure Handling & Stuck Detection

**Cron: `convex/crons.ts`**

```typescript
crons.interval("reset stuck extractions", { minutes: 10 },
  internal.shipments.resetStuckDocuments
)
```

**Internal mutation: `shipments:resetStuckDocuments`**
- Finds all documents where `extractionStatus === "processing"` AND `lastAttemptAt < Date.now() - 5 * 60 * 1000`
- Sets `extractionStatus: "failed"`, `failureReason: "timeout"`
- Writes `extraction_failed` audit log
- Calls `checkAllExtracted` so the shipment can still proceed to merge with whatever succeeded

**Frontend:** Per-document "Retry" button visible when `extractionStatus === "failed"`. Calls a mutation that resets status to `"pending"` and re-schedules pre-scan + chunk actions.

---

## LLM Router Summary

| Call | Model Group | Runtime |
|------|-------------|---------|
| PDF embedded image description | `vision-primary` (OVH Qwen2.5-VL → Mistral Pixtral-12B) | Node action |
| Scanned PDF OCR merge prompt | `text-primary` (OVH → Mistral Small) | Node action |
| Standalone image extraction | `vision-primary` | Node action |
| Text document extraction | `text-primary` | Node action |
| Merge conflict label generation | `text-primary` | Default Convex |
| DDS field deduction | `text-primary` | Default Convex |
| Risk PDF — question generation | `text-primary` | Default Convex |
| Risk PDF — markdown generation | `text-primary` | Default Convex |

All calls go through the LiteLLM proxy (`LITELLM_BASE_URL`). Proxy timeout capped at 20s. Vision calls only happen for actual images — never for text content. This keeps token cost minimal at early stage.

---

## i18n — General Translation (GT)

Use `https://generaltranslation.com/` for:
- Supplier portal UI (auto-detect browser language)
- Supplier email content
- All question labels in the conflict/missing modal

Operator-facing UI stays in French by default with GT for EN/ES/DE fallback.

---

## Environment Variables Required

```
LITELLM_BASE_URL=https://your-litellm-proxy.onrender.com
GFW_API_KEY=...
RESEND_API_KEY=...
GT_API_KEY=...
OVH_API_KEY=...           # set on LiteLLM proxy (Render env vars), not Convex
MISTRAL_API_KEY=...       # set on LiteLLM proxy (Render env vars), not Convex
```

---

## File Structure

```
convex/
  schema.ts                    ← shipments + shipmentDocuments + shipmentAuditLog
  shipments.ts                 ← all queries and mutations
  crons.ts                     ← stuck extraction reset
  lib/
    validators.ts              ← extractedDataValidator + validateExtractedData()
    completeness.ts            ← shared pure completeness recompute function
  actions/
    extract.ts                 ← "use node" — hybrid extraction (pdfplumber/fitz/marker/vision)
    merge.ts                   ← deterministic pre-pass + LLM conflict labels
    scan.ts                    ← GFW deforestation scan
    supplier.ts                ← Resend email
    dds.ts                     ← "use node" — TRACES submission
    pdf.ts                     ← "use node" — risk PDF generation
```

---

## Key Constraints & Edge Cases

- **Submitted shipments are immutable.** `lockedAt` gates all mutation writes.
- **Supplier form is single-use.** `supplierFormCompleted: true` prevents resubmission.
- **Back navigation in modal** — answers persisted per-step; going back re-calls `answerQuestion` with updated value.
- **Supplier email wrong?** — `shipments:updateSupplierEmail` available before `finalizeModal`. After finalize, "Resend supplier link" button re-calls `sendSupplierEmail`.
- **No GeoJSON polygon** — `finalizeModal` auto-sets `scanResult: "no_polygon"`. Risk PDF notes absence in Section 3. `farmName`/`villageName` shown to supplier in geo question as context only.
- **PDF truncation** — no page limit; all pages processed.
- **pdfmake not puppeteer** — Puppeteer cannot run in Convex's serverless Node environment. pdfmake is pure JS and works within the 128MB memory limit.
- **Deforestation scan cutoff** — GFW query filters from `2020-12-31` (EUDR legal cutoff date).
- **eudr-api-client V3 migration** — EC is preparing a V3 SOAP API. The package currently supports V1/V2. Monitor `github.com/mfrntic/eudr-api-client` for V3 support before go-live.
- **LiteLLM proxy down** — Convex actions fail, document status resets to `"failed"` via cron if stuck. User retries manually.
