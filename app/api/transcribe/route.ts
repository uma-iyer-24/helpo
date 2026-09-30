import { ModelError, gemini, parseJson } from "@/lib/gemini";

export const maxDuration = 60;

const SYSTEM = `Transcribe the speech exactly, in the original language. Do not translate, summarise, or comment.
Reply with JSON only: {"text":"...","language":"te"}
language is te, hi, en, or other.`;

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const file = form?.get("audio");
  if (!(file instanceof File)) return Response.json({ error: "empty" }, { status: 400 });

  const mime = file.type.split(";")[0] || "audio/webm";
  const data = Buffer.from(await file.arrayBuffer()).toString("base64");

  try {
    const raw = await gemini(
      [
        { text: "Transcribe this recording." },
        { inlineData: { mimeType: mime, data } },
      ],
      SYSTEM,
      0,
    );
    try {
      const parsed = parseJson<{ text: string; language: string }>(raw);
      return Response.json({ text: parsed.text ?? "", language: parsed.language ?? "other" });
    } catch {
      return Response.json({ text: raw.trim(), language: "other" });
    }
  } catch (error) {
    if (error instanceof ModelError && error.code === "missing_key") {
      return Response.json({ error: "missing_key" }, { status: 503 });
    }
    return Response.json({ error: "upstream" }, { status: 502 });
  }
}
