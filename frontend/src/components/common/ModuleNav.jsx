// ModuleNav.jsx - Editorial theme
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

// Inline SVG placeholder — editorial palette, no asset file needed.
const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
      <rect width="80" height="80" fill="#e8dfd3"/>
      <circle cx="40" cy="30" r="14" fill="#b8a994"/>
      <path d="M12 74c4-16 16-24 28-24s24 8 28 24" fill="#b8a994"/>
    </svg>`
  );

function Avatar({ src, alt, size = 28, className = "" }) {
  const resolved = src || DEFAULT_AVATAR;
  return (
    <img
      src={resolved}
      alt={alt || "avatar"}
      width={size}
      height={size}
      className={`rounded-md object-cover border border-[#e8dfd3] bg-white ${className}`}
      onError={(e) => {
        if (e.currentTarget.src !== DEFAULT_AVATAR) {
          e.currentTarget.src = DEFAULT_AVATAR;
        }
      }}
    />
  );
}

function ModuleNav({
  active = "notes",
  onDashboard,
  onStudy,
  onUpload,
  onNotes,
  onRoadmap,
  onAnalyticsV2,
  onLogout,
  onProfile,       // ← optional: navigate to ProfileScreen
  user,
  profile,         // ← optional: profile row (preferred over `user`)
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

  // Prefer profile, fall back to user (auth user / legacy shape)
  const avatarUrl = profile?.avatar_url || user?.avatar_url || "";
  const displayName =
    profile?.display_name ||
    profile?.username ||
    user?.display_name ||
    user?.username ||
    (user?.email ? user.email.split("@")[0] : "User");
  const email = user?.email || profile?.email || "";

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
              <Avatar
                src={avatarUrl}
                alt={displayName}
                size={28}
              />
              <span className="max-w-[120px] truncate text-[#5a4a3a]">
                {displayName}
              </span>
              <ChevronDown
                size={14}
                strokeWidth={1.8}
                className={`transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`}
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-[#faf7f3] border border-[#e8dfd3] rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-[#e8dfd3] flex items-center gap-3">
                  <Avatar src={avatarUrl} alt={displayName} size={36} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#2a1f14] truncate">
                      {displayName}
                    </p>
                    {email && (
                      <p className="text-xs text-[#8a7965] truncate mt-0.5">
                        {email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="p-1.5">
                  <button
                    onClick={() => { setShowUserMenu(false); onProfile?.(); }}
                    className="w-full text-left px-3 py-2 rounded-md text-sm text-[#5a4a3a] hover:bg-[#f0e9e0] hover:text-[#5c1a1a] transition-colors duration-200"
                  >
                    Profile
                  </button>
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

            {/* Mobile profile header */}
            <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
              <Avatar src={avatarUrl} alt={displayName} size={36} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#2a1f14] truncate">
                  {displayName}
                </p>
                {email && (
                  <p className="text-xs text-[#8a7965] truncate">{email}</p>
                )}
              </div>
            </div>
            <div className="border-t border-[#e8dfd3] my-2" />

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
              onClick={() => { onProfile?.(); setMobileOpen(false); }}
              className="text-left px-3 py-2.5 text-sm text-[#5a4a3a] hover:text-[#5c1a1a] hover:bg-[#f0e9e0]/60 rounded-md transition-colors duration-200"
            >
              Profile
            </button>
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