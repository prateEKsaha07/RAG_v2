import { useState } from "react"   // ← same as yours
import {
  AlertCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  Database,
  History,
  Info,
  Layers,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  Trash2,
  Users,
  X,
  Zap,
} from "lucide-react"

const NOTICES = [
  {
    icon: Database,
    title: "History isn't saved",
    body: "Chat history lives in memory only and is wiped whenever the server restarts or redeploys. Nothing here is permanent.",
  },
  {
    icon: Layers,
    title: "One conversation per account",
    body: "Your history is tied to your account, not to a tab or device. Two tabs open at once can interleave or collide.",
  },
  {
    icon: MessageSquare,
    title: "Follow-ups work best with context",
    body: "Each question is searched on its own. A vague follow-up like \"explain more\" may pull up unrelated notes — restate what you mean.",
  },
  {
    icon: BookOpen,
    title: "\"Notes only\" is prompt-enforced",
    body: "The notes-only restriction is enforced by the AI's instructions, not by code. Treat answers as study aids, not citations.",
  },
  {
    icon: ShieldAlert,
    title: "Confidence is a rough signal",
    body: "The High / Medium / Low badge is based only on how many documents were retrieved — not on how relevant they actually were.",
  },
  {
    icon: Clock,
    title: "Long answers get trimmed",
    body: "Only the first ~300 characters of each answer are kept for follow-ups, so details from earlier replies may fade.",
  },
  {
    icon: Trash2,
    title: "Old sessions aren't cleared",
    body: "Abandoned conversations never get evicted. Memory grows for the lifetime of the server process.",
  },
  {
    icon: Zap,
    title: "Rapid double-submits may collide",
    body: "Asking twice in quick succession can race on the same history. Wait for a reply before sending again.",
  },
  {
    icon: Info,
    title: "Export needs an exact phrase",
    body: "Type \"export chat\" exactly to export. Close variants like \"please export the chat\" won't trigger it — there's no fuzzy matching.",
  },
  {
    icon: History,
    title: "History isn't used for retrieval",
    body: "Search runs on your raw question only. There's no query rewriting, so context from earlier turns isn't factored in.",
  },
  {
    icon: Users,
    title: "No adaptive retry on weak results",
    body: "The number of documents retrieved is fixed per request. If results are weak, the system won't widen the search or drop your subject filter.",
  },
]

// ← renamed onDismiss → onClose to match QAScreen.jsx
function QANotice({ onClose }) {
  const [showAll, setShowAll] = useState(false)

  const visible = showAll ? NOTICES : NOTICES.slice(0, 4)

  return (
    // ← wrapper changed to a full-screen overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#2a1f14]/40 backdrop-blur-[2px] animate-qa-fade-slide"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qa-notice-title"
    >
      {/* ← inner card: same theme, now constrained & scrollable */}
      <div className="w-full max-w-lg max-h-[85vh] bg-white border border-[#e8dfd3] rounded-lg shadow-[0_8px_32px_rgba(42,31,20,0.18)] overflow-hidden flex flex-col">
        {/* Header — unchanged except padding + bottom border */}
        <div className="flex items-start gap-3 p-4 sm:p-5 border-b border-[#e8dfd3]">
          <div className="w-8 h-8 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center flex-shrink-0">
            <AlertCircle size={15} strokeWidth={1.8} className="text-[#5c1a1a]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.1em] text-[#8a7965] mb-0.5">
              Before you ask
            </p>
            <h3
              id="qa-notice-title"
              className="text-sm sm:text-base font-semibold text-[#2a1f14]"
            >
              A few things to know about Ask AI
            </h3>
            <p className="text-[11px] sm:text-xs text-[#8a7965] mt-1 leading-relaxed">
              Ask AI reads from your notes and uploads. It's a study aid — not a
              substitute for your textbook.
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center flex-shrink-0 hover:bg-[#faf7f3] active:scale-[0.96] transition-all duration-200"
              title="Close"
            >
              <X size={13} strokeWidth={1.8} className="text-[#8a7965]" />
            </button>
          )}
        </div>

        {/* Notice list — now scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2">
          {visible.map((item, i) => {
            const Icon = item.icon
            return (
              <div
                key={i}
                className="flex items-start gap-2.5 px-3 py-2.5 rounded-md border border-[#e8dfd3] bg-[#faf7f3]"
              >
                <Icon
                  size={13}
                  strokeWidth={1.8}
                  className="text-[#5c1a1a] flex-shrink-0 mt-0.5"
                />
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-medium text-[#2a1f14] mb-0.5">
                    {item.title}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-[#6a5a48] leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </div>
            )
          })}

          {NOTICES.length > 4 && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="inline-flex items-center justify-center gap-1 text-[10px] px-2.5 py-1.5 rounded-md border border-[#e8dfd3] bg-white text-[#5c1a1a] hover:bg-[#faf3ee] active:scale-[0.98] transition-all duration-200"
            >
              {showAll ? (
                <>
                  <ChevronUp size={10} strokeWidth={1.8} />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown size={10} strokeWidth={1.8} />
                  +{NOTICES.length - 4} more notes
                </>
              )}
            </button>
          )}
        </div>

        {/* Footer — now has a "Got it" button alongside the tag */}
        <div className="p-4 sm:p-5 border-t border-[#e8dfd3] flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <Sparkles
              size={11}
              strokeWidth={1.8}
              className="text-[#5c1a1a] flex-shrink-0"
            />
            <span className="text-[10px] uppercase tracking-[0.08em] text-[#8a7965] truncate">
              Ask AI · study assistant
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-xs font-medium bg-[#5c1a1a] text-white hover:bg-[#4a1414] active:scale-[0.98] transition-all duration-200 min-h-[36px] flex-shrink-0"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}

export default QANotice