import { useState, useEffect } from "react"
import SummaryCards from "./SummaryCards";
import ScoreProgressChart from "./ScoreProgressChart";
import WeakTopicsChart from "./WeakTopicsChart";
import PassFailChart from "./PassFailChart";
import ScoreDistributionChart from "./ScoreDistributionChart";
import AttemptsTable from "./AttemptsTable";
import SubjectSelector from "./SubjectSelector";



import axios from "axios"
// import { getAnalytics } from "../../api"
import {
    getSubjects,
    getAnalytics,
} from "../../api/analyticsApi";
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

// fetch Subject
const fetchSubjects = async () => {
    try {
        const data = await getSubjects();
        setSubjects(data);
    } catch {
        setError("Failed to load subjects");
    }
};

const fetchAnalytics = async (subject) => {
    setLoading(true);

    try {
        const data = await getAnalytics(subject);

        if (data.error) {
            setError(data.error);
            setAnalytics(null);
        } else {
            setAnalytics(data);
            setError("");
        }
    } catch {
        setError("Failed to load analytics");
        setAnalytics(null);
    } finally {
        setLoading(false);
    }
};


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
        <SubjectSelector
          subjects={subjects}
          value={selectedSubject}
          onChange={handleSubjectChange}
        />

        {loading && (
          <p className="text-center text-gray-500">Loading analytics... ⏳</p>
        )}

        {error && (
          <p className="text-center text-red-500">{error}</p>
        )}

        {analytics && (
          <>
            {/* Summary Cards */}
            <SummaryCards summary={analytics.summary} />

            {/* Chart 1 - Score Progression */}
            <ScoreProgressChart
              data={analytics.score_progression}
            />


            {/* Chart 2 + 3 side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

              {/* Chart 2 - Weak Topics */}
              <WeakTopicsChart
                data={analytics.weak_topics_chart}
              />

              {/* Chart 3 - Pass/Fail */}
              <PassFailChart
                data={analytics.pass_fail}
              />
            </div>

            {/* Chart 4 - Score Distribution */}
            <ScoreDistributionChart
              data={analytics.score_distribution}
            />

            {/* Attempts Table */}
            <AttemptsTable
              attempts={analytics.attempts_table}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default AnalyticsScreen