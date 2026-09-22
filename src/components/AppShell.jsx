import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar.jsx";

// Shared layout: sidebar (drawer on mobile) + scrollable main area.
// `modals` renders outside <main> so they overlay the whole screen.
export default function AppShell({ children, modals }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
<<<<<<< HEAD
    <div className="flex h-screen bg-mist overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 min-w-0 overflow-y-auto scroll-thin">
        <div className="md:hidden sticky top-0 z-20 flex items-center gap-3 bg-navy px-4 py-3">
=======
    <div className="flex h-dvh bg-mist overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 min-w-0 overflow-y-auto scroll-thin">
        <div className="md:hidden sticky top-0 z-40 flex items-center gap-3 bg-navy px-4 py-3">
>>>>>>> d77093f789902576769632879df52f3756f7427c
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="text-paper p-1 -ml-1 rounded-md hover:bg-royal/40"
          >
            <Menu size={24} />
          </button>
          <span className="font-display text-paper text-lg font-semibold">JP2Sched</span>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-5 sm:py-8 animate-fade-in">{children}</div>
      </main>

      {modals}
    </div>
  );
}