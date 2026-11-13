import { Suspense } from "react";
import type { Metadata } from "next";
import { CalendarClock, Clock3, FileCheck, Flame } from "lucide-react";
import { getDictionary } from "@/i18n/dictionaries";
import { getCurrentUser } from "@/server/dal/user";

// The page shell is prerendered; only the name streams in after the session is checked.
async function Greeting() {
  const [user, dict] = await Promise.all([getCurrentUser(), getDictionary()]);
  const firstName = user?.fullName.split(" ")[1];
  return <>{firstName ? dict.today.greetingNamed.replace("{name}", firstName) : dict.today.greeting}</>;
}

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.nav.today };
}

const tones = {
  primary: "bg-primary-soft text-primary",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  success: "bg-success-soft text-success",
} as const;

export default async function TodayPage() {
  const dict = await getDictionary();
  const icon = "size-5";
  const cards = [
    { key: "nextClass", tone: "primary", icon: <Clock3 className={icon} aria-hidden />, ...dict.today.cards.nextClass },
    { key: "changes", tone: "warning", icon: <CalendarClock className={icon} aria-hidden />, ...dict.today.cards.changes },
    { key: "grades", tone: "danger", icon: <Flame className={icon} aria-hidden />, ...dict.today.cards.grades },
    { key: "requests", tone: "success", icon: <FileCheck className={icon} aria-hidden />, ...dict.today.cards.requests },
  ] as const;

  return (
    <>
      <section className="bg-aurora relative isolate overflow-hidden rounded-3xl px-6 py-9 text-white shadow-lg shadow-primary/20 sm:px-10 sm:py-12">
        <svg
          aria-hidden
          viewBox="0 0 32 32"
          className="absolute -right-10 -top-12 -z-10 size-60 opacity-20"
          fill="none"
          stroke="white"
          strokeWidth="0.6"
          strokeLinejoin="round"
        >
          <path d="M10 7h12l6 6-12 14L4 13z" />
          <path d="M4 13h24M13 13l3-6 3 6M13 13l3 14 3-14" />
        </svg>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          <Suspense fallback={dict.today.greeting}>
            <Greeting />
          </Suspense>
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed sm:text-lg">{dict.today.lead}</p>
      </section>

      <h2 className="mt-10 text-lg font-semibold">{dict.today.previewTitle}</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {cards.map((card) => (
          <li key={card.key} className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
            <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${tones[card.tone]}`}>
              {card.icon}
            </span>
            <div>
              <h3 className="font-semibold">{card.title}</h3>
              <p className="mt-1 text-sm text-fg-muted">{card.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
