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
        /* ---------- Base reveal ---------- */
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },

        /* ---------- Modal + drawer ---------- */
        backdropIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        popIn: {
          "0%": { opacity: "0", transform: "scale(0.96) translateY(6px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },

        /* ---------- Caret + typing dots ---------- */
        caret: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        dot: {
          "0%, 100%": { opacity: "0.3", transform: "scale(0.85)" },
          "50%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",

        "fade-up-1": "fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both",
        "fade-up-2": "fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.12s both",
        "fade-up-3": "fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.19s both",
        "fade-up-4": "fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.26s both",
        "fade-up-5": "fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.33s both",
        "fade-up-6": "fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.40s both",
        "fade-up-7": "fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.47s both",
        "fade-up-8": "fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.54s both",

        "backdrop-in": "backdropIn 0.25s ease-out forwards",
        "pop-in": "popIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",

        caret: "caret 1s ease-in-out infinite",
        dot: "dot 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};