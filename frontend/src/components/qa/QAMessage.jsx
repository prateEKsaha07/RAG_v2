import ReactMarkdown from "react-markdown"
import { User, Bot } from "lucide-react"
import ConfidenceBadge from "./ConfidenceBadge"
import SourceList from "./SourceList"

function QAMessage({ item }) {
  return (
    <div className="space-y-2.5 sm:space-y-3 animate-qa-fade-slide">
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
  )
}

export default QAMessage