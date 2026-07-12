import { useEffect, useState } from "react";

function NoticePopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(true);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div
        className="
          relative w-full max-w-xl
          rounded-3xl
          bg-[#0d111f]/90
          border border-white/10
          shadow-2xl
          p-8
          animate-[fadeIn_.35s_ease]
        "
      >
        {/* Glow */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 px-4 py-1 text-yellow-300 text-sm">
            🚧 Development Notice
          </div>

          <h2 className="mt-5 text-3xl font-bold text-white">
            Welcome!
          </h2>

          <p className="mt-5 text-gray-300 leading-8">
            This project is still <span className="font-semibold text-white">actively under development</span>.
            New features, UI improvements, and plenty of questionable late-night ideas are being added regularly.
            Im currently working on data migration and changing projects folder structure bcuz its getting way too large to manage for me.
          </p>

          <p className="mt-4 text-gray-400 leading-8">
            Also... yes, it's still called <span className="text-blue-300 font-semibold">RAG_V2</span>.
            Naming things is apparently harder than building AI. 😅
          </p>

          <p className="mt-4 text-gray-400">
            A better name is definitely on the roadmap.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setOpen(false)}
              className="
                flex-1 py-3 rounded-xl
                bg-blue-600 hover:bg-blue-700
                transition
                font-medium
              "
            >
              Got it 👍
            </button>

            <button
              onClick={() => setOpen(false)}
              className="
                flex-1 py-3 rounded-xl
                bg-white/5 hover:bg-white/10
                border border-white/10
                transition
              "
            >
              Us Broo! 😭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoticePopup;