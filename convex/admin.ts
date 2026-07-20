import { query } from "@cvx/_generated/server";
import { v } from "convex/values";

const ADMIN_SECRET_HASH = process.env.ADMIN_SECRET_HASH;

async function verifyAdminSecret(adminSecret: string): Promise<boolean> {
  if (!ADMIN_SECRET_HASH) return false;
  const encoder = new TextEncoder();
  const data = encoder.encode(adminSecret);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex === ADMIN_SECRET_HASH;
}

export const verifySecret = query({
  args: {
    adminSecret: v.string(),
  },
  handler: async (_ctx, args): Promise<{ valid: boolean }> => {
    const valid = await verifyAdminSecret(args.adminSecret);
    return { valid };
  },
});

export const getStats = query({
  args: {
    adminSecret: v.string(),
  },
  handler: async (ctx, args) => {
    const valid = await verifyAdminSecret(args.adminSecret);
    if (!valid) throw new Error("Unauthorized");

    const users = await ctx.db.query("users").collect();
    const orgs = await ctx.db.query("organizations").collect();
    const subscriptions = await ctx.db.query("subscriptions").collect();
    const shipments = await ctx.db.query("shipments").collect();

    const activeSubscriptions = subscriptions.filter((s) => s.status === "active").length;

    const shipmentsByStatus: Record<string, number> = {};
    for (const s of shipments) {
      shipmentsByStatus[s.status] = (shipmentsByStatus[s.status] || 0) + 1;
    }

    return {
      totalUsers: users.length,
      totalOrgs: orgs.length,
      totalSubscriptions: subscriptions.length,
      activeSubscriptions,
      totalShipments: shipments.length,
      shipmentsByStatus,
    };
  },
});

export const listUsers = query({
  args: {
    adminSecret: v.string(),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const valid = await verifyAdminSecret(args.adminSecret);
    if (!valid) throw new Error("Unauthorized");

    let users = await ctx.db.query("users").collect();
    const subscriptions = await ctx.db.query("subscriptions").collect();
    const orgs = await ctx.db.query("organizations").collect();

    if (args.search) {
      const q = args.search.toLowerCase();
      users = users.filter(
        (u) =>
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.clerkUserId && u.clerkUserId.toLowerCase().includes(q)),
      );
    }

    return users.map((u) => {
      const sub = subscriptions.find((s) => s.email === u.email);
      return {
        ...u,
        subscription: sub ?? null,
        _creationTime: u._creationTime,
      };
    });
  },
});

export const getUserDetail = query({
  args: {
    adminSecret: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const valid = await verifyAdminSecret(args.adminSecret);
    if (!valid) throw new Error("Unauthorized");

    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const subscriptions = await ctx.db.query("subscriptions").collect();
    const subscription = subscriptions.find((s) => s.email === user.email) ?? null;

    const orgs = await ctx.db.query("organizations").collect();

    return {
      ...user,
      subscription,
    };
  },
});

export const listOrganizations = query({
  args: {
    adminSecret: v.string(),
  },
  handler: async (ctx, args) => {
    const valid = await verifyAdminSecret(args.adminSecret);
    if (!valid) throw new Error("Unauthorized");

    const orgs = await ctx.db.query("organizations").collect();
    const subscriptions = await ctx.db.query("subscriptions").collect();
    const shipments = await ctx.db.query("shipments").collect();

    return orgs.map((org) => {
      const sub = subscriptions.find((s) => s.orgId === org.clerkOrgId) ?? null;
      const shipmentCount = shipments.filter((s) => s.orgId === org.clerkOrgId).length;
      return {
        ...org,
        subscription: sub,
        shipmentCount,
      };
    });
  },
});

export const getOrganizationDetail = query({
  args: {
    adminSecret: v.string(),
    orgId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const valid = await verifyAdminSecret(args.adminSecret);
    if (!valid) throw new Error("Unauthorized");

    const org = await ctx.db.get(args.orgId);
    if (!org) return null;

    const subscriptions = await ctx.db.query("subscriptions").collect();
    const subscription = subscriptions.find((s) => s.orgId === org.clerkOrgId) ?? null;

    const shipments = await ctx.db
      .query("shipments")
      .withIndex("orgId", (q) => q.eq("orgId", org.clerkOrgId))
      .collect();

    return {
      ...org,
      subscription,
      shipments,
    };
  },
});

export const listSubscriptions = query({
  args: {
    adminSecret: v.string(),
    statusFilter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const valid = await verifyAdminSecret(args.adminSecret);
    if (!valid) throw new Error("Unauthorized");

    let subscriptions = await ctx.db.query("subscriptions").collect();
    const orgs = await ctx.db.query("organizations").collect();

    if (args.statusFilter) {
      subscriptions = subscriptions.filter((s) => s.status === args.statusFilter);
    }

    return subscriptions.map((sub) => {
      const org = orgs.find((o) => o.clerkOrgId === sub.orgId) ?? null;
      return {
        ...sub,
        orgName: org?.name ?? null,
      };
    });
  },
});

export const listAllShipments = query({
  args: {
    adminSecret: v.string(),
    statusFilter: v.optional(v.string()),
    orgId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const valid = await verifyAdminSecret(args.adminSecret);
    if (!valid) throw new Error("Unauthorized");

    let shipments = await ctx.db.query("shipments").collect();
    const orgs = await ctx.db.query("organizations").collect();

    if (args.statusFilter) {
      shipments = shipments.filter((s) => s.status === args.statusFilter);
    }

    if (args.orgId) {
      shipments = shipments.filter((s) => s.orgId === args.orgId);
    }

    return shipments.map((s) => {
      const org = orgs.find((o) => o.clerkOrgId === s.orgId) ?? null;
      return {
        ...s,
        orgName: org?.name ?? null,
      };
    });
  },
});
