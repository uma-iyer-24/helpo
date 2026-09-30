"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ANANYA, FACULTY } from "@/lib/campus";
import { useHelpo } from "@/lib/store";
import type { Role } from "@/lib/types";

const STUDENT_ONLY = ["/", "/extension", "/day", "/help", "/crashout", "/case"];
const STAFF_PREFIXES = ["/faculty", "/counsellor", "/admin"];

export function Shell({ children }: { children: React.ReactNode }) {
  const { ready, state, remainingExtensions, remainingDays, setRole, replayTutorial, reset } = useHelpo();
  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (state.role === "faculty" && STUDENT_ONLY.includes(path)) router.replace("/faculty");
    if (state.role === "counsellor" && (STUDENT_ONLY.includes(path) || path.startsWith("/faculty") || path.startsWith("/admin"))) router.replace("/counsellor");
    if (state.role === "admin" && (STUDENT_ONLY.includes(path) || path.startsWith("/faculty") || path.startsWith("/counsellor"))) router.replace("/admin");
    if (state.role === "student" && STAFF_PREFIXES.some((prefix) => path.startsWith(prefix))) router.replace("/");
    if (state.role === "faculty" && (STUDENT_ONLY.includes(path) || path.startsWith("/counsellor") || path.startsWith("/admin"))) router.replace("/faculty");
  }, [ready, state.role, path, router]);

  if (!ready) return <div className="boot">helpo</div>;

  function choose(role: Role) {
    setRole(role);
    if (role === "student") router.push("/");
    if (role === "faculty") router.push("/faculty");
    if (role === "counsellor") router.push("/counsellor");
    if (role === "admin") router.push("/admin");
  }

  const who =
    state.role === "student"
      ? { name: ANANYA.name, detail: `${ANANYA.roll} · ${ANANYA.year}` }
      : state.role === "faculty"
        ? { name: FACULTY.name, detail: FACULTY.detail }
        : state.role === "admin"
          ? { name: "College administration", detail: "Student welfare · trust ledger" }
          : { name: "Counselling centre", detail: "Admin-Gr22" };

  const home =
    state.role === "faculty" ? "/faculty" : state.role === "counsellor" ? "/counsellor" : state.role === "admin" ? "/admin" : "/";

  return (
    <div className="shell">
      <aside className="rail">
        <Link href={home} className="brand">
          <strong>helpo</strong>
          <span>GNITS</span>
        </Link>
        <p className="who">
          <b>{who.name}</b>
          <span>{who.detail} · sample</span>
        </p>
        <div className="preview">
          <p>Preview as</p>
          <div className="switch" role="group" aria-label="Preview as">
            {(["student", "faculty", "counsellor", "admin"] as Role[]).map((role) => (
              <button key={role} type="button" aria-pressed={state.role === role} onClick={() => choose(role)}>
                {role === "faculty" ? "Faculty" : role === "counsellor" ? "Counsellor" : role === "admin" ? "Admin" : "Student"}
              </button>
            ))}
          </div>
        </div>
        <nav className="nav">
          {state.role === "student" && (
            <>
              <Link href="/" aria-current={path === "/" ? "page" : undefined}>Home</Link>
              <Link href="/extension" aria-current={path === "/extension" ? "page" : undefined}>Extension</Link>
              <Link href="/day" aria-current={path === "/day" ? "page" : undefined}>Mental health day</Link>
              <Link href="/help" aria-current={path === "/help" ? "page" : undefined}>Help</Link>
              <Link href="/crashout" aria-current={path === "/crashout" ? "page" : undefined}>Crashout</Link>
              <Link href="/case" aria-current={path === "/case" ? "page" : undefined}>Case file</Link>
            </>
          )}
          {state.role === "faculty" && (
            <Link href="/faculty" aria-current={path.startsWith("/faculty") ? "page" : undefined}>Inbox</Link>
          )}
          {state.role === "counsellor" && (
            <Link href="/counsellor" aria-current={path === "/counsellor" ? "page" : undefined}>Today</Link>
          )}
          {state.role === "admin" && (
            <Link href="/admin" aria-current={path.startsWith("/admin") ? "page" : undefined}>Case overview</Link>
          )}
          <Link href="/why" aria-current={path === "/why" ? "page" : undefined}>Why Helpo</Link>
        </nav>
        {state.role === "student" && (
          <div className="allowances">
            <p>This semester</p>
            <div className="meters">
              <b>Extensions {remainingExtensions} of 3</b>
              <b>Mental health days {remainingDays} of 3</b>
            </div>
          </div>
        )}
        <div className="rail-actions">
          {state.role === "student" && (
            <button className="text-btn" type="button" onClick={replayTutorial}>Tutorial</button>
          )}
          <button className="text-btn" type="button" onClick={reset}>Reset demo</button>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
