import { LITELLM_BASE_URL, LITELLM_API_KEY } from "@cvx/env"

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

export async function callLiteLLM(
  model: ModelGroup,
  messages: LiteLLMMessage[],
  options?: LiteLLMOptions,
): Promise<LiteLLMResponse> {
  if (!LITELLM_BASE_URL) throw new Error("LITELLM_BASE_URL not set")
  if (!LITELLM_API_KEY) throw new Error("LITELLM_API_KEY not set")

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

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`LiteLLM error ${response.status}: ${text}`)
  }

  return response.json() as Promise<LiteLLMResponse>
}

export function parseLlmJson<T>(content: string): T {
  let cleaned = content.trim()
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "")
  }
  return JSON.parse(cleaned) as T
}
