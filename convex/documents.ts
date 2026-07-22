import { mutation, query, internalMutation, internalQuery } from "@cvx/_generated/server"
import { v } from "convex/values"
import { internal } from "@cvx/_generated/api"
import { getOrgId } from "@cvx/auth"
import { logger } from "@cvx/lib/logger"
import { checkRateLimit, DEFAULTS } from "@cvx/rateLimit"

const MAX_FILE_SIZE = 10 * 1024 * 1024

export const addDocument = mutation({
  args: {
    shipmentId: v.id("shipments"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    mimeType: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    const userId = identity?.subject ?? "anonymous"
    await checkRateLimit(ctx, `mutation:addDocument:${userId}`, DEFAULTS.mutation)

    const orgId = await getOrgId(ctx)
    if (!orgId) throw new Error("No organization")

    const metadata = await ctx.storage.getMetadata(args.storageId)
    if (!metadata) throw new Error("File not found in storage")
    if (metadata.size > MAX_FILE_SIZE) {
      await ctx.storage.delete(args.storageId)
      throw new Error("File too large. Maximum size is 10 MB.")
    }

    const docId = await ctx.db.insert("shipmentDocuments", {
      shipmentId: args.shipmentId,
      orgId: orgId as string,
      storageId: args.storageId,
      fileName: args.fileName,
      mimeType: args.mimeType,
      extractionStatus: "pending",
      lastAttemptAt: Date.now(),
    })

    logger.info("Document uploaded", {
      documentId: docId,
      shipmentId: args.shipmentId,
      fileName: args.fileName,
      mimeType: args.mimeType,
    })

    await ctx.scheduler.runAfter(0, internal.extract.extractDocument, {
      documentId: docId,
    })

    await ctx.scheduler.runAfter(0, internal.audit.insertAuditLog, {
      shipmentId: args.shipmentId,
      orgId: orgId as string,
      actor: "user",
      eventType: "document_uploaded",
      payload: { documentId: docId, fileName: args.fileName, mimeType: args.mimeType },
    })

    const shipment = await ctx.db.get(args.shipmentId)
    if (shipment && shipment.status === "draft") {
      await ctx.db.patch(args.shipmentId, { status: "extracting" })
    }

    return docId
  },
})

export const getDocuments = query({
  args: {
    shipmentId: v.id("shipments"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("shipmentDocuments")
      .withIndex("shipmentId", (q) => q.eq("shipmentId", args.shipmentId))
      .collect()
  },
})

export const retryDocument = mutation({
  args: {
    documentId: v.id("shipmentDocuments"),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId)
    if (!doc) throw new Error("Document not found")

    await ctx.db.patch(args.documentId, {
      extractionStatus: "pending",
      failureReason: undefined,
      lastAttemptAt: Date.now(),
    })

    await ctx.scheduler.runAfter(0, internal.extract.extractDocument, {
      documentId: args.documentId,
    })
  },
})

export const getDocumentById = internalQuery({
  args: { documentId: v.id("shipmentDocuments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.documentId)
  },
})

export const getDocumentsByShipment = internalQuery({
  args: { shipmentId: v.id("shipments") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("shipmentDocuments")
      .withIndex("shipmentId", (q) => q.eq("shipmentId", args.shipmentId))
      .collect()
  },
})

export const setExtractionProcessing = internalMutation({
  args: { documentId: v.id("shipmentDocuments") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, {
      extractionStatus: "processing",
      lastAttemptAt: Date.now(),
    })
  },
})

export const setExtractionDone = internalMutation({
  args: {
    documentId: v.id("shipmentDocuments"),
    extractedJson: v.any(),
    providerUsed: v.string(),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId)
    if (!doc) throw new Error("Document not found")

    await ctx.db.patch(args.documentId, {
      extractionStatus: "done",
      extractedJson: args.extractedJson,
      providerUsed: args.providerUsed,
      lastAttemptAt: Date.now(),
    })

    await ctx.scheduler.runAfter(0, internal.audit.insertAuditLog, {
      shipmentId: doc.shipmentId,
      orgId: doc.orgId,
      actor: "system",
      eventType: "extraction_completed",
      payload: { documentId: args.documentId, providerUsed: args.providerUsed, rawJson: args.extractedJson },
    })
  },
})

export const setExtractionFailed = internalMutation({
  args: {
    documentId: v.id("shipmentDocuments"),
    failureReason: v.string(),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId)
    if (!doc) throw new Error("Document not found")

    await ctx.db.patch(args.documentId, {
      extractionStatus: "failed",
      failureReason: args.failureReason,
      lastAttemptAt: Date.now(),
    })

    await ctx.scheduler.runAfter(0, internal.audit.insertAuditLog, {
      shipmentId: doc.shipmentId,
      orgId: doc.orgId,
      actor: "system",
      eventType: "extraction_failed",
      payload: { documentId: args.documentId, failureReason: args.failureReason },
    })
  },
})
