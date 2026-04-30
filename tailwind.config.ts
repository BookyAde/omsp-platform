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
        // OMSP Ocean Palette
        ocean: {
          950: "#020f1e",
          900: "#041529",
          850: "#051c35",
          800: "#062241",
          700: "#083057",
          600: "#0a4575",
          500: "#0d5e9e",
          400: "#1a7bc2",
          300: "#3d99d6",
          200: "#7ac0e8",
          100: "#bcdff5",
          50:  "#e8f4fc",
        },
        teal: {
          600: "#0d7873",
          500: "#0d9488",
          400: "#2dd4bf",
          300: "#5eead4",
          200: "#99f6e4",
          100: "#ccfbf1",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        body:    ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono:    ["var(--font-jetbrains)", "monospace"],
      },
      backgroundImage: {
        "ocean-gradient":
          "linear-gradient(135deg, #020f1e 0%, #062241 50%, #0a4575 100%)",
        "teal-gradient":
          "linear-gradient(135deg, #0d9488 0%, #0d5e9e 100%)",
        "hero-gradient":
          "linear-gradient(160deg, #020f1e 0%, #041529 40%, #062241 70%, #083057 100%)",
      },
      animation: {
        "fade-up":    "fadeUp 0.6s ease forwards",
        "fade-in":    "fadeIn 0.4s ease forwards",
        "slide-left": "slideLeft 0.5s ease forwards",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideLeft: {
          "0%":   { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      boxShadow: {
        "ocean-sm": "0 2px 8px rgba(2, 15, 30, 0.4)",
        "ocean-md": "0 4px 24px rgba(2, 15, 30, 0.5)",
        "ocean-lg": "0 8px 48px rgba(2, 15, 30, 0.6)",
        "teal-glow": "0 0 24px rgba(13, 148, 136, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
