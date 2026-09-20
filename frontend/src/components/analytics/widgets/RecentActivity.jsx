import {
    BookOpen,
    Brain,
    FileText,
    Map,
    Clock,
    ChevronRight,
    TrendingUp,
    Play,
    CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";

function RecentActivity({ activity }) {
    const getIcon = (type) => {
        const icons = {
            book:    { icon: BookOpen, label: "Book" },
            quiz:    { icon: Brain,    label: "Quiz" },
            note:    { icon: FileText, label: "Note" },
            roadmap: { icon: Map,      label: "Roadmap" },
        };
        return icons[type] || icons.note;
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString();
    };

    const getStatus = (index) => {
        const statuses = [
            { label: "Completed", icon: CheckCircle },
            { label: "In Progress", icon: Play },
            { label: "New", icon: TrendingUp },
        ];
        return statuses[index % statuses.length];
    };

    const visibleActivity = activity?.slice(0, 4) || [];
    const hasMoreActivity = activity?.length > 4;

    if (!activity || activity.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="bg-white border border-[#e8dfd3] rounded-lg h-[480px] flex items-center justify-center"
            >
                <div className="flex flex-col items-center p-6 text-center">
                    <div className="w-12 h-12 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center mb-4">
                        <Clock size={20} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    </div>
                    <h2 className="text-base font-semibold text-[#2a1f14] mb-1.5">
                        Recent Activity
                    </h2>
                    <p className="text-sm text-[#8a7965]">
                        No recent activity
                    </p>
                    <p className="text-xs text-[#a89880] mt-1">
                        Start learning to see your progress
                    </p>
                </div>
            </motion.div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
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
            className="bg-white border border-[#e8dfd3] rounded-lg h-[480px] flex flex-col overflow-hidden"
        >
            <div className="p-6 pb-0 flex-shrink-0">
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center">
                            <Clock size={15} strokeWidth={1.8} className="text-[#5c1a1a]" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-[#2a1f14]">
                                Recent Activity
                            </h2>
                            <p className="text-[11px] text-[#8a7965] mt-0.5">
                                Your latest learning actions
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#5c1a1a]" />
                        <span className="text-[#8a7965] uppercase tracking-[0.08em]">Live</span>
                    </div>
                </div>
            </div>

            {/* Activity list */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
                <motion.div
                    className="space-y-2"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {visibleActivity.map((item, index) => {
                        const IconData = getIcon(item.type);
                        const Icon = IconData.icon;
                        const status = getStatus(index);
                        const StatusIcon = status.icon;

                        return (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="group flex items-center gap-3 p-3 rounded-md border border-[#e8dfd3] bg-[#faf7f3]"
                            >
                                {/* Icon */}
                                <div className="flex-shrink-0 w-8 h-8 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center">
                                    <Icon size={14} strokeWidth={1.8} className="text-[#5c1a1a]" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-[#2a1f14] truncate">
                                                {item.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] tracking-[0.08em] uppercase text-[#8a7965]">
                                                    {IconData.label}
                                                </span>
                                                <span className="w-0.5 h-0.5 rounded-full bg-[#c9bda9]" />
                                                <span className="text-[10px] text-[#8a7965]">
                                                    {getTimeAgo(item.time)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-[#e8dfd3] bg-white">
                                            <StatusIcon size={9} strokeWidth={2} className="text-[#5c1a1a]" />
                                            <span className="text-[9px] tracking-[0.06em] uppercase text-[#5a4a3a] font-medium">
                                                {status.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Chevron */}
                                <ChevronRight
                                    size={12}
                                    strokeWidth={1.8}
                                    className="text-[#a89880] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0"
                                />
                            </motion.div>
                        );
                    })}

                    {hasMoreActivity && (
                        <div className="text-center py-3">
                            <p className="text-[11px] text-[#8a7965]">
                                + {activity.length - 4} more activities
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}

export default RecentActivity;