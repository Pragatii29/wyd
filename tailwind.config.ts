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
        // Opaque panel for sheets and dialogs that sit over content.
        sheet: "var(--sheet)",
      },
      fontFamily: {
        // Poppins for headlines (clean, geometric, set light and large like the luxury references); DM Sans for the rest.
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        hero: ["40px", { lineHeight: "46px", fontWeight: "500", letterSpacing: "-0.03em" }],
        // The italic serif phrase inside a hero headline (serif runs small, so it is set larger).
        "hero-accent": ["46px", { lineHeight: "44px", fontWeight: "400", letterSpacing: "0" }],
        display: ["32px", { lineHeight: "38px", fontWeight: "500", letterSpacing: "-0.02em" }],
        title: ["26px", { lineHeight: "32px", fontWeight: "500", letterSpacing: "-0.015em" }],
        h2: ["22px", { lineHeight: "28px", fontWeight: "500", letterSpacing: "-0.01em" }],
        wyd: ["18px", { lineHeight: "26px", fontWeight: "500", letterSpacing: "-0.01em" }],
        body: ["16px", { lineHeight: "24px", fontWeight: "400" }],
        label: ["14px", { lineHeight: "20px", fontWeight: "500" }],
        meta: ["13px", { lineHeight: "18px", fontWeight: "400" }],
        eyebrow: ["12px", { lineHeight: "16px", fontWeight: "500", letterSpacing: "0.14em" }],
      },
      // Luxury-app shapes: pill buttons and chips, 22px fields, 28px glass cards, 36px sheets.
      borderRadius: { sm: "6px", field: "22px", card: "28px", sheet: "36px", pill: "999px" },
      boxShadow: {
        // Soft, wide shadows that lift glass panels off the haze.
        card: "0 8px 30px rgba(30,18,12,0.10)",
        float: "0 24px 60px rgba(30,18,12,0.22)",
        glow: "0 12px 32px var(--glow)",
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
