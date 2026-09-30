"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { courseById, formatDate, person } from "@/lib/campus";
import { useHelpo } from "@/lib/store";
import { Page } from "@/components/ui";

export default function FacultyRequestPage() {
  const { id } = useParams<{ id: string }>();
  const { state, grantExtension, declineExtension } = useHelpo();
  const item = state.extensions.find((entry) => entry.id === id);
  const [due, setDue] = useState(item?.askUntil ?? "");
  const [note, setNote] = useState("This deadline cannot move.");

  if (!item) {
    return (
      <Page kicker="Faculty" title="This request is not in the inbox.">
        <Link href="/faculty">Back to inbox</Link>
      </Page>
    );
  }

  const course = courseById(item.courseId);
  const who = item.nameReleased ? person(item.studentId) : null;

  return (
    <Page kicker={`${course.name} · ${course.work}`} title={item.status === "granted" ? "Granted" : item.status === "declined" ? "Declined" : "Read, then decide."}>
      <p className="letter">{item.letter}</p>
      <p className="muted">Asked to move {formatDate(course.due)} to {formatDate(item.askUntil)}.</p>

      <article className="card">
        <p className="kicker">Name</p>
        {who ? (
          <p className="reveal" style={{ margin: 0 }}>
            <b>{who.name}</b> · {who.roll}
            <br />
            <span className="muted">You can see this because you granted the extension. You need the name to record the new date.</span>
          </p>
        ) : (
          <>
            <span className="seal" aria-label="Name sealed" />
            <p className="muted">Released only if you grant this, so the deadline can be recorded. A decline keeps the name sealed. Nothing from any earlier case is on this page.</p>
          </>
        )}
      </article>

      {item.status === "pending" && (
        <div className="stack" style={{ marginTop: 16 }}>
          <label>
            New deadline
            <input type="date" value={due} onChange={(event) => setDue(event.target.value)} />
          </label>
          <div className="actions">
            <button className="btn primary" type="button" onClick={() => grantExtension(item.id, due || item.askUntil)}>Grant and reveal the name</button>
          </div>
          <label>
            If you decline
            <input type="text" value={note} onChange={(event) => setNote(event.target.value)} />
          </label>
          <button className="btn ghost" type="button" onClick={() => declineExtension(item.id, note)}>Decline, name stays sealed</button>
        </div>
      )}

      {item.status === "granted" && <p>Record the deadline as {formatDate(item.grantedUntil ?? item.askUntil)}.</p>}
      {item.status === "declined" && <p>Name stayed sealed. She will see: {item.declineNote}</p>}
      <p><Link href="/faculty">Back to inbox</Link></p>
    </Page>
  );
}
