import Link from "next/link";
import { Page } from "@/components/ui";

export default function HelpPage() {
  return (
    <Page
      kicker="Professional help"
      title="A person, not another chat."
      lede="These lines are staffed by people. Helpo does not listen to the call, and it does not write the call onto your case."
    >
      <div className="stack">
        <article className="card">
          <p className="kicker">24×7 · free · your language</p>
          <a className="help-number" href="tel:14416">14416</a>
          <p style={{ margin: 0 }}>Tele-MANAS. Also 1800-891-4416.</p>
        </article>
        <article className="card crisis">
          <p className="kicker">Immediate physical danger</p>
          <a className="help-number" href="tel:112">112</a>
        </article>
        <article className="card">
          <h2>On campus</h2>
          <p style={{ margin: 0 }}>Student Counselling Centre, Room Admin-Gr22, GNITS Shaikpet. You can hold a mental health day there without a session.</p>
          <Link href="/day">Book the room</Link>
        </article>
      </div>
    </Page>
  );
}
