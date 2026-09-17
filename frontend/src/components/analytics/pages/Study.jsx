import { motion } from "framer-motion";

import ContinueLearning from "../widgets/ContinueLearning";
import ReadingProgress from "../widgets/ReadingProgress";
import RecentBooks from "../widgets/RecentBooks";
import ReadingStats from "../widgets/ReadingStats";

function Study({ dashboard }) {
  const { study } = dashboard;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.11,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div
      className="space-y-6 sm:space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Row 1: Continue Learning + Reading Progress */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
      >
        <div className="min-w-0">
          <ContinueLearning study={study} />
        </div>
        <div className="min-w-0">
          <ReadingProgress study={study} />
        </div>
      </motion.div>

      {/* Row 2: Recent Books + Reading Stats */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
      >
        <div className="min-w-0">
          <RecentBooks study={study} />
        </div>
        <div className="min-w-0">
          <ReadingStats study={study} />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Study;