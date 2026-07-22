import { internalMutation, type MutationCtx } from "@cvx/_generated/server"
import { v } from "convex/values"

export class RateLimitError extends Error {
  retryAfter: number
  constructor(retryAfter: number) {
    super(`Rate limit exceeded. Try again in ${retryAfter} seconds.`)
    this.name = "RateLimitError"
    this.retryAfter = retryAfter
  }
}

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export const DEFAULTS = {
  mutation: { maxRequests: 30, windowMs: 60_000 },
  action: { maxRequests: 10, windowMs: 60_000 },
  email: { maxRequests: 5, windowMs: 60_000 },
}

const RATE_LIMIT_ENABLED = process.env.RATE_LIMIT_ENABLED !== "false"

export const recordRateLimitHit = internalMutation({
  args: {
    key: v.string(),
    maxRequests: v.number(),
    windowMs: v.number(),
  },
  handler: async (ctx, args): Promise<{ allowed: boolean; remaining: number; retryAfter: number | null }> => {
    if (!RATE_LIMIT_ENABLED) {
      return { allowed: true, remaining: args.maxRequests, retryAfter: null }
    }

    const now = Date.now()
    const existing = await ctx.db
      .query("rateLimits")
      .withIndex("key", (q) => q.eq("key", args.key))
      .first()

    if (!existing) {
      await ctx.db.insert("rateLimits", {
        key: args.key,
        windowStart: now,
        count: 1,
      })
      return { allowed: true, remaining: args.maxRequests - 1, retryAfter: null }
    }

    const elapsed = now - existing.windowStart
    if (elapsed > args.windowMs) {
      await ctx.db.patch(existing._id, {
        windowStart: now,
        count: 1,
      })
      return { allowed: true, remaining: args.maxRequests - 1, retryAfter: null }
    }

    const newCount = existing.count + 1
    await ctx.db.patch(existing._id, { count: newCount })

    if (newCount > args.maxRequests) {
      const retryAfter = Math.ceil((args.windowMs - elapsed) / 1000)
      throw new RateLimitError(retryAfter)
    }

    return { allowed: true, remaining: args.maxRequests - newCount, retryAfter: null }
  },
})

export async function checkRateLimit(
  ctx: MutationCtx,
  key: string,
  config: RateLimitConfig = DEFAULTS.mutation,
): Promise<void> {
  const result = await ctx.db
    .query("rateLimits")
    .withIndex("key", (q) => q.eq("key", key))
    .first()

  if (!result) {
    await ctx.db.insert("rateLimits", {
      key,
      windowStart: Date.now(),
      count: 1,
    })
    return
  }

  const elapsed = Date.now() - result.windowStart
  if (elapsed > config.windowMs) {
    await ctx.db.patch(result._id, {
      windowStart: Date.now(),
      count: 1,
    })
    return
  }

  const newCount = result.count + 1
  await ctx.db.patch(result._id, { count: newCount })

  if (newCount > config.maxRequests) {
    const retryAfter = Math.ceil((config.windowMs - elapsed) / 1000)
    throw new RateLimitError(retryAfter)
  }
}

export const cleanupRateLimits = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 60 * 60 * 1000
    const old = await ctx.db
      .query("rateLimits")
      .filter((q) => q.lt(q.field("windowStart"), cutoff))
      .collect()
    for (const entry of old) {
      await ctx.db.delete(entry._id)
    }
  },
})

export async function checkRateLimitAction(
  ctx: { runMutation: (mut: any, args: any) => Promise<any> },
  key: string,
  config: RateLimitConfig = DEFAULTS.action,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = await import("@cvx/_generated/api") as any
  await ctx.runMutation(mod.internal.rateLimit.recordRateLimitHit, {
    key,
    maxRequests: config.maxRequests,
    windowMs: config.windowMs,
  })
}
