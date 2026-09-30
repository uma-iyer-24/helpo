"use client";

import Link from "next/link";
import { adminCases, adminStats, formatCaseWhen } from "@/lib/cases";
import { useHelpo } from "@/lib/store";
import { Page } from "@/components/ui";

export default function AdminPage() {
  const { state } = useHelpo();
  const cases = adminCases(state);
  const stats = adminStats(state);

  return (
    <Page
      kicker="College administration"
      title="Case overview."
      lede="Every row is an action on the trust ledger. Routing and status only. Student names, letters, crashout text, and case-file bodies stay in the encrypted file the student holds."
    >
      <div className="stats">
        <div className="stat">
          <b>{stats.total}</b>
          <span>Open cases on the ledger</span>
        </div>
        <div className="stat">
          <b>{stats.pending}</b>
          <span>Awaiting assignee</span>
        </div>
        <div className="stat">
          <b>{stats.closed}</b>
          <span>Closed without decline</span>
        </div>
        <div className="stat">
          <b>{stats.declined}</b>
          <span>Declined · identity sealed</span>
        </div>
      </div>

      <p className="note">
        Helpo witnesses events. It does not store the story. Assignees see what their job requires. Admin sees whether the system is moving, not why.
      </p>

      {cases.length === 0 ? (
        <p className="muted">No cases yet. Reset demo or walk through as Ananya Rao.</p>
      ) : (
        <div className="table-wrap">
          <table className="overview">
            <thead>
              <tr>
                <th>Case</th>
                <th>Type</th>
                <th>Routed to</th>
                <th>Status</th>
                <th>Identity</th>
                <th>Opened</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link href={`/admin/${item.id}`}>{item.ref}</Link>
                  </td>
                  <td>{item.kindLabel}</td>
                  <td>{item.routedTo}</td>
                  <td>
                    <span className={`pill ${item.statusKey}`}>{item.status}</span>
                  </td>
                  <td className="muted">{item.sealLabel}</td>
                  <td className="muted">{formatCaseWhen(item.openedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <section style={{ marginTop: 28 }}>
        <p className="kicker">What admin cannot open</p>
        <ul className="plain">
          <li>Crashout sessions and audio transcripts</li>
          <li>Extension letters and decline reasons beyond assignee channels</li>
          <li>Attached summaries inside the encrypted case file</li>
          <li>Tele-MANAS or helpline calls</li>
        </ul>
      </section>
    </Page>
  );
}
