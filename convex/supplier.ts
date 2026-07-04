import { mutation, query } from "@cvx/_generated/server"
import { v } from "convex/values"
import { internal } from "@cvx/_generated/api"
import { validateExtractedData } from "@cvx/lib/validators"
import { recomputeCompleteness } from "@cvx/lib/completeness"

export const getSupplierForm = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const shipment = await ctx.db
      .query("shipments")
      .withIndex("supplierToken", (q) => q.eq("supplierToken", args.token))
      .unique()

    if (!shipment) throw new Error("Invalid token")
    if (shipment.supplierFormCompleted) throw new Error("Form already completed")
    if (shipment.lockedAt) throw new Error("Shipment is locked")

    return {
      shipmentRef: (shipment.extractedData as Record<string, unknown> | undefined)?.shipmentRef ?? null,
      questions: shipment.pendingQuestions ?? [],
      supplierEmail: shipment.supplierEmail,
      supplierLanguage: shipment.supplierLanguage ?? null,
    }
  },
})

export const submitSupplierAnswers = mutation({
  args: {
    token: v.string(),
    answers: v.array(v.object({
      questionId: v.string(),
      field: v.string(),
      answer: v.any(),
    })),
  },
  handler: async (ctx, args) => {
    const shipment = await ctx.db
      .query("shipments")
      .withIndex("supplierToken", (q) => q.eq("supplierToken", args.token))
      .unique()

    if (!shipment) throw new Error("Invalid token")
    if (shipment.supplierFormCompleted) throw new Error("Form already completed")
    if (shipment.lockedAt) throw new Error("Shipment is locked")

    const currentData = { ...(shipment.extractedData as Record<string, unknown> ?? {}) }

    for (const answer of args.answers) {
      currentData[answer.field] = answer.answer

      await ctx.scheduler.runAfter(0, internal.audit.insertAuditLog, {
        shipmentId: shipment._id,
        orgId: shipment.orgId,
        actor: "supplier",
        eventType: "supplier_form_submitted",
        payload: { questionId: answer.questionId, field: answer.field, answer: answer.answer },
      })
    }

    if (!validateExtractedData(currentData)) throw new Error("Invalid data")

    const geoAnswer = currentData.geoJson
    const geoIsValid = typeof geoAnswer === "object" && geoAnswer !== null && !Array.isArray(geoAnswer)

    const originalQuestions = (shipment.pendingQuestions ?? []) as Array<{ field: string; type: string }>
    const hasGeoQuestion = originalQuestions.some((q) => q.field === "geoJson" && q.type === "geo_missing")

    let remainingQuestions: any[] = []
    if (hasGeoQuestion && !geoIsValid) {
      remainingQuestions = originalQuestions.filter((q) => q.field === "geoJson")
    }

    const scanResult = geoIsValid ? undefined : shipment.scanResult

    const completeness = recomputeCompleteness(
      currentData as any,
      scanResult,
      remainingQuestions.length > 0 ? remainingQuestions : undefined,
    )

    await ctx.db.patch(shipment._id, {
      extractedData: currentData,
      pendingQuestions: remainingQuestions.length > 0 ? remainingQuestions : undefined,
      supplierFormCompleted: remainingQuestions.length === 0,
      scanResult,
      completeness,
    })
  },
})
