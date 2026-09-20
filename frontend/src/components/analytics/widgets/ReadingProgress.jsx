import { motion } from "framer-motion";
import { BookOpen, Calendar, Award } from "lucide-react";

function ReadingProgress({ study }) {
    const progress = study.reading_progress || 0;

    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    const getMessage = () => {
        if (progress < 25) return "Great start";
        if (progress < 50) return "Keep going";
        if (progress < 75) return "Almost there";
        if (progress < 90) return "On a roll";
        return "Reading champion";
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
                            Reading Progress
                        </h2>
                        <p className="text-[11px] text-[#8a7965] mt-0.5">
                            Your reading journey
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#5c1a1a]" />
                    <span className="text-[#8a7965] uppercase tracking-[0.08em]">Active</span>
                </div>
            </div>

            {/* Ring */}
            <div className="flex flex-col items-center justify-center py-4">
                <div className="relative w-48 h-48">
                    <svg className="w-full h-full" viewBox="0 0 120 120">
                        {/* Track */}
                        <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            stroke="#f0e9e0"
                            strokeWidth="6"
                            fill="none"
                        />
                        {/* Progress */}
                        <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            stroke="#5c1a1a"
                            strokeWidth="6"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            transform="rotate(-90 60 60)"
                        >
                            <animate
                                attributeName="stroke-dashoffset"
                                from={circumference}
                                to={offset}
                                dur="1.5s"
                                fill="freeze"
                            />
                        </circle>
                    </svg>

                    {/* Center */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-[#2a1f14] tabular-nums leading-none">
                            {progress}%
                        </span>
                        <span className="text-xs text-[#8a7965] mt-1.5">
                            {getMessage()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats footer */}
            <div className="mt-6 pt-4 border-t border-[#e8dfd3] grid grid-cols-3 gap-2">
                {[
                    { label: "Pages Read", value: study.pages_read || 0, icon: BookOpen },
                    { label: "Days Active", value: study.days_active || 0, icon: Calendar },
                    { label: "Streak", value: `${study.streak || 0}d`, icon: Award },
                ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className="text-center p-2.5 rounded-md border border-[#e8dfd3] bg-[#faf7f3]"
                        >
                            <div className="flex items-center justify-center">
                                <Icon size={12} strokeWidth={1.8} className="text-[#5c1a1a]" />
                            </div>
                            <p className="text-[10px] tracking-[0.08em] uppercase text-[#8a7965] mt-1.5">
                                {stat.label}
                            </p>
                            <p className="text-sm font-semibold text-[#2a1f14] mt-0.5 tabular-nums">
                                {stat.value}
                            </p>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}

export default ReadingProgress;