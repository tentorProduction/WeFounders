import type { Config } from "tailwindcss";

/**
 * Design tokens — WeFounder.dev Specification
 */
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
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        "surface-hover": "var(--surface-hover)",
        text: "var(--text)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        accent: {
          DEFAULT: "var(--accent)",
          soft: "var(--accent-soft)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--danger)",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        badge: {
          nepal: "var(--badge-nepal)",
          global: "var(--badge-global)",
          esewa: "var(--badge-esewa)",
          khalti: "var(--badge-khalti)",
          fonepay: "var(--badge-fonepay)",
          verified: "var(--badge-verified)",
        },
      },
      borderRadius: {
        sm: "8px",           /* Buttons, chips */
        md: "10px",          /* Inputs, controls */
        lg: "12px",          /* Launch rows, small cards */
        xl: "16px",          /* Featured cards, modals */
        full: "9999px",      /* Pills */
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          '"SF Mono"',
          "Menlo",
          "monospace",
        ],
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0, 0, 0, 0.04)",
        DEFAULT: "0 2px 8px rgba(0, 0, 0, 0.06)",
        lg: "0 8px 24px rgba(0, 0, 0, 0.08)",
      },
      fontSize: {
        /* Section 6 Typography Hierarchy */
        display: ["2.75rem", { lineHeight: "1.15", fontWeight: "700", letterSpacing: "-0.02em" }], // 44px
        hero: ["2.25rem", { lineHeight: "1.2", fontWeight: "700", letterSpacing: "-0.015em" }],   // 36px
        heading: ["1.5rem", { lineHeight: "1.3", fontWeight: "600", letterSpacing: "-0.01em" }],    // 24px
        product: ["1.25rem", { lineHeight: "1.35", fontWeight: "600" }],                             // 20px
        body: ["0.9375rem", { lineHeight: "1.5", fontWeight: "400" }],                               // 15px
        meta: ["0.8125rem", { lineHeight: "1.4", fontWeight: "400" }],                               // 13px
        badge: ["0.75rem", { lineHeight: "1.2", fontWeight: "600", letterSpacing: "0.02em" }],      // 12px
      },
    },
  },
  plugins: [],
};

export default config;
