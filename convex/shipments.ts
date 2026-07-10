import { mutation, query, internalMutation, internalQuery } from "@cvx/_generated/server"
import { v } from "convex/values"
import { v4 as uuidv4 } from "uuid"
import { internal } from "@cvx/_generated/api"
import { getOrgId } from "@cvx/auth"
import { validateExtractedData } from "@cvx/lib/validators"
import { recomputeCompleteness } from "@cvx/lib/completeness"

export const createShipment = mutation({
  args: {
    internalRef: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const clerkUserId = identity.subject
    const orgId = await getOrgId(ctx)
    if (!orgId) throw new Error("No organization found")

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("orgId", (q) => q.eq("orgId", orgId as string))
      .first()

    if (subscription?.status !== "active") {
      const existingShipments = await ctx.db
        .query("shipments")
        .withIndex("orgId", (q) => q.eq("orgId", orgId as string))
        .collect()

      if (existingShipments.length >= 1) {
        throw new Error(
          "Free tier limit reached. Upgrade to Direct to create more shipments.",
        )
      }
    }

    const shipmentId = await ctx.db.insert("shipments", {
      orgId: orgId as string,
      createdBy: clerkUserId,
      internalRef: args.internalRef,
      status: "draft",
      completeness: "red",
    })

    return shipmentId
  },
})

export const getShipment = query({
  args: { shipmentId: v.id("shipments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.shipmentId)
  },
})

export const listShipments = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrgId(ctx)
    if (!orgId) return []
    return await ctx.db
      .query("shipments")
      .withIndex("orgId", (q) => q.eq("orgId", orgId as string))
      .order("desc")
      .collect()
  },
})

export const getShipmentCount = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrgId(ctx)
    if (!orgId) return 0
    const shipments = await ctx.db
      .query("shipments")
      .withIndex("orgId", (q) => q.eq("orgId", orgId as string))
      .collect()
    return shipments.length
  },
})

export const getShipmentBySupplierToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("shipments")
      .withIndex("supplierToken", (q) => q.eq("supplierToken", args.token))
      .unique()
  },
})

export const answerQuestion = mutation({
  args: {
    shipmentId: v.id("shipments"),
    questionId: v.string(),
    field: v.string(),
    answer: v.any(),
    previousValue: v.any(),
  },
  handler: async (ctx, args) => {
    const shipment = await ctx.db.get(args.shipmentId)
    if (!shipment) throw new Error("Shipment not found")
    if (shipment.lockedAt) throw new Error("Shipment is locked")

    const currentData = (shipment.extractedData as Record<string, unknown>) ?? {}
    currentData[args.field] = args.answer
    if (!validateExtractedData(currentData)) throw new Error("Invalid data")

    const questions = (shipment.pendingQuestions ?? []).filter(
      (q: any) => q.id !== args.questionId,
    )

    const completeness = recomputeCompleteness(
      currentData as any,
      shipment.scanResult,
      questions,
    )

    await ctx.db.patch(args.shipmentId, {
      extractedData: currentData,
      pendingQuestions: questions.length > 0 ? questions : undefined,
      completeness,
    })

    await ctx.scheduler.runAfter(0, internal.audit.insertAuditLog, {
      shipmentId: args.shipmentId,
      orgId: shipment.orgId,
      actor: "user",
      actorId: undefined,
      eventType: "question_answered",
      payload: { questionId: args.questionId, field: args.field, answer: args.answer, previousValue: args.previousValue },
    })
  },
})

export const internalAnswerQuestion = internalMutation({
  args: {
    shipmentId: v.id("shipments"),
    questionId: v.string(),
    field: v.string(),
    answer: v.any(),
    previousValue: v.any(),
    orgId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const shipment = await ctx.db.get(args.shipmentId)
    if (!shipment) throw new Error("Shipment not found")
    if (shipment.lockedAt) throw new Error("Shipment is locked")

    const currentData = (shipment.extractedData as Record<string, unknown>) ?? {}
    currentData[args.field] = args.answer
    if (!validateExtractedData(currentData)) throw new Error("Invalid data")

    const questions = (shipment.pendingQuestions ?? []).filter(
      (q: any) => q.id !== args.questionId,
    )

    const completeness = recomputeCompleteness(
      currentData as any,
      shipment.scanResult,
      questions,
    )

    await ctx.db.patch(args.shipmentId, {
      extractedData: currentData,
      pendingQuestions: questions.length > 0 ? questions : undefined,
      completeness,
    })

    await ctx.scheduler.runAfter(0, internal.audit.insertAuditLog, {
      shipmentId: args.shipmentId,
      orgId: args.orgId ?? shipment.orgId,
      actor: "system",
      eventType: "question_answered",
      payload: { questionId: args.questionId, field: args.field, answer: args.answer, previousValue: args.previousValue },
    })
  },
})

