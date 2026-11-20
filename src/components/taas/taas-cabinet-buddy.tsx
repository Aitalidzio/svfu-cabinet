"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { TaasCompanion } from "@/components/taas/taas-companion";
import type { Dictionary } from "@/i18n/dictionaries";
import { pickTaasState, type TaasSnapshot } from "@/lib/taas";

/** Re-picks line/emotion when the route changes. */
export function TaasCabinetBuddy({
  snapshot,
  labels,
}: {
  snapshot: TaasSnapshot;
  labels: Dictionary["taas"];
}) {
  const pathname = usePathname();
  const base = useMemo(() => pickTaasState(snapshot, pathname), [snapshot, pathname]);
  return <TaasCompanion base={base} labels={labels} placement="cabinet" />;
}
