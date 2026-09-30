"use client";

import Link from "next/link";
import { formatWhen } from "@/lib/campus";
import { useHelpo } from "@/lib/store";
import { Page, Witness } from "@/components/ui";

export default function CasePage() {
  const { state, handOver } = useHelpo();

  return (
    <Page kicker="Case file" title="Yours, until you hand it over." lede="Helpo keeps the event, not the story. Other roles cannot open this file. In this prototype the seal is enforced in the product. Password encryption on your device is the deployment step.">
      <Witness />
      <article className="card">
        <p className="case-title">Ananya Rao</p>
        <p className="muted" style={{ margin: 0 }}>24251A0568 · B.Tech CSE · II year · Odd semester</p>
        <p className="muted" style={{ margin: 0 }}>{state.handedOver ? "A copy of the attached summaries is with the counselling centre." : "No one else is holding this file."}</p>
      </article>

      <section style={{ marginTop: 22 }}>
        <p className="kicker">Attached summaries</p>
        {state.summaries.length === 0 ? (
          <p className="note">Nothing attached. A crashout summary stays out of the file unless you put it here. The rant is never stored.</p>
        ) : (
          <div className="stack">
            {state.summaries.map((item) => (
              <article className="card" key={item.id}>
                <p className="letter">{item.text}</p>
                <span className="muted">{formatWhen(item.at)}</span>
              </article>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginTop: 22 }}>
        <p className="kicker">What was witnessed</p>
        {state.ledger.length === 0 ? (
          <p className="note">No events yet. Wednesday night, before the ask.</p>
        ) : (
          <ul className="ledger">
            {state.ledger.map((line) => (
              <li key={line.id}>
                <span className="muted">{formatWhen(line.at)}</span>
                <span>{line.text}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="actions" style={{ marginTop: 22 }}>
        <button className="btn primary" type="button" onClick={handOver} disabled={state.handedOver || state.summaries.length === 0}>
          {state.handedOver ? "Handed to the counselling centre" : "Hand the file to the counselling centre"}
        </button>
        <Link className="btn ghost" href="/help">Open help instead</Link>
      </div>
      {state.summaries.length === 0 && <p className="note">Attach a summary from Crashout before handing the file over. The centre would otherwise receive an empty story.</p>}
    </Page>
  );
}
