import type { Level } from "@/lib/brs";

export const taasEmotions = ["neutral", "sleep", "tired", "surprised", "happy", "angry"] as const;
export type TaasEmotion = (typeof taasEmotions)[number];

export const TAAS_COOKIE = "taas";
export const defaultTaasEnabled = true;

export type TaasAppearance = "light" | "dark";

export type TaasLineKey =
  | "hello"
  | "night"
  | "unread"
  | "danger"
  | "warning"
  | "happyGrades"
  | "ready"
  | "staffQueue"
  | "staffOk"
  | "schedule"
  | "grades"
  | "requests"
  | "notifications"
  | "profile"
  | "announcements"
  | "changes"
  | "tap1"
  | "tap2"
  | "tap3"
  | "tap4"
  | "tap5"
  | "tap6"
  | "tap7"
  | "tap8"
  | "tap9"
  | "tap10"
  | "tap11"
  | "tap12"
  | "welcomeBack"
  | "themeLight"
  | "themeDark"
  | "intro";

/** Quips when the user taps Taas. */
export const TAAS_TAP_LINES = [
  "tap1",
  "tap2",
  "tap3",
  "tap4",
  "tap5",
  "tap6",
  "tap7",
  "tap8",
  "tap9",
  "tap10",
  "tap11",
  "tap12",
] as const satisfies readonly TaasLineKey[];

/** Face locked to each tap line (not random). */
export const TAAS_TAP_EMOTIONS = {
  tap1: "surprised",
  tap2: "happy",
  tap3: "happy",
  tap4: "neutral",
  tap5: "neutral",
  tap6: "tired",
  tap7: "happy",
  tap8: "sleep",
  tap9: "surprised",
  tap10: "happy",
  tap11: "angry",
  tap12: "tired",
} as const satisfies Record<(typeof TAAS_TAP_LINES)[number], TaasEmotion>;

/** How long a tap / welcome bubble stays before the screen reaction returns. */
export const TAAS_FLASH_MS = 4500;

export type TaasSnapshot = {
  role: "student" | "staff";
  unreadCount: number;
  /** Minutes since midnight in Asia/Yakutsk. */
  yakutskMinutes: number;
  /** Worst BRS level among current disciplines; students only. */
  gradeLevel: Level | null;
  readyRequest: boolean;
  /** Staff: submitted + in_progress count. */
  pendingQueue: number;
};

export type TaasState = {
  emotion: TaasEmotion;
  line: TaasLineKey;
};

export function hasTaasEmotion(value: string): value is TaasEmotion {
  return (taasEmotions as readonly string[]).includes(value);
}

/** Absent cookie = on (default for jury wow). Explicit `0` / `off` disables. */
export function parseTaasEnabled(raw: string | null | undefined): boolean {
  if (raw == null || raw === "") return defaultTaasEnabled;
  const v = raw.trim().toLowerCase();
  if (v === "0" || v === "off" || v === "false") return false;
  return true;
}

export function readStoredTaasEnabled(): boolean {
  if (typeof document === "undefined") return defaultTaasEnabled;
  const match = document.cookie.match(new RegExp(`(?:^|; )${TAAS_COOKIE}=([^;]*)`));
  return parseTaasEnabled(match ? decodeURIComponent(match[1]) : null);
}

