import { useState, useEffect } from "react"
import axios from "axios"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts"

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"]

function AnalyticsScreen({ onBack }) {
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState("")
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    const response = await axios.get(
      import.meta.env.VITE_API_URL + "/subjects"
    )
    setSubjects(response.data.subjects)
  }

  const fetchAnalytics = async (subject) => {
    setLoading(true)
    setError("")
    try {
      const response = await axios.get(
        import.meta.env.VITE_API_URL + `/analytics/${subject}`
      )
      if (response.data.error) {
        setError(response.data.error)
        setAnalytics(null)
      } else {
        setAnalytics(response.data)
      }
    } catch {
      setError("Failed to load analytics")
    } finally {
      setLoading(false)
    }
  }

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject)
    if (subject) fetchAnalytics(subject)
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-white shadow px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">RAG_V2</h1>
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-blue-600">
          ← Dashboard
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <h2 className="text-2xl font-bold mb-6">📊 Analytics</h2>

        {/* Subject Selector */}
        <div className="bg-white rounded-xl p-4 shadow mb-8">
          <select
            value={selectedSubject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            className="w-full border rounded-lg p-2"
          >
            <option value="">Select subject...</option>
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {loading && (
          <p className="text-center text-gray-500">Loading analytics... ⏳</p>
        )}

        {error && (
          <p className="text-center text-red-500">{error}</p>
        )}

        {analytics && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Attempts", value: analytics.summary.total_attempts, color: "text-blue-600" },
                { label: "Average Score", value: `${Math.round((analytics.summary.average_score / analytics.summary.total) * 100)}%`, color: "text-green-600" },
                { label: "Best Score", value: `${analytics.summary.best_score}/${analytics.summary.total}`, color: "text-purple-600" },
                { label: "Most Weak Topic", value: analytics.summary.most_weak_topic || "None", color: "text-red-600" },
              ].map((card, i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow text-center">
                  <p className={`text-2xl font-bold ${card.color} truncate`}>
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{card.label}</p>
                </div>
              ))}
            </div>

            {/* Chart 1 - Score Progression */}
            <div className="bg-white rounded-xl p-6 shadow mb-6">
              <h3 className="font-bold text-lg mb-4">📈 Score Progression</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={analytics.score_progression}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} unit="%" />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 2 + 3 side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

              {/* Chart 2 - Weak Topics */}
              <div className="bg-white rounded-xl p-6 shadow">
                <h3 className="font-bold text-lg mb-4">⚠️ Weak Topics</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.weak_topics_chart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="topic" tick={{ fontSize: 9 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Chart 3 - Pass/Fail */}
              <div className="bg-white rounded-xl p-6 shadow">
                <h3 className="font-bold text-lg mb-4">✅ Pass / Fail Ratio</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analytics.pass_fail}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {analytics.pass_fail.map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4 - Score Distribution */}
            <div className="bg-white rounded-xl p-6 shadow mb-6">
              <h3 className="font-bold text-lg mb-4">📊 Score Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.score_distribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Attempts Table */}
            <div className="bg-white rounded-xl p-6 shadow">
              <h3 className="font-bold text-lg mb-4">📋 All Attempts</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="pb-3 pr-4">#</th>
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3 pr-4">Score</th>
                      <th className="pb-3 pr-4">Percentage</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3">Weak Topics</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.attempts_table.map((attempt, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="py-3 pr-4 text-gray-400">{i + 1}</td>
                        <td className="py-3 pr-4">{attempt.date}</td>
                        <td className="py-3 pr-4">
                          {attempt.score}/{attempt.total}
                        </td>
                        <td className="py-3 pr-4">
                          {Math.round((attempt.score / attempt.total) * 100)}%
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-1 rounded-full text-xs
                            ${attempt.score >= 3
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"}`}>
                            {attempt.score >= 3 ? "Pass" : "Fail"}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-1">
                            {attempt.weak_topics.map((topic, j) => (
                              <span key={j}
                                className="bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded-full">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AnalyticsScreen