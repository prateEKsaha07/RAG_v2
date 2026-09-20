import { motion } from "framer-motion";
import {
    BookOpen,
    TrendingUp,
    Award,
    ChevronRight,
    Target
} from "lucide-react";

function ReadingStats({ study }) {
    const stats = [
        {
            id: "books_read",
            title: "Books Read Recently",
            value: study.recent_books?.length || 0,
            icon: BookOpen,
            subtitle: "Total books",
            progress: Math.min((study.recent_books?.length || 0) / 10 * 100, 100)
        },
        {
            id: "overall_progress",
            title: "Overall Progress",
            value: `${study.reading_progress || 0}%`,
            icon: TrendingUp,
            subtitle: "Reading completion",
            progress: study.reading_progress || 0
        },
        {
            id: "pages_read",
            title: "Pages Read",
            value: study.pages_read || 0,
            icon: Target,
            subtitle: "Total pages",
            progress: Math.min((study.pages_read || 0) / 500 * 100, 100)
        },
        {
            id: "streak",
            title: "Reading Streak",
            value: `${study.streak || 0}d`,
            icon: Award,
            subtitle: "Current streak",
            progress: Math.min((study.streak || 0) / 30 * 100, 100)
        },
    ];

    const currentBook = study.currently_reading;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.96 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
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
                        <BookOpen size={15} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-[#2a1f14]">
                            Reading Statistics
                        </h2>
                        <p className="text-[11px] text-[#8a7965] mt-0.5">
                            Your reading overview
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
                className="grid grid-cols-2 gap-3"
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
                                {stat.value > 0 && (
                                    <span className="text-[10px] tracking-[0.06em] uppercase text-[#8a7965]">
                                        {stat.subtitle}
                                    </span>
                                )}
                            </div>

                            <div className="mt-3">
                                <h3 className="text-2xl font-bold text-[#2a1f14] tracking-tight tabular-nums leading-none">
                                    {stat.value}
                                </h3>
                            </div>

                            <p className="text-xs font-medium text-[#2a1f14] mt-2">
                                {stat.title}
                            </p>

                            {/* Progress bar */}
                            <div className="mt-3 h-1 bg-[#f0e9e0] rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(stat.progress, 100)}%` }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="h-full rounded-full bg-[#5c1a1a]"
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Current book */}
            {currentBook && (
                <div className="mt-6 pt-4 border-t border-[#e8dfd3]">
                    <div className="group flex items-center justify-between gap-3 p-3 rounded-md border border-[#e8dfd3] bg-[#faf7f3]">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center flex-shrink-0">
                                <BookOpen size={14} strokeWidth={1.8} className="text-[#5c1a1a]" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] tracking-[0.1em] uppercase text-[#8a7965]">
                                    Currently Reading
                                </p>
                                <p className="text-sm font-semibold text-[#2a1f14] truncate">
                                    {currentBook.title}
                                </p>
                                {currentBook.author && (
                                    <p className="text-xs text-[#8a7965] truncate">
                                        by {currentBook.author}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="text-right">
                                <p className="text-[10px] tracking-[0.08em] uppercase text-[#8a7965]">
                                    Progress
                                </p>
                                <p className="text-xs font-semibold text-[#2a1f14] tabular-nums mt-0.5">
                                    {Math.round((currentBook.current_page / currentBook.total_pages) * 100)}%
                                </p>
                            </div>
                            <ChevronRight
                                size={14}
                                strokeWidth={1.8}
                                className="text-[#a89880] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            />
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

export default ReadingStats;