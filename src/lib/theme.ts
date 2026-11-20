export const themes = ["system", "light", "dark"] as const;

export type Theme = (typeof themes)[number];

export const THEME_COOKIE = "theme";

export const defaultTheme: Theme = "system";

export function hasTheme(value: string): value is Theme {
  return (themes as readonly string[]).includes(value);
}

/** Prefer cookie (source of truth), then the DOM attribute. */
export function readStoredTheme(): Theme {
  if (typeof document === "undefined") return defaultTheme;
  const match = document.cookie.match(new RegExp(`(?:^|; )${THEME_COOKIE}=([^;]*)`));
  const fromCookie = match ? decodeURIComponent(match[1]) : "";
  if (hasTheme(fromCookie)) return fromCookie;
  const fromDom = document.documentElement.getAttribute("data-theme");
  if (fromDom && hasTheme(fromDom)) return fromDom;
  return defaultTheme;
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  document.cookie = `${THEME_COOKIE}=${encodeURIComponent(theme)}; path=/; max-age=31536000; samesite=lax`;
}

/** Effective light/dark after resolving `system` against the OS. */
export function resolveAppearance(theme: Theme): "light" | "dark" {
  if (theme === "light") return "light";
  if (theme === "dark") return "dark";
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
