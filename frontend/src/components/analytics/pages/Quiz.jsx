import { motion } from "framer-motion";
import { Brain, Sparkles, TrendingUp, Target } from "lucide-react";
import QuizSummary from "../widgets/QuizSummary";
import RecentAttempts from "../widgets/RecentAttempts";
import WeakTopics from "../widgets/WeakTopics";
import QuizTrend from "../widgets/QuizTrend";

function Quiz({ dashboard }) {
  const { quiz } = dashboard;

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
      value: quiz.total_attempts || 0,
      icon: Brain,
      color: "text-purple-500",
    },
    {
      label: "Avg Score",
      value: `${quiz.average_score || 0}%`,
      icon: TrendingUp,
      color: "text-emerald-500",
    },
    {
      label: "Best Score",
      value: `${quiz.best_score || 0}%`,
      icon: Target,
      color: "text-amber-500",
    },
    {
      label: "Weak Topics",
      value: quiz.weak_topics?.length || 0,
      icon: Sparkles,
      color: "text-rose-500",
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
            Quiz Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track your quiz performance and identify areas for improvement
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
          <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200/50">
            <Brain size={13} className="text-purple-500 flex-shrink-0" />
            <span className="text-[11px] sm:text-xs font-medium text-purple-700">
              {quiz.total_attempts || 0} Attempts
            </span>
          </div>
        </div>
      </motion.div>

      {/* Row 1: Summary + Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div variants={itemVariants} className="h-full min-w-0">
          <QuizSummary quiz={quiz} />
        </motion.div>
        <motion.div variants={itemVariants} className="h-full min-w-0">
          <QuizTrend quiz={quiz} />
        </motion.div>
      </div>

      {/* Row 2: Recent Attempts + Weak Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div variants={itemVariants} className="h-full min-w-0">
          <RecentAttempts quiz={quiz} />
        </motion.div>
        <motion.div variants={itemVariants} className="h-full min-w-0">
          <WeakTopics quiz={quiz} />
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

export default Quiz;