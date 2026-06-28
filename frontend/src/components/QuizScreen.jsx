import { useState, useEffect } from "react"
import { generateQuiz, evaluateAnswers } from "../api"

function QuizScreen({ subject, onSubmit }) {
  const [quiz, setQuiz] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchQuiz()
  }, [])

  const fetchQuiz = async () => {
  try {
    setLoading(true)
    setError("")
    const response = await generateQuiz(subject)
    setQuiz(response.data.quiz || [])
  } catch (error) {
    setError("Failed to generate quiz. Is backend running?")
  } finally {
    setLoading(false)
  }
}


  const handleAnswer = (questionIndex, option) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: option }))
  }

  const handleSubmit = async () => {
  try {
    setSubmitting(true)
    const answersArray = quiz.map((_, i) => answers[i] || "A")
    const response = await evaluateAnswers(quiz, answersArray, subject)
    onSubmit(quiz, response.data)
  } catch (error) {
    console.error("Error details:", error.response?.data)
  } finally {
    setSubmitting(false)
  }
}

  const allAnswered =
    quiz.length > 0 &&
    Object.keys(answers).length === quiz.length

  if (loading) return (
    <div className="text-center text-gray-500 mt-20 text-lg">
      Generating your quiz... ⏳
    </div>
  )

  if (error) return (
    <div className="text-center text-red-500 mt-20 text-lg">
      {error}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Quiz — {subject}
      </h2>

      {quiz.length === 0 ? (
        <div className="text-center text-gray-500">
          No quiz questions found.
        </div>
      ) : (
        <>
          {quiz.map((question, index) => (
            <div key={index}
              className="bg-white rounded-xl p-6 shadow mb-5 border"
            >
              <p className="font-semibold mb-4 text-lg">
                Q{index + 1}: {question.question}
              </p>

              <div className="space-y-3">
                {Object.entries(question.options || {}).map(
                  ([letter, text]) => (
                    <button
                      key={letter}
                      onClick={() => handleAnswer(index, letter)}
                      className={`w-full text-left p-3 rounded-lg border transition
                        ${answers[index] === letter
                          ? "bg-blue-100 border-blue-500 font-medium"
                          : "hover:bg-gray-50 border-gray-300"
                        }`}
                    >
                      <span className="font-bold mr-2">{letter}.</span>
                      {text}
                    </button>
                  )
                )}
              </div>

              <p className="text-xs text-gray-400 mt-4">
                Topic: {question.topic}
              </p>
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="w-full bg-green-600 text-white py-3 rounded-xl
                       font-semibold hover:bg-green-700
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit Answers"}
          </button>
        </>
      )}
    </div>
  )
}

export default QuizScreen