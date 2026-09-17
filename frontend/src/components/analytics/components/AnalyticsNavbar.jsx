import {
  ArrowLeft,
  Bell,
  Download,
  UserCircle2,
  Clock,
  Menu,
} from "lucide-react";
import { useState, useEffect } from "react";

function AnalyticsNavbar({ onBack, onMenuClick }) {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200/60 shadow-sm">
      <div className="h-16 px-3 sm:px-4 lg:px-8 flex items-center justify-between gap-2">
        {/* LEFT SECTION */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0">
          {/* Hamburger — mobile only, opens the drawer */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              aria-label="Open menu"
              className="
                lg:hidden p-2 rounded-xl flex-shrink-0
                hover:bg-slate-100/80 active:scale-90
                transition-all duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
              "
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
          )}

          {/* Back button */}
          <button
            onClick={onBack}
            aria-label="Back to dashboard"
            className="
              group flex items-center gap-1.5 sm:gap-2
              px-2 sm:px-3 lg:px-4 py-2 rounded-xl
              hover:bg-slate-100/80 active:scale-95
              transition-all duration-200 hover:shadow-sm
              focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
              flex-shrink-0
            "
          >
            <ArrowLeft
              size={18}
              className="text-slate-500 group-hover:text-slate-700 transition-colors"
            />
            <span className="hidden sm:inline font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
              Dashboard
            </span>
          </button>

          {/* Divider — hidden on mobile */}
          <div className="hidden sm:block h-8 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent" />

          {/* Title block — hidden on very small screens */}
          <div className="min-w-0 hidden sm:block">
            <h1 className="text-base lg:text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent truncate">
              Analytics Dashboard
            </h1>
            <p className="hidden md:flex text-xs text-slate-400 font-medium items-center gap-1.5 truncate">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              Student Performance & Insights
            </p>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-shrink-0">
          {/* Live clock — desktop only */}
          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-200/50">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-700">
                Live
              </span>
            </div>
            <div className="w-px h-4 bg-emerald-200/50" />
            <div className="flex items-center gap-1.5 text-emerald-600">
              <Clock size={12} className="opacity-70" />
              <span className="text-xs font-mono font-medium tabular-nums">
                {currentTime}
              </span>
            </div>
          </div>

          {/* Last updated — large screens only */}
          <div className="hidden lg:block text-right">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              Last Updated
            </p>
            <p className="text-sm font-semibold text-slate-700">Just now</p>
          </div>

          {/* Export — icon-only on mobile */}
          <button
            aria-label="Export analytics"
            className="
              group flex items-center gap-2
              p-2 sm:px-4 sm:py-2 rounded-xl
              border border-slate-200/80 bg-white/50
              hover:bg-slate-50/80 hover:border-slate-300
              active:scale-95
              transition-all duration-200 hover:shadow-sm
              focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
            "
          >
            <Download
              size={18}
              className="text-slate-500 group-hover:text-slate-700 transition-colors"
            />
            <span className="hidden sm:inline text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
              Export
            </span>
          </button>

          {/* Notifications */}
          <button
            aria-label="Notifications"
            className="
              relative w-10 h-10 rounded-xl
              hover:bg-slate-100/80 active:scale-90
              flex items-center justify-center
              transition-all duration-200 hover:shadow-sm
              focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
            "
          >
            <Bell
              size={20}
              className="text-slate-500 hover:text-slate-700 transition-colors"
            />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {/* User profile */}
          <button
            aria-label="User profile"
            className="
              group w-10 h-10 rounded-full flex-shrink-0
              bg-gradient-to-br from-indigo-500 to-purple-500
              flex items-center justify-center
              shadow-lg shadow-indigo-500/25
              hover:shadow-indigo-500/40
              transition-all duration-300
              hover:scale-105 active:scale-95
              focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2
            "
          >
            <UserCircle2 size={22} className="text-white" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default AnalyticsNavbar;