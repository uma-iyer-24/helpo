"use client";

import Link from "next/link";
import { courseById, formatDate, formatWhen, person } from "@/lib/campus";
import { counsellorQueue } from "@/lib/extensions";
import { useHelpo } from "@/lib/store";
import { Page } from "@/components/ui";

export default function CounsellorPage() {
  const { state, attestDay } = useHelpo();
  const extensionInbox = state.extensions.filter((item) => counsellorQueue(item.status) || item.status === "pending_faculty" || item.status === "recorded");

  return (
    <Page
      kicker="Counselling centre"
      title="Today at the centre."
      lede="Anonymous extension requests come here first. You approve or decline. Faculty only record what you approved."
    >
      <section>
        <p className="kicker">Anonymous extensions</p>
        {extensionInbox.length === 0 ? (
          <p className="note">No extension requests.</p>
        ) : (
          <div className="inbox">
            {extensionInbox.map((item) => {
              const course = courseById(item.courseId);
              return (
                <Link className="card row-link" href={`/counsellor/extension/${item.id}`} key={item.id}>
                  <div className="row">
                    <h2>{course.name} · {course.work}</h2>
                    <span className="muted">
                      {item.status === "pending_counsellor" ? "Awaiting you" : item.status === "pending_faculty" ? "With faculty" : item.status}
                    </span>
                  </div>
                  <p style={{ margin: 0 }}>
                    {formatDate(course.due)} → {formatDate(item.grantedUntil ?? item.askUntil)} · name sealed
                  </p>
                  <p className="muted" style={{ margin: 0 }}>{formatWhen(item.createdAt)}</p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section style={{ marginTop: 32 }}>
        <p className="kicker">Mental health days</p>
        {state.bookings.length === 0 ? (
          <p className="note">No mental health day is booked.</p>
        ) : (
          <div className="stack">
            {state.bookings.map((item) => (
              <article className="card" key={item.id}>
                <div className="row">
                  <h2>{person(item.studentId).name}</h2>
                  <span className="muted">{item.status === "attested" ? "Attested" : "Attestation pending"}</span>
                </div>
                <p style={{ margin: 0 }}>{formatDate(item.date)} · mental health day · conversation optional</p>
                {item.status === "booked" && (
                  <button className="btn primary" type="button" onClick={() => attestDay(item.id)}>Attest medical leave</button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginTop: 28 }}>
        <p className="kicker">Case file</p>
        {state.handedOver ? (
          <div className="stack">
            {state.summaries.map((item) => (
              <article className="card" key={item.id}>
                <p className="letter">{item.text}</p>
              </article>
            ))}
            {state.summaries.length === 0 && <p className="note">Handed over. No summary attached.</p>}
          </div>
        ) : (
          <p className="note">Sealed until the student hands it over.</p>
        )}
      </section>
    </Page>
  );
}
