function AboutContact() {
  return (
    <section className="relative z-10 px-6 py-24 max-w-6xl mx-auto">

      {/* Heading */}
      <div className="relative text-center mb-16">
        <p className="text-[11px] tracking-[0.14em] uppercase text-[#8a7965] mb-3 inline-flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5c1a1a]" />
          About the Creator
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-[#2a1f14]">
          Built with Passion for AI-driven Learning
        </h2>
        <p className="text-[#6a5a48] mt-3 text-sm">
          AI Engineer & Full Stack Developer
        </p>
      </div>

      {/* Grid */}
      <div className="relative grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">

        {/* ============ PROFILE CARD ============ */}
        <div className="bg-white border border-[#e8dfd3] rounded-lg p-8 transition-colors hover:border-[#5c1a1a]/40">
          <div className="text-center md:text-left">

            {/* Avatar */}
            <div className="relative w-24 h-24 mx-auto md:mx-0 mb-5 rounded-md bg-[#5c1a1a] flex items-center justify-center text-2xl font-bold text-white">
              PS
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-[#e8dfd3] flex items-center justify-center">
                <span className="text-[10px] text-[#5c1a1a] font-bold">✓</span>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-[#2a1f14]">
              Prateek Saha
            </h3>

            <p className="text-[#5c1a1a] font-medium mt-1 text-sm">
              AI Engineer & Full Stack Developer
            </p>

            <p className="text-[#6a5a48] mt-4 leading-relaxed text-sm">
              Passionate about building intelligent systems that enhance human learning.
              Currently working on RAG-based AI applications and scalable web platforms.
            </p>

            {/* Tech tags */}
            <div className="flex flex-wrap gap-1.5 mt-4 justify-center md:justify-start">
              {["AI/ML", "RAG", "Full Stack", "Python", "React"].map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] tracking-[0.06em] uppercase px-2.5 py-1 rounded-full border border-[#e8dfd3] bg-[#faf7f3] text-[#5a4a3a] font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Socials */}
            <div className="flex gap-2 mt-5 justify-center md:justify-start">
              {[
                {
                  href: "https://github.com/prateEKsaha07",
                  label: "GitHub",
                  path: "M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.15 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.62.24 2.85.12 3.15.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z",
                },
                {
                  href: "https://www.linkedin.com/in/prateeksaha",
                  label: "LinkedIn",
                  path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
                },
                {
                  href: "https://www.instagram.com/sketchy.prate_ek",
                  label: "Instagram",
                  path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
                },
                {
                  href: "mailto:prateeksaha963@gmail.com",
                  label: "Email",
                  path: null,
                },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center text-[#8a7965] hover:text-[#5c1a1a] hover:border-[#5c1a1a]/40 transition-colors"
                >
                  {social.path ? (
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social.path} />
                    </svg>
                  ) : (
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ============ CONTACT CARD ============ */}
        <div className="bg-white border border-[#e8dfd3] rounded-lg p-8 transition-colors hover:border-[#5c1a1a]/40">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-[#5c1a1a]">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#2a1f14]">
                Contact Me
              </h3>
            </div>

            <p className="text-[#6a5a48] text-sm mb-8">
              Feel free to reach out for collaborations, projects, or just a chat.
            </p>

            <div className="space-y-3 text-sm">
              {[
                {
                  label: "Email",
                  value: "prateeksaha963@gmail.com",
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
                },
                {
                  label: "Location",
                  value: "Chhattisgarh, INDIA",
                  icon: (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </>
                  ),
                },
                {
                  label: "Status",
                  value: "Available for Freelance",
                  status: true,
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-3 p-3 rounded-md border border-[#e8dfd3] bg-[#faf7f3]"
                >
                  <div className="w-8 h-8 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-[#5c1a1a]">
                      {item.icon}
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] tracking-[0.12em] uppercase text-[#8a7965]">
                      {item.label}
                    </p>
                    <p className={`text-sm font-medium mt-0.5 truncate flex items-center gap-2 ${item.status ? "text-[#5c1a1a]" : "text-[#2a1f14]"}`}>
                      {item.status && <span className="w-1.5 h-1.5 rounded-full bg-[#5c1a1a]" />}
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-8 w-full py-3 rounded-md bg-[#5c1a1a] text-white text-sm font-medium hover:bg-[#4a1414] transition-colors flex items-center justify-center gap-2">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send Message
            </button>
          </div>
        </div>

        {/* ============ PORTFOLIO CARD ============ */}
        <div className="bg-white border border-[#e8dfd3] rounded-lg p-8 transition-colors hover:border-[#5c1a1a]/40 md:col-span-2 lg:col-span-1 flex flex-col">
          <div className="flex flex-col h-full">

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-[#5c1a1a]">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#2a1f14]">
                Portfolio
              </h3>
            </div>

            <p className="text-[#6a5a48] text-sm mb-6">
              Explore my complete body of work — projects, skills, and experience in AI, backend, and full-stack engineering.
            </p>

            {/* Link preview */}
            <a
              href="https://prateeksaha-dev.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-md p-4 mb-6 bg-[#faf7f3] border border-[#e8dfd3] hover:border-[#5c1a1a]/40 transition-colors group/link"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5c1a1a]" />
                <span className="text-[10px] uppercase tracking-[0.12em] text-[#8a7965] font-semibold">
                  Live site
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#2a1f14] truncate">
                    prateeksaha-dev.vercel.app
                  </p>
                  <p className="text-[11px] text-[#8a7965] mt-0.5">
                    Projects · Skills · Experience
                  </p>
                </div>
                <svg
                  width="14"
                  height="14"
                  className="text-[#5c1a1a] group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 17L17 7M7 7h10v10" />
                </svg>
              </div>
            </a>

            {/* Highlights */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {["Projects", "Skills", "Experience", "Education"].map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] tracking-[0.06em] uppercase px-2.5 py-1 rounded-full border border-[#e8dfd3] bg-[#faf7f3] text-[#5a4a3a] font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA */}
            <a
              href="https://prateeksaha-dev.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto w-full py-3 rounded-md bg-[#5c1a1a] text-white text-sm font-medium hover:bg-[#4a1414] transition-colors flex items-center justify-center gap-2"
            >
              Visit Portfolio
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>

      </div>

      {/* Bottom divider */}
      <div className="mt-16 flex justify-center">
        <div className="w-32 h-px bg-[#e8dfd3]" />
      </div>
    </section>
  );
}

export default AboutContact;