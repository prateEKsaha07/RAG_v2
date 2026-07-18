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

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const severity = value >= 8 ? 'Critical' : value >= 5 ? 'High' : 'Medium';
    
    return (
      <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-800 text-sm">{label}</p>
        <div className="flex items-center justify-between gap-3 mt-1">
          <span className="text-gray-600 text-xs">Errors:</span>
          <span className="font-bold text-red-500 text-sm">{value}</span>
        </div>
        <div className="mt-1 px-2 py-0.5 bg-gray-100 rounded text-center">
          <span className="text-[10px] font-semibold text-gray-600">
            {severity} Priority
          </span>
        </div>
      </div>
    );
  }
  return null;
};

// Custom YAxis tick with 3 line limit
const CustomYAxisTick = ({ x, y, payload }) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = (node) => {
    if (node) {
      // Check if text exceeds 3 lines (approx 18 characters per line with current font)
      const maxChars = 54; // 18 chars * 3 lines
      setIsOverflowing(payload.value.length > maxChars);
    }
  };

  const displayText = payload.value.length > 54 
    ? payload.value.substring(0, 54) + '...' 
    : payload.value;

  return (
    <text
      ref={textRef}
      x={x - 8}
      y={y}
      dy={4}
      textAnchor="end"
      fill="#475569"
      fontSize={10}
      fontWeight={500}
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {displayText}
    </text>
  );
};

function WeakTopicsChart({ data }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sort data by count (highest first)
  const sortedData = [...data].sort((a, b) => b.count - a.count);
  
  // Calculate total
  const totalErrors = data.reduce((sum, item) => sum + item.count, 0);

  // Color mapping
  const getBarColor = (value) => {
    if (value >= 8) return '#ef4444';
    if (value >= 5) return '#f97316';
    if (value >= 3) return '#eab308';
    return '#94a3b8';
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <span>⚠️</span> Weak Topics
        </h3>
        <div className="text-xs text-gray-500">
          Total: <span className="font-bold text-red-500">{totalErrors}</span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 min-h-0">
        <div className={`transition-all duration-700 ease-out ${
          isMounted ? 'opacity-100' : 'opacity-0'
        }`} style={{ height: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={sortedData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              barSize={20}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#f1f5f9"
                horizontal={false}
              />

              <XAxis 
                type="number"
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                allowDecimals={false}
              />

              <YAxis 
                type="category"
                dataKey="topic"
                axisLine={false}
                tickLine={false}
                width={80}
                interval={0}
                tick={<CustomYAxisTick />}
              />

              <Tooltip content={<CustomTooltip />} />

              <Bar
                dataKey="count"
                animationBegin={200}
                animationDuration={800}
                animationEasing="ease-out"
                isAnimationActive={isMounted}
                radius={[0, 4, 4, 0]}
                background={{ fill: '#f8fafc' }}
              >
                {sortedData.map((entry, index) => (
                  <Cell 
                    key={index} 
                    fill={getBarColor(entry.count)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span className="text-[9px] text-gray-500">Critical</span>
          <span className="text-xs font-bold text-red-500">
            {data.filter(item => item.count >= 8).length}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          <span className="text-[9px] text-gray-500">High</span>
          <span className="text-xs font-bold text-orange-500">
            {data.filter(item => item.count >= 5 && item.count < 8).length}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
          <span className="text-[9px] text-gray-500">Medium</span>
          <span className="text-xs font-bold text-yellow-500">
            {data.filter(item => item.count >= 3 && item.count < 5).length}
          </span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="w-2 h-2 rounded-full bg-gray-400"></span>
          <span className="text-[9px] text-gray-500">Low</span>
          <span className="text-xs font-bold text-gray-500">
            {data.filter(item => item.count < 3).length}
          </span>
        </div>
      </div>
    </div>
  );
}

export default WeakTopicsChart;