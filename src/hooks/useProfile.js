import { useState, useCallback } from "react";
import { readStore, writeStore } from "../utils/terms.js";

// Profile lives in this browser (localStorage) — no login, no server.
const STORE_KEY = "jp2sched.profile";
const EMPTY = { full_name: "", school_id: "", course: "", year_level: "", program_type: "" };

export default function useProfile() {
  const [profile, setProfile] = useState(() => readStore(STORE_KEY, null));

  const reload = useCallback(() => {
    setProfile(readStore(STORE_KEY, null));
  }, []);

  const save = useCallback((form) => {
    setProfile((p) => {
      const next = { ...(p || EMPTY), ...form };
      writeStore(STORE_KEY, next);
      return next;
    });
  }, []);

  // Fill only empty fields from an ERC scan — never overwrite what the student
  // already set (matches the old server-side behavior).
  const mergeFromScan = useCallback((student) => {
    if (!student || typeof student !== "object") return;
    setProfile((p) => {
      const base = p || EMPTY;
      const next = { ...base };
      let changed = false;
      for (const key of Object.keys(EMPTY)) {
        const incoming = String(student[key] ?? "").trim();
        const current = String(base[key] ?? "").trim();
        if (incoming && !current) {
          next[key] = incoming;
          changed = true;
        }
      }
      if (!changed) return p;
      writeStore(STORE_KEY, next);
      return next;
    });
  }, []);

  return { profile, save, reload, mergeFromScan };
}
