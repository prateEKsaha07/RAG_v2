import { useState } from "react"
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react"

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

export default SourceList