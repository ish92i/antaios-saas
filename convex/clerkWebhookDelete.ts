import { internalMutation } from "./_generated/server"
import { v } from "convex/values"
import { CLERK_SECRET_KEY } from "./env"
import { logger } from "@cvx/lib/logger"

const CLERK_API = "https://api.clerk.com/v1"

async function clerkFetch(path: string, method: string, body?: unknown) {
  const res = await fetch(`${CLERK_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Clerk API ${res.status}: ${text}`)
  }
  return res.json()
}

async function deleteOrgUsers(clerkOrgId: string) {
  if (!CLERK_SECRET_KEY) {
    logger.error("CLERK_SECRET_KEY not set — skipping user cleanup")
    return
  }

  let members: Array<{ id: string; public_user_data: { user_id: string } }> = []
  let page = 1
  while (true) {
    const data = await clerkFetch(
      `/organizations/${clerkOrgId}/memberships?page=${page}&page_size=100`,
      "GET",
    )
    members.push(...(data.data ?? []))
    if (!data.has_more) break
    page++
  }

  for (const member of members) {
    const userId = member.public_user_data.user_id
    try {
      const orgsData = await clerkFetch(
        `/users/${userId}/organization_memberships`,
        "GET",
      )
      const orgCount = orgsData.data?.length ?? 0

      if (orgCount <= 1) {
        await clerkFetch(`/users/${userId}`, "DELETE")
        logger.info("Deleted sole-org Clerk user", { userId, clerkOrgId })
      } else {
        await clerkFetch(
          `/organizations/${clerkOrgId}/memberships/${member.id}`,
          "DELETE",
        )
        logger.info("Removed multi-org user from deleted org", {
          userId,
          clerkOrgId,
          remainingOrgs: orgCount - 1,
        })
      }
    } catch (err) {
      logger.error("Failed to process Clerk member", {
        userId,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }
}

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

    // Delete Clerk users who only belong to this org
    await deleteOrgUsers(args.clerkOrgId)

    await ctx.db.delete(org._id)
  },
})
