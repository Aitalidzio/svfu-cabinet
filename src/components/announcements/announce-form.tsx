"use client";

import { useActionState, useState } from "react";
import { CircleAlert, LoaderCircle } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { BODY_MAX, TITLE_MAX } from "@/lib/announcements";
import { publishAnnouncement, type PublishAnnouncementState } from "@/server/announcements/actions";

type T = Dictionary["announcements"];

export function AnnounceForm({
  lang,
  groups,
  t,
}: {
  lang: Locale;
  groups: { code: string; course: number }[];
  t: T;
}) {
  const [state, formAction, pending] = useActionState<PublishAnnouncementState, FormData>(publishAnnouncement, undefined);
  const [audience, setAudience] = useState(state?.values?.audience ?? "institute");

  return (
    <form action={formAction} noValidate className="space-y-5 rounded-2xl border border-line bg-surface p-5">
      <input type="hidden" name="lang" value={lang} />
      <h2 className="text-lg font-semibold">{t.newTitle}</h2>

      {state?.formError ? (
        <p role="alert" className="flex gap-2.5 rounded-xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
          <CircleAlert className="mt-px size-4 shrink-0" aria-hidden />
          {t.errors[state.formError]}
        </p>
      ) : null}

      <div>
        <label htmlFor="ann-title" className="mb-2 block text-sm font-semibold">
          {t.titleLabel}
        </label>
        <input
          id="ann-title"
          name="title"
          maxLength={TITLE_MAX}
          defaultValue={state?.values?.title}
          className={`w-full rounded-xl border bg-canvas px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            state?.errors?.title ? "border-danger" : "border-line"
          }`}
        />
        {state?.errors?.title ? <p className="mt-1.5 text-sm font-medium text-danger">{t.errors[state.errors.title]}</p> : null}
      </div>

      <div>
        <label htmlFor="ann-body" className="mb-2 block text-sm font-semibold">
          {t.bodyLabel}
        </label>
        <textarea
          id="ann-body"
          name="body"
          rows={5}
          maxLength={BODY_MAX}
          defaultValue={state?.values?.body}
          className={`w-full rounded-xl border bg-canvas px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            state?.errors?.body ? "border-danger" : "border-line"
          }`}
        />
        {state?.errors?.body ? <p className="mt-1.5 text-sm font-medium text-danger">{t.errors[state.errors.body]}</p> : null}
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">{t.audienceLabel}</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {(["institute", "course", "group"] as const).map((value) => (
            <label
              key={value}
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-line px-4 text-sm font-medium has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:checked]:text-primary"
            >
              <input
                type="radio"
                name="audience"
                value={value}
                checked={audience === value}
                onChange={() => setAudience(value)}
                className="size-4 accent-[var(--primary)]"
              />
              {t.audiences[value]}
            </label>
          ))}
        </div>
      </fieldset>

      {audience === "course" ? (
        <div>
          <label htmlFor="ann-course" className="mb-2 block text-sm font-semibold">
            {t.courseLabel}
          </label>
          <select
            id="ann-course"
            name="course"
            defaultValue={state?.values?.course ?? "3"}
            className="min-h-11 w-full rounded-xl border border-line bg-canvas px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {audience === "group" ? (
        <div>
          <label htmlFor="ann-group" className="mb-2 block text-sm font-semibold">
            {t.groupLabel}
          </label>
          <select
            id="ann-group"
            name="groupCode"
            defaultValue={state?.values?.groupCode ?? groups[0]?.code}
            className="min-h-11 w-full rounded-xl border border-line bg-canvas px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {groups.map((g) => (
              <option key={g.code} value={g.code}>
                {g.code}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 font-semibold text-on-primary disabled:opacity-70 sm:w-auto"
      >
        {pending ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : null}
        {pending ? t.submitting : t.submit}
      </button>
    </form>
  );
}
