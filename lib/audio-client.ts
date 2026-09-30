/** Encode AudioBuffer as 16-bit PCM WAV for Gemini (supported mime). */
function encodeWav(audioBuffer: AudioBuffer): ArrayBuffer {
  const channel = audioBuffer.numberOfChannels > 1
    ? mixDown(audioBuffer)
    : audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const bytesPerSample = 2;
  const blockAlign = bytesPerSample;
  const dataSize = channel.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < channel.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, channel[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }
  return buffer;
}

function mixDown(audioBuffer: AudioBuffer) {
  const length = audioBuffer.length;
  const out = new Float32Array(length);
  for (let c = 0; c < audioBuffer.numberOfChannels; c += 1) {
    const channel = audioBuffer.getChannelData(c);
    for (let i = 0; i < length; i += 1) out[i] += channel[i] / audioBuffer.numberOfChannels;
  }
  return out;
}

function writeString(view: DataView, offset: number, value: string) {
  for (let i = 0; i < value.length; i += 1) view.setUint8(offset + i, value.charCodeAt(i));
}

export async function recordingToWav(blob: Blob): Promise<Blob> {
  const context = new AudioContext();
  try {
    const decoded = await context.decodeAudioData(await blob.arrayBuffer());
    return new Blob([encodeWav(decoded)], { type: "audio/wav" });
  } finally {
    await context.close();
  }
}

export type BrowserSpeech = {
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechCtor = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { resultIndex: number; results: { length: number; [index: number]: { isFinal: boolean; 0?: { transcript?: string } } } }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

export function createBrowserSpeech(
  onPartial: (text: string) => void,
  onFinal: (text: string) => void,
  onError: (message: string) => void,
): BrowserSpeech | null {
  if (typeof window === "undefined") return null;
  const Ctor = (window as unknown as { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor }).SpeechRecognition
    ?? (window as unknown as { webkitSpeechRecognition?: SpeechCtor }).webkitSpeechRecognition;
  if (!Ctor) return null;

  const rec = new Ctor();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = "en-IN";

  let finalText = "";

  rec.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const part = event.results[i][0]?.transcript ?? "";
      if (event.results[i].isFinal) finalText += part;
      else interim += part;
    }
    onPartial((finalText + interim).trim());
  };

  rec.onerror = (event) => {
    if (event.error === "no-speech") return;
    onError(event.error === "not-allowed" ? "Microphone blocked in the browser." : "Speech recognition stopped.");
  };

  rec.onend = () => {
    onFinal(finalText.trim());
  };

  return {
    start: () => {
      finalText = "";
      rec.start();
    },
    stop: () => rec.stop(),
    abort: () => rec.abort(),
  };
}
