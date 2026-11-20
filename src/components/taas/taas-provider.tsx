"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { applyTaasEnabled, defaultTaasEnabled, parseTaasEnabled, TAAS_COOKIE } from "@/lib/taas";

type TaasContextValue = {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
};

const TaasContext = createContext<TaasContextValue | null>(null);

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

function readCookieEnabled(): boolean {
  const match = document.cookie.match(new RegExp(`(?:^|; )${TAAS_COOKIE}=([^;]*)`));
  return parseTaasEnabled(match ? decodeURIComponent(match[1]) : null);
}

function getSnapshot() {
  return readCookieEnabled();
}

function getServerSnapshot() {
  return defaultTaasEnabled;
}

export function TaasProvider({ children }: { children: ReactNode }) {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setEnabled = useCallback((next: boolean) => {
    applyTaasEnabled(next);
    listeners.forEach((listener) => listener());
  }, []);

  const value = useMemo(() => ({ enabled, setEnabled }), [enabled, setEnabled]);

  return <TaasContext.Provider value={value}>{children}</TaasContext.Provider>;
}

export function useTaas() {
  const ctx = useContext(TaasContext);
  if (!ctx) throw new Error("useTaas must be used within TaasProvider");
  return ctx;
}
