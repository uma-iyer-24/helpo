import type { Extension } from "./types";

export function extensionStudentLabel(status: Extension["status"]) {
  switch (status) {
    case "pending_counsellor":
      return "With the counselling centre · your name is sealed";
    case "pending_faculty":
      return "Counsellor approved · waiting for faculty to record the date";
    case "recorded":
      return "Recorded · your faculty can see your name for this deadline";
    case "declined":
      return "Not approved · your name stayed sealed";
  }
}

export function extensionFacultyLabel(status: Extension["status"]) {
  if (status === "pending_faculty") return "Record · mandated";
  if (status === "recorded") return "Recorded";
  return null;
}

export function counsellorQueue(status: Extension["status"]) {
  return status === "pending_counsellor";
}

export function facultyQueue(status: Extension["status"]) {
  return status === "pending_faculty" || status === "recorded";
}
