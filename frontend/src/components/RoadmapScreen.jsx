import { useState, useEffect } from "react"
import axios from "axios"
import Footer from "./Footer"

function RoadmapScreen({ subject, onBack }) {
  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [extending, setExtending] = useState(false)
  const [newTargetDate, setNewTargetDate] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchRoadmap()
  }, [])

  // supabase auth added
  const fetchRoadmap = async () => {
    const token = localStorage.getItem("access_token")
    try {
      const response = await axios.get(
        import.meta.env.VITE_API_URL + `/roadmap/${subject}`,{
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      setRoadmap(response.data)
    } catch {
      setMessage("Failed to load roadmap")
    } finally {
      setLoading(false)
    }
  }

  // supabase auth added
  const handleCompleteTopic = async (week, topicName) => {
    const token = localStorage.getItem("access_token")
    try {
      await axios.put(
        import.meta.env.VITE_API_URL + `/roadmap/${subject}/complete-topic`,
        { week, topic_name: topicName },{
          headers:{
            Authorization: `Bearer ${token}`
          }
        }
      )
      fetchRoadmap()
      setMessage(`✅ "${topicName}" marked complete!`)
      setTimeout(() => setMessage(""), 3000)
    } catch {
      setMessage("Failed to update topic")
    }
  }

  // supabase auth added
  const handleExtendDate = async () => {
    const token = localStorage.getItem("access_token")
    if (!newTargetDate) return
    try {
      await axios.put(
        import.meta.env.VITE_API_URL + `/roadmap/${subject}/extend`,
        { new_target_date: newTargetDate },{
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      )
      setExtending(false)
      fetchRoadmap()
      setMessage("✅ Target date extended!")
      setTimeout(() => setMessage(""), 3000)
    } catch {
      setMessage("Failed to extend date")
    }
  }

  // Calculate stats
  const getStats = () => {
    if (!roadmap) return {}

    const allTopics = roadmap.weeks.flatMap(w => w.topics)
    const completed = allTopics.filter(t => t.topic.status === "completed").length
    const total = allTopics.length
    const progress = Math.round((completed / total) * 100)

    // Countdown
    const today = new Date()
    const target = new Date(roadmap.target_date)
    const daysLeft = Math.ceil((target - today) / (1000 * 60 * 60 * 24))

    // Pace
    const created = new Date(roadmap.created_at)
    const daysElapsed = Math.ceil((today - created) / (1000 * 60 * 60 * 24)) || 1
    const expectedProgress = Math.round((daysElapsed / 
      Math.ceil((target - created) / (1000 * 60 * 60 * 24))) * 100)
    
    let pace = "on_track"
    if (progress > expectedProgress + 10) pace = "ahead"
    else if (progress < expectedProgress - 10) pace = "behind"

    return { completed, total, progress, daysLeft, pace }
  }

  const stats = getStats()

  const paceConfig = {
    ahead: { label: "🚀 Ahead of schedule!", color: "text-green-600" },
    on_track: { label: "✅ On track!", color: "text-blue-600" },
    behind: { label: "⚠️ Behind schedule", color: "text-red-600" }
  }

  if (loading) return (
    <div className="text-center mt-20 text-gray-500">
      Loading roadmap... ⏳
    </div>
  )

  if (!roadmap || roadmap.error) return (
    <div className="text-center mt-20 text-gray-500">
      No roadmap found for {subject}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-white shadow px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">RAG_V2</h1>
        <div className="flex gap-3 items-center">
          {message && (
            <p className="text-sm text-green-600 font-medium">{message}</p>
          )}
          <button
            onClick={() => setExtending(!extending)}
            className="text-sm bg-orange-100 text-orange-700 
                       px-3 py-2 rounded hover:bg-orange-200"
          >
            📅 Extend Date
          </button>
          <button
            onClick={onBack}
            className="text-sm text-gray-500 hover:text-blue-600"
          >
            ← Back
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-10">

        {/* Header Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <p className="text-3xl font-bold text-blue-600">
              {stats.progress}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Complete</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow text-center">
            <p className="text-3xl font-bold text-orange-500">
              {stats.daysLeft}
            </p>
            <p className="text-xs text-gray-500 mt-1">Days Left</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow text-center">
            <p className="text-3xl font-bold text-green-600">
              {stats.completed}
            </p>
            <p className="text-xs text-gray-500 mt-1">Topics Done</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow text-center">
            <p className="text-3xl font-bold text-gray-600">
              {stats.total}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total Topics</p>
          </div>
        </div>

        {/* Pace Indicator */}
        <div className="bg-white rounded-xl p-4 shadow mb-6 text-center">
          <p className={`font-semibold ${paceConfig[stats.pace]?.color}`}>
            {paceConfig[stats.pace]?.label}
          </p>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Target: {roadmap.target_date} • 
            {roadmap.hours_per_day}h/day • 
            {roadmap.scope === "full" ? "Full Syllabus" : `Unit ${roadmap.unit_number}`}
          </p>
        </div>

        {/* Extend Date Form */}
        {extending && (
          <div className="bg-white rounded-xl p-4 shadow mb-6 flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                New Target Date
              </label>
              <input
                type="date"
                value={newTargetDate}
                onChange={(e) => setNewTargetDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full border rounded-lg p-2"
              />
            </div>
            <button
              onClick={handleExtendDate}
              className="bg-orange-500 text-white px-4 py-2 
                         rounded-lg hover:bg-orange-600"
            >
              Update
            </button>
            <button
              onClick={() => setExtending(false)}
              className="bg-gray-100 text-gray-600 px-4 py-2 
                         rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Weak Topics Banner */}
        {roadmap.weak_topics?.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="font-medium text-red-700 mb-2">
              ⚠️ Focus Areas (Weak Topics)
            </p>
            <div className="flex flex-wrap gap-2">
              {roadmap.weak_topics.map((topic, i) => (
                <span key={i}
                  className="bg-red-100 text-red-700 text-xs 
                             px-2 py-1 rounded-full"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Plan */}
        <h3 className="text-xl font-bold mb-4">📅 Weekly Plan</h3>
        <div className="space-y-4">
          {roadmap.weeks.map((week, wi) => (
            <div key={wi} className="bg-white rounded-xl shadow overflow-hidden">
              
              {/* Week Header */}
              <div className="bg-blue-600 text-white px-6 py-3 flex justify-between">
                <span className="font-semibold">Week {week.week}</span>
                <span className="text-sm opacity-80">
                  {week.start_date} → {week.end_date}
                </span>
              </div>

              {/* Topics */}
              <div className="divide-y">
                {week.topics.map((item, ti) => (
                  <div key={ti}
                    className={`px-6 py-4 flex justify-between items-center
                      ${item.topic.status === "completed" 
                        ? "bg-green-50" 
                        : "bg-white"}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium capitalize">
                          {item.topic.name}
                        </span>
                        {item.topic.is_weak && (
                          <span className="bg-red-100 text-red-600 
                                           text-xs px-2 py-0.5 rounded-full">
                            ⚠️ weak
                          </span>
                        )}
                        {item.topic.status === "completed" && (
                          <span className="bg-green-100 text-green-600 
                                           text-xs px-2 py-0.5 rounded-full">
                            ✅ done
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {item.unit_name} • 
                        {item.topic.hours}h • 
                        {item.topic.days_needed} day(s)
                      </p>
                      {item.topic.completed_date && (
                        <p className="text-xs text-green-600 mt-1">
                          Completed: {item.topic.completed_date}
                        </p>
                      )}
                    </div>

                    {item.topic.status !== "completed" && (
                      <button
                        onClick={() => handleCompleteTopic(
                          week.week, 
                          item.topic.name
                        )}
                        className="ml-4 bg-green-50 text-green-700 
                                   px-3 py-1 rounded-lg text-sm 
                                   hover:bg-green-100 whitespace-nowrap"
                      >
                        Mark Done ✓
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RoadmapScreen