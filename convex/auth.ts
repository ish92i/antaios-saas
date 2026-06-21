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
