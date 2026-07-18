import {
  calculatePercentage,
  getPassStatus,
  getPassStatusClasses,
} from "../../utils/analyticsHelpers";

function AttemptsTable({ attempts }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow">
      <h3 className="font-bold text-lg mb-4">
        📋 All Attempts
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-3 pr-4">#</th>
              <th className="pb-3 pr-4">Date</th>
              <th className="pb-3 pr-4">Score</th>
              <th className="pb-3 pr-4">Percentage</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3">Weak Topics</th>
            </tr>
          </thead>

          <tbody>
            {attempts.map((attempt, index) => (
              <tr
                key={index}
                className="border-b hover:bg-gray-50"
              >
                <td className="py-3 pr-4 text-gray-400">
                  {index + 1}
                </td>

                <td className="py-3 pr-4">
                  {attempt.date}
                </td>

                <td className="py-3 pr-4">
                  {attempt.score}/{attempt.total}
                </td>

                <td className="py-3 pr-4">
                  {calculatePercentage(attempt.score, attempt.total)}%
                </td>

                <td className="py-3 pr-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getPassStatusClasses(
                      attempt.score
                    )}`}
                  >
                    {getPassStatus(attempt.score)}
                  </span>
                </td>

                <td className="py-3">
                  <div className="flex flex-wrap gap-1">
                    {attempt.weak_topics.map((topic, i) => (
                      <span
                        key={i}
                        className="bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AttemptsTable;