# Helpo

Prototype for GNITS. One student case, shared with faculty and the counselling centre only as far as each action requires.

Demo state lives in the browser. Use **Preview as** to move between Ananya Rao, Dr. Lakshmi Nair, the counselling centre, and **College administration** (case overview without private data). **Reset demo** returns to Wednesday night, 30 September 2026.

## Run locally

```bash
npm install
cp .env.example .env.local
```

Set `GEMINI_API_KEY` in `.env.local` if you want live Gemini for Crashout bot (recommended for demos). Without it, the app still runs and Crashout uses a built-in offline draft.

```bash
npm run dev
```

## Vercel environment variables

| Variable | Required? | Where |
| --- | --- | --- |
| `GEMINI_API_KEY` | **No** (recommended) | Project → Settings → Environment Variables |

Add `GEMINI_API_KEY` for **Production** and **Preview** if you want Gemini-powered letters and voice transcription. If it is missing, rate-limited, or down, Helpo falls back automatically:

- **Typed crashout** — regulation text + a simple professional letter draft from what the student wrote (no API).
- **Voice** — asks the student to type or use keyboard dictation; transcription needs Gemini when it is available.

No other environment variables are required. The Next.js **build** does not need any secrets; only runtime API routes read `GEMINI_API_KEY`.

Do not commit `.env.local`. The repo includes `.env.example` only.

## Deploy on Vercel

1. Import [github.com/uma-iyer-24/helpo](https://github.com/uma-iyer-24/helpo).
2. Framework preset: **Next.js** (default).
3. Add `GEMINI_API_KEY` under Environment Variables (optional).
4. Deploy.
