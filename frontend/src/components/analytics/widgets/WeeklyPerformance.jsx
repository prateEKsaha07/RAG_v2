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

function WeeklyPerformance({ dashboard }) {

    return (

        <div className="bg-white rounded-xl shadow border p-6">

            <h2 className="text-xl font-semibold mb-6">

                Weekly Activity

            </h2>

            <div className="h-72">

                <ResponsiveContainer>

                    <BarChart data={dashboard.weekly_progress}>

                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="day" />

                        <YAxis />

                        <Tooltip />

                        <Legend />

                        <Bar
                            dataKey="quiz"
                            fill="#3B82F6"
                        />

                        <Bar
                            dataKey="books"
                            fill="#10B981"
                        />

                        <Bar
                            dataKey="notes"
                            fill="#F59E0B"
                        />

                    </BarChart>

                </ResponsiveContainer>

            </div>

        </div>

    );

}

export default WeeklyPerformance;