import { useState, useEffect } from "react";
import axios from "axios";
import {
  LayoutDashboard,
  Upload as UploadIcon,
  BookOpen,
  FileText,
  Map,
  BarChart3,
  Info,
  Check,
  ChevronDown,
  Loader2,
  Search,
  LogOut,
} from "lucide-react";

function UploadScreen({
  onSuccess,
  onBack,
  onLogout,
  user,
  onStudy,
  onAnalyticsV2,
  onNotes,
  onRoadmap,
  onDashboard,
}) {
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setSubjectsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/uploads`);
      setSubjects(res.data || []);
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
    } finally {
      setSubjectsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file || !subject.trim()) {
      setMessage("Please select a file and enter a subject name");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("subject", subject.trim().toLowerCase());

      const response = await axios.post(`${API_URL}/ingest`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(`${response.data.chunks_created || 0} chunks created successfully`);
      setMessageType("success");
      setTimeout(() => onSuccess(subject.trim().toLowerCase()), 1000);
    } catch (error) {
      console.error("Upload error:", error);
      const detail =
        error?.response?.data?.detail ||
        error?.message ||
        "Upload failed. Please try again.";
      setMessage(`Upload failed: ${detail}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleUseExisting = () => {
    if (!subject) {
      setMessage("Please select a subject");
      setMessageType("error");
      return;
    }
    onSuccess(subject.trim().toLowerCase());
  };

  const copyEmail = () => {
    navigator.clipboard.writeText("prateeksaha963@gmail.com");
    setMessage("Email copied to clipboard");
    setMessageType("success");
    setTimeout(() => setMessage(""), 3000);
  };

  const removeFile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFile(null);
  };

  const initials = user?.email ? user.email.split("@")[0].slice(0, 2).toUpperCase() : "U";
  const userName = user?.email ? user.email.split("@")[0] : "User";

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, action: onDashboard || onBack },
    { id: "upload", label: "Upload", icon: UploadIcon, action: () => {} },
    { id: "study", label: "Study", icon: BookOpen, action: onStudy },
    { id: "notes", label: "Notes", icon: FileText, action: onNotes },
    { id: "roadmap", label: "Roadmap", icon: Map, action: onRoadmap },
    { id: "analytics-v2", label: "Analytics", icon: BarChart3, action: onAnalyticsV2 },
  ];
  const active = "upload";

  return (
    <div className="min-h-screen bg-[#f7f3ee] flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[#faf7f3] border-r border-[#e8dfd3] flex flex-col justify-between fixed h-screen">
        <div>
          <div className="px-6 py-6 border-b border-[#e8dfd3]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#5c1a1a] rounded-md flex items-center justify-center text-white text-sm font-semibold">
                A
              </div>
              <div>
                <p className="text-[15px] font-semibold text-[#3a2a1a] leading-tight">
                  RAG_v2
                </p>
                <p className="text-[10px] tracking-[0.15em] text-[#8a7965] uppercase">
                  Student Assistant
                </p>
              </div>
            </div>
          </div>

          <nav className="py-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className={`w-full flex items-center gap-3 px-6 py-2.5 text-sm transition-colors relative ${
                    isActive
                      ? "bg-[#f0e9e0] text-[#5c1a1a] font-medium"
                      : "text-[#5a4a3a] hover:bg-[#f0e9e0]/60"
                  }`}
                >
                  <Icon size={17} strokeWidth={1.8} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute right-0 top-0 h-full w-[3px] bg-[#5c1a1a]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-[#e8dfd3] p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#3a2a1a] flex items-center justify-center text-white text-xs font-medium">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#3a2a1a] truncate">{userName}</p>
              <p className="text-[11px] text-[#8a7965] truncate">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 text-sm text-[#5a4a3a] hover:text-[#5c1a1a] transition-colors py-1.5"
          >
            <LogOut size={15} strokeWidth={1.8} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 ml-56 flex flex-col min-h-screen">
        <header className="bg-[#faf7f3] border-b border-[#e8dfd3] px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <p className="text-sm text-[#8a7965]">
            Workspace <span className="mx-2 text-[#c9bda9]">/</span>
            <span className="text-[#3a2a1a] font-medium">Knowledge Vault</span>
          </p>
          <div className="flex items-center gap-4">
            <button
              aria-label="Search"
              className="w-9 h-9 rounded-md border border-[#e8dfd3] flex items-center justify-center text-[#5a4a3a] hover:bg-[#f0e9e0] transition-colors"
            >
              <Search size={16} strokeWidth={1.8} />
            </button>
            <div className="flex items-center gap-2 text-sm text-[#3a2a1a]">
              <span className="w-2 h-2 rounded-full bg-[#a83232]" />
              <span>AI Core Active</span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-8 py-10">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#2a1f14] mb-2">
              Upload Study Notes
            </h1>
            <p className="text-[15px] text-[#6a5a48]">
              Upload your knowledge base and ingest it into the AI to build dynamic
              study trees, roadmaps, and custom flashcards.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl">
            {/* LEFT COLUMN */}
            <div className="space-y-6">
              {/* Upload New Material */}
              <div className="bg-white border border-[#e8dfd3] rounded-lg p-6">
                <h2 className="text-xl font-semibold text-[#2a1f14] mb-1">
                  Upload New Material
                </h2>
                <p className="text-sm text-[#8a7965] mb-5">
                  Add new notes, research materials, or textbook transcripts.
                </p>

                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center mb-5 transition-colors ${
                    file
                      ? "border-[#5c1a1a] bg-[#faf3ee]"
                      : "border-[#d9cdba] hover:border-[#b8a68f]"
                  }`}
                >
                  <input
                    type="file"
                    accept=".md,.markdown,text/markdown"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    aria-label="Upload markdown file"
                  />
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-6 h-6 text-[#5c1a1a]" strokeWidth={1.8} />
                      <div className="text-left">
                        <p className="text-sm font-medium text-[#3a2a1a]">{file.name}</p>
                        <p className="text-xs text-[#8a7965]">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="relative z-20 ml-2 text-[#8a7965] hover:text-[#5c1a1a] text-lg leading-none"
                        aria-label="Remove file"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 mx-auto mb-3 rounded-md border border-[#d9cdba] flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[#8a7965]" strokeWidth={1.6} />
                      </div>
                      <p className="text-sm text-[#3a2a1a] mb-1">
                        Drag & drop your Markdown (.md) files here
                      </p>
                      <p className="text-xs text-[#8a7965]">
                        or click to browse your local directory
                      </p>
                      <p className="text-[11px] text-[#a89880] mt-3">
                        Max file size: 10MB
                      </p>
                    </>
                  )}
                </div>

                <label className="block text-[11px] tracking-[0.12em] uppercase text-[#8a7965] mb-2">
                  Subject Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., AI, DBMS, Java..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-[#faf7f3] border border-[#e8dfd3] rounded-md text-sm text-[#3a2a1a] placeholder-[#a89880] focus:outline-none focus:border-[#5c1a1a] transition-colors mb-4"
                />

                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className={`w-full py-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    loading
                      ? "bg-[#d9cdba] text-[#8a7965] cursor-not-allowed"
                      : "bg-[#5c1a1a] text-white hover:bg-[#4a1414]"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <UploadIcon className="w-4 h-4" strokeWidth={1.8} />
                      Upload & Ingest Knowledge Base
                    </>
                  )}
                </button>

                {message && (
                  <div
                    className={`mt-4 rounded-md p-3 text-sm border ${
                      messageType === "success"
                        ? "bg-[#f0f7f0] border-[#c9dcc9] text-[#2a5a2a]"
                        : messageType === "error"
                        ? "bg-[#faf0f0] border-[#dcc9c9] text-[#7a2a2a]"
                        : "bg-[#f0f3f7] border-[#c9d0dc] text-[#2a3a5a]"
                    }`}
                  >
                    {message}
                  </div>
                )}
              </div>

              {/* Use Existing Subject */}
              <div className="bg-white border border-[#e8dfd3] rounded-lg p-6">
                <h2 className="text-xl font-semibold text-[#2a1f14] mb-1">
                  Use Existing Subject
                </h2>
                <p className="text-sm text-[#8a7965] mb-5">
                  Re-engage or query database partitions you've already created.
                </p>

                <label className="block text-[11px] tracking-[0.12em] uppercase text-[#8a7965] mb-2">
                  Select Active Subject
                </label>
                <div className="relative mb-4">
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={subjectsLoading}
                    className="w-full appearance-none px-4 py-3 pr-10 bg-[#faf7f3] border border-[#e8dfd3] rounded-md text-sm text-[#3a2a1a] focus:outline-none focus:border-[#5c1a1a] transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <option value="">
                      {subjectsLoading
                        ? "Loading subjects..."
                        : subjects.length === 0
                        ? "No subjects found"
                        : "Select a subject..."}
                    </option>
                    {subjects.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a7965] pointer-events-none"
                    strokeWidth={1.8}
                  />
                </div>

                <button
                  onClick={handleUseExisting}
                  disabled={!subject}
                  className={`w-full py-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 border ${
                    subject
                      ? "bg-white border-[#5c1a1a] text-[#5c1a1a] hover:bg-[#faf3ee]"
                      : "bg-white border-[#e8dfd3] text-[#a89880] cursor-not-allowed"
                  }`}
                >
                  <BookOpen className="w-4 h-4" strokeWidth={1.8} />
                  Activate & Use Existing Data
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              <div className="bg-white border border-[#e8dfd3] rounded-lg p-6">
                <h2 className="text-xl font-semibold text-[#2a1f14] mb-1">
                  Creating Your Knowledge Base
                </h2>
                <p className="text-sm text-[#8a7965] mb-5">
                  Follow these structured formatting tips to ensure the AI parses your
                  materials optimally.
                </p>

                <ol className="space-y-4 text-sm text-[#5a4a3a]">
                  <li className="flex gap-3">
                    <span className="w-5 h-5 rounded-full border border-[#d9cdba] flex items-center justify-center text-[11px] text-[#8a7965] flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      Use headers to delineate hierarchy:{" "}
                      <code className="px-1.5 py-0.5 bg-[#f0e9e0] rounded text-[#5c1a1a] text-xs font-mono">
                        #
                      </code>{" "}
                      for units,{" "}
                      <code className="px-1.5 py-0.5 bg-[#f0e9e0] rounded text-[#5c1a1a] text-xs font-mono">
                        ##
                      </code>{" "}
                      for chapters, and{" "}
                      <code className="px-1.5 py-0.5 bg-[#f0e9e0] rounded text-[#5c1a1a] text-xs font-mono">
                        ###
                      </code>{" "}
                      for subtopics.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-5 h-5 rounded-full border border-[#d9cdba] flex items-center justify-center text-[11px] text-[#8a7965] flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      Write one dedicated subject per file to avoid cross-domain
                      classification confusion.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-5 h-5 rounded-full border border-[#d9cdba] flex items-center justify-center text-[11px] text-[#8a7965] flex-shrink-0 mt-0.5">
                      3
                    </span>
                    <span>
                      Keep notes clear and concise — avoid unstructured,
                      conversational text blocks.
                    </span>
                  </li>
                </ol>

                <p className="text-[11px] tracking-[0.12em] uppercase text-[#8a7965] mt-6 mb-2">
                  Example Markdown Structure
                </p>
                <div className="bg-[#faf7f3] border border-[#e8dfd3] rounded-md p-4 font-mono text-xs text-[#5a4a3a] whitespace-pre-line leading-relaxed">
{`# Unit 1: Introduction to AI
## Chapter 1: Foundations of Agents
### Subtopic: Rational Utility
- Rational agents maximize expected performance measures...`}
                </div>

                <div className="mt-5 flex items-start gap-3 p-3 bg-[#faf7f3] border border-[#e8dfd3] rounded-md">
                  <Info className="w-4 h-4 text-[#8a7965] flex-shrink-0 mt-0.5" strokeWidth={1.8} />
                  <p className="text-sm text-[#5a4a3a]">
                    Well-structured notes produce much better AI answers
                  </p>
                </div>
              </div>

              <div className="bg-white border border-[#e8dfd3] rounded-lg p-6">
                <h2 className="text-xl font-semibold text-[#2a1f14] mb-1">
                  Need Custom Tags?
                </h2>
                <p className="text-sm text-[#8a7965] mb-5">
                  Custom organization tags are currently managed manually by the
                  system developer to ensure taxonomy schema stability.
                </p>

                <p className="text-[11px] tracking-[0.12em] uppercase text-[#8a7965] mb-2">
                  Developer Contact
                </p>
                <div className="flex items-center justify-between gap-4 p-3 bg-[#faf7f3] border border-[#e8dfd3] rounded-md">
                  <span className="text-sm text-[#3a2a1a] truncate">
                    prateeksaha963@gmail.com
                  </span>
                  <button
                    onClick={copyEmail}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-md border border-[#5c1a1a] text-[#5c1a1a] text-sm hover:bg-[#faf3ee] transition-colors whitespace-nowrap"
                  >
                    <Check className="w-3.5 h-3.5" strokeWidth={2} />
                    Copy Email
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mt-12 pt-6 border-t border-[#e8dfd3] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-[#8a7965]">
            <p>© 2026 RAG_v2. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-[#5c1a1a] transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-[#5c1a1a] transition-colors">Privacy Protocol</a>
              <a href="#" className="hover:text-[#5c1a1a] transition-colors">Academic Integrity Policy</a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default UploadScreen;