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
    <header className="sticky top-0 z-30 bg-[#faf7f3] border-b border-[#e8dfd3]">
      <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2">

        {/* LEFT */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 min-w-0">

          {/* Hamburger — mobile */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              aria-label="Open menu"
              className="lg:hidden w-9 h-9 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center text-[#8a7965] hover:text-[#5c1a1a] transition-colors flex-shrink-0"
            >
              <Menu size={16} strokeWidth={1.8} />
            </button>
          )}

          {/* Back */}
          <button
            onClick={onBack}
            aria-label="Back to dashboard"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-[#e8dfd3] bg-white text-[#5a4a3a] hover:border-[#5c1a1a]/40 hover:text-[#5c1a1a] transition-colors flex-shrink-0"
          >
            <ArrowLeft size={14} strokeWidth={1.8} />
            <span className="hidden sm:inline text-xs font-medium">
              Dashboard
            </span>
          </button>

          {/* Title */}
          <div className="min-w-0 hidden sm:block ml-1">
            <h1 className="text-sm lg:text-base font-semibold text-[#2a1f14] truncate">
              Analytics Dashboard
            </h1>
            <p className="hidden md:flex text-[11px] text-[#8a7965] items-center gap-1.5 truncate mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#5c1a1a] flex-shrink-0" />
              Student Performance & Insights
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">

          {/* Live clock — desktop */}
          <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-md border border-[#e8dfd3] bg-white">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#5c1a1a]" />
              <span className="text-[10px] tracking-[0.1em] uppercase text-[#5a4a3a] font-medium">
                Live
              </span>
            </div>
            <div className="w-px h-3.5 bg-[#e8dfd3]" />
            <div className="flex items-center gap-1.5 text-[#8a7965]">
              <Clock size={11} strokeWidth={1.8} />
              <span className="text-[11px] font-mono tabular-nums text-[#2a1f14]">
                {currentTime}
              </span>
            </div>
          </div>

          {/* Last updated — large screens */}
          <div className="hidden lg:block text-right px-2">
            <p className="text-[10px] tracking-[0.1em] uppercase text-[#8a7965]">
              Last Updated
            </p>
            <p className="text-xs font-semibold text-[#2a1f14] mt-0.5">
              Just now
            </p>
          </div>

          {/* Export */}
          <button
            aria-label="Export analytics"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-[#e8dfd3] bg-white text-[#5a4a3a] hover:border-[#5c1a1a]/40 hover:text-[#5c1a1a] transition-colors"
          >
            <Download size={14} strokeWidth={1.8} />
            <span className="hidden sm:inline text-xs font-medium">
              Export
            </span>
          </button>

          {/* Notifications */}
          <button
            aria-label="Notifications"
            className="relative w-9 h-9 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center text-[#8a7965] hover:text-[#5c1a1a] transition-colors"
          >
            <Bell size={15} strokeWidth={1.8} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#a83232]" />
          </button>

          {/* User */}
          <button
            aria-label="User profile"
            className="w-9 h-9 rounded-md bg-[#5c1a1a] flex items-center justify-center text-white hover:bg-[#4a1414] transition-colors flex-shrink-0"
          >
            <UserCircle2 size={18} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default AnalyticsNavbar;