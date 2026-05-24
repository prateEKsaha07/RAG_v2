function ResultScreen({ results, onRestart }) {
  if (!results) return (
    <div className="text-center mt-20 text-gray-500">
      No results available.
    </div>
  )

  const { results: quizResults, weak_topics, recommendations } = results
  const score = quizResults.filter(r => r.is_correct).length

  return (
    <div className="max-w-3xl mx-auto p-4">

      <h2 className="text-3xl font-bold text-center mb-4">
        Quiz Results 📊
      </h2>

      {/* Score Card */}
      <div className="bg-white rounded-xl shadow p-6 text-center mb-8">
        <p className="text-6xl font-bold text-blue-600">
          {score}/{quizResults.length}
        </p>
        <p className="text-gray-500 mt-2 text-lg">
          {score === quizResults.length
            ? "Perfect score! 🎉"
            : score >= 3
            ? "Good job! Keep it up 💪"
            : "Keep studying! You got this 📚"}
        </p>
      </div>

      {/* Question Review */}
      <h3 className="text-xl font-bold mb-4">Question Review</h3>
      <div className="space-y-4 mb-10">
        {quizResults.map((item, index) => (
          <div key={index}
            className={`p-5 rounded-xl border shadow-sm
              ${item.is_correct
                ? "bg-green-50 border-green-300"
                : "bg-red-50 border-red-300"
              }`}
          >
            <p className="font-semibold text-lg mb-3">
              Q{index + 1}: {item.question}
            </p>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Your Answer:</span>{" "}
                {item.your_answer}
              </p>
              <p>
                <span className="font-medium">Correct Answer:</span>{" "}
                {item.correct_answer}
              </p>
              <p>
                <span className="font-medium">Topic:</span>{" "}
                {item.topic}
              </p>
            </div>
            <div className="mt-3">
              {item.is_correct
                ? <span className="text-green-700 font-semibold">Correct ✅</span>
                : <span className="text-red-700 font-semibold">Incorrect ❌</span>
              }
            </div>
          </div>
        ))}
      </div>

      {/* Weak Topics */}
      <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">Weak Topics ⚠️</h3>
        {weak_topics && weak_topics.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {weak_topics.map((topic, index) => (
              <span key={index}
                className="bg-yellow-200 text-yellow-900
                           px-3 py-1 rounded-full text-sm font-medium"
              >
                {topic.topic}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No weak topics detected 🎯</p>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 border border-blue-300 rounded-xl p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">Revision Material 📚</h3>
        {recommendations && recommendations.length > 0 ? (
          <ul className="space-y-3">
            {recommendations.map((rec, index) => (
              <li key={index} className="bg-white p-4 rounded-lg border">
                <p className="font-medium text-blue-700">{rec.weak_topic}</p>
                <p className="text-sm text-gray-600 mt-1">{rec.revise_this}</p>
                <p className="text-xs text-gray-400 mt-2">{rec.source}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No recommendations available.</p>
        )}
      </div>

      {/* Restart */}
      <button
        onClick={onRestart}
        className="w-full bg-blue-600 text-white py-3
                   rounded-xl font-medium hover:bg-blue-700"
      >
        Try Another Subject 🔄
      </button>

    </div>
  )
}

export default ResultScreen