import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Zap,
  Brain,
  BookOpen,
  Target,
  TrendingUp,
  Rocket,
  Shield,
  Users,
  ArrowRight,
  Lightbulb,
} from "lucide-react";

/* ============================================================
   useInView
   ============================================================ */
function useInView(options = { threshold: 0.2, once: true }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (options.once) observer.unobserve(el);
        } else if (!options.once) {
          setInView(false);
        }
      },
      { threshold: options.threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [options.threshold, options.once]);

  return [ref, inView];
}

/* ============================================================
   AnimatedCounter
   ============================================================ */
function AnimatedCounter({ value, duration = 1400 }) {
  const [display, setDisplay] = useState("0");
  const [ref, inView] = useInView({ threshold: 0.4, once: true });

  useEffect(() => {
    if (!inView) return;

    const match = String(value).match(/^([\d.]+)(.*)$/);
    if (!match) {
      setDisplay(String(value));
      return;
    }
    const target = parseFloat(match[1]);
    const suffix = match[2] || "";
    const isFloat = match[1].includes(".");

    const start = performance.now();
    let raf;

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = target * eased;
      setDisplay(
        (isFloat ? current.toFixed(1) : Math.floor(current).toString()) + suffix
      );
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return <span ref={ref}>{display}</span>;
}

function About() {
  const features = [
    { icon: Brain,      title: "AI-Powered Learning",     desc: "Retrieval-Augmented Generation provides accurate answers from your own study materials." },
    { icon: Target,     title: "Personalized Insights",   desc: "Identify weak topics and get tailored recommendations to improve your understanding." },
    { icon: TrendingUp, title: "Performance Analytics",   desc: "Track your progress with detailed analytics and measure your learning efficiency." },
    { icon: BookOpen,   title: "Smart Quiz Generation",   desc: "Auto-generate MCQs from your notes and test your knowledge instantly." },
  ];

  const stats = [
    { value: "100K+", label: "Questions Answered", icon: Zap },
    { value: "50K+",  label: "Students Active",    icon: Users },
    { value: "95%",   label: "Accuracy Rate",      icon: Shield },
    { value: "4.9",   label: "User Rating",        icon: Sparkles },
  ];

  const [leftRef, leftInView]   = useInView({ threshold: 0.2 });
  const [rightRef, rightInView] = useInView({ threshold: 0.15 });
  const [statsRef, statsInView] = useInView({ threshold: 0.2 });

  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="about" className="relative z-10 max-w-7xl mx-auto px-6 py-28">
      <div className="grid lg:grid-cols-2 gap-14 items-center relative">

        {/* LEFT - Image */}
        <div
          ref={leftRef}
          className={`relative transition-all duration-700 ease-out ${
            leftInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="relative overflow-hidden rounded-lg border border-[#e8dfd3] bg-white">
            <img
              src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80"
              alt="Student studying with books and laptop"
              className="w-full h-[420px] object-cover will-change-transform"
              style={{
                transform: `translateY(${Math.min(scrollY * 0.02, 12)}px)`,
              }}
            />

            {/* Badge - AI Powered */}
            <div className="absolute bottom-4 right-4 bg-white border border-[#e8dfd3] rounded-md px-3 py-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#5c1a1a] flex items-center justify-center">
                  <Rocket size={12} strokeWidth={1.8} className="text-white" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#2a1f14] leading-tight">
                    AI Powered
                  </p>
                  <p className="text-[9px] tracking-[0.12em] uppercase text-[#8a7965]">
                    RAG_V2
                  </p>
                </div>
              </div>
            </div>

            {/* Badge - Rating */}
            <div className="absolute top-4 left-4 bg-white border border-[#e8dfd3] rounded-md px-3 py-1.5">
              <div className="flex items-center gap-1.5">
                <Sparkles size={12} strokeWidth={1.8} className="text-[#5c1a1a]" />
                <span className="text-[11px] font-semibold text-[#2a1f14]">4.9</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT - Content */}
        <div
          ref={rightRef}
          className={`relative transition-all duration-700 ease-out ${
            rightInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <p className="text-[11px] tracking-[0.14em] uppercase text-[#8a7965] mb-3 inline-flex items-center gap-2">
            <Sparkles size={12} strokeWidth={1.8} className="text-[#5c1a1a]" />
            About RAG_V2
          </p>

          <h2 className="text-3xl md:text-4xl font-bold text-[#2a1f14] leading-tight">
            Building a Smarter Way to Learn with AI
          </h2>

          <p className="mt-6 text-[#6a5a48] leading-7 text-sm">
            RAG_V2 is an AI-powered learning platform designed to make studying
            more interactive, personalized, and efficient. Instead of relying on
            generic AI responses, it uses Retrieval-Augmented Generation (RAG)
            to answer questions directly from your own study notes, providing
            accurate and context-aware assistance.
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className={`bg-white border border-[#e8dfd3] rounded-md p-3 transition-all duration-500 ${
                    rightInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  }`}
                  style={{ transitionDelay: rightInView ? `${150 + idx * 100}ms` : "0ms" }}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center flex-shrink-0">
                      <Icon size={14} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-[#2a1f14]">
                        {feature.title}
                      </p>
                      <p className="text-[10px] text-[#8a7965] leading-relaxed line-clamp-2">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Vision Card */}
          <div
            className={`mt-6 rounded-lg bg-white border border-[#e8dfd3] p-5 transition-all duration-500 ${
              rightInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
            style={{ transitionDelay: rightInView ? "550ms" : "0ms" }}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center flex-shrink-0">
                <Lightbulb size={16} strokeWidth={1.8} className="text-[#5c1a1a]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#2a1f14] mb-1.5 flex items-center gap-2">
                  <Rocket size={13} strokeWidth={1.8} className="text-[#5c1a1a]" />
                  Vision
                </h3>
                <p className="text-[#6a5a48] leading-6 text-xs">
                  The long-term vision is to build an intelligent study companion
                  that adapts to every learner. By combining AI, personalized
                  knowledge retrieval, and performance analytics, RAG_V2 aims to
                  transform static notes into an interactive learning ecosystem.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Link */}
          <button
            className={`mt-6 text-[#5c1a1a] hover:text-[#4a1414] text-sm font-medium flex items-center gap-2 group transition-all duration-500 ${
              rightInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
            style={{ transitionDelay: rightInView ? "700ms" : "0ms" }}
          >
            Learn more about RAG_V2
            <ArrowRight
              size={14}
              strokeWidth={1.8}
              className="group-hover:translate-x-1 transition-transform duration-200"
            />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div ref={statsRef} className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 relative">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`bg-white border border-[#e8dfd3] rounded-lg p-6 text-center transition-all duration-500 ${
                statsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
              style={{ transitionDelay: statsInView ? `${idx * 120}ms` : "0ms" }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Icon size={15} strokeWidth={1.8} className="text-[#5c1a1a]" />
                <span className="text-xl md:text-2xl font-bold text-[#2a1f14] tabular-nums">
                  <AnimatedCounter value={stat.value} />
                </span>
              </div>
              <p className="text-[11px] tracking-[0.1em] uppercase text-[#8a7965] font-medium">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Bottom divider */}
      <div className="mt-16 flex justify-center">
        <div className="w-32 h-px bg-[#e8dfd3]" />
      </div>
    </section>
  );
}

export default About;