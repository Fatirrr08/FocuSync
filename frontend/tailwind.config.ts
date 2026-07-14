import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        deeper: "#060814",
        surface: "#0d1117",
        elevated: "#111827",
        violet: { DEFAULT: "#7C3AED", light: "#A78BFA", pale: "rgba(124,58,237,0.15)", glow: "rgba(124,58,237,0.4)" },
        emerald: { DEFAULT: "#10B981", light: "#34D399", pale: "rgba(16,185,129,0.12)", glow: "rgba(16,185,129,0.35)" },
        crimson: { DEFAULT: "#EF4444", light: "#F87171", pale: "rgba(239,68,68,0.12)", glow: "rgba(239,68,68,0.35)" },
        amber: { DEFAULT: "#F59E0B", pale: "rgba(245,158,11,0.15)" },
        glass: {
          DEFAULT: "rgba(255,255,255,0.04)",
          hover: "rgba(255,255,255,0.08)",
          border: "rgba(255,255,255,0.10)",
          "border-h": "rgba(255,255,255,0.20)",
        },
        text: { primary: "#F1F5F9", secondary: "rgba(241,245,249,0.65)", muted: "rgba(241,245,249,0.35)" },
      },
      fontFamily: {
        body: ["Inter", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      borderRadius: {
        sm: "8px", md: "12px", lg: "16px", xl: "24px", "2xl": "32px", full: "9999px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)",
        "glow-v": "0 0 40px rgba(124,58,237,0.3)",
        "glow-e": "0 0 40px rgba(16,185,129,0.3)",
      },
      transitionTimingFunction: {
        organic: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0,0,0.2,1) both",
        "scale-in": "scale-in 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
        "slide-right": "slide-right 0.5s cubic-bezier(0,0,0.2,1) both",
        "pulse-dot": "pulse-dot 1.5s ease-in-out infinite",
        "breathe": "breathe 3s ease-in-out infinite",
        "strike-shake": "strike-shake 0.6s ease-in-out",
        "orb-float": "orb-float linear infinite",
        "glow-pulse": "glow-pulse 2.5s ease-in-out infinite",
        "ripple": "ripple 0.6s ease-out",
        "toast-in": "toast-in 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        "cell-appear": "cell-appear 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
        "scan": "scan 2.5s ease-in-out infinite",
        "pts-fly": "pts-fly 1.5s cubic-bezier(0,0,0.2,1) forwards",
      },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(30px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "scale-in": { from: { opacity: "0", transform: "scale(0.9)" }, to: { opacity: "1", transform: "scale(1)" } },
        "slide-right": { from: { opacity: "0", transform: "translateX(30px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        "pulse-dot": { "0%,100%": { opacity: "1", transform: "scale(1)" }, "50%": { opacity: "0.6", transform: "scale(0.8)" } },
        "breathe": { "0%,100%": { transform: "scale(1)", opacity: "0.8" }, "50%": { transform: "scale(1.06)", opacity: "1" } },
        "strike-shake": {
          "0%": { transform: "translateX(0)" }, "10%": { transform: "translateX(-8px) rotate(-1deg)" },
          "20%": { transform: "translateX(8px) rotate(1deg)" }, "30%": { transform: "translateX(-6px)" },
          "40%": { transform: "translateX(6px)" }, "50%": { transform: "translateX(-3px)" },
          "60%": { transform: "translateX(3px)" }, "100%": { transform: "translateX(0)" },
        },
        "orb-float": {
          "0%": { transform: "translate(0,0) rotate(0deg)" }, "25%": { transform: "translate(40px,-60px) rotate(90deg)" },
          "50%": { transform: "translate(-30px,-100px) rotate(180deg)" }, "75%": { transform: "translate(-60px,-40px) rotate(270deg)" },
          "100%": { transform: "translate(0,0) rotate(360deg)" },
        },
        "glow-pulse": {
          "0%,100%": { boxShadow: "0 0 20px var(--glow-color, rgba(124,58,237,0.4))" },
          "50%": { boxShadow: "0 0 50px var(--glow-color, rgba(124,58,237,0.7))" },
        },
        "ripple": {
          from: { transform: "scale(0)", opacity: "0.5" },
          to: { transform: "scale(4)", opacity: "0" },
        },
        "toast-in": {
          from: { opacity: "0", transform: "translateX(50px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "cell-appear": {
          from: { opacity: "0", transform: "scale(0.6)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "scan": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        "pts-fly": {
          "0%": { opacity: "1", transform: "translateY(0) scale(1)" },
          "100%": { opacity: "0", transform: "translateY(-80px) scale(1.3)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
