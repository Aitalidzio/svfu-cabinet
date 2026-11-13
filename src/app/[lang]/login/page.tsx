import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CalendarDays, FileText, GraduationCap } from "lucide-react";
import { ConceptNote } from "@/components/concept-note";
import { Logo, LogoMark } from "@/components/logo";
import { LanguageSwitcher } from "@/components/shell/language-switcher";
import type { Locale } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getCurrentUser } from "@/server/dal/user";
import { LoginForm } from "./login-form";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.login.title };
}

// A valid session means there is nothing to do here — go straight to the cabinet.
async function RedirectIfSignedIn({ lang }: { lang: Locale }) {
  if (await getCurrentUser()) redirect(`/${lang}`);
  return null;
}

export default async function LoginPage() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  const t = dict.login;
  const features = [
    { icon: <CalendarDays className="size-5" aria-hidden />, text: t.features.schedule },
    { icon: <GraduationCap className="size-5" aria-hidden />, text: t.features.grades },
    { icon: <FileText className="size-5" aria-hidden />, text: t.features.requests },
  ];

  return (
    <main className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Brand panel — desktop only */}
      <section className="bg-aurora relative isolate hidden overflow-hidden p-12 text-white lg:flex lg:flex-col">
        <svg
          aria-hidden
          viewBox="0 0 32 32"
          className="absolute -bottom-24 -right-24 -z-10 size-[28rem] opacity-15"
          fill="none"
          stroke="white"
          strokeWidth="0.5"
          strokeLinejoin="round"
        >
          <path d="M10 7h12l6 6-12 14L4 13z" />
          <path d="M4 13h24M13 13l3-6 3 6M13 13l3 14 3-14" />
        </svg>
        <div className="flex items-center gap-3">
          <LogoMark className="size-11 ring-1 ring-white/40" />
          <span className="text-xl font-bold tracking-tight">{dict.app.name}</span>
        </div>
        <div className="my-auto max-w-md">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">{t.lead}</h2>
          <ul className="mt-10 space-y-4">
            {features.map((feature) => (
              <li key={feature.text} className="flex items-center gap-3 text-lg">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/15">{feature.icon}</span>
                {feature.text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Form */}
      <section className="flex flex-col px-4 pb-6 pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-8">
        <div className="flex items-center justify-between gap-3">
          <span className="lg:invisible">
            <Logo name={dict.app.name} tagline={dict.app.tagline} />
          </span>
          <LanguageSwitcher current={locale} label={dict.language.label} />
        </div>

        <div className="mx-auto my-auto w-full max-w-sm py-12">
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="mt-2 text-fg-muted lg:hidden">{t.lead}</p>
          <LoginForm lang={locale} t={t} />
          <Suspense fallback={null}>
            <RedirectIfSignedIn lang={locale} />
          </Suspense>
        </div>

        <ConceptNote text={dict.concept.note} className="mx-auto w-full max-w-sm" />
      </section>
    </main>
  );
}
