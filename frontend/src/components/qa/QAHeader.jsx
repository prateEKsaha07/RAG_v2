import { BookOpen, Sparkles, Download } from "lucide-react"

function QAHeader({
  subject,
  scopedToSubject,
  setScopedToSubject,
  generalKnowledge,
  setGeneralKnowledge,
  onExport,
}) {
  return (
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

      <div className="flex items-center gap-2 self-start sm:self-auto">
        <div className="inline-flex items-center rounded-md border border-[#e8dfd3] bg-white overflow-hidden">
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
              {scopedToSubject 
              && subject ? "Scoped:" : "All subjects"}
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

        <button
          onClick={onExport}
          className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 min-h-[40px] rounded-md border border-[#e8dfd3] bg-white text-[#8a7965] hover:bg-[#faf7f3] active:scale-[0.98] transition-all duration-200"
          title="Export this conversation to paste elsewhere"
        >
          <Download size={13} strokeWidth={1.8} />
          <span className="text-xs whitespace-nowrap">Export</span>
        </button>
      </div>
    </div>
  )
}

export default QAHeader