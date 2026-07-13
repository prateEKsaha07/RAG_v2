import { Search, Upload, BookOpen, Trash2 } from "lucide-react";

function StudyScreen({ user, onBack }) {
  const books = [
    {
      id: 1,
      title: "Database Management System",
      pages: 320,
      size: "2.4 MB",
      lastOpened: "Yesterday",
    },
    {
      id: 2,
      title: "Operating System",
      pages: 412,
      size: "4.8 MB",
      lastOpened: "2 days ago",
    },
    {
      id: 3,
      title: "Java Programming",
      pages: 286,
      size: "3.1 MB",
      lastOpened: "Last week",
    },
    {
      id: 4,
      title: "Computer Networks",
      pages: 250,
      size: "2.2 MB",
      lastOpened: "Today",
    },
    {
      id: 5,
      title: "Artificial Intelligence",
      pages: 530,
      size: "6.3 MB",
      lastOpened: "Yesterday",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <div>
            <button
              onClick={onBack}
              className="text-blue-600 text-sm mb-2 hover:underline"
            >
              ← Dashboard
            </button>

            <h1 className="text-3xl font-bold text-gray-800">
              📚 Study Library
            </h1>

            <p className="text-gray-500 mt-1">
              Organize and read all your study material.
            </p>
          </div>

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl flex items-center gap-2">
            <Upload size={18} />
            Upload Book
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-8 py-8 space-y-10">

        {/* Continue Reading */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-lg">
          <p className="text-sm opacity-90">
            Welcome back {user?.email?.split("@")[0]} 👋
          </p>

          <h2 className="text-3xl font-bold mt-2">
            Continue Reading
          </h2>

          <div className="mt-6 bg-white/15 rounded-2xl p-5 backdrop-blur">
            <div className="flex justify-between items-center">

              <div>
                <p className="text-xl font-semibold">
                  📘 Database Management System
                </p>

                <p className="text-sm opacity-90 mt-1">
                  Page 185 of 320
                </p>

                <div className="w-72 bg-white/20 rounded-full h-2 mt-4">
                  <div className="bg-white h-2 rounded-full w-3/5"></div>
                </div>

                <p className="text-xs mt-2 opacity-80">
                  58% Completed
                </p>
              </div>

              <button className="bg-white text-blue-700 px-5 py-3 rounded-xl font-semibold hover:bg-gray-100">
                Continue →
              </button>

            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">

          <div className="relative w-full md:w-96">

            <Search
              size={18}
              className="absolute left-4 top-3.5 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search books..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="text-gray-500 text-sm flex items-center">
            {books.length} Books
          </div>

        </div>

        {/* Library */}
        <div>

          <h2 className="text-2xl font-bold mb-6">
            My Library
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {books.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                    <BookOpen className="text-blue-600" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {book.title}
                    </h3>

                    <p className="text-sm text-gray-500">
                      PDF Document
                    </p>
                  </div>
                </div>

                <div className="text-sm text-gray-500 space-y-2">

                  <div className="flex justify-between">
                    <span>Pages</span>
                    <span>{book.pages}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Size</span>
                    <span>{book.size}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Last Opened</span>
                    <span>{book.lastOpened}</span>
                  </div>

                </div>

                <div className="flex gap-3 mt-6">

                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl">
                    Open
                  </button>

                  <button className="w-12 bg-red-50 hover:bg-red-100 rounded-xl flex justify-center items-center">
                    <Trash2
                      size={18}
                      className="text-red-500"
                    />
                  </button>

                </div>

              </div>
            ))}

          </div>

        </div>

        {/* Storage Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6">

          <h2 className="text-xl font-bold mb-5">
            Storage Summary
          </h2>

          <div className="grid md:grid-cols-3 gap-6">

            <div>
              <p className="text-gray-500">Books</p>
              <p className="text-3xl font-bold mt-1">
                5
              </p>
            </div>

            <div>
              <p className="text-gray-500">Storage Used</p>
              <p className="text-3xl font-bold mt-1">
                18 MB
              </p>
            </div>

            <div>
              <p className="text-gray-500">Recently Added</p>
              <p className="font-semibold mt-1">
                Operating System.pdf
              </p>
              <p className="text-sm text-gray-400">
                Yesterday
              </p>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default StudyScreen;