export const flagForSupplier = mutation({
  args: {
    shipmentId: v.id("shipments"),
    questionId: v.string(),
    supplierEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const shipment = await ctx.db.get(args.shipmentId)
    if (!shipment) throw new Error("Shipment not found")
    if (shipment.lockedAt) throw new Error("Shipment is locked")

    const questions = (shipment.pendingQuestions ?? []).map((q: any) =>
      q.id === args.questionId ? { ...q, pendingSupplier: true } : q,
    )

    await ctx.db.patch(args.shipmentId, {
      supplierEmail: args.supplierEmail,
      pendingQuestions: questions.length > 0 ? questions : undefined,
    })
  },
})

export const finalizeModal = mutation({
  args: {
    shipmentId: v.id("shipments"),
  },
  handler: async (ctx, args) => {
    const shipment = await ctx.db.get(args.shipmentId)
    if (!shipment) throw new Error("Shipment not found")
    if (shipment.lockedAt) throw new Error("Shipment is locked")

    const patch: Record<string, unknown> = {}

    if (!shipment.supplierToken) {
      patch.supplierToken = uuidv4()
    }

    const extractedData = shipment.extractedData as Record<string, unknown> | undefined
    if (!extractedData?.geoJson) {
      patch.scanResult = "no_polygon"
    }

    const hasSupplierQuestions = (shipment.pendingQuestions ?? []).some(
      (q: any) => q.pendingSupplier === true,
    )

    if (shipment.supplierEmail && !shipment.supplierFormCompleted && hasSupplierQuestions) {
      const token = (patch.supplierToken as string) ?? shipment.supplierToken
      if (token) {
        await ctx.scheduler.runAfter(0, internal.supplier_email.sendSupplierEmail, {
          shipmentId: args.shipmentId,
          supplierLanguage: shipment.supplierLanguage,
        })
      }
    }

    const completeness = recomputeCompleteness(
      (extractedData ?? null) as any,
      (patch.scanResult as string) ?? shipment.scanResult,
      shipment.pendingQuestions,
    )
    patch.completeness = completeness

    await ctx.db.patch(args.shipmentId, patch)
  },
})

export const hasTracesCredentials = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await getOrgId(ctx)
    if (!orgId) return false
    const creds = await ctx.db
      .query("tracesCredentials")
      .withIndex("orgId", (q) => q.eq("orgId", orgId as string))
      .first()
    return creds !== null
  },
})

export const initiateDdsGeneration = mutation({
  args: {
    shipmentId: v.id("shipments"),
    tracesUsername: v.optional(v.string()),
    authKey: v.optional(v.string()),
    rememberMe: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const shipment = await ctx.db.get(args.shipmentId)
    if (!shipment) throw new Error("Shipment not found")
    if (shipment.lockedAt) throw new Error("Shipment is locked")
    if (shipment.completeness !== "green") throw new Error("Shipment not complete")
    if (shipment.status !== "ready") throw new Error("Shipment not ready")

    const orgId = shipment.orgId

    if (args.rememberMe && args.tracesUsername && args.authKey) {
      await ctx.scheduler.runAfter(0, internal.traces_crypto.storeCredentials, {
        orgId,
        tracesUsername: args.tracesUsername,
        authKey: args.authKey,
      })
    }

    await ctx.db.patch(args.shipmentId, { status: "submitting" })

    await ctx.scheduler.runAfter(0, internal.dds.generateDds, {
      shipmentId: args.shipmentId,
      tracesUsername: args.tracesUsername,
      authKey: args.authKey,
    })
  },
})

