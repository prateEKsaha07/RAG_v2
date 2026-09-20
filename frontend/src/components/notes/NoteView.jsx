import { useState, useEffect } from "react"
import axios from "axios"
import {
  ArrowLeft,
  Edit,
  BookOpen,
  Calendar,
  Tag,
  Link as LinkIcon,
  FileText,
  Sparkles,
  Clock,
  User
} from "lucide-react"

import ModuleNav from "../common/ModuleNav"

function NoteView({ filename, onBack, onEdit, onLogout, user, onStudy, onUpload, onNotes, onRoadmap, onAnalyticsV2 }) {
  const [note, setNote] = useState(null)
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNote()
  }, [])

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
    <div className="min-h-screen bg-[#f7f3ee] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#e8dfd3] border-t-[#5c1a1a] rounded-full animate-spin" />
        <p className="text-sm text-[#8a7965]">Loading note...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f7f3ee] text-[#2a1f14]">

      <ModuleNav
        active="notes"
        onDashboard={onBack}
        onStudy={onStudy}
        onUpload={onUpload}
        onNotes={onNotes}
        onRoadmap={onRoadmap}
        onAnalyticsV2={onAnalyticsV2}
        onLogout={onLogout}
        user={user}
      />

      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-10 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.14em] uppercase text-[#8a7965] mb-1.5">
              Notes
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2a1f14] mb-1.5">
              Note Details
            </h1>
            <p className="text-sm text-[#8a7965]">
              Viewing your note content
            </p>
          </div>

          <button
            onClick={onEdit}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#5c1a1a] text-white text-sm font-medium hover:bg-[#4a1414] transition-colors self-start sm:self-auto"
          >
            <Edit size={14} strokeWidth={1.8} />
            Edit Note
          </button>
        </div>

        {/* Note card */}
        <div className="bg-white border border-[#e8dfd3] rounded-lg overflow-hidden">

          {/* Header section */}
          <div className="p-8 border-b border-[#e8dfd3]">
            <h2 className="text-2xl font-bold text-[#2a1f14] mb-3">
              {note?.title}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#8a7965]">
              <span className="flex items-center gap-2">
                <BookOpen size={13} strokeWidth={1.8} className="text-[#5c1a1a]" />
                <span className="font-medium text-[#2a1f14]">{note?.subject}</span>
              </span>

              <span className="flex items-center gap-2">
                <Calendar size={13} strokeWidth={1.8} className="text-[#8a7965]" />
                {note?.created}
              </span>

              <span className="flex items-center gap-2">
                <Clock size={13} strokeWidth={1.8} className="text-[#8a7965]" />
                {content.split(/\s+/).length} words
              </span>
            </div>

            {note?.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {note.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[10px] tracking-[0.06em] uppercase px-2.5 py-1 rounded-full border border-[#e8dfd3] bg-[#faf7f3] text-[#5a4a3a] font-medium"
                  >
                    <Tag size={10} strokeWidth={1.8} />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Content section */}
          <div className="p-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center">
                <Sparkles size={14} strokeWidth={1.8} className="text-[#5c1a1a]" />
              </div>
              <h3 className="font-semibold text-[#2a1f14]">Notes Content</h3>
            </div>

            <div className="bg-[#faf7f3] rounded-md p-6 border border-[#e8dfd3]">
              <p className="text-[#3a2a1a] whitespace-pre-wrap text-sm leading-relaxed">
                {content || "No content available"}
              </p>
            </div>
          </div>

          {/* URLs section */}
          {note?.urls?.length > 0 && (
            <div className="p-8 border-t border-[#e8dfd3]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center">
                  <LinkIcon size={14} strokeWidth={1.8} className="text-[#5c1a1a]" />
                </div>
                <h3 className="font-semibold text-[#2a1f14]">Reference URLs</h3>
                <span className="ml-auto text-[10px] tracking-[0.1em] uppercase text-[#8a7965] border border-[#e8dfd3] bg-[#faf7f3] px-2.5 py-1 rounded-full">
                  {note.urls.length} links
                </span>
              </div>

              <ul className="space-y-2">
                {note.urls.map((url, i) => (
                  <li key={i}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-3 rounded-md border border-[#e8dfd3] bg-[#faf7f3] hover:border-[#5c1a1a]/40 transition-colors"
                    >
                      <span className="text-sm text-[#2a1f14] truncate flex-1">
                        {url}
                      </span>
                      <span className="text-[11px] text-[#8a7965] whitespace-nowrap">
                        Open
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer actions */}
          <div className="p-6 bg-[#faf7f3] border-t border-[#e8dfd3] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-[#8a7965]">
              <User size={12} strokeWidth={1.8} />
              <span className="truncate">Note ID: {filename}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-[#e8dfd3] bg-white text-[#5a4a3a] text-sm font-medium transition-colors hover:border-[#5c1a1a]/40 hover:text-[#5c1a1a]"
              >
                <ArrowLeft size={13} strokeWidth={1.8} />
                Back to Notes
              </button>

              <button
                onClick={onEdit}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#5c1a1a] text-white text-sm font-medium hover:bg-[#4a1414] transition-colors"
              >
                <Edit size={13} strokeWidth={1.8} />
                Edit Note
              </button>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Characters", value: content.length.toLocaleString(), icon: FileText },
            { label: "Words", value: content.split(/\s+/).filter(w => w.length > 0).length.toLocaleString(), icon: Sparkles },
            { label: "Tags", value: note?.tags?.length || 0, icon: Tag },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white border border-[#e8dfd3] rounded-lg p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] tracking-[0.12em] uppercase text-[#8a7965]">
                      {stat.label}
                    </p>
                    <p className="text-xl font-bold text-[#2a1f14] mt-2 tabular-nums">
                      {stat.value}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center flex-shrink-0">
                    <Icon size={14} strokeWidth={1.8} className="text-[#5c1a1a]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </main>
    </div>
  )
}

export default NoteView