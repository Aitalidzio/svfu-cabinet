import type { ISODate } from "./calendar";

// ISO dates are calendar dates, so they are formatted in UTC to avoid shifting the day.
const asDate = (iso: ISODate) => new Date(`${iso}T00:00:00Z`);

export function formatDate(iso: ISODate, locale: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale, { timeZone: "UTC", ...options }).format(asDate(iso));
}

export function formatDateRange(from: ISODate, to: ISODate, locale: string): string {
  return new Intl.DateTimeFormat(locale, { timeZone: "UTC", day: "numeric", month: "short" }).formatRange(asDate(from), asDate(to));
}

/** Non-breaking space (U+00A0). */
const NBSP = String.fromCharCode(0xa0);

/** «Тимофеев Николай Ильич» → «Тимофеев Н. И.», with non-breaking spaces so initials never wrap apart. */
export function shortName(fullName: string): string {
  const [surname, ...rest] = fullName.split(" ");
  return [surname, ...rest.map((part) => `${part[0]}.`)].join(NBSP);
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));
}

/** Picks the right word form for a number: ru «1 балл / 2 балла / 5 баллов», en «1 point / 5 points», sah «5 баал». */
export function plural(locale: string, n: number, forms: Partial<Record<Intl.LDMLPluralRule, string>>): string {
  const category = new Intl.PluralRules(locale).select(n);
  return forms[category] ?? forms.other ?? "";
}

/** A moment in time (e.g. a status change) shown in Yakutsk time: «11 ноября, 14:02». */
export function formatDateTime(date: Date, locale: string, withTime = true): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: "Asia/Yakutsk",
    day: "numeric",
    month: "long",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}
