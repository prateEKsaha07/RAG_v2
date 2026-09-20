import { motion } from "framer-motion";
import {
    TrendingUp,
    BookOpen,
    Layers,
    Sparkles,
    ChevronRight
} from "lucide-react";

function PerformanceInsights({ dashboard }) {
    const { quiz, overview, study } = dashboard;

    const insights = [
        {
            id: "average_score",
            title: "Average Quiz Score",
            value: `${quiz.average_score || 0}%`,
            icon: TrendingUp,
            subtitle: "Overall performance",
            progress: quiz.average_score || 0
        },
        {
            id: "reading_progress",
            title: "Reading Progress",
            value: `${study.reading_progress || 0}%`,
            icon: BookOpen,
            subtitle: "Books completed",
            progress: study.reading_progress || 0
        },
        {
            id: "total_resources",
            title: "Total Learning Resources",
            value: (overview.books || 0) + (overview.notes || 0),
            icon: Layers,
            subtitle: "Books & Notes combined",
            progress: Math.min(((overview.books || 0) + (overview.notes || 0)) / 20 * 100, 100)
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -12 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="bg-white border border-[#e8dfd3] rounded-lg p-6 h-[420px] flex flex-col"
        >
            {/* Header */}
            <div className="flex-shrink-0">
                <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center">
                            <Sparkles size={15} strokeWidth={1.8} className="text-[#5c1a1a]" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-[#2a1f14]">
                                Performance Insights
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
            </div>

            {/* Insights list */}
            <div className="flex-1 overflow-y-auto">
                <motion.div
                    className="space-y-3"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {insights.map((item) => {
                        const Icon = item.icon;

                        return (
                            <motion.div
                                key={item.id}
                                variants={itemVariants}
                                className="group p-4 rounded-md border border-[#e8dfd3] bg-[#faf7f3]"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center">
                                                <Icon size={14} strokeWidth={1.8} className="text-[#5c1a1a]" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-[#2a1f14] truncate">
                                                    {item.title}
                                                </p>
                                                <p className="text-[10px] tracking-[0.08em] uppercase text-[#8a7965] mt-0.5 truncate">
                                                    {item.subtitle}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className="text-base font-semibold text-[#2a1f14] tabular-nums">
                                            {item.value}
                                        </span>
                                        <ChevronRight
                                            size={14}
                                            strokeWidth={1.8}
                                            className="text-[#a89880] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                        />
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="mt-3 h-1 bg-[#f0e9e0] rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(item.progress, 100)}%` }}
                                        transition={{ duration: 0.8, delay: 0.2 }}
                                        className="h-full rounded-full bg-[#5c1a1a]"
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

export default PerformanceInsights;