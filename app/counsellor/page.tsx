"use client";

import { ANANYA, courseById, formatDate } from "@/lib/campus";
import { useHelpo } from "@/lib/store";
import { Page } from "@/components/ui";

export default function CounsellorPage() {
  const { state, attestDay } = useHelpo();
  const moved = state.extensions.filter((item) => item.studentId === "ananya" && item.status === "granted");

  return (
    <Page
      kicker="Admin-Gr22"
      title="Today at the centre."
      lede="You see who has the room, and that conversation is optional. You do not see why, and you do not see an extension letter unless she hands you the file."
    >
      {moved.length > 0 && (
        <div className="stack" style={{ marginBottom: 18 }}>
          {moved.map((item) => (
            <p className="card" key={item.id} style={{ margin: 0 }}>
              {courseById(item.courseId).name} deadline moved to {formatDate(item.grantedUntil ?? item.askUntil)}. The letter was not shared.
            </p>
          ))}
        </div>
      )}

      {state.bookings.length === 0 ? (
        <p className="note">No mental health day is booked.</p>
      ) : (
        <div className="stack">
          {state.bookings.map((item) => (
            <article className="card" key={item.id}>
              <div className="row">
                <h2>{ANANYA.name}</h2>
                <span className="muted">{item.status === "attested" ? "Attested" : "Attestation pending"}</span>
              </div>
              <p style={{ margin: 0 }}>{formatDate(item.date)} · Admin-Gr22 · conversation optional</p>
              <p className="note">No reason was asked, and none is shown. Attesting writes medical leave. The College Academic Committee still condones shortage through its own process.</p>
              {item.status === "booked" && (
                <button className="btn primary" type="button" onClick={() => attestDay(item.id)}>Attest medical leave</button>
              )}
            </article>
          ))}
        </div>
      )}

      <section style={{ marginTop: 28 }}>
        <p className="kicker">Case file</p>
        {state.handedOver ? (
          <div className="stack">
            {state.summaries.map((item) => (
              <article className="card" key={item.id}>
                <p className="letter">{item.text}</p>
              </article>
            ))}
            {state.summaries.length === 0 && <p className="note">She handed the file over. No summary was attached.</p>}
          </div>
        ) : (
          <p className="note">Sealed. Identity can be checked for a booking. The body is not readable unless Ananya hands it over.</p>
        )}
      </section>
    </Page>
  );
}
