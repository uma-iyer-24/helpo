import { courseById, formatWhen } from "./campus";
import { mentorFor } from "./mentors";
import type { ExtensionStatus, State } from "./types";

export type AdminCaseKind = "extension" | "mental_health_day" | "handover";

export type AdminCase = {
  id: string;
  ref: string;
  /** Opaque handle for the student-owned encrypted file. Not a roll number or name. */
  fileSeal: string;
  kind: AdminCaseKind;
  kindLabel: string;
  routedTo: string;
  status: string;
  statusKey: "pending" | "active" | "closed" | "declined";
  sealLabel: string;
  openedAt: string;
  updatedAt: string;
  witnessLines: { at: string; text: string }[];
};

function fileSeal(studentKey: string) {
  let hash = 0;
  for (let i = 0; i < studentKey.length; i += 1) {
    hash = (hash * 31 + studentKey.charCodeAt(i)) >>> 0;
  }
  return `HLP-SEAL-${(hash % 0xffff).toString(16).toUpperCase().padStart(4, "0")}`;
}

function refFromId(prefix: string, id: string) {
  const tail = id.replace(/[^a-z0-9]/gi, "").slice(-6).toUpperCase() || "000000";
  return `HLP-${prefix}-${tail}`;
}

/** Opaque operational ref (does not derive from student name in booking ids). */
export function opaqueCaseRef(prefix: string, id: string) {
  let hash = 5381;
  for (let i = 0; i < id.length; i += 1) {
    hash = ((hash << 5) + hash + id.charCodeAt(i)) >>> 0;
  }
  return `HLP-${prefix}-${(hash % 0xffffff).toString(16).toUpperCase().padStart(6, "0")}`;
}

function extensionStatus(status: ExtensionStatus) {
  switch (status) {
    case "pending_counsellor":
      return {
        label: "Awaiting counselling · anonymous",
        key: "pending" as const,
        routedTo: (course: string) => `Counselling centre · ${course}`,
      };
    case "pending_faculty":
      return {
        label: "Approved · faculty must record",
        key: "active" as const,
        routedTo: (course: string) => `Course faculty · ${course} · mandated`,
      };
    case "recorded":
      return {
        label: "Recorded · identity released to faculty only",
        key: "closed" as const,
        routedTo: (course: string) => `Course faculty · ${course}`,
      };
    case "declined":
      return {
        label: "Not approved · identity stayed sealed",
        key: "declined" as const,
        routedTo: (course: string) => `Counselling centre · ${course}`,
      };
  }
}

function linesFor(state: State, match: (text: string) => boolean) {
  return state.ledger.filter((line) => match(line.text)).map((line) => ({ at: line.at, text: line.text }));
}

/** Operational case rows for college admin. No names, letters, summaries, or reasons. */
export function adminCases(state: State): AdminCase[] {
  const rows: AdminCase[] = state.extensions.map((item) => {
    const course = courseById(item.courseId);
    const st = extensionStatus(item.status);
    return {
      id: item.id,
      ref: refFromId("EXT", item.id),
      fileSeal: fileSeal(item.studentId),
      kind: "extension",
      kindLabel: `Anonymous extension · ${course.name}`,
      routedTo: `${mentorFor(item.assignedDesk).title} · ${course.name}`,
      status: st.label,
      statusKey: st.key,
      sealLabel: item.nameReleased ? "Released to assignee only" : "Student identity sealed",
      openedAt: item.createdAt,
      updatedAt: item.createdAt,
      witnessLines: linesFor(
        state,
        (text) => text.includes("Extension") && (text.includes(course.name) || text.includes(item.id)),
      ).slice(0, 8),
    };
  });

  for (const item of state.bookings) {
    const st =
      item.status === "booked"
        ? { label: "Booked · attestation pending", key: "pending" as const }
        : { label: "Medical leave attested", key: "closed" as const };
    rows.push({
      id: item.id,
      ref: opaqueCaseRef("MHD", item.id),
      fileSeal: fileSeal(item.studentId),
      kind: "mental_health_day",
      kindLabel: "Mental health day · anonymous on centre screen",
      routedTo: "Counselling centre",
      status: st.label,
      statusKey: st.key,
      sealLabel: "Student identity sealed on shared counselling view",
      openedAt: item.createdAt,
      updatedAt: item.createdAt,
      witnessLines: linesFor(state, (text) => text.includes("Mental health") || text.includes("Medical leave")).slice(0, 8),
    });
  }

  if (state.handedOver) {
    const at = state.ledger.find((line) => line.text.includes("handed"))?.at ?? nowFallback(state);
    rows.push({
      id: "handover",
      ref: refFromId("FIL", "handover"),
      fileSeal: fileSeal("ananya"),
      kind: "handover",
      kindLabel: "Encrypted case file · student-initiated handover",
      routedTo: "Counselling centre",
      status: state.summaries.length > 0 ? "Received · decryptable by assignee only" : "Received · no summary attached",
      statusKey: "active",
      sealLabel: "Body encrypted · not readable by Helpo or college admin",
      openedAt: at,
      updatedAt: at,
      witnessLines: linesFor(state, (text) => text.includes("handed") || text.includes("Summary attached")).slice(0, 8),
    });
  }

  return rows.sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime());
}

function nowFallback(state: State) {
  return state.ledger[0]?.at ?? new Date().toISOString();
}

export function adminCaseById(state: State, id: string) {
  return adminCases(state).find((item) => item.id === id) ?? null;
}

export function adminStats(state: State) {
  const cases = adminCases(state);
  return {
    total: cases.length,
    pending: cases.filter((item) => item.statusKey === "pending").length,
    active: cases.filter((item) => item.statusKey === "active").length,
    closed: cases.filter((item) => item.statusKey === "closed").length,
    declined: cases.filter((item) => item.statusKey === "declined").length,
  };
}

export function formatCaseWhen(iso: string) {
  return formatWhen(iso);
}
