import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from "recharts";

const COLORS = [
  "#3b82f6",
  "#ef4444",
];

// Custom label with better styling
const renderCustomLabel = ({ name, value, percent }) => {
  return `${name}: ${value} (${(percent * 100).toFixed(1)}%)`;
};

// Custom tooltip with better design
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-gray-100">
        <p className="font-semibold text-gray-800">{payload[0].name}</p>
        <p className="text-sm text-gray-600">
          Value: <span className="font-medium text-gray-900">{payload[0].value}</span>
        </p>
        <p className="text-sm text-gray-600">
          Percentage: <span className="font-medium text-gray-900">
            {(payload[0].payload.percent * 100).toFixed(1)}%
          </span>
        </p>
      </div>
    );
  }
  return null;
};

function PassFailChart({ data }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate total for percentage
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithPercent = data.map(item => ({
    ...item,
    percent: item.value / total
  }));

  return (
    <div className="bg-gradient-to-br from-white to-gray-50/80 rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100/80 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/60">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          📊 Pass / Fail Ratio
        </h3>
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-200"></span>
            <span className="text-gray-600 font-medium">Pass</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-200"></span>
            <span className="text-gray-600 font-medium">Fail</span>
          </span>
        </div>
      </div>

      <div className={`transition-all duration-700 ease-out ${
        isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={dataWithPercent}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={50}
              paddingAngle={4}
              label={renderCustomLabel}
              labelLine={{
                stroke: '#94a3b8',
                strokeWidth: 1.5,
                strokeDasharray: '3 3'
              }}
              animationBegin={200}
              animationDuration={1200}
              animationEasing="ease-out"
              isAnimationActive={isMounted}
            >
              {dataWithPercent.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                  stroke="white"
                  strokeWidth={2}
                />
              ))}
            </Pie>

            <Legend
              verticalAlign="bottom"
              align="center"
              layout="horizontal"
              iconType="circle"
              iconSize={10}
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#4b5563'
              }}
            />

            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200/50">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-500">
            {data.find(d => d.name === 'Pass')?.value || 0}
          </p>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Pass</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-500">
            {data.find(d => d.name === 'Fail')?.value || 0}
          </p>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Fail</p>
        </div>
      </div>
    </div>
  );
}

export default PassFailChart;



// import {
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   Legend,
//   Tooltip,
// } from "recharts";

// const COLORS = [
//   "#3b82f6",
//   "#ef4444",
// ];

// function PassFailChart({ data }) {
//   return (
//     <div className="bg-white rounded-xl p-6 shadow">
//       <h3 className="font-bold text-lg mb-4">
//         ✅ Pass / Fail Ratio
//       </h3>

//       <ResponsiveContainer width="100%" height={250}>
//         <PieChart>
//           <Pie
//             data={data}
//             dataKey="value"
//             nameKey="name"
//             cx="50%"
//             cy="50%"
//             outerRadius={80}
//             label={({ name, value }) => `${name}: ${value}`}
//           >
//             {data.map((_, index) => (
//               <Cell
//                 key={index}
//                 fill={COLORS[index]}
//               />
//             ))}
//           </Pie>

//           <Legend />

//           <Tooltip />
//         </PieChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

// export default PassFailChart;