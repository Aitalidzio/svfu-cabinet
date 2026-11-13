import { BRS, type ControlType, type Level } from "@/lib/brs";

export const levelText: Record<Level, string> = {
  success: "text-success",
  info: "text-primary",
  warning: "text-warning",
  danger: "text-danger",
};

const levelFill: Record<Level, string> = {
  success: "bg-success",
  info: "bg-primary",
  warning: "bg-warning",
  danger: "bg-danger",
};

/** Points that matter for this kind of control: shown as ticks on the bar. */
function thresholds(type: ControlType): number[] {
  if (type === "credit") return [BRS.creditPass];
  if (type === "exam") return [BRS.admission, BRS.automat];
  return [BRS.markMin[3], BRS.markMin[4], BRS.markMin[5]];
}

type Props = { type: ControlType; points: number; remaining: number; max: number; level: Level; label: string };

export function PointsBar({ type, points, remaining, max, level, label }: Props) {
  const pct = (n: number) => `${Math.min(100, (n / max) * 100)}%`;
  const reachable = Math.min(max, points + remaining);

  return (
    <div className="mt-4">
      <div role="img" aria-label={label} className="relative h-2.5 overflow-hidden rounded-full bg-surface-2">
        {/* what can still be earned this term */}
        <div className={`absolute inset-y-0 left-0 opacity-25 ${levelFill[level]}`} style={{ width: pct(reachable) }} />
        {/* what is already earned */}
        <div className={`absolute inset-y-0 left-0 rounded-full ${levelFill[level]}`} style={{ width: pct(points) }} />
        {thresholds(type).map((t) => (
          <div key={t} className="absolute inset-y-0 w-0.5 bg-fg/40" style={{ left: pct(t) }} />
        ))}
      </div>
      <div aria-hidden className="relative mt-1 h-4 text-[11px] tabular-nums text-fg-muted">
        {thresholds(type).map((t) => (
          <span key={t} className="absolute -translate-x-1/2" style={{ left: pct(t) }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
