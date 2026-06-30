import { GT_API_KEY } from "@cvx/env"

interface TranslateResponse {
  data: {
    translations: Array<{
      translatedText: string
      detectedSourceLanguage: string
    }>
  }
}

export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage: string = "fr",
  format: "text" | "html" = "text",
): Promise<string> {
  if (!GT_API_KEY) return text
  if (targetLanguage === sourceLanguage) return text

  const url = `https://translation.googleapis.com/language/translate/v2?key=${GT_API_KEY}`
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, target: targetLanguage, source: sourceLanguage, format }),
  })

  if (!response.ok) {
    const body = await response.text()
    console.error(`Google Translate error ${response.status}: ${body}`)
    return text
  }

  const result: TranslateResponse = await response.json()
  return result.data.translations[0]?.translatedText ?? text
}
