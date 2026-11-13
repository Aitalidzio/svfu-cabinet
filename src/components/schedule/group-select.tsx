"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { GroupOption } from "@/server/dal/schedule";

type Props = {
  label: string;
  current: string;
  groups: GroupOption[];
  basePath: string;
  /** Query params to keep when switching group (view, week). */
  keep: Record<string, string>;
};

export function GroupSelect({ label, current, groups, basePath, keep }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const institutes = [...new Set(groups.map((g) => g.instituteCode))];

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="font-medium text-fg-muted">{label}</span>
      <select
        value={current}
        aria-busy={pending}
        onChange={(event) => {
          const params = new URLSearchParams({ ...keep, group: event.target.value });
          startTransition(() => router.push(`${basePath}?${params}`));
        }}
        className="h-11 rounded-xl border border-line bg-surface px-3 text-base font-semibold text-fg transition-opacity aria-busy:opacity-60"
      >
        {institutes.map((institute) => (
          <optgroup key={institute} label={institute}>
            {groups
              .filter((g) => g.instituteCode === institute)
              .map((g) => (
                <option key={g.code} value={g.code}>
                  {g.code}
                </option>
              ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
