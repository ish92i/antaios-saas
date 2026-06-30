"use node"

import { action } from "@cvx/_generated/server"
import { v } from "convex/values"
import { internal } from "@cvx/_generated/api"
import { callLiteLLM, parseLlmJson } from "@cvx/lib/litellm"
import { validateExtractedData } from "@cvx/lib/validators"

const EXTRACTION_SCHEMA = `{
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
}`

export const extractDocument = action({
  args: {
    documentId: v.id("shipmentDocuments"),
  },
  handler: async (ctx, args) => {
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
        const result = await processGeoFile(buffer, mime, fileName)
        extractedJson = result
        providerUsed = "none"
      } else if (fileName.endsWith(".csv") || fileName.endsWith(".tsv") || fileName.endsWith(".xlsx") || fileName.endsWith(".xls") || mime.includes("text") || mime.includes("csv") || mime.includes("spreadsheet")) {
        const text = await processTabularFile(buffer, mime, fileName)
        const llmResult = await callLiteLLM("text-primary", [
          { role: "user", content: `You are parsing a trade document for EUDR compliance.\n\nDOCUMENT TEXT:\n${text.substring(0, 30000)}\n\nNo images were present in this document.\n\nExtract ALL of the following fields from the above content and return ONLY valid JSON.\nNo explanation, no markdown, no preamble. If a field is not found, set it to null.\n${EXTRACTION_SCHEMA}` },
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
        const result = await processPdf(buffer, fileName)
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

async function processGeoFile(buffer: ArrayBuffer, mime: string, fileName: string): Promise<Record<string, unknown>> {
  const geoJson = await parseGeometry(buffer, mime, fileName)
  return { geoJson }
}

async function parseGeometry(buffer: ArrayBuffer, _mime: string, fileName: string): Promise<unknown> {
  const buf = Buffer.from(buffer)
  if (fileName.endsWith(".geojson")) {
    const text = buf.toString("utf-8")
    return JSON.parse(text)
  }
  if (fileName.endsWith(".kml") || fileName.endsWith(".kmz")) {
    const { default: togeojson } = await import("@tmcw/togeojson")
    const { parseStringPromise } = await import("xml2js")
    const text = buf.toString("utf-8")
    const kml = await parseStringPromise(text)
    return togeojson.kml(kml)
  }
  if (fileName.endsWith(".zip")) {
    const JSZip = (await import("jszip")).default
    const zip = await JSZip.loadAsync(buf)
    const shpFile = Object.keys(zip.files).find(f => f.endsWith(".shp"))
    if (!shpFile) throw new Error("No .shp file found in ZIP")
    const geojsonFile = Object.keys(zip.files).find(f => f.endsWith(".geojson"))
    if (geojsonFile) {
      const text = await zip.files[geojsonFile].async("text")
      return JSON.parse(text)
    }
    return { shpFile, note: "Shapefile uploaded — requires manual geoJSON conversion" }
  }
  return null
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

async function processPdf(buffer: ArrayBuffer, _fileName: string): Promise<{ extractedJson: Record<string, unknown>; providerUsed: string }> {
  const buf = Buffer.from(buffer)

  const { PDFParse } = await import("pdf-parse")
  const parser = new PDFParse({ data: buf })
  const textResult = await parser.getText()
  const hasTextLayer = textResult.text.trim().length > 50

  if (hasTextLayer) {
    return processTextLayerPdf(buf, textResult)
  } else {
    return processScannedPdf(buf)
  }
}

async function processTextLayerPdf(buf: Buffer, textResult: any): Promise<{ extractedJson: Record<string, unknown>; providerUsed: string }> {
  const nativeText = textResult.text

  const { PDFDocument } = await import("pdf-lib")
  const pdfDoc = await PDFDocument.load(buf)

  let hasImages = false
  for (const page of pdfDoc.getPages()) {
    const resources = (page as any).node.Resources()
    if (resources?.XObject) {
      hasImages = true
      break
    }
  }

  let imageSection = ""
  if (!hasImages) {
    imageSection = "No embedded images found in this document."
  } else {
    const { getDocument, OPS } = await import("pdfjs-dist/legacy/build/pdf.mjs")
    const pdfJsDoc = await getDocument({ data: buf.slice(0) }).promise

    let relevantImages = 0
    const imageParts: string[] = []

    for (let pageIdx = 0; pageIdx < pdfJsDoc.numPages && relevantImages < 10; pageIdx++) {
      const page = await pdfJsDoc.getPage(pageIdx + 1)
      const opList = await page.getOperatorList()

      for (let i = 0; i < opList.fnArray.length && relevantImages < 10; i++) {
        if (opList.fnArray[i] !== OPS.paintImageXObject) continue

        const imageName = opList.argsArray[i][0]
        if (!imageName) continue

        let imgObj: any
        try {
          imgObj = await (page as any).objs.get(imageName)
        } catch {
          continue
        }
        if (!imgObj || !imgObj.width || !imgObj.height) continue

        const w = imgObj.width
        const h = imgObj.height
        if (w < 50 || h < 50) continue

        const { PNG } = await import("pngjs")
        const png = new PNG({ width: w, height: h })
        const totalPixels = w * h
        const componentCount = imgObj.numComps || (imgObj.data.length >= totalPixels * 3 ? 3 : 1)

        if (componentCount === 1) {
          for (let j = 0; j < totalPixels; j++) {
            png.data[j * 4] = imgObj.data[j]
            png.data[j * 4 + 1] = imgObj.data[j]
            png.data[j * 4 + 2] = imgObj.data[j]
            png.data[j * 4 + 3] = 255
          }
        } else {
          const bpp = Math.min(componentCount, 4)
          for (let j = 0; j < totalPixels; j++) {
            png.data[j * 4] = imgObj.data[j * bpp] ?? 0
            png.data[j * 4 + 1] = imgObj.data[j * bpp + 1] ?? 0
            png.data[j * 4 + 2] = imgObj.data[j * bpp + 2] ?? 0
            png.data[j * 4 + 3] = bpp >= 4 ? (imgObj.data[j * bpp + 3] ?? 255) : 255
          }
        }

        const pngBuffer = PNG.sync.write(png)
        const base64 = pngBuffer.toString("base64")
        const dataUri = `data:image/png;base64,${base64}`

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
          imageParts.push(`Image from page ${pageIdx + 1}: ${parsed.description ?? ""}\n${JSON.stringify(parsed.data ?? {})}`)
        }
      }
    }

    if (relevantImages > 0) {
      imageSection = `COMPLIANCE-RELEVANT IMAGE DATA:\n${imageParts.join("\n\n")}`
    } else {
      imageSection = "Embedded images were present but contained no compliance-relevant data."
    }
  }

  const text = `You are parsing a trade document for EUDR compliance.\n\nDOCUMENT TEXT:\n${nativeText.substring(0, 30000)}\n\n${imageSection}\n\nExtract ALL of the following fields from the above content and return ONLY valid JSON.\nNo explanation, no markdown, no preamble. If a field is not found, set it to null.\n${EXTRACTION_SCHEMA}`

  const llmResult = await callLiteLLM("text-primary", [
    { role: "user", content: text },
  ])
  const content = llmResult.choices[0]?.message?.content
  if (!content) throw new Error("Empty LLM response")
  const extractedJson = parseLlmJson<Record<string, unknown>>(content)

  return { extractedJson, providerUsed: "llm" }
}

async function processScannedPdf(buf: Buffer): Promise<{ extractedJson: Record<string, unknown>; providerUsed: string }> {
  const { getDocument } = await import("pdfjs-dist")
  const loadingTask = getDocument({ data: buf.slice(0) })
  const pdfDoc = await loadingTask.promise

  const { createWorker } = await import("tesseract.js")
  const worker = await createWorker(["eng", "fra"])

  let allText = ""
  const maxPages = pdfDoc.numPages

  try {
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdfDoc.getPage(i)
      const viewport = page.getViewport({ scale: 2.0 })

      const renderContext = {
        canvasContext: { drawImage: () => {}, getImageData: () => ({ data: new Uint8Array(viewport.width * viewport.height * 4), width: viewport.width, height: viewport.height }) },
        viewport,
      }

      try {
      try {
        const task = page.render(renderContext as any)
        await task.promise
      } catch {
        // skip
      }
      const { data: ocrData } = await worker.recognize(`data:image/png;base64,${buf.toString("base64")}`)
      allText += ocrData.text + "\n\n"
      } catch {
        allText += `[Page ${i} — OCR unavailable] `
      }
    }
  } finally {
    await worker.terminate()
  }

  const text = `You are parsing a scanned trade document for EUDR compliance.\n\nOCR TEXT:\n${allText.substring(0, 30000)}\n\nScanned document — text extracted via OCR.\n\nExtract ALL of the following fields from the above content and return ONLY valid JSON.\nNo explanation, no markdown, no preamble. If a field is not found, set it to null.\n${EXTRACTION_SCHEMA}`

  const llmResult = await callLiteLLM("text-primary", [
    { role: "user", content: text },
  ])
  const content = llmResult.choices[0]?.message?.content
  if (!content) throw new Error("Empty LLM response")
  const extractedJson = parseLlmJson<Record<string, unknown>>(content)

  return { extractedJson, providerUsed: "llm" }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}
