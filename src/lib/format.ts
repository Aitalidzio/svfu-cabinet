import type { ISODate } from "./calendar";

// ISO dates are calendar dates, so they are formatted in UTC to avoid shifting the day.
const asDate = (iso: ISODate) => new Date(`${iso}T00:00:00Z`);

export function formatDate(iso: ISODate, locale: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale, { timeZone: "UTC", ...options }).format(asDate(iso));
}

export function formatDateRange(from: ISODate, to: ISODate, locale: string): string {
  return new Intl.DateTimeFormat(locale, { timeZone: "UTC", day: "numeric", month: "short" }).formatRange(asDate(from), asDate(to));
}

/** «Тимофеев Николай Ильич» → «Тимофеев Н. И.» */
export function shortName(fullName: string): string {
  const [surname, ...rest] = fullName.split(" ");
  return [surname, ...rest.map((part) => `${part[0]}.`)].join(" ");
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));
}
