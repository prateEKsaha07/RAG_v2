import {
  ArrowLeft,
  Bell,
  Download,
  UserCircle2,
} from "lucide-react";

function AnalyticsNavbar({ onBack }) {
  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b shadow-sm">

      <div className="h-full px-8 flex items-center justify-between">

        {/* Left */}

        <div className="flex items-center gap-4">

          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            <ArrowLeft size={18} />
            <span className="font-medium">
              Dashboard
            </span>
          </button>

          <div className="h-8 w-px bg-gray-300" />

          <div>

            <h1 className="text-xl font-bold text-gray-800">
              Analytics Dashboard
            </h1>

            <p className="text-xs text-gray-500">
              Student Performance & Insights
            </p>

          </div>

        </div>

        {/* Right */}

        <div className="flex items-center gap-3">

          <div className="hidden md:block text-right">

            <p className="text-xs text-gray-400">
              Last Updated
            </p>

            <p className="text-sm font-medium text-gray-700">
              Just now
            </p>

          </div>

          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 transition"
          >
            <Download size={18} />
            Export
          </button>

          <button
            className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition"
          >
            <Bell size={20} />
          </button>

          <button
            className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center"
          >
            <UserCircle2 size={22} />
          </button>

        </div>

      </div>

    </header>
  );
}

export default AnalyticsNavbar;