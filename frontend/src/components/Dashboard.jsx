import Footer from "./Footer"
import Navbar from "./Navbar"
function Dashboard({ subject, onQuiz, onQA, onUpload, onNotes, onRoadmap, onHome, onAnalytics, onLogout, user }) {
  return (
    <div className="min-h-screen bg-gray-100 ">

      {/* Navbar */}
      {/* <nav className="bg-white shadow px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">RAG_V2</h1>
        <button
          onClick={onUpload}
          className="text-sm text-gray-500 hover:text-blue-600"
        >
          + Upload New Notes
        </button>
      </nav> */}

      <Navbar onHome={onHome} showGetStarted={false} onLogout={onLogout} />
      {/* Welcome */}
      <div className="max-w-3xl mx-auto pt-16 px-8 text-center pb-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome Back {user?.email?.split("@")[0]} 👋 !

        </h2>
          {/* Current Subject */}
<div className="flex items-center justify-center gap-2 mb-12">
  <p className="text-gray-500">
    Current subject:
    <span className="font-semibold text-blue-600 ml-1">
      {subject || "None selected"}
    </span>
  </p>
  <button
    onClick={onUpload}
    className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 
               rounded-full hover:bg-blue-100 border border-blue-200"
  >
    change subject
  </button>
</div>

        

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <button
  onClick={onRoadmap}
  className="bg-white rounded-xl p-8 shadow hover:shadow-lg 
             transition text-left border-2 border-transparent 
             hover:border-orange-500"
>
  <p className="text-4xl mb-4">🗺️</p>
  <h3 className="text-xl font-bold mb-2">Study Roadmap</h3>
  <p className="text-gray-500 text-sm">
    Generate a personalized study plan based on your weak topics
  </p>
</button>

          <button
            onClick={onQuiz}
            className="bg-white rounded-xl p-8 shadow hover:shadow-lg 
                       transition text-left border-2 border-transparent 
                       hover:border-blue-500"
          >
            <p className="text-4xl mb-4">📝</p>
            <h3 className="text-xl font-bold mb-2">Take Quiz</h3>
            <p className="text-gray-500 text-sm">
              Test your knowledge with AI generated questions from your notes
            </p>
          </button>

          <button
            onClick={onQA}
            className="bg-white rounded-xl p-8 shadow hover:shadow-lg 
                       transition text-left border-2 border-transparent 
                       hover:border-green-500"
          >
            <p className="text-4xl mb-4">💬</p>
            <h3 className="text-xl font-bold mb-2">Ask a Question</h3>
            <p className="text-gray-500 text-sm">
              Get instant answers from your study notes using AI
            </p>
          </button>
          
          <button
  onClick={onNotes}
  className="bg-white rounded-xl p-8 shadow hover:shadow-lg 
             transition text-left border-2 border-transparent 
             hover:border-purple-500"
>
  <p className="text-4xl mb-4">📓</p>
  <h3 className="text-xl font-bold mb-2">My Notes</h3>
  <p className="text-gray-500 text-sm">
    Create and manage your study notes with AI tagging
  </p>
</button>
<button
  onClick={onAnalytics}
  className="bg-white rounded-xl p-8 shadow hover:shadow-lg 
             transition text-left border-2 border-transparent 
             hover:border-pink-500"
>
  <p className="text-4xl mb-4">📊</p>
  <h3 className="text-xl font-bold mb-2">Analytics</h3>
  <p className="text-gray-500 text-sm">
    Track your quiz performance and improvement over time
  </p>
</button>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Dashboard