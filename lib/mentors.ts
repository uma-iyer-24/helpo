import type { ExtensionMatter } from "./types";

export type MentorProfile = {
  id: ExtensionMatter;
  title: string;
  name: string;
  detail: string;
};

export const MENTORS: Record<ExtensionMatter, MentorProfile> = {
  academic: {
    id: "academic",
    title: "Academic mentor",
    name: "Dr. Revathi N.",
    detail: "Coursework, labs, attendance",
  },
  financial: {
    id: "financial",
    title: "Financial aid desk",
    name: "Mr. Karthik M.",
    detail: "Fees, scholarships, stipends",
  },
  transport: {
    id: "transport",
    title: "Transport & hostel desk",
    name: "Ms. Lakshmi P.",
    detail: "Commute, hostel, campus travel",
  },
};

export const MATTER_OPTIONS: { value: ExtensionMatter; label: string; hint: string }[] = [
  { value: "academic", label: "Academic · coursework or exams", hint: "Assignments, labs, deadlines" },
  { value: "financial", label: "Financial · fees or aid", hint: "Fees, scholarships, stipends" },
  { value: "transport", label: "Transport & hostel", hint: "Commute, hostel shift, travel delays" },
];

const KEYWORDS: Record<ExtensionMatter, string[]> = {
  academic: [
    "assignment",
    "lab",
    "record",
    "exam",
    "mid-term",
    "course",
    "coursework",
    "deadline",
    "capstone",
    "observation",
    "internal assessment",
    "project",
  ],
  financial: [
    "fee",
    "fees",
    "scholarship",
    "stipend",
    "loan",
    "tuition",
    "payment",
    "finance",
    "aid",
    "receipt",
    "installment",
  ],
  transport: [
    "hostel",
    "bus",
    "commute",
    "travel",
    "transport",
    "shifting",
    "shifted",
    "route",
    "campus",
    "train",
    "metro",
  ],
};

function scoreMatter(letter: string, matter: ExtensionMatter) {
  const lower = letter.toLowerCase();
  return KEYWORDS[matter].reduce((sum, word) => (lower.includes(word) ? sum + 1 : sum), 0);
}

/** Infer the strongest matter signal from letter text alone. */
export function inferMatterFromLetter(letter: string): ExtensionMatter | null {
  const scores = (["academic", "financial", "transport"] as ExtensionMatter[]).map((matter) => ({
    matter,
    score: scoreMatter(letter, matter),
  }));
  scores.sort((a, b) => b.score - a.score);
  if (scores[0].score === 0) return null;
  if (scores.length > 1 && scores[0].score === scores[1].score) return null;
  return scores[0].matter;
}

/**
 * Route to a mentor desk. Letter keywords can override the student dropdown when
 * the signal is strong (2+ hits and beats the selected topic).
 */
export function assignExtensionDesk(
  selected: ExtensionMatter,
  letter: string,
): { assignedDesk: ExtensionMatter; inferred: ExtensionMatter | null; adjusted: boolean } {
  const inferred = inferMatterFromLetter(letter);
  if (!inferred) {
    return { assignedDesk: selected, inferred: null, adjusted: false };
  }
  const selectedScore = scoreMatter(letter, selected);
  const inferredScore = scoreMatter(letter, inferred);
  if (inferred !== selected && inferredScore >= 2 && inferredScore > selectedScore) {
    return { assignedDesk: inferred, inferred, adjusted: true };
  }
  return { assignedDesk: selected, inferred, adjusted: false };
}

export function mentorFor(desk: ExtensionMatter) {
  return MENTORS[desk];
}

export function matterLabel(matter: ExtensionMatter) {
  return MATTER_OPTIONS.find((item) => item.value === matter)?.label ?? matter;
}
