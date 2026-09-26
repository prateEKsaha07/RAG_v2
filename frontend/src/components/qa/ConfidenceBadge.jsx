import { CheckCircle, AlertCircle } from "lucide-react"

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

export default ConfidenceBadge