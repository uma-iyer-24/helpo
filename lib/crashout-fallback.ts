import { CAMPUS_COUNSELLOR } from "./campus";

export const CRISIS_PATTERN = /\b(suicid|kill myself|want to die|end my life|self[-\s]?harm)\b/i;

const SWEAR = /\b(fuck|shit|damn|bitch|asshole|stupid|hate you|idiot)\b/gi;

const REGULATION = {
  en: "Put both feet on the floor. Breathe in for four counts, out for six. Drink water if you can. You do not have to decide anything in the next five minutes.",
  hi: "दोनों पैर ज़मीन पर रखें। चार गिनती तक साँस अंदर, छह तक बाहर। पानी पिएँ। अगले पाँच मिनट में कुछ भी तय करने की ज़रूरत नहीं है।",
  te: "రెండు పాదాలు నేల మీద ఉంచండి. నాలుగు లెక్కలు ఊపిరి తీసుకోండి, ఆరు లెక్కలు వదలండి. నీరు తాగండి. మరుకṣణం ఐదు నిమిషాల్లో ఏం నిర్ణయించాల్సిన అవసరం లేదు.",
};

export type CrashoutPayload = {
  regulation: string;
  summary: string;
  crisis: boolean;
  regulationLanguage: string;
  fallback: boolean;
};

export function detectLanguage(text: string): keyof typeof REGULATION {
  if (/[\u0C00-\u0C7F]/.test(text)) return "te";
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  return "en";
}

function cleanForLetter(raw: string) {
  return raw
    .replace(SWEAR, "")
    .replace(/\s+/g, " ")
    .replace(/!{2,}/g, ".")
    .trim();
}

function buildSummary(raw: string) {
  const clean = cleanForLetter(raw);
  if (!clean) {
    return "Dear Professor,\n\nI am writing to explain my situation this week. I would appreciate your understanding.\n\nThank you.";
  }

  const asksTime =
    /\b(extend|extension|more time|deadline|move|postpone|late|submit)\b/i.test(raw) ||
    /\b(assignment|lab|record|project|os|operating systems|networks)\b/i.test(raw);

  const opener = asksTime
    ? "Dear Professor,\n\nI am writing to request additional time on coursework."
    : "Dear Professor,\n\nI am writing to explain my situation this week.";

  const body =
    clean.length > 520
      ? `${clean.slice(0, 520).trim()}…`
      : clean;

  return `${opener}\n\n${body}\n\nThank you for your consideration.`;
}

export function crashoutFallback(text: string): CrashoutPayload {
  const lang = detectLanguage(text);

  if (CRISIS_PATTERN.test(text)) {
    return {
      regulation: `Put both feet on the floor and stay where you are. Call ${CAMPUS_COUNSELLOR.name} now (Ph: ${CAMPUS_COUNSELLOR.phone}). If you are in immediate physical danger, call 112.`,
      summary: "",
      crisis: true,
      regulationLanguage: "en",
      fallback: true,
    };
  }

  return {
    regulation: REGULATION[lang],
    summary: buildSummary(text),
    crisis: false,
    regulationLanguage: lang,
    fallback: true,
  };
}
