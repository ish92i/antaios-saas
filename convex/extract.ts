"use node"

import { internalAction, type ActionCtx } from "@cvx/_generated/server"
import { v } from "convex/values"
import type { Id } from "@cvx/_generated/dataModel"
import { internal } from "@cvx/_generated/api"
import { parseGeometry } from "@cvx/geo"
import { callLiteLLM, parseLlmJson } from "@cvx/lib/litellm"
import { validateExtractedData } from "@cvx/lib/validators"
import { extractText, extractImages, getDocumentProxy } from "unpdf"
import type { PDFDocumentProxy } from "unpdf/pdfjs"
import { checkRateLimitAction } from "@cvx/rateLimit"

export const EXTRACTION_SCHEMA = `{
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
  "certifications": "Array<{type: string, body: string | null}> | null — e.g. [{type: \"Rainforest Alliance\", body: \"SCS\"}, {type: \"Fair Trade\", body: \"FLOCERT\"}]",
  "scientificName": "string | null — deduce from commodityName if possible",
  "region": "string | null",
  "supplierEmail": "string | null"
}`

export function rawToBmpDataUri(data: Uint8ClampedArray, width: number, height: number, channels: 1 | 3 | 4): string {
  const rowSize = Math.ceil(3 * width / 4) * 4
  const pixelDataSize = rowSize * height
  const fileSize = 14 + 40 + pixelDataSize

  const buf = new ArrayBuffer(fileSize)
  const view = new DataView(buf)

  view.setUint16(0, 0x4D42, true)
  view.setUint32(2, fileSize, true)
  view.setUint32(10, 14 + 40, true)

  view.setUint32(14, 40, true)
  view.setInt32(18, width, true)
  view.setInt32(22, height, true)
  view.setUint16(26, 1, true)
  view.setUint16(28, 24, true)

  for (let y = 0; y < height; y++) {
    const srcRow = (height - 1 - y) * width * channels
    const dstRow = y * rowSize
    for (let x = 0; x < width; x++) {
      const si = srcRow + x * channels
      const di = dstRow + x * 3
      if (channels >= 3) {
        view.setUint8(di, data[si + 2])
        view.setUint8(di + 1, data[si + 1])
        view.setUint8(di + 2, data[si])
      } else {
        const gray = data[si]
        view.setUint8(di, gray)
        view.setUint8(di + 1, gray)
        view.setUint8(di + 2, gray)
      }
    }
  }

  const bytes = new Uint8Array(buf)
  let binary = ""
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return `data:image/bmp;base64,${btoa(binary)}`
}

export async function extractImagesFromPdf(pdf: PDFDocumentProxy): Promise<{ data: Uint8ClampedArray; width: number; height: number; channels: 1 | 3 | 4; pageNum: number }[]> {
  const allImages: { data: Uint8ClampedArray; width: number; height: number; channels: 1 | 3 | 4; pageNum: number }[] = []
  for (let pageIdx = 0; pageIdx < pdf.numPages && allImages.length < 20; pageIdx++) {
    const pageImages = await extractImages(pdf, pageIdx + 1)
    for (const img of pageImages) {
      if (allImages.length >= 20) break
      allImages.push({ ...img, pageNum: pageIdx + 1 })
    }
  }
  return allImages
}

export async function analyzeImages(
  images: { data: Uint8ClampedArray; width: number; height: number; channels: 1 | 3 | 4; pageNum: number }[],
): Promise<string> {
  if (images.length === 0) return "No embedded images found in this document."

  let relevantImages = 0
  const imageParts: string[] = []

  for (const img of images) {
    if (img.width < 50 || img.height < 50) continue
    if (relevantImages >= 10) break

    const dataUri = rawToBmpDataUri(img.data, img.width, img.height, img.channels)

    const llmResult = await callLiteLLM("vision-primary", [
      { role: "user", content: [
        {
          type: "text",
          text: `You are analyzing an image extracted from a trade document for EUDR compliance.
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
  "data": { ...only fields found, using the extractedData field names... }
}
Return ONLY valid JSON. No explanation, no markdown.`,
        },
        { type: "image_url", image_url: { url: dataUri } },
      ]},
    ])
    const content = llmResult.choices[0]?.message?.content
    if (!content) continue

    const parsed = parseLlmJson<{ relevant: boolean; description?: string; data?: Record<string, unknown> }>(content)
    if (parsed && parsed.relevant) {
      relevantImages++
      imageParts.push(`Image from page ${img.pageNum}: ${parsed.description ?? ""}\n${JSON.stringify(parsed.data ?? {})}`)
    }
  }

  if (relevantImages > 0) {
    return `COMPLIANCE-RELEVANT IMAGE DATA:\n${imageParts.join("\n\n")}`
  }
  return "Embedded images were present but contained no compliance-relevant data."
}

