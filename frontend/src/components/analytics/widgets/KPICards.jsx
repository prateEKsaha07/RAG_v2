function KPICards({ overview }) {
    const cards = [
        {
            title: "Books",
            value: overview.books,
            color: "bg-blue-500",
        },
        {
            title: "Notes",
            value: overview.notes,
            color: "bg-green-500",
        },
        {
            title: "Quiz Attempts",
            value: overview.quiz_attempts,
            color: "bg-purple-500",
        },
        {
            title: "Average Score",
            value: `${overview.average_score}%`,
            color: "bg-orange-500",
        },
        {
            title: "Roadmaps",
            value: overview.active_roadmaps,
            color: "bg-pink-500",
        },
        {
            title: "Current Streak",
            value: overview.current_streak,
            color: "bg-red-500",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {cards.map((card) => (
                <div
                    key={card.title}
                    className="bg-white rounded-xl shadow p-5 border"
                >
                    <div className="text-gray-500 text-sm">
                        {card.title}
                    </div>

                    <div className="mt-2 text-3xl font-bold">
                        {card.value}
                    </div>

                    <div
                        className={`mt-4 h-2 rounded-full ${card.color}`}
                    />
                </div>
            ))}
        </div>
    );
}

export default KPICards;