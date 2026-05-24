import { useState } from "react"
import axios from "axios"

function UploadScreen({ onSuccess }) {
  const [file, setFile] = useState(null)
  const [subject, setSubject] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleUpload = async () => {
    if (!file || !subject) {
      setMessage("Please select a file and enter subject name")
      return
    }
    setLoading(true)
    setMessage("")
    try {
      const formData = new FormData()
      formData.append("file", file)
      const response = await axios.post(
        "http://localhost:8000/ingest",
        formData
      )
      setMessage(`✅ ${response.data.chunks_created} chunks created!`)
      setTimeout(() => onSuccess(subject), 1000)
    } catch (error) {
      setMessage("❌ Upload failed. Is your backend running?")
    } finally {
      setLoading(false)
    }
  }

  const handleUseExisting = () => {
    if (subject) onSuccess(subject)
    else setMessage("Please enter a subject name")
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl p-8 shadow">
      <h2 className="text-2xl font-bold mb-6">Upload Study Notes</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Select .md file
        </label>
        <input
          type="file"
          accept=".md"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full border rounded p-2"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Subject Name
        </label>
        <input
          type="text"
          placeholder="e.g. food, history, sports"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded font-medium
                   hover:bg-blue-700 disabled:opacity-50 mb-3"
      >
        {loading ? "Uploading..." : "Upload & Ingest"}
      </button>

      {/* Use existing data */}
      <div className="border-t pt-4 mt-2">
        <p className="text-center text-sm text-gray-500 mb-3">
          Already ingested? Skip upload
        </p>
        <button
          onClick={handleUseExisting}
          className="w-full bg-gray-600 text-white py-2 rounded
                     font-medium hover:bg-gray-700"
        >
          Use Existing Data →
        </button>
      </div>

      {message && (
        <p className="mt-4 text-center text-sm text-green-600 font-medium">
          {message}
        </p>
      )}
    </div>
  )
}

export default UploadScreen