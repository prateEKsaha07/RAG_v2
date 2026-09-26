import { useState, useRef, useEffect } from "react"
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
  Loader,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Hash,
} from "lucide-react"
import ModuleNav from "../common/ModuleNav"


// ---------------------------------------------------------------------------
// Confidence badge
// ---------------------------------------------------------------------------
function ConfidenceBadge({ level }) {
  if (!level) return null

  const config = {
    high: {
      label: "High",
      fullLabel: "High confidence",
      icon: CheckCircle,
      classes: "border-[#c9dcc9] bg-[#f0f7f0] text-[#3a6a3a]",
    },
    medium: {
      label: "Medium",
      fullLabel: "Medium confidence",
      icon: AlertCircle,
      classes: "border-[#e8dfd3] bg-[#faf7f3] text-[#8a7965]",
    },
    low: {
      label: "Low",
      fullLabel: "Low confidence",
      icon: AlertCircle,
      classes: "border-[#dcc9c9] bg-[#faf0f0] text-[#a83232]",
    },
  }[level] || null

  if (!config) return null

  const Icon = config.icon
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.06em] sm:tracking-[0.08em] px-1.5 sm:px-2 py-0.5 rounded-full border font-medium whitespace-nowrap ${config.classes}`}
    >
      <Icon size={10} strokeWidth={1.8} />
      <span className="sm:hidden">{config.label}</span>
      <span className="hidden sm:inline">{config.fullLabel}</span>
    </span>
  )
}


// ---------------------------------------------------------------------------
// Source chips — responsive
// ---------------------------------------------------------------------------
function SourceList({ sources }) {
  const [expanded, setExpanded] = useState(false)

  if (!sources || sources.length === 0) return null

  const seen = new Set()
  const unique = []
  for (const s of sources) {
    const key = `${s.file}|${s.unit_number}|${s.topic}`
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(s)
  }

  const visible = expanded ? unique : unique.slice(0, 2)

  return (
    <div className="mt-3 pt-3 border-t border-[#e8dfd3]">
      <p className="text-[11px] text-[#8a7965] mb-2 flex items-center gap-1.5">
        <BookOpen size={11} strokeWidth={1.8} />
        Sources ({unique.length})
      </p>
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1.5">
        {visible.map((src, i) => (
          <div
            key={i}
            className="inline-flex flex-col gap-0.5 text-[10px] px-2.5 py-1.5 rounded-md border border-[#e8dfd3] bg-[#faf7f3] text-[#5a4a3a] max-w-full"
            title={`${src.file}${src.unit_name ? " › " + src.unit_name : ""}${src.chapter ? " › " + src.chapter : ""}${src.topic ? " › " + src.topic : ""}`}
          >
            <span className="font-medium truncate">
              {src.file?.replace(/^data[\\/]uploads[\\/]/, "") || "Unknown"}
            </span>
            {(src.unit_number || src.topic) && (
              <span className="text-[9px] text-[#8a7965] truncate">
                {src.unit_number ? `Unit ${src.unit_number}` : ""}
                {src.unit_number && src.topic ? " › " : ""}
                {src.topic || ""}
              </span>
            )}
          </div>
        ))}
        {unique.length > 2 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center justify-center gap-1 text-[10px] px-2.5 py-1.5 rounded-md border border-[#e8dfd3] bg-white text-[#5c1a1a] hover:bg-[#faf3ee] transition-colors self-start"
          >
            {expanded ? (
              <>
                <ChevronUp size={10} strokeWidth={1.8} />
                Show less
              </>
            ) : (
              <>
                <ChevronDown size={10} strokeWidth={1.8} />
                +{unique.length - 2} more
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}


// ---------------------------------------------------------------------------
// Typing indicator
// ---------------------------------------------------------------------------
function TypingIndicator() {
  return (
    <div className="bg-white border border-[#e8dfd3] rounded-md px-4 sm:px-5 py-3 sm:py-4 animate-qa-fade-slide">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] uppercase tracking-[0.08em] text-[#8a7965]">
          Thinking
        </span>
        <Sparkles
          size={11}
          strokeWidth={1.8}
          className="text-[#5c1a1a] animate-qa-sparkle"
        />
      </div>
      <div className="flex items-center gap-1.5 h-5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#5c1a1a] typing-dot" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#5c1a1a] typing-dot" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#5c1a1a] typing-dot" />
      </div>
    </div>
  )
}


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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6 sm:mb-8">
          <div className="min-w-0">
            <p className="text-[11px] tracking-[0.14em] uppercase text-[#8a7965] mb-1.5">
              Ask AI
            </p>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#2a1f14] mb-1.5">
              Ask AI
            </h1>
            <p className="text-xs sm:text-sm text-[#8a7965]">
              Get answers from your notes and uploads
            </p>
          </div>

          <div className="inline-flex items-center rounded-md border border-[#e8dfd3] bg-white overflow-hidden self-start sm:self-auto">
  <button
    onClick={() => setScopedToSubject((v) => !v)}
    disabled={!subject}
    className={`inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 min-h-[40px] transition-all duration-200 ${
      scopedToSubject && subject
        ? "bg-white text-[#5c1a1a]"
        : "bg-white text-[#8a7965]"
    } ${!subject ? "opacity-60 cursor-not-allowed" : "hover:bg-[#faf7f3] active:scale-[0.98]"}`}
    title={subject ? "Toggle subject-scoped search" : "No subject available"}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
        scopedToSubject && subject ? "bg-[#5c1a1a]" : "bg-[#e8dfd3]"
      }`}
    />
    <BookOpen size={13} strokeWidth={1.8} />
    <span className="text-xs whitespace-nowrap">
      {scopedToSubject && subject ? "Scoped:" : "All subjects"}
    </span>
    {subject && (
      <span className="text-xs font-medium truncate max-w-[100px] sm:max-w-none">
        {subject}
      </span>
    )}
  </button>

  <div className="w-px self-stretch bg-[#e8dfd3]" />

  <button
    onClick={() => setGeneralKnowledge((v) => !v)}
    className={`inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 min-h-[40px] transition-all duration-200 ${
      generalKnowledge ? "bg-white text-[#5c1a1a]" : "bg-white text-[#8a7965]"
    } hover:bg-[#faf7f3] active:scale-[0.98]`}
    title="Allow answers beyond your notes"
  >
    <span
      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
        generalKnowledge ? "bg-[#5c1a1a]" : "bg-[#e8dfd3]"
      }`}
    />
    <Sparkles size={13} strokeWidth={1.8} />
    <span className="text-xs whitespace-nowrap">
      {generalKnowledge ? "Web knowledge: On" : "Notes only"}
    </span>
  </button>
</div>

        </div>

        {/* Input — stacked on mobile, side-by-side on desktop */}
        <div className="bg-white border border-[#e8dfd3] rounded-lg p-3 sm:p-4 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1 min-w-0">
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
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#faf7f3] border border-[#e8dfd3] rounded-md text-sm text-[#2a1f14] placeholder-[#a89880] outline-none focus:border-[#5c1a1a] transition-colors resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleAsk}
              disabled={loading || !question.trim()}
              className={`w-full sm:w-auto px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 flex-shrink-0 min-h-[48px] sm:min-h-[52px] ${
                loading || !question.trim()
                  ? "bg-[#f0e9e0] text-[#a89880] cursor-not-allowed"
                  : "bg-[#5c1a1a] text-white hover:bg-[#4a1414] sm:hover:scale-[1.02] active:scale-[0.98]"
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

          <div className="flex justify-between mt-2 text-[10px] sm:text-[11px] text-[#a89880] gap-3">
            <span className="hidden sm:inline">Press Enter to ask · Shift+Enter for new line</span>
            <span className="sm:hidden">Enter to ask</span>
            <span className="flex-shrink-0">{question.length} chars</span>
          </div>
        </div>

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
          <div className="bg-white border border-[#e8dfd3] rounded-lg p-6 sm:p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center mb-3 sm:mb-4">
                <Sparkles
                  size={16}
                  strokeWidth={1.8}
                  className="text-[#5c1a1a] animate-qa-sparkle sm:hidden"
                />
                <Sparkles
                  size={18}
                  strokeWidth={1.8}
                  className="text-[#5c1a1a] animate-qa-sparkle hidden sm:block"
                />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-[#2a1f14] mb-2">
                Ask a Question
              </h3>
              <p className="text-xs sm:text-sm text-[#8a7965] max-w-sm px-2">
                Ask anything about your study notes and get AI-powered answers instantly.
              </p>

              <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row flex-wrap gap-2 justify-center max-w-lg w-full">
                {[
                  "What is antialiasing?",
                  "Explain Bresenham's algorithm",
                  "Difference between DDA and Bresenham",
                ].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setQuestion(q)}
                    className="text-[11px] px-3 py-2 rounded-md sm:rounded-full border border-[#e8dfd3] bg-[#faf7f3] text-[#5a4a3a] hover:border-[#5c1a1a]/40 hover:text-[#5c1a1a] sm:hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 text-left sm:text-center"
                  >
                    <Hash size={9} className="inline mr-1" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5 sm:space-y-6">
            {history.map((item, index) => (
              <div key={index} className="space-y-2.5 sm:space-y-3 animate-qa-fade-slide">
                {/* Question bubble */}
                <div className="flex justify-end">
                  <div className="flex items-start gap-2 sm:gap-2.5 max-w-[90%] sm:max-w-[80%]">
                    <div className="bg-[#5c1a1a] text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-md text-xs sm:text-sm break-words min-w-0">
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => (
                            <p className="leading-relaxed break-words" {...props} />
                          ),
                        }}
                      >
                        {item.question}
                      </ReactMarkdown>
                    </div>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User size={13} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    </div>
                  </div>
                </div>

                {/* Answer bubble */}
                <div className="flex justify-start">
                  <div className="flex items-start gap-2 sm:gap-2.5 max-w-[95%] sm:max-w-[85%]">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot size={13} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    </div>
                    <div className="bg-white border border-[#e8dfd3] rounded-md px-3 sm:px-5 py-3 sm:py-4 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] uppercase tracking-[0.08em] text-[#8a7965]">
                          Answer
                        </span>
                        <ConfidenceBadge level={item.confidence} />
                      </div>

                      <div className="text-xs sm:text-sm text-[#3a2a1a] break-words">
                        <ReactMarkdown
                          components={{
                            h1: ({ node, ...props }) => (
                              <h1 className="text-sm sm:text-base font-bold text-[#2a1f14] mb-2" {...props} />
                            ),
                            h2: ({ node, ...props }) => (
                              <h2 className="text-xs sm:text-sm font-bold text-[#2a1f14] mb-2" {...props} />
                            ),
                            h3: ({ node, ...props }) => (
                              <h3 className="text-xs sm:text-sm font-semibold text-[#2a1f14] mb-1" {...props} />
                            ),
                            p: ({ node, ...props }) => (
                              <p className="text-[#6a5a48] leading-relaxed mb-2 last:mb-0 break-words" {...props} />
                            ),
                            ul: ({ node, ...props }) => (
                              <ul className="list-disc list-inside space-y-1 mb-2 text-[#6a5a48]" {...props} />
                            ),
                            ol: ({ node, ...props }) => (
                              <ol className="list-decimal list-inside space-y-1 mb-2 text-[#6a5a48]" {...props} />
                            ),
                            li: ({ node, ...props }) => (
                              <li className="text-[#6a5a48] break-words" {...props} />
                            ),
                            code: ({ node, inline, ...props }) =>
                              inline ? (
                                <code className="bg-[#faf7f3] border border-[#e8dfd3] text-[#5c1a1a] px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-mono break-all" {...props} />
                              ) : (
                                <code className="block bg-[#faf7f3] border border-[#e8dfd3] p-2 sm:p-3 rounded-md text-[10px] sm:text-xs overflow-x-auto font-mono text-[#3a2a1a]" {...props} />
                              ),
                            blockquote: ({ node, ...props }) => (
                              <blockquote className="border-l-2 border-[#5c1a1a] pl-3 sm:pl-4 italic text-[#6a5a48] my-2 text-xs sm:text-sm" {...props} />
                            ),
                            a: ({ node, ...props }) => (
                              <a className="text-[#5c1a1a] underline underline-offset-2 hover:text-[#4a1414] break-all" target="_blank" rel="noopener noreferrer" {...props} />
                            ),
                          }}
                        >
                          {item.answer}
                        </ReactMarkdown>
                      </div>

                      <SourceList sources={item.sources} />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Loading block */}
            {loading && pendingQuestion && (
              <div className="space-y-2.5 sm:space-y-3 animate-qa-fade-slide">
                <div className="flex justify-end">
                  <div className="flex items-start gap-2 sm:gap-2.5 max-w-[90%] sm:max-w-[80%]">
                    <div className="bg-[#5c1a1a] text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-md text-xs sm:text-sm break-words">
                      <p className="leading-relaxed break-words">{pendingQuestion}</p>
                    </div>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User size={13} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="flex items-start gap-2 sm:gap-2.5 max-w-[95%] sm:max-w-[85%]">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot size={13} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    </div>
                    <TypingIndicator />
                  </div>
                </div>
              </div>
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