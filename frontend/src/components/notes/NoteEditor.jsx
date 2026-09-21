import { useState, useEffect, useMemo, useRef } from "react"
import axios from "axios"
import {
  ArrowLeft,
  Save,
  Tag,
  Link as LinkIcon,
  BookOpen,
  FileText,
  Sparkles,
  X,
  Plus,
  AlertCircle,
  CheckCircle,
  Loader,
  Hash,
  ExternalLink,
  Layers,
  Edit,
  Trash2,
  File,
} from "lucide-react"
import ModuleNav from "../common/ModuleNav"
import ReactMarkdown from "react-markdown"


// ---------------------------------------------------------------------------
// Tag sanitizer — flattens any shape into an array of unique strings
// ---------------------------------------------------------------------------
function coerceTags(input) {
  if (!Array.isArray(input)) return []
  const out = new Set()
  for (const item of input) {
    if (typeof item === "string") {
      out.add(item)
    } else if (item && typeof item === "object") {
      // Support common shapes: { topic }, { name }, { tag }, { tags: [...] }
      if (typeof item.topic === "string") out.add(item.topic)
      if (typeof item.name === "string") out.add(item.name)
      if (typeof item.tag === "string") out.add(item.tag)
      if (Array.isArray(item.tags)) {
        for (const t of item.tags) {
          if (typeof t === "string") out.add(t)
        }
      }
    }
  }
  return [...out]
}


// ---------------------------------------------------------------------------
// Frontmatter parser — robust against colons in values and multi-line fields
// ---------------------------------------------------------------------------
function parseFrontmatter(raw) {
  const result = { title: "", subject: "", tags: [], urls: [], content: raw }

  const fmMatch = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/)
  if (!fmMatch) {
    return result
  }

  const [, frontmatter, body] = fmMatch
  result.content = body.trim()

  for (const line of frontmatter.split("\n")) {
    const colonIdx = line.indexOf(":")
    if (colonIdx === -1) continue

    const key = line.slice(0, colonIdx).trim().toLowerCase()
    const value = line.slice(colonIdx + 1).trim()

    if (key === "title") result.title = value
    else if (key === "subject") result.subject = value
    else if (key === "tags") {
      try {
        const parsed = JSON.parse(value)
        if (Array.isArray(parsed)) result.tags = coerceTags(parsed)
      } catch {
        // Ignore malformed tags
      }
    } else if (key === "referenced_urls") {
      result.urls = value
        ? value.split(",").map((u) => ({ url: u.trim(), title: u.trim() }))
        : []
    }
  }

  return result
}


