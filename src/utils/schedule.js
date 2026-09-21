export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_MAP = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// "08:30" -> 8.5
export function toDecimal(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h + m / 60;
}

// "08:30" -> "8:30AM"
export function toLabel(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const hour = h % 12 === 0 ? 12 : h % 12;
  const suffix = h < 12 ? "AM" : "PM";
  return `${hour}:${String(m).padStart(2, "0")}${suffix}`;
}

// Returns the subjects that overlap with `candidate` on the same day.
// Pass excludeId when checking an edit, so a subject doesn't conflict with itself.
export function findConflicts(subjects, candidate, excludeId = null) {
  const cStart = toDecimal(candidate.start);
  const cEnd = toDecimal(candidate.end);
  return subjects.filter((s) => {
    if (excludeId != null && s.id === excludeId) return false;
    if (s.day !== candidate.day) return false;
    const sStart = toDecimal(s.start);
    const sEnd = toDecimal(s.end);
    return cStart < sEnd && sStart < cEnd; // real overlap, touching edges is fine
  });
}

// Subjects starting within `withinMinutes` from now, soonest first.
export function getUpcoming(subjects, withinMinutes = 15) {
  const now = new Date();
  const today = DAY_MAP[now.getDay()];
  const nowDecimal = now.getHours() + now.getMinutes() / 60;

  return subjects
    .filter((s) => s.day === today)
    .map((s) => ({ ...s, minsUntil: Math.round((toDecimal(s.start) - nowDecimal) * 60) }))
    .filter((s) => s.minsUntil >= 0 && s.minsUntil <= withinMinutes)
    .sort((a, b) => a.minsUntil - b.minsUntil);
}
