import { internalAction } from "@cvx/_generated/server"
import { v } from "convex/values"
import { internal } from "@cvx/_generated/api"
import { translateText } from "@cvx/lib/translate"
import { sendEmail } from "@cvx/email"
import { renderSupplierEmail } from "@cvx/email/templates/supplier"

export const sendSupplierEmail = internalAction({
  args: {
    shipmentId: v.id("shipments"),
    supplierLanguage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const shipment = await ctx.runQuery(internal.shipments.getShipmentById, {
      shipmentId: args.shipmentId,
    })
    if (!shipment) throw new Error("Shipment not found")
    if (!shipment.supplierEmail) throw new Error("No supplier email")
    if (!shipment.supplierToken) throw new Error("No supplier token")

    const targetLang = args.supplierLanguage ?? shipment.supplierLanguage ?? "fr"
    const supplierLink = `https://app.antaios.fr/supplier/${shipment.supplierToken}`

    const html = await renderSupplierEmail({ supplierLink })
    const translatedHtml = await translateText(html, targetLang, "fr", "html")
    const subject = await translateText(
      "Informations complémentaires requises pour votre envoi",
      targetLang,
    )

    await sendEmail({
      to: shipment.supplierEmail,
      subject,
      html: translatedHtml,
    })

    await ctx.scheduler.runAfter(0, internal.audit.insertAuditLog, {
      shipmentId: args.shipmentId,
      orgId: shipment.orgId,
      actor: "system",
      eventType: "supplier_email_sent",
      payload: { email: shipment.supplierEmail, token: shipment.supplierToken, language: targetLang },
    })
  },
})
