import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

function RoadmapStatus({ roadmap }) {

    const data = [

        {
            name: "Active",
            value: roadmap.active,
        },

        {
            name: "Completed",
            value: roadmap.completed,
        },

        {
            name: "Behind",
            value: roadmap.behind,
        },

    ];

    const colors = [
        "#3B82F6",
        "#10B981",
        "#EF4444",
    ];

    return (

        <div className="bg-white rounded-xl shadow border p-6">

            <h2 className="text-xl font-semibold mb-6">

                Roadmap Status

            </h2>

            <div className="h-72">

                <ResponsiveContainer>

                    <PieChart>

                        <Pie
                            data={data}
                            dataKey="value"
                            outerRadius={90}
                        >

                            {data.map((_, index) => (

                                <Cell
                                    key={index}
                                    fill={colors[index]}
                                />

                            ))}

                        </Pie>

                        <Tooltip />

                    </PieChart>

                </ResponsiveContainer>

            </div>

        </div>

    );

}

export default RoadmapStatus;