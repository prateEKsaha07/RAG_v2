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

function StudyScreen({ user, onBack, setScreen, setSelectedBook, onLogout }) {
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

  // Lock body scroll when modal open
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

  const getProgressColor = (current, total) => {
    const percentage = (current / total) * 100;
    if (percentage < 30) return "from-rose-400 to-rose-500";
    if (percentage < 70) return "from-amber-400 to-amber-500";
    return "from-emerald-400 to-emerald-500";
  };

  const totalRead = books.reduce((acc, book) => acc + book.current_page, 0);
  const totalPages = books.reduce((acc, book) => acc + book.total_pages, 0);
  const overallProgress =
    totalPages > 0 ? Math.round((totalRead / totalPages) * 100) : 0;

  const stats = [
    {
      label: "Books",
      fullLabel: "Total Books",
      value: books.length,
      suffix: "",
      icon: BookOpen,
      bg: "from-rose-500 to-pink-500",
      glow: "shadow-rose-200/50",
    },
    {
      label: "Read",
      fullLabel: "Pages Read",
      value: totalRead,
      suffix: "",
      icon: TrendingUp,
      bg: "from-amber-500 to-orange-500",
      glow: "shadow-amber-200/50",
    },
    {
      label: "Total",
      fullLabel: "Total Pages",
      value: totalPages,
      suffix: "",
      icon: FileText,
      bg: "from-orange-500 to-rose-500",
      glow: "shadow-orange-200/50",
    },
    {
      label: "Progress",
      fullLabel: "Progress",
      value: overallProgress,
      suffix: "%",
      icon: GraduationCap,
      bg: "from-emerald-500 to-teal-500",
      glow: "shadow-emerald-200/50",
    },
  ];

  return (
    <div
      className={`
        study-screen ${darkMode ? "study-dark" : ""}
        min-h-screen transition-colors duration-500
        ${
          darkMode
            ? "bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/60 text-gray-100"
            : "bg-gradient-to-br from-rose-50/80 via-amber-50/60 to-orange-50/40"
        }
      `}
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* Decorative orbs */}
      <div
        className={`
          fixed top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-3xl -z-10 animate-hero-float
          ${darkMode ? "bg-indigo-500/10" : "bg-rose-200/20"}
        `}
      />
      <div
        className={`
          fixed bottom-0 left-0 w-64 sm:w-80 h-64 sm:h-80 rounded-full blur-3xl -z-10 animate-hero-float
          ${darkMode ? "bg-purple-500/10" : "bg-amber-200/20"}
        `}
        style={{ animationDelay: "1.5s" }}
      />
      <div
        className={`
          fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[400px] sm:w-[600px] h-[400px] sm:h-[600px]
          rounded-full blur-3xl -z-10 animate-hero-float-slow
          ${darkMode ? "bg-cyan-500/5" : "bg-orange-100/10"}
        `}
      />

      <ModuleNav
        active="study"
        onDashboard={onBack}
        onStudy={() => {}}
        onUpload={() => {}}
        onNotes={() => {}}
        onRoadmap={() => {}}
        onAnalyticsV2={() => {}}
        onLogout={onLogout}
        user={user}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-5 sm:space-y-8 relative">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:gap-6 animate-fade-up-slow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Title block */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
                <div className="relative flex-shrink-0">
                  <div
                    className={`
                      absolute inset-0 rounded-2xl blur-md opacity-40
                      ${
                        darkMode
                          ? "bg-gradient-to-br from-indigo-400 to-purple-400"
                          : "bg-gradient-to-br from-rose-400 to-amber-400"
                      }
                    `}
                  />
                  <div
                    className={`
                      relative p-2 sm:p-3 rounded-2xl shadow-lg animate-icon-breathe
                      ${
                        darkMode
                          ? "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30"
                          : "bg-gradient-to-br from-rose-500 to-amber-500 shadow-rose-200/50"
                      }
                    `}
                  >
                    <Library
                      className="w-5 h-5 sm:w-7 sm:h-7 text-white"
                      strokeWidth={2.2}
                    />
                  </div>
                </div>
                <h1
                  className={`
                    text-xl min-[400px]:text-2xl sm:text-3xl md:text-4xl font-bold
                    bg-clip-text text-transparent truncate
                    ${
                      darkMode
                        ? "bg-gradient-to-r from-indigo-300 to-purple-300"
                        : "bg-gradient-to-r from-rose-600 to-amber-600"
                    }
                  `}
                >
                  Study Library
                </h1>
              </div>
              <p
                className={`
                  text-xs sm:text-base ml-0.5 sm:ml-1 flex items-center gap-2
                  ${darkMode ? "text-indigo-300/80" : "text-rose-500/80"}
                `}
              >
                <span className="relative flex w-2 h-2 flex-shrink-0">
                  <span
                    className={`
                      absolute w-2 h-2 rounded-full animate-ping opacity-75
                      ${darkMode ? "bg-cyan-400" : "bg-emerald-400"}
                    `}
                  />
                  <span
                    className={`
                      relative w-2 h-2 rounded-full
                      ${darkMode ? "bg-cyan-500" : "bg-emerald-500"}
                    `}
                  />
                </span>
                Read and manage your uploaded books
              </p>
            </div>

            {/* Action buttons — full width row on mobile */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Dark mode toggle */}
              <button
                onClick={() => setDarkMode((v) => !v)}
                aria-label={
                  darkMode ? "Switch to light mode" : "Switch to dark mode"
                }
                className={`
                  group relative overflow-hidden flex-shrink-0
                  w-11 h-11 rounded-xl
                  flex items-center justify-center
                  transition-all duration-300
                  active:scale-95
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                  ${
                    darkMode
                      ? "bg-slate-800/80 ring-1 ring-indigo-400/30 text-amber-300 hover:bg-slate-800 focus-visible:ring-indigo-400"
                      : "bg-white/80 ring-1 ring-rose-200/50 text-rose-500 hover:bg-white shadow-sm focus-visible:ring-rose-400"
                  }
                `}
              >
                <div className="relative w-5 h-5">
                  <Sun
                    className={`
                      absolute inset-0 w-5 h-5 transition-all duration-500
                      ${
                        darkMode
                          ? "opacity-100 rotate-0"
                          : "opacity-0 rotate-90"
                      }
                    `}
                    strokeWidth={2.2}
                  />
                  <Moon
                    className={`
                      absolute inset-0 w-5 h-5 transition-all duration-500
                      ${
                        darkMode
                          ? "opacity-0 -rotate-90"
                          : "opacity-100 rotate-0"
                      }
                    `}
                    strokeWidth={2.2}
                  />
                </div>
              </button>

              {/* Upload button — full width on mobile */}
              <button
                onClick={() => setShowUploadModal(true)}
                className={`
                  group relative overflow-hidden flex-1 sm:flex-none
                  px-4 sm:px-6 py-3 rounded-xl font-medium
                  transition-all duration-300
                  hover:scale-[1.02] active:scale-[0.98]
                  flex items-center justify-center gap-2
                  shadow-lg
                  text-sm sm:text-base
                  ${
                    darkMode
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40"
                      : "bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/50"
                  }
                `}
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 group-hover:-translate-y-0.5 transition-transform duration-300" />
                <span className="relative z-10 sm:hidden">Upload</span>
                <span className="relative z-10 hidden sm:inline">Upload Book</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className={`
                  group relative rounded-xl sm:rounded-2xl
                  p-3 sm:p-5
                  transition-all duration-500 ease-out
                  hover:-translate-y-1
                  animate-fade-up-slow
                  ${
                    darkMode
                      ? "bg-slate-900/60 backdrop-blur-sm ring-1 ring-indigo-500/20 shadow-sm hover:shadow-lg hover:shadow-indigo-500/10"
                      : "bg-white/80 backdrop-blur-sm ring-1 ring-rose-200/30 shadow-sm hover:shadow-lg hover:shadow-rose-100/30"
                  }
                `}
                style={{ animationDelay: `${idx * 90}ms` }}
              >
                <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                  <div className="min-w-0">
                    <p
                      className={`
                        text-[10px] sm:text-sm font-medium truncate
                        ${darkMode ? "text-slate-400" : "text-gray-500"}
                      `}
                    >
                      <span className="sm:hidden">{stat.label}</span>
                      <span className="hidden sm:inline">{stat.fullLabel}</span>
                    </p>
                    <p
                      className={`
                        text-lg sm:text-2xl font-bold mt-0.5 sm:mt-1 tabular-nums
                        ${darkMode ? "text-gray-100" : "text-gray-800"}
                      `}
                    >
                      <StatValue value={stat.value} />
                      {stat.suffix}
                    </p>
                  </div>
                  <div
                    className={`
                      p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl flex-shrink-0
                      bg-gradient-to-br ${stat.bg}
                      shadow-md ${stat.glow}
                      group-hover:scale-110 group-hover:rotate-3
                      transition-transform duration-300
                    `}
                  >
                    <Icon
                      className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white"
                      strokeWidth={2.2}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Reading */}
        {continueBook && (
          <div
            className={`
              relative overflow-hidden rounded-2xl p-5 sm:p-8 shadow-xl animate-fade-up-slow
              ${
                darkMode
                  ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 shadow-indigo-500/30"
                  : "bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500 shadow-rose-200/40"
              }
            `}
          >
            <div className="absolute inset-0 -translate-x-full animate-shimmer-slow bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-2xl animate-hero-float" />
            <div
              className="absolute bottom-0 left-0 w-32 sm:w-48 h-32 sm:h-48 bg-white/5 rounded-full blur-2xl animate-hero-float"
              style={{ animationDelay: "1s" }}
            />

            <div className="relative z-10">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="p-1.5 sm:p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Clock className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-white/90 font-medium text-xs sm:text-base">
                  Continue Reading
                </span>
              </div>

              <h2 className="text-lg sm:text-2xl font-bold text-white mb-1 line-clamp-2">
                {continueBook.title}
              </h2>

              <p className="text-white/80 mb-3 sm:mb-4 text-xs sm:text-base tabular-nums">
                {continueBook.current_page} / {continueBook.total_pages} pages
              </p>

              <div className="w-full bg-white/30 rounded-full h-1.5 sm:h-2.5 mb-3 sm:mb-4 max-w-md overflow-hidden">
                <div
                  className="bg-white h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      (continueBook.current_page / continueBook.total_pages) *
                      100
                    }%`,
                  }}
                />
              </div>

              <button
                onClick={async () => {
                  const bookData = await openBook(continueBook.id);
                  if (!bookData) return;
                  setSelectedBook(bookData);
                  setScreen("study-reader");
                }}
                className={`
                  group/btn px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl
                  font-semibold text-sm sm:text-base
                  flex items-center gap-2
                  hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
                  transition-all duration-200
                  ${
                    darkMode
                      ? "bg-white text-indigo-600"
                      : "bg-white text-rose-600"
                  }
                `}
              >
                <span className="truncate">Continue Reading</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-5 sm:h-5 flex-shrink-0 group-hover/btn:translate-x-1 transition-transform duration-200" />
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative group animate-fade-up-slow">
          <Search
            className={`
              absolute left-3 sm:left-4 top-1/2 -translate-y-1/2
              w-4 h-4 sm:w-5 sm:h-5
              transition-all duration-300 pointer-events-none
              group-focus-within:scale-110
              ${
                darkMode
                  ? "text-indigo-400 group-focus-within:text-indigo-300"
                  : "text-rose-400 group-focus-within:text-rose-500"
              }
            `}
          />
          <input
            placeholder="Search books by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`
              w-full pl-10 sm:pl-12 pr-3 sm:pr-4
              py-2.5 sm:py-3.5 rounded-xl
              text-sm sm:text-base
              focus:outline-none transition-all duration-300
              ${
                darkMode
                  ? "bg-slate-900/60 backdrop-blur-sm text-gray-100 placeholder:text-slate-500 ring-1 ring-indigo-500/20 focus:ring-2 focus:ring-indigo-400/60 focus:bg-slate-900/80 shadow-sm focus:shadow-md focus:shadow-indigo-500/10"
                  : "bg-white/80 backdrop-blur-sm ring-1 ring-rose-200/50 focus:ring-2 focus:ring-rose-400/60 focus:bg-white placeholder:text-gray-400 shadow-sm focus:shadow-md focus:shadow-rose-100/40"
              }
            `}
          />
        </div>

        {/* Library Grid */}
        <div className="space-y-4 animate-fade-up-slow">
          <div className="flex items-center justify-between">
            <h2
              className={`
                text-lg sm:text-2xl font-bold flex items-center gap-2
                ${darkMode ? "text-gray-100" : "text-gray-800"}
              `}
            >
              <div
                className={`
                  p-1 sm:p-1.5 rounded-lg animate-icon-breathe
                  ${
                    darkMode
                      ? "bg-gradient-to-br from-indigo-500/30 to-purple-500/30"
                      : "bg-gradient-to-br from-amber-100 to-rose-100"
                  }
                `}
              >
                <Sparkles
                  className={`
                    w-3.5 h-3.5 sm:w-5 sm:h-5
                    ${darkMode ? "text-indigo-300" : "text-amber-600"}
                  `}
                />
              </div>
              My Books
              <span
                className={`
                  text-xs sm:text-sm font-normal ml-1
                  ${darkMode ? "text-slate-400" : "text-gray-500"}
                `}
              >
                ({filteredBooks.length})
              </span>
            </h2>
          </div>

          {loadingBooks ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`
                    rounded-2xl p-5 sm:p-6 animate-pulse
                    ${
                      darkMode
                        ? "bg-slate-900/60 ring-1 ring-indigo-500/20"
                        : "bg-white/80 backdrop-blur-sm ring-1 ring-rose-200/30"
                    }
                  `}
                >
                  <div
                    className={`
                      w-12 h-12 rounded-xl mb-4
                      ${darkMode ? "bg-slate-700" : "bg-rose-200"}
                    `}
                  />
                  <div
                    className={`
                      h-5 sm:h-6 rounded w-3/4 mb-2
                      ${darkMode ? "bg-slate-700" : "bg-rose-200"}
                    `}
                  />
                  <div
                    className={`
                      h-4 rounded w-1/2 mb-4
                      ${darkMode ? "bg-slate-800" : "bg-rose-100"}
                    `}
                  />
                  <div className="flex gap-3">
                    <div
                      className={`
                        flex-1 h-10 rounded-lg
                        ${darkMode ? "bg-slate-700" : "bg-rose-200"}
                      `}
                    />
                    <div
                      className={`
                        w-10 h-10 rounded-lg
                        ${darkMode ? "bg-slate-700" : "bg-rose-200"}
                      `}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredBooks.length === 0 ? (
            <div
              className={`
                rounded-2xl p-8 sm:p-14 text-center animate-fade-up-slow
                ${
                  darkMode
                    ? "bg-slate-900/60 backdrop-blur-sm ring-1 ring-indigo-500/20"
                    : "bg-white/80 backdrop-blur-sm ring-1 ring-rose-200/30"
                }
              `}
            >
              <div
                className={`
                  mx-auto w-14 h-14 sm:w-20 sm:h-20 rounded-2xl
                  flex items-center justify-center mb-3 sm:mb-4 animate-icon-breathe
                  ${
                    darkMode
                      ? "bg-gradient-to-br from-indigo-500/30 to-purple-500/30"
                      : "bg-gradient-to-br from-rose-100 to-amber-100"
                  }
                `}
              >
                <Library
                  className={`
                    w-7 h-7 sm:w-10 sm:h-10
                    ${darkMode ? "text-indigo-300" : "text-rose-500"}
                  `}
                  strokeWidth={1.8}
                />
              </div>
              <h3
                className={`
                  text-base sm:text-xl font-semibold mb-2
                  ${darkMode ? "text-gray-100" : "text-gray-700"}
                `}
              >
                {searchTerm ? "No matches found" : "Your library is empty"}
              </h3>
              <p
                className={`
                  text-xs sm:text-sm mb-5 sm:mb-6
                  ${darkMode ? "text-slate-400" : "text-gray-500"}
                `}
              >
                {searchTerm
                  ? "Try a different search term"
                  : "Upload your first book to get started"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className={`
                    group inline-flex items-center gap-2
                    px-4 sm:px-5 py-2.5 rounded-xl
                    font-medium text-sm sm:text-base
                    transition-all duration-300
                    hover:scale-[1.02] active:scale-[0.98]
                    shadow-lg
                    ${
                      darkMode
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-indigo-500/30"
                        : "bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-rose-200/50"
                    }
                  `}
                >
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                  Upload your first book
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {filteredBooks.map((book, idx) => {
                const progress = Math.round(
                  (book.current_page / book.total_pages) * 100
                );
                const progressColor = getProgressColor(
                  book.current_page,
                  book.total_pages
                );

                return (
                  <div
                    key={book.id}
                    style={{ animationDelay: `${Math.min(idx * 60, 400)}ms` }}
                    className={`
                      group relative rounded-2xl p-4 sm:p-6
                      transition-all duration-500 ease-out
                      hover:-translate-y-1.5
                      animate-fade-up-slow
                      ${
                        darkMode
                          ? "bg-slate-900/60 backdrop-blur-sm ring-1 ring-indigo-500/20 shadow-sm hover:shadow-xl hover:shadow-indigo-500/20"
                          : "bg-white/80 backdrop-blur-sm ring-1 ring-rose-200/30 shadow-sm hover:shadow-xl hover:shadow-rose-200/30"
                      }
                    `}
                  >
                    <div
                      className={`
                        pointer-events-none absolute inset-0 rounded-2xl
                        opacity-0 group-hover:opacity-100 transition-opacity duration-500
                        ${
                          darkMode
                            ? "bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-fuchsia-500/10"
                            : "bg-gradient-to-br from-rose-500/5 via-amber-500/5 to-orange-500/5"
                        }
                      `}
                    />

                    <div className="relative">
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div
                          className={`
                            p-2 sm:p-3 rounded-xl shadow-md
                            group-hover:scale-110 group-hover:rotate-3
                            transition-transform duration-300
                            ${
                              darkMode
                                ? "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30"
                                : "bg-gradient-to-br from-rose-500 to-amber-500 shadow-rose-200/40"
                            }
                          `}
                        >
                          <BookOpen
                            className="w-5 h-5 sm:w-7 sm:h-7 text-white"
                            strokeWidth={2.2}
                          />
                        </div>
                        <span
                          className={`
                            text-[10px] sm:text-xs font-medium px-2 sm:px-2.5 py-0.5 sm:py-1
                            rounded-full tabular-nums flex-shrink-0
                            ${
                              darkMode
                                ? "bg-indigo-500/20 text-indigo-200"
                                : "bg-rose-100/80 text-rose-700"
                            }
                          `}
                        >
                          {progress}%
                        </span>
                      </div>

                      <h3
                        className={`
                          font-bold text-sm sm:text-lg mb-1 line-clamp-1
                          ${darkMode ? "text-gray-100" : "text-gray-800"}
                        `}
                      >
                        {book.title}
                      </h3>

                      <p
                        className={`
                          text-[11px] sm:text-sm mb-3 sm:mb-4 tabular-nums
                          ${darkMode ? "text-slate-400" : "text-gray-500"}
                        `}
                      >
                        {book.current_page} / {book.total_pages} pages
                      </p>

                      <div
                        className={`
                          w-full rounded-full h-1.5 sm:h-2 mb-3 sm:mb-4 overflow-hidden
                          ${darkMode ? "bg-slate-800" : "bg-rose-100/60"}
                        `}
                      >
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${progressColor} transition-all duration-700`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="flex gap-2 sm:gap-3">
                        <button
                          onClick={async () => {
                            const bookData = await openBook(book.id);
                            if (!bookData) return;
                            setSelectedBook(bookData);
                            setScreen("study-reader");
                          }}
                          className={`
                            group/read flex-1 py-2 sm:py-2.5 rounded-lg
                            font-medium text-xs sm:text-base
                            transition-all duration-200
                            flex items-center justify-center gap-1.5 sm:gap-2
                            active:scale-[0.98]
                            ${
                              darkMode
                                ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white hover:shadow-lg hover:shadow-indigo-500/40"
                                : "bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white hover:shadow-lg hover:shadow-rose-200/50"
                            }
                          `}
                        >
                          Read
                          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/read:translate-x-0.5 transition-transform duration-200" />
                        </button>

                        <button
                          onClick={() => removeBook(book.id)}
                          aria-label={`Delete ${book.title}`}
                          className={`
                            group/del p-2 sm:p-2.5 rounded-lg
                            transition-all duration-200
                            hover:scale-105 active:scale-95
                            focus:outline-none focus-visible:ring-2
                            ${
                              darkMode
                                ? "bg-red-500/15 hover:bg-red-500/25 focus-visible:ring-red-400"
                                : "bg-red-50 hover:bg-red-100 focus-visible:ring-red-400"
                            }
                          `}
                        >
                          <Trash2
                            className={`
                              w-4 h-4 sm:w-5 sm:h-5
                              group-hover/del:rotate-12 transition-transform duration-200
                              ${darkMode ? "text-red-400" : "text-red-500"}
                            `}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Upload Modal — edge-to-edge on mobile */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 backdrop-blur-sm animate-backdrop-in"
            style={{
              backgroundColor: darkMode
                ? "rgba(0,0,0,0.65)"
                : "rgba(0,0,0,0.3)",
            }}
            onClick={() => setShowUploadModal(false)}
          />

          <div
            className={`
              relative rounded-t-2xl sm:rounded-2xl
              shadow-2xl w-full sm:max-w-lg
              p-5 sm:p-8
              animate-pop-in
              max-h-[90vh] overflow-y-auto
              ${
                darkMode
                  ? "bg-slate-900/95 backdrop-blur-xl ring-1 ring-indigo-500/30 shadow-indigo-500/20"
                  : "bg-white/95 backdrop-blur-xl ring-1 ring-rose-200/50 shadow-rose-200/40"
              }
            `}
            style={{
              paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))",
            }}
          >
            {/* Mobile drag handle */}
            <div className="sm:hidden flex justify-center mb-3">
              <div
                className={`
                  w-10 h-1 rounded-full
                  ${darkMode ? "bg-slate-700" : "bg-rose-200"}
                `}
              />
            </div>

            <button
              onClick={() => setShowUploadModal(false)}
              aria-label="Close"
              className={`
                absolute top-3 right-3 sm:top-4 sm:right-4
                p-2 rounded-xl
                transition-colors active:scale-90
                focus:outline-none focus-visible:ring-2
                ${
                  darkMode
                    ? "hover:bg-slate-800 focus-visible:ring-indigo-400 text-slate-300"
                    : "hover:bg-rose-50 focus-visible:ring-rose-400 text-gray-500"
                }
              `}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 sm:mb-6">
              <div
                className={`
                  p-2.5 sm:p-3 rounded-xl shadow-md animate-icon-breathe flex-shrink-0
                  ${
                    darkMode
                      ? "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30"
                      : "bg-gradient-to-br from-rose-500 to-amber-500 shadow-rose-200/40"
                  }
                `}
              >
                <Upload
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                  strokeWidth={2.2}
                />
              </div>
              <div className="min-w-0">
                <h2
                  className={`
                    text-base sm:text-xl font-bold
                    ${darkMode ? "text-gray-100" : "text-gray-800"}
                  `}
                >
                  Upload Book
                </h2>
                <p
                  className={`
                    text-xs sm:text-sm
                    ${darkMode ? "text-slate-400" : "text-gray-500"}
                  `}
                >
                  Upload a PDF book to your library
                </p>
              </div>
            </div>

            <div
              className={`
                relative border-2 border-dashed rounded-xl
                p-5 sm:p-8
                transition-all duration-300 mb-5 sm:mb-6
                ${
                  selectedFile
                    ? darkMode
                      ? "border-emerald-500 bg-emerald-500/10 animate-icon-breathe"
                      : "border-emerald-400 bg-emerald-50/40 animate-icon-breathe"
                    : darkMode
                    ? "border-indigo-500/40 hover:border-indigo-400/60 bg-indigo-500/5 hover:bg-indigo-500/10 animate-upload-bob"
                    : "border-rose-200 hover:border-rose-300 bg-rose-50/20 hover:bg-rose-50/40 animate-upload-bob"
                }
              `}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="text-center">
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2.5 sm:gap-3 animate-pop-in">
                    <div
                      className={`
                        p-2 rounded-lg flex-shrink-0
                        ${darkMode ? "bg-emerald-500/20" : "bg-emerald-100"}
                      `}
                    >
                      <FileText
                        className={`
                          w-5 h-5 sm:w-8 sm:h-8
                          ${darkMode ? "text-emerald-400" : "text-emerald-600"}
                        `}
                      />
                    </div>
                    <div className="text-left min-w-0">
                      <p
                        className={`
                          font-medium text-xs sm:text-base truncate
                          max-w-[180px] sm:max-w-none
                          ${darkMode ? "text-gray-100" : "text-gray-800"}
                        `}
                      >
                        {selectedFile.name}
                      </p>
                      <p
                        className={`
                          text-[11px] sm:text-sm
                          ${darkMode ? "text-slate-400" : "text-gray-500"}
                        `}
                      >
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload
                      className={`
                        w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2
                        ${darkMode ? "text-indigo-400" : "text-rose-400"}
                      `}
                    />
                    <p
                      className={`
                        text-sm sm:text-base
                        ${darkMode ? "text-slate-300" : "text-gray-600"}
                      `}
                    >
                      Click or drag to upload PDF
                    </p>
                    <p
                      className={`
                        text-[11px] sm:text-sm mt-1
                        ${darkMode ? "text-slate-500" : "text-gray-400"}
                      `}
                    >
                      Maximum file size: 50MB
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2.5 sm:gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className={`
                  flex-1 px-4 py-2.5 sm:py-3 rounded-xl
                  font-medium text-sm sm:text-base
                  transition-all duration-200 active:scale-[0.98]
                  ${
                    darkMode
                      ? "ring-1 ring-indigo-500/30 text-slate-300 hover:bg-slate-800"
                      : "ring-1 ring-rose-200 text-gray-600 hover:bg-rose-50"
                  }
                `}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
                className={`
                  flex-1 px-4 py-2.5 sm:py-3 rounded-xl
                  font-medium text-sm sm:text-base
                  transition-all duration-200
                  ${
                    uploading || !selectedFile
                      ? darkMode
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : darkMode
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white hover:shadow-lg hover:shadow-indigo-500/40 active:scale-[0.98]"
                      : "bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white hover:shadow-lg hover:shadow-rose-200/50 active:scale-[0.98]"
                  }
                `}
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Uploading...</span>
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