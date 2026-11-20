export const locales = ["ru", "sah", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ru";

export const LOCALE_COOKIE = "lang";

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export const localeNames: Record<Locale, { short: string; native: string }> = {
  ru: { short: "РУС", native: "Русский" },
  sah: { short: "САХ", native: "Саха тыла" },
  en: { short: "ENG", native: "English" },
};
