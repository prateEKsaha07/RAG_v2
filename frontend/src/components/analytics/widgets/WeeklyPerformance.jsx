import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Cell,
} from "recharts";
import { motion } from "framer-motion";
import { Calendar, TrendingUp, BookOpen, Brain, FileText } from "lucide-react";

const MUTED = "#8a7965";
const GRID = "#e8dfd3";

// Three-tier maroon scale per series so intensity still reads
const SERIES_COLORS = {
    quiz:  ["#a89880", "#8a7965", "#5c1a1a"],
    books: ["#a89880", "#8a7965", "#5c1a1a"],
    notes: ["#c9bda9", "#a89880", "#8a7965"],
};

function WeeklyPerformance({ dashboard }) {
    const data = dashboard.weekly_progress || [];

    const totals = data.reduce((acc, day) => ({
        quiz: acc.quiz + (day.quiz || 0),
        books: acc.books + (day.books || 0),
        notes: acc.notes + (day.notes || 0),
    }), { quiz: 0, books: 0, notes: 0 });

    const totalActivities = totals.quiz + totals.books + totals.notes;
    const averagePerDay = Math.round(totalActivities / (data.length || 1));

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-[#e8dfd3] rounded-md p-3 min-w-[150px]">
                    <p className="text-xs font-semibold text-[#2a1f14] mb-2">
                        {label}
                    </p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between gap-4 text-xs">
                            <div className="flex items-center gap-2">
                                <span
                                    className="inline-block w-2 h-2 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-[#8a7965]">{entry.name}</span>
                            </div>
                            <span className="font-semibold text-[#2a1f14] tabular-nums">
                                {entry.value}
                            </span>
                        </div>
                    ))}
                    <div className="mt-2 pt-2 border-t border-[#e8dfd3]">
                        <span className="text-[10px] tracking-[0.06em] uppercase text-[#8a7965]">
                            Total: {payload.reduce((sum, entry) => sum + entry.value, 0)}
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    const CustomLegend = ({ payload }) => {
        return (
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
                {payload.map((entry, index) => {
                    const icons = {
                        'Quiz': Brain,
                        'Books': BookOpen,
                        'Notes': FileText
                    };
                    const Icon = icons[entry.value] || BookOpen;

                    return (
                        <div key={index} className="flex items-center gap-2">
                            <Icon size={12} strokeWidth={1.8} className="text-[#8a7965]" />
                            <span
                                className="inline-block w-2 h-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-[10px] tracking-[0.08em] uppercase text-[#8a7965]">
                                {entry.value}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const getBarColor = (value, type) => {
        if (value === 0) return GRID;
        const colorSet = SERIES_COLORS[type] || SERIES_COLORS.quiz;
        if (value <= 2) return colorSet[0];
        if (value <= 4) return colorSet[1];
        return colorSet[2];
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="bg-white border border-[#e8dfd3] rounded-lg p-6 h-[420px]"
        >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center">
                        <Calendar size={15} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-[#2a1f14]">
                            Weekly Activity
                        </h2>
                        <p className="text-[11px] text-[#8a7965] mt-0.5">
                            Your learning activity this week
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#e8dfd3] bg-white">
                    <TrendingUp size={11} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    <span className="text-[10px] tracking-[0.08em] uppercase font-medium text-[#5a4a3a] tabular-nums">
                        {averagePerDay}/day
                    </span>
                </div>
            </div>

            {/* Chart */}
            <div className="h-[calc(100%-80px)] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={GRID}
                            vertical={false}
                        />

                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: MUTED, fontSize: 11 }}
                            dy={10}
                        />

                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: MUTED, fontSize: 11 }}
                            dx={-10}
                            allowDecimals={false}
                        />

                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f0e9e0" }} />

                        <Legend content={<CustomLegend />} />

                        <Bar
                            dataKey="quiz"
                            name="Quiz"
                            radius={[3, 3, 0, 0]}
                            maxBarSize={32}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`quiz-${index}`}
                                    fill={getBarColor(entry.quiz, 'quiz')}
                                />
                            ))}
                        </Bar>

                        <Bar
                            dataKey="books"
                            name="Books"
                            radius={[3, 3, 0, 0]}
                            maxBarSize={32}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`books-${index}`}
                                    fill={getBarColor(entry.books, 'books')}
                                />
                            ))}
                        </Bar>

                        <Bar
                            dataKey="notes"
                            name="Notes"
                            radius={[3, 3, 0, 0]}
                            maxBarSize={32}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`notes-${index}`}
                                    fill={getBarColor(entry.notes, 'notes')}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}

export default WeeklyPerformance;