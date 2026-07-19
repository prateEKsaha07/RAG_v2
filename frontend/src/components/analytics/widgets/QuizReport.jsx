function QuizReport({ dashboard }) {

    const { quiz } = dashboard;

    return (

        <div className="bg-white rounded-xl shadow border p-6">

            <h2 className="text-xl font-semibold mb-6">

                Quiz Statistics

            </h2>

            <div className="space-y-5">

                <div className="flex justify-between">

                    <span>Average Score</span>

                    <strong>{quiz.average_score}%</strong>

                </div>

                <div className="flex justify-between">

                    <span>Best Score</span>

                    <strong>{quiz.best_score}%</strong>

                </div>

                <div className="flex justify-between">

                    <span>Latest Score</span>

                    <strong>{quiz.latest_score}%</strong>

                </div>

                <div className="flex justify-between">

                    <span>Pass Rate</span>

                    <strong>{quiz.pass_rate}%</strong>

                </div>

                <div className="flex justify-between">

                    <span>Total Attempts</span>

                    <strong>{quiz.total_attempts}</strong>

                </div>

            </div>

        </div>

    );

}
export default QuizReport;