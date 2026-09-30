"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { adminCaseById, formatCaseWhen } from "@/lib/cases";
import { useHelpo } from "@/lib/store";
import { Page } from "@/components/ui";

export default function AdminCasePage() {
  const { id } = useParams<{ id: string }>();
  const { state } = useHelpo();
  const item = adminCaseById(state, id);

  if (!item) {
    return (
      <Page kicker="College administration" title="This case is not on the ledger.">
        <Link href="/admin">Back to overview</Link>
      </Page>
    );
  }

  return (
    <Page kicker={item.ref} title="Operational record only.">
      <div className="stack">
        <article className="card">
          <div className="row">
            <h2>{item.kindLabel}</h2>
            <span className={`pill ${item.statusKey}`}>{item.status}</span>
          </div>
          <p className="muted" style={{ margin: 0 }}>
            Routed to {item.routedTo}. Opened {formatCaseWhen(item.openedAt)}.
          </p>
        </article>

        <article className="card">
          <p className="kicker">Identity and file</p>
          <p style={{ margin: 0 }}>{item.sealLabel}</p>
          <p className="note" style={{ margin: "10px 0 0" }}>
            The encrypted case file lives with the student. Helpo verified identity when the session opened and appended this exchange. No case body is stored in admin view.
          </p>
        </article>

        <article className="card">
          <p className="kicker">Assignee view</p>
          {item.kind === "extension" && (
            <p style={{ margin: 0 }}>
              Course faculty see the course, the request text, and the name only after a grant. They never see crashout or prior case history.
            </p>
          )}
          {item.kind === "mental_health_day" && (
            <p style={{ margin: 0 }}>
              The counselling centre see the booking, the room, and attestation. No reason is collected. Medical leave is marked after attestation.
            </p>
          )}
          {item.kind === "handover" && (
            <p style={{ margin: 0 }}>
              The centre can decrypt what the student released. College admin and Helpo operators cannot read the ciphertext.
            </p>
          )}
        </article>

        <section>
          <p className="kicker">Witness log excerpt</p>
          {item.witnessLines.length === 0 ? (
            <p className="note">No ledger lines yet for this case.</p>
          ) : (
            <ul className="ledger">
              {item.witnessLines.map((line, index) => (
                <li key={`${line.at}-${index}`}>
                  <span className="muted">{formatCaseWhen(line.at)}</span>
                  <span>{line.text}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="note">Append-only. Content-free with respect to private narrative. Full student file remains off this screen.</p>
        </section>
      </div>

      <p style={{ marginTop: 22 }}>
        <Link href="/admin">Back to overview</Link>
      </p>
    </Page>
  );
}
