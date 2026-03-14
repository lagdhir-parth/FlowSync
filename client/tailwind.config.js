/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Sora", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        ink: "#07090F",
        surface: "#0E1117",
        card: "#131720",
        border: "#1E2535",
        indigo: { 400: "#818CF8", 500: "#6366F1", 600: "#4F46E5" },
        emerald: { 400: "#34D399", 500: "#10B981" },
        violet: { 400: "#A78BFA", 500: "#8B5CF6" },
      },
      animation: {
        "spin-slow": "spin 12s linear infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4,0,0.6,1) infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "float-delay": "float 6s ease-in-out 2s infinite",
        shimmer: "shimmer 2.5s linear infinite",
        orbit: "orbit 14s linear infinite",
        "orbit-reverse": "orbit 20s linear infinite reverse",
      },
      keyframes: {
        pulseGlow: {
          "0%,100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-12px) rotate(1deg)" },
          "66%": { transform: "translateY(-6px) rotate(-1deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        orbit: {
          "0%": { transform: "rotate(0deg)   translateX(110px) rotate(0deg)" },
          "100%": {
            transform: "rotate(360deg) translateX(110px) rotate(-360deg)",
          },
        },
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(99,102,241,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.05) 1px,transparent 1px)",
      },
    },
  },
  plugins: [],
};
