"use client";

import { useActionState } from "react";
import { CircleAlert, LoaderCircle } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { RequestStatus } from "@/lib/requests";
import { updateRequestStatus, type UpdateStatusState } from "@/server/requests/actions";

type T = Dictionary["requests"];

export function StatusForm({
  lang,
  requestId,
  nextStatuses,
  t,
}: {
  lang: Locale;
  requestId: number;
  nextStatuses: RequestStatus[];
  t: T;
}) {
  const [state, formAction, pending] = useActionState<UpdateStatusState, FormData>(updateRequestStatus, undefined);
  if (!nextStatuses.length) return null;

  const st = t.staff;

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-line bg-surface p-5">
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="id" value={requestId} />

      <h2 className="font-semibold">{st.changeStatus}</h2>

      {state?.error ? (
        <p role="alert" className="flex gap-2.5 rounded-xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
          <CircleAlert className="mt-px size-4 shrink-0" aria-hidden />
          {st.errors[state.error]}
        </p>
      ) : null}

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">{st.changeStatus}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {nextStatuses.map((status) => (
            <label
              key={status}
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-line bg-surface px-4 text-sm font-medium transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:checked]:text-primary has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary"
            >
              <input
                type="radio"
                name="status"
                value={status}
                defaultChecked={(state?.values?.status ?? nextStatuses[0]) === status}
                className="size-4 accent-[var(--primary)]"
                required
              />
              {t.statuses[status]}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="status-note" className="mb-2 block text-sm font-semibold">
          {st.noteLabel}
        </label>
        <textarea
          id="status-note"
          name="note"
          rows={3}
          defaultValue={state?.values?.note}
          placeholder={st.notePlaceholder}
          className="w-full rounded-xl border border-line bg-canvas px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
        <p className="mt-1.5 text-sm text-fg-muted">{st.noteHint}</p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 font-semibold text-on-primary transition-opacity disabled:opacity-70 sm:w-auto"
      >
        {pending ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : null}
        {pending ? st.submittingStatus : st.submitStatus}
      </button>
    </form>
  );
}
