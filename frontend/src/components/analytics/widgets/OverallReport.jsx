import { motion } from "framer-motion";
import {
    BookOpen,
    Brain,
    TrendingUp,
    Map,
    Target,
    Award,
    Calendar
} from "lucide-react";

function OverallReport({ dashboard }) {
    const { overview, roadmap, quiz } = dashboard;

    const totalResources = (overview.books || 0) + (overview.notes || 0);
    const completionRate = overview.books > 0
        ? Math.round((overview.books_completed || 0) / overview.books * 100)
        : 0;
    const averagePerDay = overview.active_days > 0
        ? Math.round(totalResources / overview.active_days)
        : 0;
    const quizPassRate = quiz?.total_attempts > 0
        ? Math.round((quiz.passed || 0) / quiz.total_attempts * 100)
        : 0;

    const stats = [
        {
            id: "total_resources",
            label: "Total Resources",
            value: totalResources,
            icon: BookOpen,
            description: "Books & notes combined",
            detail: `${overview.books || 0} books • ${overview.notes || 0} notes`
        },
        {
            id: "quiz_attempts",
            label: "Quiz Attempts",
            value: overview.quiz_attempts || 0,
            icon: Brain,
            description: "Total quizzes taken",
            detail: `Passed: ${quiz?.passed || 0} • Failed: ${(overview.quiz_attempts || 0) - (quiz?.passed || 0)}`
        },
        {
            id: "average_score",
            label: "Average Score",
            value: `${overview.average_score || 0}%`,
            icon: TrendingUp,
            description: "Overall performance",
            detail: `Best: ${quiz?.best_score || 0}% • ${quizPassRate}% pass rate`
        },
        {
            id: "active_roadmaps",
            label: "Active Roadmaps",
            value: roadmap.active || 0,
            icon: Map,
            description: "Learning paths in progress",
            detail: `Completed: ${roadmap.completed || 0} • Behind: ${roadmap.behind || 0}`
        },
        {
            id: "completion_rate",
            label: "Completion Rate",
            value: `${completionRate}%`,
            icon: Target,
            description: "Books completed",
            detail: `${overview.books_completed || 0} of ${overview.books || 0} books`
        },
        {
            id: "active_days",
            label: "Active Days",
            value: overview.active_days || 0,
            icon: Calendar,
            description: "Days with activity",
            detail: `${averagePerDay} resources per day • ${overview.current_streak || 0}d streak`
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="bg-white border border-[#e8dfd3] rounded-lg p-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center">
                        <Award size={15} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-[#2a1f14]">
                            Overall Summary
                        </h2>
                        <p className="text-[11px] text-[#8a7965] mt-0.5">
                            Comprehensive overview of your progress
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#5c1a1a]" />
                    <span className="text-[#8a7965] uppercase tracking-[0.08em]">Updated</span>
                </div>
            </div>

            {/* Stats grid */}
            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <motion.div
                            key={stat.id}
                            variants={itemVariants}
                            className="p-4 rounded-md border border-[#e8dfd3] bg-[#faf7f3]"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="w-8 h-8 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center flex-shrink-0">
                                    <Icon size={14} strokeWidth={1.8} className="text-[#5c1a1a]" />
                                </div>
                            </div>

                            <div className="mt-3">
                                <h3 className="text-2xl font-bold text-[#2a1f14] tracking-tight tabular-nums leading-none">
                                    {stat.value}
                                </h3>
                            </div>

                            <p className="text-sm font-medium text-[#2a1f14] mt-1.5">
                                {stat.label}
                            </p>
                            <p className="text-[10px] tracking-[0.06em] uppercase text-[#8a7965] mt-1">
                                {stat.description}
                            </p>
                            <p className="text-[10px] text-[#8a7965] mt-2 border-t border-[#e8dfd3] pt-2">
                                {stat.detail}
                            </p>

                            {/* Progress bar */}
                            {typeof stat.value === 'string' && stat.value.includes('%') ? (
                                <div className="mt-2 h-1 bg-[#f0e9e0] rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: stat.value }}
                                        transition={{ duration: 0.8, delay: 0.2 }}
                                        className="h-full rounded-full bg-[#5c1a1a]"
                                    />
                                </div>
                            ) : stat.id === 'total_resources' || stat.id === 'quiz_attempts' ? (
                                <div className="mt-2 h-1 bg-[#f0e9e0] rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((stat.value / 50) * 100, 100)}%` }}
                                        transition={{ duration: 0.8, delay: 0.2 }}
                                        className="h-full rounded-full bg-[#5c1a1a]"
                                    />
                                </div>
                            ) : null}
                        </motion.div>
                    );
                })}
            </motion.div>
        </motion.div>
    );
}

export default OverallReport;