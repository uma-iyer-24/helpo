"use client";

import { Mermaid } from "@/components/Mermaid";
import { Page } from "@/components/ui";

const ARCHITECTURE = `
flowchart TB
  subgraph client [Student client]
    CF[Case file ciphertext plus student password]
    SESS[Helpo session UI]
  end

  subgraph ledger [Helpo trust ledger]
    ID[Identity seal verify hash only]
    WIT[Append-only witness log]
    RBV[Role-scoped case views]
  end

  subgraph infer [Crashout inference enclave]
    LOCAL[On-prem small language model]
    EPHEM[Session RAM only no disk]
  end

  subgraph teams [Case assignees]
    COUN[Counselling centre]
    FAC[Course faculty mandated record]
    ADM[College admin metadata only]
  end

  CF -->|Unlock locally| SESS
  SESS -->|Present seal not plaintext| ID
  ID --> WIT
  WIT --> RBV
  RBV --> COUN
  RBV --> FAC
  RBV --> ADM
  SESS -->|Current turn text or WAV| LOCAL
  LOCAL --> EPHEM
  LOCAL -->|Regulation plus summary| SESS
  SESS -->|Optional attach summary| CF
  CF -->|Explicit handover| COUN
`;

const SEQUENCE = `
sequenceDiagram
  participant S as Student
  participant D as Device
  participant L as Trust ledger
  participant M as On-prem Crashout bot
  participant C as Counselling
  participant F as Faculty

  S->>D: Unlock case file password
  D->>L: Identity proof plus content hash
  Note over L: Ciphertext never ingested
  S->>D: Crashout rant text or speech
  D->>M: Single session payload
  M-->>D: Regulation plus draft summary
  S->>D: End Crashout session
  Note over D,M: Rant audio and model state wiped
  S->>L: Extension letter routed to counselling
  L->>C: Anonymous request plus course
  C->>L: Approve new date
  L->>F: Mandated record no narrative body
  F->>L: Record deadline name for register
  S->>L: Mental health day booking
  L->>C: Anonymous booking opaque ref conversation optional
  C->>L: Attest medical leave
  S->>C: Optional handover of case file
`;

const CASE_STATE = `
stateDiagram-v2
  [*] --> Sealed: Student holds case file
  Sealed --> SessionOpen: Present identity seal
  SessionOpen --> WitnessAppended: Action committed
  WitnessAppended --> SessionOpen: Another action
  SessionOpen --> Sealed: Session closed file returned
  WitnessAppended --> Handover: Student confirms release
  Handover --> AssigneeRead: Counsellor decrypts copy
`;

