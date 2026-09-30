"use client";

import { useEffect, useState } from "react";
import { CAP, COURSES, courseById, formatDate, formatWhen } from "@/lib/campus";
import { extensionStudentLabel } from "@/lib/extensions";
import { assignExtensionDesk, MATTER_OPTIONS, matterLabel, mentorFor } from "@/lib/mentors";
import { useHelpo } from "@/lib/store";
import type { ExtensionMatter } from "@/lib/types";
import { Page, Witness } from "@/components/ui";

export default function ExtensionPage() {
  const { state, remainingExtensions, requestExtension } = useHelpo();
  const [courseId, setCourseId] = useState<"os" | "cn">("os");
  const [matter, setMatter] = useState<ExtensionMatter>("academic");
  const [askUntil, setAskUntil] = useState(COURSES[0].askDefault);
  const [letter, setLetter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const draft = sessionStorage.getItem("helpo-letter");
    if (draft) {
      setLetter(draft);
      sessionStorage.removeItem("helpo-letter");
    }
  }, []);

  const course = courseById(courseId);
  const mine = state.extensions.filter((item) => item.studentId === "ananya");
  const capped = remainingExtensions <= 0;
  const routePreview = letter.trim() ? assignExtensionDesk(matter, letter) : null;
  const routedMentor = routePreview ? mentorFor(routePreview.assignedDesk) : mentorFor(matter);

  function chooseCourse(id: "os" | "cn") {
    setCourseId(id);
    setAskUntil(courseById(id).askDefault);
  }

  function submit() {
    const result = requestExtension({ courseId, matter, letter, askUntil });
    if (result === "cap") setError("You have used 3 of 3 extensions this semester. This one cannot be sent. The count resets next semester.");
    else if (result === "empty") setError("Write the request, or bring in the summary from Crashout bot.");
    else {
      setError(null);
      setSent(true);
      setLetter("");
    }
  }

  return (
    <Page
      kicker="Extension"
      title="Ask for time, without your name."
      lede="Your letter goes to the counselling centre first, anonymously. If they approve, faculty are required to record the new date. Your name is released only when faculty record it."
    >
      <Witness />
      <p className="note">{remainingExtensions} of {CAP} left this semester. An exam cannot be extended here.</p>

      {capped ? (
        <p className="error">You have used 3 of 3 extensions this semester. The count resets next semester.</p>
      ) : (
        <div className="stack" style={{ marginTop: 18 }}>
          <div className="stack">
            {COURSES.map((item) => (
              <button
                key={item.id}
                type="button"
                className="card"
                onClick={() => chooseCourse(item.id)}
                style={item.id === courseId ? { borderColor: "var(--green)", background: "var(--green-soft)" } : undefined}
              >
                <div className="row">
                  <h2>{item.name}</h2>
                  <span className="muted">Due {formatDate(item.due)}</span>
                </div>
                <span className="muted">{item.work}</span>
              </button>
            ))}
          </div>
          <label>
            What is this about?
            <select value={matter} onChange={(event) => setMatter(event.target.value as ExtensionMatter)}>
              {MATTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <p className="note" style={{ marginTop: -8 }}>
            Helpo routes to {routedMentor.title} ({routedMentor.name}).
            {routePreview?.adjusted && (
              <> Your letter reads more like {matterLabel(routePreview.assignedDesk).split(" ·")[0]} — we assigned {routedMentor.title}.</>
            )}
          </p>
          <label>
            Move it to
            <input type="date" value={askUntil} min={course.due} onChange={(event) => setAskUntil(event.target.value)} />
          </label>
          <label>
            The letter
            <textarea value={letter} onChange={(event) => setLetter(event.target.value)} placeholder="What needs to move, and by how much." />
          </label>
          <div className="actions">
            {state.summaries[0] && (
              <button className="btn ghost" type="button" onClick={() => setLetter(state.summaries[0].text)}>
                Use latest summary
              </button>
            )}
            <button className="btn primary" type="button" onClick={submit}>Send to counselling, name sealed</button>
          </div>
          {error && <p className="error">{error}</p>}
          {sent && <p>Sent to counselling. Your name is sealed.</p>}
        </div>
      )}

      {mine.length > 0 && (
        <section style={{ marginTop: 32 }}>
          <p className="kicker">Your requests</p>
          <div className="stack">
            {mine.map((item) => {
              const itemCourse = courseById(item.courseId);
              return (
                <article className="card" key={item.id}>
                  <div className="row">
                    <h2>{itemCourse.name} · {itemCourse.work}</h2>
                    <span className="muted">{formatWhen(item.createdAt)}</span>
                  </div>
                  <p className="letter">{item.letter}</p>
                  <p className="muted">
                    {matterLabel(item.matter)} · {mentorFor(item.assignedDesk).title} · {extensionStudentLabel(item.status)}
                  </p>
                  {item.status === "recorded" && <p>Due {formatDate(item.grantedUntil ?? item.askUntil)}.</p>}
                  {item.status === "declined" && <p>{item.declineNote}</p>}
                </article>
              );
            })}
          </div>
        </section>
      )}
    </Page>
  );
}
