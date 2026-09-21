import { useMemo, useRef, useState } from "react";
import { Download, Upload, Trash2 } from "lucide-react";
import AppShell from "../components/AppShell.jsx";
import PageHeader from "../components/PageHeader.jsx";
import TermSelect from "../components/TermSelect.jsx";
import StudentInfoCard from "../components/StudentInfoCard.jsx";
import ProfileCard from "../components/ProfileCard.jsx";
import useSubjects from "../hooks/useSubjects.js";
import useTerm from "../hooks/useTerm.js";
import useProfile from "../hooks/useProfile.js";
import { toLabel } from "../utils/schedule.js";
import { readStore, writeStore } from "../utils/terms.js";
import { btnSecondary, btnDanger } from "../utils/ui.js";

// Every localStorage key the app owns — exported/imported as one backup file.
const STORE_KEYS = {
  subjects: "jp2sched.subjects",
  profile: "jp2sched.profile",
  term: "jp2sched.term",
  extraTerms: "jp2sched.extraTerms",
};

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

// Full backup: everything this browser holds, in one file.
function exportBackup() {
  const data = {
    app: "JP2Sched",
    version: 1,
    exportedAt: new Date().toISOString(),
    subjects: readStore(STORE_KEYS.subjects, []),
    profile: readStore(STORE_KEYS.profile, null),
    term: readStore(STORE_KEYS.term, null),
    extraTerms: readStore(STORE_KEYS.extraTerms, []),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "jp2sched-backup.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importBackup(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || typeof data !== "object" || !Array.isArray(data.subjects)) {
          throw new Error("invalid");
        }
        writeStore(STORE_KEYS.subjects, data.subjects);
        if ("profile" in data) writeStore(STORE_KEYS.profile, data.profile);
        if (data.term) writeStore(STORE_KEYS.term, data.term);
        if (Array.isArray(data.extraTerms)) writeStore(STORE_KEYS.extraTerms, data.extraTerms);
        resolve();
      } catch {
        reject(new Error("This doesn't look like a JP2Sched backup file."));
      }
    };
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.readAsText(file);
  });
}

export default function Settings() {
  const { profile, save: saveProfile } = useProfile();
  const { subjects, removeMany } = useSubjects();
  const { term, setTerm, addTerm, terms } = useTerm(subjects);
  const [profileOpen, setProfileOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const termSubjects = useMemo(() => subjects.filter((s) => s.term === term), [subjects, term]);

  async function handleDeleteAll() {
  if (!window.confirm(`Delete all ${termSubjects.length} class meetings in ${term}? This can't be undone.`))
    return;
  setBusy(true);
  await removeMany(termSubjects.map((s) => s.id));
  setBusy(false);
}

function handleEraseEverything() {
  if (
    !window.confirm(
      "Erase EVERYTHING? This deletes your profile (name, course, year level, school ID), all semesters and all subjects. This can't be undone."
    )
  )
    return;
  localStorage.clear();
  sessionStorage.clear();
  window.location.replace("/");
}

  async function handleImportFile(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // let the same file be picked again later
    if (!file) return;
    if (
      !window.confirm(
        "Importing replaces the schedule, profile and semesters saved in this browser. Continue?"
      )
    )
      return;
    try {
      await importBackup(file);
      window.location.reload(); // remount every page so hooks re-read localStorage
    } catch (err) {
      window.alert(err.message || "Import failed.");
    }
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
        title="Backup & restore"
        description="Move your data to another device or browser. Export saves everything — all semesters, subjects and profile — to one file; import restores it here."
      >
        <div className="flex flex-wrap gap-3">
          <button onClick={exportBackup} className={btnSecondary}>
            <Download size={16} strokeWidth={2.5} />
            Export backup (JSON)
          </button>
          <button onClick={() => fileRef.current?.click()} className={btnSecondary}>
            <Upload size={16} strokeWidth={2.5} />
            Import backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImportFile}
          />
        </div>
      </Section>

      <Section
          danger
          title="Danger zone"
          description={`Remove every subject saved under ${term}, or erase all data in this browser.`}
        >
          <div className="flex flex-wrap gap-3">
            <button onClick={handleDeleteAll} disabled={busy || termSubjects.length === 0} className={btnDanger}>
              <Trash2 size={16} strokeWidth={2.5} />
              {busy ? "Deleting…" : "Delete all subjects in this semester"}
            </button>
            <button onClick={handleEraseEverything} className={btnDanger}>
              <Trash2 size={16} strokeWidth={2.5} />
              Erase everything
            </button>
          </div>
        </Section>
    </AppShell>
  );
}