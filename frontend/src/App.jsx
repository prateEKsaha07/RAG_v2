import { useState, useEffect } from "react"
import LandingPage from "./components/landing/LandingPage"
import UploadScreen from "./components/upload/UploadScreen"
import Dashboard from "./components/dashboard/Dashboard"
import QuizScreen from "./components/quiz/QuizScreen"
import ResultScreen from "./components/quiz/ResultScreen"
import QAScreen from "./components/qa/QAScreen"
import NotesScreen from "./components/notes/NotesScreen"
import NoteEditor from "./components/notes/NoteEditor"
import NoteView from "./components/notes/NoteView"
import GoalSetupScreen from "./components/roadmap/GoalSetupScreen"
import RoadmapScreen from "./components/roadmap/RoadmapScreen"
import AnalyticsScreen from "./components/analytics/AnalyticsScreen"
import LoginScreen from "./components/auth/LoginScreen"
import SignupScreen from "./components/auth/SignupScreen"
import { supabase } from "./supabaseClient"
import DashboardNav from "./components/dashboard/DashboardNav"
import StudyScreen from "./components/study/StudyScreen";

function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [screen, setScreen] = useState("landing")
  const [subject, setSubject] = useState("")
  const [quiz, setQuiz] = useState(null)
  const [results, setResults] = useState(null)
  const [editingNote, setEditingNote] = useState(null)
  const [roadmapSubject, setRoadmapSubject] = useState("")
  const handleGetStarted = () => setScreen("upload")

  useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null)
    if (session?.user) setScreen("dashboard")
    setAuthLoading(false)
  })

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setScreen("landing")
    }
  )
  return () => subscription.unsubscribe()
}, [])

  const handleLogout = async () => {
  await supabase.auth.signOut()
  setScreen("landing")
  setUser(null)
}

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
        <LandingPage onGetStarted={() => setScreen("login")}
         onHome={() => setScreen("landing")} />
      )}

      {screen === "upload" && (
        <UploadScreen onSuccess={handleUploadSuccess}
        onBack={() => setScreen("landing")} />
      )}
      {screen === "study" && (
        <StudyScreen
        user={user}
        onBack={() => setScreen("dashboard")}
        />
      )}

      {screen === "dashboard" && ( 
        <Dashboard
          subject={subject}
          onQuiz={() => setScreen("quiz")}
          onQA={() => setScreen("qa")}
          onStudy={() => setScreen("study")}
          onUpload={() => setScreen("upload")}
          onNotes={() => setScreen("notes")}
          onRoadmap={() => setScreen("goal-setup")}
          onHome={() => setScreen("landing")}
          onAnalytics={() => setScreen("analytics")}
          user = {user}
          onLogout={handleLogout}
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
    {screen === "goal-setup" && (
       <GoalSetupScreen
    onBack={() => setScreen("dashboard")}
    onViewRoadmap={(subject) => {
      setRoadmapSubject(subject)
      setScreen("roadmap")
    }}/>
    )}
    
    {screen === "roadmap" && (
        <RoadmapScreen
    subject={roadmapSubject}
    onBack={() => setScreen("goal-setup")}
  />
    )}

    {screen === "analytics" && (
      <AnalyticsScreen onBack={() => setScreen("dashboard")} />
    )}
    {screen === "login" && (
  <LoginScreen
    onLogin={(user) => {
      setUser(user)
      setSubject("")
      setScreen("upload")
    }}
    onSignup={() => setScreen("signup")}
  />
)}

{screen === "signup" && (
  <SignupScreen
    onSignup={() => setScreen("login")}
    onLogin={() => setScreen("login")}
  />
)}

    </div>
  )
}

export default App