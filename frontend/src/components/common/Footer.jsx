import logo from "../../../public/logo.svg";

function Footer() {
  return (
    <div className="bg-[#faf7f3] border-t border-[#e8dfd3]">
      <footer className="w-full max-w-[1350px] mx-auto px-6 sm:px-10 md:px-16 lg:px-24 pt-20 pb-12">

        {/* ============ TOP ============ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* LEFT - Brand */}
          <div className="space-y-4">
            <a href="/" className="inline-block">
              <img
                src={logo}
                alt="RAG_v2"
                className="h-9 w-auto opacity-90 hover:opacity-100 transition-opacity"
              />
            </a>
            <h1 className="text-[clamp(2.5rem,7vw,4.5rem)] font-bold leading-[0.95] tracking-tight text-[#2a1f14]">
              RAG<span className="text-[#5c1a1a]">_v2</span>
            </h1>
          </div>

          {/* RIGHT - Mailing list */}
          <div className="lg:pt-1">
            <p className="text-[11px] tracking-[0.14em] uppercase text-[#8a7965] mb-3">
              Newsletter
            </p>
            <h2 className="text-xl sm:text-2xl font-semibold leading-tight text-[#2a1f14]">
              Join the mailing list to stay updated on RAG_v2.
            </h2>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-8 flex items-end gap-4"
            >
              <div className="flex-1">
                <label
                  htmlFor="footer-email"
                  className="block text-[11px] tracking-[0.12em] uppercase text-[#8a7965] mb-1.5"
                >
                  Your email address
                </label>
                <input
                  id="footer-email"
                  type="email"
                  placeholder=""
                  className="w-full bg-transparent border-b border-[#e8dfd3] focus:border-[#5c1a1a] outline-none py-1.5 text-sm text-[#2a1f14] transition-colors"
                />
              </div>

              <button
                type="submit"
                className="shrink-0 px-5 py-2 rounded-md bg-[#5c1a1a] text-white text-xs font-medium hover:bg-[#4a1414] transition-colors"
              >
                Sign up
              </button>
            </form>

            <p className="text-[11px] text-[#8a7965] mt-4 max-w-md leading-relaxed">
              Please enter an email address.
            </p>

            <p className="text-[11px] text-[#8a7965] mt-3 max-w-lg leading-relaxed">
              The RAG_v2 team may keep me informed with personalized emails about
              updates. See our{" "}
              <a href="#" className="underline underline-offset-2 hover:text-[#5c1a1a] transition-colors">
                Privacy Policy
              </a>{" "}
              for more details or to opt-out at any time.
            </p>
          </div>
        </div>

        {/* ============ SOCIALS ============ */}
        <div className="mt-16 flex gap-3">
          <a
            href="https://x.com/Prate_ek7"
            aria-label="X"
            className="w-9 h-9 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center text-[#8a7965] hover:text-[#5c1a1a] hover:border-[#5c1a1a]/40 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.6-6.64 7.6H.47l8.6-9.83L0 1.15h7.59l5.24 6.93z" />
            </svg>
          </a>

          <a
            href="https://github.com/prateEKsaha07"
            aria-label="GitHub"
            className="w-9 h-9 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center text-[#8a7965] hover:text-[#5c1a1a] hover:border-[#5c1a1a]/40 transition-colors"
          >
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 .5C5.73.5.75 5.62.75 12c0 5.1 3.29 9.43 7.86 10.96.57.1.78-.25.78-.55v-2c-3.2.7-3.88-1.38-3.88-1.38-.52-1.35-1.28-1.71-1.28-1.71-1.05-.73.08-.72.08-.72 1.16.08 1.77 1.22 1.77 1.22 1.04 1.82 2.73 1.29 3.4.99.1-.77.4-1.29.73-1.59-2.56-.3-5.25-1.32-5.25-5.88 0-1.3.45-2.37 1.18-3.21-.12-.3-.51-1.52.11-3.17 0 0 .97-.32 3.18 1.23a10.8 10.8 0 0 1 5.8 0c2.21-1.55 3.18-1.23 3.18-1.23.62 1.65.23 2.87.11 3.17.73.84 1.18 1.91 1.18 3.21 0 4.57-2.69 5.57-5.26 5.87.41.37.78 1.1.78 2.22v3.29c0 .3.21.65.79.54A10.75 10.75 0 0 0 23.25 12C23.25 5.62 18.27.5 12 .5z" />
            </svg>
          </a>

          <a
            href="https://www.linkedin.com"
            aria-label="LinkedIn"
            className="w-9 h-9 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center text-[#8a7965] hover:text-[#5c1a1a] hover:border-[#5c1a1a]/40 transition-colors"
          >
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.05-1.86-3.05-1.86 0-2.14 1.45-2.14 2.95v5.67H9.33V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.26 2.37 4.26 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45z" />
            </svg>
          </a>
        </div>

        {/* ============ BOTTOM BAR ============ */}
        <div className="mt-16 pt-6 border-t border-[#e8dfd3] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <a
            href="#"
            className="text-sm text-[#5c1a1a] underline underline-offset-4 hover:text-[#4a1414] transition-colors"
          >
            Contact event support
          </a>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#8a7965]">
            <span>© 2026 RAG_v2. All rights reserved.</span>
            <a href="#" className="hover:text-[#5c1a1a] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#5c1a1a] transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-[#5c1a1a] transition-colors">Cookie preferences</a>
          </div>
        </div>

      </footer>
    </div>
  );
}

export default Footer;