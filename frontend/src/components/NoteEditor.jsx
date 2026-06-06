import { useState, useEffect } from "react"
import axios from "axios"

function NoteEditor({ filename, onBack }) {
  // Left side
  const [uploadContent, setUploadContent] = useState("")
  
  // Right side - note fields
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState([])
  const [urls, setUrls] = useState([])
  const [urlInput, setUrlInput] = useState("")
  const [subjects, setSubjects] = useState([])
  
  // UI states
  const [loading, setLoading] = useState(false)
  const [generatingTags, setGeneratingTags] = useState(false)
  const [suggestedTags, setSuggestedTags] = useState([])
  const [allSubjectTags, setAllSubjectTags] = useState([])
  const [message, setMessage] = useState("")
  const [wordCount, setWordCount] = useState(0)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchSubjects()
    if (filename) {
      setIsEditing(true)
      loadExistingNote()
    }
  }, [])

  const fetchSubjects = async () => {
    const response = await axios.get(
      import.meta.env.VITE_API_URL + "/subjects"
    )
    setSubjects(response.data.subjects)
  }

  const loadExistingNote = async () => {
    const response = await axios.get(
      import.meta.env.VITE_API_URL + `/notes/${filename}`
    )
    // Parse frontmatter and content
    const raw = response.data.content
    const lines = raw.split("\n")
    
    // Extract fields from frontmatter
    lines.forEach(line => {
      if (line.startsWith("title:")) 
        setTitle(line.replace("title:", "").trim())
      if (line.startsWith("subject:")) 
        setSubject(line.replace("subject:", "").trim())
      if (line.startsWith("tags:")) {
        try {
          setTags(JSON.parse(line.replace("tags:", "").trim()))
        } catch { setTags([]) }
      }
    })
    
    // Extract content after frontmatter
    const contentStart = raw.indexOf("---", 3) + 3
    setContent(raw.slice(contentStart).trim())
  }

  const handleSubjectChange = async (newSubject) => {
    setSubject(newSubject)
    console.log("Fetching upload for:", newSubject)
    try {
      const response = await axios.get(
        import.meta.env.VITE_API_URL + `/uploads/${newSubject}`
      )
      console.log("Upload response:", response.data)
      setUploadContent(response.data.content || "No upload found")
    } catch (error) {
      console.log("Upload error:", error)
      setUploadContent("No upload found for this subject")
    }


    // Load all tags for this subject
    const tagsResponse = await axios.post(
      import.meta.env.VITE_API_URL + "/notes/generate-tags",
      { note_content: "placeholder", subject: newSubject }
    )
    setAllSubjectTags(tagsResponse.data.tags || [])
  }

  const handleContentChange = (e) => {
    setContent(e.target.value)
    setWordCount(e.target.value.split(" ").filter(w => w).length)
  }

  const handleGenerateTags = async () => {
    if (!content || !subject) {
      setMessage("Write some content and select subject first!")
      return
    }
    setGeneratingTags(true)
    try {
      const response = await axios.post(
        import.meta.env.VITE_API_URL + "/notes/generate-tags",
        { note_content: content, subject }
      )
      setSuggestedTags(response.data.tags)
      // Auto select suggested tags
      setTags(response.data.tags)
    } catch {
      setMessage("Failed to generate tags")
    } finally {
      setGeneratingTags(false)
    }
  }

  const handleTagToggle = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag))
    } else {
      if (tags.length >= 5) {
        setMessage("Maximum 5 tags allowed!")
        return
      }
      setTags([...tags, tag])
    }
    setMessage("")
  }

  const handleAddUrl = async () => {
    if (!urlInput.trim()) return
    try {
      const response = await axios.post(
        import.meta.env.VITE_API_URL + "/notes/fetch-url",
        { url: urlInput }
      )
      setUrls([...urls, { 
        url: urlInput, 
        title: response.data.title 
      }])
      setUrlInput("")
    } catch {
      setUrls([...urls, { url: urlInput, title: urlInput }])
      setUrlInput("")
    }
  }

  const handleRemoveUrl = (index) => {
    setUrls(urls.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!title || !subject || !content) {
      setMessage("Title, subject and content are required!")
      return
    }
    if (tags.length < 3) {
      setMessage("Please select at least 3 tags!")
      return
    }
    if (wordCount > 500) {
      setMessage("Content exceeds 500 word limit!")
      return
    }

    setLoading(true)
    try {
      if (isEditing) {
        await axios.put(
          import.meta.env.VITE_API_URL + `/notes/${filename}`,
          { title, content, tags, urls }
        )
      } else {
        await axios.post(
          import.meta.env.VITE_API_URL + "/notes",
          { title, subject, content, tags, urls }
        )
      }
      setMessage("✅ Note saved successfully!")
      setTimeout(() => onBack(), 1000)
    } catch (error) {
      setMessage("❌ Failed to save note")
    } finally {
      setLoading(false)
    }
  }

  const wordLimitColor = wordCount > 500 
    ? "text-red-500" 
    : wordCount > 400 
    ? "text-yellow-500" 
    : "text-gray-400"

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* Navbar */}
      <nav className="bg-white shadow px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">RAG_V2</h1>
        <div className="flex gap-3 items-center">
          {message && (
            <p className="text-sm text-green-600 font-medium">{message}</p>
          )}
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded
                       hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {loading ? "Saving..." : "Save Note"}
          </button>
          <button
            onClick={onBack}
            className="text-sm text-gray-500 hover:text-blue-600"
          >
            ← Back
          </button>
        </div>
      </nav>

      {/* Split Screen */}
      <div className="flex flex-1 gap-0 h-full">

        {/* LEFT — Upload Preview */}
        <div className="w-1/2 bg-white border-r overflow-y-auto p-6">
          <h3 className="font-bold text-gray-700 mb-4">
            📄 Subject Reference
          </h3>
          {uploadContent ? (
            <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans">
                {uploadContent}
            </pre>
          ) : (
            <p className="text-gray-400 text-sm">
              Select a subject to load reference material
            </p>
          )}
        </div>

        {/* RIGHT — Note Editor */}
        <div className="w-1/2 overflow-y-auto p-6">

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>

          {/* Subject */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Subject</label>
            <select
              value={subject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
              disabled={isEditing}
            >
              <option value="">Select subject...</option>
              {subjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">
              Notes
            </label>
            <textarea
              placeholder="Write your notes here... (max 500 words)"
              value={content}
              onChange={handleContentChange}
              rows={10}
              className="w-full border rounded-lg p-3 text-sm resize-none"
            />
            <p className={`text-xs text-right ${wordLimitColor}`}>
              {wordCount}/500 words
            </p>
          </div>

          {/* URLs */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Reference URLs
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Paste URL here..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 border rounded-lg p-2 text-sm"
              />
              <button
                onClick={handleAddUrl}
                className="bg-gray-600 text-white px-3 py-2 
                           rounded-lg text-sm hover:bg-gray-700"
              >
                Add
              </button>
            </div>
            {urls.map((url, index) => (
              <div key={index} 
                className="flex justify-between items-center 
                           bg-gray-50 rounded p-2 mb-1 text-sm"
              >
                <a href={url.url} target="_blank" 
                   className="text-blue-600 hover:underline truncate">
                  {url.title}
                </a>
                <button
                  onClick={() => handleRemoveUrl(index)}
                  className="text-red-500 ml-2 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">
                Tags ({tags.length}/5)
              </label>
              <button
                onClick={handleGenerateTags}
                disabled={generatingTags}
                className="text-xs bg-purple-600 text-white px-3 py-1 
                           rounded hover:bg-purple-700 disabled:opacity-50"
              >
                {generatingTags ? "Generating..." : "✨ Generate Tags"}
              </button>
            </div>

            {/* Selected tags as pills */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {tags.map((tag, i) => (
                  <span key={i}
                    onClick={() => handleTagToggle(tag)}
                    className="bg-blue-600 text-white text-xs px-2 py-1 
                               rounded-full cursor-pointer hover:bg-blue-700"
                  >
                    {tag} ×
                  </span>
                ))}
              </div>
            )}

            {/* Tag checkboxes */}
            {suggestedTags.length > 0 && (
              <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
                <p className="text-xs text-gray-500 mb-2">
                  AI Suggested:
                </p>
                {suggestedTags.map((tag, i) => (
                  <label key={i} 
                    className="flex items-center gap-2 text-sm py-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tags.includes(tag)}
                      onChange={() => handleTagToggle(tag)}
                    />
                    {tag}
                  </label>
                ))}
                
                {allSubjectTags.filter(t => !suggestedTags.includes(t)).length > 0 && (
                  <>
                    <p className="text-xs text-gray-500 mt-3 mb-2">
                      More tags:
                    </p>
                    {allSubjectTags.filter(t => !suggestedTags.includes(t)).map((tag, i) => (
                      <label key={i}
                        className="flex items-center gap-2 text-sm py-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tags.includes(tag)}
                          onChange={() => handleTagToggle(tag)}
                        />
                        {tag}
                      </label>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* Tag limit warning */}
            {tags.length < 3 && (
              <p className="text-xs text-yellow-600 mt-1">
                Select at least 3 tags
              </p>
            )}
            {tags.length >= 5 && (
              <p className="text-xs text-red-500 mt-1">
                Maximum 5 tags reached
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default NoteEditor