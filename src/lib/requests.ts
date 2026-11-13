// Catalog of certificates and applications, form validation and due dates.
// Pure and shared: the server action validates with it, the form renders from it, tests cover it.
import { addDays, dayOfWeek, type ISODate } from "./calendar";

export const REQUEST_TYPES = ["study_certificate", "scholarship_certificate", "financial_aid", "student_card"] as const;
export type RequestType = (typeof REQUEST_TYPES)[number];

export const REQUEST_STATUSES = ["submitted", "in_progress", "ready", "issued", "rejected", "cancelled"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];
export const ACTIVE_STATUSES: readonly RequestStatus[] = ["submitted", "in_progress", "ready"];

export function isRequestType(value: string): value is RequestType {
  return (REQUEST_TYPES as readonly string[]).includes(value);
}

type ChoiceField = { name: string; type: "choice"; options: readonly string[]; default?: string };
type TextField = { name: "comment"; type: "text"; required: boolean; min?: number; max: number };
export type FieldSpec = ChoiceField | TextField;

export type RequestSpec = {
  kind: "certificate" | "application";
  /** Working days until it is ready. ⚠️ Applications: typical values, to be confirmed with the dean's office. */
  workingDays: number;
  fields: readonly FieldSpec[];
};

const copies: ChoiceField = { name: "copies", type: "choice", options: ["1", "2", "3"], default: "1" };

export const REQUEST_CATALOG: Record<RequestType, RequestSpec> = {
  // «Справку делаем на следующий день» — confirmed by the team.
  study_certificate: {
    kind: "certificate",
    workingDays: 1,
    fields: [
      { name: "purpose", type: "choice", options: ["general", "social", "pension", "employer"] },
      copies,
      { name: "comment", type: "text", required: false, max: 500 },
    ],
  },
  scholarship_certificate: {
    kind: "certificate",
    workingDays: 1,
    fields: [
      { name: "period", type: "choice", options: ["3", "6", "12"] },
      copies,
      { name: "comment", type: "text", required: false, max: 500 },
    ],
  },
  financial_aid: {
    kind: "application",
    workingDays: 10,
    fields: [
      { name: "reason", type: "choice", options: ["hardship", "medical", "family", "other"] },
      { name: "comment", type: "text", required: true, min: 10, max: 1000 },
    ],
  },
  student_card: {
    kind: "application",
    workingDays: 3,
    fields: [
      { name: "cardReason", type: "choice", options: ["lost", "damaged", "nameChange"] },
      { name: "comment", type: "text", required: false, max: 500 },
    ],
  },
};

export type FieldError = "required" | "invalid" | "tooShort" | "tooLong";

export type Validation =
  | { ok: true; details: Record<string, string>; comment: string | null }
  | { ok: false; errors: Record<string, FieldError> };

/**
 * Checks submitted values against the catalog. Only known fields are kept, choices must be one of the
 * listed options, text is trimmed and length-checked. Anything else in the form is ignored.
 */
export function validateRequest(type: RequestType, input: Record<string, string | undefined>): Validation {
  const details: Record<string, string> = {};
  const errors: Record<string, FieldError> = {};
  let comment: string | null = null;

  for (const field of REQUEST_CATALOG[type].fields) {
    const raw = (input[field.name] ?? "").trim();

    if (field.type === "choice") {
      const value = raw || field.default || "";
      if (!value) errors[field.name] = "required";
      else if (!field.options.includes(value)) errors[field.name] = "invalid";
      else details[field.name] = value;
      continue;
    }

    if (!raw) {
      if (field.required) errors.comment = "required";
      continue;
    }
    if (field.min && raw.length < field.min) errors.comment = "tooShort";
    else if (raw.length > field.max) errors.comment = "tooLong";
    else comment = raw;
  }

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, details, comment };
}

/** Adds working days, skipping Saturdays and Sundays (the dean's office works Monday to Friday). */
export function addWorkingDays(from: ISODate, days: number): ISODate {
  let date = from;
  let left = days;
  while (left > 0) {
    date = addDays(date, 1);
    if (dayOfWeek(date) <= 5) left--;
  }
  return date;
}

/** Where to pick up documents. Locations are invented for the demo. */
export const DEANERY: Record<string, { place: string; hours: { from: string; to: string } }> = {
  ИМИ: { place: "КФЕН, каб. 401", hours: { from: "9:00", to: "17:00" } },
  ФТИ: { place: "КФЕН, каб. 512", hours: { from: "9:00", to: "17:00" } },
};

/** Daily limit per student: protects the dean's office from accidental or malicious floods of requests. */
export const MAX_REQUESTS_PER_DAY = 10;
