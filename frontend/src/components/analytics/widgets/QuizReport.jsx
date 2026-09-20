import { motion } from "framer-motion";
import {
    Brain,
    TrendingUp,
    Award,
    Target,
    CheckCircle,
    Clock,
    TrendingDown,
    BarChart3,
    Sparkles
} from "lucide-react";

function QuizReport({ dashboard }) {
    const { quiz } = dashboard;

    const totalAttempts = quiz.total_attempts || 0;
    const passedAttempts = quiz.passed || 0;
    const failedAttempts = totalAttempts - passedAttempts;
    const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;
    const improvementRate = quiz.average_score > 0
        ? Math.round(((quiz.latest_score || 0) / quiz.average_score) * 100)
        : 0;

    const getTrend = (current, previous) => {
        if (!previous) return { value: 0, type: 'neutral' };
        const diff = ((current - previous) / previous * 100);
        if (diff > 0) return { value: Math.abs(diff).toFixed(1), type: 'up' };
        if (diff < 0) return { value: Math.abs(diff).toFixed(1), type: 'down' };
        return { value: 0, type: 'neutral' };
    };

    const trend = getTrend(quiz.latest_score, quiz.average_score);

    const stats = [
        {
            id: "average_score",
            label: "Average Score",
            value: `${quiz.average_score || 0}%`,
            icon: Brain,
            description: "Overall performance",
            detail: `Based on ${totalAttempts} attempts`
        },
        {
            id: "best_score",
            label: "Best Score",
            value: `${quiz.best_score || 0}%`,
            icon: Award,
            description: "Your highest achievement",
            detail: "Top performer"
        },
        {
            id: "latest_score",
            label: "Latest Score",
            value: `${quiz.latest_score || 0}%`,
            icon: Target,
            description: "Most recent attempt",
            detail: trend.type === 'up' ? `${trend.value}% improvement` :
                    trend.type === 'down' ? `${trend.value}% decline` :
                    "No change"
        },
        {
            id: "pass_rate",
            label: "Pass Rate",
            value: `${quiz.pass_rate || 0}%`,
            icon: CheckCircle,
            description: "Success rate",
            detail: `${passedAttempts} passed • ${failedAttempts} failed`
        },
        {
            id: "total_attempts",
            label: "Total Attempts",
            value: quiz.total_attempts || 0,
            icon: BarChart3,
            description: "Quizzes taken",
            detail: `${passRate}% pass rate`
        },
        {
            id: "improvement",
            label: "Improvement",
            value: `${improvementRate}%`,
            icon: TrendingUp,
            description: "Progress trend",
            detail: improvementRate >= 100 ? "Maintaining" : "Improving"
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
                        <Sparkles size={15} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-[#2a1f14]">
                            Quiz Statistics
                        </h2>
                        <p className="text-[11px] text-[#8a7965] mt-0.5">
                            Comprehensive performance analysis
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#5c1a1a]" />
                    <span className="text-[#8a7965] tabular-nums">{totalAttempts} total</span>
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
                    const isPercentage = typeof stat.value === 'string' && stat.value.includes('%');
                    const numericValue = parseInt(stat.value) || 0;

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
                                {stat.id === 'latest_score' && trend.type !== 'neutral' && (
                                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-[#e8dfd3] bg-white">
                                        {trend.type === 'up' ? (
                                            <TrendingUp size={10} strokeWidth={1.8} className="text-[#5c1a1a]" />
                                        ) : (
                                            <TrendingDown size={10} strokeWidth={1.8} className="text-[#a83232]" />
                                        )}
                                        <span className={`text-[9px] font-medium tabular-nums ${
                                            trend.type === 'up' ? 'text-[#5c1a1a]' : 'text-[#a83232]'
                                        }`}>
                                            {trend.value}%
                                        </span>
                                    </div>
                                )}
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

                            {/* Progress bar for percentages */}
                            {isPercentage && (
                                <div className="mt-2 h-1 bg-[#f0e9e0] rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(numericValue, 100)}%` }}
                                        transition={{ duration: 0.8, delay: 0.2 }}
                                        className="h-full rounded-full bg-[#5c1a1a]"
                                    />
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-[#e8dfd3] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[10px] text-[#8a7965]">
                    <Clock size={11} strokeWidth={1.8} />
                    <span>Last quiz: {quiz.last_attempt_date ? new Date(quiz.last_attempt_date).toLocaleDateString() : "N/A"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${quiz.latest_score >= 70 ? 'bg-[#5c1a1a]' : 'bg-[#a83232]'}`} />
                    <span className="uppercase tracking-[0.08em] text-[#8a7965]">
                        {quiz.latest_score >= 70 ? "On track" : "Needs improvement"}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

export default QuizReport;