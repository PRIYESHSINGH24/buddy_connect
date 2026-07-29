import { GoogleGenerativeAI } from "@google/generative-ai"

const AI_TIMEOUT_MS = parseInt(process.env.AI_TIMEOUT_MS || "15000", 10)
const AI_MAX_RETRIES = parseInt(process.env.AI_MAX_RETRIES || "1", 10)

let genAI: GoogleGenerativeAI | null = null

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.AI_GATEWAY_API_KEY
    if (!apiKey) {
      throw new Error("AI_GATEWAY_API_KEY environment variable is not set")
    }
    genAI = new GoogleGenerativeAI(apiKey)
  }
  return genAI
}

/**
 * Generate content from Gemini with timeout and retry.
 * Returns the response text or null if all attempts fail.
 */
export async function generateContent(
  prompt: string,
  options: {
    model?: string
    timeoutMs?: number
    maxRetries?: number
    temperature?: number
    maxOutputTokens?: number
  } = {}
): Promise<string | null> {
  const {
    model: modelName = "gemini-2.0-flash",
    timeoutMs = AI_TIMEOUT_MS,
    maxRetries = AI_MAX_RETRIES,
    temperature,
    maxOutputTokens,
  } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await generateWithTimeout(prompt, {
        modelName,
        timeoutMs,
        temperature,
        maxOutputTokens,
      })
      return result
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn(
        `AI generation attempt ${attempt + 1}/${maxRetries + 1} failed:`,
        lastError.message
      )

      // Exponential backoff before retry
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  console.error("All AI generation attempts failed:", lastError?.message)
  return null
}

async function generateWithTimeout(
  prompt: string,
  options: {
    modelName: string
    timeoutMs: number
    temperature?: number
    maxOutputTokens?: number
  }
): Promise<string> {
  const { modelName, timeoutMs, temperature, maxOutputTokens } = options

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const ai = getGenAI()
    const model = ai.getGenerativeModel({
      model: modelName,
      generationConfig: {
        ...(temperature !== undefined && { temperature }),
        ...(maxOutputTokens !== undefined && { maxOutputTokens }),
      },
    })

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    })

    const text = result.response.text()
    if (!text || !text.trim()) {
      throw new Error("Empty response from AI model")
    }
    return text.trim()
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Parse a JSON array from AI response text.
 * Handles common AI output patterns (markdown code blocks, extra text).
 */
export function parseJsonArray<T>(text: string): T[] {
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (error) {
    console.error("Failed to parse JSON array from AI response:", error)
  }
  return []
}

/**
 * Parse a JSON object from AI response text.
 */
export function parseJsonObject<T>(text: string): T | null {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (error) {
    console.error("Failed to parse JSON object from AI response:", error)
  }
  return null
}
