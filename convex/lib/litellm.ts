import { LITELLM_BASE_URL, LITELLM_API_KEY } from "@cvx/env"
import { logger } from "@cvx/lib/logger"

export type ModelGroup = "vision-primary" | "text-primary"

export interface LiteLLMMessage {
  role: "system" | "user" | "assistant"
  content: string | LiteLLMContentPart[]
}

export type LiteLLMContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }

export interface LiteLLMOptions {
  maxTokens?: number
  temperature?: number
  responseFormat?: { type: "json_object" }
}

export interface LiteLLMResponse {
  id: string
  choices: {
    index: number
    message: {
      role: string
      content: string | null
    }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

const MAX_RETRIES = 4

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getBackoffMs(attempt: number, retryAfter?: number): number {
  if (retryAfter) return retryAfter * 1000
  return Math.pow(2, attempt) * 1000 + Math.random() * 1000
}

export async function callLiteLLM(
  model: ModelGroup,
  messages: LiteLLMMessage[],
  options?: LiteLLMOptions,
): Promise<LiteLLMResponse> {
  if (!LITELLM_BASE_URL) throw new Error("LITELLM_BASE_URL not set")
  if (!LITELLM_API_KEY) throw new Error("LITELLM_API_KEY not set")

  let lastError: Error | null = null

  logger.info("LLM call started", { model, messageCount: messages.length })

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(`${LITELLM_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LITELLM_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: options?.maxTokens ?? 4096,
          temperature: options?.temperature ?? 0.1,
          ...(options?.responseFormat ? { response_format: options.responseFormat } : {}),
        }),
      })

      if (response.ok) {
        const result = await response.json() as LiteLLMResponse
        logger.info("LLM call completed", {
          model,
          usage: result.usage,
          attempt,
        })
        return result
      }

      const retryAfter = response.headers.get("Retry-After")
      const retryAfterMs = retryAfter ? parseInt(retryAfter, 10) : undefined

      if (response.status === 429 || response.status >= 500) {
        if (attempt < MAX_RETRIES) {
          const backoff = getBackoffMs(attempt, retryAfterMs)
          await sleep(backoff)
          continue
        }
      }

      const text = await response.text()
      throw new Error(`LiteLLM error ${response.status}: ${text}`)
    } catch (err) {
      logger.warn("LLM call attempt failed", {
        model,
        attempt,
        error: err instanceof Error ? err.message : String(err),
      })
      if (err instanceof TypeError && attempt < MAX_RETRIES) {
        lastError = err
        const backoff = getBackoffMs(attempt)
        await sleep(backoff)
        continue
      }
      throw err
    }
  }

  logger.error("LLM call failed after max retries", {
    model,
    lastError: lastError?.message,
  })
  throw lastError ?? new Error("LiteLLM max retries exceeded")
}

export function parseLlmJson<T>(content: string): T {
  let cleaned = content.trim()
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "")
  }
  return JSON.parse(cleaned) as T
}
