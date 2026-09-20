import {
    BookOpen,
    Brain,
    FileText,
    Map,
    Clock,
    ChevronRight,
    TrendingUp,
    Play,
    CheckCircle,
    Activity
} from "lucide-react";
import { motion } from "framer-motion";

function ActivitySummary({ dashboard }) {
    const { activity } = dashboard;

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

    const totalActivities = activity?.length || 0;
    const completedActivities = activity?.filter((_, i) => i % 3 === 0).length || 0;
    const inProgressActivities = activity?.filter((_, i) => i % 3 === 1).length || 0;
    const newActivities = activity?.filter((_, i) => i % 3 === 2).length || 0;

    const visibleActivity = activity?.slice(0, 6) || [];
    const hasMoreActivity = activity?.length > 6;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -12 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
    };

    if (!activity || activity.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="bg-white border border-[#e8dfd3] rounded-lg p-6 flex items-center justify-center min-h-[300px]"
            >
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center mb-4">
                        <Clock size={20} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    </div>
                    <h3 className="text-sm font-semibold text-[#2a1f14]">No Activity Yet</h3>
                    <p className="text-xs text-[#8a7965] mt-1">Start learning to see your progress</p>
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
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center">
                        <Activity size={15} strokeWidth={1.8} className="text-[#5c1a1a]" />
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
                    <span className="text-[#8a7965] tabular-nums">{totalActivities} total</span>
                </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                    { label: "Completed", value: completedActivities, icon: CheckCircle },
                    { label: "In Progress", value: inProgressActivities, icon: Play },
                    { label: "New", value: newActivities, icon: TrendingUp },
                ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className="p-2.5 rounded-md border border-[#e8dfd3] bg-[#faf7f3] text-center"
                        >
                            <div className="flex items-center justify-center gap-1.5">
                                <Icon size={11} strokeWidth={1.8} className="text-[#5c1a1a]" />
                                <span className="text-[10px] tracking-[0.08em] uppercase text-[#8a7965]">
                                    {stat.label}
                                </span>
                            </div>
                            <p className="text-sm font-semibold text-[#2a1f14] mt-1 tabular-nums">
                                {stat.value}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Activity list */}
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
                            + {activity.length - 6} more activities
                        </p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

export default ActivitySummary;