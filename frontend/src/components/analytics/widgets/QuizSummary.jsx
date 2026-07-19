function QuizSummary({ quiz }) {

    const cards = [

        {
            title: "Average Score",
            value: `${quiz.average_score}%`,
        },

        {
            title: "Best Score",
            value: `${quiz.best_score}%`,
        },

        {
            title: "Latest Score",
            value: `${quiz.latest_score}%`,
        },

        {
            title: "Pass Rate",
            value: `${quiz.pass_rate}%`,
        },

        {
            title: "Attempts",
            value: quiz.total_attempts,
        },

    ];

    return (

        <div className="bg-white rounded-xl shadow border p-6">

            <h2 className="text-xl font-semibold mb-6">

                Quiz Summary

            </h2>

            <div className="grid grid-cols-2 gap-4">

                {cards.map((card) => (

                    <div
                        key={card.title}
                        className="border rounded-lg p-4"
                    >

                        <div className="text-gray-500 text-sm">

                            {card.title}

                        </div>

                        <div className="text-2xl font-bold mt-2">

                            {card.value}

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

}

export default QuizSummary;