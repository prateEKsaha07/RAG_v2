import { useState } from "react"
import UploadScreen from "./components/UploadScreen"
import QuizScreen from "./components/QuizScreen"
import ResultScreen from "./components/ResultScreen"

function App() {
  const [screen, setScreen] = useState("upload")
  const [subject, setSubject] = useState("")
  const [quiz, setQuiz] = useState(null)
  const [results, setResults] = useState(null)

  const handleUploadSuccess = (subjectName) => {
    setSubject(subjectName)
    setScreen("quiz")
  }

  const handleQuizSubmit = (quizData, resultData) => {
    setQuiz(quizData)
    setResults(resultData)
    setScreen("results")
    // ← removed setTimeout, it was causing re-render with null results
  }

  const handleRestart = () => {
    setScreen("upload")
    setSubject("")
    setQuiz(null)
    setResults(null)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-700">
        RAG_V2 Study Planner
      </h1>

      {screen === "upload" && (
        <UploadScreen onSuccess={handleUploadSuccess} />
      )}

      {screen === "quiz" && (
        <QuizScreen
          subject={subject}
          onSubmit={handleQuizSubmit}
        />
      )}

      {screen === "results" && (
        <ResultScreen
          results={results}
          onRestart={handleRestart}
        />
      )}
    </div>
  )
}

export default App