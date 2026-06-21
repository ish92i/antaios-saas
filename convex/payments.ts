import { v } from "convex/values"
import type { UserIdentity } from "convex/server"
import { action, internalAction, internalMutation, mutation, query } from "@cvx/_generated/server"
import type { MutationCtx } from "@cvx/_generated/server"
import { api } from "@cvx/_generated/api"
import { APP_URL, DODO_PAYMENTS_API_KEY, DODO_PAYMENTS_ENVIRONMENT, DIRECT_PLAN_ID } from "@cvx/env"
import { checkout, customerPortal } from "./dodo"

const claimString = (identity: UserIdentity, claim: string) => {
  const value = identity[claim]
  return typeof value === "string" && value.length > 0 ? value : null
}

const orgIdFromClaims = (identity: UserIdentity) =>
  claimString(identity, "org_id") ??
  claimString(identity, "organization_id") ??
  claimString(identity, "organizationId")

const clean = <T extends Record<string, unknown>>(value: T) =>
  Object.fromEntries(
    Object.entries(value).filter(([, field]) => field !== undefined)
  ) as T

const upsertSubscription = async (
  ctx: MutationCtx,
  args: {
    convexUserId: string
    orgId?: string
    dodoSubscriptionId: string
    dodoProductId: string
    planName: string
    email: string
    status: string
  }
) => {
  const existing = await ctx.db
    .query("subscriptions")
    .withIndex("userId", (q) => q.eq("userId", args.convexUserId))
    .first()

  if (existing) {
    await ctx.db.patch(
      existing._id,
      clean({
        dodoSubscriptionId: args.dodoSubscriptionId,
        dodoProductId: args.dodoProductId,
        planName: args.planName,
        status: args.status,
        email: args.email,
      })
    )
    return existing._id
  }

  return await ctx.db.insert(
    "subscriptions",
    clean({
      userId: args.convexUserId,
      dodoSubscriptionId: args.dodoSubscriptionId,
      dodoProductId: args.dodoProductId,
      planName: args.planName,
      status: args.status,
      email: args.email,
    })
  )
}

export const createCheckoutSession = action({
  args: {
    orgId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")
    const orgId = orgIdFromClaims(identity)
    if (args.orgId && !orgId) throw new Error("Org required")
    if (args.orgId && orgId !== args.orgId) throw new Error("Org mismatch")

    const productId = DIRECT_PLAN_ID
    if (!productId) throw new Error("DIRECT_PLAN_ID env var not set")

    const returnUrl = `${APP_URL ?? "http://localhost:3000"}/dashboard`

    const session = await checkout(ctx, {
      payload: {
        product_cart: [{ product_id: productId, quantity: 1 }],
        customer: { email: identity.email ?? "" },
        return_url: returnUrl,
        metadata: {
          convex_user_id: identity.subject,
          ...(orgId ? { convex_org_id: orgId } : {}),
        },
      },
    })

    await ctx.runMutation(api.payments.storeSubscription, {
      convexUserId: identity.subject,
      orgId: orgId ?? undefined,
      dodoProductId: productId,
      planName: "Direct",
      email: identity.email ?? "",
      status: "pending",
    })

    return { checkoutUrl: session.checkout_url }
  },
})

export const getCustomerPortal = action({
  args: {
    send_email: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")

    const portal = await customerPortal(ctx, { send_email: args.send_email ?? false })
    if (!portal?.portal_url) {
      throw new Error("Customer portal did not return a portal_url")
    }
    return portal
  },
})

export const storeSubscriptionFromWebhook = internalMutation({
  args: {
    convexUserId: v.string(),
    orgId: v.optional(v.string()),
    dodoSubscriptionId: v.string(),
    dodoProductId: v.string(),
    planName: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await upsertSubscription(ctx, {
      convexUserId: args.convexUserId,
      orgId: args.orgId,
      dodoSubscriptionId: args.dodoSubscriptionId,
      dodoProductId: args.dodoProductId,
      planName: args.planName,
      email: args.email,
      status: "active",
    })
  },
})

export const storeSubscription = mutation({
  args: {
    convexUserId: v.string(),
    orgId: v.optional(v.string()),
    dodoSubscriptionId: v.optional(v.string()),
    dodoProductId: v.optional(v.string()),
    planName: v.optional(v.string()),
    email: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")

    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", identity.subject))
      .first()

    if (existing) {
      await ctx.db.patch(
        existing._id,
        clean({
          dodoSubscriptionId: args.dodoSubscriptionId,
          dodoProductId: args.dodoProductId,
          planName: args.planName,
          status: args.status ?? "active",
          email: identity.email ?? args.email,
        })
      )
      return existing._id
    }

    return await ctx.db.insert(
      "subscriptions",
      clean({
        userId: identity.subject,
        dodoSubscriptionId: args.dodoSubscriptionId,
        dodoProductId: args.dodoProductId ?? "",
        planName: args.planName ?? "Direct",
        email: identity.email ?? args.email,
        status: args.status ?? "active",
      })
    )
  },
})

export const updateSubscriptionStatusFromWebhook = internalMutation({
  args: {
    dodoSubscriptionId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("dodoSubscriptionId", (q) =>
        q.eq("dodoSubscriptionId", args.dodoSubscriptionId)
      )
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, { status: args.status })
    }
  },
})

export const updateSubscriptionPlan = internalMutation({
  args: {
    dodoSubscriptionId: v.string(),
    dodoProductId: v.string(),
    planName: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("dodoSubscriptionId", (q) =>
        q.eq("dodoSubscriptionId", args.dodoSubscriptionId)
      )
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        dodoProductId: args.dodoProductId,
        planName: args.planName,
      })
    }
  },
})

export const updateSubscriptionStatus = mutation({
  args: {
    dodoSubscriptionId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized")

    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("dodoSubscriptionId", (q) =>
        q.eq("dodoSubscriptionId", args.dodoSubscriptionId)
      )
      .first()

    if (!existing) throw new Error("Not found")

    const ownsSubscription = existing.userId === identity.subject
    if (!ownsSubscription) throw new Error("Not found")

    await ctx.db.patch(existing._id, { status: args.status })
  },
})

export const getUserSubscription = query({
  args: {
    orgId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    if (args.orgId) {
      const orgId = orgIdFromClaims(identity)
      if (!orgId) throw new Error("Org required")
      if (orgId !== args.orgId) throw new Error("Org mismatch")
      const subscription = await ctx.db
        .query("subscriptions")
        .withIndex("userId", (q) => q.eq("userId", orgId))
        .first()
      return subscription
    }

    const userId = identity.subject
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first()

    return subscription
  },
})

const getDodoBaseUrl = () => {
  return DODO_PAYMENTS_ENVIRONMENT === "live_mode"
    ? "https://live.dodopayments.com"
    : "https://test.dodopayments.com"
}

const dodoApiFetch = async (path: string, options: { method: string; body?: unknown }) => {
  const apiKey = DODO_PAYMENTS_API_KEY
  if (!apiKey) throw new Error("DODO_PAYMENTS_API_KEY not set")

  const response = await fetch(`${getDodoBaseUrl()}${path}`, {
    method: options.method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Dodo API error (${response.status}): ${errorText}`)
  }

  return await response.json()
}

export const cancelDodoSubscription = internalAction({
  args: {
    dodoSubscriptionId: v.string(),
  },
  handler: async (_ctx, args) => {
    await dodoApiFetch(`/subscriptions/${args.dodoSubscriptionId}`, {
      method: "PATCH",
      body: {
        cancel_at_next_billing_date: true,
      },
    })
  },
})
