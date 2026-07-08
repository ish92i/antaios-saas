# Risk PDF Question Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Smart question flow for EUDR PDF generator — only ask about missing fields, one question at a time.

**Architecture:** Section→field mapping drives gap analysis. Org profile fills operator section fields. LLM generates 1 question per missing field. Frontend stepper shows one at a time.

**Tech Stack:** Convex (actions, mutations, queries), TypeScript, React, pdfmake

## Global Constraints

- All new string fields added to `ExtractedData` type + validator pattern
- French question text from LLM
- Follow existing `ConflictResolutionDialog` stepper pattern for frontend
- No new npm dependencies
- No changes to existing supplier flow or DDS generation

---

### Task 1: Add `mitigationMeasures` + `declarationText` to ExtractedData

**Files:**
- Modify: `convex/lib/validators.ts`

**Interfaces:**
- Produces: `ExtractedData` type now has `mitigationMeasures?: string` and `declarationText?: string`

- [ ] **Add to v.object validator** after `villageName` line:
```
  mitigationMeasures: v.optional(v.string()),
  declarationText: v.optional(v.string()),
```

- [ ] **Add to ExtractedData type** after `villageName?: string`:
```
  mitigationMeasures?: string
  declarationText?: string
```

- [ ] **Add to `stringFields` array** in `validateExtractedData`:
```
"mitigationMeasures", "declarationText"
```

---

### Task 2: Add internal org query

**Files:**
- Modify: `convex/orgs.ts`

**Interfaces:**
- Produces: `internal.orgs.getOrgById` — query that takes `orgId: v.id("organizations")` and returns org or undefined

- [ ] **Import internalQuery and add query:**

```ts
import { internalQuery } from "@cvx/_generated/server"

export const getOrgById = internalQuery({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orgId)
  },
})
```

---

### Task 3: Backend gap analysis + question generation rewrite

**Files:**
- Modify: `convex/pdf.ts`

**Consumes:** `internal.orgs.getOrgById`, `internal.shipments.getShipmentById`  
**Produces:** Questions only for truly missing fields, answers merged into `extractedData`

- [ ] **Add import for internal orgs:**
```ts
// After existing imports
import { internal } from "@cvx/_generated/api"
```

- [ ] **Add section→field mapping after RISK_TEMPLATE:**
```ts
const RISK_SECTION_FIELDS: Record<number, string[]> = {
  1: ["operatorName", "operatorAddress", "operatorEmail", "operatorPhone", "eoriNumber"],
  2: ["commodityName", "scientificName", "hsCode", "quantity", "quantityUnit"],
  3: ["supplierName", "supplierAddress", "countryOfExport", "countryOfProduction", "shipmentRef", "portOfLoading", "portOfEntry", "productionDate"],
  4: ["farmName", "villageName", "certifications"],
  5: ["mitigationMeasures"],
  6: ["declarationText"],
}

const ORG_FIELD_MAP: Record<string, string> = {
  operatorName: "name",
  operatorAddress: "address",
  operatorEmail: "email",
  operatorPhone: "phone",
  eoriNumber: "eoriNumber",
}
```

- [ ] **Replace old question block (lines 35-59) with gap analysis logic:**
```ts
    if (!args.operatorAnswers || args.operatorAnswers.length === 0) {
      const org = shipment.orgId
        ? await ctx.runQuery(internal.orgs.getOrgById, { orgId: shipment.orgId as any })
        : null

      const missingFieldsBySection: Record<number, string[]> = {}

      for (const [sectionStr, fields] of Object.entries(RISK_SECTION_FIELDS)) {
        const section = Number(sectionStr)
        const missing: string[] = []

        for (const field of fields) {
          let value = (extractedData as Record<string, unknown>)[field]

          if (!value && section === 1 && org) {
            const orgField = ORG_FIELD_MAP[field]
            if (orgField) {
              value = (org as Record<string, unknown>)[orgField]
            }
          }

          if (!value || (typeof value === "string" && value.trim() === "")) {
            missing.push(field)
          }
        }

        if (missing.length > 0) {
          missingFieldsBySection[section] = missing
        }
      }

      const sectionsWithMissing = Object.entries(missingFieldsBySection)
        .map(([s, fields]) => `Section ${s}: ${fields.join(", ")}`)
        .join("\n")

      if (!sectionsWithMissing) {
        // No missing fields — skip straight to PDF generation
        return await generatePdfFromData(ctx, shipment, extractedData, scanResult)
      }

      const questionsPrompt = `Generate questions for a EUDR Risk Assessment. Only ask about fields that need data.

