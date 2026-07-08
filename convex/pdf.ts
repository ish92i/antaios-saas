"use node"

import { action } from "@cvx/_generated/server"
import { v } from "convex/values"
import { internal } from "@cvx/_generated/api"
import type { Id } from "@cvx/_generated/dataModel"
import { callLiteLLM, parseLlmJson } from "@cvx/lib/litellm"

const RISK_TEMPLATE = `# Risk Assessment – EUDR Compliance

## 1. Operator Information
## 2. Product Description
## 3. Origin & Supply Chain
## 4. Deforestation Risk Assessment
## 5. Risk Mitigation Measures
## 6. Declaration`

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

export const generateRiskPdf = action({
  args: {
    shipmentId: v.id("shipments"),
    operatorAnswers: v.optional(v.array(v.object({
      questionId: v.string(),
      answer: v.string(),
    }))),
  },
  handler: async (ctx, args): Promise<{ storageId: string } | { questions: Array<{ id: string; question: string; section: number; field: string }> } | undefined> => {
    const shipment = await ctx.runQuery(internal.shipments.getShipmentById, {
      shipmentId: args.shipmentId,
    })
    if (!shipment) throw new Error("Shipment not found")
    if (shipment.riskPdfStorageId) return

    const extractedData = (shipment.extractedData ?? {}) as Record<string, unknown>
    const scanResult = shipment.scanResult ?? "no_polygon"

    const org = shipment.orgId
      ? await ctx.runQuery(internal.orgs.getOrgById, { orgId: shipment.orgId as Id<"organizations"> })
      : null

    const dataWithOrg = { ...extractedData } as Record<string, unknown>
    if (org) {
      for (const [dataField, orgField] of Object.entries(ORG_FIELD_MAP)) {
        if (!dataWithOrg[dataField] && (org as Record<string, unknown>)[orgField]) {
          dataWithOrg[dataField] = (org as Record<string, unknown>)[orgField]
        }
      }
    }

    if (!args.operatorAnswers || args.operatorAnswers.length === 0) {
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

          if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
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
        return await generatePdfFromData(ctx, shipment, dataWithOrg, scanResult)
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

    const pending = (shipment.pendingQuestions ?? []) as Array<{ id: string; field: string }>
    const merged = { ...dataWithOrg } as Record<string, unknown>

    for (const a of args.operatorAnswers) {
      const pq = pending.find(p => p.id === a.questionId)
      if (pq) {
        merged[pq.field] = a.answer
      }
    }

    await ctx.runMutation(internal.shipments.patchPdfExtractedData, {
      shipmentId: args.shipmentId,
      extractedData: merged,
    })

    return await generatePdfFromData(ctx, shipment, merged, scanResult)
  },
})

async function generatePdfFromData(
  ctx: any,
  shipment: any,
  data: Record<string, unknown>,
  scanResult: string,
): Promise<{ storageId: string }> {
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
