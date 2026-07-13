import { internalMutation, query } from "@cvx/_generated/server"
import { v } from "convex/values"

export const insertAuditLog = internalMutation({
  args: {
    shipmentId: v.id("shipments"),
    orgId: v.string(),
    actor: v.union(v.literal("user"), v.literal("system"), v.literal("supplier")),
    actorId: v.optional(v.string()),
    eventType: v.union(
      v.literal("field_changed"),
      v.literal("document_uploaded"),
      v.literal("extraction_completed"),
      v.literal("extraction_failed"),
      v.literal("question_answered"),
      v.literal("supplier_email_sent"),
      v.literal("supplier_form_submitted"),
      v.literal("scan_completed"),
      v.literal("dds_submitted"),
      v.literal("pdf_generated"),
      v.literal("risk_assessment_generated"),
      v.literal("shipment_locked"),
    ),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("shipmentAuditLog", {
      shipmentId: args.shipmentId,
      orgId: args.orgId,
      timestamp: Date.now(),
      actor: args.actor,
      actorId: args.actorId,
      eventType: args.eventType,
      payload: args.payload,
    })
  },
})

export const getAuditLogs = query({
  args: {
    shipmentId: v.id("shipments"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("shipmentAuditLog")
      .withIndex("shipmentId", (q) => q.eq("shipmentId", args.shipmentId))
      .order("desc")
      .collect()
  },
})
