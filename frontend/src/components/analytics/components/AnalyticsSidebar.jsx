import {
  LayoutDashboard,
  TrendingUp,
  BookOpen,
  Brain,
  Map,
  FileBarChart2,
  Sparkles,
  ChevronRight,
  BarChart3,
  Bot,
  Flame,
  Target,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    description: "Key metrics at a glance",
  },
  {
    id: "performance",
    label: "Performance",
    icon: TrendingUp,
    description: "Track your progress",
  },
  {
    id: "study",
    label: "Study",
    icon: BookOpen,
    description: "Learning analytics",
  },
  {
    id: "quiz",
    label: "Quiz",
    icon: Brain,
    description: "Assessment insights",
  },
  {
    id: "roadmaps",
    label: "Roadmaps",
    icon: Map,
    description: "Learning paths",
  },
  {
    id: "reports",
    label: "Reports",
    icon: FileBarChart2,
    description: "Detailed analysis",
  },
];

const comingSoon = [
  { label: "Weekly Reports", icon: BarChart3 },
  { label: "AI Insights", icon: Bot },
  { label: "Study Heatmap", icon: Flame },
  { label: "Goal Predictions", icon: Target },
];

function AnalyticsSidebar({ page, setPage, isMobile = false }) {
  const [isHovered, setIsHovered] = useState(null);

  // Container classes differ between desktop sidebar and mobile drawer body
  const containerClass = isMobile
    ? "w-full h-full bg-transparent flex flex-col overflow-hidden"
    : "sticky top-16 h-[calc(100vh-4rem)] w-72 bg-white/70 backdrop-blur-lg border-r border-slate-200/60 flex flex-col transition-all duration-300 overflow-hidden";

  return (
    <aside className={containerClass}>
      {/* Header — hidden on mobile (drawer already has its own header) */}
      {!isMobile && (
        <div className="flex-shrink-0 p-6 pb-4 border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-200/30">
              <Sparkles size={18} className="text-indigo-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                Analytics
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Insights & Reports
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation — scrollable */}
      <nav
        className={`
          flex-1 overflow-y-auto
          ${isMobile ? "px-2 py-3 space-y-0.5" : "px-3 py-4 space-y-1"}
        `}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = page === item.id;
          const hovered = isHovered === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              onMouseEnter={() => !isMobile && setIsHovered(item.id)}
              onMouseLeave={() => !isMobile && setIsHovered(null)}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={`
                group relative w-full flex items-center rounded-xl
                transition-all duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
                ${isMobile ? "gap-2.5 px-3 py-2.5" : "gap-3 px-4 py-3"}
                ${
                  active
                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm border border-indigo-200/50"
                    : "text-slate-600 hover:bg-slate-50/80 hover:text-slate-900"
                }
                ${hovered && !active && !isMobile ? "translate-x-1" : ""}
              `}
            >
              {/* Icon */}
              <div
                className={`
                  relative flex items-center justify-center rounded-lg
                  transition-all duration-200 flex-shrink-0
                  ${isMobile ? "w-8 h-8" : "w-9 h-9"}
                  ${
                    active
                      ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/25"
                      : "bg-slate-100/80 text-slate-500 group-hover:bg-slate-200/80 group-hover:text-slate-700"
                  }
                `}
              >
                <Icon size={isMobile ? 16 : 18} />
              </div>

              {/* Label + description */}
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`
                      font-medium transition-colors duration-200 truncate
                      ${isMobile ? "text-sm" : "text-sm"}
                      ${active ? "text-indigo-700" : "text-slate-600 group-hover:text-slate-800"}
                    `}
                  >
                    {item.label}
                  </span>
                  {active && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse flex-shrink-0" />
                  )}
                </div>
                {active && !isMobile && (
                  <p className="text-[10px] text-slate-400 font-medium truncate">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Chevron indicator */}
              {active && (
                <div className="flex-shrink-0">
                  <ChevronRight
                    size={16}
                    className="text-indigo-400"
                  />
                </div>
              )}

              {/* Hover glow — desktop only */}
              {hovered && !active && !isMobile && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 -z-10" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Coming Soon — hidden on mobile drawer to save space */}
      {!isMobile && (
        <div className="flex-shrink-0 p-4 border-t border-slate-200/60">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/80 border border-indigo-200/40 p-5 group hover:shadow-md transition-all duration-300">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-indigo-200/30 to-purple-200/30 blur-2xl group-hover:scale-150 transition-transform duration-500" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100/80 px-2.5 py-1 rounded-full border border-indigo-200/50">
                  Coming Soon
                </span>
                <Sparkles size={12} className="text-indigo-400" />
              </div>

              <ul className="space-y-2">
                {comingSoon.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-slate-600 group-hover:text-slate-700 transition-colors duration-200"
                    >
                      <div className="w-6 h-6 rounded-md bg-white/70 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                        <Icon size={13} className="text-indigo-500" />
                      </div>
                      <span className="font-medium truncate">
                        {item.label}
                      </span>
                      <span className="ml-auto text-[10px] text-slate-400 bg-white/50 px-2 py-0.5 rounded-full border border-slate-200/50 flex-shrink-0">
                        Soon
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default AnalyticsSidebar;