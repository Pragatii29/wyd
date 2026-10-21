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
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
      fontSize: {
        hero: ["44px", { lineHeight: "46px", fontWeight: "600", letterSpacing: "-0.02em" }],
        display: ["36px", { lineHeight: "40px", fontWeight: "600", letterSpacing: "-0.01em" }],
        title: ["28px", { lineHeight: "34px", fontWeight: "600" }],
        h2: ["22px", { lineHeight: "28px", fontWeight: "700" }],
        wyd: ["18px", { lineHeight: "26px", fontWeight: "500" }],
        body: ["16px", { lineHeight: "24px", fontWeight: "400" }],
        label: ["14px", { lineHeight: "20px", fontWeight: "600" }],
        meta: ["12px", { lineHeight: "16px", fontWeight: "400" }],
        eyebrow: ["12px", { lineHeight: "16px", fontWeight: "500", letterSpacing: "0.08em" }],
      },
      borderRadius: { sm: "8px", field: "16px", card: "24px", sheet: "32px", pill: "999px" },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.04)",
        float: "0 20px 45px rgba(0,0,0,0.08)",
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
