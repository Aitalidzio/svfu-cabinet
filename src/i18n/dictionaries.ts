import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { defaultLocale, hasLocale, type Locale } from "./config";

export type Dictionary = typeof import("./dictionaries/ru.json");

const dictionaries = {
  ru: () => import("./dictionaries/ru.json").then((m) => m.default),
  sah: () => import("./dictionaries/sah.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
} satisfies Record<Locale, () => Promise<Dictionary>>;

export async function getLocale(): Promise<Locale> {
  const value = await lang();
  if (!hasLocale(value)) notFound();
  return value;
}

/** For `not-found.tsx`: never call `notFound()` again (that blanks the 404 UI). */
export async function getLocaleSafe(): Promise<Locale> {
  try {
    const value = await lang();
    if (hasLocale(value)) return value;
  } catch {
    // root-params can be unavailable while rendering a not-found boundary
  }
  return defaultLocale;
}

export async function getDictionary(): Promise<Dictionary> {
  return dictionaries[await getLocale()]();
}

export async function getDictionarySafe(): Promise<Dictionary> {
  return dictionaries[await getLocaleSafe()]();
}
