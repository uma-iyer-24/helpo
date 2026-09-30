import Link from "next/link";
import { CAMPUS_COUNSELLOR } from "@/lib/campus";
import { Page } from "@/components/ui";

export default function HelpPage() {
  return (
    <Page
      kicker="Professional help"
      title="A person, not another chat."
      lede="Call someone on campus. Helpo does not listen to the call, and it does not write the call onto your case."
    >
      <div className="stack">
        <article className="card">
          <p className="kicker">On campus · GNITS</p>
          <p style={{ margin: "0 0 12px", fontSize: "1.08rem" }}>
            Contact <b>{CAMPUS_COUNSELLOR.name}</b>
            {" · "}
            Ph:{" "}
            <a className="help-inline" href={CAMPUS_COUNSELLOR.tel}>
              {CAMPUS_COUNSELLOR.phone}
            </a>
          </p>
        </article>
        <article className="card crisis">
          <p className="kicker">Immediate physical danger</p>
          <a className="help-number" href="tel:112">112</a>
        </article>
        <article className="card">
          <h2>Need a day, not a call?</h2>
          <p style={{ margin: 0 }}>Take a mental health day through Helpo. No explanation required.</p>
          <Link href="/day">Take a mental health day</Link>
        </article>
      </div>
    </Page>
  );
}
