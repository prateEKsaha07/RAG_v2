import { Sparkles, Hash } from "lucide-react"

function QAEmptyState({ onSuggestionClick }) {
  return (
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
              onClick={() => onSuggestionClick(q)}
              className="text-[11px] px-3 py-2 rounded-md sm:rounded-full border border-[#e8dfd3] bg-[#faf7f3] text-[#5a4a3a] hover:border-[#5c1a1a]/40 hover:text-[#5c1a1a] sm:hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 text-left sm:text-center"
            >
              <Hash size={9} className="inline mr-1" />
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default QAEmptyState