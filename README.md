# Helpo

Prototype for GNITS. One student case, shared with faculty and the counselling centre only as far as each action requires.

Demo state lives in the browser. Use **Preview as** to move between Ananya Rao, Dr. Lakshmi Nair, the counselling centre, and **College administration** (case overview without private data). **Reset demo** returns to Wednesday night, 30 September 2026.

## Run locally

```bash
npm install
cp .env.example .env.local
```

Set `GEMINI_API_KEY` in `.env.local`, then:

```bash
npm run dev
```

## Vercel

Import this GitHub repository. In the project settings, add `GEMINI_API_KEY` as an environment variable. The key is not in the repository. Crashout text and voice need it. Every other flow works without it.
