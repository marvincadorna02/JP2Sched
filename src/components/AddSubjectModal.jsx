import { useState, useEffect } from "react";
import { X, AlertTriangle, Trash2 } from "lucide-react";
import { DAYS, findConflicts, toLabel } from "../utils/schedule.js";

const EMPTY = { name: "", room: "", day: "Mon", start: "08:00", end: "09:30" };

export default function AddSubjectModal({ open, onClose, onSave, onDelete, subjects = [], editing = null }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (open) setForm(editing ? { ...editing } : EMPTY);
  }, [open, editing]);

  if (!open) return null;

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const conflicts = findConflicts(subjects, form, editing?.id ?? null);

  function handleSubmit(e) {
    e.preventDefault();
    onSave?.(form);
    onClose();
  }

  function handleDelete() {
    onDelete?.(editing.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-navy/50 flex items-center justify-center px-4 z-50">
      <div className="bg-paper rounded-2xl shadow-card w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-semibold text-navy">
            {editing ? "Edit subject" : "Add subject"}
          </h2>
          <button onClick={onClose} className="text-navy/40 hover:text-navy">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">Subject name</label>
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Data Structures"
              className="w-full rounded-lg border border-mist bg-mist/40 px-3.5 py-2.5 text-navy placeholder:text-navy/40 focus:bg-paper focus:border-royal outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">Room</label>
            <input
              value={form.room}
              onChange={(e) => update("room", e.target.value)}
              placeholder="e.g. IT-204"
              className="w-full rounded-lg border border-mist bg-mist/40 px-3.5 py-2.5 text-navy placeholder:text-navy/40 focus:bg-paper focus:border-royal outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">Day</label>
            <select
              value={form.day}
              onChange={(e) => update("day", e.target.value)}
              className="w-full rounded-lg border border-mist bg-mist/40 px-3.5 py-2.5 text-navy focus:bg-paper focus:border-royal outline-none"
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Starts</label>
              <input
                type="time"
                value={form.start}
                onChange={(e) => update("start", e.target.value)}
                className="w-full rounded-lg border border-mist bg-mist/40 px-3.5 py-2.5 text-navy focus:bg-paper focus:border-royal outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Ends</label>
              <input
                type="time"
                value={form.end}
                onChange={(e) => update("end", e.target.value)}
                className="w-full rounded-lg border border-mist bg-mist/40 px-3.5 py-2.5 text-navy focus:bg-paper focus:border-royal outline-none"
              />
            </div>
          </div>

          {conflicts.length > 0 && (
            <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 border border-amber-200 px-3.5 py-3">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed">
                Overlaps with <span className="font-semibold">{conflicts[0].name}</span> ({form.day}{" "}
                {toLabel(conflicts[0].start)}–{toLabel(conflicts[0].end)})
                {conflicts.length > 1 ? ` and ${conflicts.length - 1} other subject${conflicts.length > 2 ? "s" : ""}` : ""}.
                You can still save, but double-check the time.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {editing && (
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-lg border border-red-200 px-3.5 text-red-600 hover:bg-red-50"
                title="Delete subject"
              >
                <Trash2 size={17} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-mist py-2.5 text-sm font-semibold text-navy/70 hover:bg-mist/40"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-gold py-2.5 text-sm font-semibold text-navy hover:bg-gold/90"
            >
              {editing ? "Save changes" : "Save subject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
