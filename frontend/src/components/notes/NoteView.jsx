import { useState, useEffect } from "react"
import axios from "axios"

function NoteView({ filename, onBack, onEdit }) {
  const [note, setNote] = useState(null)
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNote()
  }, [])

  // Fetch note content with supabase authentication
  const loadNote = async () => {
    try {
      const response = await axios.get(
        import.meta.env.VITE_API_URL + `/notes/${filename}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`
          }
        }
      )
      const raw = response.data.content
      // Parse frontmatter
      const noteData = {}
      const lines = raw.split("\n")
      
      lines.forEach(line => {
        if (line.startsWith("title:"))
          noteData.title = line.replace("title:", "").trim()
        if (line.startsWith("subject:"))
          noteData.subject = line.replace("subject:", "").trim()
        if (line.startsWith("created_at:"))
          noteData.created = line.replace("created_at:", "").trim()
        if (line.startsWith("tags:")) {
          try {
            noteData.tags = JSON.parse(line.replace("tags:", "").trim())
          } catch { noteData.tags = [] }
        }
        if (line.startsWith("referenced_urls:")) {
          const urlStr = line.replace("referenced_urls:", "").trim()
          noteData.urls = urlStr ? urlStr.split(",").map(u => u.trim()) : []
        }
      })

      // Extract content after frontmatter
      const contentStart = raw.indexOf("---", 3) + 3
      setContent(raw.slice(contentStart).trim())
      setNote(noteData)
    } catch {
      setContent("Failed to load note")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="text-center mt-20 text-gray-500">Loading...</div>
  )

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-white shadow px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">RAG_V2</h1>
        <div className="flex gap-3">
          <button
            onClick={onEdit}
            className="text-sm bg-blue-600 text-white 
                       px-4 py-2 rounded hover:bg-blue-700"
          >
            ✏️ Edit
          </button>
          <button
            onClick={onBack}
            className="text-sm text-gray-500 hover:text-blue-600"
          >
            ← Back
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-8 py-10">

        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow mb-6">
          <h2 className="text-2xl font-bold mb-2">{note?.title}</h2>
          <p className="text-gray-500 text-sm mb-4">
            {note?.subject} • {note?.created}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {note?.tags?.map((tag, i) => (
              <span key={i}
                className="bg-blue-50 text-blue-700 text-xs 
                           px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl p-6 shadow mb-6">
          <h3 className="font-bold text-gray-700 mb-4">📝 Notes</h3>
          <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
            {content}
          </p>
        </div>

        {/* URLs */}
        {note?.urls?.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow">
            <h3 className="font-bold text-gray-700 mb-4">
              🔗 Reference URLs
            </h3>
            <ul className="space-y-2">
              {note.urls.map((url, i) => (
                <li key={i}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default NoteView