export function applyTaasEnabled(enabled: boolean) {
  if (typeof document === "undefined") return;
  document.cookie = `${TAAS_COOKIE}=${enabled ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
}

export function spriteSrc(appearance: TaasAppearance, emotion: TaasEmotion): string {
  return `/taas/${appearance}/${emotion}.svg`;
}

/** Path after /{lang}/ → screen key. */
export function screenOf(pathname: string): string {
  return pathname.split("/").slice(2).join("/");
}

/** Calm line for the current screen. */
export function lineForPath(pathname: string): TaasLineKey {
  const rest = screenOf(pathname);
  if (!rest) return "hello";
  if (rest.startsWith("schedule/changes") || rest.startsWith("changes")) return "changes";
  if (rest.startsWith("schedule")) return "schedule";
  if (rest.startsWith("grades")) return "grades";
  if (rest.startsWith("requests")) return "requests";
  if (rest.startsWith("notifications")) return "notifications";
  if (rest.startsWith("profile")) return "profile";
  if (rest.startsWith("announcements")) return "announcements";
  return "hello";
}

/** Default face per screen — navigation alone should change expression. */
export function emotionForScreen(screen: TaasLineKey, role: TaasSnapshot["role"]): TaasEmotion {
  switch (screen) {
    case "hello":
      return "happy";
    case "schedule":
      return "neutral";
    case "grades":
      return "tired";
    case "requests":
      return role === "staff" ? "tired" : "surprised";
    case "notifications":
      return "surprised";
    case "profile":
      return "happy";
    case "announcements":
      return "happy";
    case "changes":
      return "angry";
    default:
      return "neutral";
  }
}

function emotionFromHour(minutes: number): TaasEmotion | null {
  const hour = Math.floor(minutes / 60);
  if (hour >= 0 && hour < 6) return "sleep";
  if (hour >= 22) return "tired";
  return null;
}

/**
 * Screen face first; status only overrides on «Сегодня» or the matching section
 * (same idea as urgent lines — so schedule ≠ forever happy because of a ready certificate).
 */
export function emotionFromSnapshot(snapshot: TaasSnapshot, pathname: string): TaasEmotion {
  const byHour = emotionFromHour(snapshot.yakutskMinutes);
  if (byHour === "sleep") return "sleep";

  const screen = lineForPath(pathname);
  const onHome = screen === "hello";

  if (snapshot.role === "staff") {
    if ((onHome || screen === "notifications") && snapshot.unreadCount > 0) return "surprised";
    if ((onHome || screen === "requests") && snapshot.pendingQueue >= 5) return "angry";
    if ((onHome || screen === "requests") && snapshot.pendingQueue > 0) return "tired";
    if (byHour === "tired") return "tired";
    return emotionForScreen(screen, "staff");
  }

  if ((onHome || screen === "grades") && snapshot.gradeLevel === "danger") return "angry";
  if ((onHome || screen === "requests") && snapshot.readyRequest) return "happy";
  if ((onHome || screen === "notifications") && snapshot.unreadCount > 0) return "surprised";
  if ((onHome || screen === "grades") && snapshot.gradeLevel === "warning") return "tired";
  if ((onHome || screen === "grades") && snapshot.gradeLevel === "success") return "happy";
  if (byHour === "tired") return "tired";
  return emotionForScreen(screen, "student");
}

/** Urgent line for «Сегодня»; on other screens only when it matches the topic. */
function urgentLine(snapshot: TaasSnapshot, pathname: string): TaasLineKey | null {
  const hour = Math.floor(snapshot.yakutskMinutes / 60);
  if (hour >= 0 && hour < 6) return "night";

  const screen = lineForPath(pathname);
  const onHome = screen === "hello";

  if (snapshot.role === "staff") {
    if ((onHome || screen === "notifications") && snapshot.unreadCount > 0) return "unread";
    if ((onHome || screen === "requests") && snapshot.pendingQueue > 0) return "staffQueue";
    if (onHome) return "staffOk";
    return null;
  }

  if ((onHome || screen === "requests") && snapshot.readyRequest) return "ready";
  if ((onHome || screen === "grades") && snapshot.gradeLevel === "danger") return "danger";
  if ((onHome || screen === "notifications") && snapshot.unreadCount > 0) return "unread";
  if ((onHome || screen === "grades") && snapshot.gradeLevel === "warning") return "warning";
  if (onHome && snapshot.gradeLevel === "success") return "happyGrades";
  return null;
}

/**
 * Face follows status + screen + time; bubble prefers the current screen,
 * with urgent cues only on «Сегодня» or the matching section.
 */
export function pickTaasState(snapshot: TaasSnapshot, pathname: string): TaasState {
  const emotion = emotionFromSnapshot(snapshot, pathname);
  const urgent = urgentLine(snapshot, pathname);
  if (urgent) return { emotion, line: urgent };
  return { emotion, line: lineForPath(pathname) };
}

export type TaasTap = {
  line: (typeof TAAS_TAP_LINES)[number];
  emotion: TaasEmotion;
};

/** Random tap phrase; emotion comes from the phrase map. Skips the previous line. */
export function pickRandomTap(previousLine?: TaasLineKey | null, random = Math.random): TaasTap {
  const pool =
    previousLine && TAAS_TAP_LINES.includes(previousLine as (typeof TAAS_TAP_LINES)[number])
      ? TAAS_TAP_LINES.filter((line) => line !== previousLine)
      : [...TAAS_TAP_LINES];
  const line = pool[Math.floor(random() * pool.length)] ?? TAAS_TAP_LINES[0];
  return { line, emotion: TAAS_TAP_EMOTIONS[line] };
}

export const TAAS_WELCOME: TaasState = { line: "welcomeBack", emotion: "happy" };

/** Login screen — Taas introduces himself. */
export const TAAS_INTRO: TaasState = { line: "intro", emotion: "happy" };

export const TAAS_THEME_LINES = {
  light: { line: "themeLight", emotion: "happy" },
  dark: { line: "themeDark", emotion: "surprised" },
} as const satisfies Record<"light" | "dark", TaasState>;
