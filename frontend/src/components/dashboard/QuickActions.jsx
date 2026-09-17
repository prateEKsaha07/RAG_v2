import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Brain,
  MessageCircle,
  Upload,
  BarChart3,
  Map,
  Lock,
  Zap,
  Lightbulb,
  ArrowRight,
} from "lucide-react";

// ============================================================
// Hook: useInView
// ============================================================
function useInView(options = { threshold: 0.15, once: true }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (options.once) observer.unobserve(el);
        } else if (!options.once) {
          setInView(false);
        }
      },
      { threshold: options.threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [options.threshold, options.once]);

  return [ref, inView];
}

function QuickActions({
  onNotes,
  onQA,
  onQuiz,
  onUpload,
  onAnalytics,
  onRoadmap,
  isDisabled = false,
}) {
  const [sectionRef, sectionInView] = useInView({ threshold: 0.1 });

  const actions = [
    {
      title: "My Notes",
      description: "Create and manage notes",
      icon: FileText,
      tileGradient: "from-purple-500 to-fuchsia-500",
      glow: "shadow-purple-200/50",
      hoverBg: "group-hover:bg-purple-50/60",
      ring: "group-hover:ring-purple-200/60",
      accentText: "text-purple-600",
    },
    {
      title: "Ask AI",
      description: "Ask questions from your study material",
      icon: MessageCircle,
      tileGradient: "from-emerald-500 to-teal-500",
      glow: "shadow-emerald-200/50",
      hoverBg: "group-hover:bg-emerald-50/60",
      ring: "group-hover:ring-emerald-200/60",
      accentText: "text-emerald-600",
    },
    {
      title: "Take Quiz",
      description: "Generate an AI quiz",
      icon: Brain,
      tileGradient: "from-blue-500 to-cyan-500",
      glow: "shadow-blue-200/50",
      hoverBg: "group-hover:bg-blue-50/60",
      ring: "group-hover:ring-blue-200/60",
      accentText: "text-blue-600",
    },
    {
      title: "Study Material",
      description: "Upload or switch subjects",
      icon: Upload,
      tileGradient: "from-orange-500 to-amber-500",
      glow: "shadow-orange-200/50",
      hoverBg: "group-hover:bg-orange-50/60",
      ring: "group-hover:ring-orange-200/60",
      accentText: "text-orange-600",
    },
    {
      title: "Analytics",
      description: "Track your progress",
      icon: BarChart3,
      tileGradient: "from-pink-500 to-rose-500",
      glow: "shadow-pink-200/50",
      hoverBg: "group-hover:bg-pink-50/60",
      ring: "group-hover:ring-pink-200/60",
      accentText: "text-pink-600",
    },
    {
      title: "Roadmap",
      description: "Manage your study plan",
      icon: Map,
      tileGradient: "from-cyan-500 to-sky-500",
      glow: "shadow-cyan-200/50",
      hoverBg: "group-hover:bg-cyan-50/60",
      ring: "group-hover:ring-cyan-200/60",
      accentText: "text-cyan-600",
    },
  ];

  return (
    <section ref={sectionRef} className="mt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-100 to-rose-100 animate-icon-breathe">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" fill="currentColor" />
          </div>
          Quick Actions
        </h2>

        {isDisabled && (
          <span className="self-start sm:self-auto text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-amber-200/50">
            <Lock size={12} />
            Select subject to unlock
          </span>
        )}
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((item, idx) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              onClick={isDisabled ? undefined : item.action}
              disabled={isDisabled}
              aria-label={item.title}
              style={{
                transitionDelay: sectionInView ? `${idx * 70}ms` : "0ms",
              }}
              className={`
                group relative bg-white rounded-2xl p-5 sm:p-6 text-left
                ring-1 ring-gray-100/80
                transition-all duration-500 ease-out
                ${
                  isDisabled
                    ? "opacity-60 cursor-not-allowed"
                    : `
                      hover:shadow-xl hover:shadow-gray-200/40
                      hover:-translate-y-1 hover:scale-[1.015]
                      active:scale-[0.985]
                      ${item.hoverBg}
                      ${item.ring}
                      ring-gray-100/80
                    `
                }
                focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2
                ${
                  sectionInView
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }
              `}
            >
              {/* Soft gradient wash in background */}
              {!isDisabled && (
                <div
                  className={`
                    pointer-events-none absolute inset-0 rounded-2xl
                    bg-gradient-to-br ${item.tileGradient}
                    opacity-0 group-hover:opacity-[0.04]
                    transition-opacity duration-500
                  `}
                />
              )}

              {/* Icon tile */}
              <div
                className={`
                  relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl
                  flex items-center justify-center mb-4 sm:mb-5
                  transition-all duration-300
                  ${
                    isDisabled
                      ? "bg-gray-100"
                      : `bg-gradient-to-br ${item.tileGradient} shadow-lg ${item.glow} group-hover:scale-110 group-hover:rotate-3`
                  }
                `}
              >
                <Icon
                  size={24}
                  className={isDisabled ? "text-gray-400" : "text-white"}
                  strokeWidth={2.2}
                />
              </div>

              {/* Title row with arrow */}
              <div className="flex items-center justify-between gap-2">
                <h3
                  className={`font-bold text-base sm:text-lg transition-colors duration-300 ${
                    isDisabled ? "text-gray-400" : "text-gray-800"
                  }`}
                >
                  {item.title}
                </h3>
                {!isDisabled && (
                  <ArrowRight
                    className={`
                      w-4 h-4 ${item.accentText}
                      opacity-0 -translate-x-2
                      group-hover:opacity-100 group-hover:translate-x-0
                      transition-all duration-300
                    `}
                  />
                )}
              </div>

              {/* Description */}
              <p
                className={`mt-1.5 text-xs sm:text-sm transition-colors duration-300 ${
                  isDisabled ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {item.description}
              </p>

              {/* Lock badge — small, inline */}
              {isDisabled && (
                <div className="absolute top-4 right-4">
                  <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200/50">
                    <Lock size={12} className="text-amber-500" />
                  </div>
                </div>
              )}

              {/* Bottom accent line on hover */}
              {!isDisabled && (
                <div
                  className={`
                    absolute bottom-0 left-6 right-6 h-0.5 rounded-full
                    bg-gradient-to-r ${item.tileGradient}
                    opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100
                    transition-all duration-500 origin-center
                  `}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Disabled hint */}
      {isDisabled && (
        <div className="mt-4 p-4 bg-amber-50/70 rounded-xl border border-amber-200/40 text-center animate-fade-up-slow">
          <p className="text-sm text-amber-700 flex items-center justify-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>
              Select a subject from the hero section above to unlock all quick actions
            </span>
          </p>
        </div>
      )}
    </section>
  );
}

export default QuickActions;