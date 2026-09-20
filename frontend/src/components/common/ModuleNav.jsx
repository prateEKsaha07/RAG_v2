// ModuleNav.jsx - Editorial theme
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

function ModuleNav({
  active = "notes",
  onDashboard,
  onStudy,
  onUpload,
  onNotes,
  onRoadmap,
  onAnalyticsV2,
  onLogout,
  user,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "dashboard", label: "Dashboard", action: onDashboard },
    { id: "study", label: "Study", action: onStudy },
    { id: "upload", label: "Upload", action: onUpload },
    { id: "notes", label: "Notes", action: onNotes },
    { id: "roadmap", label: "Roadmap", action: onRoadmap },
    { id: "analytics-v2", label: "Analytics", action: onAnalyticsV2 },
  ];

  const getInitials = (email) => {
    if (!email) return "U";
    return email.split("@")[0].slice(0, 2).toUpperCase();
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-[#faf7f3]/95 backdrop-blur-md border-b border-[#e8dfd3]"
          : "bg-[#faf7f3]/80 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="max-w-[1350px] mx-auto h-16 px-6 sm:px-10 md:px-16 lg:px-24 flex items-center justify-between">

        {/* Logo */}
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); onDashboard?.(); }}
          className="font-semibold text-lg tracking-tight text-[#2a1f14]"
        >
          RAG<span className="text-[#5c1a1a]">_v2</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`text-sm transition-colors duration-200 ${
                  isActive
                    ? "text-[#2a1f14] font-medium"
                    : "text-[#8a7965] hover:text-[#2a1f14]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Desktop right */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 text-sm text-[#8a7965] hover:text-[#2a1f14] transition-colors duration-200"
            >
              <span className="w-7 h-7 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center text-[11px] font-medium text-[#5a4a3a]">
                {getInitials(user?.email)}
              </span>
              <ChevronDown
                size={14}
                strokeWidth={1.8}
                className={`transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`}
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-[#faf7f3] border border-[#e8dfd3] rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-[#e8dfd3]">
                  <p className="text-sm font-medium text-[#2a1f14] truncate">
                    {user?.email?.split("@")[0] || "User"}
                  </p>
                  <p className="text-xs text-[#8a7965] truncate mt-0.5">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
                <div className="p-1.5">
                  <button
                    onClick={() => { setShowUserMenu(false); onLogout?.(); }}
                    className="w-full text-left px-3 py-2 rounded-md text-sm text-[#5a4a3a] hover:bg-[#f0e9e0] hover:text-[#5c1a1a] transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden w-9 h-9 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center text-[#5a4a3a] hover:text-[#5c1a1a] transition-colors duration-200"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={16} strokeWidth={1.8} /> : <Menu size={16} strokeWidth={1.8} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#e8dfd3] bg-[#faf7f3]">
          <div className="flex flex-col px-6 sm:px-10 md:px-16 py-4 gap-1 max-h-[80vh] overflow-y-auto">
            {navItems.map((item) => {
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { item.action?.(); setMobileOpen(false); }}
                  className={`text-left px-3 py-2.5 text-sm rounded-md transition-colors duration-200 ${
                    isActive
                      ? "text-[#2a1f14] font-medium bg-[#f0e9e0]"
                      : "text-[#5a4a3a] hover:text-[#2a1f14] hover:bg-[#f0e9e0]/60"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            <div className="border-t border-[#e8dfd3] my-3" />
            <button
              onClick={() => { onLogout?.(); setMobileOpen(false); }}
              className="text-left px-3 py-2.5 text-sm text-[#5a4a3a] hover:text-[#5c1a1a] hover:bg-[#f0e9e0]/60 rounded-md transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default ModuleNav;