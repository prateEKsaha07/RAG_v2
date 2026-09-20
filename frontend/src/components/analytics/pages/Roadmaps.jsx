import { motion } from "framer-motion";
import { Map, Sparkles, Calendar, Target, TrendingUp } from "lucide-react";
import RoadmapSummary from "../widgets/RoadmapSummary";
import RoadmapStatus from "../widgets/RoadmapStatus";
import UpcomingDeadline from "../widgets/UpcomingDeadline";
import RoadmapOverview from "../widgets/RoadmapOverview";

function Roadmaps({ dashboard }) {
  const { roadmap } = dashboard;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const quickStats = [
    {
      label: "Active",
      fullLabel: "Active Roadmaps",
      value: roadmap.active || 0,
      icon: Map,
    },
    {
      label: "Completed",
      fullLabel: "Completed",
      value: roadmap.completed || 0,
      icon: Target,
    },
    {
      label: "Deadlines",
      fullLabel: "Upcoming Deadlines",
      value: roadmap.upcoming_deadlines?.length || 0,
      icon: Calendar,
    },
    {
      label: "Progress",
      fullLabel: "Progress",
      value: `${roadmap.progress || 0}%`,
      icon: TrendingUp,
    },
  ];

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
      >
        <div className="min-w-0">
          <p className="text-[11px] tracking-[0.14em] uppercase text-[#8a7965] mb-1.5">
            Roadmaps
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2a1f14] mb-1.5">
            Learning Roadmaps
          </h1>
          <p className="text-sm text-[#8a7965]">
            Track your learning paths and achieve your goals
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#e8dfd3] bg-white">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5c1a1a]" />
            <span className="text-[10px] tracking-[0.1em] uppercase text-[#5a4a3a] font-medium">
              Active
            </span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#e8dfd3] bg-white">
            <Map size={11} strokeWidth={1.8} className="text-[#5c1a1a]" />
            <span className="text-[10px] tracking-[0.1em] uppercase text-[#5a4a3a] font-medium">
              {roadmap.active || 0} Active
            </span>
          </div>
        </div>
      </motion.div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <motion.div variants={itemVariants} className="h-full min-w-0">
          <RoadmapSummary roadmap={roadmap} />
        </motion.div>
        <motion.div variants={itemVariants} className="h-full min-w-0">
          <UpcomingDeadline roadmap={roadmap} />
        </motion.div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <motion.div variants={itemVariants} className="h-full min-w-0">
          <RoadmapStatus roadmap={roadmap} />
        </motion.div>
        <motion.div variants={itemVariants} className="h-full min-w-0">
          <RoadmapOverview roadmap={roadmap} />
        </motion.div>
      </div>

      {/* Quick stats */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2"
      >
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white border border-[#e8dfd3] rounded-lg p-4 flex items-center gap-3 min-w-0"
            >
              <div className="w-9 h-9 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center flex-shrink-0">
                <Icon size={15} strokeWidth={1.8} className="text-[#5c1a1a]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] tracking-[0.1em] uppercase text-[#8a7965] truncate">
                  <span className="sm:hidden">{stat.label}</span>
                  <span className="hidden sm:inline">{stat.fullLabel}</span>
                </p>
                <p className="text-sm font-semibold text-[#2a1f14] truncate mt-0.5 tabular-nums">
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

export default Roadmaps;