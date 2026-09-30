import type { DemoStudentId } from "./demo-students";
import { SEED_BOOKINGS, SEED_EXTENSIONS, SEED_LEDGER } from "./seed";

export type Role = "student" | "faculty" | "counsellor" | "admin";

export type ExtensionStatus =
  | "pending_counsellor"
  | "declined"
  | "pending_faculty"
  | "recorded";

export type Extension = {
  id: string;
  studentId: DemoStudentId;
  courseId: "os" | "cn";
  letter: string;
  askUntil: string;
  status: ExtensionStatus;
  /** New deadline set when the counsellor approves. */
  grantedUntil?: string;
  declineNote?: string;
  nameReleased: boolean;
  createdAt: string;
};

export type Booking = {
  id: string;
  studentId: DemoStudentId;
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
    bookings: [...SEED_BOOKINGS],
    summaries: [],
    ledger: [...SEED_LEDGER],
    extensions: [...SEED_EXTENSIONS],
  };
}
