import { useState, useEffect } from "react"
import axios from "axios"
import Navbar from "./Navbar"
import Footer from "./Footer"

function GoalSetupScreen({ onBack, onViewRoadmap }) {
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState("")
  const [existingRoadmap, setExistingRoadmap] = useState(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState("")

  // Form fields
  const [scope, setScope] = useState("full")
  const [unitNumber, setUnitNumber] = useState(1)
  const [hoursPerDay, setHoursPerDay] = useState(2)
  const [targetDate, setTargetDate] = useState("")

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    const token = localStorage.getItem("access_token")
    const response = await axios.get(
      import.meta.env.VITE_API_URL + "/subjects"
    )
    setSubjects(response.data.subjects)
  }



  const handleSubjectChange = async (subject) => {
    const token = localStorage.getItem("access_token")
    setSelectedSubject(subject)
    setExistingRoadmap(null)
    setError("")

    if (!subject) {
    return; 
    }
      setChecking(true);

    try {
      const response = await axios.get(
        import.meta.env.VITE_API_URL + `/roadmap/${subject}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      console.log("GET roadmap:", response.data);
      if (!response.data.error) {
        setExistingRoadmap(response.data);
      }
      console.log(response.data);
      console.log(Array.isArray(response.data));
    } catch (error) {
      console.log(JSON.stringify(error.response?.data, null, 2));
      setExistingRoadmap(null);
      } finally {
        setChecking(false);
    }
  }


  const handleDelete = async () => {
    const token = localStorage.getItem("access_token")
    if (!confirm("Delete this roadmap?")) return
    await axios.delete(
      import.meta.env.VITE_API_URL + `/roadmap/${selectedSubject}`,{
        headers:{
          Authorization: `Bearer ${token}`
        }
      }
    )
    setExistingRoadmap(null)
  }

  const handleGenerate = async () => {
    const token = localStorage.getItem("access_token")
    console.log("TOKEN:", token);
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
        },{
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (response.data.error) {
        setError(response.data.error)
        return
      }

      const targetSubject = selectedSubject;
      setExistingRoadmap(response.data)
      setError("")
      onViewRoadmap(targetSubject)

    } catch (error) {
      console.log(JSON.stringify(error.response?.data, null, 2));
      setError("Failed to generate roadmap")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-white shadow px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">RAG_V2</h1>
        <button
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-blue-600"
        >
          ← Dashboard
        </button>
      </nav>
      {/* <Navbar onHome={onBack} showGetStarted={false} /> */}
      <div className="max-w-2xl mx-auto px-8 py-10">
        <h2 className="text-2xl font-bold mb-8">🗺️ Study Roadmap</h2>

        {/* Subject Selector */}
        <div className="bg-white rounded-xl p-6 shadow mb-6">
          <label className="block text-sm font-medium mb-2">
            Select Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            className="w-full border rounded-lg p-2"
          >
            <option value="">Choose subject...</option>
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Checking */}
        {checking && (
          <p className="text-center text-gray-500 mb-4">
            Checking existing roadmap...
          </p>
        )}

        {/* Existing Roadmap */}
        {existingRoadmap && (
          <div className="bg-white rounded-xl p-6 shadow mb-6 
                          border-l-4 border-orange-500">
            <h3 className="font-bold text-lg mb-2">
              Active Roadmap Found 🗺️
            </h3>
            <div className="text-sm text-gray-600 space-y-1 mb-4">
              <p>Subject: <span className="font-medium">{existingRoadmap.subject}</span></p>
              <p>Scope: <span className="font-medium">{existingRoadmap.scope}</span></p>
              <p>Target: <span className="font-medium">{existingRoadmap.target_date}</span></p>
              <p>
  Created:{" "}
  <span className="font-medium">
    {new Date(existingRoadmap.created_at).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}
  </span>
</p>
              <p>Weeks: <span className="font-medium">{existingRoadmap.weeks?.length}</span></p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => onViewRoadmap(selectedSubject)}
                className="flex-1 bg-orange-500 text-white py-2 
                           rounded-lg hover:bg-orange-600"
              >
                View Roadmap →
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-50 text-red-600 py-2 
                           rounded-lg hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Create New Roadmap Form */}
        {selectedSubject && !existingRoadmap && !checking && (
          <div className="bg-white rounded-xl p-6 shadow">
            <h3 className="font-bold text-lg mb-6">
              Create New Roadmap ✨
            </h3>

            {/* Scope */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Study Scope
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setScope("full")}
                  className={`flex-1 py-2 rounded-lg border text-sm
                    ${scope === "full"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-300"}`}
                >
                  Full Syllabus
                </button>
                <button
                  onClick={() => setScope("unit")}
                  className={`flex-1 py-2 rounded-lg border text-sm
                    ${scope === "unit"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-300"}`}
                >
                  Specific Unit
                </button>
              </div>
            </div>

            {/* Unit Number */}
            {scope === "unit" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Unit Number
                </label>
                <select
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(parseInt(e.target.value))}
                  className="w-full border rounded-lg p-2"
                >
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>Unit {n}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Hours Per Day */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Hours Per Day: {hoursPerDay}h
              </label>
              <input
                type="range"
                min="1"
                max="8"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1h</span>
                <span>8h</span>
              </div>
            </div>

            {/* Target Date */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full border rounded-lg p-2"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 
                         rounded-xl font-semibold hover:bg-orange-600 
                         disabled:opacity-50"
            >
              {loading ? "Generating Roadmap... ⏳" : "Generate Roadmap 🗺️"}
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default GoalSetupScreen