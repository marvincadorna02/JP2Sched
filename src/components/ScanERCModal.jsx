import { useState, useRef } from "react";
import { X, Camera, Upload, Loader2, Pencil, Trash2, Check, AlertTriangle } from "lucide-react";
import { DAYS, findConflicts, toLabel } from "../utils/schedule.js";
import { apiFetch } from "../utils/api.js";

export default function ScanERCModal({ open, onClose, onImport, subjects = [] }) {
  const [step, setStep] = useState("upload"); // upload -> extracting -> review
  const [imagePreview, setImagePreview] = useState(null);
  const [rows, setRows] = useState([]);
  const [student, setStudent] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  if (!open) return null;

  function reset() {
    setStep("upload");
    setImagePreview(null);
    setRows([]);
    setStudent(null);
    setEditingId(null);
    setError(null);
    setSaving(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleFile(file) {
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setStep("extracting");
    setError(null);

    try {
      const form = new FormData();
      form.append("erc", file);
      const res = await apiFetch("/api/erc_scan.php", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Scan failed. Please try again.");
      }

      setRows(data.subjects || []);
      setStudent(data.student || null);
      setStep("review");
    } catch (err) {
      setError(err.message || "Something went wrong while scanning.");
      setStep("upload");
    }
  }

  function updateRow(id, field, value) {
    setRows((r) => r.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  }

  function removeRow(id) {
    setRows((r) => r.filter((row) => row.id !== id));
  }

  async function handleConfirm() {
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch("/api/subjects_bulk.php", {
        method: "POST",
        body: JSON.stringify({ subjects: rows }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Saving failed. Please try again.");
      }

      // Attach the real DB ids the backend generated, in insertion order.
      const saved = rows.map((row, i) => ({ ...row, id: data.ids?.[i] ?? row.id }));
      onImport?.(saved, student);
      handleClose();
    } catch (err) {
      setError(err.message || "Something went wrong while saving.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-navy/50 flex items-center justify-center px-4 z-50">
      <div className="bg-paper rounded-2xl shadow-card w-full max-w-2xl p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-xl font-semibold text-navy">Scan your ERC</h2>
            <p className="text-sm text-navy/50 mt-0.5">
              Upload a photo of your enrollment/registration card — AI reads it and builds your schedule.
            </p>
          </div>
          <button onClick={handleClose} className="text-navy/40 hover:text-navy shrink-0">
            <X size={20} />
          </button>
        </div>

        {error && step === "upload" && (
          <div className="flex items-center gap-2 mb-4 bg-red-50 rounded-lg px-3.5 py-2.5 text-sm text-red-700">
            <AlertTriangle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {step === "upload" && (
          <div
            className="border-2 border-dashed border-mist rounded-xl py-14 px-6 text-center hover:border-royal transition-colors cursor-pointer"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFile(e.dataTransfer.files?.[0]);
            }}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <div className="w-12 h-12 rounded-full bg-mist flex items-center justify-center mx-auto mb-3">
              <Camera size={22} className="text-royal" />
            </div>
            <p className="text-sm font-medium text-navy">Tap to take a photo or upload</p>
            <p className="text-xs text-navy/40 mt-1 flex items-center justify-center gap-1">
              <Upload size={12} /> JPG or PNG, one clear shot of your schedule
            </p>
          </div>
        )}

        {step === "extracting" && (
          <div className="py-14 text-center">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="ERC preview"
                className="w-40 mx-auto rounded-lg shadow-card mb-6 opacity-70"
              />
            )}
            <Loader2 size={28} className="animate-spin text-royal mx-auto mb-3" />
            <p className="text-sm font-medium text-navy">Reading your schedule…</p>
            <p className="text-xs text-navy/40 mt-1">This takes a few seconds</p>
          </div>
        )}

        {step === "review" && (
          <div>
            <div className="flex items-center gap-2 mb-4 bg-mist/60 rounded-lg px-3.5 py-2.5 text-sm text-navy/70">
              <Check size={16} className="text-royal shrink-0" />
              Found {rows.length} subjects. Check each one before saving — AI reads can miss a detail.
            </div>

            <div className="space-y-2 mb-6">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="border border-mist rounded-lg px-3.5 py-3"
                >
                  {editingId === row.id ? (
                    <div className="grid grid-cols-2 gap-2.5">
                      <input
                        value={row.name}
                        onChange={(e) => updateRow(row.id, "name", e.target.value)}
                        className="col-span-2 rounded-md border border-mist px-2.5 py-1.5 text-sm focus:border-royal outline-none"
                        placeholder="Subject name"
                      />
                      <input
                        value={row.code}
                        onChange={(e) => updateRow(row.id, "code", e.target.value)}
                        className="rounded-md border border-mist px-2.5 py-1.5 text-sm focus:border-royal outline-none"
                        placeholder="Code"
                      />
                      <input
                        value={row.room}
                        onChange={(e) => updateRow(row.id, "room", e.target.value)}
                        className="rounded-md border border-mist px-2.5 py-1.5 text-sm focus:border-royal outline-none"
                        placeholder="Room"
                      />
                      <select
                        value={row.day}
                        onChange={(e) => updateRow(row.id, "day", e.target.value)}
                        className="rounded-md border border-mist px-2.5 py-1.5 text-sm focus:border-royal outline-none"
                      >
                        {DAYS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <input
                          type="time"
                          value={row.start}
                          onChange={(e) => updateRow(row.id, "start", e.target.value)}
                          className="w-full rounded-md border border-mist px-2 py-1.5 text-sm focus:border-royal outline-none"
                        />
                        <input
                          type="time"
                          value={row.end}
                          onChange={(e) => updateRow(row.id, "end", e.target.value)}
                          className="w-full rounded-md border border-mist px-2 py-1.5 text-sm focus:border-royal outline-none"
                        />
                      </div>
                      <button
                        onClick={() => setEditingId(null)}
                        className="col-span-2 mt-1 text-sm font-semibold text-royal text-right"
                      >
                        Done editing
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-navy text-sm truncate">
                            {row.name} <span className="text-navy/40 font-normal">· {row.code}</span>
                          </p>
                          <p className="text-xs text-navy/50 mt-0.5">
                            {row.day} · {row.start}–{row.end} · {row.room}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setEditingId(row.id)}
                            className="p-1.5 rounded-md text-navy/40 hover:text-royal hover:bg-mist/60"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => removeRow(row.id)}
                            className="p-1.5 rounded-md text-navy/40 hover:text-red-600 hover:bg-mist/60"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                      {(() => {
                        const existingConflicts = findConflicts(subjects, row);
                        const scanConflicts = findConflicts(
                          rows.filter((r) => r.id !== row.id),
                          row
                        );
                        const conflict = existingConflicts[0] || scanConflicts[0];
                        if (!conflict) return null;
                        return (
                          <p className="flex items-center gap-1.5 text-xs text-amber-700 mt-2">
                            <AlertTriangle size={12} className="shrink-0" />
                            {scanConflicts[0] && !existingConflicts[0]
                              ? "This scan may have misread the time — it"
                              : "It"}{" "}
                            overlaps {toLabel(conflict.start)}–{toLabel(conflict.end)} with {conflict.name}. Double-check the times.
                          </p>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ))}
              {rows.length === 0 && (
                <p className="text-center text-sm text-navy/40 py-6">
                  No subjects left to import.
                </p>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 mb-4 bg-red-50 rounded-lg px-3.5 py-2.5 text-sm text-red-700">
                <AlertTriangle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep("upload")}
                disabled={saving}
                className="flex-1 rounded-lg border border-mist py-2.5 text-sm font-semibold text-navy/70 hover:bg-mist/40 disabled:opacity-40"
              >
                Rescan
              </button>
              <button
                onClick={handleConfirm}
                disabled={rows.length === 0 || saving}
                className="flex-1 rounded-lg bg-gold py-2.5 text-sm font-semibold text-navy hover:bg-gold/90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={15} className="animate-spin" />}
                {saving ? "Saving…" : `Save ${rows.length} subject${rows.length === 1 ? "" : "s"}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}