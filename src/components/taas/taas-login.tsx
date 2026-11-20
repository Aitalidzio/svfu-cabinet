"use client";

import { TaasCompanion } from "@/components/taas/taas-companion";
import type { Dictionary } from "@/i18n/dictionaries";
import { TAAS_INTRO } from "@/lib/taas";

/** Login screen: Taas introduces himself (no session snapshot). */
export function TaasLogin({ labels }: { labels: Dictionary["taas"] }) {
  return <TaasCompanion base={TAAS_INTRO} labels={labels} placement="login" />;
}
