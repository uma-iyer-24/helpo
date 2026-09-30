const TEXT_MODELS = ["gemini-3.5-flash", "gemini-3.6-flash", "gemini-3.7-flash", "gemini-3.1-flash-lite"];

/** Models tried for audio inlineData (wav/mp3/ogg). */
export const AUDIO_MODELS = ["gemini-3.5-flash", "gemini-3.6-flash", "gemini-3.7-flash"];

export class ModelError extends Error {
  constructor(public code: "missing_key" | "upstream", message?: string) {
    super(message ?? code);
  }
}

type Part = { text?: string; inlineData?: { mimeType: string; data: string } };

async function callGemini(models: string[], parts: Part[], system: string, temperature: number) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new ModelError("missing_key");

  let last = "Gemini request failed";
  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": key,
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ role: "user", parts }],
            generationConfig: { temperature },
          }),
        },
      );
      if (response.ok) {
        const data = (await response.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        };
        const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
        if (text) return text;
        last = "Empty model response";
        break;
      }
      last = await response.text();
      if (response.status === 503 && attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        continue;
      }
      if (response.status === 404 || response.status === 503 || response.status === 429) break;
      throw new ModelError("upstream", last.slice(0, 400));
    }
  }
  throw new ModelError("upstream", last.slice(0, 400));
}

export async function gemini(parts: Part[], system: string, temperature = 0.4) {
  return callGemini(TEXT_MODELS, parts, system, temperature);
}

export async function geminiAudio(parts: Part[], system: string) {
  return callGemini(AUDIO_MODELS, parts, system, 0);
}

export function parseJson<T>(raw: string): T {
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("parse");
    return JSON.parse(match[0]) as T;
  }
}
