import { motion } from "framer-motion";

import KPICards from "../widgets/KPICards";
import WeeklyActivity from "../widgets/WeeklyActivity";
import ContinueLearning from "../widgets/ContinueLearning";
import RecentActivity from "../widgets/RecentActivity";
import AIInsights from "../widgets/AIInsights";

function Overview({ dashboard }) {
  const { overview, study, activity, weekly_progress } = dashboard;

  // Staggered reveal for each section
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.11,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 sm:space-y-8"
    >
      {/* KPI Cards — always full-width row */}
      <motion.div variants={itemVariants}>
        <KPICards overview={overview} />
      </motion.div>

      {/* Row 1: Weekly Activity + Continue Learning */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
      >
        <WeeklyActivity weekly={weekly_progress} />
        <ContinueLearning study={study} />
      </motion.div>

      {/* Row 2: Recent Activity + AI Insights */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
      >
        <RecentActivity activity={activity} />
        <AIInsights dashboard={dashboard} />
      </motion.div>
    </motion.div>
  );
}

export default Overview;