MISSING FIELDS PER SECTION:
${sectionsWithMissing}

RULES:
- Write exactly ONE French question per field listed above
- Each question asks about ONE specific field. Never combine fields.
- Never ask about fields NOT in the missing list
- Include the exact field name in each object

Return ONLY a JSON array: [{ "id": "q1", "question": "French question text", "section": 1, "field": "exactFieldName" }]`

      const llmResult = await callLiteLLM("text-primary", [
        { role: "user", content: questionsPrompt },
      ])
      const content = llmResult.choices[0]?.message?.content
      if (!content) throw new Error("Empty LLM response")
      const questions = parseLlmJson<Array<{ id: string; question: string; section: number; field: string }>>(content)

      await ctx.runMutation(internal.shipments.storePdfQuestions, {
        shipmentId: args.shipmentId,
        questions,
      })
      return { questions }
    }
```

Note: Each question object now includes `field` so mapping is unambiguous.

- [ ] **Replace old answer-processing block (lines 62-83) — merge answers into extractedData, then generate:**
```ts
    const pending = (shipment.pendingQuestions ?? []) as Array<{ id: string; field: string }>
    const merged = { ...extractedData } as Record<string, unknown>

    for (const a of args.operatorAnswers) {
      const pq = pending.find(p => p.id === a.questionId)
      if (pq) {
        merged[pq.field] = a.answer
      }
    }

    // Persist merged data so it's available for future re-generation
    await ctx.runMutation(internal.shipments.patchPdfExtractedData, {
      shipmentId: args.shipmentId,
      extractedData: merged,
    })

    return await generatePdfFromData(ctx, shipment, merged, scanResult)
```

- [ ] **Extract PDF generation into helper function:**
```ts
async function generatePdfFromData(
  ctx: any,
  shipment: any,
  data: Record<string, unknown>,
  scanResult: string,
) {
  const markdownPrompt = `Generate a complete EUDR Risk Assessment in Markdown based on this data.

DATA:
${JSON.stringify(data, null, 2)}
Scan result: ${scanResult}

TEMPLATE:
${RISK_TEMPLATE}

Write in French. Include all 6 sections with detailed content. Return ONLY the Markdown content.`

  const llmResult = await callLiteLLM("text-primary", [
    { role: "user", content: markdownPrompt },
  ])
  const content = llmResult.choices[0]?.message?.content
  if (!content) throw new Error("Empty LLM response")

  const pdfMakePrinter = await import("pdfmake")
  const pdfmake = pdfMakePrinter.default ?? pdfMakePrinter
  const fonts = {
    Helvetica: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Oblique",
      bolditalics: "Helvetica-BoldOblique",
    },
  }
  pdfmake.fonts = fonts

  const docDefinition: any = {
    content: [
      { text: "Risk Assessment – EUDR Compliance", style: "header" },
      { text: "\n" },
      ...content.split("\n").filter((line: string) => line.trim()).map((line: string) => {
        if (line.startsWith("## ")) return { text: line.replace("## ", ""), style: "subheader" }
        if (line.startsWith("# ")) return { text: line.replace("# ", ""), style: "header" }
        return { text: line, style: "paragraph", margin: [0, 4, 0, 4] }
      }),
    ],
    styles: {
      header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
      subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
      paragraph: { fontSize: 10, lineHeight: 1.4 },
    },
    defaultStyle: { font: "Helvetica" },
  }

  const printer = pdfmake.createPdf(docDefinition)
  const pdfBuffer: Buffer = await printer.getBuffer()
  const storageId = await ctx.storage.store(new Blob([new Uint8Array(pdfBuffer)], { type: "application/pdf" }))

  await ctx.runMutation(internal.shipments.storePdfResult, {
    shipmentId: shipment._id,
    storageId,
  })

  return { storageId }
}
```

---

### Task 4: Add internal mutation to merge PDF answers

**Files:**
- Modify: `convex/shipments.ts`

**Interfaces:**
- Produces: `internal.shipments.patchPdfExtractedData` — takes `shipmentId` + `extractedData`, patches the shipment

- [ ] **Add internal mutation after `storePdfResult`:**
```ts
export const patchPdfExtractedData = internalMutation({
  args: {
    shipmentId: v.id("shipments"),
    extractedData: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.shipmentId, {
      extractedData: args.extractedData,
    })
  },
})
```

---

### Task 5: Rewrite RiskPdfDialog to stepper UI

**Files:**
- Modify: `src/components/shipments/RiskPdfDialog.tsx`

**Consumes:** `api.pdf.generateRiskPdf`, stepper pattern from `ConflictResolutionDialog`

