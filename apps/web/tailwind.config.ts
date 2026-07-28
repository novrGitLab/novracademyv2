import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        surface: "#F8F9FB",
        border: "#E5E7EB",
        "text-primary": "#111827",
        "text-secondary": "#6B7280",
        blue: {
          DEFAULT: "#2563EB",
          light: "#EFF6FF",
        },
        red: {
          DEFAULT: "#DC2626",
          light: "#FEF2F2",
        },
        purple: {
          DEFAULT: "#7C3AED",
          light: "#F5F3FF",
        },
        success: {
          DEFAULT: "#16A34A",
          light: "#F0FDF4",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      borderRadius: {
        card: "8px",
        pill: "6px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08)",
        "card-hover": "0 8px 24px -8px rgba(17,24,39,0.12), 0 2px 6px -2px rgba(17,24,39,0.06)",
        premium: "0 1px 2px rgba(17,24,39,0.04), 0 12px 32px -12px rgba(17,24,39,0.14)",
        pop: "0 20px 48px -16px rgba(17,24,39,0.22)",
      },
      backgroundImage: {
        "gradient-blue": "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
        "gradient-purple": "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
        "gradient-brand": "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
        "gradient-surface": "linear-gradient(180deg, #FFFFFF 0%, #F8F9FB 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
