import { internalQuery } from "@cvx/_generated/server"
import { v } from "convex/values"

export const getCachedTranslation = internalQuery({
  args: {
    sourceText: v.string(),
    sourceLang: v.string(),
    targetLang: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.sourceLang === args.targetLang) return args.sourceText
    if (!args.sourceText.trim()) return null

    const cached = await ctx.db
      .query("translationCache")
      .withIndex("by_source_target", (q) =>
        q
          .eq("sourceText", args.sourceText)
          .eq("sourceLang", args.sourceLang)
          .eq("targetLang", args.targetLang),
      )
      .first()

    return cached?.translatedText ?? null
  },
})
