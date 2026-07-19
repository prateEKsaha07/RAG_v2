import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from "recharts";

function WeeklyActivity({ weekly }) {

    return (
        <div className="bg-white rounded-xl shadow border p-6">

            <h2 className="text-xl font-semibold mb-5">
                Weekly Activity
            </h2>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekly}>
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="day" />

                        <YAxis allowDecimals={false} />

                        <Tooltip />

                        <Legend />

                        <Bar
                            dataKey="quiz"
                            fill="#3B82F6"
                            name="Quiz"
                            radius={[5, 5, 0, 0]}
                        />

                        <Bar
                            dataKey="books"
                            fill="#10B981"
                            name="Books"
                            radius={[5, 5, 0, 0]}
                        />

                        <Bar
                            dataKey="notes"
                            fill="#F59E0B"
                            name="Notes"
                            radius={[5, 5, 0, 0]}
                        />

                    </BarChart>
                </ResponsiveContainer>
            </div>

        </div>
    );
}

export default WeeklyActivity;