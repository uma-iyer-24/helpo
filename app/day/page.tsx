"use client";

import { useState } from "react";
import { ANANYA, WEEK, formatDate } from "@/lib/campus";
import { useHelpo } from "@/lib/store";
import { Page, Witness } from "@/components/ui";

export default function DayPage() {
  const { state, remainingDays, bookDay } = useHelpo();
  const [selected, setSelected] = useState("2026-10-01");
  const [message, setMessage] = useState<string | null>(null);
  const chosen = WEEK.find((day) => day.date === selected) ?? WEEK[0];
  const capped = remainingDays <= 0;

  function book() {
    if (chosen.kind !== "open") return;
    const result = bookDay(chosen.date);
    if (result === "cap") setMessage("You have used 3 of 3 mental health days this semester.");
    else if (result === "booked") setMessage(`${formatDate(chosen.date)} is already booked.`);
    else setMessage(`${formatDate(chosen.date)} is booked as your mental health day. Conversation optional. Attendance will be marked as medical leave once the centre attests it.`);
  }

  return (
    <Page
      kicker="Mental health day"
      title="Take a mental health day."
      lede="No explanation required. Talking to someone is your choice. Interviews, exams, and closed days cannot be booked."
    >
      <Witness />
      <p className="note">
        {remainingDays} of 3 left. {ANANYA.name.split(" ")[0]}'s Operating Systems attendance is {ANANYA.attendance}%. An attested day is medical leave toward the existing 75% rule. The College Academic Committee still decides condonation.
      </p>
      <div className="week" style={{ marginTop: 18 }}>
        {WEEK.map((day) => (
          <button
            key={day.date}
            type="button"
            className={`day ${day.kind} ${selected === day.date ? "selected" : ""}`}
            onClick={() => { setSelected(day.date); setMessage(null); }}
          >
            <b>{formatDate(day.date).split(",")[0]}</b>
            <span>{formatDate(day.date).split(", ").slice(1).join(", ")}</span>
            <span className="muted">{day.kind === "open" ? "Open" : day.reason}</span>
          </button>
        ))}
      </div>
      <div className="actions" style={{ marginTop: 16 }}>
        <button className="btn primary" type="button" disabled={capped || chosen.kind !== "open"} onClick={book}>
          {chosen.kind === "open" ? `Book ${formatDate(chosen.date)}` : chosen.reason}
        </button>
      </div>
      {capped && <p className="error">You have used 3 of 3 mental health days. The count resets next semester.</p>}
      {message && <p>{message}</p>}

      {state.bookings.length > 0 && (
        <section style={{ marginTop: 28 }}>
          <p className="kicker">Booked</p>
          <div className="stack">
            {state.bookings.map((item) => (
              <article className="card" key={item.id}>
                <div className="row">
                  <h2>{formatDate(item.date)}</h2>
                  <span className="muted">{item.status === "attested" ? "Medical leave attested" : "Waiting for attestation"}</span>
                </div>
                <p className="muted" style={{ margin: 0 }}>Mental health day · conversation optional</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </Page>
  );
}
