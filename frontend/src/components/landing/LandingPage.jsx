import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import AboutContact from "./AboutContact";
import Footer from "../common/Footer";
import Navbar from "../common/Navbar";
import FeatureCarousel from "./FeatureCarousel";
import About from "./About";
import NoticePopup from "./NoticePopup";
import {
  Sparkles,
  ArrowRight,
  MessageCircle,
  Brain,
  BarChart3,
  Target,
  TrendingUp,
  Rocket,
  GraduationCap,
  Upload,
  Award,
  Clock,
} from "lucide-react";

/* ---------- Reusable full-screen section wrapper ---------- */
const FullScreenSection = ({
  id,
  children,
  className = "",
  reduceMotion,
  bg = "transparent",
}) => {
  return (
    <section
      id={id}
      className={`relative min-h-screen w-full flex items-center justify-center
                  px-6 py-20 overflow-hidden ${className}`}
      style={{ backgroundColor: bg }}
    >
      <motion.div
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full flex items-center justify-center"
      >
        {children}
      </motion.div>
    </section>
  );
};

/* ---------- Typewriter for "RAG_V2" ---------- */
function Typewriter({
  text = "RAG_V2",
  speed = 90,
  delay = 400,
  reduceMotion = false,
}) {
  const [displayed, setDisplayed] = useState(reduceMotion ? text : "");
  const [done, setDone] = useState(reduceMotion);

  useEffect(() => {
    if (reduceMotion) {
      setDisplayed(text);
      setDone(true);
      return;
    }

    let i = 0;
    let timeoutId;

    const startTimeout = setTimeout(() => {
      const tick = () => {
        i += 1;
        setDisplayed(text.slice(0, i));
        if (i < text.length) {
          timeoutId = setTimeout(tick, speed);
        } else {
          setDone(true);
        }
      };
      tick();
    }, delay);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(timeoutId);
    };
  }, [text, speed, delay, reduceMotion]);

  return (
    <span className="inline-flex items-baseline">
      <span className="bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
        {displayed}
      </span>
      {/* Blinking cursor — hides after typing completes */}
      {!done && (
        <span className="inline-block w-[3px] h-[0.9em] ml-1 align-baseline
                         bg-gradient-to-b from-rose-500 to-amber-500
                         animate-caret" />
      )}
    </span>
  );
}

