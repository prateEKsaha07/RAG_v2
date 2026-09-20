import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from "recharts";
import { motion } from "framer-motion";
import { Calendar, TrendingUp, Activity } from "lucide-react";

// Maroon-based palette for the three data series
const SERIES_COLORS = {
    quiz: "#5c1a1a",
    books: "#8a7965",
    notes: "#c9bda9",
};

function WeeklyActivity({ weekly }) {
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-[#e8dfd3] rounded-md p-3">
                    <p className="text-xs font-semibold text-[#2a1f14] mb-2">
                        {label}
                    </p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                            <span
                                className="inline-block w-2 h-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-[#8a7965]">{entry.name}:</span>
                            <span className="font-semibold text-[#2a1f14] tabular-nums">
                                {entry.value}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const CustomLegend = ({ payload }) => {
        return (
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <span
                            className="inline-block w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-[10px] tracking-[0.08em] uppercase text-[#8a7965]">
                            {entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    const totalActivity = weekly?.reduce((sum, day) => {
        return sum + (day.quiz || 0) + (day.books || 0) + (day.notes || 0);
    }, 0) || 0;

    const averageActivity = weekly?.length ? Math.round(totalActivity / weekly.length) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="bg-white border border-[#e8dfd3] rounded-lg p-6"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center">
                        <Activity size={15} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-[#2a1f14]">
                            Weekly Activity
                        </h2>
                        <p className="text-[11px] text-[#8a7965] mt-0.5">
                            Your learning progress this week
                        </p>
                    </div>
                </div>

                {/* Stats summary */}
                <div className="flex items-center gap-4 px-4 py-2 rounded-md border border-[#e8dfd3] bg-[#faf7f3]">
                    <div className="text-center">
                        <p className="text-[10px] tracking-[0.08em] uppercase text-[#8a7965]">
                            Total
                        </p>
                        <p className="text-sm font-semibold text-[#2a1f14] tabular-nums mt-0.5">
                            {totalActivity}
                        </p>
                    </div>
                    <div className="w-px h-8 bg-[#e8dfd3]" />
                    <div className="text-center">
                        <p className="text-[10px] tracking-[0.08em] uppercase text-[#8a7965]">
                            Daily Avg
                        </p>
                        <p className="text-sm font-semibold text-[#2a1f14] tabular-nums mt-0.5">
                            {averageActivity}
                        </p>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={weekly}
                        margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e8dfd3"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fill: "#8a7965",
                                fontSize: 11,
                            }}
                            dy={10}
                        />

                        <YAxis
                            allowDecimals={false}
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fill: "#8a7965",
                                fontSize: 11,
                            }}
                            dx={-10}
                        />

                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f0e9e0" }} />

                        <Legend content={<CustomLegend />} />

                        <Bar
                            dataKey="quiz"
                            fill={SERIES_COLORS.quiz}
                            name="Quiz"
                            radius={[3, 3, 0, 0]}
                            maxBarSize={36}
                        />

                        <Bar
                            dataKey="books"
                            fill={SERIES_COLORS.books}
                            name="Books"
                            radius={[3, 3, 0, 0]}
                            maxBarSize={36}
                        />

                        <Bar
                            dataKey="notes"
                            fill={SERIES_COLORS.notes}
                            name="Notes"
                            radius={[3, 3, 0, 0]}
                            maxBarSize={36}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-[#e8dfd3] flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-[#8a7965]">
                    <Calendar size={11} strokeWidth={1.8} />
                    <span>Last 7 days</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <TrendingUp size={11} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    <span className="text-[#5c1a1a] font-medium tabular-nums">+12%</span>
                    <span className="text-[#8a7965]">vs last week</span>
                </div>
            </div>
        </motion.div>
    );
}

export default WeeklyActivity;