import { Suspense } from "react";
import { TaasCabinetBuddy } from "@/components/taas/taas-cabinet-buddy";
import type { Dictionary } from "@/i18n/dictionaries";
import { getTaasSnapshot } from "@/server/dal/taas";

async function TaasCompanionLoaded({ dict }: { dict: Dictionary }) {
  const snapshot = await getTaasSnapshot();
  if (!snapshot) return null;
  return <TaasCabinetBuddy snapshot={snapshot} labels={dict.taas} />;
}

/** Session-bound mascot; cookie toggle lives in TaasProvider (client). */
export function TaasHost({ dict }: { dict: Dictionary }) {
  return (
    <Suspense fallback={null}>
      <TaasCompanionLoaded dict={dict} />
    </Suspense>
  );
}
