import { useState, useEffect } from "react"
import axios from "axios"
import {
  Map,
  Calendar,
  Clock,
  Target,
  BookOpen,
  AlertCircle,
  Trash2,
  Eye,
  Sparkles,
  Loader,
  Layers,
  FileText
} from "lucide-react"
import ModuleNav from "../common/ModuleNav"
import Footer from "../common/Footer"

function GoalSetupScreen({
  onBack,
  onViewRoadmap,
  onLogout,
  user,
  onAnalyticsV2,
  onStudy,
  onNotes,
  onUpload,
}) {
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState("")
  const [existingRoadmap, setExistingRoadmap] = useState(null)
  const [noRoadmap, setNoRoadmap] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState("")

  const [scope, setScope] = useState("full")
  const [unitNumber, setUnitNumber] = useState(1)
  const [hoursPerDay, setHoursPerDay] = useState(2)
  const [targetDate, setTargetDate] = useState("")

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    const response = await axios.get(
      import.meta.env.VITE_API_URL + "/subjects"
    )
    setSubjects(response.data.subjects)
  }

  const handleSubjectChange = async (subject) => {
    const token = localStorage.getItem("access_token")
    setSelectedSubject(subject)
    setExistingRoadmap(null)
    setNoRoadmap(false)
    setError("")

    if (!subject) return

    setChecking(true)

    try {
      const response = await axios.get(
        import.meta.env.VITE_API_URL + `/roadmap/${subject}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      const data = response.data
      if (!data || data.error || !data.weeks || data.weeks.length === 0) {
        setNoRoadmap(true)
        setExistingRoadmap(null)
      } else {
        setExistingRoadmap(data)
      }
    } catch (err) {
      setNoRoadmap(true)
      setExistingRoadmap(null)
    } finally {
      setChecking(false)
    }
  }

  const handleDelete = async () => {
    const token = localStorage.getItem("access_token")
    if (!confirm("Delete this roadmap?")) return

    try {
      await axios.delete(
        import.meta.env.VITE_API_URL + `/roadmap/${selectedSubject}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setExistingRoadmap(null)
      setNoRoadmap(true)
    } catch (err) {
      setError("Failed to delete roadmap")
    }
  }

  const handleGenerate = async () => {
    const token = localStorage.getItem("access_token")

    if (!selectedSubject || !targetDate) {
      setError("Please select subject and target date!")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await axios.post(
        import.meta.env.VITE_API_URL + "/roadmap",
        {
          subject: selectedSubject,
          hours_per_day: hoursPerDay,
          target_date: targetDate,
          scope: scope,
          unit_number: scope === "unit" ? unitNumber : null
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (response.data.error) {
        setError(response.data.error)
        return
      }

      setExistingRoadmap(response.data)
      setNoRoadmap(false)
      onViewRoadmap(selectedSubject)
    } catch (err) {
      setError("Failed to generate roadmap")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

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

      <main className="max-w-3xl mx-auto px-6 lg:px-8 py-10">

        {/* Page header */}
        <div className="mb-8">
          <p className="text-[11px] tracking-[0.14em] uppercase text-[#8a7965] mb-1.5">
            Study Roadmap
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2a1f14] mb-1.5">
            Study Roadmap
          </h1>
          <p className="text-sm text-[#8a7965]">
            Plan your study journey
          </p>
        </div>

        {/* Subject selector */}
        <div className="bg-white border border-[#e8dfd3] rounded-lg p-6 mb-6">
          <label className="block text-[11px] tracking-[0.12em] uppercase text-[#8a7965] mb-2 flex items-center gap-2">
            <BookOpen size={12} strokeWidth={1.8} className="text-[#5c1a1a]" />
            Select Subject
          </label>
          <div className="relative">
            <select
              value={selectedSubject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full appearance-none bg-[#faf7f3] border border-[#e8dfd3] rounded-md py-3 px-4 pr-12 text-sm text-[#2a1f14] focus:outline-none focus:border-[#5c1a1a] transition-colors cursor-pointer"
            >
              <option value="">Choose subject...</option>
              {subjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
              <svg width="14" height="14" className="text-[#8a7965]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Checking */}
        {checking && (
          <div className="flex items-center justify-center gap-3 py-6">
            <Loader size={16} strokeWidth={1.8} className="text-[#5c1a1a] animate-spin" />
            <p className="text-sm text-[#8a7965]">Checking existing roadmap...</p>
          </div>
        )}

        {/* Existing roadmap */}
        {existingRoadmap && !checking && (
          <div className="bg-white border border-[#e8dfd3] rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center flex-shrink-0">
                <Map size={16} strokeWidth={1.8} className="text-[#5c1a1a]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[#2a1f14] mb-3">
                  Active Roadmap Found
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#8a7965] mb-5">
                  <div className="flex items-center gap-2">
                    <BookOpen size={12} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    <span className="font-medium text-[#2a1f14] truncate">{existingRoadmap.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers size={12} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    <span className="font-medium text-[#2a1f14]">{existingRoadmap.scope}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={12} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    <span className="font-medium text-[#2a1f14]">{existingRoadmap.target_date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={12} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    <span className="font-medium text-[#2a1f14]">{formatDate(existingRoadmap.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <FileText size={12} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    <span className="font-medium text-[#2a1f14]">{existingRoadmap.weeks?.length} weeks planned</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onViewRoadmap(selectedSubject)}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-md bg-[#5c1a1a] text-white text-sm font-medium hover:bg-[#4a1414] transition-colors"
                  >
                    <Eye size={14} strokeWidth={1.8} />
                    View Roadmap
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-md border border-[#e8dfd3] bg-white text-[#5a4a3a] text-sm font-medium transition-colors hover:border-[#a83232] hover:text-[#a83232]"
                  >
                    <Trash2 size={14} strokeWidth={1.8} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No roadmap */}
        {noRoadmap && selectedSubject && !checking && (
          <div className="bg-white border border-[#e8dfd3] rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center flex-shrink-0">
                <AlertCircle size={16} strokeWidth={1.8} className="text-[#8a7965]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[#2a1f14] mb-1.5">
                  No Roadmap Found
                </h3>
                <p className="text-sm text-[#8a7965] leading-relaxed">
                  You have not created a roadmap for{" "}
                  <span className="font-semibold text-[#2a1f14]">{selectedSubject}</span> yet.
                  Fill in the form below to generate one.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Create new roadmap */}
        {selectedSubject && !existingRoadmap && !checking && (
          <div className="bg-white border border-[#e8dfd3] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center">
                <Sparkles size={14} strokeWidth={1.8} className="text-[#5c1a1a]" />
              </div>
              <h3 className="font-semibold text-[#2a1f14]">
                Create New Roadmap
              </h3>
            </div>

            {/* Scope */}
            <div className="mb-5">
              <label className="block text-[11px] tracking-[0.12em] uppercase text-[#8a7965] mb-2 flex items-center gap-2">
                <Target size={12} strokeWidth={1.8} className="text-[#5c1a1a]" />
                Study Scope
              </label>
              <div className="flex gap-2">
                {[
                  { value: "full", label: "Full Syllabus" },
                  { value: "unit", label: "Specific Unit" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setScope(option.value)}
                    className={`flex-1 py-2.5 rounded-md border text-sm font-medium transition-colors ${
                      scope === option.value
                        ? "bg-[#5c1a1a] text-white border-[#5c1a1a]"
                        : "bg-white text-[#5a4a3a] border-[#e8dfd3] hover:border-[#5c1a1a]/40"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Unit number */}
            {scope === "unit" && (
              <div className="mb-5">
                <label className="block text-[11px] tracking-[0.12em] uppercase text-[#8a7965] mb-2 flex items-center gap-2">
                  <Layers size={12} strokeWidth={1.8} className="text-[#5c1a1a]" />
                  Unit Number
                </label>
                <select
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(parseInt(e.target.value))}
                  className="w-full bg-[#faf7f3] border border-[#e8dfd3] rounded-md p-3 text-sm text-[#2a1f14] focus:outline-none focus:border-[#5c1a1a] transition-colors"
                >
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>Unit {n}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Hours per day */}
            <div className="mb-5">
              <label className="block text-[11px] tracking-[0.12em] uppercase text-[#8a7965] mb-2 flex items-center gap-2">
                <Clock size={12} strokeWidth={1.8} className="text-[#5c1a1a]" />
                Hours Per Day: <span className="text-[#5c1a1a] font-bold">{hoursPerDay}h</span>
              </label>
              <input
                type="range"
                min="1"
                max="8"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(parseInt(e.target.value))}
                className="w-full h-1 bg-[#e8dfd3] rounded-lg appearance-none cursor-pointer accent-[#5c1a1a]"
              />
              <div className="flex justify-between text-[10px] text-[#a89880] mt-1.5">
                <span>1h</span>
                <span>2h</span>
                <span>4h</span>
                <span>6h</span>
                <span>8h</span>
              </div>
            </div>

            {/* Target date */}
            <div className="mb-6">
              <label className="block text-[11px] tracking-[0.12em] uppercase text-[#8a7965] mb-2 flex items-center gap-2">
                <Calendar size={12} strokeWidth={1.8} className="text-[#5c1a1a]" />
                Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full bg-[#faf7f3] border border-[#e8dfd3] rounded-md p-3 text-sm text-[#2a1f14] focus:outline-none focus:border-[#5c1a1a] transition-colors"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-[#faf0f0] border border-[#dcc9c9] rounded-md mb-4">
                <AlertCircle size={14} strokeWidth={1.8} className="text-[#a83232] flex-shrink-0" />
                <p className="text-sm text-[#7a2a2a]">{error}</p>
              </div>
            )}

            {/* Generate */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full py-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                loading
                  ? "bg-[#f0e9e0] text-[#a89880] cursor-not-allowed"
                  : "bg-[#5c1a1a] text-white hover:bg-[#4a1414]"
              }`}
            >
              {loading ? (
                <>
                  <Loader size={14} strokeWidth={1.8} className="animate-spin" />
                  Generating Roadmap...
                </>
              ) : (
                <>
                  <Sparkles size={14} strokeWidth={1.8} />
                  Generate Roadmap
                </>
              )}
            </button>
          </div>
        )}

        {/* Empty state */}
        {!selectedSubject && !checking && (
          <div className="bg-white border border-[#e8dfd3] rounded-lg p-12 text-center">
            <div className="w-12 h-12 rounded-md border border-[#e8dfd3] bg-[#faf7f3] mx-auto flex items-center justify-center mb-4">
              <Map size={20} strokeWidth={1.8} className="text-[#5c1a1a]" />
            </div>
            <h3 className="text-lg font-semibold text-[#2a1f14] mb-2">Select a Subject</h3>
            <p className="text-sm text-[#8a7965] max-w-sm mx-auto">
              Choose a subject from the dropdown above to create or view your study roadmap
            </p>
          </div>
        )}

      </main>

      <Footer />
    </div>
  )
}

export default GoalSetupScreen