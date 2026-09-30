"use client";

import Link from "next/link";
import { ANANYA, CAP, courseById, formatDate } from "@/lib/campus";
import { useHelpo } from "@/lib/store";
import { Page } from "@/components/ui";

const STEPS = [
  ["Extension", "Ask for time without your name. It is released only if the faculty grants it."],
  ["Mental health day", "A screen-free day in Admin-Gr22. You do not have to talk. Exams and interviews stay blocked."],
  ["Help", "Tele-MANAS is a person on 14416. Helpo does not turn that into a chat."],
  ["Crashout", "Say it here first, by text or voice. Leave with a letter you can send. The rant is wiped."],
  ["Case file", "The story stays with you. Teams see the action they need to take, and the file only if you hand it over."],
];

export default function HomePage() {
  const { state, remainingExtensions, remainingDays, dismissTutorial } = useHelpo();
  const mine = state.extensions.filter((item) => item.studentId === "ananya");
  const step = state.tutorialSeen ? -1 : 0;

  return (
    <Page
      kicker={`${ANANYA.year} ${ANANYA.programme} · Wednesday 30 Sep`}
      title="What do you need this week?"
      lede={`Extensions ${remainingExtensions} of ${CAP} · Mental health days ${remainingDays} of ${CAP}`}
    >
      <p className="note">
        Operating Systems attendance is {ANANYA.attendance}%. An unmarked absence drops it under the 75% line.
      </p>
      <div className="doors" style={{ marginTop: 22 }}>
        <Link className="door" href="/extension">
          <strong>Ask for time, without your name.</strong>
          <span>An extension, sealed until a faculty member grants it.</span>
        </Link>
        <Link className="door" href="/day">
          <strong>Take a day in Admin-Gr22.</strong>
          <span>Medical leave. Conversation optional. The room is the boundary.</span>
        </Link>
        <Link className="door" href="/help">
          <strong>Talk to a person whose job this is.</strong>
          <span>Tele-MANAS, 14416. On campus, the counselling centre.</span>
        </Link>
        <Link className="door" href="/crashout">
          <strong>Say it here first.</strong>
          <span>Leave with something you can send. In your language, typed or spoken.</span>
        </Link>
      </div>

      {mine.length > 0 && (
        <section style={{ marginTop: 28 }}>
          <p className="kicker">In motion</p>
          <div className="stack">
            {mine.map((item) => {
              const course = courseById(item.courseId);
              const due = item.status === "granted" && item.grantedUntil ? formatDate(item.grantedUntil) : formatDate(item.askUntil);
              return (
                <article className="card" key={item.id}>
                  <div className="row">
                    <h2>{course.name}</h2>
                    <span className="muted">{item.status}</span>
                  </div>
                  <p className="muted" style={{ margin: 0 }}>
                    {item.status === "granted" && "Your faculty can see your name now. Due "}
                    {item.status === "pending" && "Your name is still sealed. Asked until "}
                    {item.status === "declined" && "Your name stayed sealed. "}
                    {item.status !== "declined" && due}
                    {item.status === "declined" && item.declineNote}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {step === 0 && (
        <section className="tutorial">
          <p className="kicker">Tutorial</p>
          <div className="stack">
            {STEPS.map(([title, body]) => (
              <p key={title} style={{ margin: 0 }}>
                <b>{title}. </b>
                {body}
              </p>
            ))}
          </div>
          <div className="actions" style={{ marginTop: 14 }}>
            <button className="btn primary" type="button" onClick={dismissTutorial}>Continue</button>
          </div>
        </section>
      )}
    </Page>
  );
}
