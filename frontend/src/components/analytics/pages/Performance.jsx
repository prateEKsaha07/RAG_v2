import { motion } from "framer-motion";
import { TrendingUp, Calendar, Lightbulb, Sparkles } from "lucide-react";
import PerformanceSummary from "../widgets/PerformanceSummary";
import WeeklyPerformance from "../widgets/WeeklyPerformance";
import PerformanceTrend from "../widgets/PerformanceTrend";
import PerformanceInsights from "../widgets/PerformanceInsights";

function Performance({ dashboard }) {
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
      label: "Total Quizzes",
      value: dashboard?.quiz?.total || 0,
      icon: TrendingUp,
    },
    {
      label: "Avg Score",
      value: `${dashboard?.overview?.average_score || 0}%`,
      icon: TrendingUp,
    },
    {
      label: "Study Time",
      value: `${dashboard?.overview?.study_time || 0}h`,
      icon: Calendar,
    },
    {
      label: "Insights",
      value: dashboard?.insights?.length || 0,
      icon: Lightbulb,
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
            Performance
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2a1f14] mb-1.5">
            Performance Analytics
          </h1>
          <p className="text-sm text-[#8a7965]">
            Track your learning progress and quiz performance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#e8dfd3] bg-white">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5c1a1a]" />
            <span className="text-[10px] tracking-[0.1em] uppercase text-[#5a4a3a] font-medium">
              Live Updates
            </span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#e8dfd3] bg-white">
            <Sparkles size={11} strokeWidth={1.8} className="text-[#5c1a1a]" />
            <span className="text-[10px] tracking-[0.1em] uppercase text-[#5a4a3a] font-medium">
              AI Analyzed
            </span>
          </div>
        </div>
      </motion.div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <motion.div variants={itemVariants} className="h-full min-w-0">
          <PerformanceSummary dashboard={dashboard} />
        </motion.div>
        <motion.div variants={itemVariants} className="h-full min-w-0">
          <PerformanceTrend dashboard={dashboard} />
        </motion.div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <motion.div variants={itemVariants} className="h-full min-w-0">
          <WeeklyPerformance dashboard={dashboard} />
        </motion.div>
        <motion.div variants={itemVariants} className="h-full min-w-0">
          <PerformanceInsights dashboard={dashboard} />
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
                  {stat.label}
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

export default Performance;