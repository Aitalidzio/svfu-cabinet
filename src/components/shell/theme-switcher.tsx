"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/shell/theme-provider";
import { themes } from "@/lib/theme";

type Labels = {
  label: string;
  system: string;
  light: string;
  dark: string;
};

const icons = {
  system: Monitor,
  light: Sun,
  dark: Moon,
} as const;

export function ThemeSwitcher({ labels }: { labels: Labels }) {
  const { theme, setTheme } = useTheme();

  return (
    <nav aria-label={labels.label} className="flex rounded-full bg-surface-2 text-xs font-semibold">
      {themes.map((value) => {
        const active = theme === value;
        const Icon = icons[value];
        return (
          <button
            key={value}
            type="button"
            title={labels[value]}
            aria-label={labels[value]}
            aria-pressed={active}
            onClick={() => setTheme(value)}
            className={`grid min-h-11 min-w-11 place-items-center rounded-full px-2 transition-colors ${
              active ? "bg-surface text-fg shadow-sm ring-1 ring-line" : "text-fg-muted hover:text-fg"
            }`}
          >
            <Icon className="size-4" aria-hidden />
          </button>
        );
      })}
    </nav>
  );
}
