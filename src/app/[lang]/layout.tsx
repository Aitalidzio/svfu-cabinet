import type { Metadata, Viewport } from "next";
import { Onest } from "next/font/google";
import { ThemeProvider } from "@/components/shell/theme-provider";
import { TaasProvider } from "@/components/taas/taas-provider";
import { locales } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import "../globals.css";

// Onest contains the Sakha letters Ҕ Ҥ Ө Һ Ү; they live in the cyrillic-ext subset.
const onest = Onest({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-onest",
  display: "swap",
});

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return {
    title: { default: dict.meta.title, template: `%s · ${dict.app.name}` },
    description: dict.meta.description,
  };
}

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1e" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();

  return (
    // Do not put <script> here: language soft-nav re-renders this layout and React 19
    // rejects script tags on the client. ThemeProvider applies the cookie before paint.
    <html lang={locale} suppressHydrationWarning className={`${onest.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <ThemeProvider>
          <TaasProvider>{children}</TaasProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
