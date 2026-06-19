import { useState } from "react"

function Navbar({ onGetStarted, showGetStarted = true, onHome }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-black px-8 py-4 flex justify-between items-center border-b border-gray-800">
      
      {/* Logo */}
      <button onClick={onHome} className="text-white text-2xl font-bold tracking-tight hover:text-blue-400 transition">
        RAG_V2
      </button>

      {/* Desktop Links */}
      <ul className="hidden md:flex items-center gap-8 text-sm text-gray-300">
        {[["Home", onHome], ["Products", null], ["About", null], ["Contact", null]].map(([label, action]) => (
          <li key={label}>
            <button onClick={action} className="relative group hover:text-white transition">
              {label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300" />
            </button>
          </li>
        ))}
      </ul>

      {/* Get Started */}
      {showGetStarted && (
        <button onClick={onGetStarted}
          className="hidden md:block bg-white text-black px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 hover:text-white transition duration-300">
          Get Started
        </button>
      )}

      {/* Mobile Toggle */}
      <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-black border-t border-gray-800 flex flex-col items-center gap-4 py-6 md:hidden">
          {["Home", "Products", "About", "Contact"].map(label => (
            <button key={label} onClick={label === "Home" ? onHome : null}
              className="text-gray-300 hover:text-white transition text-sm">
              {label}
            </button>
          ))}
          {showGetStarted && (
            <button onClick={onGetStarted}
              className="bg-white text-black px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 hover:text-white transition">
              Get Started
            </button>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar