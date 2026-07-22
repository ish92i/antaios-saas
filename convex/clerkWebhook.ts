import { httpAction } from "./_generated/server"
import { internal } from "./_generated/api"
import { CLERK_WEBHOOK_SECRET } from "./env"
import { logger } from "@cvx/lib/logger"

const WEBHOOK_EVENTS = new Set(["organization.deleted"])

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

async function verifySignature(
  payload: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string,
  secret: string,
): Promise<boolean> {
  const signedContent = `${svixId}.${svixTimestamp}.${payload}`
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(signedContent))
  const computed = arrayBufferToBase64(signature)
  return svixSignature.split(" ").some((sig) => computed === sig)
}

export const handleClerkWebhook = httpAction(async (ctx, request) => {
    const secret = CLERK_WEBHOOK_SECRET
    if (!secret) {
      logger.error("CLERK_WEBHOOK_SECRET not set")
      return new Response(null, { status: 500 })
    }

    const svixId = request.headers.get("svix-id")
    const svixTimestamp = request.headers.get("svix-timestamp")
    const svixSignature = request.headers.get("svix-signature")

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response(null, { status: 400 })
    }

    const body = await request.text()

    const valid = await verifySignature(body, svixId, svixTimestamp, svixSignature, secret)
    if (!valid) {
      return new Response(null, { status: 401 })
    }

    let payload: { type: string; data: { id: string } }
    try {
      payload = JSON.parse(body)
    } catch {
      return new Response(null, { status: 400 })
    }

    if (!WEBHOOK_EVENTS.has(payload.type)) {
      return new Response(null, { status: 200 })
    }

    if (payload.type === "organization.deleted") {
      logger.info("Organization deleted via webhook", { clerkOrgId: payload.data.id })
      await ctx.runMutation(internal.clerkWebhookDelete.deleteOrgCascade, {
        clerkOrgId: payload.data.id,
      })
    }

    return new Response(null, { status: 200 })
})
