import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

function WeakTopicsChart({ data }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow">
      <h3 className="font-bold text-lg mb-4">
        ⚠️ Weak Topics
      </h3>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="topic"
            tick={{ fontSize: 9 }}
          />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="count"
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default WeakTopicsChart;