import { QueryCtx, MutationCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export async function getUserId(
  ctx: QueryCtx | MutationCtx,
): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const user = await ctx.db
    .query("users")
    .withIndex("clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
    .unique();

  return (user?._id ?? null) as Id<"users"> | null;
}

export async function ensureUser(
  ctx: MutationCtx,
): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const existing = await ctx.db
    .query("users")
    .withIndex("clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
    .unique();

  if (existing) return existing;

  const userId = await ctx.db.insert("users", {
    clerkUserId: identity.subject,
    name: identity.name ?? undefined,
    email: identity.email ?? undefined,
    image: identity.pictureUrl ?? undefined,
  });

  return (await ctx.db.get(userId)) as Doc<"users">;
}

const claimString = (identity: Record<string, unknown>, claim: string) => {
  const value = identity[claim];
  return typeof value === "string" && value.length > 0 ? value : null;
};

function clerkOrgIdFromIdentity(
  identity: Record<string, unknown>,
): string | null {
  return (
    claimString(identity, "org_id") ??
    claimString(identity, "organization_id") ??
    claimString(identity, "organizationId")
  );
}

export async function getOrgId(
  ctx: QueryCtx | MutationCtx,
): Promise<Id<"organizations"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const clerkOrgId = clerkOrgIdFromIdentity(
    identity as unknown as Record<string, unknown>,
  );
  if (!clerkOrgId) return null;

  const org = await ctx.db
    .query("organizations")
    .withIndex("clerkOrgId", (q) => q.eq("clerkOrgId", clerkOrgId))
    .unique();

  return (org?._id ?? null) as Id<"organizations"> | null;
}

export async function ensureOrg(
  ctx: MutationCtx,
): Promise<Doc<"organizations"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const clerkOrgId = clerkOrgIdFromIdentity(
    identity as unknown as Record<string, unknown>,
  );
  if (!clerkOrgId) return null;

  const existing = await ctx.db
    .query("organizations")
    .withIndex("clerkOrgId", (q) => q.eq("clerkOrgId", clerkOrgId))
    .unique();

  if (existing) return existing;

  const orgId = await ctx.db.insert("organizations", {
    clerkOrgId,
    name:
      claimString(
        identity as unknown as Record<string, unknown>,
        "org_name",
      ) ?? undefined,
    slug:
      claimString(
        identity as unknown as Record<string, unknown>,
        "org_slug",
      ) ?? undefined,
    image:
      claimString(
        identity as unknown as Record<string, unknown>,
        "org_image_url",
      ) ?? undefined,
  });

  return (await ctx.db.get(orgId)) as Doc<"organizations">;
}
