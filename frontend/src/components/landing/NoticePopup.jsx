import { useEffect, useState } from "react";
import {
  Sparkles,
  X,
  Rocket,
  AlertCircle,
  Smile,
  ThumbsUp,
  Construction,
  Hand,
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
    <div
      className="
        fixed inset-0 z-[999] flex items-center justify-center
        bg-black/30 backdrop-blur-sm px-4
        animate-backdrop-in
      "
    >
      <div
        className="
          relative w-full max-w-xl
          rounded-3xl
          bg-white/95
          backdrop-blur-xl
          border border-rose-200/30
          shadow-2xl shadow-rose-200/20
          p-8
          animate-pop-in
          hover:-translate-y-0.5
          transition-transform duration-300
        "
      >
        {/* Glow - warm colors */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-rose-100/20 via-amber-100/20 to-orange-100/20 blur-3xl pointer-events-none" />

        {/* Floating decorative orbs (fun background motion) */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute w-24 h-24 rounded-full bg-rose-300/20 blur-2xl -top-6 -left-6 animate-float-slow" />
          <div className="absolute w-32 h-32 rounded-full bg-amber-300/20 blur-2xl -bottom-8 -right-8 animate-float-slower" />
        </div>

        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          aria-label="Close notice"
          className="
            absolute top-4 right-4 p-2 rounded-xl
            hover:bg-rose-50 active:scale-90
            transition-all duration-200
            text-gray-400 hover:text-rose-600
            z-20
          "
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10">
          {/* BADGE */}
          <div
            className="
              inline-flex items-center gap-2 rounded-full
              bg-gradient-to-r from-rose-100/80 to-amber-100/80
              border border-rose-200/30 px-4 py-1.5
              text-rose-700 text-sm font-medium
              animate-fade-up-1
            "
          >
            <Rocket className="w-4 h-4 animate-rocket" />
            <Construction className="w-4 h-4 animate-wobble text-amber-600" />
            Development Notice
          </div>

          {/* HEADING */}
          <h2 className="mt-5 text-3xl font-bold text-gray-800 flex items-center gap-2 animate-fade-up-2">
            <Sparkles className="w-7 h-7 text-amber-500 animate-sparkle" />
            Welcome!
            <span className="inline-block animate-wave origin-[70%_70%]">👋</span>
          </h2>

          {/* MAIN TEXT */}
          <p className="mt-4 text-gray-600 leading-8 animate-fade-up-3">
            This project is still{" "}
            <span className="font-semibold text-rose-600">
              actively under development
            </span>
            . New features, UI improvements, and plenty of questionable
            late-night ideas are being added regularly. I'm currently working on
            data migration and changing projects folder structure because it's
            getting way too large to manage for me.
          </p>

          {/* FUN CALLOUT BOX */}
          <div
            className="
              mt-4 p-4 rounded-xl
              bg-gradient-to-r from-amber-50/50 to-orange-50/50
              border border-amber-200/30
              animate-fade-up-4
              relative overflow-hidden
            "
          >
            {/* subtle shimmer sweep */}
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

            <p className="relative text-gray-600 leading-7">
              Also... yes, it's still called{" "}
              <span className="text-amber-600 font-semibold">RAG_V2</span>.
              Naming things is apparently harder than building AI.{" "}
              <span className="inline-block animate-wiggle">😅</span>
            </p>
            <p className="relative text-gray-500 text-sm mt-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 animate-pulse-soft" />
              A better name is definitely on the roadmap.
            </p>
          </div>

          {/* BUTTONS */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 animate-fade-up-5">
            <button
              onClick={() => setOpen(false)}
              className="
                group relative flex-1 py-3 rounded-xl
                bg-gradient-to-r from-rose-500 to-amber-500
                hover:from-rose-600 hover:to-amber-600
                text-white font-medium
                transition-all duration-300
                shadow-lg shadow-rose-200/50
                hover:shadow-xl hover:shadow-rose-300/50
                hover:scale-[1.02] active:scale-[0.98]
                flex items-center justify-center gap-2
                overflow-hidden
              "
            >
              {/* animated shimmer sweep on hover */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <ThumbsUp className="w-4 h-4 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
              <span className="relative z-10">Got it</span>
            </button>

            <button
              onClick={() => setOpen(false)}
              className="
                group flex-1 py-3 rounded-xl
                bg-white/80 border border-rose-200/30
                hover:bg-rose-50 hover:border-rose-200
                active:scale-[0.98]
                text-gray-600 hover:text-rose-600
                transition-all duration-200
                flex items-center justify-center gap-2
                font-medium
              "
            >
              <Smile className="w-4 h-4 group-hover:-rotate-12 transition-transform duration-300" />
              Us Broo! <span className="inline-block animate-wiggle">😭</span>
            </button>
          </div>

          {/* Decorative dots */}
          <div className="absolute bottom-6 right-6 flex gap-1.5 opacity-20">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse-soft" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-soft delay-100" />
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse-soft delay-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoticePopup;