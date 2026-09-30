import { ModelError, geminiAudio, parseJson } from "@/lib/gemini";

export const maxDuration = 60;

const SYSTEM = `Transcribe the speech exactly, in the original language. Do not translate, summarise, or comment.
Reply with JSON only: {"text":"...","language":"te"}
language is te, hi, en, or other.`;

const SUPPORTED = new Set(["audio/wav", "audio/mp3", "audio/mpeg", "audio/ogg", "audio/flac", "audio/aiff", "audio/x-aiff"]);

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const file = form?.get("audio");
  if (!(file instanceof File)) return Response.json({ error: "empty" }, { status: 400 });

  if (file.size < 800) {
    return Response.json({
      error: "too_short",
      fallback: true,
      hint: "That recording was too short. Hold Speak a little longer, or type below.",
    });
  }

  let mime = (file.type.split(";")[0] || "audio/wav").toLowerCase();
  if (mime === "audio/webm" || mime === "audio/mp4" || mime === "video/webm") {
    return Response.json({
      error: "unsupported_format",
      fallback: true,
      hint: "This browser sent a format Gemini cannot read. Use Speak again (we convert to WAV), or type below.",
    });
  }
  if (!SUPPORTED.has(mime)) mime = "audio/wav";

  const data = Buffer.from(await file.arrayBuffer()).toString("base64");

  try {
    const raw = await geminiAudio(
      [
        { text: "Transcribe this recording." },
        { inlineData: { mimeType: mime, data } },
      ],
      SYSTEM,
    );
    try {
      const parsed = parseJson<{ text: string; language: string }>(raw);
      const text = (parsed.text ?? "").trim();
      if (!text) {
        return Response.json({
          error: "no_speech",
          fallback: true,
          hint: "No speech was detected. Try again, or type what you wanted to say.",
        });
      }
      return Response.json({
        text,
        language: parsed.language ?? "other",
        fallback: false,
      });
    } catch {
      const text = raw.trim();
      if (!text) {
        return Response.json({
          error: "parse",
          fallback: true,
          hint: "Transcription came back empty. Type what you said below.",
        });
      }
      return Response.json({ text, language: "other", fallback: false });
    }
  } catch (error) {
    const reason = error instanceof ModelError && error.code === "missing_key" ? "missing_key" : "upstream";
    const detail = error instanceof ModelError ? error.message.slice(0, 200) : "unknown";
    return Response.json(
      {
        error: reason,
        fallback: true,
        detail,
        hint:
          reason === "missing_key"
            ? "Add GEMINI_API_KEY on the server for cloud transcription. You can still type, or use browser dictation."
            : reason === "upstream" && detail.includes("429")
              ? "Gemini rate limit hit. Wait a minute, type below, or use keyboard dictation."
              : "Cloud transcription failed. Type what you said below, or use keyboard dictation.",
      },
      { status: 200 },
    );
  }
}
