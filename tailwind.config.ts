import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg1: "var(--bg1)",
        bg2: "var(--bg2)",
        bg3: "var(--bg3)",
        bg4: "var(--bg4)",
        bgInverse: "var(--bgInverse)",
        bgInverse2: "var(--bgInverse2)",
        border: "var(--border)",
        accent1: "var(--accent1)",
        accent2: "var(--accent2)",
        "sf-gray": {
          50: "#f5f5f7",
          100: "#e8e8ed",
          200: "#d2d2d7",
          300: "#86868b",
          400: "#6e6e73",
          500: "#424245",
          600: "#333336",
          700: "#1d1d1f",
          800: "#121213",
          900: "#000000",
        },
      },
      fontFamily: {
        inter: ["var(--font-inter)", "sans-serif"],
        geist: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        calora: ["var(--font-calora)", "serif"],
      },
      letterSpacing: {
        tightest: "-.02em",
        tighter: "-.01em",
        normal: "0",
        wide: "0.01em",
        wider: "0.02em",
      },
      lineHeight: {
        tighter: "1.1",
        tight: "1.3",
        normal: "1.5",
        relaxed: "1.7",
        loose: "2",
      },
      animation: {
        'bubble-in': 'bubbleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-in-up': 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        bubbleIn: {
          '0%': { opacity: '0', transform: 'scale(0.8) translateY(10px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
export default config;

