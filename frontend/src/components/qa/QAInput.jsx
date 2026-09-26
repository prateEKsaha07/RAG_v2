import { Send, Loader } from "lucide-react"

function QAInput({ question, setQuestion, onAsk, loading }) {
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onAsk()
    }
  }

  return (
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
          onClick={onAsk}
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
  )
}

export default QAInput