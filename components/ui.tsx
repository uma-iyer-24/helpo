"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

export function Page({
  kicker,
  title,
  lede,
  children,
}: {
  kicker: string;
  title: string;
  lede?: string;
  children: ReactNode;
}) {
  return (
    <div className="content">
      <header className="page-head">
        <motion.p
          className="kicker"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.05 }}
        >
          {kicker}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease, delay: 0.1 }}
        >
          {title}
        </motion.h1>
        {lede ? (
          <motion.p
            className="lede"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.18 }}
          >
            {lede}
          </motion.p>
        ) : null}
      </header>
      <motion.div
        className="page-body"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease, delay: 0.24 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export function Witness() {
  const items = ["Identity checked", "Case body unread", "This action appends"];
  return (
    <p className="witness">
      {items.map((label, index) => (
        <motion.span
          key={label}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease, delay: 0.35 + index * 0.08 }}
        >
          {label}
        </motion.span>
      ))}
    </p>
  );
}

export function Stagger({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 14, scale: 0.98 },
        show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease } },
      }}
    >
      {children}
    </motion.div>
  );
}
