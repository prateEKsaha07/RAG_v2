function RecentAttempts({ quiz }) {

    return (

        <div className="bg-white rounded-xl shadow border p-6">

            <h2 className="text-xl font-semibold mb-6">

                Recent Attempts

            </h2>

            <div className="space-y-4">

                {quiz.recent_attempts.map((attempt, index) => (

                    <div
                        key={index}
                        className="flex justify-between border-b pb-3"
                    >

                        <div>

                            {new Date(attempt.date).toLocaleDateString()}

                        </div>

                        <div className="font-semibold">

                            {attempt.percentage}%

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

}

export default RecentAttempts;