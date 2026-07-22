import { internalMutation } from "@cvx/_generated/server"
import { v } from "convex/values"
import { translateText, TRANSLATION_CACHE_TTL_MS } from "@cvx/lib/translate"

export const translateAndCache = internalMutation({
  args: {
    sourceText: v.string(),
    sourceLang: v.string(),
    targetLang: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.sourceLang === args.targetLang) return args.sourceText
    if (!args.sourceText.trim()) return args.sourceText

    const translated = await translateText(
      args.sourceText,
      args.targetLang,
      args.sourceLang,
    )

    await ctx.db.insert("translationCache", {
      sourceText: args.sourceText,
      sourceLang: args.sourceLang,
      targetLang: args.targetLang,
      translatedText: translated,
      createdAt: Date.now(),
      expiresAt: Date.now() + TRANSLATION_CACHE_TTL_MS,
    })

    return translated
  },
})
