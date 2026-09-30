"use client";

import { motion } from "framer-motion";

export function BootLoader() {
  return (
    <div className="boot">
      <AmbientMini />
      <motion.p
        className="boot-word"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        helpo
      </motion.p>
      <motion.div
        className="boot-bar"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      />
    </div>
  );
}

function AmbientMini() {
  return (
    <div className="ambient boot-ambient" aria-hidden>
      <div className="orb orb-a" />
      <div className="orb orb-b" />
    </div>
  );
}
