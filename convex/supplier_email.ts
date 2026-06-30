"use node"

import { action } from "@cvx/_generated/server"
import { v } from "convex/values"
import { internal } from "@cvx/_generated/api"
import { RESEND_API_KEY } from "@cvx/env"
import { translateText } from "@cvx/lib/translate"

export const sendSupplierEmail = action({
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

    const subject = await translateText(
      "Informations complémentaires requises pour votre envoi",
      targetLang,
    )
    const html = await translateText(
      `<p>Bonjour,</p><p>Un opérateur vous demande de fournir des informations complémentaires pour compléter un dossier de conformité EUDR.</p><p>Veuillez cliquer sur le lien ci-dessous pour fournir les informations demandées :</p><p><a href="${supplierLink}">${supplierLink}</a></p><p>Merci de votre collaboration.</p><p>L'équipe Antaios</p>`,
      targetLang,
      "fr",
      "html",
    )

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Antaios <noreply@antaios.fr>",
        to: [shipment.supplierEmail],
        subject,
        html,
      }),
    })

    await ctx.runMutation(internal.audit.insertAuditLog, {
      shipmentId: args.shipmentId,
      orgId: shipment.orgId,
      actor: "system",
      eventType: "supplier_email_sent",
      payload: { email: shipment.supplierEmail, token: shipment.supplierToken, language: targetLang },
    })
  },
})
