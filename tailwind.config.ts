import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        sunk: "var(--surface-sunk)",
        ink: { DEFAULT: "var(--ink)", 2: "var(--ink-2)", 3: "var(--ink-3)" },
        line: "var(--line)",
        coral: { DEFAULT: "var(--coral)", text: "var(--coral-text)" },
        candle: "var(--candle)",
        night: "var(--night)",
        bone: "var(--bone)",
        success: "var(--success)",
        danger: "var(--danger)",
        "on-ink": "var(--on-ink)",
        "on-light": "var(--on-light)",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
      fontSize: {
        hero: ["60px", { lineHeight: "56px", fontWeight: "400", letterSpacing: "-0.02em" }],
        display: ["44px", { lineHeight: "44px", fontWeight: "400", letterSpacing: "-0.01em" }],
        title: ["32px", { lineHeight: "36px", fontWeight: "400" }],
        h2: ["22px", { lineHeight: "28px", fontWeight: "600" }],
        wyd: ["18px", { lineHeight: "26px", fontWeight: "500" }],
        body: ["16px", { lineHeight: "24px", fontWeight: "400" }],
        label: ["14px", { lineHeight: "20px", fontWeight: "600" }],
        meta: ["12px", { lineHeight: "16px", fontWeight: "400" }],
        eyebrow: ["12px", { lineHeight: "16px", fontWeight: "500", letterSpacing: "0.08em" }],
      },
      // oddtables shapes: near-square 2px corners for surfaces, full pills for buttons and chips.
      borderRadius: { sm: "2px", field: "2px", card: "2px", sheet: "2px", pill: "999px" },
      boxShadow: {
        // No drop shadows: a hairline ring separates floating UI instead.
        card: "0 0 0 0 transparent",
        float: "0 0 0 1px var(--line)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.32, 0.72, 0, 1)",
        press: "cubic-bezier(0.16, 1, 0.3, 1)",
        out: "cubic-bezier(0, 0, 0.2, 1)",
      },
      transitionDuration: { fast: "120ms", base: "240ms", slow: "480ms" },
    },
  },
};

export default config;
