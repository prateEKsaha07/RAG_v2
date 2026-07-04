import { useEffect, useState } from "react";

function Navbar({ onGetStarted, showGetStarted = true, onHome, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { label: "Home", id: "home" },
    { label: "Products", id: "features" },
    { label: "About", id: "about" },
    { label: "Contact", id: "contact" },
  ];

  // smooth Apple-style scroll
  const smoothScrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;

    const target =
      el.getBoundingClientRect().top + window.pageYOffset;

    const start = window.pageYOffset;
    const distance = target - start;
    const duration = 900;

    let startTime = null;

    const ease = (t) =>
      t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;

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

  // scroll spy (active section detection)
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

  // navbar blur on scroll
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50">

      {/* glass background */}
      <div
        className={`
          absolute inset-0 transition-all duration-500
          ${
            scrolled
              ? "bg-[#050816]/80 backdrop-blur-2xl border-b border-white/10"
              : "bg-[#050816]/40 backdrop-blur-md"
          }
        `}
      />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10 py-4 flex justify-between items-center">

        {/* LOGO */}
        <button
          onClick={onHome}
          className="text-xl font-bold hover:scale-105 transition"
        >
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
            RAG_V2
          </span>
        </button>

        {/* DESKTOP NAV */}
        <ul className="hidden md:flex items-center gap-10 text-sm">

          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => smoothScrollTo(item.id)}
                className={`
                  relative transition-all duration-300
                  ${
                    activeSection === item.id
                      ? "text-white"
                      : "text-gray-400 hover:text-white"
                  }
                `}
              >
                {item.label}

                {/* active underline */}
                <span
                  className={`
                    absolute left-0 -bottom-1 h-[2px] w-full
                    bg-gradient-to-r from-blue-400 to-purple-400
                    transition-transform duration-300 origin-left
                    ${
                      activeSection === item.id
                        ? "scale-x-100"
                        : "scale-x-0"
                    }
                  `}
                />
              </button>
            </li>
          ))}

        </ul>

        {/* RIGHT ACTIONS */}
        <div className="hidden md:flex items-center gap-3">

          {showGetStarted && (
            <button
              onClick={onGetStarted}
              className="
                px-5 py-2 rounded-xl text-sm font-medium
                bg-white text-black
                hover:scale-105 transition
              "
            >
              Get Started
            </button>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              className="
                px-5 py-2 rounded-xl text-sm font-medium
                bg-white/5 text-gray-300 border border-white/10
                hover:bg-red-500/20 hover:text-white
                transition
              "
            >
              Logout
            </button>
          )}

        </div>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white"
        >
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#050816]/95 backdrop-blur-xl border-t border-white/10 py-6 flex flex-col items-center gap-5">

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                smoothScrollTo(item.id);
                setMenuOpen(false);
              }}
              className={`
                text-sm transition
                ${
                  activeSection === item.id
                    ? "text-white"
                    : "text-gray-400"
                }
              `}
            >
              {item.label}
            </button>
          ))}

        </div>
      )}
    </nav>
  );
}

export default Navbar;