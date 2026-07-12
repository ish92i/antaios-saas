import { internalMutation } from "./_generated/server"
import { v } from "convex/values"

export const deleteOrgCascade = internalMutation({
  args: { clerkOrgId: v.string() },
  handler: async (ctx, args) => {
    const org = await ctx.db
      .query("organizations")
      .withIndex("clerkOrgId", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .unique()
    if (!org) return

    const orgId = org._id
    const shipments = await ctx.db
      .query("shipments")
      .withIndex("orgId", (q) => q.eq("orgId", orgId))
      .collect()

    for (const shipment of shipments) {
      const docs = await ctx.db
        .query("shipmentDocuments")
        .withIndex("shipmentId", (q) => q.eq("shipmentId", shipment._id))
        .collect()
      for (const doc of docs) {
        await ctx.storage.delete(doc.storageId)
        await ctx.db.delete(doc._id)
      }

      if (shipment.ddsStorageId) await ctx.storage.delete(shipment.ddsStorageId)
      if (shipment.riskPdfStorageId) await ctx.storage.delete(shipment.riskPdfStorageId)

      const logs = await ctx.db
        .query("shipmentAuditLog")
        .withIndex("orgId_timestamp", (q) => q.eq("orgId", orgId))
        .collect()
      for (const log of logs) {
        if (log.shipmentId === shipment._id) await ctx.db.delete(log._id)
      }
      await ctx.db.delete(shipment._id)
    }

    const creds = await ctx.db
      .query("tracesCredentials")
      .withIndex("orgId", (q) => q.eq("orgId", orgId))
      .collect()
    for (const cred of creds) await ctx.db.delete(cred._id)

    const subs = await ctx.db
      .query("subscriptions")
      .withIndex("orgId", (q) => q.eq("orgId", orgId))
      .collect()
    for (const sub of subs) await ctx.db.delete(sub._id)

    await ctx.db.delete(org._id)
  },
})
