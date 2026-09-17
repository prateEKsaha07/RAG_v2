import { useEffect, useState } from "react";
import {
  Hand,
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
      className="
        relative overflow-hidden rounded-2xl
        bg-gradient-to-br from-rose-50/90 via-amber-50/70 to-orange-50/50
        shadow-lg shadow-rose-200/20
        p-6 sm:p-8
        transition-all duration-700
      "
    >
      {/* Floating orbs */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200/20 rounded-full blur-3xl animate-hero-float" />
      <div
        className="absolute bottom-0 left-0 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl animate-hero-float"
        style={{ animationDelay: "1.6s" }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-100/10 rounded-full blur-3xl animate-hero-float-slow" />

      <div className="relative z-10">
        {/* Greeting row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Hand className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500 animate-hand-wave origin-bottom-right" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
              <span className="text-gray-800">Welcome back, </span>
              <span className="bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                {username}
              </span>
            </h1>
          </div>
        </div>

        {/* Status line */}
        <p className="text-rose-500/80 flex items-center gap-2 text-sm sm:text-base animate-fade-up-slow">
          <span className="relative flex items-center justify-center w-2 h-2">
            <span className="absolute w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-75" />
            <span className="relative w-2 h-2 bg-emerald-500 rounded-full" />
          </span>
          {subject
            ? "Continue learning where you left off"
            : "Select a subject to begin your journey"}
        </p>

        {/* Subject card */}
        <div
          className={`
            mt-6 sm:mt-8
            p-4 sm:p-5
            bg-white/60 backdrop-blur-sm rounded-xl
            shadow-sm
            transition-all duration-700
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
          `}
          style={{ transitionDelay: mounted ? "180ms" : "0ms" }}
        >
          <p className="text-[11px] uppercase tracking-wider text-rose-500 font-semibold flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" />
            Current Subject
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mt-3">
            {/* Subject display */}
            <div className="flex items-center gap-3 flex-wrap flex-1">
              {subject ? (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-300 to-amber-300 rounded-xl blur-md opacity-40" />
                    <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 shadow-md animate-subject-pop">
                      <Book className="w-5 h-5 text-white" strokeWidth={2.2} />
                    </div>
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-rose-700 truncate max-w-[200px] sm:max-w-none">
                    {subject}
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full flex items-center gap-1.5">
                    <span className="relative flex w-1.5 h-1.5">
                      <span className="absolute w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping opacity-75" />
                      <span className="relative w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    </span>
                    Active
                  </span>
                </>
              ) : (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-200 to-rose-200 rounded-xl blur-md opacity-50" />
                    <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-amber-200 to-rose-200 shadow-sm">
                      <Sparkles
                        className="w-5 h-5 text-amber-700"
                        strokeWidth={2}
                      />
                    </div>
                  </div>
                  <span className="text-lg sm:text-xl font-semibold text-amber-600">
                    No Subject Selected
                  </span>
                </>
              )}
            </div>

            {/* Action button */}
            <button
              onClick={onUpload}
              className="
                group relative
                w-full sm:w-auto
                text-sm font-medium
                bg-gradient-to-r from-rose-500 to-amber-500
                hover:from-rose-600 hover:to-amber-600
                text-white
                px-5 py-2.5 rounded-full
                transition-all duration-300
                shadow-md shadow-rose-200/50
                hover:shadow-lg hover:shadow-rose-300/50
                hover:scale-[1.03] active:scale-[0.97]
                flex items-center justify-center gap-2
                overflow-hidden
              "
            >
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              {subject ? (
                <>
                  <RefreshCw className="w-4 h-4 relative z-10 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="relative z-10">Change Subject</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="relative z-10">Select Subject</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-0.5 transition-transform duration-300" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;