export const updateSupplierLanguage = mutation({
  args: {
    shipmentId: v.id("shipments"),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    const shipment = await ctx.db.get(args.shipmentId)
    if (!shipment) throw new Error("Shipment not found")
    if (shipment.lockedAt) throw new Error("Shipment is locked")
    await ctx.db.patch(args.shipmentId, { supplierLanguage: args.language })
  },
})

export const updateSupplierEmail = mutation({
  args: {
    shipmentId: v.id("shipments"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const shipment = await ctx.db.get(args.shipmentId)
    if (!shipment) throw new Error("Shipment not found")
    if (shipment.lockedAt) throw new Error("Shipment is locked")
    await ctx.db.patch(args.shipmentId, { supplierEmail: args.email })
  },
})

export const updateShipmentField = mutation({
  args: {
    shipmentId: v.id("shipments"),
    field: v.string(),
    value: v.any(),
  },
  handler: async (ctx, args) => {
    const shipment = await ctx.db.get(args.shipmentId)
    if (!shipment) throw new Error("Shipment not found")
    if (shipment.lockedAt) throw new Error("Shipment is locked")

    const currentData = { ...((shipment.extractedData as Record<string, unknown>) ?? {}) }
    const previousValue = currentData[args.field]
    currentData[args.field] = args.value

    if (!validateExtractedData(currentData)) throw new Error("Invalid data")

    const completeness = recomputeCompleteness(currentData as any, shipment.scanResult, shipment.pendingQuestions)

    await ctx.db.patch(args.shipmentId, {
      extractedData: currentData,
      completeness,
    })

    await ctx.scheduler.runAfter(0, internal.audit.insertAuditLog, {
      shipmentId: args.shipmentId,
      orgId: shipment.orgId,
      actor: "user",
      actorId: undefined,
      eventType: "field_changed",
      payload: { field: args.field, previousValue, newValue: args.value, source: "user" },
    })
  },
})

export const checkAllExtracted = internalMutation({
  args: {
    shipmentId: v.id("shipments"),
  },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("shipmentDocuments")
      .withIndex("shipmentId", (q) => q.eq("shipmentId", args.shipmentId))
      .collect()

    const allDone = docs.every((d) => d.extractionStatus === "done" || d.extractionStatus === "failed")
    if (!allDone) return

    await ctx.db.patch(args.shipmentId, { status: "resolving" })
    await ctx.scheduler.runAfter(0, internal.merge.mergeAndResolve, {
      shipmentId: args.shipmentId,
    })
  },
})

export const resetStuckDocuments = internalMutation({
  args: {},
  handler: async (ctx) => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000

    const stuck = await ctx.db
      .query("shipmentDocuments")
      .filter((q) => q.and(
        q.eq(q.field("extractionStatus"), "processing"),
        q.lt(q.field("lastAttemptAt"), fiveMinutesAgo),
      ))
      .collect()

    for (const doc of stuck) {
      await ctx.db.patch(doc._id, {
        extractionStatus: "failed",
        failureReason: "timeout",
      })

      await ctx.scheduler.runAfter(0, internal.audit.insertAuditLog, {
        shipmentId: doc.shipmentId,
        orgId: doc.orgId,
        actor: "system",
        eventType: "extraction_failed",
        payload: { documentId: doc._id, failureReason: "timeout" },
      })

      await ctx.scheduler.runAfter(0, internal.shipments.checkAllExtracted, {
        shipmentId: doc.shipmentId,
      })
    }
  },
})

export const getShipmentById = internalQuery({
  args: { shipmentId: v.id("shipments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.shipmentId)
  },
})

export const storeMergeResult = internalMutation({
  args: {
    shipmentId: v.id("shipments"),
    extractedData: v.any(),
    questions: v.any(),
  },
  handler: async (ctx, args) => {
    const shipment = await ctx.db.get(args.shipmentId)
    if (!shipment) throw new Error("Shipment not found")

    const completeness = recomputeCompleteness(
      args.extractedData as any,
      shipment.scanResult,
      args.questions,
    )

    await ctx.db.patch(args.shipmentId, {
      extractedData: args.extractedData,
      pendingQuestions: args.questions?.length > 0 ? args.questions : undefined,
      status: args.questions?.length > 0 ? "resolving" : "pending_scan",
      completeness,
    })

    // Audit log for each field
    if (args.extractedData) {
      await ctx.scheduler.runAfter(0, internal.audit.insertAuditLog, {
        shipmentId: args.shipmentId,
        orgId: shipment.orgId,
        actor: "system",
        eventType: "field_changed",
        payload: { fields: Object.keys(args.extractedData), source: "llm" },
      })
    }
  },
})

export const setScanning = internalMutation({
  args: { shipmentId: v.id("shipments") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.shipmentId, {
      status: "scanning",
      scanRunAt: Date.now(),
    })
  },
})

