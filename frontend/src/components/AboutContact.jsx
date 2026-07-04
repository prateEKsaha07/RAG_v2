function AboutContact() {
  return (
    <section className="relative z-10 px-6 py-24 max-w-6xl mx-auto text-white">

      {/* background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[140px] rounded-full" />
      </div>

      {/* heading */}
      <div className="relative text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold">
          About the Creator
        </h2>
        <p className="text-gray-400 mt-3">
          Built with passion for AI-driven learning systems
        </p>
      </div>

      {/* main card */}
      <div className="relative grid md:grid-cols-2 gap-10 items-center">

        {/* PROFILE CARD */}
        <div className="
          group relative rounded-3xl p-8
          bg-white/5 backdrop-blur-xl
          transition-all duration-500
          hover:-translate-y-2
        ">

          {/* glow */}
          <div className="
            absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100
            bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10
            blur-2xl transition
          " />

          <div className="relative z-10 text-center md:text-left">

            {/* avatar */}
            <div className="
              w-24 h-24 mx-auto md:mx-0 mb-5
              rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500
              flex items-center justify-center text-2xl font-bold
              shadow-lg
            ">
              PS
            </div>

            <h3 className="text-2xl font-semibold">
              Prateek Saha
            </h3>

            <p className="text-gray-400 mt-2">
              AI Engineer & Full Stack Developer
            </p>

            <p className="text-gray-500 mt-5 leading-relaxed text-sm">
              Passionate about building intelligent systems that enhance human learning.
              Currently working on RAG-based AI applications and scalable web platforms.
            </p>

            {/* socials */}
            <div className="flex gap-4 mt-6 justify-center md:justify-start">

              <a href="https://github.com/prateEKsaha07" className="text-gray-400 hover:text-white transition">
                GitHub
              </a>

              <a href="https://www.linkedin.com/in/prateeksaha" className="text-gray-400 hover:text-white transition">
                LinkedIn
              </a>

              <a href="https://www.instagram.com/sketchy.prate_ek" className="text-gray-400 hover:text-white transition">
                Instagram
              </a>

            </div>
          </div>
        </div>

        {/* CONTACT CARD */}
        <div className="
          group relative rounded-3xl p-8
          bg-white/5 backdrop-blur-xl
          transition-all duration-500
          hover:-translate-y-2
        ">

          {/* glow */}
          <div className="
            absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100
            bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10
            blur-2xl transition
          " />

          <div className="relative z-10">

            <h3 className="text-2xl font-semibold mb-6">
              Contact Me
            </h3>

            <p className="text-gray-400 text-sm mb-8">
              Feel free to reach out for collaborations, projects, or just a chat.
            </p>

            {/* contact items */}
            <div className="space-y-5 text-sm">

              <div>
                <p className="text-gray-500">Email</p>
                <p className="text-white">Prateek@example.com</p>
              </div>

              <div>
                <p className="text-gray-500">Location</p>
                <p className="text-white">Chhattisgarh, INDIA</p>
              </div>

              <div>
                <p className="text-gray-500">Status</p>
                <p className="text-green-400">Available for Freelance</p>
              </div>

            </div>

            {/* button */}
            <button className="
              mt-8 w-full py-3 rounded-xl
              bg-white text-black font-medium
              hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500
              hover:text-white transition
            ">
              Send Message
            </button>

          </div>
        </div>

      </div>
    </section>
  );
}

export default AboutContact;