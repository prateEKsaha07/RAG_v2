import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";

function QuizTrend({ quiz }) {

    const data = quiz.recent_attempts.map((item, index) => ({
        attempt: index + 1,
        score: item.percentage,
    }));

    return (

        <div className="bg-white rounded-xl shadow border p-6">

            <h2 className="text-xl font-semibold mb-6">

                Recent Performance

            </h2>

            <div className="h-72">

                <ResponsiveContainer>

                    <LineChart data={data}>

                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="attempt" />

                        <YAxis domain={[0,100]} />

                        <Tooltip />

                        <Line
                            dataKey="score"
                            stroke="#3B82F6"
                            strokeWidth={3}
                        />

                    </LineChart>

                </ResponsiveContainer>

            </div>

        </div>

    );

}

export default QuizTrend;