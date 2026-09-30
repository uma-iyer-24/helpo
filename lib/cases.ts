import { courseById, formatWhen } from "./campus";
import type { State } from "./types";

export type AdminCaseKind = "extension" | "mental_health_day" | "handover";

export type AdminCase = {
  id: string;
  ref: string;
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

function refFromId(prefix: string, id: string) {
  const tail = id.replace(/[^a-z0-9]/gi, "").slice(-6).toUpperCase() || "000000";
  return `HLP-${prefix}-${tail}`;
}

function extensionStatus(status: "pending" | "granted" | "declined") {
  if (status === "pending") return { label: "Awaiting faculty decision", key: "pending" as const };
  if (status === "granted") return { label: "Granted · identity released to assignee only", key: "closed" as const };
  return { label: "Declined · identity stayed sealed", key: "declined" as const };
}

function linesFor(state: State, match: (text: string) => boolean) {
  return state.ledger.filter((line) => match(line.text)).map((line) => ({ at: line.at, text: line.text }));
}

/** Operational case rows for college admin. No names, letters, summaries, or reasons. */
export function adminCases(state: State): AdminCase[] {
  const rows: AdminCase[] = state.extensions.map((item) => {
    const course = courseById(item.courseId);
    const st = extensionStatus(item.status);
    const updated =
      item.status === "granted" || item.status === "declined" ? item.createdAt : item.createdAt;
    return {
      id: item.id,
      ref: refFromId("EXT", item.id),
      kind: "extension",
      kindLabel: `Anonymous extension · ${course.name}`,
      routedTo: `Course faculty · ${course.name}`,
      status: st.label,
      statusKey: st.key,
      sealLabel: item.nameReleased ? "Released to assignee only" : "Student identity sealed",
      openedAt: item.createdAt,
      updatedAt: updated,
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
      ref: refFromId("MHD", item.id),
      kind: "mental_health_day",
      kindLabel: "Mental health day · Admin-Gr22",
      routedTo: "Counselling centre · Admin-Gr22",
      status: st.label,
      statusKey: st.key,
      sealLabel: "Identity held by counselling centre for room and attendance only",
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
      kind: "handover",
      kindLabel: "Encrypted case file · student-initiated handover",
      routedTo: "Counselling centre · Admin-Gr22",
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
