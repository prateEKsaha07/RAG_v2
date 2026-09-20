import { useState, useEffect } from "react"
import axios from "axios"
import {
  Plus,
  BookOpen,
  Calendar,
  FileText,
  RefreshCw,
  Search,
  Trash2,
  Eye,
  Edit,
  Sparkles,
  Database,
} from "lucide-react"
import ModuleNav from "../common/ModuleNav"

function NotesScreen({
  onBack,
  onCreateNote,
  onEditNote,
  onViewNote,
  onLogout,
  user,
  onStudy,
  onUpload,
  onRoadmap,
  onAnalyticsV2,
}) {
  const [notes, setNotes] = useState([])
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState("")
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isIngesting, setIsIngesting] = useState(false)

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
    const token = localStorage.getItem("access_token")
    const url = subject
      ? import.meta.env.VITE_API_URL + `/notes?subject=${subject}`
      : import.meta.env.VITE_API_URL + "/notes"

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    setNotes(response.data.notes)
    setLoading(false)
  }

  const handleSubjectFilter = (subject) => {
    setSelectedSubject(subject)
    fetchNotes(subject)
  }

  const handleDelete = async (filename) => {
    if (!confirm("Delete this note?")) return

    const token = localStorage.getItem("access_token")

    try {
      await axios.delete(
        import.meta.env.VITE_API_URL + `/notes/${filename}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      fetchNotes(selectedSubject)
    } catch (error) {
      console.error(error)
      alert("Failed to delete note")
    }
  }

  const handleIngest = async () => {
    const token = localStorage.getItem("access_token")
    setIsIngesting(true)

    try {
      await axios.post(
        import.meta.env.VITE_API_URL + "/notes/ingest",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      alert("Notes ingested successfully!")
      fetchNotes(selectedSubject)
    } catch (error) {
      console.error(error)
      alert("Failed to ingest notes")
    } finally {
      setIsIngesting(false)
    }
  }

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-[#f7f3ee] text-[#2a1f14]">

      <ModuleNav
        active="notes"
        onDashboard={onBack}
        onStudy={onStudy}
        onUpload={onUpload}
        onNotes={() => {}}
        onRoadmap={onRoadmap}
        onAnalyticsV2={onAnalyticsV2}
        onLogout={onLogout}
        user={user}
      />

      <main className="max-w-6xl mx-auto px-6 lg:px-8 py-10 space-y-8">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.14em] uppercase text-[#8a7965] mb-1.5">
              Notes
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2a1f14] mb-1.5">
              My Notes
            </h1>
            <p className="text-sm text-[#8a7965]">
              Create, manage, and organize your study notes
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleIngest}
              disabled={isIngesting}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors border ${
                isIngesting
                  ? "bg-[#f0e9e0] text-[#a89880] border-[#e8dfd3] cursor-not-allowed"
                  : "bg-white text-[#5c1a1a] border-[#5c1a1a]/40 hover:bg-[#faf3ee]"
              }`}
            >
              {isIngesting ? (
                <>
                  <RefreshCw size={14} strokeWidth={1.8} className="animate-spin" />
                  Ingesting...
                </>
              ) : (
                <>
                  <Database size={14} strokeWidth={1.8} />
                  Ingest Notes
                </>
              )}
            </button>

            <button
              onClick={onCreateNote}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#5c1a1a] text-white text-sm font-medium hover:bg-[#4a1414] transition-colors"
            >
              <Plus size={14} strokeWidth={1.8} />
              New Note
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total Notes", value: notes.length, icon: FileText },
            { label: "Subjects", value: subjects.length, icon: BookOpen },
            {
              label: "Total Words",
              value: notes.reduce((acc, note) => acc + (note.word_count || 0), 0).toLocaleString(),
              icon: Sparkles,
            },
            {
              label: "Ingested",
              value: `${notes.filter(n => n.ingested).length}/${notes.length}`,
              icon: Database,
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white border border-[#e8dfd3] rounded-lg p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] tracking-[0.12em] uppercase text-[#8a7965]">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-[#2a1f14] mt-2 tabular-nums">
                      {stat.value}
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center flex-shrink-0">
                    <Icon size={16} strokeWidth={1.8} className="text-[#5c1a1a]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search + Subject filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              size={16}
              strokeWidth={1.8}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a7965] pointer-events-none"
            />
            <input
              placeholder="Search notes by title or tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-[#e8dfd3] rounded-md text-sm text-[#2a1f14] placeholder-[#a89880] focus:outline-none focus:border-[#5c1a1a] transition-colors"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleSubjectFilter("")}
              className={`px-3.5 py-2 rounded-full text-xs font-medium transition-colors border ${
                selectedSubject === ""
                  ? "bg-[#5c1a1a] text-white border-[#5c1a1a]"
                  : "bg-white text-[#5a4a3a] border-[#e8dfd3] hover:border-[#5c1a1a]/40"
              }`}
            >
              All
            </button>
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => handleSubjectFilter(subject)}
                className={`px-3.5 py-2 rounded-full text-xs font-medium transition-colors border ${
                  selectedSubject === subject
                    ? "bg-[#5c1a1a] text-white border-[#5c1a1a]"
                    : "bg-white text-[#5a4a3a] border-[#e8dfd3] hover:border-[#5c1a1a]/40"
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* Notes grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-[#e8dfd3] rounded-lg p-6 animate-pulse">
                <div className="w-10 h-10 rounded-md bg-[#f0e9e0] mb-4" />
                <div className="h-5 rounded bg-[#f0e9e0] w-3/4 mb-2" />
                <div className="h-4 rounded bg-[#f0e9e0] w-1/2 mb-4" />
                <div className="flex gap-2 mb-4">
                  <div className="h-5 rounded bg-[#f0e9e0] w-16" />
                  <div className="h-5 rounded bg-[#f0e9e0] w-12" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-9 rounded-md bg-[#f0e9e0]" />
                  <div className="flex-1 h-9 rounded-md bg-[#f0e9e0]" />
                  <div className="flex-1 h-9 rounded-md bg-[#f0e9e0]" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="bg-white border border-[#e8dfd3] rounded-lg p-12 text-center">
            <div className="w-12 h-12 rounded-md border border-[#e8dfd3] bg-[#faf7f3] mx-auto flex items-center justify-center mb-4">
              <FileText size={20} strokeWidth={1.8} className="text-[#5c1a1a]" />
            </div>
            <h3 className="text-lg font-semibold text-[#2a1f14] mb-2">
              {searchTerm ? "No notes found" : "No notes yet"}
            </h3>
            <p className="text-sm text-[#8a7965]">
              {searchTerm
                ? "Try a different search term"
                : "Create your first note to get started"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note, index) => (
              <div
                key={index}
                className="bg-white border border-[#e8dfd3] rounded-lg p-6 transition-colors hover:border-[#5c1a1a]/40"
              >
                {/* Title */}
                <h3 className="font-semibold text-[15px] text-[#2a1f14] mb-1.5 truncate">
                  {note.title}
                </h3>

                {/* Subject + Date */}
                <div className="flex items-center gap-3 text-[11px] text-[#8a7965] mb-3">
                  <span className="flex items-center gap-1">
                    <BookOpen size={11} strokeWidth={1.8} />
                    {note.subject}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={11} strokeWidth={1.8} />
                    {note.created}
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {note.tags.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] tracking-[0.06em] uppercase px-2.5 py-1 rounded-full border border-[#e8dfd3] bg-[#faf7f3] text-[#5a4a3a] font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                  {note.tags.length > 3 && (
                    <span className="text-[10px] text-[#8a7965] font-medium self-center">
                      +{note.tags.length - 3} more
                    </span>
                  )}
                </div>

                {/* Word count + ingested */}
                <div className="flex justify-between items-center text-[11px] mb-4">
                  <span className="text-[#8a7965] flex items-center gap-1">
                    <FileText size={11} strokeWidth={1.8} />
                    {note.word_count} words
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-medium border ${
                      note.ingested
                        ? "bg-[#faf7f3] text-[#5c1a1a] border-[#e8dfd3]"
                        : "bg-[#faf7f3] text-[#8a7965] border-[#e8dfd3]"
                    }`}
                  >
                    {note.ingested ? "Ingested" : "Pending"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onViewNote(note.filename)}
                    className="flex-1 py-2 rounded-md border border-[#e8dfd3] bg-white text-[#5a4a3a] text-xs font-medium transition-colors hover:border-[#5c1a1a]/40 hover:text-[#5c1a1a] flex items-center justify-center gap-1.5"
                  >
                    <Eye size={13} strokeWidth={1.8} />
                    View
                  </button>

                  <button
                    onClick={() => onEditNote(note.filename)}
                    className="flex-1 py-2 rounded-md border border-[#e8dfd3] bg-white text-[#5a4a3a] text-xs font-medium transition-colors hover:border-[#5c1a1a]/40 hover:text-[#5c1a1a] flex items-center justify-center gap-1.5"
                  >
                    <Edit size={13} strokeWidth={1.8} />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(note.filename)}
                    className="flex-1 py-2 rounded-md border border-[#e8dfd3] bg-white text-[#5a4a3a] text-xs font-medium transition-colors hover:border-[#a83232] hover:text-[#a83232] flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={13} strokeWidth={1.8} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default NotesScreen