function NoteEditor({
  filename,
  onBack,
  onLogout,
  user,
  onStudy,
  onUpload,
  onNotes,
  onRoadmap,
  onAnalyticsV2,
}) {
  const [uploadContent, setUploadContent] = useState("")
  const [uploadFileInfo, setUploadFileInfo] = useState(null)

  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState([])
  const [urls, setUrls] = useState([])
  const [urlInput, setUrlInput] = useState("")
  const [subjects, setSubjects] = useState([])

  const [loading, setLoading] = useState(false)
  const [generatingTags, setGeneratingTags] = useState(false)
  const [suggestedTags, setSuggestedTags] = useState([])
  const [allSubjectTags, setAllSubjectTags] = useState([])
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("info")
  const [isEditing, setIsEditing] = useState(false)
  const [showDiscardModal, setShowDiscardModal] = useState(false)

  const isMountedRef = useRef(true)

  // Derived word count — always in sync
  const wordCount = useMemo(
    () => content.split(/\s+/).filter(Boolean).length,
    [content]
  )

  useEffect(() => {
    isMountedRef.current = true
    fetchSubjects()
    if (filename) {
      setIsEditing(true)
      loadExistingNote()
    }
    return () => {
      isMountedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(
        import.meta.env.VITE_API_URL + "/subjects"
      )
      if (isMountedRef.current) {
        setSubjects(response.data.subjects || [])
      }
    } catch (err) {
      console.error("Failed to fetch subjects:", err)
    }
  }

  const loadExistingNote = async () => {
    const token = localStorage.getItem("access_token")
    try {
      const response = await axios.get(
        import.meta.env.VITE_API_URL + `/notes/${filename}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const parsed = parseFrontmatter(response.data.content || "")
      if (!isMountedRef.current) return

      setTitle(parsed.title)
      setSubject(parsed.subject)
      setTags(coerceTags(parsed.tags))
      setUrls(parsed.urls)
      setContent(parsed.content)

      if (parsed.subject) {
        loadSubjectTags(parsed.subject)
        loadSubjectUpload(parsed.subject)
      }
    } catch (err) {
      console.error("Failed to load note:", err)
    }
  }

  const loadSubjectTags = async (subjectName) => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_API_URL + "/notes/subject-tags",
        { subject: subjectName }
      )
      if (isMountedRef.current) {
        setAllSubjectTags(coerceTags(response.data.tags))
      }
    } catch {
      if (isMountedRef.current) setAllSubjectTags([])
    }
  }

  const loadSubjectUpload = async (subjectName) => {
    try {
      const response = await axios.get(
        import.meta.env.VITE_API_URL + `/uploads/${subjectName}`
      )
      if (!isMountedRef.current) return

      setUploadContent(response.data.content || "No upload found")

      if (response.data.filename) {
        setUploadFileInfo({
          name: response.data.filename,
          size: response.data.size || 0,
          uploaded:
            response.data.uploaded_at || new Date().toLocaleDateString(),
        })
      } else {
        setUploadFileInfo(null)
      }
    } catch {
      if (isMountedRef.current) {
        setUploadContent("No upload found for this subject")
        setUploadFileInfo(null)
      }
    }
  }

  const handleSubjectChange = async (newSubject) => {
    setSubject(newSubject)
    await Promise.all([
      loadSubjectUpload(newSubject),
      loadSubjectTags(newSubject),
    ])
  }

  const handleContentChange = (e) => {
    setContent(e.target.value)
  }

  const handleGenerateTags = async () => {
    if (!content || !subject) {
      setMessage("Write some content and select subject first!")
      setMessageType("error")
      return
    }
    setGeneratingTags(true)
    try {
      const response = await axios.post(
        import.meta.env.VITE_API_URL + "/notes/generate-tags",
        { note_content: content, subject }
      )
      if (!isMountedRef.current) return

      const generated = coerceTags(response.data.tags)
      setSuggestedTags(generated)
      setTags(generated)
      setMessage("Tags generated successfully")
      setMessageType("success")
      setTimeout(() => {
        if (isMountedRef.current) setMessage("")
      }, 3000)
    } catch {
      if (isMountedRef.current) {
        setMessage("Failed to generate tags")
        setMessageType("error")
      }
    } finally {
      if (isMountedRef.current) setGeneratingTags(false)
    }
  }

  const handleTagToggle = (tag) => {
    if (typeof tag !== "string") return
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag))
    } else {
      if (tags.length >= 5) {
        setMessage("Maximum 5 tags allowed!")
        setMessageType("error")
        return
      }
      setTags([...tags, tag])
    }
    setMessage("")
  }

  const handleAddUrl = async () => {
    if (!urlInput.trim()) return
    const trimmed = urlInput.trim()

    try {
      const response = await axios.post(
        import.meta.env.VITE_API_URL + "/notes/fetch-url",
        { url: trimmed }
      )
      if (!isMountedRef.current) return
      setUrls([...urls, { url: trimmed, title: response.data.title || trimmed }])
      setUrlInput("")
    } catch {
      if (isMountedRef.current) {
        setUrls([...urls, { url: trimmed, title: trimmed }])
        setUrlInput("")
      }
    }
  }

  const handleRemoveUrl = (index) => {
    setUrls(urls.filter((_, i) => i !== index))
  }

  const canSave = useMemo(() => {
    return (
      title.trim() &&
      subject.trim() &&
      content.trim() &&
      tags.length >= 3 &&
      tags.length <= 5 &&
      wordCount <= 500
    )
  }, [title, subject, content, tags, wordCount])

  const handleSave = async () => {
    if (!title || !subject || !content) {
      setMessage("Title, subject and content are required!")
      setMessageType("error")
      return
    }
    if (tags.length < 3) {
      setMessage("Please select at least 3 tags!")
      setMessageType("error")
      return
    }
    if (wordCount > 500) {
      setMessage("Content exceeds 500 word limit!")
      setMessageType("error")
      return
    }

    setLoading(true)
    const token = localStorage.getItem("access_token")

    const urlStrings = urls.map((u) => (typeof u === "string" ? u : u.url))

    try {
      if (isEditing) {
        await axios.put(
          import.meta.env.VITE_API_URL + `/notes/${filename}`,
          { title, content, tags, urls: urlStrings },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      } else {
        await axios.post(
          import.meta.env.VITE_API_URL + "/notes",
          { title, subject, content, tags, urls: urlStrings },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }

      setMessage("Note saved successfully")
      setMessageType("success")
      setTimeout(() => {
        if (isMountedRef.current) onBack()
      }, 1000)
    } catch (error) {
      console.error(error)
      if (isMountedRef.current) {
        setMessage(error?.response?.data?.error || "Failed to save note")
        setMessageType("error")
      }
    } finally {
      if (isMountedRef.current) setLoading(false)
    }
  }

  const handleDiscard = () => {
    if (title || content || tags.length > 0 || urls.length > 0) {
      setShowDiscardModal(true)
    } else {
      onBack()
    }
  }

  const wordLimitColor =
    wordCount > 500
      ? "text-[#a83232]"
      : wordCount > 400
      ? "text-[#8a7965]"
      : "text-[#5a4a3a]"

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB"
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / 1048576).toFixed(1) + " MB"
  }

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

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={handleDiscard}
                aria-label="Back"
                className="w-9 h-9 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center text-[#5a4a3a] hover:border-[#5c1a1a]/40 hover:text-[#5c1a1a] transition-colors flex-shrink-0"
              >
                <ArrowLeft size={16} strokeWidth={1.8} />
              </button>
              <div className="w-9 h-9 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center flex-shrink-0">
                {isEditing ? (
                  <Edit size={15} strokeWidth={1.8} className="text-[#5c1a1a]" />
                ) : (
                  <FileText size={15} strokeWidth={1.8} className="text-[#5c1a1a]" />
                )}
              </div>
              <p className="text-[11px] tracking-[0.14em] uppercase text-[#8a7965]">
                {isEditing ? "Edit Note" : "New Note"}
              </p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2a1f14] mb-1.5 ml-12">
              {isEditing ? "Edit Note" : "Create New Note"}
            </h1>
            <p className="text-sm text-[#8a7965] ml-12 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#5c1a1a]" />
              {isEditing
                ? "Update your existing note"
                : "Write and organize your study notes"}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {message && (
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs border ${
                  messageType === "success"
                    ? "bg-[#faf7f3] text-[#5c1a1a] border-[#e8dfd3]"
                    : messageType === "error"
                    ? "bg-[#faf0f0] text-[#7a2a2a] border-[#dcc9c9]"
                    : "bg-[#faf7f3] text-[#5a4a3a] border-[#e8dfd3]"
                }`}
              >
                {messageType === "success" ? (
                  <CheckCircle size={12} strokeWidth={1.8} />
                ) : (
                  <AlertCircle size={12} strokeWidth={1.8} />
                )}
                {message}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={loading || !canSave}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-colors ${
                loading || !canSave
                  ? "bg-[#f0e9e0] text-[#a89880] cursor-not-allowed"
                  : "bg-[#5c1a1a] text-white hover:bg-[#4a1414]"
              }`}
            >
              {loading ? (
                <>
                  <Loader size={14} strokeWidth={1.8} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} strokeWidth={1.8} />
                  Save Note
                </>
              )}
            </button>
          </div>
        </div>

        {/* Split view */}
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-260px)]">
          {/* LEFT — Subject reference */}
          <div className="lg:w-1/2 bg-white border border-[#e8dfd3] rounded-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-[#e8dfd3] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <BookOpen
                  size={14}
                  strokeWidth={1.8}
                  className="text-[#5c1a1a] flex-shrink-0"
                />
                <p className="text-sm font-semibold text-[#2a1f14] truncate">
                  Subject Reference
                </p>
                {subject && (
                  <span className="text-[10px] tracking-[0.08em] uppercase px-2 py-0.5 rounded-full border border-[#e8dfd3] bg-[#faf7f3] text-[#5a4a3a] font-medium flex-shrink-0">
                    {subject}
                  </span>
                )}
              </div>
              {uploadFileInfo && (
                <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#8a7965] min-w-0">
                  <File size={11} strokeWidth={1.8} className="flex-shrink-0" />
                  <span className="truncate">{uploadFileInfo.name}</span>
                  <span className="text-[#c9bda9]">·</span>
                  <span className="flex-shrink-0">
                    {formatFileSize(uploadFileInfo.size)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {uploadContent ? (
                <div className="text-sm">
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => (
                        <h1 className="text-lg font-bold text-[#2a1f14] mb-3" {...props} />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 className="text-base font-bold text-[#2a1f14] mb-2 mt-5" {...props} />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 className="text-sm font-semibold text-[#2a1f14] mb-2 mt-4" {...props} />
                      ),
                      p: ({ node, ...props }) => (
                        <p className="text-[#6a5a48] leading-relaxed mb-3" {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul
                          className="list-disc list-inside space-y-1 mb-3 text-[#6a5a48]"
                          {...props}
                        />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol
                          className="list-decimal list-inside space-y-1 mb-3 text-[#6a5a48]"
                          {...props}
                        />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="text-[#6a5a48]" {...props} />
                      ),
                      code: ({ node, inline, ...props }) =>
                        inline ? (
                          <code
                            className="bg-[#faf7f3] border border-[#e8dfd3] text-[#5c1a1a] px-1.5 py-0.5 rounded text-xs font-mono"
                            {...props}
                          />
                        ) : (
                          <code
                            className="block bg-[#faf7f3] border border-[#e8dfd3] p-3 rounded-md text-xs overflow-x-auto font-mono text-[#3a2a1a]"
                            {...props}
                          />
                        ),
                      blockquote: ({ node, ...props }) => (
                        <blockquote
                          className="border-l-2 border-[#5c1a1a] pl-4 italic text-[#6a5a48] my-3"
                          {...props}
                        />
                      ),
                      a: ({ node, ...props }) => (
                        <a
                          className="text-[#5c1a1a] underline underline-offset-2 hover:text-[#4a1414]"
                          target="_blank"
                          rel="noopener noreferrer"
                          {...props}
                        />
                      ),
                      table: ({ node, ...props }) => (
                        <table
                          className="border-collapse border border-[#e8dfd3] w-full my-3"
                          {...props}
                        />
                      ),
                      th: ({ node, ...props }) => (
                        <th
                          className="border border-[#e8dfd3] px-3 py-2 bg-[#faf7f3] text-left text-[#2a1f14] font-medium"
                          {...props}
                        />
                      ),
                      td: ({ node, ...props }) => (
                        <td
                          className="border border-[#e8dfd3] px-3 py-2 text-[#6a5a48]"
                          {...props}
                        />
                      ),
                    }}
                  >
                    {uploadContent}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-12 h-12 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center mb-4">
                    <Layers size={20} strokeWidth={1.8} className="text-[#5c1a1a]" />
                  </div>
                  <p className="text-sm font-medium text-[#2a1f14]">
                    No reference loaded
                  </p>
                  <p className="text-xs text-[#8a7965] mt-1">
                    Select a subject to load reference material
                  </p>
                  <div className="mt-4 px-3 py-2 border border-[#e8dfd3] bg-[#faf7f3] rounded-md">
                    <p className="text-[11px] text-[#8a7965] flex items-center gap-2">
                      <FileText size={11} strokeWidth={1.8} />
                      Supports Markdown (.md) files
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Editor */}
          <div className="lg:w-1/2 bg-white border border-[#e8dfd3] rounded-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-[#e8dfd3] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Edit size={14} strokeWidth={1.8} className="text-[#5c1a1a]" />
                <p className="text-sm font-semibold text-[#2a1f14]">
                  Note Editor
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-[0.08em] uppercase text-[#8a7965]">
                  {isEditing ? "Editing" : "New"}
                </span>
                <button
                  onClick={handleDiscard}
                  className="inline-flex items-center gap-1.5 text-[11px] text-[#8a7965] hover:text-[#a83232] transition-colors px-2 py-1 rounded-md hover:bg-[#faf0f0]"
                >
                  <X size={12} strokeWidth={1.8} />
                  Discard
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-[11px] tracking-[0.12em] uppercase text-[#8a7965] mb-2 flex items-center gap-2">
                  <FileText size={11} strokeWidth={1.8} className="text-[#5c1a1a]" />
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Enter note title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#faf7f3] border border-[#e8dfd3] rounded-md p-3 text-sm text-[#2a1f14] placeholder-[#a89880] focus:outline-none focus:border-[#5c1a1a] transition-colors"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[11px] tracking-[0.12em] uppercase text-[#8a7965] mb-2 flex items-center gap-2">
                  <BookOpen size={11} strokeWidth={1.8} className="text-[#5c1a1a]" />
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  disabled={isEditing}
                  className="w-full bg-[#faf7f3] border border-[#e8dfd3] rounded-md p-3 text-sm text-[#2a1f14] focus:outline-none focus:border-[#5c1a1a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">Select subject...</option>
                  {subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Content */}
              <div>
                <label className="block text-[11px] tracking-[0.12em] uppercase text-[#8a7965] mb-2 flex items-center gap-2">
                  <Sparkles size={11} strokeWidth={1.8} className="text-[#5c1a1a]" />
                  Notes
                  <span className="text-[10px] tracking-[0.06em] text-[#a89880] normal-case">
                    Markdown supported
                  </span>
                </label>
                <textarea
                  placeholder="Write your notes here in Markdown... (max 500 words)"
                  value={content}
                  onChange={handleContentChange}
                  rows={6}
                  className="w-full bg-[#faf7f3] border border-[#e8dfd3] rounded-md p-3 text-sm text-[#2a1f14] placeholder-[#a89880] focus:outline-none focus:border-[#5c1a1a] transition-colors resize-none font-mono"
                />
                <p className={`text-[11px] text-right mt-1.5 tabular-nums ${wordLimitColor}`}>
                  {wordCount}/500 words
                </p>
              </div>

              {/* URLs */}
              <div>
                <label className="block text-[11px] tracking-[0.12em] uppercase text-[#8a7965] mb-2 flex items-center gap-2">
                  <LinkIcon size={11} strokeWidth={1.8} className="text-[#5c1a1a]" />
                  Reference URLs
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Paste URL here..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddUrl()
                      }
                    }}
                    className="flex-1 bg-[#faf7f3] border border-[#e8dfd3] rounded-md p-2.5 text-sm text-[#2a1f14] placeholder-[#a89880] focus:outline-none focus:border-[#5c1a1a] transition-colors"
                  />
                  <button
                    onClick={handleAddUrl}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md bg-white border border-[#5c1a1a]/40 text-[#5c1a1a] text-sm font-medium hover:bg-[#faf3ee] transition-colors"
                  >
                    <Plus size={13} strokeWidth={1.8} />
                    Add
                  </button>
                </div>
                {urls.length > 0 && (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {urls.map((url, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-2 bg-[#faf7f3] border border-[#e8dfd3] rounded-md p-2.5 text-sm"
                      >
                        <a
                          href={url.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#2a1f14] hover:text-[#5c1a1a] truncate flex items-center gap-1.5 min-w-0"
                        >
                          <ExternalLink
                            size={12}
                            strokeWidth={1.8}
                            className="text-[#5c1a1a] flex-shrink-0"
                          />
                          <span className="truncate">{url.title}</span>
                        </a>
                        <button
                          onClick={() => handleRemoveUrl(index)}
                          aria-label="Remove URL"
                          className="w-6 h-6 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center text-[#8a7965] hover:text-[#a83232] hover:border-[#a83232]/40 transition-colors flex-shrink-0"
                        >
                          <X size={11} strokeWidth={1.8} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <label className="text-[11px] tracking-[0.12em] uppercase text-[#8a7965] flex items-center gap-2">
                    <Tag size={11} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    Tags ({tags.length}/5)
                  </label>
                  <button
                    onClick={handleGenerateTags}
                    disabled={generatingTags}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                      generatingTags
                        ? "bg-[#f0e9e0] text-[#a89880] border-[#e8dfd3] cursor-not-allowed"
                        : "bg-white text-[#5c1a1a] border-[#5c1a1a]/40 hover:bg-[#faf3ee]"
                    }`}
                  >
                    {generatingTags ? (
                      <>
                        <Loader size={11} strokeWidth={1.8} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={11} strokeWidth={1.8} />
                        Generate Tags
                      </>
                    )}
                  </button>
                </div>

                {/* Selected tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {tags.map((tag, i) => (
                      <button
                        key={i}
                        onClick={() => handleTagToggle(tag)}
                        className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.06em] uppercase px-2.5 py-1.5 rounded-full border border-[#5c1a1a] bg-[#5c1a1a] text-white font-medium hover:bg-[#4a1414] transition-colors"
                      >
                        <Hash size={10} strokeWidth={2} />
                        {String(tag)}
                        <X size={10} strokeWidth={2} />
                      </button>
                    ))}
                  </div>
                )}

                {/* Suggested tags */}
                {suggestedTags.length > 0 && (
                  <div className="border border-[#e8dfd3] rounded-md p-3 max-h-40 overflow-y-auto bg-[#faf7f3]">
                    <p className="text-[10px] tracking-[0.1em] uppercase text-[#8a7965] font-medium mb-2 flex items-center gap-1.5">
                      <Sparkles
                        size={10}
                        strokeWidth={1.8}
                        className="text-[#5c1a1a]"
                      />
                      AI Suggested
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {suggestedTags.map((tag, i) => (
                        <label
                          key={i}
                          className="flex items-center gap-2 text-sm py-1.5 px-2 rounded-md hover:bg-white cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={tags.includes(tag)}
                            onChange={() => handleTagToggle(tag)}
                            className="w-3.5 h-3.5 accent-[#5c1a1a]"
                          />
                          <span className="text-[#3a2a1a] text-xs">{String(tag)}</span>
                        </label>
                      ))}
                    </div>

                    {allSubjectTags.filter((t) => !suggestedTags.includes(t)).length > 0 && (
                      <>
                        <p className="text-[10px] tracking-[0.1em] uppercase text-[#8a7965] mt-3 mb-2 flex items-center gap-1.5">
                          <Layers size={10} strokeWidth={1.8} />
                          More from subject
                        </p>
                        <div className="grid grid-cols-2 gap-1">
                          {allSubjectTags
                            .filter((t) => !suggestedTags.includes(t))
                            .map((tag, i) => (
                              <label
                                key={i}
                                className="flex items-center gap-2 text-sm py-1.5 px-2 rounded-md hover:bg-white cursor-pointer transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={tags.includes(tag)}
                                  onChange={() => handleTagToggle(tag)}
                                  className="w-3.5 h-3.5 accent-[#5c1a1a]"
                                />
                                <span className="text-[#3a2a1a] text-xs">
                                  {String(tag)}
                                </span>
                              </label>
                            ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Warnings */}
                {tags.length < 3 && tags.length > 0 && (
                  <p className="text-[11px] text-[#8a7965] mt-2 flex items-center gap-1.5">
                    <AlertCircle size={11} strokeWidth={1.8} />
                    Select at least 3 tags ({tags.length} selected)
                  </p>
                )}
                {tags.length >= 5 && (
                  <p className="text-[11px] text-[#a83232] mt-2 flex items-center gap-1.5">
                    <AlertCircle size={11} strokeWidth={1.8} />
                    Maximum 5 tags reached
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Discard modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#2a1f14]/40"
            onClick={() => setShowDiscardModal(false)}
          />

          <div className="relative bg-white border border-[#e8dfd3] rounded-lg max-w-md w-full p-8">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-9 h-9 rounded-md border border-[#dcc9c9] bg-[#faf0f0] flex items-center justify-center flex-shrink-0">
                <Trash2 size={15} strokeWidth={1.8} className="text-[#a83232]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#2a1f14]">
                  Discard Changes?
                </h2>
                <p className="text-xs text-[#8a7965] mt-1">
                  You have unsaved changes that will be lost.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowDiscardModal(false)}
                className="flex-1 px-4 py-2.5 rounded-md border border-[#e8dfd3] bg-white text-[#5a4a3a] text-sm font-medium hover:border-[#5c1a1a]/40 transition-colors"
              >
                Continue Editing
              </button>
              <button
                onClick={() => {
                  setShowDiscardModal(false)
                  onBack()
                }}
                className="flex-1 px-4 py-2.5 rounded-md bg-[#a83232] text-white text-sm font-medium hover:bg-[#8a2828] transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NoteEditor