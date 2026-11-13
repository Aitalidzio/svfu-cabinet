// Demo announcements published by the ИМИ dean's office. Texts stay in Russian.

import type { AnnouncementAudience } from "@/lib/announcements";

export type SeedAnnouncement = {
  authorLogin: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  course?: number;
  groupCode?: string;
  at: string;
};

export const seedAnnouncements: SeedAnnouncement[] = [
  {
    authorLogin: "dekanat.imi",
    title: "Собрание старост ИМИ",
    body: "В пятницу 14 ноября в 14:00 в каб. 401 — короткое собрание старост. Передайте одногруппникам.",
    audience: "institute",
    at: "2026-11-11T11:20:00+09:00",
  },
  {
    authorLogin: "dekanat.imi",
    title: "Консультация перед сессией",
    body: "Для третьего курса ИМИ: консультация по курсовым — 18 ноября, 16:00, ауд. 412.",
    audience: "course",
    course: 3,
    at: "2026-11-12T10:00:00+09:00",
  },
];
