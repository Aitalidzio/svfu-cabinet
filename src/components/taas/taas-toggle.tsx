"use client";

import { Gem } from "lucide-react";
import { useTaas } from "@/components/taas/taas-provider";

type Labels = {
  label: string;
  on: string;
  off: string;
};

export function TaasToggle({ labels }: { labels: Labels }) {
  const { enabled, setEnabled } = useTaas();

  return (
    <button
      type="button"
      title={enabled ? labels.on : labels.off}
      aria-label={labels.label}
      aria-pressed={enabled}
      onClick={() => setEnabled(!enabled)}
      className={`grid min-h-11 min-w-11 place-items-center rounded-full transition-colors ${
        enabled
          ? "bg-primary-soft text-primary ring-1 ring-line"
          : "bg-surface-2 text-fg-muted hover:text-fg"
      }`}
    >
      <Gem className="size-4" aria-hidden />
    </button>
  );
}
