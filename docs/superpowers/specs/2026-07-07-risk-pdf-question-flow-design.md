# Risk PDF: Intelligent Question Flow for Missing Fields

## Problem

The EUDR risk assessment PDF generator asks 5-10 AI-generated questions in a single form, with three issues:

1. **Asks about known data** — questions about operator name/address/EORI/email even when `extractedData` already has them (or org profile does).
2. **Multi-subject questions** — AI lumps multiple fields into one question ("Quels sont les détails complets de l'opérateur (nom, adresse, EORI, contact) ?") but UI provides one `<Input>` per question.
3. **All questions at once** — no stepper, user sees a wall of inputs.

## Design

### Section → field mapping

Each risk assessment section maps to specific `extractedData` fields:

| Section | Fields | Org fallback |
|---------|--------|-------------|
| 1. Operator Information | `operatorName`, `operatorAddress`, `operatorEmail`, `operatorPhone`, `eoriNumber` | org.`name`/`address`/`email`/`phone`/`eoriNumber` |
| 2. Product Description | `commodityName`, `scientificName`, `hsCode`, `quantity`, `quantityUnit` | — |
| 3. Origin & Supply Chain | `supplierName`, `supplierAddress`, `countryOfExport`, `countryOfProduction`, `shipmentRef`, `portOfLoading`, `portOfEntry`, `productionDate` | — |
| 4. Deforestation Risk | `geoJson` (via `scanResult`), `farmName`, `villageName`, `certifications` | — |
| 5. Risk Mitigation | `mitigationMeasures` | — |
| 6. Declaration | `declarationText` | — |

### Gap analysis flow (in `generateRiskPdf` action)

1. Load `shipment.extractedData` and `shipment.orgId` org profile.
2. For Operator section: check org fields first — if org has `name`, treat `operatorName` as present.
3. For each section, collect the subset of fields that are missing (undefined/null/empty) from both `extractedData` and org.
4. All sections use the same gap analysis. Sections 5-6 only generate questions if `mitigationMeasures` or `declarationText` are missing from `extractedData`.
5. Pass the list of truly missing fields to the LLM with prompt: "Write exactly one French question per field. Each question asks about ONE specific field. Do not ask about any field not in this list."

### Stepper UI

- Replace the current flat list of `<Input>` elements with a one-at-a-time stepper (mirroring `ConflictResolutionDialog` pattern).
- Progress bar at top showing total questions.
- Each step shows: section header, single question, single `<Input>` + "Valider" button.
- Back button allowed.
- After last question, "Générer le PDF" final step.

Note: `mitigationMeasures` and `declarationText` are new fields added to `ExtractedData` type + validator in `convex/lib/validators.ts`.

### Changes

**`convex/pdf.ts`:**
- Add `RISK_SECTION_FIELDS` map.
- Export `getPdfQuestionConfig` helper (pure logic: `(extractedData, org) => missingFields[]`).
- Update question prompt: pass only missing fields, enforce one-field-per-question.
- Keep `RISK_TEMPLATE` and markdown generation as-is (already works).

**`src/components/shipments/RiskPdfDialog.tsx`:**
- Rewrite to stepper (model after `ConflictResolutionDialog`).
- Remove "all questions at once" rendering.
- Add progress bar, back button, per-question validation.

**`convex/shipments.ts`:**
- `storePdfQuestions`: update `normalizedQuestions` if needed to match new shape.

### Non-goals

- No changes to `ConflictResolutionDialog` or supplier flow.
- No changes to PDF styling or markdown rendering.
- No changes to DDS generation.
