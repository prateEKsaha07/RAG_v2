import { useState, useRef, useEffect } from "react"
import axios from "axios"
import { AlertCircle, Sparkles } from "lucide-react"
import ModuleNav from "../common/ModuleNav"

import QAHeader from "./QAHeader"
import QAInput from "./QAInput"
import QAEmptyState from "./QAEmptyState"
import QAMessage from "./QAMessage"
import QALoadingBlock from "./QALoadingBlock"

function QAScreen({
  subject,
  onBack,
  onLogout,
  user,
  onStudy,
  onUpload,
  onNotes,
  onRoadmap,
  onAnalyticsV2,
}) {
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [history, setHistory] = useState([])
  const [scopedToSubject, setScopedToSubject] = useState(Boolean(subject))
  const [generalKnowledge, setGeneralKnowledge] = useState(false)
  const [pendingQuestion, setPendingQuestion] = useState(null)

  const bottomRef = useRef(null)

  useEffect(() => {
    if (bottomRef.current && history.length > 0) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [history.length])

  const handleAsk = async () => {
    if (!question.trim() || loading) return

    const token = localStorage.getItem("access_token")
    const asked = question.trim()

    setLoading(true)
    setError("")
    setQuestion("")
    setPendingQuestion(asked)

    try {
      const payload = { question: asked }
      if (scopedToSubject && subject) {
        payload.subject = subject
      }
      if (generalKnowledge) {
  payload.general_knowledge = true
}

      const response = await axios.post(
        import.meta.env.VITE_API_URL + "/ask",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setHistory((prev) => [
        ...prev,
        {
          question: asked,
          answer: response.data.answer,
          sources: response.data.sources || [],
          confidence: response.data.confidence || "medium",
          context_used: response.data.context_used || 0,
        },
      ])
    } catch (err) {
      console.error(err)
      setError(
        err?.response?.data?.detail ||
        "Failed to get an answer. Please try again."
      )
    } finally {
      setLoading(false)
      setPendingQuestion(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f3ee] text-[#2a1f14]">
      <ModuleNav
        active="qa"
        onDashboard={onBack}
        onStudy={onStudy}
        onUpload={onUpload}
        onNotes={onNotes}
        onRoadmap={onRoadmap}
        onAnalyticsV2={onAnalyticsV2}
        onLogout={onLogout}
        user={user}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <QAHeader
          subject={subject}
          scopedToSubject={scopedToSubject}
          setScopedToSubject={setScopedToSubject}
          generalKnowledge={generalKnowledge}
          setGeneralKnowledge={setGeneralKnowledge}
        />

        {/* Input — stacked on mobile, side-by-side on desktop */}
        <QAInput
          question={question}
          setQuestion={setQuestion}
          onAsk={handleAsk}
          loading={loading}
        />

        {/* Error */}
        {error && (
          <div className="bg-[#faf0f0] border border-[#dcc9c9] rounded-md p-3 sm:p-4 mb-6 flex items-start sm:items-center gap-3 animate-qa-fade-slide">
            <AlertCircle
              size={15}
              strokeWidth={1.8}
              className="text-[#a83232] flex-shrink-0 mt-0.5 sm:mt-0"
            />
            <p className="text-xs sm:text-sm text-[#7a2a2a]">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {history.length === 0 && !loading ? (
          <QAEmptyState onSuggestionClick={setQuestion} />
        ) : (
          <div className="space-y-5 sm:space-y-6">
            {history.map((item, index) => (
              <QAMessage key={index} item={item} />
            ))}

            {/* Loading block */}
            {loading && pendingQuestion && (
              <QALoadingBlock pendingQuestion={pendingQuestion} />
            )}

            <div ref={bottomRef} />
          </div>
        )}

        {history.length > 0 && !loading && (
          <div className="text-center mt-8 sm:mt-10">
            <span className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-md border border-[#e8dfd3] bg-white text-[10px] sm:text-[11px] uppercase tracking-[0.08em] text-[#8a7965]">
              <Sparkles size={11} strokeWidth={1.8} className="text-[#5c1a1a]" />
              AI-powered answers from your notes
            </span>
          </div>
        )}
      </main>
    </div>
  )
}

export default QAScreen