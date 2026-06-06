import { useState, useEffect } from "react"
import axios from "axios"

function NotesScreen({ onBack, onCreateNote, onEditNote, onViewNote }) {
  const [notes, setNotes] = useState([])
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubjects()
    fetchNotes()
  }, [])

  const fetchSubjects = async () => {
    const response = await axios.get(
      import.meta.env.VITE_API_URL + "/subjects"
    )
    setSubjects(response.data.subjects)
  }

  const fetchNotes = async (subject = "") => {
    setLoading(true)
    const url = subject
      ? import.meta.env.VITE_API_URL + `/notes?subject=${subject}`
      : import.meta.env.VITE_API_URL + "/notes"
    const response = await axios.get(url)
    setNotes(response.data.notes)
    setLoading(false)
  }

  const handleSubjectFilter = (subject) => {
    setSelectedSubject(subject)
    fetchNotes(subject)
  }

  const handleDelete = async (filename) => {
    if (!confirm("Delete this note?")) return
    await axios.delete(
      import.meta.env.VITE_API_URL + `/notes/${filename}`
    )
    fetchNotes(selectedSubject)
  }

  const handleIngest = async () => {
    await axios.post(
      import.meta.env.VITE_API_URL + "/notes/ingest"
    )
    alert("Notes ingested successfully!")
    fetchNotes(selectedSubject)
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-white shadow px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">RAG_V2</h1>
        <div className="flex gap-3">
          <button
            onClick={handleIngest}
            className="text-sm bg-green-600 text-white 
                       px-4 py-2 rounded hover:bg-green-700"
          >
            Ingest Notes 🔄
          </button>
          <button
            onClick={onCreateNote}
            className="text-sm bg-blue-600 text-white 
                       px-4 py-2 rounded hover:bg-blue-700"
          >
            + New Note
          </button>
          <button
            onClick={onBack}
            className="text-sm text-gray-500 hover:text-blue-600"
          >
            ← Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-10">
        <h2 className="text-2xl font-bold mb-6">My Notes 📓</h2>

        {/* Subject Filter */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <button
            onClick={() => handleSubjectFilter("")}
            className={`px-4 py-2 rounded-full text-sm font-medium
              ${selectedSubject === ""
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"}`}
          >
            All
          </button>
          {subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => handleSubjectFilter(subject)}
              className={`px-4 py-2 rounded-full text-sm font-medium
                ${selectedSubject === subject
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              {subject}
            </button>
          ))}
        </div>

        {/* Notes Grid */}
        {loading ? (
          <p className="text-center text-gray-500">Loading notes...</p>
        ) : notes.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-4xl mb-4">📓</p>
            <p>No notes yet. Create your first note!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note, index) => (
              <div key={index}
                className="bg-white rounded-xl p-5 shadow hover:shadow-md transition"
              >
                {/* Title */}
                <h3 className="font-bold text-lg mb-1 truncate">
                  {note.title}
                </h3>

                {/* Subject + Date */}
                <p className="text-xs text-gray-400 mb-3">
                  {note.subject} • {note.created}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {note.tags.map((tag, i) => (
                    <span key={i}
                      className="bg-blue-50 text-blue-700 text-xs 
                                 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Word count + ingested */}
                <div className="flex justify-between items-center text-xs text-gray-400 mb-4">
                  <span>{note.word_count} words</span>
                  <span>{note.ingested ? "✅ ingested" : "⏳ not ingested"}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={() => onViewNote(note.filename)}
                        className="flex-1 bg-gray-50 text-gray-700 py-1 
                        rounded text-sm hover:bg-gray-100">
                        View
                    </button>

                    <button
                        onClick={() => onEditNote(note.filename)}
                        className="flex-1 bg-blue-50 text-blue-700 py-1 
                        rounded text-sm hover:bg-blue-100">
                        Edit
                    </button>
                    <button
                        onClick={() => handleDelete(note.filename)}
                        className="flex-1 bg-red-50 text-red-700 py-1 
                        rounded text-sm hover:bg-red-100">
                        Delete
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotesScreen