import { motion } from "framer-motion";
import {
    BookOpen,
    Clock,
    TrendingUp,
    Target,
    Calendar,
    FileText
} from "lucide-react";

function LearningResources({ dashboard }) {
    const { study, overview } = dashboard;
    const books = study?.recent_books || [];

    const totalBooks = overview?.books || 0;
    const totalNotes = overview?.notes || 0;
    const totalResources = totalBooks + totalNotes;
    const completedBooks = books.filter(b => b.current_page === b.total_pages).length;
    const inProgressBooks = books.filter(b => b.current_page < b.total_pages).length;
    const totalPages = books.reduce((sum, b) => sum + b.total_pages, 0);
    const pagesRead = books.reduce((sum, b) => sum + b.current_page, 0);
    const overallProgress = totalPages > 0 ? Math.round((pagesRead / totalPages) * 100) : 0;

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
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -12 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
    };

    const stats = [
        {
            id: "total",
            label: "Total Resources",
            value: totalResources,
            icon: BookOpen,
            detail: `${totalBooks} books • ${totalNotes} notes`
        },
        {
            id: "reading",
            label: "Reading Progress",
            value: `${overallProgress}%`,
            icon: TrendingUp,
            detail: `${pagesRead} / ${totalPages} pages`
        },
        {
            id: "status",
            label: "Book Status",
            value: `${completedBooks}/${books.length}`,
            icon: Target,
            detail: `${inProgressBooks} in progress`
        },
    ];

    if (!books || books.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="bg-white border border-[#e8dfd3] rounded-lg p-6 flex items-center justify-center min-h-[300px]"
            >
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center mb-4">
                        <BookOpen size={20} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    </div>
                    <h3 className="text-sm font-semibold text-[#2a1f14]">No Learning Resources</h3>
                    <p className="text-xs text-[#8a7965] mt-1">Start adding books and notes to your library</p>
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
                        <FileText size={15} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-[#2a1f14]">
                            Learning Resources
                        </h2>
                        <p className="text-[11px] text-[#8a7965] mt-0.5">
                            Your books and reading progress
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#5c1a1a]" />
                    <span className="text-[#8a7965] tabular-nums">{books.length} books</span>
                </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2 mb-5">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.id}
                            className="p-2.5 rounded-md border border-[#e8dfd3] bg-[#faf7f3] text-center"
                        >
                            <div className="flex items-center justify-center gap-1.5">
                                <Icon size={11} strokeWidth={1.8} className="text-[#5c1a1a] flex-shrink-0" />
                                <span className="text-[10px] tracking-[0.06em] uppercase text-[#8a7965] truncate">
                                    {stat.label}
                                </span>
                            </div>
                            <p className="text-sm font-semibold text-[#2a1f14] mt-1 tabular-nums">
                                {stat.value}
                            </p>
                            <p className="text-[9px] text-[#a89880] mt-0.5 truncate">
                                {stat.detail}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Books list */}
            <motion.div
                className="space-y-2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {books.map((book) => {
                    const progress = Math.round((book.current_page / book.total_pages) * 100);
                    const isDone = book.current_page === book.total_pages;

                    return (
                        <motion.div
                            key={book.id}
                            variants={itemVariants}
                            className="p-3 rounded-md border border-[#e8dfd3] bg-[#faf7f3]"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    {/* Title row */}
                                    <div className="flex items-center gap-2">
                                        <BookOpen size={12} strokeWidth={1.8} className="text-[#5c1a1a] flex-shrink-0" />
                                        <h3 className="text-sm font-medium text-[#2a1f14] truncate">
                                            {book.title}
                                        </h3>
                                        <span className={`text-[9px] tracking-[0.06em] uppercase px-1.5 py-0.5 rounded-full border flex-shrink-0 ${
                                            isDone
                                                ? "border-[#e8dfd3] bg-white text-[#5c1a1a]"
                                                : "border-[#e8dfd3] bg-white text-[#8a7965]"
                                        }`}>
                                            {isDone ? "Done" : "Reading"}
                                        </span>
                                    </div>

                                    {/* Progress info */}
                                    <div className="flex items-center gap-2 mt-1.5 ml-5 text-[10px] text-[#8a7965]">
                                        <div className="flex items-center gap-1">
                                            <Clock size={9} strokeWidth={1.8} />
                                            <span className="tabular-nums">
                                                {book.current_page} / {book.total_pages} pgs
                                            </span>
                                        </div>
                                        <span className="w-0.5 h-0.5 rounded-full bg-[#c9bda9]" />
                                        <div className="flex items-center gap-1">
                                            <Calendar size={9} strokeWidth={1.8} />
                                            <span>{getTimeAgo(book.last_read)}</span>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="mt-2 h-1 bg-[#f0e9e0] rounded-full overflow-hidden ml-5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 0.8, delay: 0.2 }}
                                            className="h-full rounded-full bg-[#5c1a1a]"
                                        />
                                    </div>
                                </div>

                                {/* Progress percentage */}
                                <div className="flex-shrink-0 text-right">
                                    <span className="text-xs font-semibold text-[#2a1f14] tabular-nums">
                                        {progress}%
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </motion.div>
    );
}

export default LearningResources;