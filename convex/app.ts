import { internal } from "@cvx/_generated/api";
import { mutation, query } from "@cvx/_generated/server";
import { currencyValidator, PLANS } from "@cvx/schema";
import { asyncMap } from "convex-helpers";
import { v } from "convex/values";
import { User } from "~/types";
import { getUserId, ensureUser } from "@cvx/auth";

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
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .unique();

    const plan = subscription?.planId
      ? await ctx.db.get(subscription.planId)
      : undefined;
    const avatarUrl = user.imageId
      ? await ctx.storage.getUrl(user.imageId)
      : user.image;
    return {
      ...user,
      avatarUrl: avatarUrl || undefined,
      subscription:
        subscription && plan
          ? {
              ...subscription,
              planKey: plan.key,
            }
          : undefined,
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
    return user._id;
  },
});

export const updateUsername = mutation({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return;
    await ctx.db.patch(userId, { username: args.username });
  },
});

export const completeOnboarding = mutation({
  args: {
    username: v.string(),
    currency: currencyValidator,
  },
  handler: async (ctx, args) => {
    const user = await ensureUser(ctx);
    if (!user) return;

    await ctx.db.patch(user._id, { username: args.username });
    if (user.customerId) return;

    await ctx.scheduler.runAfter(
      0,
      internal.stripe.PREAUTH_createStripeCustomer,
      {
        currency: args.currency,
        userId: user._id,
      },
    );
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
    imageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return;
    ctx.db.patch(userId, { imageId: args.imageId });
  },
});

export const removeUserImage = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return;
    ctx.db.patch(userId, { imageId: undefined, image: undefined });
  },
});

export const getActivePlans = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const [free, pro] = await asyncMap(
      [PLANS.FREE, PLANS.PRO] as const,
      (key) =>
        ctx.db
          .query("plans")
          .withIndex("key", (q) => q.eq("key", key))
          .unique(),
    );
    if (!free || !pro) {
      throw new Error("Plan not found");
    }
    return { free, pro };
  },
});

export const deleteCurrentUserAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return;

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .unique();
    if (!subscription) {
      console.error("No subscription found");
    } else {
      await ctx.db.delete(subscription._id);
      await ctx.scheduler.runAfter(
        0,
        internal.stripe.cancelCurrentUserSubscriptions,
      );
    }
    await ctx.db.delete(userId);
  },
});
