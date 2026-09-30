"use client";

import Link from "next/link";
import { courseById, formatDate, formatWhen, person } from "@/lib/campus";
import { extensionFacultyLabel, facultyQueue } from "@/lib/extensions";
import { useHelpo } from "@/lib/store";
import { Page } from "@/components/ui";

export default function FacultyPage() {
  const { state } = useHelpo();
  const queue = state.extensions.filter((item) => facultyQueue(item.status));
  const leaves = state.bookings;

  return (
    <Page
      kicker="Faculty inbox"
      title="Record counsellor-approved extensions."
      lede="You do not approve or decline. Counselling has already decided. You record the new deadline so bias cannot block it."
    >
      {queue.length === 0 ? (
        <p className="note">Nothing to record. Approved extensions appear here without the student letter.</p>
      ) : (
        <div className="inbox">
          {queue.map((item) => {
            const course = courseById(item.courseId);
            const tag = extensionFacultyLabel(item.status);
            const who = item.nameReleased ? person(item.studentId) : null;
            return (
              <Link className="card row-link" href={`/faculty/${item.id}`} key={item.id}>
                <div className="row">
                  <h2>{course.name} · {course.work}</h2>
                  <span className="muted">{tag}</span>
                </div>
                <p style={{ margin: 0 }}>
                  Counsellor approved · record {formatDate(item.grantedUntil ?? item.askUntil)}
                </p>
                <p className="muted" style={{ margin: 0 }}>
                  {who ? who.name : "Name sealed until recorded"} · {formatWhen(item.createdAt)}
                </p>
              </Link>
            );
          })}
        </div>
      )}

      <section style={{ marginTop: 32 }}>
        <p className="kicker">Medical leave</p>
        {leaves.length === 0 ? (
          <p className="note">No medical leave on the shared view.</p>
        ) : (
          <div className="stack">
            {leaves.map((item) => (
              <article className="card" key={item.id}>
                <div className="row">
                  <h2>{person(item.studentId).name}</h2>
                  <span className="muted">{item.status === "attested" ? "Attested" : "Requested"}</span>
                </div>
                <p style={{ margin: 0 }}>{formatDate(item.date)} · medical leave. No reason is shared.</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </Page>
  );
}
