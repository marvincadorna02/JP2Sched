import { useState } from "react";
import { NavLink } from "react-router-dom";
import { LayoutGrid, BookOpen, CalendarDays, Settings, LogOut, X } from "lucide-react";
import logo from "../assets/logo.png";
import ConfirmModal from "./ConfirmModal.jsx";

const NAV = [
  { label: "Overview", icon: LayoutGrid, to: "/dashboard" },
  { label: "Subjects", icon: BookOpen, to: "/subjects" },
  { label: "Schedule", icon: CalendarDays, to: "/schedule" },
  { label: "Settings", icon: Settings, to: "/settings" },
];

export default function Sidebar({ open = false, onClose = () => {} }) {
  const [signOutOpen, setSignOutOpen] = useState(false);

  function confirmSignOut() {
    setSignOutOpen(false);
    window.location.href = "/login"; // ilisi diri kung naa kay actual signOut() function/auth call
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-navy flex flex-col transform transition-transform duration-200 md:static md:translate-x-0 md:shrink-0 md:min-h-screen ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 py-7 flex items-center gap-2.5">
          <img src={logo} alt="JP2Sched" className="w-9 h-9 rounded-full" />
          <span className="font-display text-paper text-lg font-semibold flex-1">JP2Sched</span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="md:hidden text-paper/80 hover:text-paper p-1 rounded-md hover:bg-royal/40"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-royal text-paper"
                    : "text-mist/70 hover:bg-royal/40 hover:text-paper"
                }`
              }
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-royal/20">
                  <button
          onClick={() => {
            onClose();
            setSignOutOpen(true);
          }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-mist/70 hover:bg-royal/40 hover:text-paper transition-colors"
          >
            <LogOut size={18} strokeWidth={2} />
            Sign out
          </button>
        </div>
      </aside>

      <ConfirmModal
        open={signOutOpen}
        title="Sign out?"
        message="You'll need to log in again to access your schedule."
        confirmLabel="Sign out"
        cancelLabel="Stay signed in"
        onConfirm={confirmSignOut}
        onCancel={() => setSignOutOpen(false)}
      />
    </>
  );
}