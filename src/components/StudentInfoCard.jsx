import { UserCircle } from "lucide-react";

const FIELDS = [
  { key: "school_id", label: "School ID" },
  { key: "year_level", label: "Year Level", format: "ordinal" },
  { key: "course", label: "Course", wide: true },
  { key: "program_type", label: "Program" },
];

// 1 -> 1st, 2 -> 2nd, 3 -> 3rd, 4 -> 4th, 11 -> 11th ...
// Non-numeric values (e.g. "Irregular") are returned as-is.
function ordinal(value) {
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return value;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  const suffix = { 1: "st", 2: "nd", 3: "rd" }[n % 10] || "th";
  return `${n}${suffix}`;
}

export default function StudentInfoCard({ profile }) {
  const p = profile || {};
  const hasName = !!p.full_name;

  return (
    <div className="bg-paper rounded-xl border border-mist px-4 sm:px-6 py-4 mb-5 grid grid-cols-[auto_1fr] items-center gap-x-4 sm:gap-x-5 gap-y-3 sm:gap-y-1">
      {/* Avatar: beside the name on mobile, beside name + details on desktop */}
      <div className="w-12 h-12 rounded-full bg-mist flex items-center justify-center shrink-0 sm:row-span-2">
        <UserCircle size={26} className="text-royal" />
      </div>

      <div className="min-w-0">
        <p className="font-display text-lg font-semibold text-navy sm:truncate">
          {hasName ? p.full_name : "Add your profile"}
        </p>
        {!hasName && (
          <p className="text-sm text-navy/75 mt-0.5">
            School ID, Year Level, Course, and Program not set yet.
          </p>
        )}
      </div>

      {hasName && (
        <div className="col-span-2 sm:col-span-1 sm:col-start-2 grid grid-cols-2 sm:flex sm:flex-wrap gap-x-6 gap-y-3 sm:gap-y-1">
          {FIELDS.map(({ key, label, format, wide }) => {
            const raw = p[key];
            const value = raw ? (format === "ordinal" ? ordinal(raw) : raw) : null;
            return (
              <div key={key} className={`text-sm ${wide ? "col-span-2 sm:col-span-1" : ""}`}>
                <span className="block sm:inline text-xs sm:text-sm text-navy/70">
                  {label}
                  <span className="hidden sm:inline">: </span>
                </span>
                <span className="block sm:inline text-navy font-semibold">
                  {value || <span className="text-navy/50 italic">—</span>}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}