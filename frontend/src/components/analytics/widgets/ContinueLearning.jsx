import { motion } from "framer-motion";
import {
    BookOpen,
    Clock,
    ChevronRight,
    Target,
    Award,
    Play,
    Bookmark
} from "lucide-react";

function ContinueLearning({ study }) {
    const book = study?.currently_reading;

    if (!book) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="bg-white border border-[#e8dfd3] rounded-lg p-8 text-center"
            >
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center mb-4">
                        <BookOpen size={20} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    </div>
                    <h2 className="text-base font-semibold text-[#2a1f14] mb-1.5">
                        Continue Learning
                    </h2>
                    <p className="text-sm text-[#8a7965]">
                        No books uploaded yet
                    </p>
                    <p className="text-xs text-[#a89880] mt-1">
                        Start your learning journey today
                    </p>
                </div>
            </motion.div>
        );
    }

    const progress = Math.round(
        (book.current_page / book.total_pages) * 100
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="bg-white border border-[#e8dfd3] rounded-lg overflow-hidden"
        >
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center">
                        <BookOpen size={15} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base font-semibold text-[#2a1f14]">
                            Continue Learning
                        </h2>
                        <p className="text-[11px] text-[#8a7965] mt-0.5 truncate">
                            {getMotivationalMessage(progress)}
                        </p>
                    </div>
                    <button
                        aria-label="Bookmark"
                        className="w-8 h-8 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center text-[#8a7965] hover:text-[#5c1a1a] transition-colors"
                    >
                        <Bookmark size={13} strokeWidth={1.8} />
                    </button>
                </div>

                {/* Book title */}
                <div className="mb-5">
                    <h3 className="text-base font-semibold text-[#2a1f14] leading-tight">
                        {book.title}
                    </h3>
                    {book.author && (
                        <p className="text-sm text-[#8a7965] mt-0.5">
                            {book.author}
                        </p>
                    )}
                </div>

                {/* Progress */}
                <div className="space-y-2 mb-5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5">
                            <Target size={13} strokeWidth={1.8} className="text-[#8a7965]" />
                            <span className="text-xs text-[#6a5a48]">
                                Page <span className="font-semibold text-[#2a1f14]">{book.current_page}</span> of{" "}
                                <span className="font-semibold text-[#2a1f14]">{book.total_pages}</span>
                            </span>
                        </div>
                        <span className="text-sm font-semibold text-[#2a1f14] tabular-nums">
                            {progress}%
                        </span>
                    </div>

                    <div className="w-full h-1.5 bg-[#f0e9e0] rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-full rounded-full bg-[#5c1a1a]"
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                    {[
                        { label: "Pages Read", value: book.current_page },
                        { label: "Remaining", value: book.total_pages - book.current_page },
                        { label: "Streak", value: `${book.streak || 3}d` },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="text-center p-2.5 rounded-md border border-[#e8dfd3] bg-[#faf7f3]"
                        >
                            <p className="text-[10px] tracking-[0.08em] uppercase text-[#8a7965]">
                                {stat.label}
                            </p>
                            <p className="text-sm font-semibold text-[#2a1f14] mt-1 tabular-nums">
                                {stat.value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Continue button */}
                <button className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-md bg-[#5c1a1a] text-white text-sm font-medium hover:bg-[#4a1414] transition-colors">
                    <Play size={14} strokeWidth={1.8} />
                    <span>Continue Reading</span>
                    <ChevronRight size={14} strokeWidth={1.8} />
                </button>

                {/* Footer meta */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#e8dfd3] text-[11px] text-[#8a7965]">
                    <div className="flex items-center gap-1.5">
                        <Clock size={11} strokeWidth={1.8} />
                        <span>Last read: {book.last_read || "Today"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Award size={11} strokeWidth={1.8} />
                        <span>{getAchievementMessage(progress)}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function getMotivationalMessage(progress) {
    if (progress < 25) return "Great start — keep going";
    if (progress < 50) return "You're making progress";
    if (progress < 75) return "Halfway there";
    if (progress < 90) return "Almost finished";
    return "Nearly there";
}

function getAchievementMessage(progress) {
    if (progress < 25) return "Beginner";
    if (progress < 50) return "Growing";
    if (progress < 75) return "Dedicated";
    if (progress < 90) return "Committed";
    return "Champion";
}

export default ContinueLearning;