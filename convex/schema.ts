import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
  })
    .index("clerkUserId", ["clerkUserId"])
    .index("email", ["email"]),
  organizations: defineTable({
    clerkOrgId: v.string(),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    image: v.optional(v.string()),
    eoriNumber: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    country: v.optional(v.string()),
  })
    .index("clerkOrgId", ["clerkOrgId"]),
  subscriptions: defineTable({
    orgId: v.string(),
    dodoSubscriptionId: v.optional(v.string()),
    dodoProductId: v.optional(v.string()),
    planName: v.optional(v.string()),
    status: v.optional(v.string()),
    email: v.optional(v.string()),
  })
    .index("orgId", ["orgId"])
    .index("dodoSubscriptionId", ["dodoSubscriptionId"]),
  shipments: defineTable({
    orgId: v.string(),
    createdBy: v.string(),
    internalRef: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("extracting"),
      v.literal("resolving"),
      v.literal("pending_scan"),
      v.literal("scanning"),
      v.literal("ready"),
      v.literal("submitting"),
      v.literal("submitted"),
      v.literal("error"),
    ),
    completeness: v.union(
      v.literal("red"),
      v.literal("yellow"),
      v.literal("green"),
    ),
    extractedData: v.optional(v.any()),
    pendingQuestions: v.optional(v.array(v.object({
      id: v.string(),
      field: v.string(),
      type: v.string(),
      label: v.string(),
      options: v.optional(v.array(v.any())),
      geoType: v.optional(v.union(v.literal("file"), v.literal("coordinates"), v.null())),
      pendingSupplier: v.optional(v.boolean()),
    }))),
    supplierEmail: v.optional(v.string()),
    supplierLanguage: v.optional(v.string()),
    supplierToken: v.optional(v.string()),
    supplierFormCompleted: v.optional(v.boolean()),
    scanResult: v.optional(v.union(
      v.literal("clean"),
      v.literal("alerts_found"),
      v.literal("no_polygon"),
    )),
    scanAlertCount: v.optional(v.number()),
    scanRunAt: v.optional(v.number()),
    ddsStorageId: v.optional(v.id("_storage")),
    riskPdfStorageId: v.optional(v.id("_storage")),
    tracesRef: v.optional(v.string()),
    lockedAt: v.optional(v.number()),
  })
    .index("orgId", ["orgId"])
    .index("supplierToken", ["supplierToken"]),
  shipmentDocuments: defineTable({
    shipmentId: v.id("shipments"),
    orgId: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
    mimeType: v.string(),
    extractionStatus: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("done"),
      v.literal("failed"),
    ),
    failureReason: v.optional(v.string()),
    extractedJson: v.optional(v.any()),
    providerUsed: v.optional(v.string()),
    lastAttemptAt: v.optional(v.number()),
  })
    .index("shipmentId", ["shipmentId"]),
  shipmentAuditLog: defineTable({
    shipmentId: v.id("shipments"),
    orgId: v.string(),
    timestamp: v.number(),
    actor: v.union(
      v.literal("user"),
      v.literal("system"),
      v.literal("supplier"),
    ),
    actorId: v.optional(v.string()),
    eventType: v.union(
      v.literal("field_changed"),
      v.literal("document_uploaded"),
      v.literal("extraction_completed"),
      v.literal("extraction_failed"),
      v.literal("question_answered"),
      v.literal("supplier_email_sent"),
      v.literal("supplier_form_submitted"),
      v.literal("scan_completed"),
      v.literal("dds_submitted"),
      v.literal("pdf_generated"),
      v.literal("shipment_locked"),
    ),
    payload: v.any(),
  })
    .index("shipmentId", ["shipmentId"])
    .index("orgId_timestamp", ["orgId", "timestamp"]),
});

export default schema;
