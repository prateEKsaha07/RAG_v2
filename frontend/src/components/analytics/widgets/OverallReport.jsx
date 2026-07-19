function OverallReport({ dashboard }) {

    const { overview, roadmap } = dashboard;

    return (

        <div className="bg-white rounded-xl shadow border p-6">

            <h2 className="text-xl font-semibold mb-6">
                Overall Summary
            </h2>

            <div className="space-y-5">

                <div className="flex justify-between">

                    <span>Total Books</span>

                    <strong>{overview.books}</strong>

                </div>

                <div className="flex justify-between">

                    <span>Total Notes</span>

                    <strong>{overview.notes}</strong>

                </div>

                <div className="flex justify-between">

                    <span>Quiz Attempts</span>

                    <strong>{overview.quiz_attempts}</strong>

                </div>

                <div className="flex justify-between">

                    <span>Average Score</span>

                    <strong>{overview.average_score}%</strong>

                </div>

                <div className="flex justify-between">

                    <span>Active Roadmaps</span>

                    <strong>{roadmap.active}</strong>

                </div>

            </div>

        </div>

    );

}

export default OverallReport;