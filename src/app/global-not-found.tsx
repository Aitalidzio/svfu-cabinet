import type { Metadata } from "next";
import Link from "next/link";
import { Onest } from "next/font/google";
import "./globals.css";

// Shown for URLs that match no route at all. It renders outside the [lang] layout,
// so the language is unknown: the message is given in all three languages.
const onest = Onest({ subsets: ["latin", "cyrillic", "cyrillic-ext"], variable: "--font-onest" });

export const metadata: Metadata = {
  title: "404 — Страница не найдена",
};

export default function GlobalNotFound() {
  return (
    <html lang="ru" className={`${onest.variable} h-full antialiased`}>
      <body className="grid min-h-full place-items-center px-6 font-sans">
        <main className="max-w-md text-center">
          <p className="text-7xl font-bold tracking-tight text-primary">404</p>
          <h1 className="mt-4 text-2xl font-bold">Страница не найдена</h1>
          <p className="mt-2 text-fg-muted" lang="sah">Сирэй көстүбэтэ</p>
          <p className="text-fg-muted" lang="en">Page not found</p>
          <Link
            href="/"
            className="mt-8 inline-flex min-h-11 items-center rounded-full bg-primary px-5 font-semibold text-on-primary transition-opacity hover:opacity-90"
          >
            На главную
          </Link>
        </main>
      </body>
    </html>
  );
}
