function About() {
  return (
    <section
      id="about"
      className="relative z-10 max-w-7xl mx-auto px-6 py-28"
    >
      <div className="grid lg:grid-cols-2 gap-14 items-center">
        
        {/* Left - Image */}
        <div className="relative group">
          {/* Background Glow */}
          <div className="absolute -inset-6 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 blur-3xl opacity-60 group-hover:opacity-100 transition duration-700" />

          <div className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl">
            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80"
              alt="Project Preview"
              className="w-full h-[420px] object-cover transition duration-700 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Right - Content */}
        <div>
          <span className="inline-flex items-center rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1 text-sm text-blue-300 mb-6">
            About RAG_V2
          </span>

          <h2 className="text-4xl font-bold text-white leading-tight">
            Building a Smarter Way to Learn with AI
          </h2>

          <p className="mt-6 text-gray-400 leading-8">
            RAG_V2 is an AI-powered learning platform designed to make studying
            more interactive, personalized, and efficient. Instead of relying on
            generic AI responses, it uses Retrieval-Augmented Generation (RAG)
            to answer questions directly from your own study notes, providing
            accurate and context-aware assistance.
          </p>

          <p className="mt-5 text-gray-400 leading-8">
            Beyond answering questions, the platform helps students generate
            quizzes, identify weak topics, analyze performance, and create
            structured learning roadmaps—bringing multiple study tools together
            into one seamless experience.
          </p>

          {/* Vision Card */}
          <div className="mt-8 rounded-2xl bg-white/5 backdrop-blur-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-3">
              🚀 Vision
            </h3>

            <p className="text-gray-400 leading-7">
              The long-term vision is to build an intelligent study companion
              that adapts to every learner. By combining AI, personalized
              knowledge retrieval, and performance analytics, RAG_V2 aims to
              transform static notes into an interactive learning ecosystem that
              helps students understand concepts rather than simply memorize
              them.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;