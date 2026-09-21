import { useState } from "react"
import {
  Trophy,
  Target,
  BookOpen,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  GraduationCap,
  Zap,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import ModuleNav from "../common/ModuleNav"

function RecommendationItem({ rec }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="rounded-md border border-[#e8dfd3] bg-[#faf7f3] overflow-hidden">
      {/* Header (clickable) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#f5efe6] transition-colors"
      >
        <div className="w-7 h-7 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center flex-shrink-0">
          <BookOpen size={12} strokeWidth={1.8} className="text-[#5c1a1a]" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#2a1f14] truncate">
            {rec.weak_topic}
          </p>
        </div>

        <div className="flex-shrink-0 text-[#8a7965]">
          {isOpen ? (
            <ChevronUp size={16} strokeWidth={1.8} />
          ) : (
            <ChevronDown size={16} strokeWidth={1.8} />
          )}
        </div>
      </button>

      {/* Collapsible body */}
      {isOpen && (
        <div className="px-4 pb-4 pt-0 border-t border-[#e8dfd3]">
          <div
            className="text-xs text-[#6a5a48] leading-relaxed mt-3
              [&_p]:mb-2 [&_p:last-child]:mb-0
              [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mb-2 [&_ul]:space-y-0.5
              [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:mb-2 [&_ol]:space-y-0.5
              [&_li]:leading-relaxed [&_li]:text-[#6a5a48]
              [&_strong]:font-semibold [&_strong]:text-[#2a1f14]
              [&_em]:italic
              [&_code]:bg-[#f0e9e0] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[11px] [&_code]:text-[#5c1a1a]
              [&_a]:text-[#5c1a1a] [&_a]:underline [&_a]:hover:text-[#4a1414]
              [&_h1]:text-sm [&_h1]:font-bold [&_h1]:text-[#2a1f14] [&_h1]:mb-1
              [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-[#2a1f14] [&_h2]:mb-1
              [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:text-[#2a1f14] [&_h3]:mb-1"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node, ...props }) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" />
                ),
              }}
            >
              {rec.revise_this}
            </ReactMarkdown>
          </div>

          <p className="text-[11px] text-[#8a7965] mt-3 flex items-center gap-1.5">
            <Sparkles size={10} strokeWidth={1.8} />
            {rec.source}
          </p>
        </div>
      )}
    </div>
  )
}

function ResultScreen({ results, onRestart, onBack, onLogout, user, subject, onStudy, onUpload, onNotes, onRoadmap, onAnalyticsV2 }) {
  if (!results) return (
    <div className="min-h-screen bg-[#f7f3ee] flex items-center justify-center p-4">
      <div className="bg-white border border-[#e8dfd3] rounded-lg p-8 text-center max-w-md w-full">
        <div className="w-12 h-12 rounded-md border border-[#e8dfd3] bg-[#faf7f3] mx-auto flex items-center justify-center mb-4">
          <AlertCircle size={20} strokeWidth={1.8} className="text-[#5c1a1a]" />
        </div>
        <h3 className="text-lg font-semibold text-[#2a1f14] mb-2">No Results Available</h3>
        <p className="text-sm text-[#8a7965]">Complete a quiz to see your results here</p>
      </div>
    </div>
  )

  const { results: quizResults, weak_topics, recommendations } = results
  const score = quizResults.filter(r => r.is_correct).length
  const totalQuestions = quizResults.length
  const percentage = Math.round((score / totalQuestions) * 100)

  const correctCount = score
  const incorrectCount = totalQuestions - score
  const isPerfect = score === totalQuestions
  const isExcellent = percentage >= 80
  const isGood = percentage >= 60

  const getPerformanceMessage = () => {
    if (isPerfect) return "Perfect Score"
    if (isExcellent) return "Excellent Work"
    if (isGood) return "Good Job — Keep Going"
    return "Keep Studying — You've Got This"
  }

  const performanceMessage = getPerformanceMessage()

  const bestStreak = quizResults.reduce((max, curr, i, arr) => {
    if (curr.is_correct) {
      let streak = 1
      for (let j = i + 1; j < arr.length && arr[j].is_correct; j++) streak++
      return Math.max(max, streak)
    }
    return max
  }, 0)

  return (
    <div className="min-h-screen bg-[#f7f3ee] text-[#2a1f14]">

      <ModuleNav
        active="quiz"
        onDashboard={onBack}
        onStudy={onStudy}
        onUpload={onUpload}
        onNotes={onNotes}
        onRoadmap={onRoadmap}
        onAnalyticsV2={onAnalyticsV2}
        onLogout={onLogout}
        user={user}
      />

      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-10 space-y-8">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.14em] uppercase text-[#8a7965] mb-1.5">
              Quiz Results
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2a1f14] mb-1.5">
              Quiz Results
            </h1>
            <p className="text-sm text-[#8a7965]">
              {subject ? `Results for ${subject}` : "Your quiz performance"}
            </p>
          </div>

          <button
            onClick={onRestart}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#5c1a1a] text-white text-sm font-medium hover:bg-[#4a1414] transition-colors self-start sm:self-auto"
          >
            <RotateCcw size={14} strokeWidth={1.8} />
            Try Another Quiz
          </button>
        </div>

        {/* Score card */}
        <div className="bg-white border border-[#e8dfd3] rounded-lg p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">

            <div className="relative flex-shrink-0">
              <svg className="w-32 h-32 md:w-40 md:h-40 transform -rotate-90">
                <circle cx="50%" cy="50%" r="45%" stroke="#f0e9e0" strokeWidth="8" fill="none" />
                <circle
                  cx="50%" cy="50%" r="45%"
                  stroke="#5c1a1a" strokeWidth="8" fill="none"
                  strokeDasharray={`${percentage * 2.827} 282.7`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl md:text-4xl font-bold text-[#2a1f14] tabular-nums">
                  {percentage}%
                </span>
                <span className="text-[11px] tracking-[0.12em] uppercase text-[#8a7965] mt-0.5">
                  Score
                </span>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-[#2a1f14] mb-2">
                {performanceMessage}
              </h2>

              <p className="text-sm text-[#6a5a48] mb-5">
                You got <span className="font-semibold text-[#2a1f14]">{score}</span> out of{" "}
                <span className="font-semibold text-[#2a1f14]">{totalQuestions}</span> questions correct
              </p>

              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {[
                  { label: "Correct", value: correctCount, icon: CheckCircle },
                  { label: "Incorrect", value: incorrectCount, icon: XCircle },
                  { label: "Accuracy", value: `${percentage}%`, icon: Target },
                ].map((chip) => {
                  const Icon = chip.icon;
                  return (
                    <div
                      key={chip.label}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-[#e8dfd3] bg-[#faf7f3]"
                    >
                      <Icon size={14} strokeWidth={1.8} className="text-[#5c1a1a]" />
                      <div className="text-left">
                        <p className="text-[10px] tracking-[0.1em] uppercase text-[#8a7965] leading-none">
                          {chip.label}
                        </p>
                        <p className="text-sm font-semibold text-[#2a1f14] mt-0.5 tabular-nums">
                          {chip.value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: "Best Streak", value: bestStreak, icon: Zap },
            { label: "Weak Topics", value: weak_topics?.length || 0, icon: TrendingDown },
            { label: "Recommendations", value: recommendations?.length || 0, icon: Lightbulb },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white border border-[#e8dfd3] rounded-lg p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] tracking-[0.12em] uppercase text-[#8a7965]">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-[#2a1f14] mt-2 tabular-nums">
                      {stat.value}
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center flex-shrink-0">
                    <Icon size={16} strokeWidth={1.8} className="text-[#5c1a1a]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Question review */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center">
                <BookOpen size={14} strokeWidth={1.8} className="text-[#5c1a1a]" />
              </div>
              <h3 className="text-lg font-semibold text-[#2a1f14]">Question Review</h3>
            </div>
            <span className="text-xs text-[#8a7965]">{totalQuestions} questions</span>
          </div>

          <div className="space-y-3">
            {quizResults.map((item, index) => (
              <div key={index} className="bg-white border border-[#e8dfd3] rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {item.is_correct ? (
                      <CheckCircle size={16} strokeWidth={2} className="text-[#5c1a1a]" />
                    ) : (
                      <XCircle size={16} strokeWidth={2} className="text-[#a83232]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#2a1f14] mb-3 leading-relaxed">
                      Q{index + 1}. {item.question}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[#8a7965]">Your answer:</span>
                        <span className={`font-medium ${
                          item.is_correct ? "text-[#5c1a1a]" : "text-[#a83232]"
                        }`}>
                          {item.your_answer}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#8a7965]">Correct answer:</span>
                        <span className="font-medium text-[#2a1f14]">{item.correct_answer}</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <span className="text-[10px] tracking-[0.08em] uppercase px-2.5 py-1 rounded-full border border-[#e8dfd3] bg-[#faf7f3] text-[#5a4a3a] font-medium">
                        {item.topic}
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <span className={`text-[10px] tracking-[0.08em] uppercase px-2.5 py-1 rounded-full border font-medium ${
                      item.is_correct
                        ? "border-[#e8dfd3] bg-[#faf7f3] text-[#5c1a1a]"
                        : "border-[#dcc9c9] bg-[#faf0f0] text-[#7a2a2a]"
                    }`}>
                      {item.is_correct ? "Correct" : "Incorrect"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weak topics */}
        <div className="bg-white border border-[#e8dfd3] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center">
              <TrendingDown size={14} strokeWidth={1.8} className="text-[#5c1a1a]" />
            </div>
            <h3 className="text-lg font-semibold text-[#2a1f14]">Weak Topics</h3>
            <span className="ml-auto text-[10px] tracking-[0.1em] uppercase text-[#8a7965] border border-[#e8dfd3] bg-[#faf7f3] px-2.5 py-1 rounded-full">
              {weak_topics?.length || 0} topics
            </span>
          </div>

          {weak_topics && weak_topics.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {weak_topics.map((topic, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-full border border-[#e8dfd3] bg-[#faf7f3] text-[#5a4a3a] font-medium"
                >
                  <AlertCircle size={10} strokeWidth={1.8} className="text-[#5c1a1a]" />
                  {topic.topic}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-md border border-[#e8dfd3] bg-[#faf7f3] text-sm text-[#5a4a3a]">
              <CheckCircle size={14} strokeWidth={2} className="text-[#5c1a1a] flex-shrink-0" />
              <span>No weak topics detected. Great work.</span>
            </div>
          )}
        </div>

        {/* Recommendations — Drawer / Accordion */}
        <div className="bg-white border border-[#e8dfd3] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center">
              <Lightbulb size={14} strokeWidth={1.8} className="text-[#5c1a1a]" />
            </div>
            <h3 className="text-lg font-semibold text-[#2a1f14]">Revision Material</h3>
            <span className="ml-auto text-[10px] tracking-[0.1em] uppercase text-[#8a7965] border border-[#e8dfd3] bg-[#faf7f3] px-2.5 py-1 rounded-full">
              {recommendations?.length || 0} recommendations
            </span>
          </div>

          {recommendations && recommendations.length > 0 ? (
            <div className="space-y-2">
              {recommendations.map((rec, index) => (
                <RecommendationItem key={index} rec={rec} />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-md border border-[#e8dfd3] bg-[#faf7f3] text-sm text-[#5a4a3a]">
              <Sparkles size={14} strokeWidth={1.8} className="text-[#5c1a1a] flex-shrink-0" />
              <span>No recommendations needed. You're doing great.</span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRestart}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-[#5c1a1a] text-white text-sm font-medium hover:bg-[#4a1414] transition-colors"
          >
            <RotateCcw size={14} strokeWidth={1.8} />
            Try Another Quiz
          </button>
          <button
            onClick={onBack}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md border border-[#e8dfd3] bg-white text-[#5a4a3a] text-sm font-medium hover:border-[#5c1a1a]/40 transition-colors"
          >
            <GraduationCap size={14} strokeWidth={1.8} />
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  )
}

export default ResultScreen