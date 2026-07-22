import { query } from "@cvx/_generated/server";
import { getOrgId } from "@cvx/auth";

export const getOrgExportData = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const orgId = await getOrgId(ctx);
    if (!orgId) throw new Error("No organization found");

    const org = await ctx.db.get(orgId);
    if (!org) throw new Error("Organization not found");

    const subscriptions = await ctx.db.query("subscriptions").collect();
    const subscription = subscriptions.find((s) => s.orgId === org.clerkOrgId) ?? null;

    const shipments = await ctx.db
      .query("shipments")
      .withIndex("orgId", (q) => q.eq("orgId", org.clerkOrgId))
      .collect();

    const documents = [];
    for (const shipment of shipments) {
      const shipmentDocs = await ctx.db
        .query("shipmentDocuments")
        .withIndex("shipmentId", (q) => q.eq("shipmentId", shipment._id))
        .collect();
      documents.push(...shipmentDocs);
    }

    const auditLogs = await ctx.db
      .query("shipmentAuditLog")
      .withIndex("orgId_timestamp", (q) => q.eq("orgId", org.clerkOrgId))
      .collect();

    return {
      organization: {
        name: org.name,
        slug: org.slug,
        eoriNumber: org.eoriNumber,
        address: org.address,
        phone: org.phone,
        email: org.email,
        country: org.country,
      },
      subscription: subscription
        ? {
            planName: subscription.planName,
            status: subscription.status,
            email: subscription.email,
          }
        : null,
      shipments: shipments.map((s) => ({
        _id: s._id,
        status: s.status,
        completeness: s.completeness,
        extractedData: s.extractedData,
        supplierEmail: s.supplierEmail,
        scanResult: s.scanResult,
        scanAlertCount: s.scanAlertCount,
        riskAssessment: s.riskAssessment,
        tracesRef: s.tracesRef,
        createdAt: s._creationTime,
        internalRef: s.internalRef,
        lockedAt: s.lockedAt,
        scanRunAt: s.scanRunAt,
      })),
      documents: documents.map((d) => ({
        shipmentId: d.shipmentId,
        fileName: d.fileName,
        mimeType: d.mimeType,
        extractionStatus: d.extractionStatus,
        failureReason: d.failureReason,
        storageId: d.storageId,
      })),
      auditLogs: auditLogs.map((a) => ({
        shipmentId: a.shipmentId,
        eventType: a.eventType,
        actor: a.actor,
        timestamp: a.timestamp,
        payload: a.payload,
        actorId: a.actorId,
      })),
    };
  },
});
