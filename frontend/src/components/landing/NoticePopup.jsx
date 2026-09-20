import { useEffect, useState } from "react";
import {
  Sparkles,
  X,
  Rocket,
  AlertCircle,
  ThumbsUp,
  Construction,
  Clock,
  Monitor,
} from "lucide-react";

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
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#2a1f14]/40 px-4 py-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl my-auto rounded-lg bg-white border border-[#e8dfd3] p-8">

        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          aria-label="Close notice"
          className="absolute top-4 right-4 w-9 h-9 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center text-[#8a7965] hover:text-[#5c1a1a] hover:border-[#5c1a1a]/40 transition-colors z-20"
        >
          <X size={16} strokeWidth={1.8} />
        </button>

        <div className="relative">

          {/* BADGE */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e8dfd3] bg-[#faf7f3] px-3.5 py-1.5 text-[10px] uppercase tracking-[0.14em] text-[#5a4a3a] font-medium">
            <Construction size={12} strokeWidth={1.8} className="text-[#5c1a1a]" />
            Development Notice
          </div>

          {/* HEADING */}
          <h2 className="mt-5 text-2xl font-bold text-[#2a1f14]">
            Welcome
          </h2>

          {/* MAIN TEXT */}
          <p className="mt-3 text-[#6a5a48] leading-relaxed text-sm">
            This project is still{" "}
            <span className="font-semibold text-[#5c1a1a]">
              actively under development
            </span>
            . New features, UI improvements, and plenty of questionable
            late-night ideas are being added regularly. I'm currently working on
            data migration and restructuring the project folders because it's
            getting way too large to manage.
          </p>

          {/* COLD START */}
          <div className="mt-5 p-4 rounded-md border border-[#e8dfd3] bg-[#faf7f3]">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center flex-shrink-0">
                <Clock size={14} strokeWidth={1.8} className="text-[#5c1a1a]" />
              </div>
              <div className="min-w-0">
                <p className="text-[#2a1f14] font-semibold text-sm">
                  Heads up — first load may take a moment
                </p>
                <p className="text-[#6a5a48] text-[13px] leading-6 mt-1">
                  The backend runs on{" "}
                  <span className="font-semibold text-[#2a1f14]">
                    Render's free tier
                  </span>
                  , which sleeps after inactivity. Logging in, signing up,
                  uploading files, or opening existing data might take{" "}
                  <span className="font-semibold text-[#2a1f14]">
                    30–60 seconds
                  </span>{" "}
                  the first time. After that, everything runs smoothly.
                </p>
              </div>
            </div>
          </div>

          {/* DEVICE RECOMMENDATION */}
          <div className="mt-3 p-4 rounded-md border border-[#e8dfd3] bg-[#faf7f3]">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center flex-shrink-0">
                <Monitor size={14} strokeWidth={1.8} className="text-[#5c1a1a]" />
              </div>
              <div className="min-w-0">
                <p className="text-[#2a1f14] font-semibold text-sm">
                  Best experienced on desktop
                </p>
                <p className="text-[#6a5a48] text-[13px] leading-6 mt-1">
                  This app isn't fully optimized for mobile screens yet. For
                  the best experience, please use a{" "}
                  <span className="font-semibold text-[#2a1f14]">
                    laptop or desktop
                  </span>
                  . Mobile support is on the roadmap.
                </p>
              </div>
            </div>
          </div>

          {/* FUN CALLOUT */}
          <div className="mt-3 p-4 rounded-md border border-[#e8dfd3] bg-[#faf7f3]">
            <p className="text-[#6a5a48] leading-relaxed text-sm">
              Also... yes, it's still called{" "}
              <span className="text-[#5c1a1a] font-semibold">RAG_V2</span>.
              Naming things is apparently harder than building AI.
            </p>
            <p className="text-[#8a7965] text-xs mt-2 flex items-center gap-2">
              <AlertCircle size={13} strokeWidth={1.8} className="text-[#5c1a1a] flex-shrink-0" />
              A better name is definitely on the roadmap.
            </p>
          </div>

          {/* BUTTON */}
          <div className="mt-6">
            <button
              onClick={() => setOpen(false)}
              className="w-full py-3 rounded-md bg-[#5c1a1a] text-white text-sm font-medium hover:bg-[#4a1414] transition-colors flex items-center justify-center gap-2"
            >
              <ThumbsUp size={14} strokeWidth={1.8} />
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoticePopup;