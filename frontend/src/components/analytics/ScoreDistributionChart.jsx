import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

function ScoreDistributionChart({ data }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow mb-6">
      <h3 className="font-bold text-lg mb-4">
        📊 Score Distribution
      </h3>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="range" />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="count"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ScoreDistributionChart;