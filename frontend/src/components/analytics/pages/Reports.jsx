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
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const totalActivities =
    dashboard?.overview?.books + dashboard?.overview?.notes || 0;
  const totalQuizzes = dashboard?.quiz?.total_attempts || 0;

  const quickStats = [
    { label: "Total Resources", value: totalActivities, icon: FileBarChart2 },
    { label: "Quiz Attempts", value: totalQuizzes, icon: TrendingUp },
    { label: "Active Days", value: dashboard?.overview?.active_days || 0, icon: Calendar },
    { label: "Overall Progress", value: `${dashboard?.overview?.overall_progress || 0}%`, icon: Sparkles },
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
            Reports
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2a1f14] mb-1.5">
            Reports & Analytics
          </h1>
          <p className="text-sm text-[#8a7965]">
            Comprehensive overview of your learning journey
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#e8dfd3] bg-white">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5c1a1a]" />
            <span className="text-[10px] tracking-[0.1em] uppercase text-[#5a4a3a] font-medium">
              Live
            </span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#e8dfd3] bg-white">
            <FileBarChart2 size={11} strokeWidth={1.8} className="text-[#5c1a1a]" />
            <span className="text-[10px] tracking-[0.1em] uppercase text-[#5a4a3a] font-medium">
              Detailed
            </span>
          </div>
        </div>
      </motion.div>

      {/* Quick stats */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
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

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <motion.div variants={itemVariants} className="h-full min-w-0">
          <OverallReport dashboard={dashboard} />
        </motion.div>
        <motion.div variants={itemVariants} className="h-full min-w-0">
          <QuizReport dashboard={dashboard} />
        </motion.div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <motion.div variants={itemVariants} className="h-full min-w-0">
          <LearningResources dashboard={dashboard} />
        </motion.div>
        <motion.div variants={itemVariants} className="h-full min-w-0">
          <ActivitySummary dashboard={dashboard} />
        </motion.div>
      </div>

      {/* Export actions */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-6 border-t border-[#e8dfd3]"
      >
        <p className="text-[11px] text-[#8a7965]">
          Export your reports for offline viewing or sharing
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-[#e8dfd3] bg-white text-[#5a4a3a] text-xs font-medium hover:border-[#5c1a1a]/40 hover:text-[#5c1a1a] transition-colors">
            <Download size={14} strokeWidth={1.8} />
            <span>Download PDF</span>
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-[#e8dfd3] bg-white text-[#5a4a3a] text-xs font-medium hover:border-[#5c1a1a]/40 hover:text-[#5c1a1a] transition-colors">
            <Share2 size={14} strokeWidth={1.8} />
            <span>Share</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Reports;