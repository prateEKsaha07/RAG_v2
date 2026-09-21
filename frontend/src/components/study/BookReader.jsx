import { useState, useEffect } from "react";
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
} from "lucide-react";

import {
  updateProgress,
  updateLastOpened,
} from "../../api/bookApi";

function BookReader({ book, onBack }) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(book?.current_page || 1);
  const [scale, setScale] = useState(0.9);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const previousPage = async () => {
    if (pageNumber > 1) {
      const newPage = pageNumber - 1;
      setPageNumber(newPage);
      await updateProgress(newPage);
    }
  };

  const nextPage = async () => {
    if (pageNumber < numPages) {
      const newPage = pageNumber + 1;
      setPageNumber(newPage);
      await updateProgress(book.id, newPage);
    }
  };

  const zoomIn = () => setScale(scale + 0.2);

  const zoomOut = () => {
    if (scale > 0.6) setScale(scale - 0.2);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    updateLastOpened(book.id);
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  }, []);

  const progress = numPages > 0 ? Math.round((pageNumber / numPages) * 100) : 0;

  const c = isDarkMode
    ? {
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
        button: "bg-[#21262d] hover:bg-[#2d333b] text-[#e6edf3]",
        buttonPrimary: "bg-[#e6edf3] text-[#0d1117] hover:bg-[#c9d1d9]",
        buttonDisabled: "bg-[#21262d] text-[#6e7681] cursor-not-allowed",
        bar: "bg-[#e6edf3]",
        barTrack: "bg-[#21262d]",
      }
    : {
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

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${c.page}`}>

      {/* Header */}
      <header className={`h-16 border-b flex items-center justify-between px-4 sm:px-6 transition-colors duration-300 ${c.chrome} ${c.border}`}>
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            aria-label="Back"
            className={`w-9 h-9 rounded-md border flex items-center justify-center transition-colors flex-shrink-0 ${c.button}`}
          >
            <ArrowLeft size={16} strokeWidth={1.8} />
          </button>

          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-md border flex items-center justify-center flex-shrink-0 ${c.border} ${c.accentBg}`}>
              <BookOpen size={15} strokeWidth={1.8} className={c.accent} />
            </div>
            <div className="min-w-0">
              <h1 className={`text-sm font-semibold truncate transition-colors duration-300 ${c.text}`}>
                {book?.title}
              </h1>
              <p className={`text-[11px] flex items-center gap-1.5 mt-0.5 transition-colors duration-300 ${c.textMuted}`}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${isDarkMode ? "bg-[#e6edf3]" : "bg-[#5c1a1a]"}`} />
                Study Reader
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
            aria-label="Search"
            className={`w-9 h-9 rounded-md border flex items-center justify-center transition-colors ${c.button}`}
          >
            <Search size={15} strokeWidth={1.8} />
          </button>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label={isDarkMode ? "Light mode" : "Dark mode"}
            className={`w-9 h-9 rounded-md border flex items-center justify-center transition-colors ${c.button}`}
          >
            {isDarkMode
              ? <Sun size={15} strokeWidth={1.8} />
              : <Moon size={15} strokeWidth={1.8} />}
          </button>

          <button
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            className={`w-9 h-9 rounded-md border flex items-center justify-center transition-colors ${c.button}`}
          >
            {isFullscreen
              ? <Minimize2 size={15} strokeWidth={1.8} />
              : <Maximize2 size={15} strokeWidth={1.8} />}
          </button>

          <button
            aria-label="More options"
            className={`w-9 h-9 rounded-md border flex items-center justify-center transition-colors ${c.button}`}
          >
            <MoreVertical size={15} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      {/* Reader */}
      <main className={`flex-1 flex items-center justify-center p-4 sm:p-6 overflow-hidden transition-colors duration-300 ${c.page}`}>
        <div className={`relative overflow-auto rounded-lg border w-full max-w-5xl h-full flex items-center justify-center transition-colors duration-300 ${c.panel} ${c.border}`}>
          <Document
            file={book.signed_url}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex flex-col items-center justify-center p-12">
                <div className={`w-10 h-10 border-2 rounded-full animate-spin ${isDarkMode ? "border-[#30363d] border-t-[#e6edf3]" : "border-[#e8dfd3] border-t-[#5c1a1a]"}`} />
                <p className={`mt-5 text-sm ${c.textMuted}`}>
                  Loading PDF...
                </p>
              </div>
            }
            className="flex items-center justify-center w-full h-full p-4"
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="shadow-sm"
              loading={
                <div className="flex flex-col items-center justify-center p-8">
                  <div className={`w-8 h-8 border-2 rounded-full animate-spin ${isDarkMode ? "border-[#30363d] border-t-[#e6edf3]" : "border-[#e8dfd3] border-t-[#5c1a1a]"}`} />
                  <p className={`mt-3 text-xs ${c.textMuted}`}>
                    Loading page...
                  </p>
                </div>
              }
            />
          </Document>
        </div>
      </main>

      {/* Footer */}
      <footer className={`relative z-50 h-20 border-t flex items-center justify-center transition-colors duration-300 ${c.chrome} ${c.border}`}>
        <div className="flex items-center gap-3 md:gap-5 flex-wrap justify-center px-4">
          <button
            onClick={previousPage}
            disabled={pageNumber <= 1}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
              pageNumber <= 1 ? c.buttonDisabled : c.button
            }`}
          >
            <ChevronLeft size={14} strokeWidth={1.8} />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className={`text-sm font-medium flex items-center gap-2.5 ${c.textMuted}`}>
            <span className="text-[11px] tracking-[0.08em] uppercase">Page</span>
            <span className={`px-2.5 py-1 rounded-md text-sm font-semibold tabular-nums border ${c.border} ${c.accentBg} ${c.text}`}>
              {pageNumber}
            </span>
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
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={14} strokeWidth={1.8} />
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={zoomOut}
              disabled={scale <= 0.6}
              aria-label="Zoom out"
              className={`w-9 h-9 rounded-md border flex items-center justify-center transition-colors ${
                scale <= 0.6 ? c.buttonDisabled + " border-transparent" : c.button
              }`}
            >
              <ZoomOut size={14} strokeWidth={1.8} />
            </button>

            <span className={`text-xs font-medium min-w-[52px] text-center tabular-nums ${c.textMuted}`}>
              {Math.round(scale * 100)}%
            </span>

            <button
              onClick={zoomIn}
              aria-label="Zoom in"
              className={`w-9 h-9 rounded-md border flex items-center justify-center transition-colors ${c.button}`}
            >
              <ZoomIn size={14} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default BookReader;