export const extractDocument = internalAction({
  args: {
    documentId: v.id("shipmentDocuments"),
  },
  handler: async (ctx, args) => {
    await checkRateLimitAction(ctx, `action:extractDocument:${args.documentId}`, { maxRequests: 20, windowMs: 60_000 })
    const doc = await ctx.runQuery(internal.documents.getDocumentById, {
      documentId: args.documentId,
    })
    if (!doc) throw new Error("Document not found")
    if (doc.extractionStatus !== "pending") return

    await ctx.runMutation(internal.documents.setExtractionProcessing, {
      documentId: args.documentId,
    })

    try {
      const blob = await ctx.storage.get(doc.storageId)
      if (!blob) throw new Error("File not found in storage")
      const buffer = await blob.arrayBuffer()

      let extractedJson: Record<string, unknown> = {}
      let providerUsed = ""
      const mime = doc.mimeType.toLowerCase()
      const fileName = doc.fileName.toLowerCase()

      if (fileName.endsWith(".geojson") || fileName.endsWith(".kml") || fileName.endsWith(".kmz") || fileName.endsWith(".zip")) {
        const result = await processGeoFile(buffer, fileName)
        extractedJson = result
        providerUsed = "none"
      } else if (fileName.endsWith(".csv") || fileName.endsWith(".tsv") || fileName.endsWith(".xlsx") || fileName.endsWith(".xls") || mime.includes("text") || mime.includes("csv") || mime.includes("spreadsheet")) {
        const text = await processTabularFile(buffer, mime, fileName)
        const llmResult = await callLiteLLM("text-primary", [
          { role: "user", content: `You are parsing a trade document for EUDR compliance. The data below was extracted from a spreadsheet — column headers are the original document labels.\n\nDOCUMENT TEXT:\n${text.substring(0, 30000)}\n\nNo images were present in this document.\n\nExtract ALL of the following fields from the above content and return ONLY valid JSON.\nNo explanation, no markdown, no preamble. If a field is not found, set it to null.\n${EXTRACTION_SCHEMA}` },
        ])
        const content = llmResult.choices[0]?.message?.content
        if (!content) throw new Error("Empty LLM response")
        extractedJson = parseLlmJson<Record<string, unknown>>(content)
        providerUsed = "llm"
      } else if (mime.includes("image") || mime.includes("png") || mime.includes("jpg") || mime.includes("jpeg") || mime.includes("tiff") || mime.includes("webp")) {
        const base64 = arrayBufferToBase64(buffer)
        const dataUri = `data:${doc.mimeType};base64,${base64}`
        const llmResult = await callLiteLLM("vision-primary", [
          { role: "user", content: [
            { type: "text", text: `Extract ALL EUDR compliance fields from this document image. Return ONLY valid JSON. No explanation. ${EXTRACTION_SCHEMA}` },
            { type: "image_url", image_url: { url: dataUri } },
          ]},
        ])
        const content = llmResult.choices[0]?.message?.content
        if (!content) throw new Error("Empty LLM response")
        extractedJson = parseLlmJson<Record<string, unknown>>(content)
        providerUsed = "llm"
      } else if (mime.includes("pdf")) {
        const result = await processPdf(ctx, buffer, args.documentId)
        if (!result) return
        extractedJson = result.extractedJson
        providerUsed = result.providerUsed
      } else {
        throw new Error(`Unsupported file type: ${mime}`)
      }

      if (!validateExtractedData(extractedJson)) {
        throw new Error("Extracted data failed validation")
      }

      await ctx.runMutation(internal.documents.setExtractionDone, {
        documentId: args.documentId,
        extractedJson,
        providerUsed,
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

async function processPdf(ctx: ActionCtx, buffer: ArrayBuffer, documentId: Id<"shipmentDocuments">): Promise<{ extractedJson: Record<string, unknown>; providerUsed: string } | null> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer))

  const { text } = await extractText(pdf, { mergePages: true })
  const hasTextLayer = text.trim().length > 200

  if (!hasTextLayer) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await ctx.scheduler.runAfter(0, internal.extractOcr.runOcrFallback, { documentId })
    return null
  }

  const images = await extractImagesFromPdf(pdf)
  const imageSection = await analyzeImages(images)

  const promptText = `You are parsing a trade document for EUDR compliance.\n\nDOCUMENT TEXT:\n${text.substring(0, 30000)}\n\n${imageSection}\n\nExtract ALL of the following fields from the above content and return ONLY valid JSON.\nNo explanation, no markdown, no preamble. If a field is not found, set it to null.\n${EXTRACTION_SCHEMA}`

  const llmResult = await callLiteLLM("text-primary", [
    { role: "user", content: promptText },
  ])
  const content = llmResult.choices[0]?.message?.content
  if (!content) throw new Error("Empty LLM response")
  const extractedJson = parseLlmJson<Record<string, unknown>>(content)

  return { extractedJson, providerUsed: "llm" }
}

async function processGeoFile(buffer: ArrayBuffer, fileName: string): Promise<Record<string, unknown>> {
  const geoJson = await parseGeometry(buffer, fileName)
  return { geoJson }
}

async function processTabularFile(buffer: ArrayBuffer, _mime: string, fileName: string): Promise<string> {
  const buf = Buffer.from(buffer)
  if (fileName.endsWith(".csv") || fileName.endsWith(".tsv")) {
    const { default: papa } = await import("papaparse")
    const text = buf.toString("utf-8")
    const result = papa.parse(text, { header: true, skipEmptyLines: true })
    return JSON.stringify(result.data, null, 2)
  }
  if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
    const XLSX = await import("xlsx")
    const workbook = XLSX.read(buf, { type: "buffer" })
    const sheets = workbook.SheetNames.map(name => ({
      sheet: name,
      data: XLSX.utils.sheet_to_json(workbook.Sheets[name], { defval: "" }),
    }))
    return JSON.stringify(sheets, null, 2)
  }
  return buf.toString("utf-8").substring(0, 30000)
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}
