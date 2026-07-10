"use node"

import { v } from "convex/values"
import { httpAction } from "./_generated/server"
import { internal } from "./_generated/api"
import { CLERK_WEBHOOK_SECRET } from "./env"
import crypto from "crypto"

const WEBHOOK_EVENTS = new Set(["organization.deleted"])

export const handleClerkWebhook = httpAction({
  args: {},
  handler: async (ctx, request) => {
    const secret = CLERK_WEBHOOK_SECRET
    if (!secret) {
      console.error("CLERK_WEBHOOK_SECRET not set")
      return new Response(null, { status: 500 })
    }

    const svixId = request.headers.get("svix-id")
    const svixTimestamp = request.headers.get("svix-timestamp")
    const svixSignature = request.headers.get("svix-signature")

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response(null, { status: 400 })
    }

    const body = await request.text()

    const signedContent = `${svixId}.${svixTimestamp}.${body}`
    const expectedSignatures = svixSignature.split(" ")
    const computed = crypto
      .createHmac("sha256", secret)
      .update(signedContent)
      .digest("base64")

    const valid = expectedSignatures.some((sig) => sig === computed)
    if (!valid) {
      return new Response(null, { status: 401 })
    }

    let payload: { type: string; data: { id: string } }
    try {
      payload = JSON.parse(body)
    } catch {
      return new Response(null, { status: 400 })
    }

    if (!WEBHOOK_EVENTS.has(payload.type)) {
      return new Response(null, { status: 200 })
    }

    if (payload.type === "organization.deleted") {
      await ctx.runMutation(internal.clerkWebhook.deleteOrgCascade, {
        clerkOrgId: payload.data.id,
      })
    }

    return new Response(null, { status: 200 })
  },
})

export const deleteOrgCascade = internalMutation({
  args: {
    clerkOrgId: v.string(),
  },
  handler: async (ctx, args) => {
    const org = await ctx.db
      .query("organizations")
      .withIndex("clerkOrgId", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .unique()

    if (!org) return

    const orgId = org._id

    // Cascade delete: shipments → documents + audit logs + storage
    const shipments = await ctx.db
      .query("shipments")
      .withIndex("orgId", (q) => q.eq("orgId", orgId))
      .collect()

    for (const shipment of shipments) {
      // Documents + their storage files
      const docs = await ctx.db
        .query("shipmentDocuments")
        .withIndex("shipmentId", (q) => q.eq("shipmentId", shipment._id))
        .collect()

      for (const doc of docs) {
        await ctx.storage.delete(doc.storageId)
        await ctx.db.delete(doc._id)
      }

      // DDS & risk PDF storage
      if (shipment.ddsStorageId) {
        await ctx.storage.delete(shipment.ddsStorageId)
      }
      if (shipment.riskPdfStorageId) {
        await ctx.storage.delete(shipment.riskPdfStorageId)
      }

      // Audit logs
      const logs = await ctx.db
        .query("shipmentAuditLog")
        .withIndex("orgId_timestamp", (q) => q.eq("orgId", orgId))
        .collect()

      for (const log of logs) {
        if (log.shipmentId === shipment._id) {
          await ctx.db.delete(log._id)
        }
      }

      await ctx.db.delete(shipment._id)
    }

    // Traces credentials
    const creds = await ctx.db
      .query("tracesCredentials")
      .withIndex("orgId", (q) => q.eq("orgId", orgId))
      .collect()

    for (const cred of creds) {
      await ctx.db.delete(cred._id)
    }

    // Subscription
    const subs = await ctx.db
      .query("subscriptions")
      .withIndex("orgId", (q) => q.eq("orgId", orgId))
      .collect()

    for (const sub of subs) {
      await ctx.db.delete(sub._id)
    }

    // Org itself
    await ctx.db.delete(org._id)
  },
})
