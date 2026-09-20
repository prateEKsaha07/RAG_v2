import {
    ResponsiveContainer,
    AreaChart,
    Area,
    CartesianGrid,
    Tooltip,
    XAxis,
    YAxis,
    ReferenceLine,
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const ACCENT = "#5c1a1a";
const MUTED = "#8a7965";
const GRID = "#e8dfd3";

function PerformanceTrend({ dashboard }) {
    const data = dashboard.quiz.recent_attempts.map((item, index) => ({
        attempt: index + 1,
        score: item.percentage,
        label: `Quiz ${index + 1}`
    }));

    const scores = data.map(d => d.score);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const latestScore = scores[scores.length - 1] || 0;
    const firstScore = scores[0] || 0;
    const trend = latestScore - firstScore;

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-[#e8dfd3] rounded-md p-3">
                    <p className="text-xs font-semibold text-[#2a1f14] mb-2">
                        {payload[0].payload.label}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: ACCENT }} />
                        <span className="text-[#8a7965]">Score:</span>
                        <span className="font-semibold text-[#2a1f14] tabular-nums">
                            {payload[0].value}%
                        </span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-[#e8dfd3]">
                        <span className="text-[10px] tracking-[0.06em] uppercase text-[#8a7965]">
                            {payload[0].value >= 70 ? 'Good performance' :
                             payload[0].value >= 50 ? 'Keep improving' :
                             'Focus needed'}
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    const getTrendInfo = () => {
        if (trend > 0) return { icon: TrendingUp, label: "Improving", tone: "up" };
        if (trend < 0) return { icon: TrendingDown, label: "Declining", tone: "down" };
        return { icon: Minus, label: "Stable", tone: "neutral" };
    };

    const trendInfo = getTrendInfo();
    const TrendIcon = trendInfo.icon;

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
                        <TrendingUp size={15} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-[#2a1f14]">
                            Score Trend
                        </h2>
                        <p className="text-[11px] text-[#8a7965] mt-0.5">
                            Your performance over time
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#e8dfd3] bg-white">
                    <TrendIcon
                        size={11}
                        strokeWidth={1.8}
                        className={trendInfo.tone === 'up' ? 'text-[#5c1a1a]' : trendInfo.tone === 'down' ? 'text-[#a83232]' : 'text-[#8a7965]'}
                    />
                    <span className={`text-[10px] tracking-[0.08em] uppercase font-medium ${
                        trendInfo.tone === 'up' ? 'text-[#5c1a1a]' : trendInfo.tone === 'down' ? 'text-[#a83232]' : 'text-[#8a7965]'
                    }`}>
                        {trendInfo.label}
                    </span>
                </div>
            </div>

            {/* Chart */}
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                    >
                        <defs>
                            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={ACCENT} stopOpacity={0.18} />
                                <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={GRID}
                            vertical={false}
                        />

                        <XAxis
                            dataKey="attempt"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: MUTED, fontSize: 11 }}
                            dy={10}
                            label={{
                                value: 'Attempts',
                                position: 'insideBottom',
                                offset: -5,
                                style: { fill: MUTED, fontSize: 10, letterSpacing: '0.06em' }
                            }}
                        />

                        <YAxis
                            domain={[0, 100]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: MUTED, fontSize: 11 }}
                            dx={-10}
                            label={{
                                value: 'Score %',
                                angle: -90,
                                position: 'insideLeft',
                                style: { fill: MUTED, fontSize: 10, letterSpacing: '0.06em' }
                            }}
                        />

                        <Tooltip content={<CustomTooltip />} />

                        <ReferenceLine
                            y={70}
                            stroke={MUTED}
                            strokeDasharray="4 4"
                            label={{
                                value: 'Target: 70%',
                                position: 'insideRight',
                                style: { fill: MUTED, fontSize: 10 }
                            }}
                        />

                        <Area
                            dataKey="score"
                            stroke={ACCENT}
                            strokeWidth={2}
                            fill="url(#scoreGradient)"
                            activeDot={{
                                r: 5,
                                stroke: ACCENT,
                                strokeWidth: 2,
                                fill: '#fff'
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Stats footer */}
            <div className="mt-4 pt-4 border-t border-[#e8dfd3] grid grid-cols-4 gap-3">
                {[
                    { label: "Average", value: `${averageScore.toFixed(1)}%`, tone: "neutral" },
                    { label: "Best", value: `${highestScore}%`, tone: "up" },
                    { label: "Lowest", value: `${lowestScore}%`, tone: "down" },
                    { label: "Latest", value: `${latestScore}%`, tone: latestScore >= 70 ? "up" : "neutral" },
                ].map((stat) => (
                    <div key={stat.label} className="text-center">
                        <p className="text-[10px] tracking-[0.1em] uppercase text-[#8a7965]">
                            {stat.label}
                        </p>
                        <p className={`text-sm font-semibold mt-1 tabular-nums ${
                            stat.tone === "up" ? "text-[#5c1a1a]" :
                            stat.tone === "down" ? "text-[#a83232]" :
                            "text-[#2a1f14]"
                        }`}>
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

export default PerformanceTrend;