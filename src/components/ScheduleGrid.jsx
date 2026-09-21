import { Fragment } from "react";
import { DAYS, toDecimal, toLabel } from "../utils/schedule.js";

const START_HOUR = 7;
const DEFAULT_END_HOUR = 19;

const COLOR_CYCLE = [
  { bg: "bg-gradient-to-br from-blue-600 to-indigo-700", bar: "border-blue-900", text: "text-white" },
  { bg: "bg-gradient-to-br from-amber-400 to-orange-500", bar: "border-orange-700", text: "text-amber-950" },
  { bg: "bg-gradient-to-br from-indigo-600 to-violet-700", bar: "border-indigo-900", text: "text-white" },
  { bg: "bg-gradient-to-br from-emerald-500 to-teal-600", bar: "border-teal-800", text: "text-white" },
  { bg: "bg-gradient-to-br from-rose-500 to-pink-600", bar: "border-rose-800", text: "text-white" },
  { bg: "bg-gradient-to-br from-violet-500 to-purple-700", bar: "border-purple-900", text: "text-white" },
];

const TIME_CELL =
  "sticky left-0 z-20 bg-paper border-b border-mist text-right pr-2 text-xs sm:text-sm font-semibold text-navy pt-1";

export default function ScheduleGrid({ subjects, onBlockClick }) {
  const rowHeight = 72;

  const colorByName = {};
  [...new Set(subjects.map((s) => s.name))].sort().forEach((name, i) => {
    colorByName[name] = COLOR_CYCLE[i % COLOR_CYCLE.length];
  });

  const Block = onBlockClick ? "button" : "div";

  const latestEnd = subjects.reduce(
    (max, s) => Math.max(max, toDecimal(s.end)),
    DEFAULT_END_HOUR
  );
  const END_HOUR = Math.max(DEFAULT_END_HOUR, Math.ceil(latestEnd)) + 1;
  const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

  return (
    <div className="isolate bg-paper rounded-2xl shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <div
          className="grid min-w-[840px]"
          style={{ gridTemplateColumns: "64px repeat(6, minmax(120px, 1fr))" }}
        >
          <div className="sticky left-0 z-20 bg-paper border-b border-mist" />
          {DAYS.map((d) => (
            <div
              key={d}
              className="border-b border-l border-mist px-2 py-3 text-center text-sm font-semibold text-navy"
            >
              {d}
            </div>
          ))}

          {HOURS.map((h) => (
            <Fragment key={h}>
              <div className={TIME_CELL} style={{ height: rowHeight }}>
                <span className="relative -top-2 bg-paper px-0.5">{toLabel(`${h}:00`)}</span>
              </div>
              {DAYS.map((d) => {
                const slotSubjects = subjects.filter(
                  (s) => s.day === d && Math.floor(toDecimal(s.start)) === h
                );
                return (
                  <div
                    key={`${d}-${h}`}
                    className="border-b border-l border-mist relative"
                    style={{ height: rowHeight }}
                  >
                    {slotSubjects.map((s, i) => {
                      const c = colorByName[s.name];
                      const startDec = toDecimal(s.start);
                      const durationHrs = toDecimal(s.end) - startDec;
                      const offset = (startDec - h) * rowHeight;
                      const count = slotSubjects.length;
                      const widthPct = 100 / count;
                      return (
                        <Block
                          key={s.id}
                          onClick={onBlockClick ? () => onBlockClick(s) : undefined}
                          className={`absolute rounded-lg border-l-4 pl-2.5 pr-2 py-1.5 text-left z-10 overflow-hidden shadow-sm ${
                            onBlockClick ? "hover:shadow-md hover:-translate-y-px transition-all" : ""
                          } ${c.bg} ${c.bar} ${c.text}`}
                          style={{
                            top: offset,
                            height: durationHrs * rowHeight - 1,
                            left: `calc(${i * widthPct}% + 2px)`,
                            width: `calc(${widthPct}% - 4px)`,
                          }}
                        >
                          <p className="text-sm font-bold leading-tight line-clamp-2">{s.name}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-1 text-xs font-semibold">
                            <span className="rounded bg-white/80 px-1.5 py-0.5">{s.room}</span>
                            <span className="opacity-80">{toLabel(s.start)}–{toLabel(s.end)}</span>
                          </div>
                        </Block>
                      );
                    })}
                  </div>
                );
              })}
            </Fragment>
          ))}

          <div className="sticky left-0 z-20 bg-paper text-right pr-2 text-xs sm:text-sm font-semibold text-navy pt-1 h-6">
            <span className="relative -top-2 bg-paper px-0.5">{toLabel(`${END_HOUR}:00`)}</span>
          </div>
          {DAYS.map((d) => (
            <div key={`cap-${d}`} className="border-l border-mist h-6" />
          ))}
        </div>
      </div>
    </div>
  );
}