import { crashoutFallback, CRISIS_PATTERN } from "@/lib/crashout-fallback";
import { ModelError, gemini, parseJson } from "@/lib/gemini";

export const maxDuration = 60;

const SYSTEM = `You are Crashout bot, inside Helpo, for one GNITS student.

You do two things only.
1. Regulation: 2 to 4 short sentences that help her settle her body. Concrete actions: breathing, feet on the floor, water, step away from the screen. No lecture. If she spoke Telugu, Hindi, or a mix, write the regulation in that language. If she spoke English, write English.
2. Summary: a short letter in clear English, in her voice, that she could send to faculty. Include the work, the factual situation, and what she is asking, only using facts she stated. Remove insults, slang, and the spiral. Do not invent anything.

Never advise on the situation. Never say whether she should request an extension, skip an exam, or how to persuade someone. Never diagnose, mention medication, or discuss a plan for self-harm. Never roleplay faculty or a counsellor.

If she asks what she should do, say that decision belongs with her, her faculty, or the counselling centre. Still give regulation and a factual summary of what she already said.

If the message suggests immediate danger to her or someone else, set crisis to true. Regulation is then one grounding line and the instruction to call Ms. Counsellor on campus (Ph: XXXXXXXX), or 112 if she is in immediate physical danger. Set summary to an empty string.

Reply with JSON only:
{"regulation":"...","summary":"...","crisis":false,"regulationLanguage":"en"}
regulationLanguage is te, hi, en, or other.`;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { text?: string } | null;
  const text = body?.text?.trim() ?? "";
  if (!text) return Response.json({ error: "empty" }, { status: 400 });

  if (CRISIS_PATTERN.test(text)) {
    return Response.json({ ...crashoutFallback(text), fallback: false });
  }

  try {
    const raw = await gemini([{ text }], SYSTEM, 0.4);
    const parsed = parseJson<{
      regulation: string;
      summary: string;
      crisis: boolean;
      regulationLanguage: string;
    }>(raw);
    return Response.json({
      regulation: parsed.regulation ?? "",
      summary: parsed.crisis ? "" : parsed.summary ?? "",
      crisis: Boolean(parsed.crisis),
      regulationLanguage: parsed.regulationLanguage ?? "en",
      fallback: false,
    });
  } catch (error) {
    const offline = crashoutFallback(text);
    return Response.json({
      ...offline,
      fallbackReason:
        error instanceof ModelError && error.code === "missing_key"
          ? "missing_key"
          : "upstream",
    });
  }
}
