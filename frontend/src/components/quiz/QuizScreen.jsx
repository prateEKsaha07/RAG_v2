import { useState, useEffect } from "react"
import { generateQuiz, evaluateAnswers } from "../../api"
import {
  Brain,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Trophy,
  Target,
  BookOpen,
  Zap
} from "lucide-react"
import ModuleNav from "../common/ModuleNav"

function QuizScreen({ subject, onSubmit, onBack, onLogout, user, onStudy, onUpload, onNotes, onRoadmap, onAnalyticsV2 }) {
  const [quiz, setQuiz] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)

  useEffect(() => {
    fetchQuiz()
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
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

  const allAnswered = quiz.length > 0 && Object.keys(answers).length === quiz.length
  const progress = quiz.length > 0 ? (Object.keys(answers).length / quiz.length) * 100 : 0
  const currentQuestion = quiz[currentQuestionIndex]

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) return (
    <div className="min-h-screen bg-[#f7f3ee] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#e8dfd3] border-t-[#5c1a1a] rounded-full animate-spin" />
        <p className="text-sm text-[#8a7965]">Generating your quiz...</p>
        <p className="text-xs text-[#a89880]">This may take a few moments</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-[#f7f3ee] flex items-center justify-center p-4">
      <div className="bg-white border border-[#e8dfd3] rounded-lg p-8 max-w-md w-full text-center">
        <div className="w-12 h-12 rounded-md border border-[#e8dfd3] bg-[#faf7f3] mx-auto flex items-center justify-center mb-4">
          <AlertCircle size={20} strokeWidth={1.8} className="text-[#a83232]" />
        </div>
        <h3 className="text-lg font-semibold text-[#2a1f14] mb-2">
          Failed to Generate Quiz
        </h3>
        <p className="text-sm text-[#8a7965] mb-6">{error}</p>
        <button
          onClick={fetchQuiz}
          className="px-5 py-2.5 rounded-md bg-[#5c1a1a] text-white text-sm font-medium hover:bg-[#4a1414] transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f7f3ee] text-[#2a1f14]">

      <ModuleNav
        active="quiz"
        onDashboard={onBack}
        onStudy={onStudy}
        onUpload={onUpload}
        onNotes={onNotes}
        onRoadmap={onRoadmap}
        onAnalyticsV2={onAnalyticsV2}
        onLogout={onLogout}
        user={user}
      />

      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-10 space-y-8">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.14em] uppercase text-[#8a7965] mb-1.5">
              Quiz
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2a1f14] mb-1.5">
              Quiz
            </h1>
            <p className="text-sm text-[#8a7965]">
              Test your knowledge on {subject}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md border border-[#e8dfd3] bg-white">
              <Clock size={13} strokeWidth={1.8} className="text-[#8a7965]" />
              <span className="text-xs font-medium text-[#2a1f14] tabular-nums">{formatTime(timeSpent)}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md border border-[#e8dfd3] bg-white">
              <Target size={13} strokeWidth={1.8} className="text-[#8a7965]" />
              <span className="text-xs font-medium text-[#2a1f14] tabular-nums">
                {Object.keys(answers).length}/{quiz.length}
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-[11px] tracking-[0.1em] uppercase text-[#8a7965] mb-2">
            <span>Progress</span>
            <span className="tabular-nums">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#f0e9e0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#5c1a1a] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {quiz.length === 0 ? (
          <div className="bg-white border border-[#e8dfd3] rounded-lg p-12 text-center">
            <div className="w-12 h-12 rounded-md border border-[#e8dfd3] bg-[#faf7f3] mx-auto flex items-center justify-center mb-4">
              <BookOpen size={20} strokeWidth={1.8} className="text-[#5c1a1a]" />
            </div>
            <h3 className="text-lg font-semibold text-[#2a1f14] mb-2">No Quiz Questions</h3>
            <p className="text-sm text-[#8a7965]">Unable to generate questions for this subject</p>
          </div>
        ) : (
          <>
            {/* Question counter */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                aria-label="Previous question"
                className={`w-9 h-9 rounded-md border flex items-center justify-center transition-colors ${
                  currentQuestionIndex === 0
                    ? "border-[#e8dfd3] bg-[#faf7f3] text-[#a89880] cursor-not-allowed"
                    : "border-[#e8dfd3] bg-white text-[#5c1a1a] hover:border-[#5c1a1a]/40"
                }`}
              >
                <ChevronLeft size={16} strokeWidth={1.8} />
              </button>

              <span className="text-xs text-[#8a7965] tabular-nums">
                Question {currentQuestionIndex + 1} of {quiz.length}
              </span>

              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(quiz.length - 1, prev + 1))}
                disabled={currentQuestionIndex === quiz.length - 1}
                aria-label="Next question"
                className={`w-9 h-9 rounded-md border flex items-center justify-center transition-colors ${
                  currentQuestionIndex === quiz.length - 1
                    ? "border-[#e8dfd3] bg-[#faf7f3] text-[#a89880] cursor-not-allowed"
                    : "border-[#e8dfd3] bg-white text-[#5c1a1a] hover:border-[#5c1a1a]/40"
                }`}
              >
                <ChevronRight size={16} strokeWidth={1.8} />
              </button>
            </div>

            {/* Question card */}
            <div className="bg-white border border-[#e8dfd3] rounded-lg p-8">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-9 h-9 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center flex-shrink-0">
                  <Sparkles size={15} strokeWidth={1.8} className="text-[#5c1a1a]" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[#2a1f14] text-base leading-relaxed mb-2">
                    {currentQuestion?.question}
                  </p>
                  <p className="text-[11px] text-[#8a7965] flex items-center gap-1.5">
                    <BookOpen size={11} strokeWidth={1.8} />
                    Topic: {currentQuestion?.topic}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {currentQuestion && Object.entries(currentQuestion.options || {}).map(
                  ([letter, text]) => {
                    const isSelected = answers[currentQuestionIndex] === letter;
                    return (
                      <button
                        key={letter}
                        onClick={() => handleAnswer(currentQuestionIndex, letter)}
                        className={`w-full text-left p-4 rounded-md border transition-colors ${
                          isSelected
                            ? "border-[#5c1a1a] bg-[#faf7f3]"
                            : "border-[#e8dfd3] bg-white hover:border-[#5c1a1a]/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-colors ${
                            isSelected
                              ? "bg-[#5c1a1a] text-white"
                              : "border border-[#e8dfd3] bg-white text-[#8a7965]"
                          }`}>
                            {letter}
                          </span>
                          <span className={`text-sm flex-1 ${isSelected ? "font-medium text-[#2a1f14]" : "text-[#3a2a1a]"}`}>
                            {text}
                          </span>
                          {isSelected && (
                            <CheckCircle size={16} strokeWidth={2} className="text-[#5c1a1a] flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  }
                )}
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-1.5 mt-6">
                {quiz.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    aria-label={`Go to question ${index + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentQuestionIndex
                        ? "w-6 bg-[#5c1a1a]"
                        : answers[index]
                          ? "w-1.5 bg-[#8a7965]"
                          : "w-1.5 bg-[#e8dfd3]"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Submit */}
            <div>
              {!allAnswered && (
                <div className="flex items-center gap-2 mb-4 p-3 rounded-md border border-[#e8dfd3] bg-[#faf7f3] text-xs text-[#5a4a3a]">
                  <AlertCircle size={13} strokeWidth={1.8} className="flex-shrink-0" />
                  <span>{quiz.length - Object.keys(answers).length} questions remaining</span>
                </div>
              )}

              <button
                onClick={() => setShowSubmitModal(true)}
                disabled={!allAnswered || submitting}
                className={`w-full py-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  !allAnswered || submitting
                    ? "bg-[#f0e9e0] text-[#a89880] cursor-not-allowed"
                    : "bg-[#5c1a1a] text-white hover:bg-[#4a1414]"
                }`}
              >
                {submitting ? (
                  <>
                    <Loader size={14} strokeWidth={1.8} className="animate-spin" />
                    Submitting...
                  </>
                ) : allAnswered ? (
                  <>
                    <Trophy size={14} strokeWidth={1.8} />
                    Submit Answers
                  </>
                ) : (
                  <>
                    <AlertCircle size={14} strokeWidth={1.8} />
                    Answer all questions to submit
                  </>
                )}
              </button>

              {allAnswered && !submitting && (
                <p className="text-center text-xs text-[#5c1a1a] mt-3 flex items-center justify-center gap-1.5">
                  <CheckCircle size={12} strokeWidth={2} />
                  All questions answered. Ready to submit.
                </p>
              )}
            </div>
          </>
        )}
      </main>

      {/* Submit confirmation modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#2a1f14]/40"
            onClick={() => setShowSubmitModal(false)}
          />

          <div className="relative bg-white border border-[#e8dfd3] rounded-lg max-w-md w-full p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center">
                <Zap size={15} strokeWidth={1.8} className="text-[#5c1a1a]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#2a1f14]">Submit Quiz?</h2>
                <p className="text-xs text-[#8a7965]">You've answered all questions</p>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              {[
                { label: "Total Questions", value: quiz.length },
                { label: "Answered", value: Object.keys(answers).length },
                { label: "Time Spent", value: formatTime(timeSpent) },
              ].map((row) => (
                <div key={row.label} className="flex justify-between py-2 border-b border-[#e8dfd3] last:border-b-0">
                  <span className="text-sm text-[#8a7965]">{row.label}</span>
                  <span className="text-sm font-medium text-[#2a1f14] tabular-nums">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-4 py-2.5 rounded-md border border-[#e8dfd3] bg-white text-[#5a4a3a] text-sm font-medium hover:border-[#5c1a1a]/40 transition-colors"
              >
                Review Answers
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false)
                  handleSubmit()
                }}
                className="flex-1 px-4 py-2.5 rounded-md bg-[#5c1a1a] text-white text-sm font-medium hover:bg-[#4a1414] transition-colors flex items-center justify-center gap-2"
              >
                <Trophy size={14} strokeWidth={1.8} />
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuizScreen