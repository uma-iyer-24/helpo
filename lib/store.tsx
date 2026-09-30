"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CAP, courseById, formatDate, nowStamp } from "./campus";
import { assignExtensionDesk, mentorFor } from "./mentors";
import { normalizeState } from "./normalize";
import { freshState, type ExtensionMatter, type Role, type State } from "./types";

const KEY = "helpo-demo-v2";

type Store = {
  ready: boolean;
  state: State;
  remainingExtensions: number;
  remainingDays: number;
  setRole: (role: Role) => void;
  setCounsellorDesk: (desk: ExtensionMatter) => void;
  dismissTutorial: () => void;
  replayTutorial: () => void;
  requestExtension: (input: {
    courseId: "os" | "cn";
    matter: ExtensionMatter;
    letter: string;
    askUntil: string;
  }) => string | null;
  approveExtension: (id: string, grantedUntil: string) => void;
  declineExtension: (id: string, note: string) => void;
  recordExtension: (id: string) => void;
  bookDay: (date: string) => string | null;
  attestDay: (id: string) => void;
  attachSummary: (text: string) => void;
  handOver: () => void;
  endCrashout: () => void;
  reset: () => void;
};

const Ctx = createContext<Store | null>(null);

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

function load(): State {
  const base = freshState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<State>;
    if (!Array.isArray(parsed.extensions) || !Array.isArray(parsed.ledger)) return base;
    return normalizeState(parsed, base);
  } catch {
    return base;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(freshState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(load());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, ready]);

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === KEY && event.newValue) {
        setState(load());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const api = useMemo<Store>(() => {
    const usedExtensions = (s: State) => s.extensions.filter((item) => item.studentId === "ananya").length;
    const usedDays = (s: State) => s.bookings.filter((item) => item.studentId === "ananya").length;

    return {
      ready,
      state,
      remainingExtensions: CAP - usedExtensions(state),
      remainingDays: CAP - usedDays(state),
      setRole: (role) => setState((s) => ({ ...s, role })),
      setCounsellorDesk: (desk) => setState((s) => ({ ...s, counsellorDesk: desk })),
      dismissTutorial: () => setState((s) => ({ ...s, tutorialSeen: true })),
      replayTutorial: () => setState((s) => ({ ...s, tutorialSeen: false })),
      requestExtension: ({ courseId, matter, letter, askUntil }) => {
        let error: string | null = null;
        setState((s) => {
          if (usedExtensions(s) >= CAP) {
            error = "cap";
            return s;
          }
          const text = letter.trim();
          if (!text) {
            error = "empty";
            return s;
          }
          const course = courseById(courseId);
          const route = assignExtensionDesk(matter, text);
          const mentor = mentorFor(route.assignedDesk);
          return {
            ...s,
            extensions: [
              {
                id: uid("ext"),
                studentId: "ananya",
                courseId,
                matter,
                assignedDesk: route.assignedDesk,
                letter: text,
                askUntil,
                status: "pending_counsellor",
                nameReleased: false,
                createdAt: nowStamp(),
              },
              ...s.extensions,
            ],
            ledger: [
              {
                id: uid("led"),
                at: nowStamp(),
                text: `Extension requested · ${course.name} · ${mentor.title} · ${formatDate(course.due)} to ${formatDate(askUntil)}`,
              },
              ...s.ledger,
            ],
          };
        });
        return error;
      },
      approveExtension: (id, grantedUntil) => {
        setState((s) => {
          const target = s.extensions.find((item) => item.id === id);
          if (!target || target.status !== "pending_counsellor") return s;
          const course = courseById(target.courseId);
          const until = grantedUntil || target.askUntil;
          return {
            ...s,
            extensions: s.extensions.map((item) =>
              item.id === id
                ? { ...item, status: "pending_faculty", grantedUntil: until, nameReleased: false }
                : item,
            ),
            ledger: [
              {
                id: uid("led"),
                at: nowStamp(),
                text: `Extension approved by counselling · ${course.name} · forwarded to faculty · due ${formatDate(until)}`,
              },
              ...s.ledger,
            ],
          };
        });
      },
      declineExtension: (id, note) => {
        setState((s) => {
          const target = s.extensions.find((item) => item.id === id);
          if (!target || target.status !== "pending_counsellor") return s;
          const course = courseById(target.courseId);
          return {
            ...s,
            extensions: s.extensions.map((item) =>
              item.id === id
                ? { ...item, status: "declined", declineNote: note.trim() || "This request cannot be approved.", nameReleased: false }
                : item,
            ),
            ledger: [
              {
                id: uid("led"),
                at: nowStamp(),
                text: `Extension not approved · ${course.name} · counselling · identity stayed sealed`,
              },
              ...s.ledger,
            ],
          };
        });
      },
      recordExtension: (id) => {
        setState((s) => {
          const target = s.extensions.find((item) => item.id === id);
          if (!target || target.status !== "pending_faculty") return s;
          const course = courseById(target.courseId);
          const until = target.grantedUntil ?? target.askUntil;
          return {
            ...s,
            extensions: s.extensions.map((item) =>
              item.id === id
                ? { ...item, status: "recorded", nameReleased: true }
                : item,
            ),
            ledger: [
              {
                id: uid("led"),
                at: nowStamp(),
                text: `Extension recorded by faculty · ${course.name} · mandated · name released · due ${formatDate(until)}`,
              },
              ...s.ledger,
            ],
          };
        });
      },
      bookDay: (date) => {
        let error: string | null = null;
        setState((s) => {
          if (usedDays(s) >= CAP) {
            error = "cap";
            return s;
          }
          if (s.bookings.some((item) => item.date === date)) {
            error = "booked";
            return s;
          }
          return {
            ...s,
            bookings: [
              { id: uid("day"), studentId: "ananya", date, status: "booked", createdAt: nowStamp() },
              ...s.bookings,
            ],
            ledger: [
              {
                id: uid("led"),
                at: nowStamp(),
                text: `Mental health day booked · ${formatDate(date)} · conversation optional`,
              },
              ...s.ledger,
            ],
          };
        });
        return error;
      },
      attestDay: (id) => {
        setState((s) => {
          const target = s.bookings.find((item) => item.id === id);
          if (!target || target.status === "attested") return s;
          return {
            ...s,
            bookings: s.bookings.map((item) => (item.id === id ? { ...item, status: "attested" } : item)),
            ledger: [
              {
                id: uid("led"),
                at: nowStamp(),
                text: `Medical leave attested · ${formatDate(target.date)}`,
              },
              ...s.ledger,
            ],
          };
        });
      },
      attachSummary: (text) => {
        const clean = text.trim();
        if (!clean) return;
        setState((s) => ({
          ...s,
          summaries: [{ id: uid("sum"), text: clean, at: nowStamp() }, ...s.summaries],
          ledger: [
            { id: uid("led"), at: nowStamp(), text: "Summary attached to the case file" },
            ...s.ledger,
          ],
        }));
      },
      handOver: () => {
        setState((s) => {
          if (s.handedOver) return s;
          return {
            ...s,
            handedOver: true,
            ledger: [
              { id: uid("led"), at: nowStamp(), text: "Case file handed to the counselling centre" },
              ...s.ledger,
            ],
          };
        });
      },
      endCrashout: () => {
        setState((s) => ({
          ...s,
          ledger: [
            { id: uid("led"), at: nowStamp(), text: "Crashout session ended" },
            ...s.ledger,
          ],
        }));
      },
      reset: () => {
        const next = freshState();
        setState(next);
        localStorage.setItem(KEY, JSON.stringify(next));
        sessionStorage.removeItem("helpo-letter");
      },
    };
  }, [ready, state]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useHelpo() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Helpo store missing");
  return ctx;
}
