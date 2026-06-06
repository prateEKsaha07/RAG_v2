import { useState } from "react"
import LandingPage from "./components/LandingPage"
import UploadScreen from "./components/UploadScreen"
import Dashboard from "./components/Dashboard"
import QuizScreen from "./components/QuizScreen"
import ResultScreen from "./components/ResultScreen"
import QAScreen from "./components/QAScreen"
import NotesScreen from "./components/NotesScreen"
import NoteEditor from "./components/NoteEditor"
import NoteView from "./components/NoteView"

function App() {
  const [screen, setScreen] = useState("landing")
  const [subject, setSubject] = useState("")
  const [quiz, setQuiz] = useState(null)
  const [results, setResults] = useState(null)
  const [editingNote, setEditingNote] = useState(null)

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
          onNotes={() => setScreen("notes")}
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
      {screen === "notes" && (
  <NotesScreen
    onBack={() => setScreen("dashboard")}
    onCreateNote={() => {
      setEditingNote(null)
      setScreen("note-editor")
    }}
    onEditNote={(filename) => {
      setEditingNote(filename)
      setScreen("note-editor")
    }}
    onViewNote={(filename) => {
      setEditingNote(filename)
      setScreen("note-view")
    }}
  />
)}

      {screen === "note-editor" && (
        <NoteEditor
          filename={editingNote}
          onBack={() => {
          setEditingNote(null)
          setScreen("notes")
          }}
        />
      )}
    {screen === "note-view" && (
      <NoteView
      filename={editingNote}
      onBack={() => setScreen("notes")}
      onEdit={() => setScreen("note-editor")}
      />
    )}


    </div>
  )
}

export default App