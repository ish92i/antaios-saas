import { DEEPL_API_KEY } from "@cvx/env"
import { logger } from "@cvx/lib/logger"

interface DeepLResponse {
  translations: Array<{
    detected_source_language: string
    text: string
  }>
}

export const TRANSLATION_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage: string = "fr",
  format: "text" | "html" = "text",
): Promise<string> {
  if (!DEEPL_API_KEY) return text
  if (targetLanguage === sourceLanguage) return text

  const params = new URLSearchParams({
    text,
    target_lang: targetLanguage.toUpperCase(),
    source_lang: sourceLanguage.toUpperCase(),
  })
  if (format === "html") params.set("tag_handling", "html")

  const response = await fetch("https://api-free.deepl.com/v2/translate", {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  })

  if (!response.ok) {
    const body = await response.text()
    logger.error("DeepL translation failed", { status: response.status, body })
    return text
  }

  const result: DeepLResponse = await response.json()
  return result.translations[0]?.text ?? text
}
