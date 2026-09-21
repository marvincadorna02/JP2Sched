export const SEMESTERS = ["1st Sem", "2nd Sem", "Summer"];

// A "term" is a plain string like "1st Sem 2026-2027" — stored in subjects.term
export function makeTerm(schoolYear, sem) {
  return `${sem} ${schoolYear}`;
}

export function parseTerm(term = "") {
  const m = term.match(/^(.+?)\s+(\d{4}-\d{4})$/);
  return m ? { sem: m[1], schoolYear: m[2] } : { sem: term, schoolYear: "" };
}

// PH calendar: Aug–Dec = 1st Sem, Jan–May = 2nd Sem, Jun–Jul = Summer
export function guessCurrentTerm(date = new Date()) {
  const y = date.getFullYear();
  const m = date.getMonth();
  if (m >= 7) return makeTerm(`${y}-${y + 1}`, "1st Sem");
  if (m <= 4) return makeTerm(`${y - 1}-${y}`, "2nd Sem");
  return makeTerm(`${y - 1}-${y}`, "Summer");
}

export const DEFAULT_TERM = guessCurrentTerm();

export function schoolYearOptions(date = new Date()) {
  const y = date.getFullYear();
  return [y - 3, y - 2, y - 1, y, y + 1].map((n) => `${n}-${n + 1}`);
}

// Newest first
export function sortTerms(terms) {
  const rank = (t) => {
    const { sem, schoolYear } = parseTerm(t);
    return (parseInt(schoolYear, 10) || 0) * 10 + SEMESTERS.indexOf(sem);
  };
  return [...terms].sort((a, b) => rank(b) - rank(a));
}

export function readStore(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}