import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
  })
    .index("clerkUserId", ["clerkUserId"])
    .index("email", ["email"]),
  subscriptions: defineTable({
    userId: v.string(),
    dodoSubscriptionId: v.optional(v.string()),
    dodoProductId: v.optional(v.string()),
    planName: v.optional(v.string()),
    status: v.optional(v.string()),
    email: v.optional(v.string()),
  })
    .index("userId", ["userId"])
    .index("dodoSubscriptionId", ["dodoSubscriptionId"]),
});

export default schema;
