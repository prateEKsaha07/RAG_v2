import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  ComposedChart,
} from "recharts";

// Custom Tooltip with modern design
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-gray-100/80">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-2xl font-bold text-blue-500">
          {payload[0].value}%
        </p>
        <div className="w-full h-1 bg-blue-100 rounded-full mt-1 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${payload[0].value}%` }}
          />
        </div>
      </div>
    );
  }
  return null;
};

// Custom dot with animation
const CustomDot = ({ cx, cy, payload, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="transition-all duration-300 cursor-pointer"
    >
      {/* Outer glow */}
      <circle
        cx={cx}
        cy={cy}
        r={isHovered ? 10 : 6}
        fill="rgba(59, 130, 246, 0.15)"
        className="transition-all duration-300"
      />
      {/* Main dot */}
      <circle
        cx={cx}
        cy={cy}
        r={isHovered ? 6 : 4}
        fill="#3b82f6"
        stroke="white"
        strokeWidth={2}
        className="transition-all duration-300 shadow-lg"
      />
      {/* Value label on hover */}
      {isHovered && (
        <text
          x={cx}
          y={cy - 14}
          textAnchor="middle"
          className="text-xs font-bold fill-blue-500"
        >
          {payload.value}%
        </text>
      )}
    </g>
  );
};

function ScoreProgressChart({ data }) {
  const [isMounted, setIsMounted] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate stats
  const latestScore = data.length > 0 ? data[data.length - 1].percentage : 0;
  const previousScore = data.length > 1 ? data[data.length - 2].percentage : latestScore;
  const trend = latestScore - previousScore;
  const averageScore = data.length > 0 
    ? Math.round(data.reduce((sum, item) => sum + item.percentage, 0) / data.length) 
    : 0;
  const maxScore = data.length > 0 ? Math.max(...data.map(item => item.percentage)) : 0;

  return (
    <div className="bg-gradient-to-br from-white to-gray-50/80 rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100/80 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/60">
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          📈 Score Progression
        </h3>
        
        <div className="flex items-center gap-4 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Latest:</span>
            <span className="font-bold text-blue-500 text-lg">{latestScore}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`font-medium ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
            <span className="text-gray-400 text-xs">vs prev</span>
          </div>
        </div>
      </div>

      {/* Chart with animation */}
      <div className={`transition-all duration-700 ease-out ${
        isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart 
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gridGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#e2e8f0" stopOpacity={0.3}/>
                <stop offset="100%" stopColor="#e2e8f0" stopOpacity={0.1}/>
              </linearGradient>
            </defs>

            <CartesianGrid 
              strokeDasharray="5 5" 
              stroke="url(#gridGradient)"
              vertical={false}
            />

            <XAxis 
              dataKey="date" 
              tick={{ 
                fontSize: 11, 
                fill: '#94a3b8',
                fontWeight: 500
              }}
              axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
              tickLine={false}
              tickMargin={10}
            />

            <YAxis 
              domain={[0, 100]} 
              unit="%"
              tick={{ 
                fontSize: 11, 
                fill: '#94a3b8',
                fontWeight: 500
              }}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Area for gradient fill */}
            <Area
              type="monotone"
              dataKey="percentage"
              stroke="none"
              fill="url(#colorScore)"
              animationBegin={200}
              animationDuration={1500}
              animationEasing="ease-out"
              isAnimationActive={isMounted}
            />

            {/* Main line */}
            <Line
              type="monotone"
              dataKey="percentage"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={<CustomDot />}
              activeDot={{ 
                r: 8, 
                fill: '#3b82f6',
                stroke: 'white',
                strokeWidth: 3,
                className: 'shadow-lg'
              }}
              animationBegin={200}
              animationDuration={1500}
              animationEasing="ease-out"
              isAnimationActive={isMounted}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-gray-200/50">
        <div className="text-center p-2 rounded-xl bg-blue-50/50">
          <p className="text-lg font-bold text-blue-500">{averageScore}%</p>
          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Average</p>
        </div>
        <div className="text-center p-2 rounded-xl bg-emerald-50/50">
          <p className="text-lg font-bold text-emerald-500">{maxScore}%</p>
          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Highest</p>
        </div>
        <div className="text-center p-2 rounded-xl bg-purple-50/50">
          <p className="text-lg font-bold text-purple-500">{data.length}</p>
          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Attempts</p>
        </div>
      </div>
    </div>
  );
}

export default ScoreProgressChart;