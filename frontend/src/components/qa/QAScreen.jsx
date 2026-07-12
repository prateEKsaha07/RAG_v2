import { useState } from "react"
import axios from "axios"
import ReactMarkdown from "react-markdown"

function QAScreen({ subject, onBack }) {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [history, setHistory] = useState([])

  const handleAsk = async () => {
    if (!question.trim()) return

    setLoading(true)
    setError("")

    try {
      const response = await axios.post(
        import.meta.env.VITE_API_URL + "/ask",
        { question }
      )

      // Add to history
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
    if (e.key === "Enter") handleAsk()
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-white shadow px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">RAG_V2</h1>
        <button
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-blue-600"
        >
          ← Back to Dashboard
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-8 py-10">
        <h2 className="text-2xl font-bold mb-2">Ask a Question 💬</h2>
        <p className="text-gray-500 mb-8">
          Subject: <span className="font-semibold text-blue-600">{subject}</span>
        </p>

        {/* Question Input */}
        <div className="bg-white rounded-xl p-4 shadow mb-8 flex gap-3">
          <input
            type="text"
            placeholder="Ask anything about your notes..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 outline-none text-gray-700"
          />
          <button
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg
                       hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "..." : "Ask"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}

        {/* Chat History */}
        {history.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-4xl mb-4">💡</p>
            <p>Ask a question about your study notes</p>
          </div>
        ) : (
          <div className="space-y-6">
            {history.map((item, index) => (
              <div key={index}>

                {/* Question bubble */}
                <div className="flex justify-end mb-2">
                  <div className="bg-blue-600 text-white px-4 py-3 
                                  rounded-xl max-w-lg text-sm">
                    {item.question}
                  </div>
                </div>

                {/* Answer bubble */}
                <div className="flex justify-start">
                  <div className="bg-white px-4 py-3 rounded-xl 
                                  shadow max-w-lg text-sm text-gray-700">
                    <ReactMarkdown>{item.answer}</ReactMarkdown>
                    {/* Sources */}
                    {item.sources && item.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-xs text-gray-400">
                          Sources: {[...new Set(item.sources)].map(s => 
                            s.replace("data\\", "").replace("data/", "")
                          ).join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default QAScreen