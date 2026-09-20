import {
    TrendingUp,
    Target,
    BookOpen,
    AlertTriangle,
    Lightbulb,
    Sparkles,
    Zap,
    ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

function AIInsights({ dashboard }) {
    const { overview, quiz, roadmap } = dashboard;

    const insights = [];

    insights.push({
        icon: TrendingUp,
        title: "Average Performance",
        message: `Your average quiz score is ${overview.average_score}%.`,
        type: "performance"
    });

    insights.push({
        icon: BookOpen,
        title: "Learning Progress",
        message: `You currently have ${overview.books} books and ${overview.notes} notes available.`,
        type: "progress"
    });

    if (quiz.weak_topics.length > 0) {
        insights.push({
            icon: AlertTriangle,
            title: "Weakest Topic",
            message: `Focus on "${quiz.weak_topics[0].topic}".`,
            type: "warning"
        });
    }

    if (roadmap.active > 0) {
        insights.push({
            icon: Target,
            title: "Roadmap Progress",
            message: `Your next roadmap deadline is ${roadmap.next_deadline}.`,
            type: "roadmap"
        });
    }

    if (overview.current_streak > 0) {
        insights.push({
            icon: Zap,
            title: "Current Streak",
            message: `You're on a ${overview.current_streak} day learning streak.`,
            type: "streak"
        });
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
    };

    const getPriority = (type) => {
        const priorities = {
            warning: { label: "Action Needed" },
            performance: { label: "Analysis" },
            progress: { label: "Progress" },
            roadmap: { label: "Plan" },
            streak: { label: "Achievement" }
        };
        return priorities[type] || priorities.progress;
    };

    if (insights.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="bg-white border border-[#e8dfd3] rounded-lg h-[400px] flex items-center justify-center"
            >
                <div className="flex flex-col items-center p-6 text-center">
                    <div className="w-12 h-12 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center mb-4">
                        <Lightbulb size={20} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    </div>
                    <h2 className="text-base font-semibold text-[#2a1f14] mb-1.5">
                        AI Insights
                    </h2>
                    <p className="text-sm text-[#8a7965]">
                        No insights available yet
                    </p>
                    <p className="text-xs text-[#a89880] mt-1">
                        Continue learning to get personalized insights
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="bg-white border border-[#e8dfd3] rounded-lg h-[480px] flex flex-col overflow-hidden"
        >
            {/* Header */}
            <div className="p-6 pb-0 flex-shrink-0">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center">
                            <Sparkles size={15} strokeWidth={1.8} className="text-[#5c1a1a]" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-[#2a1f14]">
                                AI Insights
                            </h2>
                            <p className="text-[11px] text-[#8a7965] mt-0.5">
                                Personalized learning recommendations
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#5c1a1a]" />
                        <span className="text-[#8a7965] uppercase tracking-[0.08em]">AI Powered</span>
                    </div>
                </div>
            </div>

            {/* Insights list */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
                <motion.div
                    className="space-y-3"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {insights.map((item, index) => {
                        const Icon = item.icon;
                        const priority = getPriority(item.type);

                        return (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="group relative p-4 rounded-md border border-[#e8dfd3] bg-[#faf7f3]"
                            >
                                <div className="flex items-start gap-3">
                                    {/* Icon */}
                                    <div className="flex-shrink-0 w-8 h-8 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center">
                                        <Icon size={14} strokeWidth={1.8} className="text-[#5c1a1a]" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                            <h3 className="text-sm font-semibold text-[#2a1f14]">
                                                {item.title}
                                            </h3>
                                            <span className="text-[9px] tracking-[0.08em] uppercase px-2 py-0.5 rounded-full border border-[#e8dfd3] bg-white text-[#5a4a3a] font-medium">
                                                {priority.label}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[#6a5a48] leading-relaxed">
                                            {item.message}
                                        </p>
                                    </div>

                                    {/* Chevron */}
                                    <ChevronRight
                                        size={14}
                                        strokeWidth={1.8}
                                        className="text-[#a89880] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0 mt-1"
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </motion.div>
    );
}

export default AIInsights;