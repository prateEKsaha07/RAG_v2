import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Brain,
  MessageCircle,
  Upload,
  BarChart3,
  Map,
  Lock,
  ArrowRight,
} from "lucide-react";

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
  onNotes = () => {},
  onQA = () => {},
  onQuiz = () => {},
  onUpload = () => {},
  onAnalytics = () => {},
  onRoadmap = () => {},
  isDisabled = false,
}) {
  const [sectionRef, sectionInView] = useInView({ threshold: 0.1 });

  const actions = [
    { title: "My Notes",       description: "Create and manage notes",                  icon: FileText,      action: onNotes },
    { title: "Ask AI",         description: "Ask questions from your study material",   icon: MessageCircle, action: onQA },
    { title: "Take Quiz",      description: "Generate an AI quiz",                       icon: Brain,         action: onQuiz },
    { title: "Study Material", description: "Upload or switch subjects",                 icon: Upload,        action: onUpload },
    { title: "Analytics",      description: "Track your progress",                       icon: BarChart3,     action: onAnalytics },
    { title: "Roadmap",        description: "Manage your study plan",                    icon: Map,           action: onRoadmap },
  ];

  return (
    <section ref={sectionRef} className="mt-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-5">
        <div>
          <p className="text-[11px] tracking-[0.14em] uppercase text-[#8a7965] mb-1.5">
            Quick Access Portal
          </p>
          <h2 className="text-2xl font-bold text-[#2a1f14]">
            Quick Actions
          </h2>
        </div>

        {!isDisabled ? (
          <span className="self-start sm:self-auto inline-flex items-center gap-2 text-[11px] tracking-[0.08em] uppercase text-[#3a2a1a] px-3 py-1.5 border border-[#e8dfd3] rounded-md bg-white">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5c1a1a]" />
            All Features Unlocked
          </span>
        ) : (
          <span className="self-start sm:self-auto inline-flex items-center gap-2 text-[11px] tracking-[0.08em] uppercase text-[#8a7965] px-3 py-1.5 border border-[#e8dfd3] rounded-md bg-white">
            <Lock size={11} strokeWidth={1.8} />
            Locked State
          </span>
        )}
      </div>

      {/* Grid */}
      <div className="relative">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((item, idx) => {
            const Icon = item.icon;

            return (
              <button
                key={item.title}
                onClick={isDisabled ? undefined : item.action}
                disabled={isDisabled}
                aria-label={item.title}
                style={{
                  transitionDelay: sectionInView ? `${idx * 60}ms` : "0ms",
                }}
                className={`
                  group relative bg-white rounded-lg p-5 text-left
                  border border-[#e8dfd3]
                  transition-all duration-300 ease-out
                  ${
                    isDisabled
                      ? "cursor-not-allowed opacity-50"
                      : "hover:border-[#5c1a1a]/40 hover:bg-[#faf7f3]"
                  }
                  focus:outline-none focus-visible:border-[#5c1a1a]
                  ${
                    sectionInView
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2"
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-md border border-[#e8dfd3] flex items-center justify-center flex-shrink-0 bg-[#faf7f3]">
                    <Icon
                      size={18}
                      strokeWidth={1.8}
                      className={isDisabled ? "text-[#a89880]" : "text-[#5c1a1a]"}
                    />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-[15px] font-semibold truncate ${
                        isDisabled ? "text-[#8a7965]" : "text-[#2a1f14]"
                      }`}
                    >
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#8a7965] mt-0.5 truncate">
                      {item.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  {!isDisabled && (
                    <ArrowRight
                      size={16}
                      strokeWidth={1.8}
                      className="text-[#8a7965] group-hover:text-[#5c1a1a] group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0"
                    />
                  )}

                  {/* Lock badge */}
                  {isDisabled && (
                    <Lock size={14} strokeWidth={1.8} className="text-[#a89880] flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Locked overlay */}
        {isDisabled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-[#faf7f3] border border-[#e8dfd3] rounded-lg px-8 py-7 text-center shadow-sm max-w-sm mx-4">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[#5c1a1a] flex items-center justify-center">
                <Lock size={16} strokeWidth={2} className="text-white" />
              </div>
              <p className="text-[15px] font-semibold text-[#2a1f14] mb-1">
                Select subject to unlock
              </p>
              <p className="text-xs text-[#8a7965] leading-relaxed">
                Select a subject from the hero section above to unlock all quick actions
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default QuickActions;