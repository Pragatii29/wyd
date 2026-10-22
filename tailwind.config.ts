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
        "on-coral": "var(--on-coral)",
        brand: "var(--brand)",
        "on-brand": "var(--on-brand)",
      },
      fontFamily: {
        // Bricolage Grotesque for headlines (chunky, a little quirky, like the logo); DM Sans for the rest.
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        hero: ["40px", { lineHeight: "44px", fontWeight: "800", letterSpacing: "-0.03em" }],
        display: ["32px", { lineHeight: "36px", fontWeight: "800", letterSpacing: "-0.02em" }],
        title: ["26px", { lineHeight: "30px", fontWeight: "700", letterSpacing: "-0.01em" }],
        h2: ["22px", { lineHeight: "28px", fontWeight: "600" }],
        wyd: ["18px", { lineHeight: "26px", fontWeight: "500", letterSpacing: "-0.01em" }],
        body: ["16px", { lineHeight: "24px", fontWeight: "400" }],
        label: ["14px", { lineHeight: "20px", fontWeight: "600" }],
        meta: ["13px", { lineHeight: "18px", fontWeight: "400" }],
        eyebrow: ["13px", { lineHeight: "18px", fontWeight: "600" }],
      },
      // Soft, bubbly shapes to match the logo: 14px buttons and fields, 20px cards, 28px sheets, pill chips.
      borderRadius: { sm: "4px", field: "14px", card: "20px", sheet: "28px", pill: "999px" },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.08)",
        float: "0 10px 30px rgba(4,3,26,0.28)",
        // Electric glow under the main action.
        glow: "0 8px 28px var(--glow)",
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
