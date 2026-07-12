import { useQuery } from "convex/react"
import { api } from "@cvx/_generated/api"
import { useCurrentLocale } from "@/hooks/use-current-locale"
import { translateCommodity, type SupportedLocale } from "@/lib/commodity-translations"

const SOURCE_LANG = "en"

export function useTranslatedValue(value: string | null | undefined): string | null | undefined {
  const locale = useCurrentLocale()

  const cached = useQuery(
    api.getTranslation.getCachedTranslation,
    value && locale !== SOURCE_LANG
      ? { sourceText: value, sourceLang: SOURCE_LANG, targetLang: locale }
      : "skip",
  )

  if (!value) return value
  if (locale === SOURCE_LANG) return value

  const lookup = translateCommodity(value, locale as SupportedLocale)
  if (lookup) return lookup

  if (cached !== undefined) return cached ?? value
  return value
}
