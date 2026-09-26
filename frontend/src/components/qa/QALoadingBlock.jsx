import { User, Bot } from "lucide-react"
import TypingIndicator from "./TypingIndicator"

function QALoadingBlock({ pendingQuestion }) {
  return (
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
  )
}

export default QALoadingBlock