function RoadmapSummary({ roadmap }) {

    const cards = [

        {
            title: "Active",
            value: roadmap.active,
        },

        {
            title: "Completed",
            value: roadmap.completed,
        },

        {
            title: "Behind",
            value: roadmap.behind,
        },

    ];

    return (

        <div className="bg-white rounded-xl shadow border p-6">

            <h2 className="text-xl font-semibold mb-6">

                Roadmap Summary

            </h2>

            <div className="grid grid-cols-3 gap-4">

                {cards.map(card => (

                    <div
                        key={card.title}
                        className="border rounded-lg p-4 text-center"
                    >

                        <div className="text-gray-500">

                            {card.title}

                        </div>

                        <div className="text-3xl font-bold mt-2">

                            {card.value}

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

}

export default RoadmapSummary;