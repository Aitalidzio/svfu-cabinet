import { ArrowRight, Info, MapPin, UserRound } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill, formatDate, shortName } from "@/lib/format";
import type { ScheduleItem } from "@/server/dal/schedule";

type T = Dictionary["schedule"];

const cardStyle: Record<ScheduleItem["status"], string> = {
  regular: "border-line bg-surface",
  cancelled: "border-line bg-surface",
  movedAway: "border-line bg-surface",
  movedHere: "border-warning/40 bg-warning-soft",
  modified: "border-warning/40 bg-warning-soft",
};

const chip = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold";

/** «412» → «ауд. 412», but «Спортзал» and «Актовый зал» stay as they are. */
export function roomLabel(t: T, room: string) {
  return /^\d/.test(room) ? fill(t.room, { room }) : room;
}

function when(t: T, locale: string, date: string, pairNumber: number) {
  const day = formatDate(date, locale, { weekday: "short", day: "numeric", month: "short" });
  return `${day}, ${fill(t.pair, { n: pairNumber })}`;
}

export function LessonCard({ item, t, locale }: { item: ScheduleItem; t: T; locale: string }) {
  const gone = item.status === "cancelled" || item.status === "movedAway";
  const statusChip =
    item.status === "regular" ? null : (
      <span className={`${chip} ${item.status === "cancelled" ? "bg-danger-soft text-danger" : "bg-warning-soft text-warning ring-1 ring-warning/30"}`}>
        {t.status[item.status]}
      </span>
    );

  return (
    <li
      className={`flex gap-3 rounded-2xl border p-4 ${cardStyle[item.status]} ${
        item.isNow ? "border-primary ring-2 ring-primary/20" : ""
      }`}
    >
      <div className="flex w-12 shrink-0 flex-col items-center pt-0.5 text-center tabular-nums">
        <span className={`text-sm font-semibold ${gone ? "text-fg-muted line-through" : ""}`}>{item.start}</span>
        <span className="text-xs text-fg-muted">{item.end}</span>
        <span className="mt-1.5 text-[11px] leading-tight text-fg-muted">{fill(t.pair, { n: item.pairNumber })}</span>
      </div>

      <div className="min-w-0 flex-1 border-l border-line pl-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`${chip} bg-surface-2 font-medium text-fg-muted`}>{t.kinds[item.kind]}</span>
          {statusChip}
          {item.isNow ? <span className={`${chip} bg-primary text-on-primary`}>{t.now}</span> : null}
        </div>

        <p className={`mt-1.5 font-semibold leading-snug ${gone ? "text-fg-muted line-through" : ""}`}>{item.subject}</p>

        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-fg-muted">
          <span className="inline-flex flex-wrap items-center gap-1">
            <MapPin className="size-4 shrink-0" aria-hidden />
            {item.change?.previousRoom ? (
              <>
                <s>{roomLabel(t, item.change.previousRoom)}</s>
                <ArrowRight className="size-3.5" aria-label="→" />
                <span className="font-semibold text-fg">{roomLabel(t, item.room)}</span>
              </>
            ) : (
              roomLabel(t, item.room)
            )}
          </span>
          <span className="inline-flex flex-wrap items-center gap-1">
            <UserRound className="size-4 shrink-0" aria-hidden />
            {item.change?.previousTeacher ? (
              <>
                <s>{shortName(item.change.previousTeacher)}</s>
                <ArrowRight className="size-3.5" aria-label="→" />
                <span className="font-semibold text-fg">{shortName(item.teacher)}</span>
              </>
            ) : (
              shortName(item.teacher)
            )}
          </span>
        </div>

        {item.change?.to ? (
          <p className="mt-2 text-sm font-semibold text-warning">
            {fill(t.movedTo, { when: when(t, locale, item.change.to.date, item.change.to.pairNumber) })},{" "}
            {roomLabel(t, item.change.to.room)}
          </p>
        ) : null}
        {item.change?.from ? (
          <p className="mt-2 text-sm font-semibold text-warning">
            {fill(t.movedFrom, { when: when(t, locale, item.change.from.date, item.change.from.pairNumber) })}
          </p>
        ) : null}
        {item.change?.reason ? (
          <p className="mt-1.5 flex gap-1.5 text-sm text-fg-muted">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            {item.change.reason}
          </p>
        ) : null}
      </div>
    </li>
  );
}
