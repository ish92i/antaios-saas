import { internalMutation, internalQuery } from "@cvx/_generated/server"
import { v } from "convex/values"

export const _writeCredentials = internalMutation({
  args: {
    orgId: v.string(),
    tracesUsername: v.string(),
    encryptedAuthKey: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("tracesCredentials")
      .withIndex("orgId", (q) => q.eq("orgId", args.orgId))
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        tracesUsername: args.tracesUsername,
        encryptedAuthKey: args.encryptedAuthKey,
      })
    } else {
      await ctx.db.insert("tracesCredentials", {
        orgId: args.orgId,
        tracesUsername: args.tracesUsername,
        encryptedAuthKey: args.encryptedAuthKey,
      })
    }
  },
})

export const _getFullCredentials = internalQuery({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tracesCredentials")
      .withIndex("orgId", (q) => q.eq("orgId", args.orgId))
      .first()
  },
})

export const hasStoredCredentials = internalQuery({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    const creds = await ctx.db
      .query("tracesCredentials")
      .withIndex("orgId", (q) => q.eq("orgId", args.orgId))
      .first()
    return creds !== null
  },
})
