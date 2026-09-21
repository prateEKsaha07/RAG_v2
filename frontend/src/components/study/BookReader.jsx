import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  MoreVertical,
  ZoomIn,
  ZoomOut,
  BookOpen,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Coffee,
  X,
  Check,
  Bookmark,
  BookmarkPlus,
  List,
  Clock,
  Trash2,
  Keyboard,
  HelpCircle,
} from "lucide-react";

import {
  updateProgress,
  updateLastOpened,
} from "../../api/bookApi";


const MIN_SCALE = 0.5;
const MAX_SCALE = 2.5;
const SCALE_STEP = 0.15;
const CHROME_HIDE_DELAY = 3000;


// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------
function loadBookmarks(bookId) {
  try {
    const raw = localStorage.getItem(`bookmarks:${bookId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBookmarks(bookId, bookmarks) {
  try {
    localStorage.setItem(`bookmarks:${bookId}`, JSON.stringify(bookmarks));
  } catch (err) {
    console.error("Failed to save bookmarks:", err);
  }
}

function loadReadingStats(bookId) {
  try {
    const raw = localStorage.getItem(`reading-stats:${bookId}`);
    return raw ? JSON.parse(raw) : { totalSeconds: 0, daily: {} };
  } catch {
    return { totalSeconds: 0, daily: {} };
  }
}

function saveReadingStats(bookId, stats) {
  try {
    localStorage.setItem(`reading-stats:${bookId}`, JSON.stringify(stats));
  } catch (err) {
    console.error("Failed to save reading stats:", err);
  }
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function todayKey() {
  return new Date().toISOString().split("T")[0];
}


// ---------------------------------------------------------------------------
// Keyboard shortcuts reference
// ---------------------------------------------------------------------------
const SHORTCUTS = [
  { keys: ["←"], description: "Previous page" },
  { keys: ["→"], description: "Next page" },
  { keys: ["+"], description: "Zoom in" },
  { keys: ["−"], description: "Zoom out" },
  { keys: ["0"], description: "Reset zoom (90%)" },
  { keys: ["/"], description: "Open search" },
  { keys: ["T"], description: "Toggle table of contents" },
  { keys: ["B"], description: "Add bookmark" },
  { keys: ["Esc"], description: "Close overlays" },
];


// ---------------------------------------------------------------------------
// Table of Contents sidebar
// ---------------------------------------------------------------------------
function TocSidebar({ outline, pageNumber, onJump, isDark, onClose }) {
  const c = isDark
    ? { panel: "bg-[#161b22]", border: "border-[#30363d]", text: "text-[#e6edf3]", muted: "text-[#8b949e]", hover: "hover:bg-[#21262d]" }
    : { panel: "bg-white", border: "border-[#e8dfd3]", text: "text-[#2a1f14]", muted: "text-[#8a7965]", hover: "hover:bg-[#faf7f3]" };

  const renderItem = (item, depth = 0) => {
    if (!item) return null;
    const isActive = item.pageNumber === pageNumber;

    return (
      <div key={item.title + depth}>
        <button
          onClick={() => item.pageNumber && onJump(item.pageNumber)}
          className={`w-full text-left text-xs py-1.5 px-2 rounded-md transition-colors ${
            isActive ? "bg-[#5c1a1a] text-white" : `${c.hover} ${c.text}`
          }`}
          style={{ paddingLeft: `${8 + depth * 12}px` }}
        >
          {item.title}
        </button>
        {item.items?.length > 0 && (
          <div>
            {item.items.map((child) => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={`w-72 flex-shrink-0 border-r flex flex-col ${c.panel} ${c.border}`}>
      <div className={`h-12 px-4 flex items-center justify-between border-b ${c.border}`}>
        <div className="flex items-center gap-2">
          <List size={14} strokeWidth={1.8} className={c.muted} />
          <span className={`text-xs font-semibold ${c.text}`}>Contents</span>
        </div>
        <button
          onClick={onClose}
          className={`w-7 h-7 rounded-md flex items-center justify-center ${c.hover} ${c.muted}`}
        >
          <X size={14} strokeWidth={1.8} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {outline?.length > 0 ? (
          outline.map((item) => renderItem(item))
        ) : (
          <p className={`text-xs p-4 ${c.muted}`}>No outline available for this PDF.</p>
        )}
      </div>
    </aside>
  );
}


// ---------------------------------------------------------------------------
// Bookmarks sidebar
// ---------------------------------------------------------------------------
function BookmarksSidebar({ bookmarks, onJump, onDelete, isDark, onClose }) {
  const c = isDark
    ? { panel: "bg-[#161b22]", border: "border-[#30363d]", text: "text-[#e6edf3]", muted: "text-[#8b949e]", hover: "hover:bg-[#21262d]", danger: "hover:bg-[#3d1f1f] hover:text-[#ff8080]" }
    : { panel: "bg-white", border: "border-[#e8dfd3]", text: "text-[#2a1f14]", muted: "text-[#8a7965]", hover: "hover:bg-[#faf7f3]", danger: "hover:bg-[#faf0f0] hover:text-[#a83232]" };

  return (
    <aside className={`w-72 flex-shrink-0 border-r flex flex-col ${c.panel} ${c.border}`}>
      <div className={`h-12 px-4 flex items-center justify-between border-b ${c.border}`}>
        <div className="flex items-center gap-2">
          <Bookmark size={14} strokeWidth={1.8} className={c.muted} />
          <span className={`text-xs font-semibold ${c.text}`}>
            Bookmarks ({bookmarks.length})
          </span>
        </div>
        <button
          onClick={onClose}
          className={`w-7 h-7 rounded-md flex items-center justify-center ${c.hover} ${c.muted}`}
        >
          <X size={14} strokeWidth={1.8} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {bookmarks.length > 0 ? (
          [...bookmarks]
            .sort((a, b) => a.page - b.page)
            .map((bm) => (
              <div
                key={bm.id}
                className={`group flex items-center gap-2 p-2 rounded-md mb-1 cursor-pointer ${c.hover}`}
                onClick={() => onJump(bm.page)}
              >
                <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 border ${c.border}`}>
                  <span className={`text-[10px] font-semibold tabular-nums ${c.text}`}>
                    {bm.page}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs truncate ${c.text}`}>{bm.label}</p>
                  <p className={`text-[10px] ${c.muted}`}>
                    {new Date(bm.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(bm.id);
                  }}
                  className={`w-6 h-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${c.danger}`}
                >
                  <Trash2 size={11} strokeWidth={1.8} />
                </button>
              </div>
            ))
        ) : (
          <p className={`text-xs p-4 ${c.muted}`}>
            No bookmarks yet. Click the bookmark icon in the header to save the current page.
          </p>
        )}
      </div>
    </aside>
  );
}


// ---------------------------------------------------------------------------
// Keyboard shortcuts modal
// ---------------------------------------------------------------------------
function KeyboardHelpModal({ isDark, onClose }) {
  const c = isDark
    ? { panel: "bg-[#161b22]", border: "border-[#30363d]", text: "text-[#e6edf3]", muted: "text-[#8b949e]", kbd: "bg-[#21262d] border-[#30363d] text-[#e6edf3]" }
    : { panel: "bg-white", border: "border-[#e8dfd3]", text: "text-[#2a1f14]", muted: "text-[#8a7965]", kbd: "bg-[#faf7f3] border-[#e8dfd3] text-[#5c1a1a]" };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#2a1f14]/40 animate-qa-fade-slide"
        onClick={onClose}
      />
      <div className={`relative rounded-lg border max-w-md w-full p-6 animate-qa-fade-slide ${c.panel} ${c.border}`}>
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-md border flex items-center justify-center flex-shrink-0 ${c.border} ${c.kbd}`}>
              <Keyboard size={15} strokeWidth={1.8} />
            </div>
            <div>
              <h3 className={`text-base font-semibold ${c.text}`}>Keyboard Shortcuts</h3>
              <p className={`text-xs mt-0.5 ${c.muted}`}>Speed up your reading</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-md flex items-center justify-center ${c.kbd}`}
          >
            <X size={14} strokeWidth={1.8} />
          </button>
        </div>

        <div className="space-y-1.5">
          {SHORTCUTS.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 py-1.5"
            >
              <span className={`text-sm ${c.text}`}>{sc.description}</span>
              <div className="flex items-center gap-1">
                {sc.keys.map((key, j) => (
                  <kbd
                    key={j}
                    className={`inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-md border text-[11px] font-mono font-medium ${c.kbd}`}
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className={`text-[11px] mt-5 pt-4 border-t ${c.border} ${c.muted}`}>
          Tip: Shortcuts are disabled while typing in an input field.
        </p>
      </div>
    </div>
  );
}


// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
function BookReader({ book, onBack }) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(0.9);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [outline, setOutline] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [showToc, setShowToc] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [jumpInput, setJumpInput] = useState("");
  const [showJumpInput, setShowJumpInput] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [readingSeconds, setReadingSeconds] = useState(0);
  const [bookmarkLabel, setBookmarkLabel] = useState("");
  const [showBookmarkPrompt, setShowBookmarkPrompt] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // Animation state
  const [slideDirection, setSlideDirection] = useState("right");
  const [pageKey, setPageKey] = useState(0);

  const saveTimerRef = useRef(null);
  const isMountedRef = useRef(true);
  const containerRef = useRef(null);
  const pdfDocRef = useRef(null);
  const chromeTimerRef = useRef(null);
  const sessionStartRef = useRef(Date.now());


  // -------------------------------------------------------------------------
  // Init
  // -------------------------------------------------------------------------
  useEffect(() => {
    isMountedRef.current = true;
    if (!book?.id) return;

    setBookmarks(loadBookmarks(book.id));
    const stats = loadReadingStats(book.id);
    const today = todayKey();
    setReadingSeconds(stats.daily[today] || 0);

    const match = window.location.hash.match(/page=(\d+)/);
    const initialPage = match ? parseInt(match[1], 10) : (book.current_page || 1);
    setPageNumber(Math.max(1, initialPage));

    updateLastOpened(book.id).catch((err) =>
      console.error("Failed to update last opened:", err)
    );

    return () => {
      isMountedRef.current = false;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (chromeTimerRef.current) clearTimeout(chromeTimerRef.current);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      const sessionSeconds = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      const freshStats = loadReadingStats(book.id);
      const day = todayKey();
      freshStats.totalSeconds = (freshStats.totalSeconds || 0) + sessionSeconds;
      freshStats.daily[day] = (freshStats.daily[day] || 0) + sessionSeconds;
      saveReadingStats(book.id, freshStats);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book?.id]);


  // -------------------------------------------------------------------------
  // Session timer
  // -------------------------------------------------------------------------
  useEffect(() => {
    const id = setInterval(() => {
      if (isMountedRef.current) setReadingSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);


  // -------------------------------------------------------------------------
  // Deep link sync
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window !== "undefined") {
      const newHash = `#page=${pageNumber}`;
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, "", newHash);
      }
    }
  }, [pageNumber]);


  // -------------------------------------------------------------------------
  // Auto-hide chrome
  // -------------------------------------------------------------------------
  const resetChromeTimer = useCallback(() => {
    setChromeVisible(true);
    if (chromeTimerRef.current) clearTimeout(chromeTimerRef.current);
    chromeTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) setChromeVisible(false);
    }, CHROME_HIDE_DELAY);
  }, []);

  useEffect(() => {
    resetChromeTimer();
    const onActivity = () => resetChromeTimer();
    window.addEventListener("mousemove", onActivity);
    window.addEventListener("mousedown", onActivity);
    window.addEventListener("touchstart", onActivity);
    window.addEventListener("keydown", onActivity);
    return () => {
      window.removeEventListener("mousemove", onActivity);
      window.removeEventListener("mousedown", onActivity);
      window.removeEventListener("touchstart", onActivity);
      window.removeEventListener("keydown", onActivity);
    };
  }, [resetChromeTimer]);


  // -------------------------------------------------------------------------
  // PDF loaded
  // -------------------------------------------------------------------------
  const onDocumentLoadSuccess = async (pdf) => {
    pdfDocRef.current = pdf;
    setNumPages(pdf.numPages);

    try {
      const rawOutline = await pdf.getOutline();
      if (rawOutline) {
        const resolvedOutline = await Promise.all(
          rawOutline.map(async (item) => {
            let pageNumber = null;
            if (item.dest) {
              try {
                const dest =
                  typeof item.dest === "string"
                    ? await pdf.getDestination(item.dest)
                    : item.dest;
                if (dest && Array.isArray(dest) && dest[0]) {
                  const pageIndex = await pdf.getPageIndex(dest[0]);
                  pageNumber = pageIndex + 1;
                }
              } catch (err) {
                console.warn("Failed to resolve outline dest:", err);
              }
            }
            return {
              title: item.title,
              pageNumber,
              items: await Promise.all(
                (item.items || []).map(async (child) => {
                  let childPage = null;
                  if (child.dest) {
                    try {
                      const d =
                        typeof child.dest === "string"
                          ? await pdf.getDestination(child.dest)
                          : child.dest;
                      if (d && Array.isArray(d) && d[0]) {
                        const pi = await pdf.getPageIndex(d[0]);
                        childPage = pi + 1;
                      }
                    } catch {}
                  }
                  return { title: child.title, pageNumber: childPage, items: [] };
                })
              ),
            };
          })
        );
        setOutline(resolvedOutline);
      }
    } catch (err) {
      console.warn("No outline available:", err);
    }
  };


  // -------------------------------------------------------------------------
  // Prefetch neighbors
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!pdfDocRef.current || !numPages) return;

    const preload = async (page) => {
      if (page < 1 || page > numPages) return;
      try {
        await pdfDocRef.current.getPage(page);
      } catch {
        /* silent */
      }
    };

    preload(pageNumber + 1);
    preload(pageNumber - 1);
  }, [pageNumber, numPages]);


  // -------------------------------------------------------------------------
  // Progress saving
  // -------------------------------------------------------------------------
  const saveProgress = useCallback(
    async (page) => {
      if (!book?.id) return;
      setSavingProgress(true);
      try {
        await updateProgress(book.id, page);
        if (isMountedRef.current) setLastSaved(new Date());
      } catch (err) {
        console.error("Failed to save progress:", err);
      } finally {
        if (isMountedRef.current) setTimeout(() => setSavingProgress(false), 400);
      }
    },
    [book?.id]
  );

  const scheduleProgressSave = useCallback(
    (page) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => saveProgress(page), 500);
    },
    [saveProgress]
  );


  // -------------------------------------------------------------------------
  // Navigation with animation
  // -------------------------------------------------------------------------
  const previousPage = () => {
    if (pageNumber > 1) {
      const newPage = pageNumber - 1;
      setSlideDirection("left");
      setPageNumber(newPage);
      setPageKey((k) => k + 1);
      scheduleProgressSave(newPage);
    }
  };

  const nextPage = () => {
    if (pageNumber < numPages) {
      const newPage = pageNumber + 1;
      setSlideDirection("right");
      setPageNumber(newPage);
      setPageKey((k) => k + 1);
      scheduleProgressSave(newPage);
    }
  };

  const goToPage = (target) => {
    const page = Math.max(1, Math.min(numPages, target));
    setSlideDirection(page > pageNumber ? "right" : "left");
    setPageNumber(page);
    setPageKey((k) => k + 1);
    scheduleProgressSave(page);
    setShowJumpInput(false);
    setJumpInput("");
    setShowToc(false);
    setShowBookmarks(false);
  };


  // -------------------------------------------------------------------------
  // Zoom
  // -------------------------------------------------------------------------
  const zoomIn = () => setScale((s) => Math.min(MAX_SCALE, s + SCALE_STEP));
  const zoomOut = () => setScale((s) => Math.max(MIN_SCALE, s - SCALE_STEP));
  const resetZoom = () => setScale(0.9);


  // -------------------------------------------------------------------------
  // Fullscreen
  // -------------------------------------------------------------------------
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) await containerRef.current?.requestFullscreen();
      else await document.exitFullscreen();
    } catch (err) {
      console.error("Fullscreen toggle failed:", err);
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);


  // -------------------------------------------------------------------------
  // Bookmarks
  // -------------------------------------------------------------------------
  const handleAddBookmark = () => {
    setBookmarkLabel(`Page ${pageNumber}`);
    setShowBookmarkPrompt(true);
  };

  const confirmAddBookmark = () => {
    const label = bookmarkLabel.trim() || `Page ${pageNumber}`;
    const newBookmark = {
      id: `bm_${Date.now()}`,
      page: pageNumber,
      label,
      createdAt: new Date().toISOString(),
    };
    const updated = [...bookmarks, newBookmark];
    setBookmarks(updated);
    saveBookmarks(book.id, updated);
    setShowBookmarkPrompt(false);
    setBookmarkLabel("");
  };

  const deleteBookmark = (id) => {
    const updated = bookmarks.filter((b) => b.id !== id);
    setBookmarks(updated);
    saveBookmarks(book.id, updated);
  };


  // -------------------------------------------------------------------------
  // Keyboard shortcuts
  // -------------------------------------------------------------------------
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if (e.key === "ArrowLeft") previousPage();
      else if (e.key === "ArrowRight") nextPage();
      else if (e.key === "Escape") {
        setShowSearch(false);
        setShowToc(false);
        setShowBookmarks(false);
        setShowKeyboardHelp(false);
      } else if (e.key === "+" || e.key === "=") zoomIn();
      else if (e.key === "-") zoomOut();
      else if (e.key === "0") resetZoom();
      else if (e.key === "/") {
        e.preventDefault();
        setShowSearch(true);
      } else if (e.key.toLowerCase() === "b") handleAddBookmark();
      else if (e.key.toLowerCase() === "t") setShowToc((v) => !v);
      else if (e.key === "?") setShowKeyboardHelp((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, numPages, showSearch]);


  // -------------------------------------------------------------------------
  // Theme colors
  // -------------------------------------------------------------------------
  const c = useMemo(() => {
    if (theme === "dark") {
      return {
        page: "bg-[#0d1117]",
        chrome: "bg-[#161b22]",
        panel: "bg-[#161b22]",
        border: "border-[#30363d]",
        text: "text-[#e6edf3]",
        textMuted: "text-[#8b949e]",
        textDim: "text-[#6e7681]",
        accent: "text-[#e6edf3]",
        accentBg: "bg-[#21262d]",
        subtle: "bg-[#21262d]",
        hover: "hover:bg-[#21262d]",
        button: "bg-[#21262d] hover:bg-[#2d333b] text-[#e6edf3] border-transparent",
        buttonPrimary: "bg-[#e6edf3] text-[#0d1117] hover:bg-[#c9d1d9]",
        buttonDisabled: "bg-[#21262d] text-[#6e7681] cursor-not-allowed",
        bar: "bg-[#e6edf3]",
        barTrack: "bg-[#21262d]",
      };
    }
    if (theme === "sepia") {
      return {
        page: "bg-[#f4ecd8]",
        chrome: "bg-[#ebe0c8]",
        panel: "bg-[#f9f3e3]",
        border: "border-[#d9cba8]",
        text: "text-[#3a2a15]",
        textMuted: "text-[#8a7350]",
        textDim: "text-[#a89880]",
        accent: "text-[#6b4a1a]",
        accentBg: "bg-[#f9f3e3]",
        subtle: "bg-[#ebe0c8]",
        hover: "hover:bg-[#e8dcc2]",
        button: "bg-[#f9f3e3] border border-[#d9cba8] text-[#5a4a2a] hover:border-[#6b4a1a]/40 hover:text-[#6b4a1a]",
        buttonPrimary: "bg-[#6b4a1a] text-[#f9f3e3] hover:bg-[#553a12]",
        buttonDisabled: "bg-[#ebe0c8] text-[#a89880] cursor-not-allowed",
        bar: "bg-[#6b4a1a]",
        barTrack: "bg-[#ebe0c8]",
      };
    }
    return {
      page: "bg-[#f7f3ee]",
      chrome: "bg-[#faf7f3]",
      panel: "bg-white",
      border: "border-[#e8dfd3]",
      text: "text-[#2a1f14]",
      textMuted: "text-[#8a7965]",
      textDim: "text-[#a89880]",
      accent: "text-[#5c1a1a]",
      accentBg: "bg-[#faf7f3]",
      subtle: "bg-[#f0e9e0]",
      hover: "hover:bg-[#f0e9e0]",
      button: "bg-white border border-[#e8dfd3] text-[#5a4a3a] hover:border-[#5c1a1a]/40 hover:text-[#5c1a1a]",
      buttonPrimary: "bg-[#5c1a1a] text-white hover:bg-[#4a1414]",
      buttonDisabled: "bg-[#f0e9e0] text-[#a89880] cursor-not-allowed",
      bar: "bg-[#5c1a1a]",
      barTrack: "bg-[#f0e9e0]",
    };
  }, [theme]);

  const cycleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : t === "dark" ? "sepia" : "light"));
  };

  const progress = numPages > 0 ? Math.round((pageNumber / numPages) * 100) : 0;
  const isDark = theme === "dark" || theme === "sepia";

  const headerClass = `h-16 border-b flex items-center justify-between px-3 sm:px-6 transition-all duration-500 flex-shrink-0 ${c.chrome} ${c.border} ${
    chromeVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
  }`;

  const footerClass = `relative z-50 border-t transition-all duration-500 flex-shrink-0 ${c.chrome} ${c.border} ${
    chromeVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
  }`;


  return (
    <div
      ref={containerRef}
      className={`min-h-screen flex flex-col transition-colors duration-300 ${c.page}`}
    >
      {/* Header */}
      <header className={headerClass}>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onBack}
            aria-label="Back"
            className={`w-9 h-9 rounded-md border flex items-center justify-center transition-colors flex-shrink-0 ${c.button}`}
          >
            <ArrowLeft size={16} strokeWidth={1.8} />
          </button>

          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className={`hidden sm:flex w-9 h-9 rounded-md border items-center justify-center flex-shrink-0 ${c.border} ${c.accentBg}`}>
              <BookOpen size={15} strokeWidth={1.8} className={c.accent} />
            </div>
            <div className="min-w-0">
              <h1 className={`text-xs sm:text-sm font-semibold truncate ${c.text}`}>
                {book?.title}
              </h1>
              <p className={`text-[10px] sm:text-[11px] flex items-center gap-1.5 mt-0.5 ${c.textMuted}`}>
                <Clock size={9} strokeWidth={1.8} />
                {formatDuration(readingSeconds)} today
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {numPages > 0 && (
            <div className="hidden md:flex items-center gap-3 mr-2">
              <div className={`w-24 h-1 rounded-full overflow-hidden ${c.barTrack}`}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${c.bar}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className={`text-[11px] font-medium tabular-nums ${c.textMuted}`}>
                {progress}%
              </span>
            </div>
          )}

          <button
            onClick={() => {
              setShowToc((v) => !v);
              setShowBookmarks(false);
            }}
            aria-label="Table of contents"
            title="Table of Contents (T)"
            className={`w-9 h-9 rounded-md border flex items-center justify-center transition-colors ${
              showToc ? c.buttonPrimary : c.button
            }`}
          >
            <List size={15} strokeWidth={1.8} />
          </button>

          <button
            onClick={() => {
              setShowBookmarks((v) => !v);
              setShowToc(false);
            }}
            aria-label="Bookmarks"
            title="Bookmarks"
            className={`w-9 h-9 rounded-md border flex items-center justify-center transition-colors ${
              showBookmarks ? c.buttonPrimary : c.button
            }`}
          >
            <Bookmark size={15} strokeWidth={1.8} />
          </button>

          <button
            onClick={handleAddBookmark}
            aria-label="Add bookmark"
            title="Add bookmark (B)"
            className={`hidden sm:flex w-9 h-9 rounded-md border items-center justify-center transition-colors ${c.button}`}
          >
            <BookmarkPlus size={15} strokeWidth={1.8} />
          </button>

          <button
            onClick={() => setShowSearch(true)}
            aria-label="Search"
            title="Search (/)"
            className={`hidden sm:flex w-9 h-9 rounded-md border items-center justify-center transition-colors ${c.button}`}
          >
            <Search size={15} strokeWidth={1.8} />
          </button>

          <button
            onClick={cycleTheme}
            aria-label="Change theme"
            title={`Theme: ${theme}`}
            className={`w-9 h-9 rounded-md border flex items-center justify-center transition-colors ${c.button}`}
          >
            {theme === "dark" ? <Sun size={15} strokeWidth={1.8} /> :
             theme === "sepia" ? <Moon size={15} strokeWidth={1.8} /> :
             <Coffee size={15} strokeWidth={1.8} />}
          </button>

          <button
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            className={`hidden sm:flex w-9 h-9 rounded-md border items-center justify-center transition-colors ${c.button}`}
          >
            {isFullscreen ? <Minimize2 size={15} strokeWidth={1.8} /> : <Maximize2 size={15} strokeWidth={1.8} />}
          </button>

          {/* Keyboard help */}
          <button
            onClick={() => setShowKeyboardHelp(true)}
            aria-label="Keyboard shortcuts"
            title="Keyboard shortcuts (?)"
            className={`hidden sm:flex w-9 h-9 rounded-md border items-center justify-center transition-colors ${c.button}`}
          >
            <Keyboard size={15} strokeWidth={1.8} />
          </button>

          <button
            aria-label="More options"
            className={`hidden sm:flex w-9 h-9 rounded-md border items-center justify-center transition-colors ${c.button}`}
          >
            <MoreVertical size={15} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      {/* Search bar */}
      {showSearch && (
        <div className={`border-b px-3 sm:px-6 py-2 sm:py-3 flex items-center gap-2 animate-qa-fade-slide ${c.chrome} ${c.border}`}>
          <Search size={14} strokeWidth={1.8} className={c.textMuted} />
          <input
            autoFocus
            type="text"
            placeholder="Search in book… (Esc to close)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setShowSearch(false)}
            className={`flex-1 bg-transparent outline-none text-sm ${c.text} placeholder-[#a89880]`}
          />
          <button
            onClick={() => {
              setShowSearch(false);
              setSearchQuery("");
            }}
            className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${c.hover} ${c.textMuted}`}
          >
            <X size={14} strokeWidth={1.8} />
          </button>
        </div>
      )}

      {/* Reader + sidebars */}
      <main className={`flex-1 flex overflow-hidden transition-colors duration-300 ${c.page}`}>
        {showToc && (
          <TocSidebar
            outline={outline}
            pageNumber={pageNumber}
            onJump={goToPage}
            isDark={isDark}
            onClose={() => setShowToc(false)}
          />
        )}
        {showBookmarks && (
          <BookmarksSidebar
            bookmarks={bookmarks}
            onJump={goToPage}
            onDelete={deleteBookmark}
            isDark={isDark}
            onClose={() => setShowBookmarks(false)}
          />
        )}

        <div className="flex-1 flex items-start sm:items-center justify-center p-2 sm:p-6 overflow-hidden relative">
          <div className={`relative overflow-auto rounded-lg border w-full max-w-5xl h-full flex items-start sm:items-center justify-center ${c.panel} ${c.border}`}>
            <Document
              file={book.signed_url}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex flex-col items-center justify-center p-12">
                  <div className={`w-10 h-10 border-2 rounded-full animate-spin ${
                    isDark ? "border-[#30363d] border-t-[#e6edf3]" : "border-[#e8dfd3] border-t-[#5c1a1a]"
                  }`} />
                  <p className={`mt-5 text-sm ${c.textMuted}`}>Loading PDF…</p>
                </div>
              }
              className="flex items-start sm:items-center justify-center w-full h-full p-3 sm:p-4"
            >
              {/* Animated page wrapper */}
              <div
                key={pageKey}
                className={
                  slideDirection === "right"
                    ? "animate-page-in-right"
                    : "animate-page-in-left"
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="shadow-sm max-w-full"
                  loading={
                    <div className="flex flex-col items-center justify-center p-8">
                      <div className={`w-8 h-8 border-2 rounded-full animate-spin ${
                        isDark ? "border-[#30363d] border-t-[#e6edf3]" : "border-[#e8dfd3] border-t-[#5c1a1a]"
                      }`} />
                    </div>
                  }
                />
              </div>
            </Document>
          </div>

          {/* Floating keyboard help button (bottom-right) */}
          <button
            onClick={() => setShowKeyboardHelp(true)}
            aria-label="Keyboard shortcuts"
            title="Keyboard shortcuts (?)"
            className={`absolute bottom-4 right-4 w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 shadow-sm hover:scale-105 ${c.button} ${
              chromeVisible ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <HelpCircle size={16} strokeWidth={1.8} />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className={footerClass}>
        <div className="sm:hidden px-3 py-2.5 flex items-center justify-between gap-2">
          <button
            onClick={previousPage}
            disabled={pageNumber <= 1}
            className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors ${
              pageNumber <= 1 ? c.buttonDisabled : c.button
            }`}
          >
            <ChevronLeft size={16} strokeWidth={1.8} />
          </button>

          <button
            onClick={() => setShowJumpInput(true)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition-colors ${c.border} ${c.accentBg}`}
          >
            <span className={`text-[10px] uppercase tracking-[0.08em] ${c.textMuted}`}>Page</span>
            <span className={`text-sm font-semibold tabular-nums ${c.text}`}>{pageNumber}</span>
            <span className={`text-[10px] uppercase ${c.textMuted}`}>/</span>
            <span className={`text-xs tabular-nums ${c.textMuted}`}>{numPages || "…"}</span>
          </button>

          <button
            onClick={nextPage}
            disabled={pageNumber >= numPages}
            className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors ${
              pageNumber >= numPages ? c.buttonDisabled : c.buttonPrimary
            }`}
          >
            <ChevronRight size={16} strokeWidth={1.8} />
          </button>
        </div>

        <div className="hidden sm:flex h-20 items-center justify-center">
          <div className="flex items-center gap-3 md:gap-5 flex-wrap justify-center px-4">
            <button
              onClick={previousPage}
              disabled={pageNumber <= 1}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                pageNumber <= 1 ? c.buttonDisabled : c.button
              }`}
            >
              <ChevronLeft size={14} strokeWidth={1.8} />
              <span>Previous</span>
            </button>

            <div className={`text-sm font-medium flex items-center gap-2.5 ${c.textMuted}`}>
              <span className="text-[11px] tracking-[0.08em] uppercase">Page</span>
              {showJumpInput ? (
                <input
                  autoFocus
                  type="number"
                  min={1}
                  max={numPages}
                  value={jumpInput}
                  onChange={(e) => setJumpInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") goToPage(parseInt(jumpInput, 10) || pageNumber);
                    if (e.key === "Escape") {
                      setShowJumpInput(false);
                      setJumpInput("");
                    }
                  }}
                  onBlur={() => {
                    setShowJumpInput(false);
                    setJumpInput("");
                  }}
                  className={`w-16 px-2.5 py-1 rounded-md text-sm font-semibold tabular-nums border text-center outline-none focus:border-[#5c1a1a] ${c.border} ${c.accentBg} ${c.text}`}
                />
              ) : (
                <button
                  onClick={() => setShowJumpInput(true)}
                  className={`px-2.5 py-1 rounded-md text-sm font-semibold tabular-nums border transition-colors ${c.border} ${c.accentBg} ${c.text} ${c.hover}`}
                >
                  {pageNumber}
                </button>
              )}
              <span className="text-[11px] tracking-[0.08em] uppercase">of</span>
              <span className={`font-semibold tabular-nums ${c.text}`}>{numPages || "…"}</span>
            </div>

            <button
              onClick={nextPage}
              disabled={pageNumber >= numPages}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                pageNumber >= numPages ? c.buttonDisabled : c.buttonPrimary
              }`}
            >
              <span>Next</span>
              <ChevronRight size={14} strokeWidth={1.8} />
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={zoomOut}
                disabled={scale <= MIN_SCALE}
                className={`w-9 h-9 rounded-md border flex items-center justify-center transition-colors ${
                  scale <= MIN_SCALE ? c.buttonDisabled : c.button
                }`}
              >
                <ZoomOut size={14} strokeWidth={1.8} />
              </button>

              <button
                onClick={resetZoom}
                className={`text-xs font-medium min-w-[52px] text-center tabular-nums transition-colors ${c.textMuted} ${c.hover} px-1 py-1 rounded`}
              >
                {Math.round(scale * 100)}%
              </button>

              <button
                onClick={zoomIn}
                disabled={scale >= MAX_SCALE}
                className={`w-9 h-9 rounded-md border flex items-center justify-center transition-colors ${
                  scale >= MAX_SCALE ? c.buttonDisabled : c.button
                }`}
              >
                <ZoomIn size={14} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </div>

        {showJumpInput && (
          <div className={`sm:hidden absolute bottom-full left-0 right-0 border-t p-3 flex items-center gap-2 animate-qa-fade-slide ${c.chrome} ${c.border}`}>
            <span className={`text-[11px] uppercase tracking-[0.08em] ${c.textMuted}`}>Go to</span>
            <input
              autoFocus
              type="number"
              min={1}
              max={numPages}
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") goToPage(parseInt(jumpInput, 10) || pageNumber);
                if (e.key === "Escape") {
                  setShowJumpInput(false);
                  setJumpInput("");
                }
              }}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-semibold tabular-nums border outline-none focus:border-[#5c1a1a] ${c.border} ${c.accentBg} ${c.text}`}
            />
            <button
              onClick={() => goToPage(parseInt(jumpInput, 10) || pageNumber)}
              className={`w-10 h-10 rounded-md flex items-center justify-center ${c.buttonPrimary}`}
            >
              <Check size={15} strokeWidth={2} />
            </button>
            <button
              onClick={() => {
                setShowJumpInput(false);
                setJumpInput("");
              }}
              className={`w-10 h-10 rounded-md border flex items-center justify-center ${c.button}`}
            >
              <X size={15} strokeWidth={1.8} />
            </button>
          </div>
        )}
      </footer>

      {/* Bookmark prompt modal */}
      {showBookmarkPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#2a1f14]/40 animate-qa-fade-slide"
            onClick={() => setShowBookmarkPrompt(false)}
          />
          <div className={`relative rounded-lg border max-w-md w-full p-6 animate-qa-fade-slide ${c.panel} ${c.border}`}>
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-9 h-9 rounded-md border flex items-center justify-center flex-shrink-0 ${c.border} ${c.accentBg}`}>
                <BookmarkPlus size={15} strokeWidth={1.8} className={c.accent} />
              </div>
              <div>
                <h3 className={`text-base font-semibold ${c.text}`}>Add Bookmark</h3>
                <p className={`text-xs mt-0.5 ${c.textMuted}`}>Page {pageNumber}</p>
              </div>
            </div>

            <input
              autoFocus
              type="text"
              value={bookmarkLabel}
              onChange={(e) => setBookmarkLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmAddBookmark();
                if (e.key === "Escape") setShowBookmarkPrompt(false);
              }}
              placeholder="Label (optional)"
              className={`w-full px-3 py-2.5 rounded-md text-sm border outline-none focus:border-[#5c1a1a] mb-4 ${c.border} ${c.accentBg} ${c.text}`}
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowBookmarkPrompt(false)}
                className={`flex-1 px-4 py-2.5 rounded-md border text-sm font-medium transition-colors ${c.button}`}
              >
                Cancel
              </button>
              <button
                onClick={confirmAddBookmark}
                className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${c.buttonPrimary}`}
              >
                Save Bookmark
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard help modal */}
      {showKeyboardHelp && (
        <KeyboardHelpModal
          isDark={isDark}
          onClose={() => setShowKeyboardHelp(false)}
        />
      )}
    </div>
  );
}

export default BookReader;