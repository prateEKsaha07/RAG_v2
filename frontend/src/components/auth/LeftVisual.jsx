import { useEffect, useState } from "react";
import { Sparkles, Zap, Cpu, Database, Brain, Rocket } from "lucide-react";

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
    <div className="hidden lg:flex w-1/2 relative overflow-hidden min-h-screen bg-[#f7f3ee]">

      {/* background image */}
      <img
        src="https://images.unsplash.com/photo-1677442136019-21780ecad995"
        className="absolute inset-0 w-full h-full object-cover opacity-[0.08]"
        alt=""
        aria-hidden="true"
      />

      {/* CONTENT */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center px-16">

        {/* BADGE */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#e8dfd3] bg-white text-[10px] tracking-[0.14em] uppercase text-[#5a4a3a] font-medium w-fit">
          <Rocket size={11} strokeWidth={1.8} className="text-[#5c1a1a]" />
          AI System Active
        </div>

        {/* TITLE */}
        <h1 className="text-4xl font-bold leading-tight mt-5 text-[#2a1f14]">
          AI System Active
        </h1>

        <p className="mt-4 text-[#6a5a48] max-w-md leading-relaxed">
          RAG_V2 is currently processing and structuring your knowledge base in real time.
        </p>

        {/* LIVE STATUS */}
        <div className="mt-7 flex items-center gap-2.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#5c1a1a]" />
          <span className="text-[11px] tracking-[0.12em] uppercase text-[#5a4a3a] font-medium">
            Live Processing
          </span>
        </div>

        {/* Dynamic message box */}
        <div className="mt-6 bg-white border border-[#e8dfd3] rounded-lg px-5 py-4 w-fit max-w-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center flex-shrink-0">
              <Brain size={14} strokeWidth={1.8} className="text-[#5c1a1a]" />
            </div>
            <p className="text-sm text-[#2a1f14] font-medium">
              {messages[index]}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1 w-48 bg-[#f0e9e0] rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-[#5c1a1a] rounded-full" />
          </div>
        </div>

        {/* Insights */}
        <div className="mt-8 space-y-2">
          {[
            { label: "Chunking documents into semantic blocks", icon: Database },
            { label: "Creating vector embeddings", icon: Zap },
            { label: "Enabling contextual retrieval", icon: Cpu },
          ].map((row) => {
            const Icon = row.icon;
            return (
              <div
                key={row.label}
                className="flex items-center gap-3 text-sm text-[#6a5a48] bg-white border border-[#e8dfd3] px-4 py-2.5 rounded-md w-fit max-w-md"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#5c1a1a] flex-shrink-0" />
                <span className="truncate">{row.label}</span>
                <Icon size={13} strokeWidth={1.8} className="text-[#8a7965] flex-shrink-0" />
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-10 flex items-center gap-3">
          <div className="w-12 h-px bg-[#e8dfd3]" />
          <span className="text-[10px] tracking-[0.12em] uppercase text-[#8a7965]">
            Powered by RAG
          </span>
          <div className="w-12 h-px bg-[#e8dfd3]" />
        </div>
      </div>
    </div>
  );
}

export default LeftVisual;