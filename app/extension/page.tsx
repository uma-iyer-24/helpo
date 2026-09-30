"use client";

import { useEffect, useState } from "react";
import { CAP, COURSES, courseById, formatDate, formatWhen } from "@/lib/campus";
import { useHelpo } from "@/lib/store";
import { Page, Witness } from "@/components/ui";

export default function ExtensionPage() {
  const { state, remainingExtensions, requestExtension } = useHelpo();
  const [courseId, setCourseId] = useState<"os" | "cn">("os");
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

  function chooseCourse(id: "os" | "cn") {
    setCourseId(id);
    setAskUntil(courseById(id).askDefault);
  }

  function submit() {
    const result = requestExtension({ courseId, letter, askUntil });
    if (result === "cap") setError("You have used 3 of 3 extensions this semester. This one cannot be sent. The count resets next semester.");
    else if (result === "empty") setError("Write the request, or bring in the summary from Crashout.");
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
      lede="Faculty see the course and this letter. Your name appears only if they grant it, because that is when they need it to move the date."
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
            <button className="btn primary" type="button" onClick={submit}>Send, name sealed</button>
          </div>
          {error && <p className="error">{error}</p>}
          {sent && <p>Sent. Your name is sealed until this is granted.</p>}
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
                  {item.status === "pending" && <p className="muted">Waiting. Your name is still sealed. Asked until {formatDate(item.askUntil)}.</p>}
                  {item.status === "granted" && <p>Granted. Due {formatDate(item.grantedUntil ?? item.askUntil)}. Your faculty can see your name now.</p>}
                  {item.status === "declined" && <p>Declined. Your name stayed sealed. {item.declineNote}</p>}
                </article>
              );
            })}
          </div>
        </section>
      )}
    </Page>
  );
}
