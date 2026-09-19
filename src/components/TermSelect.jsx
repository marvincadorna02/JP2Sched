import { useState } from "react";
import { Plus } from "lucide-react";
import { SEMESTERS, makeTerm, parseTerm, schoolYearOptions } from "../utils/terms.js";

const fieldClass =
  "w-full bg-paper border border-navy/20 text-navy text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-royal/40";

export default function TermSelect({ term, terms, onChange, onCreate }) {
  const [creating, setCreating] = useState(false);
  const current = parseTerm(term);
  const [sy, setSy] = useState(current.schoolYear);
  const [sem, setSem] = useState(SEMESTERS[0]);

  const years = [...new Set([current.schoolYear, ...schoolYearOptions()].filter(Boolean))].sort();

  function create() {
    onCreate(makeTerm(sy || years[0], sem));
    setCreating(false);
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <select
          value={term}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Semester"
          className="bg-paper border border-navy/20 text-navy font-semibold text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-royal/40"
        >
          {terms.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {onCreate && (
          <button
            onClick={() => {
              setSy(current.schoolYear || years[0]);
              setCreating((v) => !v);
            }}
            aria-label="New semester"
            title="New semester"
            className="p-2.5 rounded-lg border border-royal/30 bg-paper text-royal hover:bg-royal/5 transition-colors"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {creating && (
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 z-30 w-64 bg-paper rounded-xl shadow-card border border-mist p-4 space-y-3">
          <p className="text-sm font-semibold text-navy">New semester</p>
          <select value={sy} onChange={(e) => setSy(e.target.value)} className={fieldClass}>
            {years.map((y) => (
              <option key={y} value={y}>
                SY {y}
              </option>
            ))}
          </select>
          <select value={sem} onChange={(e) => setSem(e.target.value)} className={fieldClass}>
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="flex gap-2 pt-1">
            <button
              onClick={create}
              className="flex-1 bg-gold text-navy font-semibold text-sm py-2 rounded-lg hover:bg-gold/90"
            >
              Create
            </button>
            <button
              onClick={() => setCreating(false)}
              className="flex-1 text-navy/75 font-semibold text-sm py-2 rounded-lg border border-navy/20 hover:bg-mist"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}