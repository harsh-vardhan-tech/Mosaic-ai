import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base canvas — deep ink (not pure black), one step up for cards/panels.
        ink: "hsl(var(--ink))",
        surface: "hsl(var(--surface))",
        "surface-raised": "hsl(var(--surface-raised))",
        paper: "hsl(var(--paper))",
        border: "hsl(var(--border))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted))",

        // Primary accent — "gold tessera": CTAs, active states, achievement emphasis.
        gold: {
          DEFAULT: "hsl(var(--gold))",
          foreground: "hsl(var(--gold-foreground))",
        },

        // Category tile colors — functional, not decorative: each hackathon
        // category gets one of these consistently across badges/cards/graph.
        tile: {
          teal: "hsl(var(--tile-teal))",
          coral: "hsl(var(--tile-coral))",
          violet: "hsl(var(--tile-violet))",
          amber: "hsl(var(--tile-amber))",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-manrope)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [],
};

export default config;
