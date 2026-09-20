import { useState, useEffect } from "react"
import Footer from "../common/Footer"
import {
    getRoadmap,
    completeTopic,
    extendRoadmap,
} from "../../api/roadmapApi";
import { getRoadmapStats } from "../../utils/roadmapStats";
import ModuleNav from "../common/ModuleNav";
import {
    Map,
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle,
    BookOpen,
    Loader,
    ChevronRight,
    Flag,
    CalendarDays,
    X,
    BarChart3,
    Target,
} from "lucide-react"

function RoadmapScreen({
    subject,
    onBack,
    onLogout,
    user,
    onStudy,
    onUpload,
    onNotes,
    onAnalyticsV2,
}) {
    const [roadmap, setRoadmap] = useState(null)
    const [loading, setLoading] = useState(true)
    const [extending, setExtending] = useState(false)
    const [newTargetDate, setNewTargetDate] = useState("")
    const [message, setMessage] = useState("")
    const [messageType, setMessageType] = useState("info")

    useEffect(() => {
        fetchRoadmap()
    }, [])

    const fetchRoadmap = async () => {
        try {
            setLoading(true)
            const data = await getRoadmap(subject)
            setRoadmap(data)
        } catch (err) {
            console.error(err)
            setMessage("Failed to load roadmap")
            setMessageType("error")
        } finally {
            setLoading(false)
        }
    }

    const handleCompleteTopic = async (week, topicName) => {
        try {
            await completeTopic(subject, week, topicName)
            await fetchRoadmap()
            setMessage(`"${topicName}" marked complete`)
            setMessageType("success")
            setTimeout(() => setMessage(""), 3000)
        } catch {
            setMessage("Failed to update topic")
            setMessageType("error")
        }
    }

    const handleExtendDate = async () => {
        if (!newTargetDate) return
        try {
            await extendRoadmap(subject, newTargetDate)
            setExtending(false)
            await fetchRoadmap()
            setMessage("Target date extended")
            setMessageType("success")
            setTimeout(() => setMessage(""), 3000)
        } catch {
            setMessage("Failed to extend date")
            setMessageType("error")
        }
    }

    const stats = getRoadmapStats(roadmap)

    const paceConfig = {
        ahead: { label: "Ahead of schedule", icon: Target },
        on_track: { label: "On track", icon: Target },
        behind: { label: "Behind schedule", icon: Target },
    }
    const pace = paceConfig[stats.pace] || paceConfig.on_track

    if (loading) return (
        <div className="min-h-screen bg-[#f7f3ee] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-[#e8dfd3] border-t-[#5c1a1a] rounded-full animate-spin" />
                <p className="text-sm text-[#8a7965]">Loading your roadmap...</p>
            </div>
        </div>
    )

    if (!roadmap || roadmap.error) return (
        <div className="min-h-screen bg-[#f7f3ee] flex items-center justify-center p-4">
            <div className="bg-white border border-[#e8dfd3] rounded-lg p-8 max-w-md w-full text-center">
                <div className="w-12 h-12 rounded-md border border-[#e8dfd3] bg-[#faf7f3] mx-auto flex items-center justify-center mb-4">
                    <AlertCircle size={20} strokeWidth={1.8} className="text-[#5c1a1a]" />
                </div>
                <h3 className="text-lg font-semibold text-[#2a1f14] mb-2">No Roadmap Found</h3>
                <p className="text-sm text-[#8a7965] mb-6">
                    No roadmap found for {subject}
                </p>
                <button
                    onClick={onBack}
                    className="px-5 py-2.5 rounded-md bg-[#5c1a1a] text-white text-sm font-medium hover:bg-[#4a1414] transition-colors"
                >
                    Go Back
                </button>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#f7f3ee] text-[#2a1f14]">

            <ModuleNav
                active="roadmap"
                onDashboard={onBack}
                onStudy={onStudy}
                onUpload={onUpload}
                onNotes={onNotes}
                onRoadmap={() => {}}
                onAnalyticsV2={onAnalyticsV2}
                onLogout={onLogout}
                user={user}
            />

            <main className="max-w-5xl mx-auto px-6 lg:px-8 py-10 space-y-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <p className="text-[11px] tracking-[0.14em] uppercase text-[#8a7965] mb-1.5">
                            Study Roadmap
                        </p>
                        <h1 className="text-2xl sm:text-3xl font-bold text-[#2a1f14] mb-1.5">
                            Study Roadmap
                        </h1>
                        <p className="text-sm text-[#8a7965]">
                            {subject} · {roadmap.scope === "full" ? "Full Syllabus" : `Unit ${roadmap.unit_number}`}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {message && (
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs border ${
                                messageType === "success"
                                    ? "bg-[#faf7f3] text-[#5c1a1a] border-[#e8dfd3]"
                                    : messageType === "error"
                                    ? "bg-[#faf0f0] text-[#7a2a2a] border-[#dcc9c9]"
                                    : "bg-[#faf7f3] text-[#5a4a3a] border-[#e8dfd3]"
                            }`}>
                                {messageType === "success" ? (
                                    <CheckCircle size={12} strokeWidth={1.8} />
                                ) : (
                                    <AlertCircle size={12} strokeWidth={1.8} />
                                )}
                                {message}
                            </div>
                        )}

                        <button
                            onClick={() => setExtending(!extending)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#5c1a1a] text-white text-sm font-medium hover:bg-[#4a1414] transition-colors"
                        >
                            <Calendar size={14} strokeWidth={1.8} />
                            Extend Date
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { label: "Progress", value: `${stats.progress}%`, icon: BarChart3 },
                        { label: "Days Left", value: stats.daysLeft, icon: Clock },
                        { label: "Topics Done", value: stats.completed, icon: CheckCircle },
                        { label: "Total Topics", value: stats.total, icon: BookOpen },
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

                {/* Pace indicator */}
                <div className="bg-white border border-[#e8dfd3] rounded-lg p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center">
                                <pace.icon size={14} strokeWidth={1.8} className="text-[#5c1a1a]" />
                            </div>
                            <p className="font-semibold text-[#2a1f14] text-sm">
                                {pace.label}
                            </p>
                        </div>
                        <p className="text-[11px] text-[#8a7965]">
                            Target: {roadmap.target_date} · {roadmap.hours_per_day}h/day
                        </p>
                    </div>
                    <div className="w-full bg-[#f0e9e0] rounded-full h-1.5 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-[#5c1a1a] transition-all duration-500"
                            style={{ width: `${stats.progress}%` }}
                        />
                    </div>
                </div>

                {/* Extend date form */}
                {extending && (
                    <div className="bg-white border border-[#e8dfd3] rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center">
                                <CalendarDays size={14} strokeWidth={1.8} className="text-[#5c1a1a]" />
                            </div>
                            <h3 className="font-semibold text-[#2a1f14] text-sm">Extend Target Date</h3>
                            <button
                                onClick={() => setExtending(false)}
                                aria-label="Close"
                                className="ml-auto w-8 h-8 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center text-[#8a7965] hover:text-[#5c1a1a] transition-colors"
                            >
                                <X size={14} strokeWidth={1.8} />
                            </button>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1">
                                <label className="block text-[11px] tracking-[0.12em] uppercase text-[#8a7965] mb-2">
                                    New Target Date
                                </label>
                                <input
                                    type="date"
                                    value={newTargetDate}
                                    onChange={(e) => setNewTargetDate(e.target.value)}
                                    min={new Date().toISOString().split("T")[0]}
                                    className="w-full bg-[#faf7f3] border border-[#e8dfd3] rounded-md p-2.5 text-sm text-[#2a1f14] focus:outline-none focus:border-[#5c1a1a] transition-colors"
                                />
                            </div>
                            <div className="flex gap-2 self-end">
                                <button
                                    onClick={handleExtendDate}
                                    className="px-5 py-2.5 rounded-md bg-[#5c1a1a] text-white text-sm font-medium hover:bg-[#4a1414] transition-colors"
                                >
                                    Update
                                </button>
                                <button
                                    onClick={() => setExtending(false)}
                                    className="px-5 py-2.5 rounded-md border border-[#e8dfd3] bg-white text-[#5a4a3a] text-sm font-medium hover:border-[#5c1a1a]/40 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Weak topics */}
                {roadmap.weak_topics?.length > 0 && (
                    <div className="bg-white border border-[#e8dfd3] rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center">
                                <AlertCircle size={14} strokeWidth={1.8} className="text-[#5c1a1a]" />
                            </div>
                            <h3 className="font-semibold text-[#2a1f14] text-sm">
                                Focus Areas (Weak Topics)
                            </h3>
                            <span className="ml-auto text-[10px] tracking-[0.1em] uppercase text-[#8a7965] border border-[#e8dfd3] bg-[#faf7f3] px-2.5 py-1 rounded-full">
                                {roadmap.weak_topics.length} topics
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {roadmap.weak_topics.map((topic, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-full border border-[#e8dfd3] bg-[#faf7f3] text-[#5a4a3a] font-medium"
                                >
                                    <AlertCircle size={10} strokeWidth={1.8} className="text-[#5c1a1a]" />
                                    {topic}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Weekly plan */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center">
                            <Calendar size={14} strokeWidth={1.8} className="text-[#5c1a1a]" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#2a1f14]">Weekly Plan</h3>
                        <span className="ml-auto text-xs text-[#8a7965]">
                            {roadmap.weeks?.length} weeks
                        </span>
                    </div>

                    <div className="space-y-4">
                        {roadmap.weeks.map((week, wi) => {
                            const completedTopics = week.topics.filter(t => t.topic.status === "completed").length
                            const totalTopics = week.topics.length
                            const weekProgress = Math.round((completedTopics / totalTopics) * 100)

                            return (
                                <div key={wi} className="bg-white border border-[#e8dfd3] rounded-lg overflow-hidden">

                                    {/* Week header */}
                                    <div className="bg-[#faf7f3] border-b border-[#e8dfd3] px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center">
                                                <Flag size={12} strokeWidth={1.8} className="text-[#5c1a1a]" />
                                            </div>
                                            <span className="font-semibold text-[#2a1f14]">Week {week.week}</span>
                                            {weekProgress === 100 && (
                                                <span className="text-[10px] tracking-[0.1em] uppercase text-[#5c1a1a] border border-[#e8dfd3] bg-white px-2.5 py-0.5 rounded-full">
                                                    Complete
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-[#8a7965]">
                                            <span>{week.start_date}</span>
                                            <ChevronRight size={12} strokeWidth={1.8} />
                                            <span>{week.end_date}</span>
                                            <span className="ml-2 text-[10px] tracking-[0.08em] uppercase text-[#5c1a1a] border border-[#e8dfd3] bg-white px-2 py-0.5 rounded-full">
                                                {weekProgress}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Week progress */}
                                    <div className="px-6 pt-3">
                                        <div className="w-full bg-[#f0e9e0] rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-[#5c1a1a] transition-all duration-500"
                                                style={{ width: `${weekProgress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Topics */}
                                    <div className="divide-y divide-[#e8dfd3]">
                                        {week.topics.map((item, ti) => (
                                            <div
                                                key={ti}
                                                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                        <span className={`text-sm font-medium ${
                                                            item.topic.status === "completed"
                                                                ? "text-[#a89880] line-through"
                                                                : "text-[#2a1f14]"
                                                        }`}>
                                                            {item.topic.name}
                                                        </span>
                                                        {item.topic.is_weak && (
                                                            <span className="text-[10px] tracking-[0.08em] uppercase px-2 py-0.5 rounded-full border border-[#e8dfd3] bg-[#faf7f3] text-[#5a4a3a] font-medium">
                                                                weak
                                                            </span>
                                                        )}
                                                        {item.topic.status === "completed" && (
                                                            <span className="text-[10px] tracking-[0.08em] uppercase px-2 py-0.5 rounded-full border border-[#e8dfd3] bg-[#faf7f3] text-[#5c1a1a] font-medium inline-flex items-center gap-1">
                                                                <CheckCircle size={9} strokeWidth={2} />
                                                                done
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#8a7965]">
                                                        <span className="flex items-center gap-1">
                                                            <BookOpen size={10} strokeWidth={1.8} />
                                                            {item.unit_name}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={10} strokeWidth={1.8} />
                                                            {item.topic.hours}h
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={10} strokeWidth={1.8} />
                                                            {item.topic.days_needed} day(s)
                                                        </span>
                                                        {item.topic.completed_date && (
                                                            <span className="flex items-center gap-1 text-[#5c1a1a]">
                                                                <CheckCircle size={10} strokeWidth={2} />
                                                                Completed: {item.topic.completed_date}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {item.topic.status !== "completed" && (
                                                    <button
                                                        onClick={() => handleCompleteTopic(week.week, item.topic.name)}
                                                        className="sm:ml-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#5c1a1a] text-white text-xs font-medium hover:bg-[#4a1414] transition-colors whitespace-nowrap"
                                                    >
                                                        <CheckCircle size={12} strokeWidth={1.8} />
                                                        Mark Done
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Footer actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onBack}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md border border-[#e8dfd3] bg-white text-[#5a4a3a] text-sm font-medium hover:border-[#5c1a1a]/40 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                    <button
                        onClick={() => setExtending(true)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-[#5c1a1a] text-white text-sm font-medium hover:bg-[#4a1414] transition-colors"
                    >
                        <Calendar size={14} strokeWidth={1.8} />
                        Extend Target Date
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    )
}

export default RoadmapScreen