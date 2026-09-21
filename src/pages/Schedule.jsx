import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AppShell from "../components/AppShell.jsx";
import PageHeader from "../components/PageHeader.jsx";
import TermSelect from "../components/TermSelect.jsx";
import ScheduleGrid from "../components/ScheduleGrid.jsx";
import useSubjects from "../hooks/useSubjects.js";
import useTerm from "../hooks/useTerm.js";
import { btnSecondary } from "../utils/ui.js";

// Read-only timetable per semester. Adding / scanning / editing is on Overview.
export default function Schedule() {
  const { subjects, loading, error } = useSubjects();
  const { term, setTerm, terms } = useTerm(subjects);

  const termSubjects = useMemo(() => subjects.filter((s) => s.term === term), [subjects, term]);

  return (
    <AppShell>
      <PageHeader title="Schedule" subtitle={`Weekly timetable for ${term}.`}>
        <TermSelect term={term} terms={terms} onChange={setTerm} />
      </PageHeader>

      {error && (
        <div className="mb-5 bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 text-navy/70 py-20">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading your schedule…</span>
        </div>
      ) : termSubjects.length === 0 ? (
        <div className="bg-paper rounded-2xl shadow-card text-center py-14 px-6">
          <p className="font-display text-lg font-semibold text-navy">Nothing scheduled for {term}</p>
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
        <ScheduleGrid subjects={termSubjects} />
      )}
    </AppShell>
  );
}