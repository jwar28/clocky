import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./store/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          container: "hsl(var(--primary-container))",
          onContainer: "hsl(var(--on-primary-container))",
          fixed: "hsl(var(--primary-fixed))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          container: "hsl(var(--secondary-container))",
          onContainer: "hsl(var(--on-secondary-container))",
          fixed: "hsl(var(--secondary-fixed))",
        },
        tertiary: {
          DEFAULT: "hsl(var(--tertiary))",
          foreground: "hsl(var(--tertiary-foreground))",
          container: "hsl(var(--tertiary-container))",
          onContainer: "hsl(var(--on-tertiary-container))",
          fixed: "hsl(var(--tertiary-fixed))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
          container: "hsl(var(--destructive-container))",
          onContainer: "hsl(var(--on-destructive-container))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          dim: "hsl(var(--surface-dim))",
          bright: "hsl(var(--surface-bright))",
          containerLowest: "hsl(var(--surface-container-lowest))",
          containerLow: "hsl(var(--surface-container-low))",
          container: "hsl(var(--surface-container))",
          containerHigh: "hsl(var(--surface-container-high))",
          containerHighest: "hsl(var(--surface-container-highest))",
          variant: "hsl(var(--surface-variant))",
          tint: "hsl(var(--surface-tint))",
        },
        outline: {
          DEFAULT: "hsl(var(--outline))",
          variant: "hsl(var(--outline-variant))",
        },
        inverse: {
          surface: "hsl(var(--inverse-surface))",
          onSurface: "hsl(var(--inverse-on-surface))",
          primary: "hsl(var(--inverse-primary))",
        },
        ink: {
          DEFAULT: "hsl(var(--ink))",
          muted: "hsl(var(--ink-muted))",
        },
        grid: {
          DEFAULT: "hsl(var(--grid))",
          soft: "hsl(var(--grid-soft))",
        },
        night: "hsl(var(--night))",
      },
      borderRadius: {
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
        card: "0.5rem",
        pill: "9999px",
      },
      fontFamily: {
        display: ["var(--font-hanken)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-inter)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "headline-xl": ["24px", { lineHeight: "32px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-md": ["18px", { lineHeight: "24px", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "500" }],
        "body-sm": ["13px", { lineHeight: "18px", fontWeight: "400" }],
        "table-header": ["14px", { lineHeight: "20px", fontWeight: "600" }],
        "data-mono": ["12px", { lineHeight: "16px", fontWeight: "500" }],
      },
      spacing: {
        gutter: "16px",
        "margin-mobile": "16px",
        "margin-desktop": "32px",
        cell: "12px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.15s ease-out",
      },
      boxShadow: {
        elevated: "0px 4px 20px rgba(0, 155, 77, 0.15)",
        focus: "0 0 0 2px hsl(var(--primary))",
      },
    },
  },
  plugins: [animate],
};

export default config;