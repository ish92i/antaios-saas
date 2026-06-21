import { mutation, query } from "@cvx/_generated/server";
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
      .withIndex("userId", (q) => q.eq("userId", identity.subject))
      .first();

    const avatarUrl = user.imageId
      ? await ctx.storage.getUrl(user.imageId)
      : user.image;
    return {
      ...user,
      avatarUrl: avatarUrl || undefined,
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
  },
  handler: async (ctx, args) => {
    const user = await ensureUser(ctx);
    if (!user) return;
    await ctx.db.patch(user._id, { username: args.username });
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
      .withIndex("userId", (q) => q.eq("userId", identity.subject))
      .first();
    if (subscription) {
      await ctx.db.delete(subscription._id);
    }
    await ctx.db.delete(userId);
  },
});
