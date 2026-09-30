export const TODAY = "2026-09-30";
export const CAP = 3;

import { DEMO_STUDENTS, demoStudent } from "./demo-students";

export const ANANYA = { ...DEMO_STUDENTS.ananya, attendance: 76 };

export const SANA = DEMO_STUDENTS.sana;

export const FACULTY = {
  id: "lakshmi",
  name: "Dr. Lakshmi Nair",
  detail: "Operating Systems · Computer Networks",
};

/** GNITS counselling contact shown on Help and in crisis handoff. Replace phone when final. */
export const CAMPUS_COUNSELLOR = {
  name: "Ms. Counsellor",
  phone: "XXXXXXXX",
  tel: "tel:XXXXXXXX",
};

export type Course = {
  id: "os" | "cn";
  name: string;
  work: string;
  due: string;
  askDefault: string;
};

export const COURSES: Course[] = [
  {
    id: "os",
    name: "Operating Systems",
    work: "Assignment",
    due: "2026-10-01",
    askDefault: "2026-10-05",
  },
  {
    id: "cn",
    name: "Computer Networks",
    work: "Lab record",
    due: "2026-10-02",
    askDefault: "2026-10-06",
  },
];

export type DayKind = "open" | "blocked" | "closed";

export const WEEK: { date: string; kind: DayKind; reason?: string }[] = [
  { date: "2026-10-01", kind: "open" },
  { date: "2026-10-02", kind: "blocked", reason: "Placement pre-assessment" },
  { date: "2026-10-03", kind: "closed", reason: "Counselling centre closed" },
  { date: "2026-10-04", kind: "closed", reason: "Counselling centre closed" },
  { date: "2026-10-05", kind: "blocked", reason: "Operating Systems mid-term" },
];

export function courseById(id: string) {
  return COURSES.find((course) => course.id === id) ?? COURSES[0];
}

export function person(id: string) {
  return demoStudent(id);
}

export function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00+05:30`).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

export function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function nowStamp() {
  return new Date().toISOString();
}
