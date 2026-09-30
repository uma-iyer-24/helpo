"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createBrowserSpeech, recordingToWav, type BrowserSpeech } from "@/lib/audio-client";
import { CAMPUS_COUNSELLOR } from "@/lib/campus";
import { useHelpo } from "@/lib/store";
import { TranscribeWait } from "@/components/TranscribeWait";
import { Page, Witness } from "@/components/ui";

type Result = {
  regulation: string;
  summary: string;
  crisis: boolean;
  regulationLanguage: string;
  fallback?: boolean;
  fallbackReason?: string;
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
  const [voiceMode, setVoiceMode] = useState<"browser" | "cloud" | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const speech = useRef<BrowserSpeech | null>(null);
  const timer = useRef<number | null>(null);
  const meter = useRef<number | null>(null);
  const audio = useRef<AudioContext | null>(null);

  useEffect(() => () => {
    stopMeter();
    speech.current?.abort();
  }, []);

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

    const browserSpeech = createBrowserSpeech(
      (partial) => setText(partial),
      (final) => {
        stopMeter();
        speech.current = null;
        if (final) {
          setText(final);
          setPhase("review");
        } else {
          setError("No speech was detected. Try again or type below.");
          setPhase("idle");
        }
        setVoiceMode(null);
      },
      (message) => setError(message),
    );

    if (browserSpeech) {
      speech.current = browserSpeech;
      setVoiceMode("browser");
      setSeconds(0);
      timer.current = window.setInterval(() => setSeconds((value) => value + 1), 1000);
      browserSpeech.start();
      setPhase("recording");
      return;
    }

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
      setVoiceMode("cloud");
      rec.start();
      setPhase("recording");
    } catch {
      setError("The microphone is blocked. You can allow it in the browser, or type below.");
      setPhase("idle");
    }
  }

  function stopRecording() {
    if (speech.current) {
      setPhase("transcribing");
      speech.current.stop();
      return;
    }
    recorder.current?.stop();
    setPhase("transcribing");
  }

  async function transcribe(blob: Blob) {
    setPhase("transcribing");
    setVoiceMode("cloud");
    try {
      const wav = await recordingToWav(blob);
      const body = new FormData();
      body.set("audio", wav, "rant.wav");
      const response = await fetch("/api/transcribe", { method: "POST", body });
      const data = (await response.json().catch(() => null)) as {
        text?: string;
        hint?: string;
        detail?: string;
      } | null;
      const transcript = data?.text?.trim();
      if (transcript) {
        setText(transcript);
        setPhase("review");
        setError(null);
        return;
      }
      setError(data?.hint ?? "The recording could not be transcribed. Type what you said below.");
      if (data?.detail && process.env.NODE_ENV === "development") {
        console.info("transcribe detail:", data.detail);
      }
      setPhase("idle");
    } catch {
      setError("Could not convert the recording. Type what you said below.");
      setPhase("idle");
    }
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
      setError("The letter step did not respond. Your words are still in the box.");
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
    speech.current?.abort();
    endCrashout();
    setText("");
    setResult(null);
    setSummary("");
    setPhase("idle");
    setError(null);
    setVoiceMode(null);
  }

  function useInExtension() {
    sessionStorage.setItem("helpo-letter", summary);
    router.push("/extension");
  }

  return (
    <Page
      kicker="Crashout bot"
      title="Feel free to crashout here."
      lede="Collect your thoughts for the next course of action. Type or speak in whatever language comes out. Helpo is not listening until you press. The rant is wiped when the session ends."
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
            <span className="muted">
              {phase === "recording"
                ? voiceMode === "browser"
                  ? "Listening in the browser (Chrome works best)."
                  : "Listening — will send as WAV for transcription."
                : "Not listening until you press."}
            </span>
          </div>
          {phase === "recording" && voiceMode === "cloud" && (
            <div className="meter" aria-hidden>
              <span style={{ width: `${Math.min(100, level * 100)}%` }} />
            </div>
          )}
          {phase === "transcribing" && <TranscribeWait />}
          {phase === "review" && <p className="kicker">What we heard. Fix a wrong word, then send.</p>}
          <textarea
            className={phase === "transcribing" && !text.trim() ? "transcribing" : undefined}
            value={text}
            readOnly={phase === "transcribing"}
            onChange={(event) => setText(event.target.value)}
            placeholder={
              phase === "transcribing"
                ? "Your words will appear here in a moment…"
                : "The version you would not send a professor."
            }
            disabled={phase === "recording" || phase === "thinking"}
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
          {result.fallback && (
            <p className="hero-chip">
              Drafted on-device — Gemini was unavailable. Edit the letter before you send it.
            </p>
          )}
          <article className={`card ${result.crisis ? "crisis" : ""}`}>
            <p className="kicker">{result.crisis ? "Stop here and call" : "To settle"}</p>
            <p style={{ margin: 0 }}>{result.regulation}</p>
            <div className="actions">
              {!result.crisis && <button className="btn ghost" type="button" onClick={hear}>Hear this</button>}
              {result.crisis && (
                <a className="btn primary" href={CAMPUS_COUNSELLOR.tel}>
                  Call {CAMPUS_COUNSELLOR.name}
                </a>
              )}
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
