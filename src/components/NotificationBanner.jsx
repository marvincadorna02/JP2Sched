import { useEffect, useState, useRef } from "react";
import { Bell, X } from "lucide-react";
import { getUpcoming } from "../utils/schedule.js";

export default function NotificationBanner({ subjects }) {
  const [upcoming, setUpcoming] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());
  const notifiedRef = useRef(new Set()); // subject ids already pushed as a browser notification this session

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    function check() {
      const soon = getUpcoming(subjects, 15);
      setUpcoming(soon);

      if ("Notification" in window && Notification.permission === "granted") {
        soon.forEach((s) => {
          if (!notifiedRef.current.has(s.id)) {
            new Notification(`${s.name} starts in ${s.minsUntil} min`, {
              body: `${s.room} · ${s.day}`,
            });
            notifiedRef.current.add(s.id);
          }
        });
      }
    }
    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, [subjects]);

  const visible = upcoming.filter((s) => !dismissed.has(s.id));
  if (visible.length === 0) return null;

  return (
    <div className="mb-5 space-y-2">
      {visible.map((s) => (
        <div
          key={s.id}
          className="flex items-center justify-between gap-3 bg-gold/20 border border-gold/50 rounded-xl px-4 py-3"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center shrink-0">
              <Bell size={15} className="text-navy" />
            </div>
            <p className="text-sm text-navy">
              <span className="font-semibold">{s.name}</span> starts in{" "}
              <span className="font-semibold">{s.minsUntil} min</span> · {s.room}
            </p>
          </div>
          <button
            onClick={() => setDismissed((d) => new Set(d).add(s.id))}
            className="text-navy/40 hover:text-navy shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
