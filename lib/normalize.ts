import type { Extension, State } from "./types";

function normalizeExtension(raw: Extension): Extension {
  const legacy = raw.status as string;
  let status = raw.status;
  if (legacy === "pending") status = "pending_counsellor";
  if (legacy === "granted") status = "recorded";
  return { ...raw, status };
}

export function normalizeState(parsed: Partial<State>, base: State): State {
  const extensions = (parsed.extensions ?? base.extensions).map((item) =>
    normalizeExtension(item as Extension),
  );
  return {
    ...base,
    ...parsed,
    extensions,
    bookings: parsed.bookings ?? base.bookings,
    summaries: parsed.summaries ?? base.summaries,
    ledger: parsed.ledger ?? base.ledger,
  };
}
