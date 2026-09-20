import {
    TrendingUp,
    Award,
    Target,
    BookOpen,
    TrendingDown,
    Minus
} from "lucide-react";
import { motion } from "framer-motion";

function PerformanceSummary({ dashboard }) {
    const { overview, quiz } = dashboard;

    const getTrend = (current, previous) => {
        if (!previous) return { value: 0, type: 'neutral' };
        const diff = ((current - previous) / previous * 100);
        if (diff > 0) return { value: Math.abs(diff).toFixed(1), type: 'up' };
        if (diff < 0) return { value: Math.abs(diff).toFixed(1), type: 'down' };
        return { value: 0, type: 'neutral' };
    };

    const cards = [
        {
            id: "average_score",
            title: "Average Score",
            value: `${quiz.average_score || 0}%`,
            icon: TrendingUp,
            trend: getTrend(quiz.average_score, quiz.previous_average_score),
            subtitle: "Overall performance"
        },
        {
            id: "best_score",
            title: "Best Score",
            value: `${quiz.best_score || 0}%`,
            icon: Award,
            trend: getTrend(quiz.best_score, quiz.previous_best_score),
            subtitle: "Your highest achievement"
        },
        {
            id: "total_attempts",
            title: "Total Attempts",
            value: quiz.total_attempts || 0,
            icon: Target,
            trend: getTrend(quiz.total_attempts, quiz.previous_total_attempts),
            subtitle: "Total quizzes taken"
        },
        {
            id: "books",
            title: "Books",
            value: overview.books || 0,
            icon: BookOpen,
            trend: getTrend(overview.books, overview.previous_books),
            subtitle: "Total resources"
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.96 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
    };

    const TrendIcon = ({ type }) => {
        if (type === 'up') return <TrendingUp size={11} strokeWidth={1.8} className="text-[#5c1a1a]" />;
        if (type === 'down') return <TrendingDown size={11} strokeWidth={1.8} className="text-[#a83232]" />;
        return <Minus size={11} strokeWidth={1.8} className="text-[#8a7965]" />;
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
                        <TrendingUp size={15} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-[#2a1f14]">
                            Performance Summary
                        </h2>
                        <p className="text-[11px] text-[#8a7965] mt-0.5">
                            Key metrics at a glance
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#5c1a1a]" />
                    <span className="text-[#8a7965] uppercase tracking-[0.08em]">Updated</span>
                </div>
            </div>

            {/* Cards */}
            <motion.div
                className="grid grid-cols-2 gap-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {cards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <motion.div
                            key={card.id}
                            variants={cardVariants}
                            className="relative p-4 rounded-md border border-[#e8dfd3] bg-[#faf7f3]"
                        >
                            {/* Icon */}
                            <div className="inline-flex w-8 h-8 rounded-md border border-[#e8dfd3] bg-white items-center justify-center">
                                <Icon size={14} strokeWidth={1.8} className="text-[#5c1a1a]" />
                            </div>

                            {/* Value */}
                            <div className="mt-3">
                                <h3 className="text-2xl font-bold text-[#2a1f14] tracking-tight tabular-nums leading-none">
                                    {card.value}
                                </h3>
                            </div>

                            {/* Title */}
                            <p className="text-xs font-medium text-[#2a1f14] mt-1.5">
                                {card.title}
                            </p>

                            {/* Subtitle */}
                            <p className="text-[10px] tracking-[0.06em] uppercase text-[#8a7965] mt-1">
                                {card.subtitle}
                            </p>

                            {/* Trend */}
                            {card.trend && card.trend.type !== 'neutral' && (
                                <div className="absolute top-4 right-4 flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-[#e8dfd3] bg-white">
                                    <TrendIcon type={card.trend.type} />
                                    <span className={`text-[9px] font-medium tabular-nums ${
                                        card.trend.type === 'up' ? 'text-[#5c1a1a]' : 'text-[#a83232]'
                                    }`}>
                                        {card.trend.value}%
                                    </span>
                                </div>
                            )}

                            {/* Progress bar */}
                            <div className="mt-3 h-1 bg-[#f0e9e0] rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: typeof card.value === 'string'
                                            ? parseInt(card.value) || 70
                                            : Math.min((card.value / 100) * 100, 100) || 70
                                    }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="h-full rounded-full bg-[#5c1a1a]"
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </motion.div>
    );
}

export default PerformanceSummary;