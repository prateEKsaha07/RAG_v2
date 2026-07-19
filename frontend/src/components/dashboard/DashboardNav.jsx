import { useState } from "react";
import {
  Home,
  BookOpen,
  FileText,
  Brain,
  Map,
  BarChart3,
  User,
  Upload,
  Bell,
  Menu,
  X,
} from "lucide-react";

function DashboardNav({
  active = "dashboard",
  onDashboard,
  onStudy,
  onUpload,
  onNotes,
  onQuiz,
  onRoadmap,
  // onAnalytics,
  onAnalyticsV2,
  onLogout,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      action: onDashboard,
    },
    {
      id: "study",
      label: "Study",
      icon: BookOpen,
      action: onStudy,
    },
    {
      id: "upload",
      label: "Upload",
      icon: Upload,
      action: onUpload,
    },
    {
      id: "notes",
      label: "Notes",
      icon: FileText,
      action: onNotes,
    },
    {
      id: "quiz",
      label: "Quiz",
      icon: Brain,
      action: onQuiz,
    },
    {
      id: "roadmap",
      label: "Roadmap",
      icon: Map,
      action: onRoadmap,
    },
    {
      id: "analytics-v2",
      label: "Analytics V2",
      icon: BarChart3,
      action: onAnalyticsV2,
    },
    // {
    //   id: "analytics",
    //   label: "Analytics",
    //   icon: BarChart3,
    //   action: onAnalytics,
    // },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">

      <div className="max-w-7xl mx-auto h-16 px-4 md:px-8 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
            R
          </div>

          <div className="hidden sm:block">
            <h1 className="font-bold text-lg text-gray-800">
              RAG_v2
            </h1>
            <p className="text-xs text-gray-500">
              Student Assistant
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition
                  ${
                    active === item.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Desktop Right */}
        <div className="hidden lg:flex items-center gap-3">

          <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <Bell size={18} />
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-gray-100 hover:bg-red-100 px-4 py-2 rounded-full transition"
          >
            <User size={18} />
            Logout
          </button>

        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t bg-white">

          <div className="flex flex-col p-4 gap-2">

            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action?.();
                    setMobileOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition
                    ${
                      active === item.id
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              );
            })}

            <hr className="my-2" />

            <button
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100"
            >
              <Bell size={20} />
              Notifications
            </button>

            <button
              onClick={() => {
                onLogout?.();
                setMobileOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50"
            >
              <User size={20} />
              Logout
            </button>

          </div>

        </div>
      )}
    </nav>
  );
}

export default DashboardNav;