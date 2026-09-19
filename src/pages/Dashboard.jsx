import { useMemo, useState } from "react";
import { Plus, ScanLine, Loader2 } from "lucide-react";
import AppShell from "../components/AppShell.jsx";
import PageHeader from "../components/PageHeader.jsx";
import TermSelect from "../components/TermSelect.jsx";
import ScheduleGrid from "../components/ScheduleGrid.jsx";
import StatCard from "../components/StatCard.jsx";
import AddSubjectModal from "../components/AddSubjectModal.jsx";
import ScanERCModal from "../components/ScanERCModal.jsx";
import NotificationBanner from "../components/NotificationBanner.jsx";
import StudentInfoCard from "../components/StudentInfoCard.jsx";
import useSubjects from "../hooks/useSubjects.js";
import useTerm from "../hooks/useTerm.js";
import useProfile from "../hooks/useProfile.js";
import { toDecimal } from "../utils/schedule.js";
import { btnPrimary, btnSecondary } from "../utils/ui.js";

export default function Dashboard() {
  const { subjects, loading, error, save, remove, importRows } = useSubjects();
  const { term, setTerm, addTerm, terms } = useTerm(subjects);
  const { profile, reload: reloadProfile } = useProfile();

  const [modalOpen, setModalOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const termSubjects = useMemo(() => subjects.filter((s) => s.term === term), [subjects, term]);

  // Same subject on several days counts once
  const subjectCount = new Set(termSubjects.map((s) => s.name.trim().toLowerCase())).size;
  const totalHours = termSubjects.reduce((sum, s) => sum + toDecimal(s.end) - toDecimal(s.start), 0);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(subject) {
    setEditing(subject);
    setModalOpen(true);
  }

  async function handleImport(rows) {
    await importRows(rows, term);
    // The scan may have auto-filled blank profile fields — refresh the card
    reloadProfile();
  }

  return (
    <AppShell
      modals={
        <>
          <AddSubjectModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onSave={(form) => save(form, editing, term)}
            onDelete={remove}
            subjects={termSubjects}
            editing={editing}
          />
          <ScanERCModal
            open={scanOpen}
            onClose={() => setScanOpen(false)}
            onImport={handleImport}
            subjects={termSubjects}
          />
        </>
      }
    >
      <PageHeader title="This week" subtitle="Every class, consult, and OJT block in one place.">
        <TermSelect term={term} terms={terms} onChange={setTerm} onCreate={addTerm} />
        <button onClick={() => setScanOpen(true)} className={btnSecondary}>
          <ScanLine size={16} strokeWidth={2.5} />
          Scan ERC
        </button>
        <button onClick={openAdd} className={btnPrimary}>
          <Plus size={16} strokeWidth={2.5} />
          Add subject
        </button>
      </PageHeader>

      <StudentInfoCard profile={profile} />

      {error && (
        <div className="mb-5 bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <NotificationBanner subjects={termSubjects} />

      <div className="flex flex-wrap gap-3 sm:gap-4 mb-7">
        <StatCard label="Subjects enrolled" value={subjectCount} accent="royal" />
        <StatCard label="Hours this week" value={totalHours.toFixed(1)} accent="gold" />
        <StatCard label="Tap a class to edit" value="Click any block below" accent="navy" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 text-navy/70 py-20">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading your schedule…</span>
        </div>
      ) : (
        <ScheduleGrid subjects={termSubjects} onBlockClick={openEdit} />
      )}
    </AppShell>
  );
}