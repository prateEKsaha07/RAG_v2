import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  MoreVertical,
  ZoomIn,
} from "lucide-react";

function BookReader({ book, onBack }) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">

      {/* Header */}
      <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm">

        <div className="flex items-center gap-4">

          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-slate-100 transition"
          >
            <ArrowLeft size={22} />
          </button>

          <div>
            <h1 className="font-semibold text-slate-800">
              {book?.title}
            </h1>

            <p className="text-xs text-slate-500">
              Study Reader
            </p>
          </div>

        </div>

        <div className="flex items-center gap-2">

          <button className="p-2 rounded-lg hover:bg-slate-100">
            <Search size={20} />
          </button>

          <button className="p-2 rounded-lg hover:bg-slate-100">
            <MoreVertical size={20} />
          </button>

        </div>

      </header>

      {/* Reader */}

      <main className="flex-1 flex items-center justify-center p-10">

        <div className="bg-white rounded-xl shadow-lg border w-full max-w-5xl h-[75vh] flex items-center justify-center">

          <div className="text-center">

            <div className="text-7xl mb-6">
              📄
            </div>

            <h2 className="text-2xl font-bold text-slate-700">
              PDF Viewer
            </h2>

            <p className="text-slate-500 mt-2">
              The PDF will be displayed here.
            </p>

          </div>

        </div>

      </main>

      {/* Footer */}

      <footer className="h-20 bg-white border-t flex items-center justify-center">

        <div className="flex items-center gap-6">

          <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg">

            <ChevronLeft size={18} />

            Previous

          </button>

          <div className="font-medium text-slate-700">

            Page 1 / {book?.total_pages || 1}

          </div>

          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">

            Next

            <ChevronRight size={18} />

          </button>

          <button className="flex items-center gap-2 border px-4 py-2 rounded-lg">

            <ZoomIn size={18} />

            100%

          </button>

        </div>

      </footer>

    </div>
  );
}

export default BookReader;