"use node"

import { internalAction } from "@cvx/_generated/server"
import { v } from "convex/values"
import { internal } from "@cvx/_generated/api"
import { callLiteLLM, parseLlmJson } from "@cvx/lib/litellm"
import { validateExtractedData } from "@cvx/lib/validators"
import { getDocumentProxy, extractText } from "unpdf"
import { createWorker } from "tesseract.js"
import { EXTRACTION_SCHEMA, extractImagesFromPdf, analyzeImages } from "@cvx/extract"

export const runOcrFallback = internalAction({
  args: {
    documentId: v.id("shipmentDocuments"),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.runQuery(internal.documents.getDocumentById, {
      documentId: args.documentId,
    })
    if (!doc) throw new Error("Document not found")
    if (doc.extractionStatus !== "processing") return

    try {
      const blob = await ctx.storage.get(doc.storageId)
      if (!blob) throw new Error("File not found in storage")
      const buffer = await blob.arrayBuffer()

      const pdf = await getDocumentProxy(new Uint8Array(buffer))

      const { text: extractedText } = await extractText(pdf, { mergePages: true })

      if (extractedText.trim().length > 50) {
        const images = await extractImagesFromPdf(pdf)
        const imageSection = await analyzeImages(images)

        const llmResult = await callLiteLLM("text-primary", [
          { role: "user", content: `You are parsing a trade document for EUDR compliance.\n\nDOCUMENT TEXT:\n${extractedText.substring(0, 30000)}\n\n${imageSection}\n\nExtract ALL of the following fields from the above content and return ONLY valid JSON.\nNo explanation, no markdown, no preamble. If a field is not found, set it to null.\n${EXTRACTION_SCHEMA}` },
        ])
        const content = llmResult.choices[0]?.message?.content
        if (!content) throw new Error("Empty LLM response")
        const extractedJson = parseLlmJson<Record<string, unknown>>(content)

        if (!validateExtractedData(extractedJson)) {
          throw new Error("Extracted data failed validation")
        }

        await ctx.runMutation(internal.documents.setExtractionDone, {
          documentId: args.documentId,
          extractedJson,
          providerUsed: "llm",
        })

        await ctx.runMutation(internal.shipments.checkAllExtracted, {
          shipmentId: doc.shipmentId,
        })
        return
      }

      const worker = await createWorker(["eng", "fra"])
      let allText = ""

      try {
        for (let i = 1; i <= pdf.numPages; i++) {
          try {
            const page = await pdf.getPage(i)
            const viewport = page.getViewport({ scale: 2.0 })
            const canvas = new OffscreenCanvas(viewport.width, viewport.height)
            const context = canvas.getContext("2d")!

            await page.render({ canvas: canvas as never, canvasContext: context as never, viewport }).promise

            const blob = await canvas.convertToBlob()
            const pageImageBuffer = Buffer.from(await blob.arrayBuffer())
            const { data: { text } } = await worker.recognize(pageImageBuffer)
            allText += text + "\n\n"
          } catch {
            allText += `[Page ${i} — OCR unavailable] `
          }
        }
      } finally {
        await worker.terminate()
      }

      const imageSection = "Scanned document — text extracted via OCR."

      const promptText = `You are parsing a scanned trade document for EUDR compliance.\n\nOCR TEXT:\n${allText.substring(0, 30000)}\n\n${imageSection}\n\nScanned document — text extracted via OCR.\n\nExtract ALL of the following fields from the above content and return ONLY valid JSON.\nNo explanation, no markdown, no preamble. If a field is not found, set it to null.\n${EXTRACTION_SCHEMA}`

      const llmResult = await callLiteLLM("text-primary", [
        { role: "user", content: promptText },
      ])
      const content = llmResult.choices[0]?.message?.content
      if (!content) throw new Error("Empty LLM response")
      const extractedJson = parseLlmJson<Record<string, unknown>>(content)

      if (!validateExtractedData(extractedJson)) {
        throw new Error("Extracted data failed validation")
      }

      await ctx.runMutation(internal.documents.setExtractionDone, {
        documentId: args.documentId,
        extractedJson,
        providerUsed: "llm",
      })

      await ctx.runMutation(internal.shipments.checkAllExtracted, {
        shipmentId: doc.shipmentId,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      await ctx.runMutation(internal.documents.setExtractionFailed, {
        documentId: args.documentId,
        failureReason: message,
      })
    }
  },
})
