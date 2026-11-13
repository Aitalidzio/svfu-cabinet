import { Suspense, type ReactNode } from "react";
import { BookOpen, Building2, GraduationCap, IdCard, LogOut, MonitorSmartphone, UsersRound, UserRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { sectionMetadata } from "@/components/section-placeholder";
import { LanguageSwitcher } from "@/components/shell/language-switcher";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { logout, logoutEverywhere } from "@/server/auth/actions";
import { requireUser } from "@/server/dal/user";

export const generateMetadata = () => sectionMetadata("profile");

export default async function ProfilePage() {
  const dict = await getDictionary();
  return (
    <>
      <PageHeader title={dict.nav.profile} />
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileDetails />
      </Suspense>
    </>
  );
}

function initials(fullName: string) {
  const [surname = "", name = ""] = fullName.split(" ");
  return `${name[0] ?? ""}${surname[0] ?? ""}`.toUpperCase();
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-line bg-surface p-5 sm:p-6 ${className}`}>{children}</section>;
}

async function ProfileDetails() {
  const [user, dict, locale] = await Promise.all([requireUser(), getDictionary(), getLocale()]);
  const t = dict.profile;
  const icon = "size-5 shrink-0 text-fg-muted";

  const rows: { icon: ReactNode; label: string; value: string }[] = [
    { icon: <Building2 className={icon} aria-hidden />, label: t.institute, value: user.institute.name },
  ];
  if (user.group) {
    rows.push(
      { icon: <BookOpen className={icon} aria-hidden />, label: t.program, value: `${user.group.programCode} ${user.group.programName}` },
      { icon: <GraduationCap className={icon} aria-hidden />, label: t.course, value: t.courseValue.replace("{n}", String(user.group.course)) },
      { icon: <UsersRound className={icon} aria-hidden />, label: t.group, value: user.group.code },
    );
  }
  if (user.recordBookNumber) {
    rows.push({ icon: <IdCard className={icon} aria-hidden />, label: t.recordBook, value: user.recordBookNumber });
  }
  rows.push({ icon: <UserRound className={icon} aria-hidden />, label: t.login, value: user.login });

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
      <Card>
        <div className="flex items-center gap-4">
          <span aria-hidden className="bg-aurora grid size-16 shrink-0 place-items-center rounded-2xl text-xl font-bold text-white">
            {initials(user.fullName)}
          </span>
          <div className="min-w-0">
            <p className="text-xl font-bold leading-tight tracking-tight">{user.fullName}</p>
            <p className="mt-1.5 inline-flex rounded-full bg-primary-soft px-2.5 py-0.5 text-sm font-medium text-primary">
              {t.roles[user.role]}
            </p>
          </div>
        </div>
        <dl className="mt-6 divide-y divide-line">
          {rows.map((row) => (
            <div key={row.label} className="flex gap-3 py-3.5">
              {row.icon}
              <div className="min-w-0">
                <dt className="text-sm text-fg-muted">{row.label}</dt>
                <dd className="mt-0.5 break-words font-medium">{row.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </Card>

      <div className="grid gap-4">
        <Card>
          <h2 className="font-semibold">{t.language}</h2>
          <div className="mt-3 w-fit">
            <LanguageSwitcher current={locale} label={t.language} />
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold">{t.session}</h2>
          <form action={logout} className="mt-3">
            <input type="hidden" name="lang" value={locale} />
            <button
              type="submit"
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-line px-4 font-semibold transition-colors hover:bg-surface-2"
            >
              <LogOut className="size-5" aria-hidden />
              {t.logout}
            </button>
          </form>
          <form action={logoutEverywhere} className="mt-3">
            <input type="hidden" name="lang" value={locale} />
            <button
              type="submit"
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 font-semibold text-danger transition-colors hover:bg-danger-soft"
            >
              <MonitorSmartphone className="size-5" aria-hidden />
              {t.logoutEverywhere}
            </button>
            <p className="mt-2 text-sm text-fg-muted">{t.logoutEverywhereHint}</p>
          </form>
        </Card>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]" aria-hidden>
      <div className="h-96 animate-pulse rounded-2xl bg-surface-2" />
      <div className="grid gap-4">
        <div className="h-28 animate-pulse rounded-2xl bg-surface-2" />
        <div className="h-44 animate-pulse rounded-2xl bg-surface-2" />
      </div>
    </div>
  );
}
