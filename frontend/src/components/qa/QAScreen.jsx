import { useState } from "react"
import axios from "axios"
import ReactMarkdown from "react-markdown"
import {
  Send,
  MessageCircle,
  Sparkles,
  BookOpen,
  User,
  Bot,
  AlertCircle,
  Loader
} from "lucide-react"
import ModuleNav from "../common/ModuleNav"

function QAScreen({ subject, onBack, onLogout, user, onStudy, onUpload, onNotes, onRoadmap, onAnalyticsV2 }) {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [history, setHistory] = useState([])

  const handleAsk = async () => {
    const token = localStorage.getItem("access_token")

    if (!question.trim()) return

    setLoading(true)
    setError("")

    try {
      const response = await axios.post(
        import.meta.env.VITE_API_URL + "/ask",
        { question },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setHistory(prev => [...prev, {
        question,
        answer: response.data.answer,
        sources: response.data.sources
      }])

      setQuestion("")

    } catch (error) {
      setError("Failed to get answer. Is backend running?")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
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

      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-10">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] tracking-[0.14em] uppercase text-[#8a7965] mb-1.5">
              Ask AI
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2a1f14] mb-1.5">
              Ask AI
            </h1>
            <p className="text-sm text-[#8a7965]">
              Get answers from your study notes
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md border border-[#e8dfd3] bg-white self-start sm:self-auto">
            <BookOpen size={13} strokeWidth={1.8} className="text-[#5c1a1a]" />
            <span className="text-xs text-[#8a7965]">Subject</span>
            <span className="text-xs font-medium text-[#2a1f14]">{subject}</span>
          </div>
        </div>

        {/* Question input */}
        <div className="bg-white border border-[#e8dfd3] rounded-lg p-4 mb-8">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-[11px] tracking-[0.12em] uppercase text-[#8a7965] mb-2">
                Ask anything about your notes
              </label>
              <div className="relative">
                <textarea
                  placeholder="Type your question here..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyPress}
                  rows={2}
                  className="w-full px-4 py-3 bg-[#faf7f3] border border-[#e8dfd3] rounded-md text-sm text-[#2a1f14] placeholder-[#a89880] outline-none focus:border-[#5c1a1a] transition-colors resize-none"
                />
                {loading && (
                  <div className="absolute bottom-3 right-3">
                    <Loader size={16} strokeWidth={1.8} className="text-[#5c1a1a] animate-spin" />
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleAsk}
              disabled={loading || !question.trim()}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-colors flex items-center gap-2 flex-shrink-0 min-h-[52px] ${
                loading || !question.trim()
                  ? "bg-[#f0e9e0] text-[#a89880] cursor-not-allowed"
                  : "bg-[#5c1a1a] text-white hover:bg-[#4a1414]"
              }`}
            >
              {loading ? (
                <>
                  <Loader size={14} strokeWidth={1.8} className="animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Send size={14} strokeWidth={1.8} />
                  Ask
                </>
              )}
            </button>
          </div>

          <div className="flex justify-between mt-2 text-[11px] text-[#a89880]">
            <span>Press Enter to ask</span>
            <span>{question.length} characters</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-[#faf0f0] border border-[#dcc9c9] rounded-md p-4 mb-6 flex items-center gap-3">
            <AlertCircle size={15} strokeWidth={1.8} className="text-[#a83232] flex-shrink-0" />
            <p className="text-sm text-[#7a2a2a]">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {history.length === 0 ? (
          <div className="bg-white border border-[#e8dfd3] rounded-lg p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center mb-4">
                <Sparkles size={18} strokeWidth={1.8} className="text-[#5c1a1a]" />
              </div>
              <h3 className="text-lg font-semibold text-[#2a1f14] mb-2">
                Ask a Question
              </h3>
              <p className="text-sm text-[#8a7965] max-w-sm">
                Ask anything about your study notes and get AI-powered answers instantly.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {history.map((item, index) => (
              <div key={index} className="space-y-3">

                {/* Question bubble */}
                <div className="flex justify-end">
                  <div className="flex items-start gap-2.5 max-w-[80%]">
                    <div className="bg-[#5c1a1a] text-white px-4 py-3 rounded-md text-sm">
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => <p className="leading-relaxed" {...props} />
                        }}
                      >
                        {item.question}
                      </ReactMarkdown>
                    </div>
                    <div className="w-8 h-8 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User size={14} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    </div>
                  </div>
                </div>

                {/* Answer bubble */}
                <div className="flex justify-start">
                  <div className="flex items-start gap-2.5 max-w-[85%]">
                    <div className="w-8 h-8 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot size={14} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    </div>
                    <div className="bg-white border border-[#e8dfd3] rounded-md px-5 py-4">
                      <div className="text-sm text-[#3a2a1a]">
                        <ReactMarkdown
                          components={{
                            h1: ({ node, ...props }) => <h1 className="text-base font-bold text-[#2a1f14] mb-2" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-sm font-bold text-[#2a1f14] mb-2" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-sm font-semibold text-[#2a1f14] mb-1" {...props} />,
                            p: ({ node, ...props }) => <p className="text-[#6a5a48] leading-relaxed mb-2 last:mb-0" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 mb-2 text-[#6a5a48]" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 mb-2 text-[#6a5a48]" {...props} />,
                            li: ({ node, ...props }) => <li className="text-[#6a5a48]" {...props} />,
                            code: ({ node, inline, ...props }) =>
                              inline ?
                                <code className="bg-[#faf7f3] border border-[#e8dfd3] text-[#5c1a1a] px-1.5 py-0.5 rounded text-xs font-mono" {...props} /> :
                                <code className="block bg-[#faf7f3] border border-[#e8dfd3] p-3 rounded-md text-xs overflow-x-auto font-mono text-[#3a2a1a]" {...props} />,
                            blockquote: ({ node, ...props }) => <blockquote className="border-l-2 border-[#5c1a1a] pl-4 italic text-[#6a5a48] my-2" {...props} />,
                            a: ({ node, ...props }) => <a className="text-[#5c1a1a] underline underline-offset-2 hover:text-[#4a1414]" {...props} />,
                          }}
                        >
                          {item.answer}
                        </ReactMarkdown>
                      </div>

                      {/* Sources */}
                      {item.sources && item.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[#e8dfd3]">
                          <p className="text-[11px] text-[#8a7965] flex items-center gap-1.5">
                            <BookOpen size={11} strokeWidth={1.8} />
                            Sources: {[...new Set(item.sources)].map(s =>
                              s.replace("data\\", "").replace("data/", "")
                            ).join(", ")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer hint */}
        {history.length > 0 && (
          <div className="text-center mt-10">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md border border-[#e8dfd3] bg-white text-[11px] uppercase tracking-[0.08em] text-[#8a7965]">
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