/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        /* ---------- Base fade-up ---------- */
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },

        /* ---------- Backdrop + card entrance ---------- */
        backdropIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        popIn: {
          "0%": { opacity: "0", transform: "scale(0.94) translateY(8px)" },
          "60%": { opacity: "1", transform: "scale(1.02) translateY(-2px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },

        /* ---------- Floating orbs ---------- */
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "50%": { transform: "translateY(-14px) translateX(6px)" },
        },
        floatSlower: {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "50%": { transform: "translateY(12px) translateX(-8px)" },
        },

        /* ---------- Icon micro-animations ---------- */
        rocket: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-3px) rotate(-6deg)" },
        },
        wobble: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-8deg)" },
          "75%": { transform: "rotate(8deg)" },
        },
        sparkle: {
          "0%, 100%": { opacity: "1", transform: "scale(1) rotate(0deg)" },
          "50%": { opacity: "0.7", transform: "scale(1.15) rotate(10deg)" },
        },
        wave: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "20%": { transform: "rotate(20deg)" },
          "40%": { transform: "rotate(-10deg)" },
          "60%": { transform: "rotate(14deg)" },
          "80%": { transform: "rotate(-6deg)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-6deg)" },
          "75%": { transform: "rotate(6deg)" },
        },

        /* ---------- Ambient effects ---------- */
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },

        /* ---------- Caret + dots (typewriter / chat) ---------- */
        caret: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        dot: {
          "0%, 100%": { opacity: "0.3", transform: "scale(0.85)" },
          "50%": { opacity: "1", transform: "scale(1)" },
        },

        /* ---------- Pop check + upload bob ---------- */
        popCheck: {
          "0%": { transform: "scale(0)", opacity: "0" },
          "60%": { transform: "scale(1.2)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        uploadBob: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },

        /* ---------- About section ---------- */
        aboutFloat: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(20px, -25px) scale(1.05)" },
          "66%": { transform: "translate(-15px, 15px) scale(0.97)" },
        },
        badgeFloat: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        sparkleSoft: {
          "0%, 100%": { opacity: "1", transform: "scale(1) rotate(0deg)" },
          "50%": { opacity: "0.6", transform: "scale(1.2) rotate(15deg)" },
        },
        iconBreathe: {
          "0%, 100%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(255, 190, 145, 0)" },
          "50%": { transform: "scale(1.06)", boxShadow: "0 0 20px 4px rgba(255, 190, 145, 0.25)" },
        },
        lineShimmer: {
          "0%, 100%": { opacity: "0.3", transform: "translateX(-3px)" },
          "50%": { opacity: "0.9", transform: "translateX(3px)" },
        },
      },
      animation: {
        /* ---------- Base ---------- */
        fadeUp: "fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",

        /* ---------- Staggered fade-ups for NoticePopup ---------- */
        "fade-up-1": "fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both",
        "fade-up-2": "fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both",
        "fade-up-3": "fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both",
        "fade-up-4": "fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both",
        "fade-up-5": "fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.45s both",
        "fade-up-6": "fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.55s both",
        "fade-up-7": "fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.65s both",
        "fade-up-8": "fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.75s both",

        /* ---------- Popup entrance ---------- */
        "backdrop-in": "backdropIn 0.3s ease-out forwards",
        "pop-in": "popIn 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards",

        /* ---------- Floating orbs ---------- */
        "float-slow": "floatSlow 7s ease-in-out infinite",
        "float-slower": "floatSlower 9s ease-in-out infinite",

        /* ---------- Icon micro ---------- */
        rocket: "rocket 2.4s ease-in-out infinite",
        wobble: "wobble 2s ease-in-out infinite",
        sparkle: "sparkle 2.2s ease-in-out infinite",
        wave: "wave 1.6s ease-in-out infinite",
        wiggle: "wiggle 1.2s ease-in-out infinite",

        /* ---------- Ambient ---------- */
        "pulse-soft": "pulseSoft 2.4s ease-in-out infinite",
        shimmer: "shimmer 2.4s ease-in-out infinite",

        /* ---------- Caret + dots ---------- */
        caret: "caret 1s ease-in-out infinite",
        dot: "dot 1.2s ease-in-out infinite",

        /* ---------- Pop check + upload bob ---------- */
        "pop-check": "popCheck 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "upload-bob": "uploadBob 2s ease-in-out infinite",

        /* ---------- About section ---------- */
        "about-float": "aboutFloat 8s ease-in-out infinite",
        "badge-float": "badgeFloat 4s ease-in-out infinite",
        "sparkle-soft": "sparkleSoft 2s ease-in-out infinite",
        "icon-breathe": "iconBreathe 3s ease-in-out infinite",
        "line-shimmer": "lineShimmer 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};