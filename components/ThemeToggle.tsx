"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

export type ThemeChoice = "light" | "dark" | "system";
const KEY = "wyd-theme";
const listeners = new Set<() => void>();

function read(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

function apply(choice: ThemeChoice) {
  try {
    if (choice === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, choice);
  } catch {}
  if (choice === "system") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = choice;
  listeners.forEach((l) => l());
}

function useTheme() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    read,
    () => "system" as ThemeChoice,
  );
}

// Whether the page is dark right now (explicit choice, or the system setting). Server render assumes light.
function useIsDark() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", l);
      return () => {
        listeners.delete(l);
        mq.removeEventListener("change", l);
      };
    },
    () => {
      const choice = read();
      return choice === "system" ? window.matchMedia("(prefers-color-scheme: dark)").matches : choice === "dark";
    },
    () => false,
  );
}

// Small sun/moon button for headers: flips between light and dark.
export function ThemeIconButton({ className = "text-ink" }: { className?: string }) {
  const dark = useIsDark();
  return (
    <button
      onClick={() => apply(dark ? "light" : "dark")}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={`inline-flex size-11 items-center justify-center rounded-full ${className} transition duration-fast ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-ink`}
    >
      {dark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

// Three-way control for settings: Light · Dark · System.
export function ThemeSegmented() {
  const choice = useTheme();
  const options: { value: ThemeChoice; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];
  return (
    <div className="flex rounded-pill bg-sunk p-1" role="radiogroup" aria-label="Appearance">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          role="radio"
          aria-checked={choice === value}
          onClick={() => apply(value)}
          className={`flex h-10 flex-1 items-center justify-center gap-1 rounded-pill text-label transition duration-base ease-out focus-visible:outline-2 focus-visible:outline-ink ${
            choice === value ? "bg-ink text-on-ink" : "text-ink"
          }`}
        >
          <Icon size={16} aria-hidden /> {label}
        </button>
      ))}
    </div>
  );
}
