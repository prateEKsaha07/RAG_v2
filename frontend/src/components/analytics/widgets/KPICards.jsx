import {
  BookOpen,
  StickyNote,
  HelpCircle,
  TrendingUp,
  Map,
  Flame,
  ArrowUp,
  ArrowDown,
  Minus,
  Target,
  Award,
  Calendar,
  CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";

function KPICards({ overview }) {
  const getTrend = (value, previousValue) => {
    if (!previousValue) return { icon: Minus };
    if (value > previousValue) return { icon: ArrowUp };
    if (value < previousValue) return { icon: ArrowDown };
    return { icon: Minus };
  };

  const cards = [
    {
      id: "books",
      title: "Books",
      value: overview.books || 0,
      icon: BookOpen,
      trend: "+12%",
      subtitle: "Total resources",
      additionalInfo: {
        label: "Completed",
        value: `${Math.round((overview.books_completed || 0) / (overview.books || 1) * 100)}%`,
        icon: CheckCircle,
      },
    },
    {
      id: "notes",
      title: "Notes",
      value: overview.notes || 0,
      icon: StickyNote,
      trend: "+8%",
      subtitle: "Active notes",
      additionalInfo: {
        label: "This week",
        value: `+${overview.notes_recent || 0}`,
        icon: Calendar,
      },
    },
    {
      id: "quiz_attempts",
      title: "Quiz Attempts",
      value: overview.quiz_attempts || 0,
      icon: HelpCircle,
      trend: "+23%",
      subtitle: "Total attempts",
      additionalInfo: {
        label: "Accuracy",
        value: `${overview.quiz_accuracy || 0}%`,
        icon: Target,
      },
    },
    {
      id: "average_score",
      title: "Average Score",
      value: `${overview.average_score || 0}%`,
      icon: TrendingUp,
      trend: "+5%",
      subtitle: "Overall performance",
      additionalInfo: {
        label: "Best score",
        value: `${overview.best_score || 0}%`,
        icon: Award,
      },
    },
    {
      id: "active_roadmaps",
      title: "Active Roadmaps",
      value: overview.active_roadmaps || 0,
      icon: Map,
      trend: "2 new",
      subtitle: "Learning paths",
      additionalInfo: {
        label: "Progress",
        value: `${overview.roadmap_progress || 0}%`,
        icon: Target,
      },
    },
    {
      id: "current_streak",
      title: "Current Streak",
      value: `${overview.current_streak || 0}d`,
      icon: Flame,
      trend: "Best streak",
      subtitle: "Daily consistency",
      additionalInfo: {
        label: "Best streak",
        value: `${overview.best_streak || 0}d`,
        icon: Award,
      },
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        const AdditionalIcon = card.additionalInfo.icon;

        return (
          <motion.div
            key={card.id}
            variants={cardVariants}
            className="bg-white border border-[#e8dfd3] rounded-lg p-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center flex-shrink-0">
                  <Icon size={17} strokeWidth={1.8} className="text-[#5c1a1a]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#2a1f14]">
                    {card.title}
                  </p>
                  <p className="text-[11px] text-[#8a7965] mt-0.5">
                    {card.subtitle}
                  </p>
                </div>
              </div>

              {/* Trend chip */}
              {card.trend && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full border border-[#e8dfd3] bg-[#faf7f3]">
                  <span className="text-[10px] tracking-[0.06em] uppercase font-medium text-[#5a4a3a]">
                    {card.trend}
                  </span>
                </div>
              )}
            </div>

            {/* Value */}
            <div className="flex items-end gap-3 mb-5">
              <h3 className="text-3xl lg:text-4xl font-bold text-[#2a1f14] tracking-tight tabular-nums leading-none">
                {card.value}
              </h3>
              <div className="flex-1 h-1 bg-[#f0e9e0] rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "75%" }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full rounded-full bg-[#5c1a1a]"
                />
              </div>
            </div>

            {/* Additional info */}
            <div className="pt-4 border-t border-[#e8dfd3]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AdditionalIcon size={13} strokeWidth={1.8} className="text-[#5c1a1a]" />
                  <span className="text-[11px] tracking-[0.08em] uppercase text-[#8a7965]">
                    {card.additionalInfo.label}
                  </span>
                </div>
                <span className="text-sm font-semibold text-[#2a1f14] tabular-nums">
                  {card.additionalInfo.value}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export default KPICards;