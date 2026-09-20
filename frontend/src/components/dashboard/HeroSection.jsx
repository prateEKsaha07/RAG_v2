import { useEffect, useState } from "react";
import {
  BookOpen,
  Book,
  Sparkles,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

function HeroSection({ user, subject, onUpload }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const username = user?.email?.split("@")[0] || "there";

  return (
    <section
      className={`
        relative bg-white border border-[#e8dfd3] rounded-lg
        p-6 sm:p-8
        transition-all duration-500
        ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
      `}
    >
      {/* Eyebrow */}
      <p className="text-[11px] tracking-[0.14em] uppercase text-[#8a7965] mb-3">
        Workspace Overview
      </p>

      {/* Greeting */}
      <h1 className="text-2xl sm:text-3xl font-bold text-[#2a1f14] leading-tight mb-2">
        Welcome back, {username}
      </h1>

      {/* Status line */}
      <p className="flex items-center gap-2 text-sm text-[#6a5a48] mb-7">
        <span className="w-1.5 h-1.5 rounded-full bg-[#a83232]" />
        {subject
          ? "Continue learning where you left off"
          : "Select a subject to begin your journey"}
      </p>

      {/* Subject card */}
      <div className="bg-[#faf7f3] border border-[#e8dfd3] rounded-md p-4 sm:p-5">
        <p className="text-[11px] tracking-[0.12em] uppercase text-[#8a7965] mb-3">
          Current Subject
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Subject display */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {subject ? (
              <>
                <div className="w-10 h-10 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center flex-shrink-0">
                  <Book size={18} strokeWidth={1.8} className="text-[#5c1a1a]" />
                </div>
                <span className="text-base sm:text-lg font-semibold text-[#2a1f14] truncate">
                  {subject}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-[#e8dfd3] rounded-full text-[11px] uppercase tracking-[0.08em] text-[#5a4a3a] flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a83232]" />
                  Active
                </span>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center flex-shrink-0">
                  <Sparkles size={18} strokeWidth={1.8} className="text-[#8a7965]" />
                </div>
                <span className="text-base sm:text-lg font-medium text-[#8a7965]">
                  No Subject Selected
                </span>
              </>
            )}
          </div>

          {/* Action button */}
          <button
            onClick={onUpload}
            className="
              w-full sm:w-auto
              inline-flex items-center justify-center gap-2
              px-5 py-2.5
              bg-[#5c1a1a] text-white
              hover:bg-[#4a1414]
              text-sm font-medium
              rounded-md
              transition-colors duration-200
              flex-shrink-0
            "
          >
            {subject ? (
              <>
                <RefreshCw size={15} strokeWidth={1.8} />
                Change Subject
              </>
            ) : (
              <>
                <Sparkles size={15} strokeWidth={1.8} />
                Select Subject
                <ArrowRight size={15} strokeWidth={1.8} />
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;