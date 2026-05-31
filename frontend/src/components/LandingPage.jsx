function LandingPage({ onGetStarted }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      
      {/* Navbar */}
      <nav className="px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">RAG_V2</h1>
        <button
          onClick={onGetStarted}
          className="bg-blue-600 text-white px-4 py-2 
                     rounded-lg hover:bg-blue-700"
        >
          Get Started
        </button>
      </nav>

      {/* Hero */}
      <div className="text-center py-24 px-8">
        <h2 className="text-5xl font-bold text-gray-800 mb-6">
          Study Smarter with AI
        </h2>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Upload your study notes, generate quizzes, identify weak topics 
          and get instant answers — all powered by RAG.
        </p>
        <button
          onClick={onGetStarted}
          className="bg-blue-600 text-white px-8 py-4 rounded-xl 
                     text-lg font-semibold hover:bg-blue-700 
                     shadow-lg hover:shadow-xl transition"
        >
          Start Now →
        </button>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-8 pb-24">
        <h3 className="text-2xl font-bold text-center mb-12 text-gray-700">
          What Can RAG_V2 Do?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-xl p-6 shadow text-center">
            <p className="text-4xl mb-4">📚</p>
            <h4 className="font-bold text-lg mb-2">Upload Notes</h4>
            <p className="text-gray-500 text-sm">
              Upload your markdown study notes and let AI index them instantly
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow text-center">
            <p className="text-4xl mb-4">📝</p>
            <h4 className="font-bold text-lg mb-2">Generate Quiz</h4>
            <p className="text-gray-500 text-sm">
              Get AI generated MCQs based on your own notes and track weak topics
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow text-center">
            <p className="text-4xl mb-4">💬</p>
            <h4 className="font-bold text-lg mb-2">Ask Questions</h4>
            <p className="text-gray-500 text-sm">
              Ask anything about your notes and get instant grounded answers
            </p>
          </div>

        </div>
      </div>

    </div>
  )
}

export default LandingPage