export default function WhyPage() {
  return (
    <div className="why-doc">
      <Page
        kicker="Why Helpo"
        title="Joined-up case management for student welfare."
        lede="Helpo is not a wellness chatbot or a mood dashboard. It is a case management layer: one student-owned record, role-scoped assignee views, and an append-only trust ledger that coordinates counselling, faculty, and administration without centralizing private narrative."
      >
        <div className="why">
          <section>
            <h2>The week is the case.</h2>
            <p>
              Deadlines, attendance, and exams turn acute stress into academic risk. GNITS already has counselling,
              proctors, and welfare committees. The missing piece is a <strong>case protocol</strong> that lets a student
              act this week without performing distress in front of the person who grades them.
            </p>
          </section>

          <section>
            <h2>System category</h2>
            <p>
              Helpo implements <strong>joined-up case management</strong>: multiple assignees (counselling, faculty,
              administration) work from synchronized <em>operational cases</em>, while the student retains a separate
              <em> encrypted case file</em> that holds narrative, letters, and Crashout output. The ledger stores
              events and routing metadata, not psychotherapy notes and not raw rants.
            </p>
            <ul className="plain">
              <li><strong>Case file</strong> — student-owned, encrypted, portable.</li>
              <li><strong>Case instance</strong> — one welfare action (extension, mental health day, handover).</li>
              <li><strong>Witness event</strong> — append-only log line (who acted, what changed, not why).</li>
              <li><strong>Shared view</strong> — assignee-specific fields derived from witness events.</li>
            </ul>
          </section>

          <section>
            <h2>Architecture overview</h2>
            <p>
              Helpo sits as a <strong>trust ledger</strong> between the student client and campus assignees. It verifies
              identity from a cryptographic seal, appends witness events, and projects role-scoped views. It is deliberately
              <strong> not</strong> the system of record for clinical notes or faculty email archives.
            </p>
            <Mermaid chart={ARCHITECTURE} />
          </section>

          <section>
            <h2>Case file management</h2>
            <h3>Encryption and custody</h3>
            <p>
              The case file is encrypted on the student device with a password only the student knows (target: AES-GCM
              or equivalent, key derived via a slow KDF such as Argon2id). Helpo may store <strong>ciphertext only</strong>
              if the student opts in; operators cannot decrypt without the password.
            </p>
            <h3>Seal at session open</h3>
            <p>
              Each session begins with a <strong>sealed presentation</strong>: a signed identity assertion plus a hash of
              the ciphertext. The ledger checks continuity (same student file) without receiving plaintext. This is how
              welfare actions become attributable in the audit trail while narrative stays off-server.
            </p>
            <h3>Append-only witness log</h3>
            <p>
              Every committed action writes a witness line: extension requested, counselling approved, faculty recorded,
              mental health day attested, Crashout session ended. Lines are <strong>insert-only</strong> in the product
              model; corrections are new compensating events, not silent edits. Production deployments can hash-chain
              witness lines for tamper evidence.
            </p>
            <h3>Handover</h3>
            <p>
              Narrative crosses an assignee boundary only when the student confirms <strong>handover</strong>. That event
              is itself logged. Counselling may then read attachments the student chose to include (for example a Crashout
              summary), not the full history of every prior session.
            </p>
            <Mermaid chart={CASE_STATE} />
          </section>

          <section>
            <h2>Session sequence (extension + welfare day)</h2>
            <p>
              Extensions are case-managed through counselling first: anonymous narrative to the centre, approval, then a
              <strong> mandated faculty record</strong> with no letter body on the faculty screen. Mental health days are
              a separate case type with attestation and medical-leave projection to faculty without a reason field.
            </p>
            <Mermaid chart={SEQUENCE} />
          </section>

          <section>
            <h2>Case types and routing</h2>
            <div className="table-wrap">
              <table className="overview tech">
                <thead>
                  <tr>
                    <th>Case type</th>
                    <th>First assignee</th>
                    <th>Student identity</th>
                    <th>Narrative on assignee UI</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Anonymous extension</td>
                    <td>Counselling centre</td>
                    <td>Sealed until faculty record step</td>
                    <td>Letter at counselling; faculty see approved date only</td>
                  </tr>
                  <tr>
                    <td>Mental health day</td>
                    <td>Counselling centre</td>
                    <td>Sealed on centre UI; opaque case ref only</td>
                    <td>No reason collected or displayed</td>
                  </tr>
                  <tr>
                    <td>Crashout bot session</td>
                    <td>None (student-only)</td>
                    <td>Not logged to assignees</td>
                    <td>Summary only if student attaches or sends extension</td>
                  </tr>
                  <tr>
                    <td>Case file handover</td>
                    <td>Counselling (optional)</td>
                    <td>Student-initiated release</td>
                    <td>Attachments student included</td>
                  </tr>
                  <tr>
                    <td>Admin oversight</td>
                    <td>College administration</td>
                    <td>Opaque file seal only</td>
                    <td>Routing, status, timestamps — no bodies</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2>Role-based information boundaries</h2>
            <div className="table-wrap">
              <table className="overview tech">
                <thead>
                  <tr>
                    <th>Data class</th>
                    <th>Student</th>
                    <th>Counselling</th>
                    <th>Faculty</th>
                    <th>Admin</th>
                    <th>Crashout bot</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Raw rant / audio</td>
                    <td>During session only</td>
                    <td>No</td>
                    <td>No</td>
                    <td>No</td>
                    <td>Session RAM only</td>
                  </tr>
                  <tr>
                    <td>Extension letter</td>
                    <td>Yes</td>
                    <td>While reviewing</td>
                    <td>No (mandated record)</td>
                    <td>No</td>
                    <td>No</td>
                  </tr>
                  <tr>
                    <td>Witness metadata</td>
                    <td>Yes</td>
                    <td>Relevant rows</td>
                    <td>Relevant rows</td>
                    <td>All cases</td>
                    <td>No ledger access</td>
                  </tr>
                  <tr>
                    <td>Encrypted case file</td>
                    <td>Full</td>
                    <td>After handover</td>
                    <td>No</td>
                    <td>No</td>
                    <td>No</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2>Crashout bot: local inference and AI boundaries</h2>
            <p>
              Crashout bot is a <strong>single-purpose inference service</strong>, not a general counsellor. Target
              deployment: a <strong>small language model on premises</strong> (college VPC or dedicated GPU host) with
              no outbound retention and no fine-tuning on student data.
            </p>
            <ul className="plain">
              <li><strong>Allowed:</strong> short regulation copy; factual summary in the student&apos;s voice for paste into an extension.</li>
              <li><strong>Refused:</strong> advice on whether to ask, exam strategy, diagnosis, medication, or self-harm planning.</li>
              <li><strong>Isolation:</strong> the model does not read the ledger, faculty inboxes, or sealed case files.</li>
              <li><strong>Ephemeral:</strong> session state discarded on end; only an attached summary persists, by student choice.</li>
            </ul>
            <h3>Data security with AI</h3>
            <p>
              Minimization is enforced in three layers: (1) the client never sends the case file to the model; (2) the
              server route accepts only the current turn (text or converted WAV) and does not write prompts or completions
              to a database; (3) assignee systems receive summaries only through explicit student action. Voice may use
              browser speech recognition first; cloud transcription is optional and uses the same ephemeral contract.
            </p>
            <p className="note">
              When Gemini is unavailable, Helpo falls back to deterministic on-server drafting so demos and outages do
              not block welfare workflows. That fallback is labeled in the UI.
            </p>
          </section>

          <section>
            <h2>Security properties (expert checklist)</h2>
            <ul className="plain">
              <li><strong>Least privilege:</strong> each role UI is generated from a fixed schema; no cross-role API to open case bodies.</li>
              <li><strong>Student agency:</strong> handover, attachment, and extension send are explicit confirmations.</li>
              <li><strong>Bias containment:</strong> faculty cannot decline a counselling-approved extension in-product; they record.</li>
              <li><strong>Auditability:</strong> witness log supports “what happened” without storing “what she said in therapy.”</li>
              <li><strong>Fail-safe welfare:</strong> helpline and 112 are out-of-band; not logged on the shared case view.</li>
            </ul>
          </section>

          <section>
            <h2>This prototype vs production deployment</h2>
            <div className="table-wrap">
              <table className="overview tech">
                <thead>
                  <tr>
                    <th>Capability</th>
                    <th>Prototype (this repo)</th>
                    <th>Production target</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Case state</td>
                    <td>Browser localStorage demo store</td>
                    <td>Server ledger + student ciphertext vault</td>
                  </tr>
                  <tr>
                    <td>Case file crypto</td>
                    <td>Sealed UX; encryption step documented</td>
                    <td>Password-based client encryption</td>
                  </tr>
                  <tr>
                    <td>Crashout bot</td>
                    <td>API route; optional cloud Gemini + offline fallback</td>
                    <td>On-prem model, no egress of rant text</td>
                  </tr>
                  <tr>
                    <td>Authentication</td>
                    <td>Preview-as role switch for pitch</td>
                    <td>College SSO + assignee RBAC</td>
                  </tr>
                  <tr>
                    <td>Admin case overview</td>
                    <td>Metadata table, no PII bodies</td>
                    <td>Same principle, backed by ledger DB</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2>What changes when it works</h2>
            <p>
              A deadline moves through counselling and faculty record. A mental health day is attested without an intake
              essay. A student can crash out in her own language and still produce a professional letter. Administration
              can see that the system is moving without reading why. That is case management with privacy built in, not
              despite it.
            </p>
          </section>
        </div>
      </Page>
    </div>
  );
}
