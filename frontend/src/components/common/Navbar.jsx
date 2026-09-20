import { useEffect, useState } from "react";
import { Menu, X, LogOut, ChevronRight } from "lucide-react";

function Navbar({ onGetStarted, showGetStarted = true, onHome, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { label: "Home", id: "home" },
    { label: "Features", id: "features" },
    { label: "About", id: "about" },
    { label: "Contact", id: "contact" },
  ];

  // smooth Apple-style scroll
  const smoothScrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;

    const target = el.getBoundingClientRect().top + window.pageYOffset;
    const start = window.pageYOffset;
    const distance = target - start;
    const duration = 900;

    let startTime = null;

    const ease = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;

      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      window.scrollTo(0, start + distance * ease(progress));

      if (timeElapsed < duration) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  // scroll spy
  useEffect(() => {
    const sections = navItems.map((i) => i.id);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.6 }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // navbar background on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50">
      {/* background */}
      <div
        className={`absolute inset-0 transition-colors duration-300 ${
          scrolled
            ? "bg-[#faf7f3]/95 border-b border-[#e8dfd3]"
            : "bg-[#f7f3ee]/80 border-b border-transparent"
        }`}
      />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10 py-3.5 flex justify-between items-center">

        {/* LOGO */}
        <button
          onClick={onHome}
          className="text-lg font-bold tracking-tight text-[#2a1f14] hover:text-[#5c1a1a] transition-colors"
        >
          RAG<span className="text-[#5c1a1a]">_v2</span>
        </button>

        {/* DESKTOP NAV */}
        <ul className="hidden md:flex items-center gap-8 text-sm">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => smoothScrollTo(item.id)}
                className={`transition-colors duration-200 ${
                  activeSection === item.id
                    ? "text-[#2a1f14] font-medium"
                    : "text-[#8a7965] hover:text-[#2a1f14]"
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        {/* RIGHT ACTIONS */}
        <div className="hidden md:flex items-center gap-3">
          {showGetStarted && (
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-md bg-[#5c1a1a] text-white text-sm font-medium hover:bg-[#4a1414] transition-colors"
            >
              Get Started
              <ChevronRight size={14} strokeWidth={1.8} />
            </button>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-[#e8dfd3] bg-white text-[#5a4a3a] text-sm font-medium hover:border-[#5c1a1a]/40 hover:text-[#5c1a1a] transition-colors"
            >
              <LogOut size={14} strokeWidth={1.8} />
              Logout
            </button>
          )}
        </div>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          className="md:hidden w-9 h-9 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center text-[#5a4a3a] hover:text-[#5c1a1a] transition-colors"
        >
          {menuOpen ? <X size={16} strokeWidth={1.8} /> : <Menu size={16} strokeWidth={1.8} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#faf7f3] border-t border-[#e8dfd3] py-6 flex flex-col items-center gap-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                smoothScrollTo(item.id);
                setMenuOpen(false);
              }}
              className={`text-sm transition-colors duration-200 ${
                activeSection === item.id
                  ? "text-[#2a1f14] font-medium"
                  : "text-[#8a7965] hover:text-[#2a1f14]"
              }`}
            >
              {item.label}
            </button>
          ))}

          {showGetStarted && (
            <button
              onClick={() => {
                onGetStarted();
                setMenuOpen(false);
              }}
              className="mt-2 px-6 py-2 rounded-md bg-[#5c1a1a] text-white text-sm font-medium hover:bg-[#4a1414] transition-colors"
            >
              Get Started
            </button>
          )}

          {onLogout && (
            <button
              onClick={() => {
                onLogout();
                setMenuOpen(false);
              }}
              className="inline-flex items-center gap-1.5 px-6 py-2 rounded-md border border-[#e8dfd3] bg-white text-[#5a4a3a] text-sm font-medium hover:text-[#5c1a1a] transition-colors"
            >
              <LogOut size={14} strokeWidth={1.8} />
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;