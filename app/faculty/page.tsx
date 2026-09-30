"use client";

import Link from "next/link";
import { ANANYA, courseById, formatDate, formatWhen, person } from "@/lib/campus";
import { useHelpo } from "@/lib/store";
import { Page } from "@/components/ui";

export default function FacultyPage() {
  const { state } = useHelpo();
  const leaves = state.bookings;

  return (
    <Page
      kicker="Faculty inbox"
      title="Requests without names."
      lede="You see the course and the letter. The name stays sealed unless you grant the time."
    >
      <div className="inbox">
        {state.extensions.map((item) => {
          const course = courseById(item.courseId);
          const who = item.nameReleased ? person(item.studentId) : null;
          return (
            <Link className="card row-link" href={`/faculty/${item.id}`} key={item.id}>
              <div className="row">
                <h2>{course.name} · {course.work}</h2>
                <span className="muted">{item.status}</span>
              </div>
              <p style={{ margin: 0 }}>
                Move {formatDate(course.due)} to {formatDate(item.grantedUntil ?? item.askUntil)}
              </p>
              <p className="muted" style={{ margin: 0 }}>
                {who ? who.name : "Name sealed"} · {formatWhen(item.createdAt)}
              </p>
            </Link>
          );
        })}
      </div>

      <section style={{ marginTop: 32 }}>
        <p className="kicker">Medical leave</p>
        {leaves.length === 0 ? (
          <p className="note">No medical leave on the shared view.</p>
        ) : (
          <div className="stack">
            {leaves.map((item) => (
              <article className="card" key={item.id}>
                <div className="row">
                  <h2>{ANANYA.name}</h2>
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
