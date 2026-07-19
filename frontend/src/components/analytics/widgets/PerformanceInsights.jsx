function PerformanceInsights({ dashboard }) {

    const { quiz, overview, study } = dashboard;

    return (

        <div className="bg-white rounded-xl shadow border p-6">

            <h2 className="text-xl font-semibold mb-6">

                Performance Insights

            </h2>

            <div className="space-y-5">

                <div className="border rounded-lg p-4">

                    Average Quiz Score

                    <div className="font-bold text-xl">

                        {quiz.average_score}%

                    </div>

                </div>

                <div className="border rounded-lg p-4">

                    Reading Progress

                    <div className="font-bold text-xl">

                        {study.reading_progress}%

                    </div>

                </div>

                <div className="border rounded-lg p-4">

                    Total Learning Resources

                    <div className="font-bold text-xl">

                        {overview.books + overview.notes}

                    </div>

                </div>

            </div>

        </div>

    );

}

export default PerformanceInsights;