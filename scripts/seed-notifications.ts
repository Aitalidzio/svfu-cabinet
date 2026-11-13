// Demo notifications tied to seeded requests and schedule changes. All invented; Russian text
// (announcements and event messages stay in the original language — see product.md).
import type { NotificationCategory } from "@/lib/notifications";

export type SeedNotification = {
  login: string;
  category: NotificationCategory;
  title: string;
  body: string;
  href: string | null;
  at: string;
  read: boolean;
};

export const seedNotifications: SeedNotification[] = [
  // ── Sardaana (ПИ-24-1) ────────────────────────────────────────────────────
  {
    login: "s.nikolaeva",
    category: "requests",
    title: "Справка об обучении готова",
    body: "Можно забирать в деканате (КФЕН, каб. 401). С собой — студенческий билет.",
    href: "/requests/1",
    at: "2026-11-12T09:30:00+09:00",
    read: false,
  },
  {
    login: "s.nikolaeva",
    category: "schedule",
    title: "Изменение в расписании на эту неделю",
    body: "У группы ПИ-24-1 перенесена пара и заменён преподаватель. Откройте расписание, чтобы увидеть «было → стало».",
    href: "/schedule?view=week",
    at: "2026-11-10T18:05:00+09:00",
    read: false,
  },
  {
    login: "s.nikolaeva",
    category: "deanery",
    title: "Собрание старост ИМИ",
    body: "В пятницу 14 ноября в 14:00 в каб. 401 — короткое собрание старост. Передайте одногруппникам.",
    href: null,
    at: "2026-11-11T11:20:00+09:00",
    read: true,
  },
  {
    login: "s.nikolaeva",
    category: "requests",
    title: "Справка о стипендии выдана",
    body: "Документ выдан. Если нужна ещё одна копия — оформите новую заявку.",
    href: "/requests/2",
    at: "2026-10-22T13:20:00+09:00",
    read: true,
  },

  // ── Erkhan (same group) ───────────────────────────────────────────────────
  {
    login: "e.petrov",
    category: "requests",
    title: "Заявление на материальную помощь отклонено",
    body: "Нужны справка о составе семьи и о доходах. Принесите их в деканат и подайте заявление снова.",
    href: "/requests/3",
    at: "2026-11-09T12:45:00+09:00",
    read: false,
  },
  {
    login: "e.petrov",
    category: "schedule",
    title: "Изменение в расписании на эту неделю",
    body: "У группы ПИ-24-1 перенесена пара и заменён преподаватель. Откройте расписание, чтобы увидеть «было → стало».",
    href: "/schedule?view=week",
    at: "2026-11-10T18:05:00+09:00",
    read: true,
  },
  {
    login: "e.petrov",
    category: "deanery",
    title: "Собрание старост ИМИ",
    body: "В пятницу 14 ноября в 14:00 в каб. 401 — короткое собрание старост. Передайте одногруппникам.",
    href: null,
    at: "2026-11-11T11:20:00+09:00",
    read: true,
  },

  // ── Aysen (ФТИ) ───────────────────────────────────────────────────────────
  {
    login: "a.egorov",
    category: "requests",
    title: "Заявление на студенческий билет в работе",
    body: "Деканат принял заявление, бланк заказан. Когда документ будет готов, статус сменится на «Готова».",
    href: "/requests/5",
    at: "2026-11-13T09:15:00+09:00",
    read: false,
  },
  {
    login: "a.egorov",
    category: "deanery",
    title: "Напоминание о сессии ФТИ",
    body: "Расписание зачётов и экзаменов появится на стенде и в кабинете. Следите за обновлениями.",
    href: "/grades",
    at: "2026-11-08T16:40:00+09:00",
    read: false,
  },
];
