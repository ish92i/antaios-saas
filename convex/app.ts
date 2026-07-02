import { mutation, query } from "@cvx/_generated/server";
import { v } from "convex/values";
import type { UserIdentity } from "convex/server";
import { User } from "~/types";
import { getUserId, ensureUser, ensureOrg } from "@cvx/auth";
import { internal } from "@cvx/_generated/api";

const claimString = (identity: UserIdentity, claim: string) => {
  const value = identity[claim];
  return typeof value === "string" && value.length > 0 ? value : null;
};

const subscriberId = (identity: UserIdentity) =>
  claimString(identity, "org_id") ??
  claimString(identity, "organization_id") ??
  claimString(identity, "organizationId") ??
  identity.subject;

export const getCurrentUser = query({
  args: {},
  handler: async (ctx): Promise<User | undefined> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const user = await ctx.db
      .query("users")
      .withIndex("clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();
    if (!user) return;

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("orgId", (q) => q.eq("orgId", subscriberId(identity)))
      .first();

    return {
      ...user,
      avatarUrl: user.image || undefined,
      subscription: subscription ?? undefined,
    };
  },
});

export const createUserIfNeeded = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await ensureUser(ctx);
    if (!user) {
      throw new Error("Unable to create a user before auth is ready.");
    }
    await ensureOrg(ctx);
    return user._id;
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("User not found");
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateUserImage = mutation({
  args: {
    image: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return;
    ctx.db.patch(userId, { image: args.image });
  },
});

export const removeUserImage = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return;
    ctx.db.patch(userId, { image: undefined });
  },
});

export const deleteCurrentUserAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return;

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("orgId", (q) => q.eq("orgId", subscriberId(identity)))
      .first();
    if (subscription?.dodoSubscriptionId) {
      await ctx.scheduler.runAfter(0, internal.payments.cancelDodoSubscription, {
        dodoSubscriptionId: subscription.dodoSubscriptionId,
      });
    }
    if (subscription) {
      await ctx.db.delete(subscription._id);
    }
    await ctx.db.delete(userId);
  },
});
