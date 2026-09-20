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

/* ---------- Full-screen section wrapper ---------- */
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
      className={`relative min-h-screen w-full flex items-center justify-center px-6 py-20 overflow-hidden ${className}`}
      style={{ backgroundColor: bg }}
    >
      <motion.div
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full flex items-center justify-center"
      >
        {children}
      </motion.div>
    </section>
  );
};

/* ---------- Typewriter ---------- */
function Typewriter({ text = "RAG_V2", speed = 90, delay = 400, reduceMotion = false }) {
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
    <span className="inline-flex items-baseline text-[#5c1a1a]">
      <span>{displayed}</span>
      {!done && (
        <span className="inline-block w-[3px] h-[0.9em] ml-1 align-baseline bg-[#5c1a1a] animate-caret" />
      )}
    </span>
  );
}

function LandingPage({ onGetStarted, onHome }) {
  const reduceMotion = useReducedMotion();
  const [activeSection, setActiveSection] = useState("home");

  const features = [
    { icon: Upload,         title: "Smart Notes Upload",      desc: "Upload markdown notes and turn them into AI searchable knowledge." },
    { icon: MessageCircle,  title: "AI Chat Assistant",       desc: "Ask anything from your notes and get instant answers." },
    { icon: Brain,          title: "Quiz Generator",          desc: "Auto-generate MCQs from your study topics." },
    { icon: BarChart3,      title: "Performance Analytics",   desc: "Identify weak areas with AI-powered insights." },
    { icon: Target,         title: "Smart Roadmaps",          desc: "Get personalized study roadmaps for your goals." },
    { icon: TrendingUp,     title: "Progress Tracking",       desc: "Track your learning with detailed analytics." },
  ];

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
    <div className="min-h-screen bg-[#f7f3ee] text-[#2a1f14] overflow-x-hidden relative">

      {/* NAVBAR */}
      <Navbar onHome={onHome} onGetStarted={onGetStarted} showGetStarted={true} />
      <NoticePopup />

      {/* ================= HERO ================= */}
      <FullScreenSection id="home" reduceMotion={reduceMotion}>
        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">

          <motion.div
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#e8dfd3] bg-white text-[11px] uppercase tracking-[0.12em] text-[#5a4a3a] mb-8"
          >
            <Sparkles size={12} strokeWidth={1.8} className="text-[#5c1a1a]" />
            AI Powered Study Assistant
          </motion.div>

          <motion.h1
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold leading-tight text-[#2a1f14]"
          >
            Learn Smarter with{" "}
            <Typewriter text="RAG_V2" speed={90} delay={700} reduceMotion={reduceMotion} />
          </motion.h1>

          <motion.p
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="mt-6 text-[#6a5a48] max-w-2xl text-base leading-relaxed"
          >
            Upload your notes, ask questions, generate quizzes, and track your learning —
            all powered by Retrieval-Augmented AI.
          </motion.p>

          <motion.div
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-3 mt-10"
          >
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#5c1a1a] text-white text-sm font-medium hover:bg-[#4a1414] transition-colors"
            >
              Start Learning
              <ArrowRight size={15} strokeWidth={1.8} />
            </button>

            <button
              onClick={() => scrollToSection("features")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-[#e8dfd3] bg-white text-[#2a1f14] text-sm font-medium hover:bg-[#faf7f3] transition-colors"
            >
              Explore Features
            </button>
          </motion.div>
        </div>
      </FullScreenSection>

      {/* ================= CAROUSEL ================= */}
      <FullScreenSection id="features" reduceMotion={reduceMotion}>
        <div className="w-full max-w-6xl">
          <FeatureCarousel />
        </div>
      </FullScreenSection>

      {/* ================= FEATURES GRID ================= */}
      <FullScreenSection reduceMotion={reduceMotion}>
        <div className="w-full max-w-6xl">
          <div className="text-center mb-10">
            <p className="text-[11px] tracking-[0.14em] uppercase text-[#8a7965] mb-2">
              Features
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-[#2a1f14]">
              Everything You Need to Study Smarter
            </h2>
            <p className="text-[#6a5a48] mt-3 text-sm max-w-2xl mx-auto">
              AI-powered tools designed to enhance your learning experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: index * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="group bg-white border border-[#e8dfd3] rounded-lg p-5 hover:border-[#5c1a1a]/40 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center flex-shrink-0">
                      <Icon size={17} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    </div>
                    <h3 className="text-[15px] font-semibold text-[#2a1f14]">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[#8a7965] leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {[
              { icon: Award, label: "AI-Powered" },
              { icon: Clock, label: "Real-time" },
              { icon: GraduationCap, label: "Student-Friendly" },
            ].map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.label}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#e8dfd3] bg-white text-[11px] uppercase tracking-[0.08em] text-[#5a4a3a]"
                >
                  <Icon size={12} strokeWidth={1.8} className="text-[#5c1a1a]" />
                  {badge.label}
                </div>
              );
            })}
          </div>
        </div>
      </FullScreenSection>

      {/* ================= ABOUT ================= */}
      <FullScreenSection id="about" reduceMotion={reduceMotion}>
        <div className="w-full max-w-6xl">
          <About />
        </div>
      </FullScreenSection>

      {/* ================= CONTACT ================= */}
      <FullScreenSection id="contact" reduceMotion={reduceMotion}>
        <div className="w-full max-w-6xl">
          <AboutContact />
        </div>
      </FullScreenSection>

      {/* ================= CTA ================= */}
      <FullScreenSection id="cta" reduceMotion={reduceMotion}>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[11px] tracking-[0.14em] uppercase text-[#8a7965] mb-3">
            Get Started Today
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-[#2a1f14]">
            Start Your AI Learning Journey
          </h2>
          <p className="text-[#6a5a48] mt-4 text-base leading-relaxed">
            Smarter learning starts here. Join thousands of students using RAG_V2.
          </p>

          <button
            onClick={onGetStarted}
            className="mt-8 inline-flex items-center gap-2 px-7 py-3 rounded-md bg-[#5c1a1a] text-white text-sm font-medium hover:bg-[#4a1414] transition-colors"
          >
            Get Started
            <ArrowRight size={15} strokeWidth={1.8} />
          </button>

          <p className="text-[11px] text-[#8a7965] mt-5 inline-flex items-center gap-1.5">
            <GraduationCap size={12} strokeWidth={1.8} />
            Trusted by students worldwide
          </p>
        </div>
      </FullScreenSection>

      {/* ================= FOOTER ================= */}
      <Footer />

      {/* ================= SIDE DOT NAVIGATION ================= */}
      <nav
        aria-label="Section navigation"
        className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col gap-3"
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
            <span className="text-[10px] uppercase tracking-[0.12em] font-medium opacity-0 group-hover:opacity-100 transition-opacity text-[#5c1a1a] whitespace-nowrap">
              {item.label}
            </span>
            <span
              className={`block rounded-full transition-all duration-300 ${
                activeSection === item.id
                  ? "w-2.5 h-2.5 bg-[#5c1a1a]"
                  : "w-1.5 h-1.5 bg-[#c9bda9] group-hover:bg-[#8a7965]"
              }`}
            />
          </button>
        ))}
      </nav>
    </div>
  );
}

export default LandingPage;