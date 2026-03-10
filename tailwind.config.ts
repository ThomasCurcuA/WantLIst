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
        background: "var(--color-bg, #F8F9FB)",
        foreground: "var(--color-fg, #1A1D2E)",
        accent: "var(--accent-color, #E93D5D)",
        "accent-light": "var(--color-accent-light, #FEE2E8)",
        "card-bg": "var(--color-card, #FFFFFF)",
        "nav-dark": "var(--color-nav, #1A1D2E)",
        "text-muted": "var(--color-text-muted, #8E92A4)",
        "text-secondary": "var(--color-text-secondary, #6B7080)",
        "border-light": "var(--color-border, #E8EAF0)",
        "green-badge": "var(--color-green-badge, #22C55E)",
        surface: "var(--color-surface, #F0F1F5)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-lg": "var(--shadow-card-lg)",
        nav: "var(--shadow-nav)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