function LandingPage({ onGetStarted, onHome }) {
  const reduceMotion = useReducedMotion();
  const [activeSection, setActiveSection] = useState("home");

  const features = [
    {
      icon: Upload,
      title: "Smart Notes Upload",
      desc: "Upload markdown notes and turn them into AI searchable knowledge.",
      color: "from-rose-500 to-amber-500",
      iconBg: "from-rose-100 to-amber-100",
      iconColor: "text-rose-600",
    },
    {
      icon: MessageCircle,
      title: "AI Chat Assistant",
      desc: "Ask anything from your notes and get instant answers.",
      color: "from-blue-500 to-cyan-500",
      iconBg: "from-blue-100 to-cyan-100",
      iconColor: "text-blue-600",
    },
    {
      icon: Brain,
      title: "Quiz Generator",
      desc: "Auto-generate MCQs from your study topics.",
      color: "from-purple-500 to-pink-500",
      iconBg: "from-purple-100 to-pink-100",
      iconColor: "text-purple-600",
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      desc: "Identify weak areas with AI-powered insights.",
      color: "from-orange-500 to-rose-500",
      iconBg: "from-orange-100 to-rose-100",
      iconColor: "text-orange-600",
    },
    {
      icon: Target,
      title: "Smart Roadmaps",
      desc: "Get personalized study roadmaps for your goals.",
      color: "from-emerald-500 to-teal-500",
      iconBg: "from-emerald-100 to-teal-100",
      iconColor: "text-emerald-600",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      desc: "Track your learning with detailed analytics.",
      color: "from-indigo-500 to-purple-500",
      iconBg: "from-indigo-100 to-purple-100",
      iconColor: "text-indigo-600",
    },
  ];

  /* Track active section for dot navigation */
  useEffect(() => {
    const sections = ["home", "features", "about", "contact", "cta"];
    const observers = [];

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { threshold: 0.5 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = el.getBoundingClientRect().top + window.pageYOffset - 60;
      window.scrollTo({ top: offset, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/90 via-amber-50/70 to-orange-50/50 text-gray-800 overflow-x-hidden relative">
      {/* Decorative glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute w-[500px] h-[500px] bg-rose-300/20 blur-[120px] rounded-full top-[-100px] left-[-100px]" />
        <div className="absolute w-[500px] h-[500px] bg-amber-300/20 blur-[120px] rounded-full bottom-[-120px] right-[-100px]" />
        <div className="absolute w-[400px] h-[400px] bg-orange-200/15 blur-[100px] rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* NAVBAR */}
      <Navbar
        onHome={onHome}
        onGetStarted={onGetStarted}
        showGetStarted={true}
      />
      <NoticePopup />

      {/* ================= HERO (full screen) ================= */}
      <FullScreenSection id="home" reduceMotion={reduceMotion}>
        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
          <motion.div
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="px-5 py-1.5 rounded-full bg-gradient-to-r from-rose-100/80 to-amber-100/80
                       backdrop-blur-sm border border-rose-200/30 text-xs mb-6
                       text-rose-700 font-medium shadow-sm"
          >
            <Sparkles className="inline w-3.5 h-3.5 mr-2" />
            AI Powered Study Assistant
          </motion.div>

          <motion.h1
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold leading-tight text-gray-800"
          >
            Learn Smarter with{" "}
            <Typewriter
              text="RAG_V2"
              speed={90}
              delay={700}
              reduceMotion={reduceMotion}
            />
          </motion.h1>

          <motion.p
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="mt-6 text-gray-500 max-w-2xl text-base"
          >
            Upload your notes, ask questions, generate quizzes, and track your
            learning — all powered by Retrieval-Augmented AI.
          </motion.p>

          <motion.div
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-4 mt-10"
          >
            <button
              onClick={onGetStarted}
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500
                         hover:from-rose-600 hover:to-amber-600 text-white text-sm
                         font-medium transition-all duration-300
                         shadow-lg shadow-rose-200/50 hover:shadow-xl
                         hover:shadow-rose-300/50 hover:scale-[1.02]
                         flex items-center gap-2"
            >
              Start Learning
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => scrollToSection("features")}
              className="px-7 py-3 rounded-xl border border-rose-200/50 text-sm
                         text-gray-600 hover:bg-white/50 transition-all duration-300
                         hover:shadow-lg hover:scale-[1.02] backdrop-blur-sm"
            >
              Explore Features
            </button>
          </motion.div>
        </div>
      </FullScreenSection>

      {/* ================= CAROUSEL (full screen) ================= */}
      <FullScreenSection id="features" reduceMotion={reduceMotion}>
        <div className="w-full max-w-6xl">
          <FeatureCarousel />
        </div>
      </FullScreenSection>

      {/* ================= FEATURES GRID (full screen) ================= */}
      <FullScreenSection reduceMotion={reduceMotion}>
        <div className="w-full max-w-6xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                            bg-gradient-to-r from-rose-100/80 to-amber-100/80
                            backdrop-blur-sm border border-rose-200/30
                            text-rose-700 text-xs font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Features
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-rose-600 to-amber-600
                               bg-clip-text text-transparent">
                Study Smarter
              </span>
            </h2>
            <p className="text-gray-500 mt-2 text-xs max-w-2xl mx-auto">
              AI-powered tools designed to enhance your learning experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  delay: index * 0.06,
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group relative rounded-xl p-5 bg-white/70 backdrop-blur-sm
                           border border-rose-200/20 hover:-translate-y-1
                           transition-all duration-300 hover:shadow-lg
                           hover:shadow-rose-100/20"
              >
                <div
                  className={`absolute inset-0 rounded-xl opacity-0
                              group-hover:opacity-100 bg-gradient-to-br
                              ${feature.color}/10 blur-xl
                              transition-all duration-500`}
                />

                <div className="relative z-10">
                  <div
                    className={`w-9 h-9 rounded-lg bg-gradient-to-br ${feature.iconBg}
                                flex items-center justify-center mb-3
                                group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className={`w-4 h-4 ${feature.iconColor}`} />
                  </div>

                  <h3 className="text-xs font-semibold text-gray-800 mb-1">
                    {feature.title}
                  </h3>

                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                            bg-white/60 backdrop-blur-sm border border-rose-200/30
                            text-gray-600 text-[11px]">
              <Award className="w-3.5 h-3.5 text-rose-500" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                            bg-white/60 backdrop-blur-sm border border-amber-200/30
                            text-gray-600 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Real-time</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                            bg-white/60 backdrop-blur-sm border border-emerald-200/30
                            text-gray-600 text-[11px]">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
              <span>Student-Friendly</span>
            </div>
          </div>
        </div>
      </FullScreenSection>

      {/* ================= ABOUT (full screen) ================= */}
      <FullScreenSection id="about" reduceMotion={reduceMotion}>
        <div className="w-full max-w-6xl">
          <About />
        </div>
      </FullScreenSection>

      {/* ================= CONTACT (full screen) ================= */}
      <FullScreenSection id="contact" reduceMotion={reduceMotion}>
        <div className="w-full max-w-6xl">
          <AboutContact />
        </div>
      </FullScreenSection>

      {/* ================= CTA (full screen) ================= */}
      <FullScreenSection id="cta" reduceMotion={reduceMotion}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                          bg-gradient-to-r from-rose-100/80 to-amber-100/80
                          backdrop-blur-sm border border-rose-200/30
                          text-rose-700 text-xs font-medium mb-6">
            <Rocket className="w-3.5 h-3.5" />
            Get Started Today
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Start Your{" "}
            <span className="bg-gradient-to-r from-rose-600 to-amber-600
                             bg-clip-text text-transparent">
              AI Learning
            </span>{" "}
            Journey
          </h2>
          <p className="text-gray-500 mt-3 text-base">
            Smarter learning starts here. Join thousands of students using RAG_V2.
          </p>

          <button
            onClick={onGetStarted}
            className="mt-8 px-9 py-3 bg-gradient-to-r from-rose-500 to-amber-500
                       hover:from-rose-600 hover:to-amber-600 text-white text-sm
                       rounded-xl font-medium transition-all duration-300
                       shadow-lg shadow-rose-200/50 hover:shadow-xl
                       hover:shadow-rose-300/50 hover:scale-[1.02]
                       flex items-center gap-2 mx-auto"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-gray-400 mt-4">
            <GraduationCap className="inline w-3 h-3 mr-1" />
            Trusted by students worldwide
          </p>
        </div>
      </FullScreenSection>

      {/* ================= FOOTER (own section) ================= */}
      <Footer />

      {/* ================= SIDE DOT NAVIGATION ================= */}
      <nav
        aria-label="Section navigation"
        className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 z-40
                   flex-col gap-3"
      >
        {[
          { id: "home", label: "Home" },
          { id: "features", label: "Features" },
          { id: "about", label: "About" },
          { id: "contact", label: "Contact" },
          { id: "cta", label: "Get Started" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className="group flex items-center gap-2 justify-end"
            aria-label={`Scroll to ${item.label}`}
          >
            <span
              className="text-[10px] font-medium opacity-0 group-hover:opacity-100
                         transition-opacity text-rose-600 whitespace-nowrap"
            >
              {item.label}
            </span>
            <span
              className={`block rounded-full transition-all duration-300 ${
                activeSection === item.id
                  ? "w-2.5 h-2.5 bg-rose-500 shadow-md shadow-rose-200/50"
                  : "w-1.5 h-1.5 bg-rose-300/60 group-hover:bg-rose-400"
              }`}
            />
          </button>
        ))}
      </nav>
    </div>
  );
}

export default LandingPage;