// Temporary logo: a faceted diamond — a nod to Yakutia, the diamond region.
// It is our own drawing and does not copy the official NEFU (СВФУ) logo.

export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`bg-aurora grid shrink-0 place-items-center rounded-xl shadow-sm ${className}`}
    >
      <svg
        viewBox="0 0 32 32"
        className="size-[72%]"
        fill="none"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 7h12l6 6-12 14L4 13z" />
        <path d="M4 13h24M13 13l3-6 3 6M13 13l3 14 3-14" />
      </svg>
    </span>
  );
}

export function Logo({ name, tagline }: { name: string; tagline?: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="text-[17px] font-bold tracking-tight text-fg">{name}</span>
        {tagline ? <span className="mt-1 text-xs text-fg-muted">{tagline}</span> : null}
      </span>
    </span>
  );
}
