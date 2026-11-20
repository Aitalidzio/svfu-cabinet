// Demo announcements by each institute's dean's office. Texts stay in Russian.

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
  {
    authorLogin: "dekanat.fti",
    title: "Напоминание о сессии ФТИ",
    body: "Расписание зачётов и экзаменов появится на стенде и в кабинете. Следите за обновлениями.",
    audience: "institute",
    at: "2026-11-08T16:40:00+09:00",
  },
  {
    authorLogin: "dekanat.fti",
    title: "Лабораторный практикум",
    body: "Группа Ф-24-1: сдача лабораторных по оптике перенесена на 20 ноября, лаб. 107.",
    audience: "group",
    groupCode: "Ф-24-1",
    at: "2026-11-13T09:00:00+09:00",
  },
  {
    authorLogin: "dekanat.fei",
    title: "День открытых дверей ФЭИ",
    body: "15 ноября с 10:00 до 16:00 — день открытых дверей. Студентов-волонтёров ждут в деканате.",
    audience: "institute",
    at: "2026-11-10T12:00:00+09:00",
  },
  {
    authorLogin: "dekanat.uf",
    title: "Юридическая клиника",
    body: "Набор волонтёров в юридическую клинику — заявления до 25 ноября в каб. 205 ЮФ.",
    audience: "institute",
    at: "2026-11-12T14:30:00+09:00",
  },
];
