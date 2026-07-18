import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

// Custom Tooltip with modern design
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-gray-100/80">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
          Score Range
        </p>
        <p className="text-lg font-bold text-emerald-500">{label}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-gray-600">Attempts:</span>
          <span className="text-xl font-bold text-gray-800">{payload[0].value}</span>
        </div>
        <div className="w-full h-1.5 bg-emerald-100 rounded-full mt-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
            style={{ 
              width: `${Math.min((payload[0].value / 50) * 100, 100)}%` 
            }}
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5 text-center">
          {payload[0].value} attempt{payload[0].value !== 1 ? 's' : ''} in this range
        </p>
      </div>
    );
  }
  return null;
};

// Custom bar with gradient and smooth animation
const CustomBar = (props) => {
  const { x, y, width, height, index, payload } = props;
  const [isHovered, setIsHovered] = useState(false);
  
  // Color based on range
  const getBarColor = (range) => {
    if (range.includes('90-100')) return '#10b981';
    if (range.includes('75-89')) return '#3b82f6';
    if (range.includes('50-74')) return '#f59e0b';
    return '#ef4444';
  };

  const color = getBarColor(payload.range);
  
  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Shadow glow effect */}
      <rect
        x={x - 8}
        y={y - 4}
        width={width + 16}
        height={height + 8}
        fill={color}
        opacity={isHovered ? 0.12 : 0}
        rx={12}
        ry={12}
        className="transition-all duration-300"
        style={{
          filter: isHovered ? 'blur(16px)' : 'blur(0px)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />
      
      {/* Main bar */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={`url(#barGradient${index})`}
        rx={isHovered ? 12 : 8}
        ry={isHovered ? 12 : 8}
        className="transition-all duration-300 cursor-pointer"
        style={{
          transform: isHovered ? 'scaleY(1.05) translateY(-2.5%)' : 'scaleY(1)',
          transformOrigin: 'bottom',
          filter: isHovered ? `drop-shadow(0 12px 32px ${color}40)` : 'drop-shadow(0 4px 12px rgba(0,0,0,0.06))',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />
      
      {/* Glossy overlay on hover */}
      {isHovered && (
        <rect
          x={x + 4}
          y={y + 4}
          width={width - 8}
          height={height * 0.35}
          fill="white"
          opacity={0.15}
          rx={10}
          ry={10}
          style={{
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      )}
      
      {/* Value label on top of bar */}
      {height > 20 && (
        <text
          x={x + width / 2}
          y={y - 16}
          textAnchor="middle"
          className="text-sm font-bold fill-gray-700"
          style={{
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isHovered ? 'scale(1.15)' : 'scale(1)',
            transformOrigin: 'bottom'
          }}
        >
          {payload.count}
        </text>
      )}
    </g>
  );
};

function ScoreDistributionChart({ data }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate statistics
  const totalAttempts = data.reduce((sum, item) => sum + item.count, 0);
  const maxCount = Math.max(...data.map(item => item.count));
  const passingRanges = data.filter(item => {
    const range = item.range;
    return range.includes('90-100') || range.includes('75-89') || range.includes('50-74');
  });
  const passingAttempts = passingRanges.reduce((sum, item) => sum + item.count, 0);
  const passRate = totalAttempts > 0 ? Math.round((passingAttempts / totalAttempts) * 100) : 0;

  // Get color for bar
  const getBarColor = (range) => {
    if (range.includes('90-100')) return '#10b981';
    if (range.includes('75-89')) return '#3b82f6';
    if (range.includes('50-74')) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50/80 rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100/80 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/60">
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          📊 Score Distribution
        </h3>
        
        <div className="flex items-center gap-4 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Pass Rate:</span>
            <span className={`font-bold text-lg ${passRate >= 70 ? 'text-emerald-500' : passRate >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
              {passRate}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Total Attempts:</span>
            <span className="font-bold text-gray-700">{totalAttempts}</span>
          </div>
        </div>
      </div>

      {/* Chart with animation - 1:3 ratio bars */}
      <div className={`transition-all duration-700 ease-out ${
        isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart 
            data={data}
            margin={{ top: 30, right: 60, left: 40, bottom: 25 }}
            barSize={200}
            maxBarSize={250}
          >
            <defs>
              {data.map((entry, index) => {
                const color = getBarColor(entry.range);
                return (
                  <linearGradient 
                    key={index} 
                    id={`barGradient${index}`} 
                    x1="0" y1="0" x2="0" y2="1"
                  >
                    <stop offset="0%" stopColor={color} stopOpacity={0.95}/>
                    <stop offset="40%" stopColor={color} stopOpacity={0.85}/>
                    <stop offset="100%" stopColor={color} stopOpacity={0.65}/>
                  </linearGradient>
                );
              })}
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
              dataKey="range" 
              tick={{ 
                fontSize: 13, 
                fill: '#475569',
                fontWeight: 600
              }}
              axisLine={{ stroke: '#e2e8f0', strokeWidth: 1.5 }}
              tickLine={false}
              tickMargin={15}
            />

            <YAxis 
              tick={{ 
                fontSize: 12, 
                fill: '#94a3b8',
                fontWeight: 500
              }}
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              allowDecimals={false}
              label={{
                value: 'Number of Attempts',
                angle: -90,
                position: 'insideLeft',
                style: { 
                  fontSize: 11, 
                  fill: '#94a3b8',
                  fontWeight: 500
                },
                offset: 10
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            <Bar
              dataKey="count"
              shape={<CustomBar />}
              animationBegin={200}
              animationDuration={1200}
              animationEasing="ease-out"
              isAnimationActive={isMounted}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={index} 
                  fill={`url(#barGradient${index})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend and Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-gray-200/50">
        <div className="text-center p-3 rounded-xl bg-emerald-50/50 hover:bg-emerald-50 transition-all duration-200 hover:scale-105 cursor-pointer">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-[10px] text-gray-500 font-medium uppercase">Excellent</span>
          </div>
          <p className="text-xl font-bold text-emerald-500">
            {data.find(item => item.range.includes('90-100'))?.count || 0}
          </p>
          <p className="text-[8px] text-gray-400 mt-0.5">attempts</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-blue-50/50 hover:bg-blue-50 transition-all duration-200 hover:scale-105 cursor-pointer">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span className="text-[10px] text-gray-500 font-medium uppercase">Good</span>
          </div>
          <p className="text-xl font-bold text-blue-500">
            {data.find(item => item.range.includes('75-89'))?.count || 0}
          </p>
          <p className="text-[8px] text-gray-400 mt-0.5">attempts</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-yellow-50/50 hover:bg-yellow-50 transition-all duration-200 hover:scale-105 cursor-pointer">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            <span className="text-[10px] text-gray-500 font-medium uppercase">Average</span>
          </div>
          <p className="text-xl font-bold text-yellow-500">
            {data.find(item => item.range.includes('50-74'))?.count || 0}
          </p>
          <p className="text-[8px] text-gray-400 mt-0.5">attempts</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-red-50/50 hover:bg-red-50 transition-all duration-200 hover:scale-105 cursor-pointer">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span className="text-[10px] text-gray-500 font-medium uppercase">Needs Work</span>
          </div>
          <p className="text-xl font-bold text-red-500">
            {data.find(item => item.range.includes('0-49'))?.count || 0}
          </p>
          <p className="text-[8px] text-gray-400 mt-0.5">attempts</p>
        </div>
      </div>

      {/* Performance Indicator */}
      <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 font-medium">Overall Performance</span>
          <div className="flex items-center gap-3">
            <span className="text-gray-500">Passing Rate:</span>
            <div className="flex items-center gap-2">
              <div className="w-40 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000"
                  style={{ width: `${passRate}%` }}
                />
              </div>
              <span className={`font-bold ${passRate >= 70 ? 'text-emerald-500' : passRate >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                {passRate}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScoreDistributionChart;