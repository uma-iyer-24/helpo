"use client";

import { motion } from "framer-motion";

export function TranscribeWait() {
  return (
    <div className="transcribe-wait" role="status" aria-live="polite">
      <div className="transcribe-bars" aria-hidden>
        {[0, 1, 2, 3, 4].map((index) => (
          <motion.span
            key={index}
            className="transcribe-bar"
            animate={{ scaleY: [0.35, 1, 0.45] }}
            transition={{
              duration: 0.85,
              repeat: Infinity,
              delay: index * 0.12,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <div className="transcribe-copy">
        <p className="transcribe-title">Transcribing</p>
        <p className="muted" style={{ margin: 0 }}>
          Turning what you said into text. It will appear in the box below.
        </p>
      </div>
      <div className="transcribe-dots" aria-hidden>
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
