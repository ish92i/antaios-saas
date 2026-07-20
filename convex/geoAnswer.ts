"use node"

import { action } from "@cvx/_generated/server"
import { v } from "convex/values"
import { internal } from "@cvx/_generated/api"
import { parseGeometry } from "@cvx/geo"

const MAX_FILE_SIZE = 10 * 1024 * 1024

export const processGeoFile = action({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
  },
  handler: async (ctx, args) => {
    const metadata = await ctx.storage.getMetadata(args.storageId)
    if (!metadata) throw new Error("File not found in storage")
    if (metadata.size > MAX_FILE_SIZE) {
      await ctx.storage.delete(args.storageId)
      throw new Error("File too large. Maximum size is 10 MB.")
    }
    const blob = await ctx.storage.get(args.storageId)
    if (!blob) throw new Error("Fichier non trouvé")
    const buffer = await blob.arrayBuffer()
    const geoJson = await parseGeometry(buffer, args.fileName)
    await ctx.storage.delete(args.storageId)
    return geoJson
  },
})

export const processAndAnswerGeo = action({
  args: {
    shipmentId: v.id("shipments"),
    questionId: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
    previousValue: v.any(),
  },
  handler: async (ctx, args) => {
    const metadata = await ctx.storage.getMetadata(args.storageId)
    if (!metadata) throw new Error("File not found in storage")
    if (metadata.size > MAX_FILE_SIZE) {
      await ctx.storage.delete(args.storageId)
      throw new Error("File too large. Maximum size is 10 MB.")
    }
    const blob = await ctx.storage.get(args.storageId)
    if (!blob) throw new Error("Fichier non trouvé")
    const buffer = await blob.arrayBuffer()
    const geoJson = await parseGeometry(buffer, args.fileName)
    await ctx.storage.delete(args.storageId)

    await ctx.runMutation(internal.shipments.internalAnswerQuestion, {
      shipmentId: args.shipmentId,
      questionId: args.questionId,
      field: "geoJson",
      answer: geoJson,
      previousValue: args.previousValue,
    })
  },
})
