import { internalMutation } from "@cvx/_generated/server"

export const cleanupExpiredTranslations = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    const expired = await ctx.db
      .query("translationCache")
      .withIndex("by_expiresAt", (q) => q.lt("expiresAt", now))
      .collect()
    for (const entry of expired) {
      await ctx.db.delete(entry._id)
    }
  },
})
