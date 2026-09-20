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

/* ============================================================
   SLIDE DATA
   ============================================================ */
const SLIDES = [
  {
    title: "AI Chat with Your Notes",
    desc: "Ask questions and get grounded answers directly from your study material using RAG-based retrieval.",
    icon: MessageSquare,
    preview: "chat",
  },
  {
    title: "Smart Quiz Generator",
    desc: "Automatically generate MCQs from your notes and test your understanding instantly.",
    icon: Brain,
    preview: "quiz",
  },
  {
    title: "Performance Analytics",
    desc: "Track weak topics and improve your learning efficiency with AI insights.",
    icon: BarChart3,
    preview: "chart",
  },
  {
    title: "Upload & Index Notes",
    desc: "Upload markdown notes and let AI structure and index them instantly.",
    icon: BookOpen,
    preview: "upload",
  },
];

/* ============================================================
   CAROUSEL
   ============================================================ */
function FeatureCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [touchedOnce, setTouchedOnce] = useState(false);

  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const touchStartTime = useRef(null);

  const nextSlide = () => setIndex((prev) => (prev + 1) % SLIDES.length);
  const prevSlide = () => setIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (paused || isSwiping) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [paused, isSwiping]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const handleTouchStart = (e) => {
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
    touchStartTime.current = Date.now();
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === null) return;
    const t = e.touches[0];
    const deltaX = Math.abs(t.clientX - touchStartX.current);
    if (deltaX > 10) setIsSwiping(true);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const t = e.changedTouches[0];
    const deltaX = t.clientX - touchStartX.current;
    const deltaY = t.clientY - touchStartY.current;
    const deltaTime = Date.now() - touchStartTime.current;

    const SWIPE_THRESHOLD = 50;
    const MAX_TIME = 600;
    const MAX_VERTICAL = 80;

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
    setTouchedOnce(true);
  };

  useEffect(() => {
    if (!isSwiping) return;
    const t = setTimeout(() => setIsSwiping(false), 300);
    return () => clearTimeout(t);
  }, [isSwiping]);

  return (
    <div
      className="w-full py-16 md:py-20 relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Section header */}
      <div className="text-center mb-8 md:mb-10 px-6 relative z-10">
        <p className="text-[11px] tracking-[0.14em] uppercase text-[#8a7965] mb-3 inline-flex items-center gap-2">
          <Sparkles size={12} strokeWidth={1.8} className="text-[#5c1a1a]" />
          Features
        </p>
        <h2 className="text-2xl md:text-4xl font-bold text-[#2a1f14]">
          Powerful Features Built for Students
        </h2>
        <p className="text-[#6a5a48] mt-3 max-w-2xl mx-auto text-xs md:text-sm">
          Everything you need to learn faster with AI assistance
        </p>
      </div>

      {/* Carousel */}
      <div className="relative w-full max-w-5xl mx-auto px-4 md:px-6 z-10">
        {/* Nav buttons */}
        <button
          onClick={prevSlide}
          aria-label="Previous slide"
          className="hidden md:flex absolute left-0 md:-left-6 top-1/2 -translate-y-1/2 z-20
                     w-10 h-10 items-center justify-center
                     bg-transparent border-0
                     text-[#a89880] hover:text-[#5c1a1a]
                     transition-colors duration-200
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5c1a1a]/40 rounded-full"
        >
          <ChevronLeft size={22} strokeWidth={1.8} />
        </button>

        <button
          onClick={nextSlide}
          aria-label="Next slide"
          className="hidden md:flex absolute right-0 md:-right-6 top-1/2 -translate-y-1/2 z-20
                     w-10 h-10 items-center justify-center
                     bg-transparent border-0
                     text-[#a89880] hover:text-[#5c1a1a]
                     transition-colors duration-200
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5c1a1a]/40 rounded-full"
        >
          <ChevronRight size={22} strokeWidth={1.8} />
        </button>

        {/* Viewport */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative overflow-hidden rounded-lg
                     border border-[#e8dfd3]
                     bg-white
                     touch-pan-y overscroll-x-contain
                     select-none md:select-auto"
          style={{
            overscrollBehaviorX: "contain",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <div
            className={`flex ease-out ${
              isMobile ? "transition-transform duration-400" : "transition-transform duration-700"
            }`}
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {SLIDES.map((item, i) => {
              const IconComponent = item.icon;
              const isActive = i === index;

              return (
                <div key={i} className="min-w-full flex flex-col md:flex-row items-stretch">
                  {/* Text side */}
                  <div className="md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
                    <div className="w-10 h-10 rounded-md border border-[#e8dfd3] bg-[#faf7f3]
                                    flex items-center justify-center mb-5">
                      <IconComponent size={18} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    </div>

                    <h3 className="text-xl md:text-[1.75rem] font-bold text-[#2a1f14] mb-3 leading-tight">
                      {item.title}
                    </h3>

                    <p className="text-[#6a5a48] leading-relaxed text-[13px] md:text-[0.95rem]">
                      {item.desc}
                    </p>

                    <div className="mt-6 h-px w-14 bg-[#e8dfd3]" />
                  </div>

                  {/* Preview side */}
                  <div className="md:w-1/2 px-6 pb-6 md:p-8 flex items-center justify-center">
                    <div className="w-full rounded-md
                                    bg-[#faf7f3]
                                    border border-[#e8dfd3]
                                    p-4 md:p-5
                                    flex items-center justify-center
                                    min-h-[260px] md:min-h-[320px]">
                      <div key={`${item.preview}-${isActive}`} className="w-full flex justify-center">
                        {renderPreview(item.preview, isActive)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="flex gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="relative flex items-center justify-center w-9 h-9 md:w-auto md:h-auto"
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    i === index
                      ? "h-2 w-7 md:w-8 bg-[#5c1a1a]"
                      : "h-2 w-2 bg-[#c9bda9]"
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-[11px] text-[#8a7965] font-medium tabular-nums">
            {index + 1} / {SLIDES.length}
          </span>
        </div>

        {/* Mobile hint */}
        {isMobile && index === 0 && !touchedOnce && (
          <p className="md:hidden text-center text-[11px] text-[#a89880] mt-3">
            Swipe to explore
          </p>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   PREVIEW ROUTER
   ============================================================ */
function renderPreview(type, active) {
  if (type === "chat") return <ChatPreview active={active} />;
  if (type === "quiz") return <QuizPreview active={active} />;
  if (type === "chart") return <ChartPreview active={active} />;
  if (type === "upload") return <UploadPreview active={active} />;
  return null;
}

/* ============================================================
   CHAT PREVIEW
   ============================================================ */
function ChatPreview({ active }) {
  const userText = "What is Retrieval-Augmented Generation?";
  const aiText =
    "RAG combines retrieval with generation — it fetches relevant notes first, then answers.";

  const [userChars, setUserChars] = useState(0);
  const [aiChars, setAiChars] = useState(0);
  const [phase, setPhase] = useState("idle");

  useEffect(() => {
    if (!active) {
      setUserChars(0);
      setAiChars(0);
      setPhase("idle");
      return;
    }

    let cancelled = false;
    const timers = [];

    const wait = (ms) =>
      new Promise((res) => {
        const t = setTimeout(res, ms);
        timers.push(t);
      });

    const run = async () => {
      while (!cancelled) {
        setUserChars(0);
        setAiChars(0);
        setPhase("typingUser");
        await wait(300);

        for (let i = 1; i <= userText.length; i++) {
          if (cancelled) return;
          setUserChars(i);
          await wait(28);
        }

        setPhase("thinking");
        await wait(700);

        setPhase("typingAI");
        for (let i = 1; i <= aiText.length; i++) {
          if (cancelled) return;
          setAiChars(i);
          await wait(14);
        }

        setPhase("done");
        await wait(2200);
      }
    };

    run();

    return () => {
      cancelled = true;
      timers.forEach((t) => clearTimeout(t));
    };
  }, [active]);

  const isTypingUser = phase === "typingUser" && userChars < userText.length;
  const isThinking = phase === "thinking";
  const isTypingAI = phase === "typingAI" && aiChars < aiText.length;
  const showAi = aiChars > 0 || phase === "done";

  return (
    <div className="w-full max-w-sm space-y-3">
      <div className="flex items-start gap-2">
        <div className="w-7 h-7 rounded-md border border-[#e8dfd3] bg-white
                        flex items-center justify-center flex-shrink-0">
          <User size={13} strokeWidth={1.8} className="text-[#5c1a1a]" />
        </div>
        <div className="bg-white rounded-md px-3 py-2
                        border border-[#e8dfd3]
                        text-xs text-[#3a2a1a] min-h-[32px]">
          {userText.slice(0, userChars)}
          {isTypingUser && (
            <span className="inline-block w-[2px] h-3 bg-[#5c1a1a] ml-[1px] align-middle animate-caret" />
          )}
        </div>
      </div>

      {showAi && (
        <div className="flex items-start gap-2 justify-end">
          <div className="bg-[#5c1a1a] text-white rounded-md
                          px-3 py-2 text-xs
                          max-w-[85%] min-h-[32px]">
            {isThinking && (
              <span className="inline-flex gap-1 items-center h-3">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="w-1 h-1 rounded-full bg-white/80 animate-dot"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </span>
            )}
            {!isThinking && aiText.slice(0, aiChars)}
            {isTypingAI && (
              <span className="inline-block w-[2px] h-3 bg-white ml-[1px] align-middle animate-caret" />
            )}
          </div>
          <div className="w-7 h-7 rounded-md border border-[#e8dfd3] bg-white
                          flex items-center justify-center flex-shrink-0">
            <Bot size={13} strokeWidth={1.8} className="text-[#5c1a1a]" />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 bg-white rounded-md
                      border border-[#e8dfd3] px-3 py-2">
        <span className="text-[10px] text-[#a89880] flex-1">
          Ask about your notes...
        </span>
        <Send
          size={13}
          strokeWidth={1.8}
          className={`text-[#5c1a1a] transition-transform ${
            phase === "done" ? "scale-110" : ""
          }`}
        />
      </div>
    </div>
  );
}

/* ============================================================
   QUIZ PREVIEW
   ============================================================ */
function QuizPreview({ active }) {
  const options = [
    { text: "Retrieval-Augmented Generation", correct: true },
    { text: "Rapid API Gateway", correct: false },
    { text: "Random Access Grammar", correct: false },
  ];

  const [visible, setVisible] = useState([false, false, false]);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!active) {
      setVisible([false, false, false]);
      setRevealed(false);
      return;
    }

    let loop;
    const timers = [];

    const runCycle = () => {
      setVisible([false, false, false]);
      setRevealed(false);

      options.forEach((_, i) => {
        const t = setTimeout(() => {
          setVisible((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, 250 + i * 260);
        timers.push(t);
      });

      const reveal = setTimeout(
        () => setRevealed(true),
        250 + options.length * 260 + 500
      );
      timers.push(reveal);
    };

    runCycle();
    loop = setInterval(runCycle, 5500);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(loop);
    };
  }, [active]);

  return (
    <div className="w-full max-w-sm bg-white rounded-md border border-[#e8dfd3] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-semibold text-[#5c1a1a] uppercase tracking-[0.12em]">
          Question 1 of 5
        </span>
        <span className="text-[10px] text-[#a89880]">AI Generated</span>
      </div>

      <p className="text-xs font-medium text-[#3a2a1a] mb-3">
        What does RAG stand for in AI?
      </p>

      <div className="space-y-2">
        {options.map((opt, i) => {
          const isVisible = visible[i];
          const isHighlighted = revealed && opt.correct;

          return (
            <div
              key={i}
              className={`flex items-center gap-2 text-[11px] px-3 py-2 rounded-md border
                          transition-all duration-300
                          ${
                            isHighlighted
                              ? "bg-[#faf7f3] border-[#5c1a1a] text-[#2a1f14] font-medium"
                              : "bg-[#faf7f3] border-[#e8dfd3] text-[#8a7965]"
                          }
                          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`}
            >
              {isHighlighted ? (
                <CheckCircle2 size={13} strokeWidth={2} className="text-[#5c1a1a]" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-[#c9bda9]" />
              )}
              {opt.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   CHART PREVIEW
   ============================================================ */
function ChartPreview({ active }) {
  const bars = [40, 65, 30, 80, 55, 90, 70];
  const [mounted, setMounted] = useState(false);
  const [countedValue, setCountedValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setMounted(false);
      setCountedValue(0);
      return;
    }
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, [active]);

  useEffect(() => {
    if (!mounted) return;
    let current = 0;
    const target = 18.4;
    const step = target / 30;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      setCountedValue(current);
    }, 30);
    return () => clearInterval(timer);
  }, [mounted]);

  return (
    <div className="w-full max-w-sm bg-white rounded-md border border-[#e8dfd3] p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.1em] text-[#8a7965]">
            Weekly Accuracy
          </p>
          <p className="text-sm font-bold text-[#2a1f14] tabular-nums">
            +{countedValue.toFixed(1)}%
          </p>
        </div>
        <div
          className={`flex items-center gap-1 text-[10px] text-[#5c1a1a] font-medium
                      transition-opacity duration-500 ${
                        mounted ? "opacity-100" : "opacity-0"
                      }`}
        >
          <TrendingUp size={11} strokeWidth={1.8} />
          Improving
        </div>
      </div>

      <div className="flex items-end justify-between gap-1.5 h-24">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm bg-[#5c1a1a] origin-bottom
                       transition-transform duration-700 ease-out"
            style={{
              height: `${h}%`,
              transform: mounted ? "scaleY(1)" : "scaleY(0)",
              transitionDelay: `${i * 70}ms`,
            }}
          />
        ))}
      </div>

      <div className="flex justify-between mt-2 text-[9px] text-[#a89880]">
        <span>Mon</span>
        <span>Sun</span>
      </div>
    </div>
  );
}

/* ============================================================
   UPLOAD PREVIEW
   ============================================================ */
function UploadPreview({ active }) {
  const files = ["dbms-notes.md", "os-chapter-3.md"];
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!active) {
      setVisibleCount(0);
      return;
    }
    const timers = files.map((_, i) =>
      setTimeout(() => setVisibleCount(i + 1), 500 + i * 400)
    );
    return () => timers.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="w-full max-w-sm bg-white rounded-md border border-[#e8dfd3] p-4">
      <div className="border border-dashed border-[#d9cdba] rounded-md
                      p-5 text-center mb-3">
        <UploadCloud size={22} strokeWidth={1.8} className="text-[#8a7965] mx-auto mb-2" />
        <p className="text-xs font-medium text-[#3a2a1a]">
          Drop your notes here
        </p>
        <p className="text-[10px] text-[#a89880] mt-0.5">
          Markdown, PDF, or TXT
        </p>
      </div>

      <div className="space-y-2">
        {files.map((name, i) => {
          const isVisible = i < visibleCount;
          return (
            <div
              key={i}
              className={`flex items-center gap-2 bg-[#faf7f3] border border-[#e8dfd3]
                          rounded-md px-3 py-2
                          transition-all duration-500 ${
                            isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                          }`}
            >
              <FileText size={13} strokeWidth={1.8} className="text-[#5c1a1a]" />
              <span className="text-[11px] text-[#3a2a1a] flex-1">{name}</span>
              <CheckCircle2
                size={13}
                strokeWidth={2}
                className={`text-[#5c1a1a] ${isVisible ? "" : "opacity-0"}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FeatureCarousel;