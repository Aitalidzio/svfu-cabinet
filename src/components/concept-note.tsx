import { Info } from "lucide-react";

export function ConceptNote({ text, className = "" }: { text: string; className?: string }) {
  return (
    <p className={`flex gap-2 text-xs leading-relaxed text-fg-muted ${className}`}>
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{text}</span>
    </p>
  );
}
