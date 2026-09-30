"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { Ambient } from "@/components/Ambient";
import { BootLoader } from "@/components/BootLoader";
import { PageTransition } from "@/components/PageTransition";
import { ANANYA, CAP, FACULTY } from "@/lib/campus";
import { mentorFor } from "@/lib/mentors";
import { useHelpo } from "@/lib/store";
import type { ExtensionMatter, Role } from "@/lib/types";

const STUDENT_ONLY = ["/", "/extension", "/day", "/help", "/crashout", "/case"];
const STAFF_PREFIXES = ["/faculty", "/counsellor", "/admin"];

export function Shell({ children }: { children: React.ReactNode }) {
  const { ready, state, remainingExtensions, remainingDays, setRole, setCounsellorDesk, replayTutorial, reset } = useHelpo();
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

  if (!ready) return <BootLoader />;

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
          : (() => {
              const m = mentorFor(state.counsellorDesk);
              return { name: m.name, detail: m.title };
            })();

  const home =
    state.role === "faculty" ? "/faculty" : state.role === "counsellor" ? "/counsellor" : state.role === "admin" ? "/admin" : "/";

  const extPct = (remainingExtensions / CAP) * 100;
  const dayPct = (remainingDays / CAP) * 100;

  return (
    <>
      <Ambient />
      <div className="shell">
        <motion.aside
          className="rail"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
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
          {state.role === "counsellor" && (
            <div className="preview">
              <p>Mentor desk</p>
              <div className="switch" role="group" aria-label="Mentor desk">
                {(["academic", "financial", "transport"] as ExtensionMatter[]).map((desk) => (
                  <button
                    key={desk}
                    type="button"
                    aria-pressed={state.counsellorDesk === desk}
                    onClick={() => setCounsellorDesk(desk)}
                  >
                    {desk === "financial" ? "Financial" : desk === "transport" ? "Transport" : "Academic"}
                  </button>
                ))}
              </div>
            </div>
          )}
          <nav className="nav">
            {state.role === "student" && (
              <>
                <Link href="/" aria-current={path === "/" ? "page" : undefined}>Home</Link>
                <Link href="/extension" aria-current={path === "/extension" ? "page" : undefined}>Extension</Link>
                <Link href="/day" aria-current={path === "/day" ? "page" : undefined}>Mental health day</Link>
                <Link href="/help" aria-current={path === "/help" ? "page" : undefined}>Help</Link>
                <Link href="/crashout" aria-current={path === "/crashout" ? "page" : undefined}>Crashout bot</Link>
                <Link href="/case" aria-current={path === "/case" ? "page" : undefined}>Case file</Link>
              </>
            )}
            {state.role === "faculty" && (
              <Link href="/faculty" aria-current={path.startsWith("/faculty") ? "page" : undefined}>Inbox</Link>
            )}
            {state.role === "counsellor" && (
              <Link href="/counsellor" aria-current={path.startsWith("/counsellor") ? "page" : undefined}>Today</Link>
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
                <div className="meter-row">
                  <span>
                    <b>Extensions</b>
                    <b>{remainingExtensions} left</b>
                  </span>
                  <div className="meter-track">
                    <motion.div
                      className="meter-fill"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: extPct / 100 }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                    />
                  </div>
                </div>
                <div className="meter-row">
                  <span>
                    <b>Mental health days</b>
                    <b>{remainingDays} left</b>
                  </span>
                  <div className="meter-track">
                    <motion.div
                      className="meter-fill"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: dayPct / 100 }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.32 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="rail-actions">
            {state.role === "student" && (
              <button className="text-btn" type="button" onClick={replayTutorial}>Tutorial</button>
            )}
            <button className="text-btn" type="button" onClick={reset}>Reset demo</button>
          </div>
        </motion.aside>
        <main className="main">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </>
  );
}
