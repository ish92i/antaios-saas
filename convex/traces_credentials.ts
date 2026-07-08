"use node"

import { internalAction, internalMutation, internalQuery } from "@cvx/_generated/server"
import { v } from "convex/values"
import { internal } from "@cvx/_generated/api"
import crypto from "crypto"
import { TRACES_ENCRYPTION_KEY } from "@cvx/env"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 16

function getEncryptionKey(): Buffer {
  const key = TRACES_ENCRYPTION_KEY
  if (!key) throw new Error("TRACES_ENCRYPTION_KEY not configured")
  return Buffer.from(key, "hex")
}

export function encrypt(text: string): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(text, "utf8", "base64")
  encrypted += cipher.final("base64")
  const authTag = cipher.getAuthTag()
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`
}

export function decrypt(encrypted: string): string {
  const key = getEncryptionKey()
  const parts = encrypted.split(":")
  if (parts.length !== 3) throw new Error("Invalid encrypted format")
  const iv = Buffer.from(parts[0], "base64")
  const authTag = Buffer.from(parts[1], "base64")
  const encryptedText = parts[2]
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  let decrypted = decipher.update(encryptedText, "base64", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}

export const storeCredentials = internalAction({
  args: {
    orgId: v.string(),
    tracesUsername: v.string(),
    authKey: v.string(),
  },
  handler: async (ctx, args) => {
    const encryptedAuthKey = encrypt(args.authKey)
    await ctx.runMutation(internal.tracesCredentials._writeCredentials, {
      orgId: args.orgId,
      tracesUsername: args.tracesUsername,
      encryptedAuthKey,
    })
  },
})

export const _writeCredentials = internalMutation({
  args: {
    orgId: v.string(),
    tracesUsername: v.string(),
    encryptedAuthKey: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("tracesCredentials")
      .withIndex("orgId", (q) => q.eq("orgId", args.orgId))
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        tracesUsername: args.tracesUsername,
        encryptedAuthKey: args.encryptedAuthKey,
      })
    } else {
      await ctx.db.insert("tracesCredentials", {
        orgId: args.orgId,
        tracesUsername: args.tracesUsername,
        encryptedAuthKey: args.encryptedAuthKey,
      })
    }
  },
})

export const _getFullCredentials = internalQuery({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tracesCredentials")
      .withIndex("orgId", (q) => q.eq("orgId", args.orgId))
      .first()
  },
})

export const hasStoredCredentials = internalQuery({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    const creds = await ctx.db
      .query("tracesCredentials")
      .withIndex("orgId", (q) => q.eq("orgId", args.orgId))
      .first()
    return creds !== null
  },
})

export const getDecryptedByOrg = internalAction({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    const creds = await ctx.runQuery(internal.tracesCredentials._getFullCredentials, {
      orgId: args.orgId,
    })
    if (!creds) return null
    const authKey = decrypt(creds.encryptedAuthKey)
    return {
      tracesUsername: creds.tracesUsername,
      authKey,
    }
  },
})
