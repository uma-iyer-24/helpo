"use client";

import Link from "next/link";
import { courseById, formatDate, formatWhen } from "@/lib/campus";
import { opaqueCaseRef } from "@/lib/cases";
import { counsellorQueue } from "@/lib/extensions";
import { matterLabel, mentorFor } from "@/lib/mentors";
import { useHelpo } from "@/lib/store";
import { Page } from "@/components/ui";

export default function CounsellorPage() {
  const { state, attestDay } = useHelpo();
  const desk = state.counsellorDesk;
  const mentor = mentorFor(desk);
  const extensionInbox = state.extensions.filter(
    (item) =>
      item.assignedDesk === desk &&
      (counsellorQueue(item.status) || item.status === "pending_faculty" || item.status === "recorded"),
  );

  return (
    <Page
      kicker={mentor.title}
      title={`${mentor.name}'s inbox.`}
      lede="Anonymous extension requests routed by topic and letter classification. Mental health days stay anonymous. Names stay off this screen."
    >
      <section>
        <p className="kicker">Anonymous extensions · {mentor.detail}</p>
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
                    {matterLabel(item.matter)} · {formatDate(course.due)} → {formatDate(item.grantedUntil ?? item.askUntil)} · name sealed
                  </p>
                  <p className="muted" style={{ margin: 0 }}>{formatWhen(item.createdAt)}</p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section style={{ marginTop: 32 }}>
        <p className="kicker">Mental health days · anonymous</p>
        {state.bookings.length === 0 ? (
          <p className="note">No mental health day is booked.</p>
        ) : (
          <div className="stack">
            {state.bookings.map((item) => (
              <article className="card" key={item.id}>
                <div className="row">
                  <h2>Anonymous booking · {opaqueCaseRef("MHD", item.id)}</h2>
                  <span className="muted">{item.status === "attested" ? "Attested" : "Attestation pending"}</span>
                </div>
                <p style={{ margin: 0 }}>{formatDate(item.date)} · mental health day · conversation optional · name sealed</p>
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
