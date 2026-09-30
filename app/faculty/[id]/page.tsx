"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { courseById, formatDate, person } from "@/lib/campus";
import { useHelpo } from "@/lib/store";
import { Page } from "@/components/ui";

export default function FacultyRequestPage() {
  const { id } = useParams<{ id: string }>();
  const { state, recordExtension } = useHelpo();
  const item = state.extensions.find((entry) => entry.id === id);

  if (!item) {
    return (
      <Page kicker="Faculty" title="This request is not in the inbox.">
        <Link href="/faculty">Back to inbox</Link>
      </Page>
    );
  }

  const course = courseById(item.courseId);
  const who = item.nameReleased ? person(item.studentId) : null;
  const until = item.grantedUntil ?? item.askUntil;

  return (
    <Page
      kicker={`${course.name} · ${course.work}`}
      title={item.status === "recorded" ? "Recorded." : "Mandated recording."}
      lede="Counselling approved this extension. You record the date. You do not see the student letter."
    >
      <article className="card">
        <p className="kicker">Counsellor decision</p>
        <p style={{ margin: 0 }}>
          Move {formatDate(course.due)} to <b>{formatDate(until)}</b>.
        </p>
        <p className="note" style={{ margin: "10px 0 0" }}>
          This is not a discretionary grant. Under Helpo, faculty record counsellor-approved extensions so unconscious bias cannot override student welfare.
        </p>
      </article>

      <article className="card">
        <p className="kicker">Student letter</p>
        <p className="muted" style={{ margin: 0 }}>Not shown. Counselling read it anonymously. You receive the course and the approved date only.</p>
      </article>

      <article className="card">
        <p className="kicker">Name</p>
        {who ? (
          <p className="reveal" style={{ margin: 0 }}>
            <b>{who.name}</b> · {who.roll}
            <br />
            <span className="muted">Released because you recorded the mandated extension.</span>
          </p>
        ) : (
          <>
            <span className="seal" aria-label="Name sealed" />
            <p className="muted">Released when you record the deadline, so it can be entered in the register.</p>
          </>
        )}
      </article>

      {item.status === "pending_faculty" && (
        <div className="actions" style={{ marginTop: 16 }}>
          <button className="btn primary" type="button" onClick={() => recordExtension(item.id)}>
            Record {formatDate(until)} and release the name
          </button>
        </div>
      )}

      {item.status === "recorded" && <p>Recorded in the course. Due {formatDate(until)}.</p>}
      {item.status === "pending_counsellor" && <p className="note">Still with counselling. It will appear here after approval.</p>}

      <p style={{ marginTop: 22 }}>
        <Link href="/faculty">Back to inbox</Link>
      </p>
    </Page>
  );
}
