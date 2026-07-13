function HeroSection({ user, subject, onUpload }) {
  return (
    <section className="bg-white rounded-2xl shadow-sm p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">

        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            Welcome back, {user?.email?.split("@")[0]} 👋
          </h1>

          <p className="text-gray-500 mt-2">
            Continue learning where you left off.
          </p>

          <div className="mt-8">
            <p className="text-sm uppercase tracking-wide text-gray-400">
              Current Subject
            </p>

            <div className="flex items-center gap-3 mt-2">
              <span className="text-2xl">📘</span>

              <span className="text-xl font-semibold text-blue-600">
                {subject || "No Subject Selected"}
              </span>

              <button
                onClick={onUpload}
                className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100"
              >
                Change
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onUpload}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold shadow"
          >
            Continue Studying →
          </button>

          <p className="text-sm text-gray-400 text-center">
            Resume your learning journey
          </p>
        </div>

      </div>
    </section>
  );
}

export default HeroSection;