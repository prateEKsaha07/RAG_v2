import { motion } from "framer-motion";
import {
  FileBarChart2,
  Sparkles,
  TrendingUp,
  Calendar,
  Download,
  Share2,
} from "lucide-react";
import OverallReport from "../widgets/OverallReport";
import LearningResources from "../widgets/LearningResources";
import QuizReport from "../widgets/QuizReport";
import ActivitySummary from "../widgets/ActivitySummary";

function Reports({ dashboard }) {
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

  // Same calculations as before
  const totalActivities =
    dashboard?.overview?.books + dashboard?.overview?.notes || 0;
  const totalQuizzes = dashboard?.quiz?.total_attempts || 0;

  const quickStats = [
    {
      label: "Total Resources",
      value: totalActivities,
      icon: FileBarChart2,
      color: "text-indigo-500",
    },
    {
      label: "Quiz Attempts",
      value: totalQuizzes,
      icon: TrendingUp,
      color: "text-purple-500",
    },
    {
      label: "Active Days",
      value: dashboard?.overview?.active_days || 0,
      icon: Calendar,
      color: "text-emerald-500",
    },
    {
      label: "Overall Progress",
      value: `${dashboard?.overview?.overall_progress || 0}%`,
      icon: Sparkles,
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
            Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Comprehensive overview of your learning journey
          </p>
        </div>

        {/* Badges — wrap on small screens */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/50">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-medium text-emerald-700">
              Live
            </span>
          </div>
          <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/50">
            <FileBarChart2 size={13} className="text-indigo-500 flex-shrink-0" />
            <span className="text-[11px] sm:text-xs font-medium text-indigo-700">
              Detailed
            </span>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Row */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4"
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

      {/* Row 1: Overall Report + Quiz Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div variants={itemVariants} className="h-full min-w-0">
          <OverallReport dashboard={dashboard} />
        </motion.div>
        <motion.div variants={itemVariants} className="h-full min-w-0">
          <QuizReport dashboard={dashboard} />
        </motion.div>
      </div>

      {/* Row 2: Learning Resources + Activity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div variants={itemVariants} className="h-full min-w-0">
          <LearningResources dashboard={dashboard} />
        </motion.div>
        <motion.div variants={itemVariants} className="h-full min-w-0">
          <ActivitySummary dashboard={dashboard} />
        </motion.div>
      </div>

      {/* Export Actions */}
      <motion.div
        variants={itemVariants}
        className="
          flex flex-col sm:flex-row sm:items-center sm:justify-between
          gap-3 sm:gap-4 pt-4
          border-t border-slate-100
        "
      >
        <p className="text-[11px] sm:text-xs text-slate-400">
          Export your reports for offline viewing or sharing
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            className="
              flex items-center gap-2
              px-3 sm:px-4 py-2
              text-xs sm:text-sm font-medium
              text-slate-600 bg-white/50
              border border-slate-200/50 rounded-xl
              hover:bg-slate-50 active:scale-95
              transition-all duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
            "
          >
            <Download size={15} className="sm:hidden" />
            <Download size={16} className="hidden sm:block" />
            <span>Download PDF</span>
          </button>
          <button
            className="
              flex items-center gap-2
              px-3 sm:px-4 py-2
              text-xs sm:text-sm font-medium
              text-slate-600 bg-white/50
              border border-slate-200/50 rounded-xl
              hover:bg-slate-50 active:scale-95
              transition-all duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
            "
          >
            <Share2 size={15} className="sm:hidden" />
            <Share2 size={16} className="hidden sm:block" />
            <span>Share</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Reports;