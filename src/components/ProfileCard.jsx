import { useState } from "react";
import { UserCircle, Pencil, X, Loader2 } from "lucide-react";

const EMPTY = { full_name: "", school_id: "", course: "", year_level: "", program_type: "" };

export default function ProfileCard({ profile, onSave, open, onOpenChange, hideTrigger }) {
  const [internalEditing, setInternalEditing] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  // Controlled from outside (e.g. StudentInfoCard's Edit button) when `open`
  // is passed; otherwise falls back to its own internal state so the
  // top-right button keeps working on its own.
  const isControlled = open !== undefined;
  const editing = isControlled ? open : internalEditing;
  const setEditing = isControlled ? onOpenChange : setInternalEditing;

  const p = profile || EMPTY;
  const hasName = !!p.full_name;

  function openEdit() {
    setForm({ ...EMPTY, ...p });
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    await onSave?.(form);
    setSaving(false);
    setEditing(false);
  }

  return (
    <div className="relative">
      {!hideTrigger && (
        <button
          onClick={openEdit}
          className="flex items-center gap-2.5 bg-paper rounded-lg border border-mist px-3.5 py-2 hover:border-royal/40 transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-full bg-mist flex items-center justify-center shrink-0">
            <UserCircle size={20} className="text-royal" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-navy truncate">
              {hasName ? p.full_name : "Add your profile"}
            </p>
            <p className="text-xs text-navy/50 truncate">
              {hasName
                ? [p.school_id, p.year_level, p.program_type].filter(Boolean).join(" · ") || "Tap to complete"
                : "School ID, course, year level"}
            </p>
          </div>
          <Pencil size={13} className="text-navy/30 shrink-0 ml-1" />
        </button>
      )}

      {editing && (
        <div className="fixed inset-0 bg-navy/50 flex items-center justify-center px-4 z-50">
          <div className="bg-paper rounded-2xl shadow-card w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-semibold text-navy">Your profile</h2>
              <button onClick={() => setEditing(false)} className="text-navy/40 hover:text-navy">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-navy/60">Full name</label>
                <input
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  className="w-full mt-1 rounded-md border border-mist px-3 py-2 text-sm focus:border-royal outline-none"
                  placeholder="Dela Cruz, Juan P."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-navy/60">School ID</label>
                  <input
                    value={form.school_id}
                    onChange={(e) => setForm((f) => ({ ...f, school_id: e.target.value }))}
                    className="w-full mt-1 rounded-md border border-mist px-3 py-2 text-sm focus:border-royal outline-none"
                    placeholder="20230834"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-navy/60">Year level</label>
                  <input
                    value={form.year_level}
                    onChange={(e) => setForm((f) => ({ ...f, year_level: e.target.value }))}
                    className="w-full mt-1 rounded-md border border-mist px-3 py-2 text-sm focus:border-royal outline-none"
                    placeholder="3rd Year"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-navy/60">Course</label>
                <input
                  value={form.course}
                  onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}
                  className="w-full mt-1 rounded-md border border-mist px-3 py-2 text-sm focus:border-royal outline-none"
                  placeholder="BS Information Technology"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-navy/60">Program</label>
                <select
                  value={form.program_type}
                  onChange={(e) => setForm((f) => ({ ...f, program_type: e.target.value }))}
                  className="w-full mt-1 rounded-md border border-mist px-3 py-2 text-sm focus:border-royal outline-none"
                >
                  <option value="">— Select —</option>
                  <option value="Regular">Regular</option>
                  <option value="Special">Special</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditing(false)}
                disabled={saving}
                className="flex-1 rounded-lg border border-mist py-2.5 text-sm font-semibold text-navy/70 hover:bg-mist/40 disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-lg bg-gold py-2.5 text-sm font-semibold text-navy hover:bg-gold/90 disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={15} className="animate-spin" />}
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}