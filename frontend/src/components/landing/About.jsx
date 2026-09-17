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

// ============================================================
// Hook: useInView
// Triggers animations when an element enters the viewport.
// ============================================================
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

// ============================================================
// AnimatedCounter - parses "100K+", "95%", "4.9" and counts up
// ============================================================
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
    {
      icon: Brain,
      title: "AI-Powered Learning",
      desc: "Retrieval-Augmented Generation provides accurate answers from your own study materials.",
      color: "from-rose-500 to-amber-500",
      bgColor: "bg-rose-50/50",
      iconColor: "text-rose-600",
    },
    {
      icon: Target,
      title: "Personalized Insights",
      desc: "Identify weak topics and get tailored recommendations to improve your understanding.",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50/50",
      iconColor: "text-blue-600",
    },
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      desc: "Track your progress with detailed analytics and measure your learning efficiency.",
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50/50",
      iconColor: "text-emerald-600",
    },
    {
      icon: BookOpen,
      title: "Smart Quiz Generation",
      desc: "Auto-generate MCQs from your notes and test your knowledge instantly.",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50/50",
      iconColor: "text-purple-600",
    },
  ];

  const stats = [
    { value: "100K+", label: "Questions Answered", icon: Zap },
    { value: "50K+", label: "Students Active", icon: Users },
    { value: "95%", label: "Accuracy Rate", icon: Shield },
    { value: "4.9", label: "User Rating", icon: Sparkles },
  ];

  const [leftRef, leftInView] = useInView({ threshold: 0.2 });
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
      {/* Decorative elements - drifting orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-96 h-96 bg-rose-200/10 rounded-full blur-3xl top-20 right-20 animate-about-float" />
        <div
          className="absolute w-80 h-80 bg-amber-200/10 rounded-full blur-3xl bottom-20 left-20 animate-about-float"
          style={{ animationDelay: "1.2s" }}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-14 items-center relative">
        {/* LEFT - Image */}
        <div
          ref={leftRef}
          className={`relative group transition-all duration-1000 ease-out ${
            leftInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-sm border border-rose-200/30 shadow-2xl shadow-rose-100/20">
            <img
              src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80"
              alt="Student studying with books and laptop"
              className="w-full h-[420px] object-cover transition duration-700 group-hover:scale-105 will-change-transform"
              style={{
                transform: `translateY(${Math.min(scrollY * 0.02, 12)}px)`,
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-rose-500/10 to-transparent" />

            {/* Floating badge - AI Powered */}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-rose-200/30 shadow-lg animate-badge-float">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-rose-500 to-amber-500 flex items-center justify-center">
                  <Rocket className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-800">
                    AI Powered
                  </p>
                  <p className="text-[8px] text-gray-400">RAG_V2</p>
                </div>
              </div>
            </div>

            {/* Floating badge - Rating */}
            <div
              className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-amber-200/30 shadow-lg animate-badge-float"
              style={{ animationDelay: "0.8s" }}
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-sparkle-soft" />
                <span className="text-[11px] font-semibold text-gray-800">
                  4.9
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT - Content */}
        <div
          ref={rightRef}
          className={`relative transition-all duration-1000 ease-out ${
            rightInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-100/80 to-amber-100/80 backdrop-blur-sm border border-rose-200/30 text-rose-700 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            About RAG_V2
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
            Building a{" "}
            <span className="bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
              Smarter Way
            </span>{" "}
            to Learn with AI
          </h2>

          <p className="mt-6 text-gray-500 leading-7 text-sm">
            RAG_V2 is an AI-powered learning platform designed to make studying
            more interactive, personalized, and efficient. Instead of relying on
            generic AI responses, it uses Retrieval-Augmented Generation (RAG)
            to answer questions directly from your own study notes, providing
            accurate and context-aware assistance.
          </p>

          {/* Feature Grid - staggered reveal */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className={`${feature.bgColor} backdrop-blur-sm rounded-xl p-3 border border-rose-200/20 group hover:shadow-lg transition-all duration-500 hover:-translate-y-0.5 ${
                  rightInView
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-3"
                }`}
                style={{
                  transitionDelay: rightInView ? `${150 + idx * 100}ms` : "0ms",
                }}
              >
                <div className="flex items-start gap-2">
                  <div
                    className={`p-1.5 rounded-lg bg-gradient-to-br ${feature.color} bg-opacity-10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                  >
                    <feature.icon className={`w-4 h-4 ${feature.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-gray-800">
                      {feature.title}
                    </p>
                    <p className="text-[10px] text-gray-400 line-clamp-2">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Vision Card */}
          <div
            className={`mt-6 rounded-2xl bg-gradient-to-r from-rose-50/80 to-amber-50/80 backdrop-blur-sm border border-rose-200/30 p-6 shadow-lg shadow-rose-100/20 transition-all duration-700 ${
              rightInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{
              transitionDelay: rightInView ? "550ms" : "0ms",
            }}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-rose-100 to-amber-100 rounded-xl flex-shrink-0 animate-icon-breathe">
                <Lightbulb className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-rose-500" />
                  Vision
                </h3>
                <p className="text-gray-500 leading-6 text-xs">
                  The long-term vision is to build an intelligent study
                  companion that adapts to every learner. By combining AI,
                  personalized knowledge retrieval, and performance analytics,
                  RAG_V2 aims to transform static notes into an interactive
                  learning ecosystem.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Link */}
          <button
            className={`mt-6 text-rose-600 hover:text-rose-700 text-sm font-medium flex items-center gap-2 group transition-all duration-700 ${
              rightInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            }`}
            style={{ transitionDelay: rightInView ? "700ms" : "0ms" }}
          >
            Learn more about RAG_V2
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div
        ref={statsRef}
        className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-rose-100/20 to-amber-100/20 rounded-3xl blur-2xl" />

        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-rose-200/30 shadow-lg shadow-rose-100/10 hover:shadow-xl hover:shadow-rose-100/20 transition-all duration-500 hover:-translate-y-1 ${
              statsInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{
              transitionDelay: statsInView ? `${idx * 120}ms` : "0ms",
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <stat.icon className="w-5 h-5 text-rose-500" />
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent tabular-nums">
                <AnimatedCounter value={stat.value} />
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Bottom decorative line */}
      <div className="mt-16 flex justify-center gap-4 opacity-40">
        <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-rose-300 to-transparent rounded-full animate-line-shimmer" />
        <div
          className="w-8 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent rounded-full animate-line-shimmer"
          style={{ animationDelay: "0.4s" }}
        />
        <div
          className="w-32 h-0.5 bg-gradient-to-r from-transparent via-orange-300 to-transparent rounded-full animate-line-shimmer"
          style={{ animationDelay: "0.8s" }}
        />
      </div>
    </section>
  );
}

export default About;