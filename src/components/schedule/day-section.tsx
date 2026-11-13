import { CalendarOff } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatDate } from "@/lib/format";
import type { ScheduleDay } from "@/server/dal/schedule";
import { LessonCard } from "./lesson-card";

export function DaySection({ day, t, locale }: { day: ScheduleDay; t: Dictionary["schedule"]; locale: string }) {
  const title = formatDate(day.date, locale, { weekday: "long", day: "numeric", month: "long" });
  const headingId = `day-${day.date}`;

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="flex flex-wrap items-center gap-2 text-base font-semibold first-letter:uppercase">
        <span className="first-letter:uppercase">{title}</span>
        {day.isToday ? (
          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-on-primary">{t.today}</span>
        ) : null}
        {day.hasChanges ? (
          <span className="rounded-full bg-warning-soft px-2 py-0.5 text-xs font-semibold text-warning ring-1 ring-warning/30">
            {t.hasChanges}
          </span>
        ) : null}
      </h2>

      {day.items.length ? (
        <ol className="mt-3 space-y-2.5">
          {day.items.map((item) => (
            <LessonCard key={item.key} item={item} t={t} locale={locale} />
          ))}
        </ol>
      ) : (
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-dashed border-line bg-surface px-4 py-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-success-soft text-success">
            <CalendarOff className="size-5" aria-hidden />
          </span>
          <div>
            <p className="font-semibold">{t.noLessons}</p>
            <p className="text-sm text-fg-muted">{day.inSemester ? t.noLessonsText : t.outOfSemester}</p>
          </div>
        </div>
      )}
    </section>
  );
}
