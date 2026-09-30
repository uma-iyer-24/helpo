"use client";

import Link from "next/link";
import { ANANYA, CAP, courseById, formatDate } from "@/lib/campus";
import { extensionStudentLabel } from "@/lib/extensions";
import { useHelpo } from "@/lib/store";
import { Page, Stagger, StaggerItem } from "@/components/ui";

const STEPS = [
  ["Extension", "Ask counselling first, anonymously. If they approve, faculty must record the date."],
  ["Mental health day", "Take a mental health day. You do not have to talk to anyone. Exams and interviews stay blocked."],
  ["Help", "Contact Ms. Counsellor on campus. Helpo does not turn that into a chat."],
  ["Crashout bot", "Feel free to crashout here and collect your thoughts. Leave with a letter for the next step. The rant is wiped."],
  ["Case file", "The story stays with you. Teams see the action they need to take, and the file only if you hand it over."],
];

const DOORS = [
  { href: "/extension", icon: "◐", title: "Ask for time, without your name.", body: "Counselling reads your letter anonymously. Faculty only record what was approved." },
  { href: "/day", icon: "◯", title: "Take a mental health day.", body: "Medical leave. Conversation optional. No questions asked." },
  { href: "/help", icon: "☎", title: "Talk to a person whose job this is.", body: "Contact Ms. Counsellor · Ph: XXXXXXXX" },
  {
    href: "/crashout",
    icon: "◎",
    title: "Crashout bot",
    body: "Feel free to crashout here, to collect your thoughts for the next course of action.",
  },
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
      <p className="hero-chip">
        <span className="witness-dot" />
        Operating Systems attendance {ANANYA.attendance}% · one absence hits the 75% line
      </p>

      <Stagger className="doors" style={{ marginTop: 22 }}>
        {DOORS.map((door) => (
          <StaggerItem key={door.href}>
            <Link className="door" href={door.href}>
              <span className="door-icon" aria-hidden>{door.icon}</span>
              <span className="door-copy">
                <strong>{door.title}</strong>
                <span>{door.body}</span>
              </span>
              <span className="door-arrow" aria-hidden>→</span>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>

      {mine.length > 0 && (
        <section style={{ marginTop: 32 }}>
          <p className="kicker">In motion</p>
          <Stagger className="stack">
            {mine.map((item) => {
              const course = courseById(item.courseId);
              const due = formatDate(item.grantedUntil ?? item.askUntil);
              return (
                <StaggerItem key={item.id}>
                  <article className="card">
                    <div className="row">
                      <h2>{course.name}</h2>
                      <span className="pill pending">{item.status.replace(/_/g, " ")}</span>
                    </div>
                    <p className="muted" style={{ margin: 0 }}>
                      {extensionStudentLabel(item.status)}
                      {item.status !== "declined" && ` · ${due}`}
                      {item.status === "declined" && item.declineNote ? ` · ${item.declineNote}` : ""}
                    </p>
                  </article>
                </StaggerItem>
              );
            })}
          </Stagger>
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
