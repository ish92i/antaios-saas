import { action } from "@cvx/_generated/server"
import { v } from "convex/values"
import { internal } from "@cvx/_generated/api"
import { queryGfwAlerts } from "@cvx/lib/gfw"

export const runDeforestationScan = action({
  args: {
    shipmentId: v.id("shipments"),
  },
  handler: async (ctx, args) => {
    const shipment = await ctx.runQuery(internal.shipments.getShipmentById, {
      shipmentId: args.shipmentId,
    })
    if (!shipment) throw new Error("Shipment not found")
    if (shipment.scanResult) return
    if (shipment.scanRunAt && Date.now() - shipment.scanRunAt < 60000) return

    const geoJson = (shipment.extractedData as Record<string, unknown> | undefined)?.geoJson
    if (!geoJson) throw new Error("No geoJson data")

    await ctx.runMutation(internal.shipments.setScanning, {
      shipmentId: args.shipmentId,
    })

    const result = await queryGfwAlerts(geoJson)
    const scanResult = result.alert_count === 0 ? "clean" : "alerts_found"

    await ctx.runMutation(internal.shipments.storeScanResult, {
      shipmentId: args.shipmentId,
      scanResult,
      scanAlertCount: result.alert_count,
    })
  },
})
