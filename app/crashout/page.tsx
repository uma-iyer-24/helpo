"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useHelpo } from "@/lib/store";
import { Page, Witness } from "@/components/ui";

type Result = {
  regulation: string;
  summary: string;
  crisis: boolean;
  regulationLanguage: string;
};

const LANG: Record<string, string> = { te: "te-IN", hi: "hi-IN", en: "en-IN", other: "en-IN" };

export default function CrashoutPage() {
  const { attachSummary, endCrashout } = useHelpo();
  const router = useRouter();
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"idle" | "recording" | "transcribing" | "review" | "thinking" | "result">("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [summary, setSummary] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [attached, setAttached] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const timer = useRef<number | null>(null);
  const meter = useRef<number | null>(null);
  const audio = useRef<AudioContext | null>(null);

  useEffect(() => () => stopMeter(), []);

  function stopMeter() {
    if (timer.current) window.clearInterval(timer.current);
    if (meter.current) cancelAnimationFrame(meter.current);
    audio.current?.close().catch(() => undefined);
    audio.current = null;
    timer.current = null;
    meter.current = null;
  }

  async function startRecording() {
    setError(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      rec.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        stopMeter();
        const blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
        void transcribe(blob);
      };
      const context = new AudioContext();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audio.current = context;
      const bins = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(bins);
        const avg = bins.reduce((sum, value) => sum + value, 0) / bins.length;
        setLevel(avg / 180);
        meter.current = requestAnimationFrame(tick);
      };
      tick();
      setSeconds(0);
      timer.current = window.setInterval(() => {
        setSeconds((value) => {
          if (value >= 180) {
            rec.stop();
            return value;
          }
          return value + 1;
        });
      }, 1000);
      recorder.current = rec;
      rec.start();
      setPhase("recording");
    } catch {
      setError("The microphone is blocked. You can allow it in the browser, or type below.");
      setPhase("idle");
    }
  }

  function stopRecording() {
    recorder.current?.stop();
    setPhase("transcribing");
  }

  async function transcribe(blob: Blob) {
    setPhase("transcribing");
    const body = new FormData();
    body.set("audio", blob, "rant.webm");
    const response = await fetch("/api/transcribe", { method: "POST", body });
    const data = (await response.json().catch(() => null)) as { text?: string; error?: string } | null;
    if (!response.ok || !data?.text) {
      setError(data?.error === "missing_key" ? "Transcription needs the Gemini key on the server." : "The recording could not be transcribed. You can type it instead.");
      setPhase("idle");
      return;
    }
    setText(data.text);
    setPhase("review");
  }

  async function send() {
    const spoken = text.trim();
    if (!spoken) return;
    const returnPhase = phase === "review" ? "review" : "idle";
    setPhase("thinking");
    setError(null);
    setAttached(false);
    const response = await fetch("/api/crashout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: spoken }),
    });
    const data = (await response.json().catch(() => null)) as (Result & { error?: string }) | null;
    if (!response.ok || !data?.regulation) {
      setError(data?.error === "missing_key"
        ? "The letter step is unavailable until GEMINI_API_KEY is set on the server. Your words are still only on this page."
        : "The letter step did not respond. Your words are still in the box.");
      setPhase(returnPhase);
      return;
    }
    setResult(data);
    setSummary(data.summary);
    setShowSummary(!data.crisis);
    setPhase("result");
  }

  function hear() {
    if (!result) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(result.regulation);
    utterance.lang = LANG[result.regulationLanguage] ?? "en-IN";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }

  function finish() {
    window.speechSynthesis.cancel();
    endCrashout();
    setText("");
    setResult(null);
    setSummary("");
    setPhase("idle");
    setError(null);
  }

  function useInExtension() {
    sessionStorage.setItem("helpo-letter", summary);
    router.push("/extension");
  }

  return (
    <Page
      kicker="Crashout"
      title="Say it here first."
      lede="Type, or speak in whatever language comes out. Helpo is not listening until you press. You leave with a letter. The rant is wiped when the session ends."
    >
      <Witness />
      {phase !== "result" && (
        <div className="stack">
          <div className="actions">
            {phase === "recording" ? (
              <button className="btn warn" type="button" onClick={stopRecording}>Stop · {seconds}s</button>
            ) : (
              <button className="btn ghost" type="button" onClick={startRecording} disabled={phase === "transcribing" || phase === "thinking"}>
                Speak
              </button>
            )}
            <span className="muted">{phase === "recording" ? "Listening, because you pressed." : "Not listening until you press."}</span>
          </div>
          {phase === "recording" && (
            <div className="meter" aria-hidden>
              <span style={{ width: `${Math.min(100, level * 100)}%` }} />
            </div>
          )}
          {phase === "transcribing" && <p>Transcribing what you said.</p>}
          {phase === "review" && <p className="kicker">What we heard. Fix a wrong word, then send.</p>}
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="The version you would not send a professor."
            disabled={phase === "recording" || phase === "transcribing" || phase === "thinking"}
          />
          <div className="actions">
            <button className="btn primary" type="button" onClick={send} disabled={!text.trim() || phase === "thinking" || phase === "recording"}>
              {phase === "thinking" ? "Writing the letter" : "Settle, then draft"}
            </button>
            {phase === "review" && (
              <button className="btn ghost" type="button" onClick={() => { setText(""); setPhase("idle"); }}>Discard take</button>
            )}
          </div>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {phase === "result" && result && (
        <div className="stack">
          <article className={`card ${result.crisis ? "crisis" : ""}`}>
            <p className="kicker">{result.crisis ? "Stop here and call" : "To settle"}</p>
            <p style={{ margin: 0 }}>{result.regulation}</p>
            <div className="actions">
              {!result.crisis && <button className="btn ghost" type="button" onClick={hear}>Hear this</button>}
              {result.crisis && <a className="btn primary" href="tel:14416">Call 14416</a>}
            </div>
          </article>
          {result.crisis && !showSummary && (
            <button className="btn ghost" type="button" onClick={() => setShowSummary(true)}>I still want the summary</button>
          )}
          {showSummary && (
            <label>
              The letter. Edit it before it goes anywhere.
              <textarea value={summary} onChange={(event) => setSummary(event.target.value)} />
            </label>
          )}
          {showSummary && (
            <div className="actions">
              <button className="btn ghost" type="button" onClick={() => navigator.clipboard.writeText(summary)}>Copy</button>
              <button className="btn ghost" type="button" onClick={useInExtension}>Use in an extension</button>
              <button
                className="btn primary"
                type="button"
                onClick={() => { attachSummary(summary); setAttached(true); }}
              >
                {attached ? "Attached to the case file" : "Attach to case file"}
              </button>
            </div>
          )}
          <button className="btn ghost" type="button" onClick={finish}>End session and wipe</button>
          <p className="note">Ending the session clears this page. The summary remains only if you copied it or attached it. The witness log records that a session ended, not what you said.</p>
        </div>
      )}
    </Page>
  );
}
