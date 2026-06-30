"use node"

import { action } from "@cvx/_generated/server"
import { v } from "convex/values"
import { internal } from "@cvx/_generated/api"
import { callLiteLLM, parseLlmJson } from "@cvx/lib/litellm"

const RISK_TEMPLATE = `# Risk Assessment – EUDR Compliance

## 1. Operator Information
## 2. Product Description
## 3. Origin & Supply Chain
## 4. Deforestation Risk Assessment
## 5. Risk Mitigation Measures
## 6. Declaration`

export const generateRiskPdf = action({
  args: {
    shipmentId: v.id("shipments"),
    operatorAnswers: v.optional(v.array(v.object({
      questionId: v.string(),
      answer: v.string(),
    }))),
  },
  handler: async (ctx, args) => {
    const shipment = await ctx.runQuery(internal.shipments.getShipmentById, {
      shipmentId: args.shipmentId,
    })
    if (!shipment) throw new Error("Shipment not found")
    if (shipment.riskPdfStorageId) return

    const extractedData = (shipment.extractedData ?? {}) as Record<string, unknown>
    const scanResult = shipment.scanResult ?? "no_polygon"

    if (!args.operatorAnswers || args.operatorAnswers.length === 0) {
      const questionsPrompt = `Based on this EUDR compliance data and the risk assessment template, generate 5-10 questions the operator must answer to complete the risk assessment document.

DATA:
${JSON.stringify(extractedData, null, 2)}
Scan result: ${scanResult}

TEMPLATE SECTIONS:
${RISK_TEMPLATE}

Return ONLY a JSON array of objects: [{ "id": "q1", "question": "French question text", "section": 1 }]
No explanation, no markdown.`

      const llmResult = await callLiteLLM("text-primary", [
        { role: "user", content: questionsPrompt },
      ])
      const content = llmResult.choices[0]?.message?.content
      if (!content) throw new Error("Empty LLM response")
      const questions = parseLlmJson<Array<{ id: string; question: string; section: number }>>(content)

      await ctx.runMutation(internal.shipments.storePdfQuestions, {
        shipmentId: args.shipmentId,
        questions,
      })
      return { questions }
    }

    const answersText = args.operatorAnswers.map((a) => `${a.questionId}: ${a.answer}`).join("\n")

    const markdownPrompt = `Generate a complete EUDR Risk Assessment in Markdown based on this data and operator answers.

DATA:
${JSON.stringify(extractedData, null, 2)}
Scan result: ${scanResult}

OPERATOR ANSWERS:
${answersText}

TEMPLATE:
${RISK_TEMPLATE}

Write in French. Include all 6 sections with detailed content. Return ONLY the Markdown content.`

    const llmResult = await callLiteLLM("text-primary", [
      { role: "user", content: markdownPrompt },
    ])
    const content = llmResult.choices[0]?.message?.content
    if (!content) throw new Error("Empty LLM response")
    const markdown = content

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
        ...markdown.split("\n").filter(line => line.trim()).map((line: string) => {
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
      shipmentId: args.shipmentId,
      storageId,
    })

    return { storageId }
  },
})
