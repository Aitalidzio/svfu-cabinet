"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { applyTheme, defaultTheme, readStoredTheme, type Theme } from "@/lib/theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  /** Concrete light/dark for assets (e.g. Taas outline). */
  appearance: "light" | "dark";
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function subscribeSystemScheme(onChange: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function useAppearance(theme: Theme): "light" | "dark" {
  const systemDark = useSyncExternalStore(
    subscribeSystemScheme,
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
    () => false,
  );
  if (theme === "light") return "light";
  if (theme === "dark") return "dark";
  return systemDark ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const appearance = useAppearance(theme);

  // Restore cookie after soft navigations (language switch). Intentionally syncs React
  // with the document cookie before paint — not a derived render value.
  useLayoutEffect(() => {
    const stored = readStoredTheme();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- cookie → React before paint
    setThemeState(stored);
    applyTheme(stored);
  }, [pathname]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyTheme(next);
  }, []);

  const value = useMemo(() => ({ theme, setTheme, appearance }), [theme, setTheme, appearance]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
