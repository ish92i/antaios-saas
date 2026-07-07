import { internalQuery, mutation, query } from "@cvx/_generated/server";
import { v } from "convex/values";
import { Org } from "~/types";
import { getOrgId, ensureOrg } from "@cvx/auth";

export const getCurrentOrg = query({
  args: {},
  handler: async (ctx): Promise<Org | undefined> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const clerkOrgId = claimString(
      identity as unknown as Record<string, unknown>,
      "org_id",
    );
    if (!clerkOrgId) return;

    const org = await ctx.db
      .query("organizations")
      .withIndex("clerkOrgId", (q) => q.eq("clerkOrgId", clerkOrgId))
      .unique();
    if (!org) return;

    return org;
  },
});

export const getOrgById = internalQuery({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orgId);
  },
});

export const createOrgIfNeeded = mutation({
  args: {},
  handler: async (ctx) => {
    const org = await ensureOrg(ctx);
    if (!org) {
      throw new Error("No organization context found in auth session.");
    }
    return org._id;
  },
});

export const updateOrg = mutation({
  args: {
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    eoriNumber: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = await getOrgId(ctx);
    if (!orgId) return;

    const patch: Record<string, unknown> = {};
    if (args.name !== undefined) patch.name = args.name;
    if (args.image !== undefined) patch.image = args.image;
    if (args.eoriNumber !== undefined) patch.eoriNumber = args.eoriNumber;
    if (args.address !== undefined) patch.address = args.address;
    if (args.phone !== undefined) patch.phone = args.phone;
    if (args.email !== undefined) patch.email = args.email;
    if (args.country !== undefined) patch.country = args.country;

    await ctx.db.patch(orgId, patch);
  },
});

const claimString = (identity: Record<string, unknown>, claim: string) => {
  const value = identity[claim];
  return typeof value === "string" && value.length > 0 ? value : null;
};
