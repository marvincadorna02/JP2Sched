import { useMemo, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import AppShell from "../components/AppShell.jsx";
import PageHeader from "../components/PageHeader.jsx";
import TermSelect from "../components/TermSelect.jsx";
import StudentInfoCard from "../components/StudentInfoCard.jsx";
import ProfileCard from "../components/ProfileCard.jsx";
import useSubjects from "../hooks/useSubjects.js";
import useTerm from "../hooks/useTerm.js";
import useProfile from "../hooks/useProfile.js";
import { toLabel } from "../utils/schedule.js";
import { btnSecondary, btnDanger } from "../utils/ui.js";

function Section({ title, description, danger, children }) {
  return (
    <section
      className={`bg-paper rounded-2xl shadow-card p-5 sm:p-6 mb-5 ${
        danger ? "border border-red-200" : ""
      }`}
    >
      <h2 className={`font-display text-lg font-semibold ${danger ? "text-red-700" : "text-navy"}`}>
        {title}
      </h2>
      {description && <p className="text-sm text-navy/75 mt-1">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function exportCsv(rows, term) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [
    ["Subject", "Day", "Start", "End", "Room"],
    ...rows.map((s) => [s.name, s.day, toLabel(s.start), toLabel(s.end), s.room]),
  ].map((r) => r.map(esc).join(","));

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `schedule-${term.replace(/[^\w-]+/g, "_")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Settings() {
  const { profile, save: saveProfile } = useProfile();
  const { subjects, removeMany } = useSubjects();
  const { term, setTerm, addTerm, terms } = useTerm(subjects);
  const [profileOpen, setProfileOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const termSubjects = useMemo(() => subjects.filter((s) => s.term === term), [subjects, term]);

  async function handleDeleteAll() {
    if (!window.confirm(`Delete all ${termSubjects.length} class meetings in ${term}? This can't be undone.`))
      return;
    setBusy(true);
    await removeMany(termSubjects.map((s) => s.id));
    setBusy(false);
  }

  return (
    <AppShell
      modals={
        <ProfileCard
          profile={profile}
          onSave={saveProfile}
          open={profileOpen}
          onOpenChange={setProfileOpen}
          hideTrigger
        />
      }
    >
      <PageHeader title="Settings" subtitle="Manage your profile, semester and data." />

      <StudentInfoCard profile={profile} />

      <Section title="Profile" description="Update your name, school ID, year level, course and program.">
        <button onClick={() => setProfileOpen(true)} className={btnSecondary}>
          Edit profile
        </button>
      </Section>

      <Section
        title="Active semester"
        description="The semester shown by default on Overview, Subjects and Schedule."
      >
        <TermSelect term={term} terms={terms} onChange={setTerm} onCreate={addTerm} />
      </Section>

      <Section
        title="Export"
        description={`Download your ${term} schedule as a spreadsheet (CSV) — ${termSubjects.length} class meetings.`}
      >
        <button
          onClick={() => exportCsv(termSubjects, term)}
          disabled={termSubjects.length === 0}
          className={`${btnSecondary} disabled:opacity-50`}
        >
          <Download size={16} strokeWidth={2.5} />
          Export CSV
        </button>
      </Section>

      <Section
        danger
        title="Danger zone"
        description={`Remove every subject saved under ${term}. Other semesters are not affected.`}
      >
        <button onClick={handleDeleteAll} disabled={busy || termSubjects.length === 0} className={btnDanger}>
          <Trash2 size={16} strokeWidth={2.5} />
          {busy ? "Deleting…" : "Delete all subjects in this semester"}
        </button>
      </Section>
    </AppShell>
  );
}