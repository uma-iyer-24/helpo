import { assignExtensionDesk } from "./mentors";
import type { Booking, Extension, ExtensionMatter, LedgerLine } from "./types";

function ext(
  row: Omit<Extension, "matter" | "assignedDesk"> & { matter?: ExtensionMatter },
): Extension {
  const matter = row.matter ?? "academic";
  const { assignedDesk } = assignExtensionDesk(matter, row.letter);
  return { ...row, matter, assignedDesk };
}

/** Sample cases for admin / staff views. Ananya starts with none — pitch flow stays clean. */
export const SEED_EXTENSIONS: Extension[] = [
  ext({
    id: "ext-sana",
    studentId: "sana",
    courseId: "cn",
    matter: "academic",
    letter:
      "I am requesting that the Computer Networks lab record, due Friday, move to Tuesday. I was unwell earlier this week and could not complete the observations. I can submit on Tuesday. I am not asking to move any exam.",
    askUntil: "2026-10-06",
    status: "pending_counsellor",
    nameReleased: false,
    createdAt: "2026-09-30T09:10:00+05:30",
  }),
  ext({
    id: "ext-priya",
    studentId: "priya",
    courseId: "os",
    matter: "financial",
    letter:
      "I need the Operating Systems assignment moved from Thursday to Monday. My scholarship stipend was delayed and I could not buy the required cloud credits until today. I can submit Monday night. Mid-term is not part of this ask.",
    askUntil: "2026-10-05",
    status: "pending_counsellor",
    nameReleased: false,
    createdAt: "2026-09-29T20:40:00+05:30",
  }),
  ext({
    id: "ext-ishita",
    studentId: "ishita",
    courseId: "cn",
    matter: "transport",
    letter:
      "First-year lab record is due Friday. I could not finish after shifting hostels and losing two commute days. Requesting until Wednesday next week.",
    askUntil: "2026-10-08",
    status: "pending_counsellor",
    nameReleased: false,
    createdAt: "2026-09-30T08:05:00+05:30",
  }),
  ext({
    id: "ext-meera",
    studentId: "meera",
    courseId: "os",
    matter: "transport",
    letter:
      "OS assignment extension to Monday. Medical appointment and travel back to campus ran long on the inter-city bus. I can complete by Monday 11:59 pm.",
    askUntil: "2026-10-05",
    status: "pending_faculty",
    grantedUntil: "2026-10-05",
    nameReleased: false,
    createdAt: "2026-09-28T14:22:00+05:30",
  }),
  ext({
    id: "ext-kavya",
    studentId: "kavya",
    courseId: "cn",
    matter: "academic",
    letter:
      "Lab record extension to Tuesday. Instrument failure in the lab slot meant I could not capture half the readings.",
    askUntil: "2026-10-06",
    status: "pending_faculty",
    grantedUntil: "2026-10-06",
    nameReleased: false,
    createdAt: "2026-09-27T11:00:00+05:30",
  }),
  ext({
    id: "ext-divya-os",
    studentId: "divya",
    courseId: "os",
    matter: "academic",
    letter:
      "Capstone-adjacent OS assignment. Counselling supported a short extension after burnout symptoms. Requesting until Sunday.",
    askUntil: "2026-10-04",
    status: "recorded",
    grantedUntil: "2026-10-04",
    nameReleased: true,
    createdAt: "2026-09-25T16:30:00+05:30",
  }),
  ext({
    id: "ext-divya-cn",
    studentId: "divya",
    courseId: "cn",
    matter: "academic",
    letter:
      "Second extension this semester for CN record after interview travel. Asking until Wednesday.",
    askUntil: "2026-10-08",
    status: "recorded",
    grantedUntil: "2026-10-08",
    nameReleased: true,
    createdAt: "2026-09-22T10:15:00+05:30",
  }),
  ext({
    id: "ext-meera-decl",
    studentId: "meera",
    courseId: "cn",
    matter: "academic",
    letter:
      "Request to move lab record one week. I underestimated load during fest week.",
    askUntil: "2026-10-09",
    status: "declined",
    declineNote: "Outside extension policy this close to the internal assessment window.",
    nameReleased: false,
    createdAt: "2026-09-26T19:00:00+05:30",
  }),
  ext({
    id: "ext-priya-decl",
    studentId: "priya",
    courseId: "cn",
    matter: "financial",
    letter:
      "Need two extra days on the lab record. Fee receipt upload to the portal failed and I lost lab access until yesterday.",
    askUntil: "2026-10-04",
    status: "declined",
    declineNote: "Ask is within one day of due date without prior notice. Use office hours.",
    nameReleased: false,
    createdAt: "2026-09-24T07:50:00+05:30",
  }),
];

export const SEED_BOOKINGS: Booking[] = [
  {
    id: "day-meera",
    studentId: "meera",
    date: "2026-10-01",
    status: "booked",
    createdAt: "2026-09-30T07:30:00+05:30",
  },
  {
    id: "day-kavya",
    studentId: "kavya",
    date: "2026-10-01",
    status: "attested",
    createdAt: "2026-09-29T18:00:00+05:30",
  },
  {
    id: "day-ishita",
    studentId: "ishita",
    date: "2026-10-01",
    status: "booked",
    createdAt: "2026-09-30T06:45:00+05:30",
  },
];

export const SEED_LEDGER: LedgerLine[] = [
  { id: "led-1", at: "2026-09-30T09:10:00+05:30", text: "Extension requested · Computer Networks · routed to counselling" },
  { id: "led-2", at: "2026-09-29T20:40:00+05:30", text: "Extension requested · Operating Systems · routed to counselling" },
  { id: "led-3", at: "2026-09-28T15:00:00+05:30", text: "Extension approved by counselling · Operating Systems · forwarded to faculty" },
  { id: "led-4", at: "2026-09-27T12:30:00+05:30", text: "Extension approved by counselling · Computer Networks · forwarded to faculty" },
  { id: "led-5", at: "2026-09-26T09:00:00+05:30", text: "Extension recorded by faculty · Operating Systems · mandated · name released" },
  { id: "led-6", at: "2026-09-25T11:00:00+05:30", text: "Mental health day booked · Thursday 1 Oct" },
  { id: "led-7", at: "2026-09-24T14:00:00+05:30", text: "Medical leave attested · Thursday 1 Oct" },
  { id: "led-8", at: "2026-09-23T10:00:00+05:30", text: "Extension not approved · Computer Networks · counselling · identity stayed sealed" },
];
