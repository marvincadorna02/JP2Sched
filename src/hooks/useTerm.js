import { useState, useCallback, useMemo } from "react";
import { DEFAULT_TERM, sortTerms, readStore, writeStore } from "../utils/terms.js";

const SELECTED_KEY = "jp2sched.term";
const EXTRA_KEY = "jp2sched.extraTerms";

// Selected semester is remembered on this device and shared by every page.
export default function useTerm(subjects = []) {
  const [term, setTermState] = useState(() => readStore(SELECTED_KEY, DEFAULT_TERM));
  const [extra, setExtra] = useState(() => readStore(EXTRA_KEY, []));

  const setTerm = useCallback((t) => {
    setTermState(t);
    writeStore(SELECTED_KEY, t);
  }, []);

  // Create a new (still empty) semester and switch to it
  const addTerm = useCallback(
    (t) => {
      setExtra((prev) => {
        const next = prev.includes(t) ? prev : [...prev, t];
        writeStore(EXTRA_KEY, next);
        return next;
      });
      setTerm(t);
    },
    [setTerm]
  );

  const terms = useMemo(
    () =>
      sortTerms([
        ...new Set([DEFAULT_TERM, term, ...extra, ...subjects.map((s) => s.term).filter(Boolean)]),
      ]),
    [term, extra, subjects]
  );

  return { term, setTerm, addTerm, terms };
}