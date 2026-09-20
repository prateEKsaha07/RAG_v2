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
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "performance", label: "Performance", icon: TrendingUp },
  { id: "study", label: "Study", icon: BookOpen },
  { id: "quiz", label: "Quiz", icon: Brain },
  { id: "roadmaps", label: "Roadmaps", icon: Map },
  { id: "reports", label: "Reports", icon: FileBarChart2 },
];

const comingSoon = [
  { label: "Weekly Reports", icon: BarChart3 },
  { label: "AI Insights", icon: Bot },
  { label: "Study Heatmap", icon: Flame },
  { label: "Goal Predictions", icon: Target },
];

function AnalyticsSidebar({ page, setPage, isMobile = false }) {
  const [isHovered, setIsHovered] = useState(null);

  const containerClass = isMobile
    ? "w-full h-full bg-transparent flex flex-col overflow-hidden"
    : "sticky top-16 h-[calc(100vh-4rem)] w-72 bg-[#faf7f3] border-r border-[#e8dfd3] flex flex-col overflow-hidden";

  return (
    <aside className={containerClass}>

      {/* Header — desktop only */}
      {!isMobile && (
        <div className="flex-shrink-0 px-6 py-5 border-b border-[#e8dfd3]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center">
              <Sparkles size={14} strokeWidth={1.8} className="text-[#5c1a1a]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#2a1f14]">
                Analytics
              </h2>
              <p className="text-[11px] text-[#8a7965] mt-0.5">
                Insights & Reports
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav
        className={`flex-1 overflow-y-auto ${
          isMobile ? "px-2 py-3 space-y-0.5" : "px-3 py-4 space-y-0.5"
        }`}
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
                group relative w-full flex items-center rounded-md
                transition-colors duration-150
                focus:outline-none focus-visible:border-[#5c1a1a]
                ${isMobile ? "gap-2.5 px-3 py-2.5" : "gap-3 px-3 py-2.5"}
                ${
                  active
                    ? "bg-[#f0e9e0] text-[#5c1a1a]"
                    : "text-[#5a4a3a] hover:bg-[#f0e9e0]/60"
                }
              `}
            >
              {/* Active bar */}
              {active && (
                <span className="absolute left-0 top-0 h-full w-[3px] bg-[#5c1a1a]" />
              )}

              {/* Icon */}
              <div
                className={`flex items-center justify-center rounded-md flex-shrink-0 ${
                  isMobile ? "w-7 h-7" : "w-8 h-8"
                } ${
                  active
                    ? "bg-white border border-[#e8dfd3] text-[#5c1a1a]"
                    : "border border-transparent text-[#8a7965] group-hover:text-[#5c1a1a]"
                }`}
              >
                <Icon size={isMobile ? 14 : 15} strokeWidth={1.8} />
              </div>

              {/* Label */}
              <div className="flex-1 text-left min-w-0">
                <span
                  className={`text-sm truncate block ${
                    active
                      ? "font-medium text-[#5c1a1a]"
                      : "text-[#5a4a3a]"
                  }`}
                >
                  {item.label}
                </span>
              </div>

              {/* Chevron */}
              {active && (
                <ChevronRight
                  size={14}
                  strokeWidth={1.8}
                  className="text-[#5c1a1a] flex-shrink-0"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Coming Soon — desktop only */}
      {!isMobile && (
        <div className="flex-shrink-0 p-4 border-t border-[#e8dfd3]">
          <div className="rounded-lg bg-white border border-[#e8dfd3] p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] tracking-[0.12em] uppercase text-[#8a7965] border border-[#e8dfd3] bg-[#faf7f3] px-2 py-0.5 rounded-full font-medium">
                Coming Soon
              </span>
              <Sparkles size={11} strokeWidth={1.8} className="text-[#5c1a1a]" />
            </div>

            <ul className="space-y-2">
              {comingSoon.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li
                    key={index}
                    className="flex items-center gap-2.5 text-xs text-[#6a5a48]"
                  >
                    <div className="w-6 h-6 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center flex-shrink-0">
                      <Icon size={12} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    </div>
                    <span className="truncate">
                      {item.label}
                    </span>
                    <span className="ml-auto text-[9px] tracking-[0.08em] uppercase text-[#8a7965] border border-[#e8dfd3] bg-[#faf7f3] px-1.5 py-0.5 rounded-full flex-shrink-0">
                      Soon
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </aside>
  );
}

export default AnalyticsSidebar;