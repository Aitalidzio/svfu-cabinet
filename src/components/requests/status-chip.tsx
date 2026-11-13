import type { RequestStatus } from "@/lib/requests";

const style: Record<RequestStatus, string> = {
  submitted: "bg-primary-soft text-primary",
  in_progress: "bg-primary-soft text-primary",
  ready: "bg-success-soft text-success ring-1 ring-success/30",
  issued: "bg-surface-2 text-fg-muted",
  rejected: "bg-danger-soft text-danger",
  cancelled: "bg-surface-2 text-fg-muted",
};

export function StatusChip({ status, label, large = false }: { status: RequestStatus; label: string; large?: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full font-semibold ${style[status]} ${
        large ? "px-3 py-1 text-sm" : "px-2.5 py-0.5 text-xs"
      }`}
    >
      {label}
    </span>
  );
}
