import { useEffect, useState } from "react";

function LeftVisual() {
  const messages = [
    "Analyzing your study patterns...",
    "Indexing your notes into vectors...",
    "Building semantic understanding...",
    "Preparing AI responses...",
    "Optimizing retrieval layers...",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden lg:flex w-1/2 relative overflow-hidden">

      {/* background image */}
      <img
        src="https://images.unsplash.com/photo-1677442136019-21780ecad995"
        className="absolute inset-0 w-full h-full object-cover opacity-50 scale-110"
      />

      {/* overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#0B1220] via-[#0B1220]/70 to-transparent" />

      {/* floating glow */}
      <div className="absolute w-[450px] h-[450px] bg-blue-500/20 blur-[140px] rounded-full bottom-[-120px] left-[-120px]" />

      {/* CONTENT */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center px-16">

        {/* TITLE */}
        <h1 className="text-4xl font-bold leading-tight">
          AI System Active
        </h1>

        <p className="mt-3 text-gray-300 max-w-md">
          RAG_V2 is currently processing and structuring your knowledge base in real time.
        </p>

        {/* LIVE STATUS */}
        <div className="mt-8 flex items-center gap-3">

          {/* pulsing dot */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>

          <span className="text-green-400 text-sm font-medium">
            Live Processing
          </span>
        </div>

        {/* dynamic message box */}
        <div className="
          mt-8
          bg-white/5 backdrop-blur-xl
          px-5 py-4 rounded-2xl
          w-fit
          transition-all duration-500
        ">
          <p className="text-sm text-gray-200">
            {messages[index]}
          </p>

          {/* animated bar */}
          <div className="mt-3 h-1 w-40 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-gradient-to-r from-blue-500 to-cyan-400 animate-pulse" />
          </div>
        </div>

        {/* mini insights */}
        <div className="mt-10 space-y-3">

          <div className="flex items-center gap-3 text-sm text-gray-300">
            <span className="text-blue-400">▸</span>
            Chunking documents into semantic blocks
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-300">
            <span className="text-purple-400">▸</span>
            Creating vector embeddings
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-300">
            <span className="text-cyan-400">▸</span>
            Enabling contextual retrieval
          </div>

        </div>
      </div>
    </div>
  );
}

export default LeftVisual;