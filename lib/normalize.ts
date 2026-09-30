import { assignExtensionDesk } from "./mentors";
import type { Extension, ExtensionMatter, State } from "./types";

function normalizeExtension(raw: Extension): Extension {
  const legacy = raw.status as string;
  let status = raw.status;
  if (legacy === "pending") status = "pending_counsellor";
  if (legacy === "granted") status = "recorded";
  const matter: ExtensionMatter = raw.matter ?? "academic";
  const assignedDesk =
    raw.assignedDesk ?? assignExtensionDesk(matter, raw.letter ?? "").assignedDesk;
  return { ...raw, status, matter, assignedDesk };
}

export function normalizeState(parsed: Partial<State>, base: State): State {
  const extensions = (parsed.extensions ?? base.extensions).map((item) =>
    normalizeExtension(item as Extension),
  );
  return {
    ...base,
    ...parsed,
    counsellorDesk: parsed.counsellorDesk ?? base.counsellorDesk,
    extensions,
    bookings: parsed.bookings ?? base.bookings,
    summaries: parsed.summaries ?? base.summaries,
    ledger: parsed.ledger ?? base.ledger,
  };
}
