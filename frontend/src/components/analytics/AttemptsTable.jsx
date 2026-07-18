import { useEffect, useState } from "react";
import {
  calculatePercentage,
  getPassStatus,
  getPassStatusClasses,
} from "../../utils/analyticsHelpers";

// SVG Icons
const Icons = {
  attempts: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  date: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  score: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  status: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  weak: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
};

function AttemptsTable({ attempts }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate statistics
  const totalAttempts = attempts.length;
  const passedAttempts = attempts.filter(a => getPassStatus(a.score) === 'Pass').length;
  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

  return (
    <div className="bg-gradient-to-br from-white to-gray-50/80 rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100/80 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/60">
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent flex items-center gap-2">
          <span>📋</span> All Attempts
        </h3>
        
        <div className="flex items-center gap-4 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Total:</span>
            <span className="font-bold text-gray-700">{totalAttempts}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Passed:</span>
            <span className="font-bold text-green-600">{passedAttempts}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Pass Rate:</span>
            <span className={`font-bold ${passRate >= 70 ? 'text-green-600' : passRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
              {passRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className={`transition-all duration-700 ease-out ${
        isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <div className="overflow-x-auto rounded-xl border border-gray-200/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100/80 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    {Icons.attempts}
                    <span>#</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    {Icons.date}
                    <span>Date</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    {Icons.score}
                    <span>Score</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <span>%</span>
                    <span>Percentage</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    {Icons.status}
                    <span>Status</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    {Icons.weak}
                    <span>Weak Topics</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {attempts.map((attempt, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50/80 transition-colors duration-200 group"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <td className="px-4 py-3 text-gray-400 font-medium">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-bold text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors duration-200">
                      {index + 1}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-gray-700 font-medium">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">{Icons.date}</span>
                      {attempt.date}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-gray-800">{attempt.score}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-500">{attempt.total}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-16">
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              calculatePercentage(attempt.score, attempt.total) >= 70 
                                ? 'bg-gradient-to-r from-green-400 to-green-600' 
                                : calculatePercentage(attempt.score, attempt.total) >= 50
                                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                                : 'bg-gradient-to-r from-red-400 to-red-600'
                            }`}
                            style={{ 
                              width: isMounted ? `${calculatePercentage(attempt.score, attempt.total)}%` : '0%',
                              transitionDelay: `${index * 50}ms`
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-600 min-w-[40px] text-right">
                        {calculatePercentage(attempt.score, attempt.total)}%
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getPassStatusClasses(
                        attempt.score
                      )}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        getPassStatus(attempt.score) === 'Pass' ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                      {getPassStatus(attempt.score)}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {attempt.weak_topics.length > 0 ? (
                        attempt.weak_topics.map((topic, i) => (
                          <span
                            key={i}
                            className="bg-red-50/80 text-red-600 text-[10px] font-medium px-2.5 py-1 rounded-full border border-red-100/50 hover:bg-red-100 transition-colors duration-200"
                          >
                            {topic}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-[10px] italic">
                          No weak topics
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {attempts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 font-medium">No attempts recorded yet</p>
            <p className="text-gray-400 text-sm mt-1">Start taking quizzes to see your progress here</p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {attempts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200/50 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Attempts</p>
            <p className="text-lg font-bold text-gray-700">{totalAttempts}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Passed</p>
            <p className="text-lg font-bold text-green-600">{passedAttempts}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Failed</p>
            <p className="text-lg font-bold text-red-600">{totalAttempts - passedAttempts}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Pass Rate</p>
            <p className={`text-lg font-bold ${passRate >= 70 ? 'text-green-600' : passRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
              {passRate}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttemptsTable;