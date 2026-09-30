import type { ReactNode } from "react";

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
        <p className="kicker">{kicker}</p>
        <h1>{title}</h1>
        {lede ? <p className="lede">{lede}</p> : null}
      </header>
      {children}
    </div>
  );
}

export function Witness() {
  return (
    <p className="witness">
      <span>Identity checked</span>
      <span>Case body unread</span>
      <span>This action appends</span>
    </p>
  );
}
