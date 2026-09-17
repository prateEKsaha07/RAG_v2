import { useState, useEffect, useRef } from "react";
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
  Sparkles,
  ChevronDown,
  LogOut,
  GraduationCap,
  AlertCircle,
  Lock,
} from "lucide-react";

function DashboardNav({
  active = "dashboard",
  onDashboard,
  onStudy,
  onUpload,
  onNotes,
  onQuiz,
  onRoadmap,
  onAnalyticsV2,
  onLogout,
  subject = null,
  user,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuizPopup, setShowQuizPopup] = useState(false);

  const userMenuRef = useRef(null);

  // Scroll shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    if (!showUserMenu) return;
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showUserMenu]);

  // Escape key closes menus
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setShowUserMenu(false);
        setMobileOpen(false);
        setShowQuizPopup(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const shouldShowQuiz = active === "dashboard";
  const isQuizDisabled = !subject || subject.trim() === "";

  const baseNavItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      action: onDashboard,
      gradient: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-200/40",
    },
    {
      id: "study",
      label: "Study",
      icon: BookOpen,
      action: onStudy,
      gradient: "from-emerald-500 to-teal-500",
      shadow: "shadow-emerald-200/40",
    },
    {
      id: "upload",
      label: "Upload",
      icon: Upload,
      action: onUpload,
      gradient: "from-orange-500 to-amber-500",
      shadow: "shadow-orange-200/40",
    },
    {
      id: "notes",
      label: "Notes",
      icon: FileText,
      action: onNotes,
      gradient: "from-purple-500 to-pink-500",
      shadow: "shadow-purple-200/40",
    },
    {
      id: "roadmap",
      label: "Roadmap",
      icon: Map,
      action: onRoadmap,
      gradient: "from-amber-500 to-orange-500",
      shadow: "shadow-amber-200/40",
    },
    {
      id: "analytics-v2",
      label: "Analytics",
      icon: BarChart3,
      action: onAnalyticsV2,
      gradient: "from-cyan-500 to-blue-500",
      shadow: "shadow-cyan-200/40",
    },
  ];

  const quizItem = {
    id: "quiz",
    label: "Quiz",
    icon: Brain,
    action: onQuiz,
    gradient: "from-rose-500 to-pink-500",
    shadow: "shadow-rose-200/40",
    disabled: isQuizDisabled,
  };

  let navItems = [...baseNavItems];
  if (shouldShowQuiz) {
    navItems.splice(3, 0, quizItem);
  }

  const getInitials = (email) => {
    if (!email) return "U";
    return email.split("@")[0].slice(0, 2).toUpperCase();
  };

  const handleQuizClick = () => {
    if (isQuizDisabled) {
      setShowQuizPopup(true);
      setTimeout(() => setShowQuizPopup(false), 3200);
    } else {
      onQuiz?.();
    }
  };

  return (
    <nav
      className={`
        sticky top-0 z-50 transition-all duration-300
        ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg shadow-rose-100/30 border-b border-rose-200/30"
            : "bg-white/80 backdrop-blur-sm border-b border-rose-200/20"
        }
      `}
    >
      <div className="max-w-7xl mx-auto h-16 px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-amber-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 flex items-center justify-center text-white font-bold shadow-lg shadow-rose-200/50 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div className="hidden sm:block">
            <h1 className="font-bold text-lg bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
              RAG_v2
            </h1>
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping opacity-75" />
                <span className="relative w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              </span>
              Student Assistant
            </p>
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            const isDisabled = item.disabled;

            if (item.id === "quiz") {
              return (
                <div key={item.id} className="relative">
                  <button
                    onClick={handleQuizClick}
                    className={`
                      relative group px-3.5 py-2 rounded-xl
                      transition-all duration-300 flex items-center gap-2
                      ${
                        isActive
                          ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg ${item.shadow}`
                          : isDisabled
                          ? "text-gray-400 cursor-pointer hover:bg-amber-50/60"
                          : "text-gray-600 hover:bg-gray-100/80 hover:scale-[1.02]"
                      }
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2
                    `}
                  >
                    <Icon
                      size={18}
                      className={`transition-transform duration-300 ${
                        isActive ? "scale-110" : "group-hover:scale-110"
                      }`}
                    />
                    <span className="font-medium">{item.label}</span>

                    {isActive && (
                      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-white rounded-full animate-pulse" />
                    )}

                    {isDisabled && (
                      <span className="ml-1 inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded-full">
                        <Lock size={10} />
                        Locked
                      </span>
                    )}
                  </button>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`
                  relative group px-3.5 py-2 rounded-xl
                  transition-all duration-300 flex items-center gap-2
                  ${
                    isActive
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg ${item.shadow}`
                      : "text-gray-600 hover:bg-gray-100/80 hover:scale-[1.02]"
                  }
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2
                `}
              >
                <Icon
                  size={18}
                  className={`transition-transform duration-300 ${
                    isActive ? "scale-110" : "group-hover:scale-110"
                  }`}
                />
                <span className="font-medium">{item.label}</span>

                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-white rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Desktop right */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            aria-label="Notifications"
            className="relative w-10 h-10 rounded-xl hover:bg-rose-50 transition-all duration-200 flex items-center justify-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            <Bell
              size={20}
              className="text-gray-500 group-hover:text-rose-500 transition-colors duration-200 group-hover:rotate-12"
            />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full">
              <span className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-60" />
            </span>
          </button>

          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu((v) => !v)}
              aria-label="User menu"
              className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl hover:bg-rose-50 transition-all duration-200 ring-1 ring-rose-200/30 hover:ring-rose-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {getInitials(user?.email)}
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-300 ${
                  showUserMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-rose-100/40 ring-1 ring-rose-200/30 overflow-hidden animate-dropdown-in origin-top-right">
                <div className="p-4 border-b border-rose-200/20">
                  <p className="font-semibold text-gray-800 text-sm truncate">
                    {user?.email?.split("@")[0] || "User"}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
                <div className="p-2">
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-rose-50 transition-all duration-200 text-gray-600 hover:text-rose-600 group">
                    <GraduationCap
                      size={18}
                      className="group-hover:scale-110 transition-transform duration-200"
                    />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-all duration-200 text-gray-600 hover:text-red-600 group"
                  >
                    <LogOut
                      size={18}
                      className="group-hover:scale-110 transition-transform duration-200"
                    />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          className="lg:hidden p-2 rounded-xl hover:bg-rose-50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
        >
          <div className="relative w-6 h-6">
            <Menu
              size={24}
              className={`absolute inset-0 text-gray-500 transition-all duration-300 ${
                mobileOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
              }`}
            />
            <X
              size={24}
              className={`absolute inset-0 text-rose-500 transition-all duration-300 ${
                mobileOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
              }`}
            />
          </div>
        </button>
      </div>

      {/* Quiz locked popup */}
      {showQuizPopup && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-pop-in px-4 w-full max-w-sm">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-amber-100/40 ring-1 ring-amber-200/50 p-4 flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-xl flex-shrink-0 animate-icon-breathe">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 text-sm">Quiz Locked</p>
              <p className="text-gray-500 text-sm mt-0.5">
                Please select a subject from the dashboard to unlock the quiz
                section.
              </p>
              <button
                onClick={() => setShowQuizPopup(false)}
                className="mt-2 text-xs text-rose-500 hover:text-rose-700 font-medium transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-rose-200/20 bg-white/95 backdrop-blur-md animate-fade-up-slow">
          <div className="flex flex-col p-4 gap-1 max-h-[80vh] overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              const isDisabled = item.disabled;

              if (item.id === "quiz") {
                return (
                  <button
                    key={item.id}
                    onClick={handleQuizClick}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl
                      transition-all duration-200
                      ${
                        isActive
                          ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg ${item.shadow}`
                          : isDisabled
                          ? "text-gray-400 hover:bg-amber-50/60"
                          : "text-gray-700 hover:bg-rose-50 hover:translate-x-1"
                      }
                    `}
                  >
                    <Icon size={20} className={isActive ? "scale-110" : ""} />
                    <span className="font-medium">{item.label}</span>
                    {isDisabled && (
                      <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
                        <Lock size={10} />
                        Select Subject
                      </span>
                    )}
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    )}
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action?.();
                    setMobileOpen(false);
                  }}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200
                    ${
                      isActive
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg ${item.shadow}`
                        : "text-gray-700 hover:bg-rose-50 hover:translate-x-1"
                    }
                  `}
                >
                  <Icon size={20} className={isActive ? "scale-110" : ""} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  )}
                </button>
              );
            })}

            <hr className="my-2 border-rose-200/20" />

            <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-rose-50 transition-all duration-200 hover:translate-x-1">
              <Bell size={20} />
              <span>Notifications</span>
              <span className="ml-auto relative flex w-2 h-2">
                <span className="absolute w-2 h-2 bg-rose-500 rounded-full animate-ping opacity-60" />
                <span className="relative w-2 h-2 bg-rose-500 rounded-full" />
              </span>
            </button>

            <button
              onClick={() => {
                onLogout?.();
                setMobileOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 hover:translate-x-1"
            >
              <User size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default DashboardNav;