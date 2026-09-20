import { motion } from "framer-motion";
import { BookOpen, Clock, ChevronRight } from "lucide-react";

function RecentBooks({ study }) {
    const books = study.recent_books || [];
    const visibleBooks = books.slice(-4);

    const getProgress = (currentPage, totalPages) => {
        return Math.round((currentPage / totalPages) * 100);
    };

    const getTimeAgo = (date) => {
        if (!date) return "Recently";
        const now = new Date();
        const diff = now - new Date(date);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (hours < 1) return "Just now";
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString();
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -12 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
    };

    if (!books || books.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="bg-white border border-[#e8dfd3] rounded-lg p-6 flex items-center justify-center min-h-[200px]"
            >
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center mb-4">
                        <BookOpen size={20} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    </div>
                    <h3 className="text-sm font-semibold text-[#2a1f14]">No Books Yet</h3>
                    <p className="text-xs text-[#8a7965] mt-1">Start your reading journey today</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="bg-white border border-[#e8dfd3] rounded-lg p-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center">
                        <BookOpen size={15} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-[#2a1f14]">
                            Recent Books
                        </h2>
                        <p className="text-[11px] text-[#8a7965] mt-0.5">
                            Currently reading
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#5c1a1a]" />
                    <span className="text-[#8a7965] tabular-nums">{books.length} books</span>
                </div>
            </div>

            {/* Books list */}
            <motion.div
                className="space-y-2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {visibleBooks.map((book) => {
                    const progress = getProgress(book.current_page, book.total_pages);

                    return (
                        <motion.div
                            key={book.id}
                            variants={itemVariants}
                            className="p-4 rounded-md border border-[#e8dfd3] bg-[#faf7f3]"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    {/* Title */}
                                    <h3 className="text-sm font-medium text-[#2a1f14] truncate">
                                        {book.title}
                                    </h3>

                                    {/* Author */}
                                    {book.author && (
                                        <p className="text-xs text-[#8a7965] mt-0.5 truncate">
                                            {book.author}
                                        </p>
                                    )}

                                    {/* Progress info */}
                                    <div className="flex items-center gap-2 mt-2 text-[10px] text-[#8a7965]">
                                        <div className="flex items-center gap-1">
                                            <BookOpen size={10} strokeWidth={1.8} />
                                            <span className="tabular-nums">
                                                {book.current_page} / {book.total_pages} pages
                                            </span>
                                        </div>
                                        <span className="w-0.5 h-0.5 rounded-full bg-[#c9bda9]" />
                                        <div className="flex items-center gap-1">
                                            <Clock size={10} strokeWidth={1.8} />
                                            <span>{getTimeAgo(book.last_read)}</span>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="mt-2 h-1 bg-[#f0e9e0] rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 0.8, delay: 0.2 }}
                                            className="h-full rounded-full bg-[#5c1a1a]"
                                        />
                                    </div>
                                </div>

                                {/* Percentage + chevron */}
                                <div className="flex-shrink-0 flex items-center gap-1">
                                    <span className="text-sm font-semibold text-[#2a1f14] tabular-nums">
                                        {progress}%
                                    </span>
                                    <ChevronRight
                                        size={12}
                                        strokeWidth={1.8}
                                        className="text-[#a89880] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </motion.div>
    );
}

export default RecentBooks;