export const storeScanResult = internalMutation({
  args: {
    shipmentId: v.id("shipments"),
    scanResult: v.string(),
    scanAlertCount: v.number(),
  },
  handler: async (ctx, args) => {
    const shipment = await ctx.db.get(args.shipmentId)
    if (!shipment) throw new Error("Shipment not found")

    await ctx.db.patch(args.shipmentId, {
      scanResult: args.scanResult as "clean" | "alerts_found" | "no_polygon",
      scanAlertCount: args.scanAlertCount,
      scanRunAt: Date.now(),
    })

    // Recompute completeness
    const completeness = recomputeCompleteness(
      shipment.extractedData as any,
      args.scanResult,
      shipment.pendingQuestions,
    )

    await ctx.db.patch(args.shipmentId, { completeness })

    // If green, set ready
    if (completeness === "green" && args.scanResult !== "no_polygon") {
      await ctx.db.patch(args.shipmentId, { status: "ready" })
    } else if (args.scanResult === "no_polygon") {
      await ctx.db.patch(args.shipmentId, { status: "pending_scan" })
    }

    await ctx.scheduler.runAfter(0, internal.audit.insertAuditLog, {
      shipmentId: args.shipmentId,
      orgId: shipment.orgId,
      actor: "system",
      eventType: "scan_completed",
      payload: { scanResult: args.scanResult, alertCount: args.scanAlertCount },
    })
  },
})

export const storeDdsResult = internalMutation({
  args: {
    shipmentId: v.id("shipments"),
    tracesRef: v.string(),
    tracesRawResponse: v.string(),
    submittedPayload: v.any(),
  },
  handler: async (ctx, args) => {
    const shipment = await ctx.db.get(args.shipmentId)
    if (!shipment) throw new Error("Shipment not found")

    await ctx.db.patch(args.shipmentId, {
      status: "submitted",
      tracesRef: args.tracesRef,
      lockedAt: Date.now(),
    })

    await ctx.scheduler.runAfter(0, internal.audit.insertAuditLog, {
      shipmentId: args.shipmentId,
      orgId: shipment.orgId,
      actor: "system",
      eventType: "dds_submitted",
      payload: { tracesRef: args.tracesRef, submittedPayload: args.submittedPayload, tracesRawResponse: args.tracesRawResponse, timestamp: Date.now() },
    })

    await ctx.scheduler.runAfter(0, internal.audit.insertAuditLog, {
      shipmentId: args.shipmentId,
      orgId: shipment.orgId,
      actor: "system",
      eventType: "shipment_locked",
      payload: {},
    })
  },
})

export const resetDdsStatus = internalMutation({
  args: {
    shipmentId: v.id("shipments"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.shipmentId, {
      status: "ready",
    })

    const shipment = await ctx.db.get(args.shipmentId)
    if (!shipment) return

    await ctx.scheduler.runAfter(0, internal.audit.insertAuditLog, {
      shipmentId: args.shipmentId,
      orgId: shipment.orgId,
      actor: "system",
      eventType: "extraction_failed",
      payload: { error: args.error },
    })
  },
})

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

    // Store questions temporarily on the shipment
    await ctx.db.patch(args.shipmentId, {
      pendingQuestions: normalizedQuestions,
    })
  },
})

export const storePdfResult = internalMutation({
  args: {
    shipmentId: v.id("shipments"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const shipment = await ctx.db.get(args.shipmentId)
    if (!shipment) throw new Error("Shipment not found")

    await ctx.db.patch(args.shipmentId, {
      riskPdfStorageId: args.storageId,
    })

    await ctx.scheduler.runAfter(0, internal.audit.insertAuditLog, {
      shipmentId: args.shipmentId,
      orgId: shipment.orgId,
      actor: "system",
      eventType: "pdf_generated",
      payload: { storageId: args.storageId, generationDurationMs: 0 },
    })
  },
})

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
