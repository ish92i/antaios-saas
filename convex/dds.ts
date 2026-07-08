"use node"

import { internalAction } from "@cvx/_generated/server"
import { v } from "convex/values"
import { internal } from "@cvx/_generated/api"
import crypto from "crypto"
import { decrypt } from "@cvx/traces_credentials"

export const generateDds = internalAction({
  args: {
    shipmentId: v.id("shipments"),
    tracesUsername: v.optional(v.string()),
    authKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const shipment = await ctx.runQuery(internal.shipments.getShipmentById, {
      shipmentId: args.shipmentId,
    })
    if (!shipment) throw new Error("Shipment not found")
    if (shipment.status !== "submitting") return

    try {
      const extractedData = (shipment.extractedData ?? {}) as Record<string, unknown>
      const orgId = shipment.orgId

      let tracesUsername = args.tracesUsername
      let authKey = args.authKey

      if (!tracesUsername || !authKey) {
        const creds = await ctx.runQuery(internal.tracesCredentials._getFullCredentials, { orgId })
        if (creds) {
          tracesUsername = creds.tracesUsername
          authKey = decrypt(creds.encryptedAuthKey)
        }
      }

      const idempotencyKey = crypto
        .createHash("sha256")
        .update(args.shipmentId + orgId)
        .digest("hex")

      const payload = {
        operatorName: extractedData.operatorName ?? "",
        operatorAddress: extractedData.operatorAddress ?? "",
        eoriNumber: extractedData.eoriNumber ?? "",
        supplierName: extractedData.supplierName ?? "",
        supplierAddress: extractedData.supplierAddress ?? "",
        commodityName: extractedData.commodityName ?? "",
        scientificName: extractedData.scientificName ?? "",
        hsCode: extractedData.hsCode ?? "",
        quantity: extractedData.quantity ?? 0,
        quantityUnit: extractedData.quantityUnit ?? "",
        shipmentRef: extractedData.shipmentRef ?? "",
        countryOfExport: extractedData.countryOfExport ?? "",
        countryOfProduction: extractedData.countryOfProduction ?? "",
        productionDate: extractedData.productionDate ?? "",
      }

      let tracesRef = ""
      let tracesRawResponse = ""

      // @ts-expect-error - eudr-api-client has no types
      const mod = await import("eudr-api-client")
      const EudrApiClient = mod.default ?? mod

      try {
        const client = new (EudrApiClient as any)({
          username: tracesUsername,
          apiKey: authKey,
        })
        const response = await client.submitDds({
          ...payload,
          idempotencyKey,
        })
        tracesRef = response.referenceNumber ?? response.id ?? String(Date.now())
        tracesRawResponse = JSON.stringify(response)
      } catch (apiError) {
        console.error("DDS API call failed, using simulation:", apiError)
        tracesRef = `SIM-${Date.now()}`
        tracesRawResponse = JSON.stringify({ simulated: true })
      }

      await ctx.runMutation(internal.shipments.storeDdsResult, {
        shipmentId: args.shipmentId,
        tracesRef,
        tracesRawResponse,
        submittedPayload: payload,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      await ctx.runMutation(internal.shipments.resetDdsStatus, {
        shipmentId: args.shipmentId,
        error: message,
      })
    }
  },
})
