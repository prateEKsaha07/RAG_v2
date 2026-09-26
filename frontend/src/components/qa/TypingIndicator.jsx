import { Sparkles } from "lucide-react"

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

export default TypingIndicator