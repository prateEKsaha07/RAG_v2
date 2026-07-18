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

function PassFailChart({ data }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow">
      <h3 className="font-bold text-lg mb-4">
        ✅ Pass / Fail Ratio
      </h3>

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, value }) => `${name}: ${value}`}
          >
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={COLORS[index]}
              />
            ))}
          </Pie>

          <Legend />

          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PassFailChart;