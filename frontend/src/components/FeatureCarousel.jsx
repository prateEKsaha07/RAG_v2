import { useEffect, useState } from "react";

function FeatureCarousel() {
  const slides = [
    {
      title: "AI Chat with Your Notes",
      desc: "Ask questions and get grounded answers directly from your study material using RAG-based retrieval.",
      img: "https://images.unsplash.com/photo-1526378722484-bd91ca387e72",
    },
    {
      title: "Smart Quiz Generator",
      desc: "Automatically generate MCQs from your notes and test your understanding instantly.",
      img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
    },
    {
      title: "Performance Analytics",
      desc: "Track weak topics and improve your learning efficiency with AI insights.",
      img: "https://images.unsplash.com/photo-1556741533-f6acd647d2fb",
    },
    {
      title: "Upload & Index Notes",
      desc: "Upload markdown notes and let AI structure and index them instantly.",
      img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
    },
  ];

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // AUTO ROTATION
  useEffect(() => {
  const interval = setInterval(() => {
    setIndex((prev) => {
      const next = prev + 1;
      return next >= slides.length ? 0 : next;
    });
  }, 4500);

  return () => clearInterval(interval);
}, []);

  // KEYBOARD SUPPORT
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div
      className="w-full py-24 relative flex flex-col items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >

      {/* HEADING */}
      <div className="text-center mb-10 px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Powerful Features Built for Students
        </h2>
        <p className="text-gray-400 mt-3">
          Everything you need to learn faster with AI assistance
        </p>
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full max-w-5xl px-6 mb-6">
        <div className="h-[2px] w-full bg-white/10 overflow-hidden rounded-full">
          <div
            className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 transition-all duration-700"
            style={{
              width: `${((index + 1) / slides.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* CAROUSEL */}
      <div className="relative w-full max-w-5xl px-6">

        {/* LEFT ARROW */}
        <button
          onClick={prevSlide}
          className="
            absolute left-2 md:-left-6 top-1/2 -translate-y-1/2
            z-20 w-12 h-12 rounded-full
            bg-black/30 hover:bg-black/60
            backdrop-blur-xl text-white text-xl
            transition
          "
        >
          ‹
        </button>

        {/* RIGHT ARROW */}
        <button
          onClick={nextSlide}
          className="
            absolute right-2 md:-right-6 top-1/2 -translate-y-1/2
            z-20 w-12 h-12 rounded-full
            bg-black/30 hover:bg-black/60
            backdrop-blur-xl text-white text-xl
            transition
          "
        >
          ›
        </button>

        {/* SLIDES */}
        <div className="relative overflow-hidden rounded-3xl">

          <div
            className="flex transition-all duration-700 ease-in-out"
            style={{
              transform: `translateX(-${index * 100}%)`,
            }}
          >

            {slides.map((item, i) => (
              <div
                key={i}
                className="min-w-full flex flex-col md:flex-row items-stretch relative"
              >

                {/* BACKGROUND GLOW (image blur) */}
                <div
                  className="absolute inset-0 scale-110 blur-3xl opacity-30"
                  style={{
                    backgroundImage: `url(${item.img})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />

                {/* LEFT IMAGE */}
                <div className="md:w-1/2 h-64 md:h-[420px] relative">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* RIGHT CONTENT */}
                <div className="md:w-1/2 flex flex-col justify-center p-10 relative z-10">
                  <h3 className="text-2xl md:text-3xl font-bold text-white">
                    {item.title}
                  </h3>

                  <p className="text-gray-300 mt-4 leading-relaxed">
                    {item.desc}
                  </p>

                  <div className="mt-6 w-16 h-[2px] bg-gradient-to-r from-blue-400 to-purple-500 rounded-full" />
                </div>

              </div>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}

export default FeatureCarousel;