- [ ] **Replace entire component with stepper version:**
```tsx
import { useState } from "react"
import { useAction } from "convex/react"
import { api } from "@cvx/_generated/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, FileText, CheckCircle2, ChevronLeft } from "lucide-react"
import type { Id } from "@cvx/_generated/dataModel"

interface PdfQuestion {
  id: string
  question: string
  section: number
  field: string
}

export function RiskPdfDialog({
  open,
  onOpenChange,
  shipmentId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  shipmentId?: string
}) {
  const [questions, setQuestions] = useState<PdfQuestion[] | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const generatePdf = useAction(api.pdf.generateRiskPdf)

  const handleStart = async () => {
    if (!shipmentId) return
    setIsGenerating(true)
    setError(null)
    try {
      const result = await generatePdf({
        shipmentId: shipmentId as Id<"shipments">,
      }) as { questions?: PdfQuestion[] } | undefined
      if (result?.questions && result.questions.length > 0) {
        setQuestions(result.questions)
        setCurrentStep(0)
      } else {
        setIsComplete(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la génération du PDF")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAnswer = async () => {
    if (!shipmentId || !questions) return
    const q = questions[currentStep]
    if (!answers[q.id]?.trim()) return

    // If not last question, advance
    if (currentStep < questions.length - 1) {
      setCurrentStep(s => s + 1)
      return
    }

    // Last question — submit all answers
    setIsGenerating(true)
    setError(null)
    try {
      await generatePdf({
        shipmentId: shipmentId as Id<"shipments">,
        operatorAnswers: questions.map((q) => ({
          questionId: q.id,
          answer: answers[q.id] ?? "",
        })),
      })
      setIsComplete(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la génération du PDF")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setQuestions(null)
    setCurrentStep(0)
    setAnswers({})
    setError(null)
    setIsComplete(false)
    setIsGenerating(false)
  }

  const currentQuestion = questions?.[currentStep]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>PDF d'évaluation des risques</DialogTitle>
          <DialogDescription>
            Générez le rapport d'évaluation des risques EUDR pour cet envoi.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-[120px]">
          {isComplete ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
              <p className="text-sm font-medium text-foreground">PDF généré avec succès</p>
              <p className="text-xs text-muted-foreground">
                Le document d'évaluation des risques est disponible dans les documents de l'envoi.
              </p>
            </div>
          ) : questions && currentQuestion ? (
            <div className="space-y-4">
              {/* Progress bar */}
              <div className="flex items-center gap-2 py-1">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${
                      i <= currentStep ? "bg-primary" : "bg-border"
                    }`}
                  />
                ))}
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Section {currentQuestion.section}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {currentQuestion.question}
                </p>
              </div>

              <Input
                value={answers[currentQuestion.id] ?? ""}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [currentQuestion.id]: e.target.value }))
                }
                placeholder="Votre réponse"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && answers[currentQuestion.id]?.trim()) {
                    handleAnswer()
                  }
                }}
              />

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-2 pt-2">
                {currentStep > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(s => s - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </Button>
                )}
                <Button
                  onClick={handleAnswer}
                  disabled={!answers[currentQuestion.id]?.trim() || isGenerating}
                  className="ml-auto"
                >
                  {currentStep < questions.length - 1
                    ? "Suivant"
                    : isGenerating
                      ? "Génération..."
                      : "Générer le PDF"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Générez le PDF d'évaluation des risques à partir des données extraites.
              </p>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isGenerating}>
            Fermer
          </Button>
          {!isComplete && !questions && (
            <Button onClick={handleStart} disabled={isGenerating}>
              {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
              {isGenerating ? "Génération..." : "Générer le PDF"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

---

### Task 6: Update `storePdfQuestions` to store field mapping

**Files:**
- Modify: `convex/shipments.ts`

- [ ] **Update `storePdfQuestions` to use actual field names from question objects** (currently it generates `risk_pdf:${section}` as the field — change to use `question.field`):

```ts
export const storePdfQuestions = internalMutation({
  args: {
    shipmentId: v.id("shipments"),
    questions: v.any(),
  },
  handler: async (ctx, args) => {
    const normalizedQuestions = Array.isArray(args.questions)
      ? args.questions.map((question: any) => ({
          id: String(question.id),
          field: String(question.field ?? `risk_pdf:${String(question.section ?? "general")}`),
          type: "pdf_question",
          label: String(question.question ?? question.label ?? "Question"),
          geoType: null,
        }))
      : []

    await ctx.db.patch(args.shipmentId, {
      pendingQuestions: normalizedQuestions,
    })
  },
})
```
