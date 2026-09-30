"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { courseById, formatDate } from "@/lib/campus";
import { matterLabel, mentorFor } from "@/lib/mentors";
import { useHelpo } from "@/lib/store";
import { Page } from "@/components/ui";

export default function CounsellorExtensionPage() {
  const { id } = useParams<{ id: string }>();
  const { state, approveExtension, declineExtension } = useHelpo();
  const item = state.extensions.find((entry) => entry.id === id);
  const [until, setUntil] = useState(item?.askUntil ?? "");
  const [note, setNote] = useState("This request cannot be approved under the extension policy.");

  if (!item) {
    return (
      <Page kicker="Counselling centre" title="This request is not in the queue.">
        <Link href="/counsellor">Back</Link>
      </Page>
    );
  }

  const course = courseById(item.courseId);
  const mentor = mentorFor(item.assignedDesk);

  return (
    <Page
      kicker={`${course.name} · anonymous`}
      title={item.status === "pending_counsellor" ? "Read, then approve or decline." : "Decision recorded."}
      lede={`Routed to ${mentor.title} (${mentor.name}). You see the letter. The student stays unnamed. Faculty only record a counsellor-approved date.`}
    >
      <p className="note">
        Topic: {matterLabel(item.matter)}
        {item.assignedDesk !== item.matter && (
          <> · Helpo reassigned to {mentor.title} based on the letter.</>
        )}
      </p>
      <p className="letter">{item.letter}</p>
      <p className="muted">Asked to move {formatDate(course.due)} to {formatDate(item.askUntil)}.</p>

      <article className="card">
        <p className="kicker">Student identity</p>
        <span className="seal" aria-label="Name sealed" />
        <p className="muted">Sealed for counselling. If you approve, faculty receive the course and the date only until they record it. The name is released only when faculty record the mandated extension.</p>
      </article>

      {item.status === "pending_counsellor" && (
        <div className="stack" style={{ marginTop: 16 }}>
          <label>
            Approved deadline
            <input type="date" value={until} min={course.due} onChange={(event) => setUntil(event.target.value)} />
          </label>
          <div className="actions">
            <button className="btn primary" type="button" onClick={() => approveExtension(item.id, until || item.askUntil)}>
              Approve and send to faculty
            </button>
          </div>
          <label>
            If you decline
            <input type="text" value={note} onChange={(event) => setNote(event.target.value)} />
          </label>
          <button className="btn ghost" type="button" onClick={() => declineExtension(item.id, note)}>
            Decline · name stays sealed
          </button>
        </div>
      )}

      {item.status === "pending_faculty" && (
        <p>Approved for {formatDate(item.grantedUntil ?? item.askUntil)}. Waiting for faculty to record.</p>
      )}
      {item.status === "recorded" && <p>Faculty recorded this extension.</p>}
      {item.status === "declined" && <p>Declined. The student will see: {item.declineNote}</p>}

      <p style={{ marginTop: 22 }}>
        <Link href="/counsellor">Back to today</Link>
      </p>
    </Page>
  );
}
