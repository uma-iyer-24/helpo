export type Role = "student" | "faculty" | "counsellor" | "admin";

export type Extension = {
  id: string;
  studentId: "ananya" | "sana";
  courseId: "os" | "cn";
  letter: string;
  askUntil: string;
  status: "pending" | "granted" | "declined";
  grantedUntil?: string;
  declineNote?: string;
  nameReleased: boolean;
  createdAt: string;
};

export type Booking = {
  id: string;
  studentId: "ananya";
  date: string;
  status: "booked" | "attested";
  createdAt: string;
};

export type Summary = {
  id: string;
  text: string;
  at: string;
};

export type LedgerLine = {
  id: string;
  at: string;
  text: string;
};

export type State = {
  role: Role;
  tutorialSeen: boolean;
  handedOver: boolean;
  extensions: Extension[];
  bookings: Booking[];
  summaries: Summary[];
  ledger: LedgerLine[];
};

export function freshState(): State {
  return {
    role: "student",
    tutorialSeen: false,
    handedOver: false,
    bookings: [],
    summaries: [],
    ledger: [],
    extensions: [
      {
        id: "ext-sana",
        studentId: "sana",
        courseId: "cn",
        letter:
          "I am requesting that the Computer Networks lab record, due Friday, move to Tuesday. I was unwell earlier this week and could not complete the observations. I can submit the record on Tuesday. I am not asking to move any exam.",
        askUntil: "2026-10-06",
        status: "pending",
        nameReleased: false,
        createdAt: "2026-09-30T09:10:00+05:30",
      },
    ],
  };
}
