import { useEffect, useState, useRef } from "react";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Brain,
  BarChart3,
  BookOpen,
  Send,
  CheckCircle2,
  TrendingUp,
  UploadCloud,
  FileText,
  User,
  Bot,
} from "lucide-react";

function FeatureCarousel() {
  const slides = [
    {
      title: "AI Chat with Your Notes",
      desc: "Ask questions and get grounded answers directly from your study material using RAG-based retrieval.",
      icon: MessageSquare,
      accent: "rose",
      gradient: "from-rose-500 to-amber-500",
      bgGradient: "from-rose-50 to-amber-50/60",
      color: "text-rose-600",
      preview: "chat",
    },
    {
      title: "Smart Quiz Generator",
      desc: "Automatically generate MCQs from your notes and test your understanding instantly.",
      icon: Brain,
      accent: "blue",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50/60",
      color: "text-blue-600",
      preview: "quiz",
    },
    {
      title: "Performance Analytics",
      desc: "Track weak topics and improve your learning efficiency with AI insights.",
      icon: BarChart3,
      accent: "purple",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50/60",
      color: "text-purple-600",
      preview: "chart",
    },
    {
      title: "Upload & Index Notes",
      desc: "Upload markdown notes and let AI structure and index them instantly.",
      icon: BookOpen,
      accent: "emerald",
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50/60",
      color: "text-emerald-600",
      preview: "upload",
    },
  ];

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);

  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const touchStartTime = useRef(null);

  const nextSlide = () => setIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setIndex((prev) => (prev - 1 + slides.length) % slides.length);

  // DETECT MOBILE VIEWPORT
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // AUTO ROTATION (logic preserved — paused on mobile when user is swiping)
  useEffect(() => {
    if (paused || isSwiping) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [paused, isSwiping]);

  // KEYBOARD SUPPORT (logic preserved)
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // ================= MOBILE SWIPE HANDLERS =================
  const handleTouchStart = (e) => {
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
    touchStartTime.current = Date.now();
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;

    const t = e.changedTouches[0];
    const deltaX = t.clientX - touchStartX.current;
    const deltaY = t.clientY - touchStartY.current;
    const deltaTime = Date.now() - touchStartTime.current;

    const SWIPE_THRESHOLD = 50;    // minimum horizontal distance
    const MAX_TIME = 600;          // must be a quick swipe
    const MAX_VERTICAL = 80;       // reject if mostly vertical scroll

    const isHorizontalSwipe =
      Math.abs(deltaX) > SWIPE_THRESHOLD &&
      Math.abs(deltaX) > Math.abs(deltaY) &&
      Math.abs(deltaY) < MAX_VERTICAL &&
      deltaTime < MAX_TIME;

    if (isHorizontalSwipe) {
      if (deltaX < 0) nextSlide();
      else prevSlide();
    }

    touchStartX.current = null;
    touchStartY.current = null;
    touchStartTime.current = null;
  };

  // Prevent text selection highlight while dragging on mobile
  const handleTouchMove = (e) => {
    if (touchStartX.current === null) return;
    const t = e.touches[0];
    const deltaX = Math.abs(t.clientX - touchStartX.current);
    if (deltaX > 10) setIsSwiping(true);
  };

  // Reset swiping flag after touch ends
  useEffect(() => {
    if (isSwiping) {
      const t = setTimeout(() => setIsSwiping(false), 300);
      return () => clearTimeout(t);
    }
  }, [isSwiping]);

  const currentSlide = slides[index];

  // ---------- Mock UI Previews ----------
  const renderPreview = (type, color) => {
    if (type === "chat") {
      return (
        <div className="w-full max-w-sm space-y-3">
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm border border-rose-100 text-xs text-gray-600">
              What is Retrieval-Augmented Generation?
            </div>
          </div>
          <div className="flex items-start gap-2 justify-end">
            <div className="bg-gradient-to-br from-rose-500 to-amber-500 text-white rounded-2xl rounded-tr-sm px-3 py-2 shadow-sm text-xs max-w-[85%]">
              RAG combines retrieval with generation — it fetches relevant notes first, then answers…
            </div>
            <div className="w-7 h-7 rounded-full bg-white border border-rose-200 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-rose-500" />
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/80 rounded-full border border-rose-200 px-3 py-2 shadow-sm">
            <span className="text-[10px] text-gray-400 flex-1">Ask about your notes…</span>
            <Send className="w-3.5 h-3.5 text-rose-500" />
          </div>
        </div>
      );
    }

    if (type === "quiz") {
      const options = [
        { text: "Retrieval-Augmented Generation", correct: true },
        { text: "Rapid API Gateway", correct: false },
        { text: "Random Access Grammar", correct: false },
      ];
      return (
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-blue-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide">
              Question 1 of 5
            </span>
            <span className="text-[10px] text-gray-400">AI Generated</span>
          </div>
          <p className="text-xs font-medium text-gray-700 mb-3">
            What does RAG stand for in AI?
          </p>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 text-[11px] px-3 py-2 rounded-lg border ${
                  opt.correct
                    ? "bg-blue-50 border-blue-300 text-blue-700 font-medium"
                    : "bg-gray-50 border-gray-200 text-gray-500"
                }`}
              >
                {opt.correct ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-gray-300" />
                )}
                {opt.text}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (type === "chart") {
      const bars = [40, 65, 30, 80, 55, 90, 70];
      return (
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-purple-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] text-gray-400">Weekly Accuracy</p>
              <p className="text-sm font-bold text-purple-600">+18.4%</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
              <TrendingUp className="w-3 h-3" />
              Improving
            </div>
          </div>
          <div className="flex items-end justify-between gap-1.5 h-24">
            {bars.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-md bg-gradient-to-t from-purple-500 to-pink-400"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[9px] text-gray-400">
            <span>Mon</span>
            <span>Sun</span>
          </div>
        </div>
      );
    }

    if (type === "upload") {
      return (
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-emerald-100 p-4">
          <div className="border-2 border-dashed border-emerald-200 rounded-xl p-5 text-center mb-3">
            <UploadCloud className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-medium text-gray-700">Drop your notes here</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Markdown, PDF, or TXT</p>
          </div>
          <div className="space-y-2">
            {["dbms-notes.md", "os-chapter-3.md"].map((name, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-emerald-50/60 rounded-lg px-3 py-2"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] text-gray-600 flex-1">{name}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="w-full py-16 md:py-20 relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-72 md:w-96 h-72 md:h-96 bg-rose-200/20 rounded-full blur-3xl top-20 left-10" />
        <div className="absolute w-64 md:w-80 h-64 md:h-80 bg-amber-200/20 rounded-full blur-3xl bottom-20 right-10" />
      </div>

      {/* HEADING */}
      <div className="text-center mb-8 md:mb-10 px-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-rose-100/80 to-amber-100/80 backdrop-blur-sm border border-rose-200/30 text-rose-700 text-xs font-medium mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Features
        </div>
        <h2 className="text-2xl md:text-4xl font-bold text-gray-800">
          Powerful Features Built for{" "}
          <span className="bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
            Students
          </span>
        </h2>
        <p className="text-gray-500 mt-3 max-w-2xl mx-auto text-xs md:text-sm">
          Everything you need to learn faster with AI assistance
        </p>
      </div>

      {/* CAROUSEL */}
      <div className="relative w-full max-w-5xl mx-auto px-4 md:px-6 z-10">
        {/* LEFT ARROW — hidden on mobile (swipe instead) */}
        <button
          onClick={prevSlide}
          aria-label="Previous slide"
          className="
            hidden md:flex
            absolute left-2 md:-left-4 top-1/2 -translate-y-1/2 z-20
            w-11 h-11 rounded-full
            bg-white/90 backdrop-blur-sm hover:bg-white
            border border-rose-200/40
            text-gray-600 hover:text-rose-600
            shadow-lg shadow-rose-100/30
            transition-all duration-300 hover:scale-105
            items-center justify-center
          "
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* RIGHT ARROW — hidden on mobile */}
        <button
          onClick={nextSlide}
          aria-label="Next slide"
          className="
            hidden md:flex
            absolute right-2 md:-right-4 top-1/2 -translate-y-1/2 z-20
            w-11 h-11 rounded-full
            bg-white/90 backdrop-blur-sm hover:bg-white
            border border-rose-200/40
            text-gray-600 hover:text-rose-600
            shadow-lg shadow-rose-100/30
            transition-all duration-300 hover:scale-105
            items-center justify-center
          "
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* SLIDES — touch handlers attached only here */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="
            relative overflow-hidden rounded-3xl
            shadow-xl shadow-rose-100/30
            border border-rose-200/30
            bg-white/80 backdrop-blur-sm
            touch-pan-y overscroll-x-contain
            select-none md:select-auto
          "
          style={{
            // prevents pull-to-refresh hijack on iOS while swiping horizontally
            overscrollBehaviorX: "contain",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <div
            className={`
              flex ease-in-out
              ${isMobile ? "transition-transform duration-400" : "transition-transform duration-700"}
            `}
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {slides.map((item, i) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={i}
                  className="min-w-full flex flex-col md:flex-row items-stretch"
                >
                  {/* CONTENT — stacked on mobile, split on desktop */}
                  <div className="md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
                    <div
                      className={`inline-flex w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${item.bgGradient} items-center justify-center mb-4 md:mb-5 shadow-sm border border-white`}
                    >
                      <IconComponent
                        className={`w-6 h-6 md:w-7 md:h-7 ${item.color}`}
                        strokeWidth={2.2}
                      />
                    </div>

                    <h3 className="text-xl md:text-[1.75rem] font-bold text-gray-800 mb-2.5 md:mb-3 leading-tight">
                      {item.title}
                    </h3>

                    <p className="text-gray-500 leading-relaxed text-[13px] md:text-[0.95rem]">
                      {item.desc}
                    </p>

                    <div
                      className={`mt-4 md:mt-6 h-1 w-12 md:w-14 rounded-full bg-gradient-to-r ${item.gradient}`}
                    />
                  </div>

                  {/* PREVIEW — full width below on mobile, half on desktop */}
                  <div className="md:w-1/2 px-6 pb-6 md:p-8 flex items-center justify-center">
                    <div
                      className={`w-full rounded-2xl bg-gradient-to-br ${item.bgGradient} border border-white/60 p-4 md:p-5 flex items-center justify-center min-h-[260px] md:min-h-[320px]`}
                    >
                      {renderPreview(item.preview, item.color)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dots + Counter — bigger tap targets on mobile */}
        <div className="flex items-center justify-center gap-4 mt-5 md:mt-6">
          <div className="flex gap-1 md:gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="relative flex items-center justify-center w-9 h-9 md:w-auto md:h-auto"
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    i === index
                      ? `h-2 w-7 md:w-8 bg-gradient-to-r ${slides[i].gradient}`
                      : "h-2 w-2 bg-rose-200/60"
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-[11px] text-gray-400 font-medium tabular-nums">
            {index + 1} / {slides.length}
          </span>
        </div>

        {/* Swipe hint — mobile only, fades after first swipe */}
        {isMobile && index === 0 && (
          <p className="md:hidden text-center text-[11px] text-gray-400/80 mt-3 animate-pulse">
            ← Swipe to explore →
          </p>
        )}
      </div>
    </div>
  );
}

export default FeatureCarousel;