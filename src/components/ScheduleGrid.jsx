import { Fragment } from "react";
import { DAYS, toDecimal, toLabel } from "../utils/schedule.js";

const START_HOUR = 7;
const DEFAULT_END_HOUR = 19;

const COLOR_CYCLE = [
  "bg-royal text-paper",
  "bg-gold text-navy",
  "bg-navy text-paper",
  "bg-emerald-700 text-paper",
  "bg-rose-600 text-paper",
  "bg-violet-700 text-paper",
];

const TIME_CELL = "sticky left-0 z-20 bg-paper border-b border-mist text-right pr-2 text-xs sm:text-sm font-semibold text-navy pt-1";

export default function ScheduleGrid({ subjects, onBlockClick }) {
  const rowHeight = 72;

  const colorByName = {};
[...new Set(subjects.map((s) => s.name))].sort().forEach((name, i) => {
  colorByName[name] = COLOR_CYCLE[i % COLOR_CYCLE.length];
});
  // Only clickable when a handler is passed (Overview); plain block otherwise (Schedule)
  const Block = onBlockClick ? "button" : "div";

  // Extend the grid past the default cutoff whenever a class runs later,
  // so late-evening blocks (e.g. 6–8PM) don't get clipped at the bottom.
  const latestEnd = subjects.reduce((max, s) => Math.max(max, toDecimal(s.end)), DEFAULT_END_HOUR);
  const END_HOUR = Math.max(DEFAULT_END_HOUR, Math.ceil(latestEnd)) + 1;
  const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

  return (
    <div className="isolate bg-paper rounded-2xl shadow-card overflow-hidden">
      {/* Scrolls sideways on small screens; time column stays pinned */}
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
              <div className="sticky left-0 z-20 bg-paper text-right pr-2 text-xs sm:text-sm font-semibold text-navy pt-1 h-6">
                  <span className="relative -top-2 bg-paper px-0.5">{toLabel(`${END_HOUR}:00`)}</span>
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
                const startDec = toDecimal(s.start);
                const durationHrs = toDecimal(s.end) - startDec;
                const offset = (startDec - h) * rowHeight;
                const count = slotSubjects.length;
                const widthPct = 100 / count;
                return (
                  <Block
                    key={s.id}
                    onClick={onBlockClick ? () => onBlockClick(s) : undefined}
                    className={`absolute rounded-md px-2 py-1.5 text-left z-10 overflow-hidden ${
                      onBlockClick ? "hover:brightness-95 transition-all" : ""
                    } ${colorByName[s.name]}`}
                    style={{
                      top: offset,
                      height: durationHrs * rowHeight - 1,
                      left: `calc(${i * widthPct}% + 2px)`,
                      width: `calc(${widthPct}% - 4px)`,
                    }}
                  >
                    <p className="text-sm font-bold leading-tight line-clamp-2">{s.name}</p>
                    <p className="text-xs font-medium leading-tight mt-0.5">
                      {s.room} · {toLabel(s.start)}–{toLabel(s.end)}
                    </p>
                  </Block>
                );
              })}
                  </div>
                );
              })}
            </Fragment>
          ))}

          <div className="sticky left-0 z-20 bg-paper text-right pr-2 text-xs font-medium text-navy/70 pt-1">
            {toLabel(`${END_HOUR}:00`)}
          </div>
          {DAYS.map((d) => (
            <div key={`cap-${d}`} className="border-l border-mist" />
          ))}
        </div>
      </div>
    </div>
  );
}