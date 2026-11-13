import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, hasLocale, LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { SESSION_COOKIE } from "@/server/auth/cookie";

// Pages under /{lang}/ that are open without signing in.
const PUBLIC_PAGES = new Set(["login"]);

function preferredLocale(request: NextRequest): Locale {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (saved && hasLocale(saved)) return saved;

  const ranked = (request.headers.get("accept-language") ?? "")
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().toLowerCase().split(";q=");
      return { base: tag.split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { base } of ranked) {
    if (hasLocale(base)) return base;
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const [, firstSegment = "", page = ""] = pathname.split("/");

  // 1. Every page lives under a language: / → /ru, /schedule → /ru/schedule.
  if (!hasLocale(firstSegment)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  // 2. Optimistic check only: no session cookie at all → login page.
  //    Whether the session is real is checked against the database in src/server/dal before any data is read.
  if (!PUBLIC_PAGES.has(page) && !request.cookies.has(SESSION_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${firstSegment}/login`;
    url.search = "";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
