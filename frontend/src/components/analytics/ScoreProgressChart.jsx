import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

function ScoreProgressChart({ data }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow mb-6">
      <h3 className="font-bold text-lg mb-4">
        📈 Score Progression
      </h3>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 10 }}
          />

          <YAxis
            domain={[0, 100]}
            unit="%"
          />

          <Tooltip
            formatter={(value) => `${value}%`}
          />

          <Line
            type="monotone"
            dataKey="percentage"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: "#3b82f6" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ScoreProgressChart;