import AboutContact from "./AboutContact";
import Footer from "./Footer";
import Navbar from "./Navbar";
import FeatureCarousel from "./FeatureCarousel";
import About from "./About";
import NoticePopup from "./NoticePopup";

function LandingPage({ onGetStarted, onHome }) {
  return (
    <div className="min-h-screen bg-[#050816] text-white overflow-hidden relative">

      {/* Glow Background */}
      <div className="absolute inset-0">
        <div className="absolute w-[500px] h-[500px] bg-purple-600/30 blur-[120px] rounded-full top-[-100px] left-[-100px]" />
        <div className="absolute w-[500px] h-[500px] bg-blue-600/30 blur-[120px] rounded-full bottom-[-120px] right-[-100px]" />
      </div>

      {/* NAVBAR */}
      <Navbar
        onHome={onHome}
        onGetStarted={onGetStarted}
        showGetStarted={true}
      />
      <NoticePopup />
      {/* ================= HERO ================= */}
      <section
        id="home"
        className="relative z-10 flex flex-col items-center text-center px-6 pt-28 pb-20"
      >
        <div className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm mb-6">
          🚀 AI Powered Study Assistant
        </div>

        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
          Learn Smarter with <span className="text-blue-400">RAG_V2</span>
        </h1>

        <p className="mt-6 text-gray-300 max-w-2xl text-lg">
          Upload your notes, ask questions, generate quizzes, and track your learning —
          all powered by Retrieval-Augmented AI.
        </p>

        <div className="flex gap-4 mt-10">
          <button
            onClick={onGetStarted}
            className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
          >
            Start Learning
          </button>

          <button className="px-8 py-3 rounded-xl border border-white/20 hover:bg-white/10 transition">
            Explore Features
          </button>
        </div>
      </section>

      {/* ================= CAROUSEL ================= */}
      <section id="features" className="relative z-10">
        <FeatureCarousel />
      </section>

      {/* ================= FEATURES GRID ================= */}
      <section className="relative z-10 px-6 pb-24 max-w-6xl mx-auto">

        <h2 className="text-center text-3xl md:text-4xl font-bold mb-14">
          Everything You Need to Study
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          {/* BIG */}
          <div className="md:col-span-2 relative group rounded-2xl p-6 bg-white/5 backdrop-blur-xl hover:-translate-y-2 transition">
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 blur-2xl transition" />

            <div className="relative z-10">
              <h3 className="text-lg font-semibold mb-2">📚 Smart Notes Upload</h3>
              <p className="text-gray-400">
                Upload markdown notes and instantly turn them into AI searchable knowledge.
              </p>
            </div>
          </div>

          {/* SMALL */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 hover:-translate-y-2 transition">
            <h3 className="text-lg font-semibold mb-2">🤖 AI Chat</h3>
            <p className="text-gray-400">Ask anything from your notes.</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 hover:-translate-y-2 transition">
            <h3 className="text-lg font-semibold mb-2">📝 Quiz Generator</h3>
            <p className="text-gray-400">Auto-generate MCQs from topics.</p>
          </div>

          {/* BIG */}
          <div className="md:col-span-2 bg-white/5 backdrop-blur-xl rounded-2xl p-6 hover:-translate-y-2 transition">
            <h3 className="text-lg font-semibold mb-2">📊 Performance Tracking</h3>
            <p className="text-gray-400">
              Identify weak areas and improve faster with AI insights.
            </p>
          </div>

        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section id="about" className="relative z-10">
        <About/>
      </section>

      {/* ================= CONTACT (same component for now) ================= */}
      <section id="contact" className="relative z-10">
        <AboutContact />
      </section>

      {/* ================= CTA ================= */}
      <section className="relative z-10 text-center py-20">
        <h2 className="text-3xl font-bold">Start Your AI Learning Journey</h2>
        <p className="text-gray-400 mt-2">Smarter learning starts here.</p>

        <button
          onClick={onGetStarted}
          className="mt-6 px-10 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl"
        >
          Get Started →
        </button>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

export default LandingPage;