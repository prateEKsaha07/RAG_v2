import { useState, useEffect } from "react"
import SummaryCards from "./SummaryCards";
import ScoreProgressChart from "./ScoreProgressChart";
import WeakTopicsChart from "./WeakTopicsChart";
import PassFailChart from "./PassFailChart";
import ScoreDistributionChart from "./ScoreDistributionChart";
import AttemptsTable from "./AttemptsTable";
import SubjectSelector from "./SubjectSelector";

import axios from "axios"
import { getSubjects, getAnalytics } from "../../api/analyticsApi";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts"

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"]

// SVG Icons
const Icons = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
    </svg>
  ),
  analytics: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  loading: (
    <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  )
};

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200/50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                RAG_V2
              </h1>
              <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">
                Analytics Dashboard
              </p>
            </div>
          </div>
          
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 rounded-xl transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
              <span className="text-white text-xl">📊</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Analytics
            </h2>
          </div>
          <p className="text-sm text-gray-500 ml-2">
            Track your performance and identify areas for improvement
          </p>
        </div>

        {/* Subject Selector */}
        <div className="mb-6">
          <SubjectSelector
            subjects={subjects}
            value={selectedSubject}
            onChange={handleSubjectChange}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">
              Loading analytics...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-red-600 font-medium">{error}</p>
            <button 
              onClick={() => selectedSubject && fetchAnalytics(selectedSubject)}
              className="mt-3 px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Analytics Content */}
        {analytics && !loading && !error && (
          <div className="space-y-6 animate-fadeIn">
            {/* Summary Cards */}
            <section>
              <SummaryCards summary={analytics.summary} />
            </section>

            {/* Score Progression */}
            <section>
              <ScoreProgressChart data={analytics.score_progression} />
            </section>

            {/* Charts Grid - 2 columns */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-full">
                <WeakTopicsChart data={analytics.weak_topics_chart} />
              </div>
              <div className="h-full">
                <PassFailChart data={analytics.pass_fail} />
              </div>
            </section>

            {/* Score Distribution */}
            <section>
              <ScoreDistributionChart data={analytics.score_distribution} />
            </section>

            {/* Attempts Table */}
            <section>
              <AttemptsTable attempts={analytics.attempts_table} />
            </section>
          </div>
        )}

        {/* Empty State - No subject selected */}
        {!selectedSubject && !loading && !error && !analytics && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-200/50 shadow-xl shadow-gray-200/30">
            <div className="text-6xl mb-4">📈</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Select a Subject</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Choose a subject from the dropdown above to view detailed analytics and track your progress.
            </p>
          </div>
        )}
      </div>

      {/* Custom Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export default AnalyticsScreen