import {
    ResponsiveContainer,
    AreaChart,
    Area,
    CartesianGrid,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

function PerformanceTrend({ dashboard }) {

    const data = dashboard.quiz.recent_attempts.map((item, index) => ({
        attempt: index + 1,
        score: item.percentage,
    }));

    return (

        <div className="bg-white rounded-xl shadow border p-6">

            <h2 className="text-xl font-semibold mb-6">

                Score Trend

            </h2>

            <div className="h-72">

                <ResponsiveContainer>

                    <AreaChart data={data}>

                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="attempt" />

                        <YAxis domain={[0,100]} />

                        <Tooltip />

                        <Area
                            dataKey="score"
                            stroke="#2563EB"
                            fill="#93C5FD"
                        />

                    </AreaChart>

                </ResponsiveContainer>

            </div>

        </div>

    );

}

export default PerformanceTrend;