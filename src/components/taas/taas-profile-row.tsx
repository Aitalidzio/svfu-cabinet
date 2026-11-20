"use client";

import { TaasToggle } from "@/components/taas/taas-toggle";
import { useTaas } from "@/components/taas/taas-provider";

type Labels = {
  label: string;
  on: string;
  off: string;
};

export function TaasProfileRow({ labels }: { labels: Labels }) {
  const { enabled } = useTaas();
  return (
    <div className="mt-3 flex items-center gap-3">
      <TaasToggle labels={labels} />
      <p className="text-sm text-fg-muted">{enabled ? labels.on : labels.off}</p>
    </div>
  );
}
