"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/shell/theme-provider";
import { useTaas } from "@/components/taas/taas-provider";
import {
  pickRandomTap,
  spriteSrc,
  TAAS_FLASH_MS,
  TAAS_THEME_LINES,
  TAAS_WELCOME,
  type TaasEmotion,
  type TaasLineKey,
  type TaasState,
} from "@/lib/taas";

type Labels = {
  name: string;
  bubble: string;
  tapHint: string;
  lines: Record<TaasLineKey, string>;
};

type Flash = {
  id: number;
  line: TaasLineKey;
  emotion: TaasEmotion;
};

type Placement = "cabinet" | "login";

export function TaasCompanion({
  base,
  labels,
  placement = "cabinet",
}: {
  base: TaasState;
  labels: Labels;
  placement?: Placement;
}) {
  const { enabled } = useTaas();
  const { appearance } = useTheme();
  const pathname = usePathname();
  const [flash, setFlash] = useState<Flash | null>(null);
  const wasEnabled = useRef(enabled);
  const seenAppearance = useRef(false);
  const prevAppearance = useRef(appearance);
  const flashId = useRef(0);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearFlashTimer() {
    if (flashTimer.current) {
      clearTimeout(flashTimer.current);
      flashTimer.current = null;
    }
  }

  function showFlash(next: { line: TaasLineKey; emotion: TaasEmotion }) {
    const id = ++flashId.current;
    clearFlashTimer();
    setFlash({ id, ...next });
    flashTimer.current = setTimeout(() => {
      // Ignore stale timers after language/theme/path reset the generation.
      if (flashId.current === id) {
        setFlash(null);
        flashTimer.current = null;
      }
    }, TAAS_FLASH_MS);
  }

  // Soft-nav (language or screen): drop tap/theme bubble and return to base line.
  useEffect(() => {
    const id = ++flashId.current;
    clearFlashTimer();
    const t = setTimeout(() => {
      if (flashId.current === id) setFlash(null);
    }, 0);
    return () => clearTimeout(t);
  }, [pathname]);

  // Welcome back after the user turns Taas on again.
  useEffect(() => {
    const prev = wasEnabled.current;
    wasEnabled.current = enabled;
    if (!enabled) {
      flashId.current += 1;
      clearFlashTimer();
      return;
    }
    if (prev) return;
    const appear = setTimeout(() => showFlash(TAAS_WELCOME), 0);
    return () => clearTimeout(appear);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only the off→on edge
  }, [enabled]);

  // React to theme appearance changes (skip first paint).
  useEffect(() => {
    if (!seenAppearance.current) {
      seenAppearance.current = true;
      prevAppearance.current = appearance;
      return;
    }
    if (prevAppearance.current === appearance) return;
    prevAppearance.current = appearance;
    if (!enabled) return;
    const appear = setTimeout(() => showFlash(TAAS_THEME_LINES[appearance]), 0);
    return () => clearTimeout(appear);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- appearance edge only
  }, [appearance, enabled]);

  useEffect(() => () => clearFlashTimer(), []);

  if (!enabled) return null;

  const line = flash?.line ?? base.line;
  const emotion = flash?.emotion ?? base.emotion;
  const text = labels.lines[line];

  function onTap() {
    const next = pickRandomTap(flash?.line ?? null);
    showFlash(next);
  }

  const place =
    placement === "login"
      ? "bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-3 lg:bottom-6 lg:right-6"
      : "bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-3 lg:bottom-6 lg:right-6";

  // Both sprites in the DOM; CSS picks light/dark (incl. system + prefers-color-scheme)
  // so SSR and client match — no hydration mismatch on src.
  return (
    <aside
      className={`pointer-events-none fixed z-30 flex max-w-[min(100%-1.5rem,16rem)] flex-col items-end gap-2 ${place}`}
      aria-label={labels.name}
    >
      <div
        role="status"
        aria-live="polite"
        aria-label={labels.bubble}
        className="pointer-events-auto rounded-2xl rounded-br-md border border-line bg-surface px-3 py-2 text-sm leading-snug text-fg shadow-sm"
      >
        {text}
      </div>
      <button
        type="button"
        onClick={onTap}
        aria-label={labels.tapHint}
        className="taas-sprite pointer-events-auto relative size-[4.5rem] shrink-0 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {/* Remount on line/emotion change so the hop animation restarts. */}
        <span key={`${line}-${emotion}`} className="taas-hop absolute inset-0 block">
          {/* eslint-disable-next-line @next/next/no-img-element -- local SVG sprite */}
          <img
            src={spriteSrc("light", emotion)}
            alt=""
            width={72}
            height={72}
            draggable={false}
            className="taas-sprite-light pointer-events-none absolute inset-0 size-full select-none drop-shadow-sm"
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- local SVG sprite */}
          <img
            src={spriteSrc("dark", emotion)}
            alt=""
            width={72}
            height={72}
            draggable={false}
            className="taas-sprite-dark pointer-events-none absolute inset-0 size-full select-none drop-shadow-sm"
          />
        </span>
      </button>
    </aside>
  );
}
