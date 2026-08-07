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
        auth: {
          ink: "#1A1A2E",
          secondary: "#666666",
          tertiary: "#454651",
          muted: "#767682",
          placeholder: "#6B7280",
          border: "#E5E5E5",
          primary: "#683290",
          purple: "#683290",
          red: "#EB2027",
          tint: "#F4ECF8",
        },
        success: {
          DEFAULT: "#16A34A",
          light: "#F0FDF4",
        },
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      borderRadius: {
        card: "8px",
        pill: "6px",
        auth: "2px",
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
        "gradient-brand": "linear-gradient(135deg, #4451A2 0%, #683290 100%)",
        "gradient-surface": "linear-gradient(180deg, #FFFFFF 0%, #F8F9FB 100%)",
      },

      /* ── Animation timing ── */
      transitionDuration: {
        "600": "600ms",
        "1200": "1200ms",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },

      /* ── Keyframe animations ── */
      keyframes: {
        "fade-in-up": {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-right": {
          "0%":   { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-down": {
          "0%":   { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 50%, 90%": { transform: "translateX(-4px)" },
          "30%, 70%": { transform: "translateX(4px)" },
        },
        "scale-pop": {
          "0%":   { transform: "scale(1)" },
          "50%":  { transform: "scale(0.98)" },
          "100%": { transform: "scale(1)" },
        },
        pulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%":      { transform: "scale(1.02)" },
        },
        spin: {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 600ms ease-out forwards",
        "fade-in": "fade-in 500ms ease-out forwards",
        "slide-in-right": "slide-in-right 500ms ease-out forwards",
        "slide-down": "slide-down 200ms ease-out forwards",
        shake: "shake 400ms ease-in-out",
        "scale-pop": "scale-pop 100ms ease-in-out",
        pulse: "pulse 2s ease-in-out infinite",
        spin: "spin 600ms linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
