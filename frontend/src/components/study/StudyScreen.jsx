import { useState, useEffect, useRef } from "react";
import {
  Upload,
  Search,
  BookOpen,
  Trash2,
  ArrowRight,
  Library,
  Clock,
  TrendingUp,
  FileText,
  X,
  ChevronRight,
  Sparkles,
  GraduationCap,
  Plus,
  Sun,
  Moon,
} from "lucide-react";
import Footer from "../common/Footer";
import ModuleNav from "../common/ModuleNav";

import {
  getBooks,
  uploadBook,
  deleteBook,
  getBook,
} from "../../api/bookApi";

function StatValue({ value, duration = 900 }) {
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, value, duration]);

  return <span ref={ref}>{display}</span>;
}

const DARK_MODE_KEY = "studyScreen.darkMode";

function StudyScreen({ user, onBack, setScreen, setSelectedBook, onLogout, onNotes, onRoadmap, onAnalyticsV2, onUpload }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [continueBook, setContinueBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(DARK_MODE_KEY) === "true";
  });

  useEffect(() => {
    localStorage.setItem(DARK_MODE_KEY, String(darkMode));
  }, [darkMode]);

  const fetchBooks = async () => {
    try {
      setLoadingBooks(true);
      const fetchedBooks = await getBooks();
      setBooks(fetchedBooks);
      const sorted = [...fetchedBooks].sort(
        (a, b) => new Date(b.last_opened) - new Date(a.last_opened)
      );
      if (sorted.length) setContinueBook(sorted[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBooks(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      setUploading(true);
      await uploadBook(selectedFile);
      await fetchBooks();
      setSelectedFile(null);
      setShowUploadModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeBook = async (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await deleteBook(id);
        await fetchBooks();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const openBook = async (id) => {
    try {
      return await getBook(id);
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setShowUploadModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (showUploadModal) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [showUploadModal]);

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRead = books.reduce((acc, book) => acc + book.current_page, 0);
  const totalPages = books.reduce((acc, book) => acc + book.total_pages, 0);
  const overallProgress =
    totalPages > 0 ? Math.round((totalRead / totalPages) * 100) : 0;

  const stats = [
    { label: "Total Books", value: books.length, suffix: "", icon: BookOpen },
    { label: "Pages Read", value: totalRead, suffix: "", icon: TrendingUp },
    { label: "Total Pages", value: totalPages, suffix: "", icon: FileText },
    { label: "Progress", value: overallProgress, suffix: "%", icon: GraduationCap },
  ];

  // Dark mode palette (kept for toggle support)
  const c = darkMode
    ? {
        bg: "bg-[#0d1117]",
        chrome: "bg-[#0d1117]",
        panel: "bg-[#161b22]",
        card: "bg-[#161b22]",
        border: "border-[#30363d]",
        text: "text-[#e6edf3]",
        textMuted: "text-[#8b949e]",
        textDim: "text-[#6e7681]",
        accent: "bg-[#e6edf3]",
        accentText: "text-[#0d1117]",
        accentBorder: "border-[#e6edf3]",
        subtle: "bg-[#21262d]",
        subtleBorder: "border-[#30363d]",
        hover: "hover:bg-[#21262d]",
      }
    : {
        bg: "bg-[#f7f3ee]",
        chrome: "bg-[#faf7f3]",
        panel: "bg-[#faf7f3]",
        card: "bg-white",
        border: "border-[#e8dfd3]",
        text: "text-[#2a1f14]",
        textMuted: "text-[#8a7965]",
        textDim: "text-[#a89880]",
        accent: "bg-[#5c1a1a]",
        accentText: "text-white",
        accentBorder: "border-[#5c1a1a]",
        subtle: "bg-[#faf7f3]",
        subtleBorder: "border-[#e8dfd3]",
        hover: "hover:bg-[#f0e9e0]",
      };

  return (
    <div className={`min-h-screen ${c.bg} ${c.text}`}>
      <ModuleNav
        active="study"
        onDashboard={onBack}
        onStudy={() => {}}
        onUpload={onUpload}
        onNotes={onNotes}
        onRoadmap={onRoadmap}
        onAnalyticsV2={onAnalyticsV2}
        onLogout={onLogout}
        user={user}
      />

      <main className="max-w-6xl mx-auto px-6 lg:px-8 py-10 space-y-8">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className={`text-[11px] tracking-[0.14em] uppercase ${c.textMuted} mb-1.5`}>
              Study Library
            </p>
            <h1 className={`text-2xl sm:text-3xl font-bold ${c.text} mb-1.5`}>
              Study Library
            </h1>
            <p className={`text-sm ${c.textMuted}`}>
              Read and manage your uploaded books
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode((v) => !v)}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              className={`w-10 h-10 rounded-md border ${c.border} flex items-center justify-center ${c.textMuted} ${c.hover} transition-colors`}
            >
              {darkMode ? <Sun size={16} strokeWidth={1.8} /> : <Moon size={16} strokeWidth={1.8} />}
            </button>

            <button
              onClick={() => setShowUploadModal(true)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-md ${c.accent} ${c.accentText} text-sm font-medium transition-colors ${darkMode ? "hover:bg-[#c9d1d9]" : "hover:bg-[#4a1414]"}`}
            >
              <Upload size={15} strokeWidth={1.8} />
              Upload Book
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={`${c.card} border ${c.border} rounded-lg p-5`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className={`text-[11px] tracking-[0.12em] uppercase ${c.textMuted}`}>
                      {stat.label}
                    </p>
                    <p className={`text-2xl font-bold ${c.text} mt-2 tabular-nums`}>
                      <StatValue value={stat.value} />
                      {stat.suffix}
                    </p>
                  </div>
                  <div className={`w-9 h-9 rounded-md border ${c.border} ${c.subtle} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={16} strokeWidth={1.8} className={c.textMuted} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Reading */}
        {continueBook && (
          <div className={`${c.card} border ${c.border} rounded-lg p-6`}>
            <div className="flex items-center gap-2 mb-4">
              <Clock size={14} strokeWidth={1.8} className={c.textMuted} />
              <span className={`text-[11px] tracking-[0.14em] uppercase ${c.textMuted}`}>
                Continue Reading
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex-1 min-w-0">
                <h2 className={`text-lg sm:text-xl font-bold ${c.text} mb-2 truncate`}>
                  {continueBook.title}
                </h2>
                <p className={`text-sm ${c.textMuted} mb-4 tabular-nums`}>
                  {continueBook.current_page} / {continueBook.total_pages} pages
                </p>

                <div className={`w-full max-w-md ${c.subtle} rounded-full h-1.5 overflow-hidden`}>
                  <div
                    className={`h-full rounded-full ${darkMode ? "bg-[#e6edf3]" : "bg-[#5c1a1a]"}`}
                    style={{ width: `${(continueBook.current_page / continueBook.total_pages) * 100}%` }}
                  />
                </div>
              </div>

              <button
                onClick={async () => {
                  const bookData = await openBook(continueBook.id);
                  if (!bookData) return;
                  setSelectedBook(bookData);
                  setScreen("study-reader");
                }}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-md ${c.accent} ${c.accentText} text-sm font-medium transition-colors flex-shrink-0 ${darkMode ? "hover:bg-[#c9d1d9]" : "hover:bg-[#4a1414]"}`}
              >
                Continue Reading
                <ArrowRight size={15} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            strokeWidth={1.8}
            className={`absolute left-4 top-1/2 -translate-y-1/2 ${c.textMuted} pointer-events-none`}
          />
          <input
            placeholder="Search books by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-11 pr-4 py-3 ${c.panel} border ${c.border} rounded-md text-sm ${c.text} placeholder-[#a89880] focus:outline-none focus:border-[#5c1a1a] transition-colors`}
          />
        </div>

        {/* Library */}
        <div className="space-y-5">
          <div className="flex items-end justify-between">
            <div>
              <p className={`text-[11px] tracking-[0.14em] uppercase ${c.textMuted} mb-1`}>
                Library
              </p>
              <h2 className={`text-xl font-semibold ${c.text}`}>
                My Books
                <span className={`ml-2 text-sm font-normal ${c.textMuted}`}>
                  ({filteredBooks.length})
                </span>
              </h2>
            </div>
          </div>

          {loadingBooks ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`${c.card} border ${c.border} rounded-lg p-6 animate-pulse`}>
                  <div className={`w-10 h-10 rounded-md ${c.subtle} mb-4`} />
                  <div className={`h-5 rounded ${c.subtle} w-3/4 mb-2`} />
                  <div className={`h-4 rounded ${c.subtle} w-1/2 mb-5`} />
                  <div className={`h-9 rounded-md ${c.subtle}`} />
                </div>
              ))}
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className={`${c.card} border ${c.border} rounded-lg p-12 text-center`}>
              <div className={`mx-auto w-12 h-12 rounded-md border ${c.border} ${c.subtle} flex items-center justify-center mb-4`}>
                <Library size={20} strokeWidth={1.8} className={c.textMuted} />
              </div>
              <h3 className={`text-lg font-semibold ${c.text} mb-2`}>
                {searchTerm ? "No matches found" : "Your library is empty"}
              </h3>
              <p className={`text-sm ${c.textMuted} mb-6`}>
                {searchTerm ? "Try a different search term" : "Upload your first book to get started"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-md ${c.accent} ${c.accentText} text-sm font-medium transition-colors`}
                >
                  <Plus size={15} strokeWidth={1.8} />
                  Upload your first book
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBooks.map((book) => {
                const progress = Math.round((book.current_page / book.total_pages) * 100);

                return (
                  <div
                    key={book.id}
                    className={`${c.card} border ${c.border} rounded-lg p-5 transition-colors ${darkMode ? "hover:border-[#8b949e]" : "hover:border-[#5c1a1a]/40"}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-10 h-10 rounded-md border ${c.border} ${c.subtle} flex items-center justify-center`}>
                        <BookOpen size={18} strokeWidth={1.8} className={c.textMuted} />
                      </div>
                      <span className={`text-[11px] tracking-[0.08em] uppercase px-2.5 py-1 border ${c.border} rounded-full ${c.textMuted} tabular-nums`}>
                        {progress}%
                      </span>
                    </div>

                    <h3 className={`text-[15px] font-semibold ${c.text} mb-1 truncate`}>
                      {book.title}
                    </h3>

                    <p className={`text-xs ${c.textMuted} mb-4 tabular-nums`}>
                      {book.current_page} / {book.total_pages} pages
                    </p>

                    <div className={`w-full ${c.subtle} rounded-full h-1.5 mb-4 overflow-hidden`}>
                      <div
                        className={`h-full rounded-full ${darkMode ? "bg-[#e6edf3]" : "bg-[#5c1a1a]"}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          const bookData = await openBook(book.id);
                          if (!bookData) return;
                          setSelectedBook(bookData);
                          setScreen("study-reader");
                        }}
                        className={`flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-md ${c.accent} ${c.accentText} text-sm font-medium transition-colors ${darkMode ? "hover:bg-[#c9d1d9]" : "hover:bg-[#4a1414]"}`}
                      >
                        Read
                        <ChevronRight size={14} strokeWidth={1.8} />
                      </button>

                      <button
                        onClick={() => removeBook(book.id)}
                        aria-label={`Delete ${book.title}`}
                        className={`p-2 rounded-md border ${c.border} ${c.textMuted} transition-colors ${darkMode ? "hover:bg-[#21262d] hover:text-[#f85149]" : "hover:bg-[#faf0f0] hover:text-[#a83232]"}`}
                      >
                        <Trash2 size={16} strokeWidth={1.8} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ backgroundColor: darkMode ? "rgba(0,0,0,0.65)" : "rgba(42,31,20,0.3)" }}
            onClick={() => setShowUploadModal(false)}
          />

          <div className={`relative ${c.card} border ${c.border} rounded-lg w-full max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto`}>
            <button
              onClick={() => setShowUploadModal(false)}
              aria-label="Close"
              className={`absolute top-4 right-4 p-1.5 rounded-md ${c.textMuted} ${c.hover} transition-colors`}
            >
              <X size={16} strokeWidth={1.8} />
            </button>

            <p className={`text-[11px] tracking-[0.14em] uppercase ${c.textMuted} mb-1.5`}>
              New Material
            </p>
            <h2 className={`text-xl font-semibold ${c.text} mb-1`}>
              Upload Book
            </h2>
            <p className={`text-sm ${c.textMuted} mb-6`}>
              Upload a PDF book to your library
            </p>

            <div
              className={`relative border-2 border-dashed rounded-md p-8 text-center transition-colors mb-6 ${
                selectedFile
                  ? darkMode ? "border-[#e6edf3] bg-[#21262d]" : "border-[#5c1a1a] bg-[#faf3ee]"
                  : darkMode ? "border-[#30363d] hover:border-[#8b949e]" : "border-[#d9cdba] hover:border-[#b8a68f]"
              }`}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText size={22} strokeWidth={1.8} className={c.textMuted} />
                  <div className="text-left min-w-0">
                    <p className={`text-sm font-medium ${c.text} truncate`}>{selectedFile.name}</p>
                    <p className={`text-xs ${c.textMuted}`}>
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className={`w-10 h-10 mx-auto mb-3 rounded-md border ${c.border} flex items-center justify-center`}>
                    <FileText size={18} strokeWidth={1.6} className={c.textMuted} />
                  </div>
                  <p className={`text-sm ${c.text} mb-1`}>Click or drag to upload PDF</p>
                  <p className={`text-xs ${c.textDim}`}>Maximum file size: 50MB</p>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className={`flex-1 px-4 py-2.5 rounded-md border ${c.border} ${c.textMuted} text-sm font-medium ${c.hover} transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
                className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  uploading || !selectedFile
                    ? darkMode
                      ? "bg-[#21262d] text-[#6e7681] cursor-not-allowed"
                      : "bg-[#f0e9e0] text-[#a89880] cursor-not-allowed"
                    : `${c.accent} ${c.accentText} ${darkMode ? "hover:bg-[#c9d1d9]" : "hover:bg-[#4a1414]"}`
                }`}
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className={`w-3.5 h-3.5 border-2 ${darkMode ? "border-[#0d1117]" : "border-white"} border-t-transparent rounded-full animate-spin`} />
                    Uploading...
                  </span>
                ) : (
                  "Upload Book"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default StudyScreen;