import { useState, useCallback } from "react";
import { DEFAULT_TERM, readStore, writeStore } from "../utils/terms.js";

// Subjects live entirely in this browser (localStorage) — no login, no server.
const STORE_KEY = "jp2sched.subjects";

// Rows saved before semesters existed fall back to the current term.
const withTerm = (s) => ({ ...s, term: s.term || DEFAULT_TERM });

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function useSubjects() {
  const [subjects, setSubjects] = useState(() =>
    (readStore(STORE_KEY, []) || []).map(withTerm)
  );
  // Kept so pages that show a spinner / error banner don't need to change.
  const loading = false;
  const error = null;

  // Single place that writes every change through to localStorage.
  const persist = useCallback((updater) => {
    setSubjects((prev) => {
      const next = updater(prev);
      writeStore(STORE_KEY, next);
      return next;
    });
  }, []);

  // editing = the subject being edited (keeps its own term), otherwise creates in `term`
  const save = useCallback(
    (form, editing, term) => {
      if (editing) {
        const updated = { ...form, term: editing.term, id: editing.id };
        persist((subs) => subs.map((s) => (s.id === editing.id ? updated : s)));
      } else {
        const created = { ...form, term, id: newId() };
        persist((subs) => [...subs, created]);
      }
    },
    [persist]
  );

  const remove = useCallback(
    (id) => persist((subs) => subs.filter((s) => s.id !== id)),
    [persist]
  );

  const removeMany = useCallback(
    (ids) => persist((subs) => subs.filter((s) => !ids.includes(s.id))),
    [persist]
  );

  // Rows from an ERC scan: tag with the selected semester and give real ids.
  const importRows = useCallback(
    (rows, term) => {
      const tagged = rows.map((r) => ({ ...r, term, id: newId() }));
      persist((subs) => [...subs, ...tagged]);
    },
    [persist]
  );

  return { subjects, loading, error, save, remove, removeMany, importRows };
}
