import { useState, useEffect } from "react";
import axios from "axios"
import Footer from "../common/Footer"
import Navbar from "../common/Navbar"

function UploadScreen({ onSuccess, onBack }) {
  const [file, setFile] = useState(null)
  const [subject, setSubject] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const API_URL = import.meta.env.VITE_API_URL
  console.log("API URL:", API_URL)

  const [subjects, setSubjects] = useState([]);

useEffect(() => {
  fetchSubjects();
}, []);

const fetchSubjects = async () => {
  try {
    const res = await axios.get(
      import.meta.env.VITE_API_URL + "/uploads"
    );
    setSubjects(res.data);
  } catch (err) {
    console.log(err);
  }
};

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
    import.meta.env.VITE_API_URL + "/ingest",
    formData
)
      setMessage(`${response.data.chunks_created} chunks created!`)
      setTimeout(() => onSuccess(subject.toLocaleLowerCase()), 1000)
    } catch (error) {
      setMessage("❌ Upload failed. Is your backend running?")
    } finally {
      setLoading(false)
    }
  }

  const handleUseExisting = () => {
    if (subject) onSuccess(subject.toLocaleLowerCase())
    else setMessage("Please enter a subject name")
  }

  return (
  <div className="min-h-screen bg-gray-100 flex flex-col">
    <Navbar
  onHome={onBack}
  showGetStarted={false}
/>

    <main className="flex-1 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Upload Study Notes
          </h2>

          <p className="text-gray-500 mb-8">
            Upload a Markdown (.md) knowledge base and ingest it into the AI.
          </p>

          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2">
              Markdown File
            </label>

            <input
              type="file"
              accept=".md"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div className="mb-6">
  <label className="block text-sm font-semibold mb-2">
    Subject Name
  </label>

  <input
    type="text"
    placeholder="AI, DBMS, Java..."
    value={subject}
    onChange={(e) => setSubject(e.target.value)}
    className="w-full border rounded-lg p-3"
  />
</div>

          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold transition"
          >
            {loading ? "Uploading..." : "📤 Upload & Ingest"}
          </button>

          <div className="border-t mt-8 pt-6">
  <p className="text-center text-gray-500 text-sm mb-4">
    Already uploaded your knowledge base?
  </p>

  <select
    value={subject}
    onChange={(e) => setSubject(e.target.value)}
    className="w-full border rounded-lg p-3 mb-4"
  >
    <option value="">Select Existing Subject</option>

    {subjects.map((item) => (
      <option key={item} value={item}>
        {item}
      </option>
    ))}
  </select>

  <button
    onClick={handleUseExisting}
    disabled={!subject}
    className="w-full bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-lg py-3 font-semibold transition"
  >
    Use Existing Data →
  </button>
</div>

          {message && (
            <div className="mt-6 rounded-lg bg-green-50 border border-green-200 p-3 text-center text-green-700 font-medium">
              {message}
            </div>
          )}
        </div>

        {/* Help Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold mb-4">
            📘 Creating Your Knowledge Base
          </h3>

          <div className="space-y-4 text-gray-700 leading-7">

            <p>
              Your study material should be written in a Markdown (.md) file.
            </p>

            <ul className="list-disc ml-6 space-y-2">
              <li>Use <strong>#</strong> for units.</li>
              <li>Use <strong>##</strong> for chapters.</li>
              <li>Use <strong>###</strong> for subtopics.</li>
              <li>Keep one subject per file.</li>
              <li>Write clear notes instead of huge paragraphs.</li>
            </ul>

            <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm whitespace-pre-line">
{`# Unit 1

## Introduction

Definition...

## Advantages

Point 1
Point 2

# Unit 2

## Topic`}
            </div>

            <p className="text-sm text-gray-500">
              Well-structured notes produce much better AI answers.
            </p>

          </div>
        </div>

        {/* Contact Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold mb-4">
            🏷 Need Custom Tags?
          </h3>

          <p className="text-gray-700 mb-5">
            Tags are currently managed by the developer to keep the knowledge
            base consistent. If you'd like additional tags or metadata added to
            your notes, feel free to get in touch.
          </p>

          <div className="bg-gray-100 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="font-semibold break-all">
              prateeksaha963@gmail.com
            </span>

            <button
              onClick={() => {
                navigator.clipboard.writeText("prateeksaha963@gmail.com");
                setMessage("📋 Email copied to clipboard!");
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
            >
              Copy Email
            </button>
          </div>
        </div>

      </div>
    </main>

    <Footer />
  </div>
)
}

export default UploadScreen