// Demo requests in different statuses, with the full history of each one. All invented.
import type { RequestStatus, RequestType } from "@/lib/requests";

type SeedEvent = { status: RequestStatus; at: string; by: "student" | "staff"; note?: string };

export type SeedRequest = {
  login: string;
  type: RequestType;
  details: Record<string, string>;
  comment: string | null;
  dueDate: string;
  rejectionReason?: string;
  events: SeedEvent[]; // the last event is the current status
};

export const seedRequests: SeedRequest[] = [
  {
    login: "s.nikolaeva",
    type: "study_certificate",
    details: { purpose: "social", copies: "1" },
    comment: null,
    dueDate: "2026-11-12",
    events: [
      { status: "submitted", at: "2026-11-11T10:15:00+09:00", by: "student" },
      { status: "in_progress", at: "2026-11-11T14:02:00+09:00", by: "staff" },
      { status: "ready", at: "2026-11-12T09:30:00+09:00", by: "staff", note: "Справка подписана, можно забирать." },
    ],
  },
  {
    login: "s.nikolaeva",
    type: "scholarship_certificate",
    details: { period: "6", copies: "2" },
    comment: "Для оформления субсидии на общежитие.",
    dueDate: "2026-10-21",
    events: [
      { status: "submitted", at: "2026-10-20T11:40:00+09:00", by: "student" },
      { status: "in_progress", at: "2026-10-20T15:10:00+09:00", by: "staff" },
      { status: "ready", at: "2026-10-21T10:05:00+09:00", by: "staff" },
      { status: "issued", at: "2026-10-22T13:20:00+09:00", by: "staff" },
    ],
  },
  {
    login: "e.petrov",
    type: "financial_aid",
    details: { reason: "hardship" },
    comment: "Прошу оказать материальную помощь в связи с трудным материальным положением семьи.",
    dueDate: "2026-11-19",
    rejectionReason:
      "К заявлению нужны подтверждающие документы: справка о составе семьи и о доходах. Принесите их в деканат и подайте заявление снова.",
    events: [
      { status: "submitted", at: "2026-11-05T16:20:00+09:00", by: "student" },
      { status: "in_progress", at: "2026-11-06T10:00:00+09:00", by: "staff" },
      { status: "rejected", at: "2026-11-09T12:45:00+09:00", by: "staff" },
    ],
  },
  {
    login: "e.petrov",
    type: "study_certificate",
    details: { purpose: "employer", copies: "1" },
    comment: null,
    dueDate: "2026-11-16",
    events: [{ status: "submitted", at: "2026-11-13T09:40:00+09:00", by: "student" }],
  },
  {
    login: "a.egorov",
    type: "student_card",
    details: { cardReason: "lost" },
    comment: "Потерял студенческий билет в автобусе.",
    dueDate: "2026-11-17",
    events: [
      { status: "submitted", at: "2026-11-12T13:05:00+09:00", by: "student" },
      { status: "in_progress", at: "2026-11-13T09:15:00+09:00", by: "staff", note: "Заявление принято, бланк заказан." },
    ],
  },
];
