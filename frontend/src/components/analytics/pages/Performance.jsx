import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Calendar, Lightbulb } from "lucide-react";
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
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const quickStats = [
    {
      label: "Total Quizzes",
      value: dashboard?.quiz?.total || 0,
      icon: TrendingUp,
      color: "text-indigo-500",
    },
    {
      label: "Avg Score",
      value: `${dashboard?.overview?.average_score || 0}%`,
      icon: TrendingUp,
      color: "text-emerald-500",
    },
    {
      label: "Study Time",
      value: `${dashboard?.overview?.study_time || 0}h`,
      icon: Calendar,
      color: "text-purple-500",
    },
    {
      label: "Insights",
      value: dashboard?.insights?.length || 0,
      icon: Lightbulb,
      color: "text-amber-500",
    },
  ];

  return (
    <motion.div
      className="space-y-5 sm:space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-3 sm:gap-4 mb-1 sm:mb-2"
      >
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
            Performance Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track your learning progress and quiz performance
          </p>
        </div>

        {/* Badges — wrap on small screens */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/50">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-medium text-emerald-700">
              Live Updates
            </span>
          </div>
          <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/50">
            <Sparkles size={13} className="text-indigo-500 flex-shrink-0" />
            <span className="text-[11px] sm:text-xs font-medium text-indigo-700">
              AI Analyzed
            </span>
          </div>
        </div>
      </motion.div>

      {/* Row 1: Summary + Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div variants={itemVariants} className="h-full min-w-0">
          <PerformanceSummary dashboard={dashboard} />
        </motion.div>
        <motion.div variants={itemVariants} className="h-full min-w-0">
          <PerformanceTrend dashboard={dashboard} />
        </motion.div>
      </div>

      {/* Row 2: Weekly Performance + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div variants={itemVariants} className="h-full min-w-0">
          <WeeklyPerformance dashboard={dashboard} />
        </motion.div>
        <motion.div variants={itemVariants} className="h-full min-w-0">
          <PerformanceInsights dashboard={dashboard} />
        </motion.div>
      </div>

      {/* Quick Stats Footer */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 pt-1 sm:pt-2"
      >
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="
                flex items-center gap-2 sm:gap-3
                p-2.5 sm:p-3 rounded-xl
                bg-white/50 backdrop-blur-sm
                border border-slate-200/50
                hover:shadow-sm hover:border-slate-300/60
                transition-all duration-200
                min-w-0
              "
            >
              <div className="p-1.5 sm:p-2 rounded-lg bg-slate-50 flex-shrink-0">
                <Icon size={14} className={`${stat.color} sm:hidden`} />
                <Icon size={16} className={`${stat.color} hidden sm:block`} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-slate-400 truncate">
                  {stat.label}
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-700 truncate">
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