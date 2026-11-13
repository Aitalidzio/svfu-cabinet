"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, LoaderCircle } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { PAIR_TIMES } from "@/lib/calendar";
import { createScheduleChange, type CreateChangeState } from "@/server/schedule/change-actions";

type Lesson = {
  lessonId: number;
  pairNumber: number;
  subject: string;
  teacher: string;
  room: string;
};

type T = Dictionary["scheduleChanges"];

export function ChangeForm({
  lang,
  groups,
  teachers,
  groupCode,
  date,
  lessons,
  t,
}: {
  lang: Locale;
  groups: { code: string; course: number }[];
  teachers: { id: number; fullName: string }[];
  groupCode: string;
  date: string;
  lessons: Lesson[];
  t: T;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<CreateChangeState, FormData>(createScheduleChange, undefined);
  const [kind, setKind] = useState(state?.values?.kind ?? "cancelled");

  function reload(nextGroup: string, nextDate: string) {
    const params = new URLSearchParams({ group: nextGroup, date: nextDate });
    router.push(`/${lang}/schedule/changes?${params}`);
  }

  return (
    <form action={formAction} noValidate className="space-y-5 rounded-2xl border border-line bg-surface p-5">
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="groupCode" value={groupCode} />
      <input type="hidden" name="date" value={date} />
      <h2 className="text-lg font-semibold">{t.formTitle}</h2>

      {state?.formError ? (
        <p role="alert" className="flex gap-2.5 rounded-xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
          <CircleAlert className="mt-px size-4 shrink-0" aria-hidden />
          {t.errors[state.formError]}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="chg-group" className="mb-2 block text-sm font-semibold">
            {t.groupLabel}
          </label>
          <select
            id="chg-group"
            value={groupCode}
            onChange={(e) => reload(e.target.value, date)}
            className="min-h-11 w-full rounded-xl border border-line bg-canvas px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {groups.map((g) => (
              <option key={g.code} value={g.code}>
                {g.code}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="chg-date" className="mb-2 block text-sm font-semibold">
            {t.dateLabel}
          </label>
          <input
            id="chg-date"
            type="date"
            value={date}
            onChange={(e) => reload(groupCode, e.target.value)}
            className="min-h-11 w-full rounded-xl border border-line bg-canvas px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
      </div>

      <div>
        <label htmlFor="chg-lesson" className="mb-2 block text-sm font-semibold">
          {t.lessonLabel}
        </label>
        {!lessons.length ? (
          <p className="rounded-xl bg-surface-2 px-4 py-3 text-sm text-fg-muted">{t.noLessons}</p>
        ) : (
          <select
            id="chg-lesson"
            name="lessonId"
            defaultValue={state?.values?.lessonId ?? String(lessons[0].lessonId)}
            className="min-h-11 w-full rounded-xl border border-line bg-canvas px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {lessons.map((l) => (
              <option key={l.lessonId} value={l.lessonId}>
                {l.pairNumber}. {l.subject} · {l.room}
              </option>
            ))}
          </select>
        )}
        {state?.errors?.lessonId ? <p className="mt-1.5 text-sm font-medium text-danger">{t.errors[state.errors.lessonId]}</p> : null}
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">{t.kindLabel}</legend>
        <div className="grid gap-2">
          {(["cancelled", "moved", "modified"] as const).map((value) => (
            <label
              key={value}
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-line px-4 text-sm font-medium has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:checked]:text-primary"
            >
              <input
                type="radio"
                name="kind"
                value={value}
                checked={kind === value}
                onChange={() => setKind(value)}
                className="size-4 accent-[var(--primary)]"
              />
              {t.kinds[value]}
            </label>
          ))}
        </div>
      </fieldset>

      {kind === "moved" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="chg-new-date" className="mb-2 block text-sm font-semibold">
              {t.newDateLabel}
            </label>
            <input
              id="chg-new-date"
              type="date"
              name="newDate"
              defaultValue={state?.values?.newDate ?? date}
              className="min-h-11 w-full rounded-xl border border-line bg-canvas px-4 text-sm"
            />
          </div>
          <div>
            <label htmlFor="chg-new-pair" className="mb-2 block text-sm font-semibold">
              {t.newPairLabel}
            </label>
            <select
              id="chg-new-pair"
              name="newPairNumber"
              defaultValue={state?.values?.newPairNumber ?? "1"}
              className="min-h-11 w-full rounded-xl border border-line bg-canvas px-4 text-sm"
            >
              {Object.entries(PAIR_TIMES).map(([n, time]) => (
                <option key={n} value={n}>
                  {n}. {time.start}–{time.end}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="chg-new-room-moved" className="mb-2 block text-sm font-semibold">
              {t.newRoomLabel}
            </label>
            <input
              id="chg-new-room-moved"
              name="newRoom"
              defaultValue={state?.values?.newRoom}
              className="min-h-11 w-full rounded-xl border border-line bg-canvas px-4 text-sm"
            />
          </div>
        </div>
      ) : null}

      {kind === "modified" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="chg-new-room" className="mb-2 block text-sm font-semibold">
              {t.newRoomLabel}
            </label>
            <input
              id="chg-new-room"
              name="newRoom"
              defaultValue={state?.values?.newRoom}
              className="min-h-11 w-full rounded-xl border border-line bg-canvas px-4 text-sm"
            />
          </div>
          <div>
            <label htmlFor="chg-teacher" className="mb-2 block text-sm font-semibold">
              {t.newTeacherLabel}
            </label>
            <select
              id="chg-teacher"
              name="newTeacherId"
              defaultValue={state?.values?.newTeacherId ?? ""}
              className="min-h-11 w-full rounded-xl border border-line bg-canvas px-4 text-sm"
            >
              <option value="">—</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      <div>
        <label htmlFor="chg-reason" className="mb-2 block text-sm font-semibold">
          {t.reasonLabel}
        </label>
        <textarea
          id="chg-reason"
          name="reason"
          rows={2}
          defaultValue={state?.values?.reason}
          placeholder={t.reasonPlaceholder}
          className="w-full rounded-xl border border-line bg-canvas px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </div>

      <button
        type="submit"
        disabled={pending || !lessons.length}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 font-semibold text-on-primary disabled:opacity-70 sm:w-auto"
      >
        {pending ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : null}
        {pending ? t.submitting : t.submit}
      </button>
    </form>
  );
}
