import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { btnSecondary, btnDanger } from "../utils/ui.js";

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      let raf2;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        if (raf2) cancelAnimationFrame(raf2);
      };
    } else {
      setVisible(false);
      const timeout = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onCancel?.();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-navy/40 px-4 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onCancel}
    >
      <div
        className={`bg-paper rounded-2xl shadow-card p-5 sm:p-6 w-full max-w-sm transition-all duration-200 ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5 text-red-600">
            <AlertTriangle size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-navy">{title}</h2>
            {message && <p className="text-sm text-navy/75 mt-1">{message}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onCancel} className={btnSecondary}>
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className={btnDanger}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}