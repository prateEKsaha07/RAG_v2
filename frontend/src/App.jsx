import { useState } from "react"
import LandingPage from "./components/LandingPage"
import UploadScreen from "./components/UploadScreen"
import Dashboard from "./components/Dashboard"
import QuizScreen from "./components/QuizScreen"
import ResultScreen from "./components/ResultScreen"
import QAScreen from "./components/QAScreen"

function App() {
  const [screen, setScreen] = useState("landing")
  const [subject, setSubject] = useState("")
  const [quiz, setQuiz] = useState(null)
  const [results, setResults] = useState(null)

  const handleGetStarted = () => setScreen("upload")

    const handleUploadSuccess = (subjectName) => {
    setSubject(subjectName)
    setScreen("dashboard")
  }
    const handleQuizSubmit = (quizData, resultData) => {
    setQuiz(quizData)
    setResults(resultData)
    setScreen("results")
  }
  const handleRestart = () => {
    setQuiz(null)
    setResults(null)
    setScreen("dashboard")
  }

  return (
    <div>
      {screen === "landing" && (
        <LandingPage onGetStarted={handleGetStarted} />
      )}

      {screen === "upload" && (
        <UploadScreen onSuccess={handleUploadSuccess} />
      )}

      {screen === "dashboard" && (
        <Dashboard
          subject={subject}
          onQuiz={() => setScreen("quiz")}
          onQA={() => setScreen("qa")}
          onUpload={() => setScreen("upload")}
        />
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

      {screen === "qa" && (
        <QAScreen
          subject={subject}
          onBack={() => setScreen("dashboard")}
        />
      )}
    </div>
  )
}

export default App