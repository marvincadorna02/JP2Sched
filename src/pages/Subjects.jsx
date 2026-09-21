import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Loader2, BookOpen } from "lucide-react";
import AppShell from "../components/AppShell.jsx";
import PageHeader from "../components/PageHeader.jsx";
import TermSelect from "../components/TermSelect.jsx";
import StatCard from "../components/StatCard.jsx";
import useSubjects from "../hooks/useSubjects.js";
import useTerm from "../hooks/useTerm.js";
import { DAYS, toDecimal, toLabel } from "../utils/schedule.js";
import { btnSecondary } from "../utils/ui.js";

// Read-only record of subjects per semester.
// Adding / scanning / editing happens on Overview and Schedule.
export default function Subjects() {
  const { subjects, loading, error } = useSubjects();
  const { term, setTerm, terms } = useTerm(subjects);
  const [query, setQuery] = useState("");

  const termSubjects = useMemo(() => subjects.filter((s) => s.term === term), [subjects, term]);

  const groups = useMemo(() => {
    const map = new Map();
    for (const s of termSubjects) {
      const key = s.name.trim().toLowerCase();
      if (!map.has(key)) map.set(key, { name: s.name, meetings: [], hours: 0 });
      const g = map.get(key);
      g.meetings.push(s);
      g.hours += toDecimal(s.end) - toDecimal(s.start);
    }
    for (const g of map.values()) {
      g.meetings.sort(
        (a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || toDecimal(a.start) - toDecimal(b.start)
      );
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [termSubjects]);

  const q = query.trim().toLowerCase();
  const visible = q ? groups.filter((g) => g.name.toLowerCase().includes(q)) : groups;
  const totalHours = groups.reduce((sum, g) => sum + g.hours, 0);

  return (
    <AppShell>
      <PageHeader
        title="Subjects"
        subtitle={`Your subject record for ${term}. Pick a semester to view its subjects.`}
      >
        <TermSelect term={term} terms={terms} onChange={setTerm} />
      </PageHeader>

      {error && (
        <div className="mb-5 bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="flex flex-wrap gap-3 sm:gap-4 mb-6">
        <StatCard label="Subjects" value={groups.length} accent="royal" />
        <StatCard label="Class meetings" value={termSubjects.length} accent="navy" />
        <StatCard label="Hours per week" value={totalHours.toFixed(1)} accent="gold" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 text-navy/70 py-20">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading your subjects…</span>
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-paper rounded-2xl shadow-card text-center py-14 px-6">
          <BookOpen size={28} className="mx-auto text-navy/40 mb-3" />
          <p className="font-display text-lg font-semibold text-navy">
            No subjects recorded for {term}
          </p>
          <p className="text-sm text-navy/75 mt-1 mb-5">
            Add subjects or scan your ERC from the Overview page.
          </p>
          <div className="flex justify-center">
            <Link to="/dashboard" className={btnSecondary}>
              Go to Overview
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="relative mb-4 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search subjects"
              className="w-full bg-paper border border-navy/20 text-navy text-sm rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-royal/40"
            />
          </div>

          {visible.length === 0 ? (
            <p className="text-sm text-navy/75 py-8 text-center">No subject matches “{query}”.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {visible.map((g) => (
                <div key={g.name} className="bg-paper rounded-2xl shadow-card p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg font-semibold text-navy">{g.name}</h3>
                    <span className="shrink-0 text-xs font-semibold text-navy/70 bg-mist rounded-full px-2.5 py-1">
                      {+g.hours.toFixed(1)}h / week
                    </span>
                  </div>
                  <ul className="flex flex-wrap gap-2 mt-3">
                    {g.meetings.map((m) => (
                      <li key={m.id} className="text-sm text-navy bg-mist rounded-lg px-3 py-2">
                        <span className="font-semibold">{m.day}</span> · {toLabel(m.start)}–
                        {toLabel(m.end)}
                        {m.room && <span className="text-navy/70"> · {m.room}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}