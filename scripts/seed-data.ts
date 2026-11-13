// Demo data. Every person, group and number below is invented.
// Institute names are real NEFU (СВФУ) institutes — the contest allows using the university's real structure.

export const seedInstitutes = [
  { code: "ИМИ", name: "Институт математики и информатики" },
  { code: "ФТИ", name: "Физико-технический институт" },
] as const;

export const seedGroups = [
  { code: "ПИ-24-1", institute: "ИМИ", programCode: "09.03.04", programName: "Программная инженерия", course: 3 },
  { code: "Ф-25-2", institute: "ФТИ", programCode: "03.03.02", programName: "Физика", course: 2 },
] as const;

export const seedUsers = [
  {
    login: "s.nikolaeva",
    role: "student",
    fullName: "Николаева Сардаана Петровна",
    institute: "ИМИ",
    group: "ПИ-24-1",
    recordBookNumber: "24-ИМИ-0137",
  },
  {
    login: "e.petrov",
    role: "student",
    fullName: "Петров Эрхан Семёнович",
    institute: "ИМИ",
    group: "ПИ-24-1",
    recordBookNumber: "24-ИМИ-0152",
  },
  {
    login: "a.egorov",
    role: "student",
    fullName: "Егоров Айсен Иванович",
    institute: "ФТИ",
    group: "Ф-25-2",
    recordBookNumber: "25-ФТИ-0412",
  },
  {
    login: "dekanat.imi",
    role: "staff",
    fullName: "Захарова Туйаара Николаевна",
    institute: "ИМИ",
    group: null,
    recordBookNumber: null,
  },
] as const;

// ─── Schedule ───────────────────────────────────────────────────────────────
// Teachers are invented people. Days: 1 = Monday … 6 = Saturday.

export const seedTeachers = [
  "Тимофеев Николай Ильич",
  "Сивцева Анна Егоровна",
  "Васильев Пётр Афанасьевич",
  "Кычкина Мария Дмитриевна",
  "Охлопков Дмитрий Семёнович",
  "Аргунова Светлана Михайловна",
  "Пестряков Иван Иванович",
  "Слепцова Ирина Николаевна",
  "Колесов Егор Петрович",
  "Фёдорова Лена Гаврильевна",
  "Попов Алексей Романович",
  "Иванова Мария Петровна",
  "Гоголев Сергей Васильевич",
  "Мордосова Ольга Ивановна",
  "Ноговицын Артём Олегович",
  "Захаров Василий Егорович", // substitute teacher in the demo changes
] as const;

type SeedLesson = {
  day: number;
  pair: number;
  subject: string;
  kind: "lecture" | "practice" | "lab";
  teacher: (typeof seedTeachers)[number];
  room: string;
  parity?: "every" | "odd" | "even";
};

export const seedTimetable: Record<string, SeedLesson[]> = {
  "ПИ-24-1": [
    { day: 1, pair: 1, subject: "Базы данных", kind: "lecture", teacher: "Тимофеев Николай Ильич", room: "КФЕН 412" },
    { day: 1, pair: 2, subject: "Базы данных", kind: "lab", teacher: "Тимофеев Николай Ильич", room: "КФЕН 305" },
    { day: 1, pair: 3, subject: "Иностранный язык (английский)", kind: "practice", teacher: "Аргунова Светлана Михайловна", room: "КФЕН 219" },
    { day: 2, pair: 2, subject: "Веб-программирование", kind: "lecture", teacher: "Сивцева Анна Егоровна", room: "КФЕН 412" },
    { day: 2, pair: 3, subject: "Веб-программирование", kind: "lab", teacher: "Сивцева Анна Егоровна", room: "КФЕН 305" },
    { day: 2, pair: 4, subject: "Теория вероятностей и математическая статистика", kind: "practice", teacher: "Кычкина Мария Дмитриевна", room: "КФЕН 317" },
    { day: 3, pair: 1, subject: "Операционные системы", kind: "lecture", teacher: "Васильев Пётр Афанасьевич", room: "КФЕН 412" },
    { day: 3, pair: 2, subject: "Теория вероятностей и математическая статистика", kind: "lecture", teacher: "Кычкина Мария Дмитриевна", room: "КФЕН 410" },
    { day: 3, pair: 3, subject: "Физическая культура", kind: "practice", teacher: "Пестряков Иван Иванович", room: "Спортзал" },
    { day: 4, pair: 2, subject: "Проектирование программного обеспечения", kind: "lecture", teacher: "Охлопков Дмитрий Семёнович", room: "КФЕН 410" },
    { day: 4, pair: 3, subject: "Проектирование программного обеспечения", kind: "practice", teacher: "Охлопков Дмитрий Семёнович", room: "КФЕН 308" },
    { day: 4, pair: 4, subject: "Операционные системы", kind: "lab", teacher: "Васильев Пётр Афанасьевич", room: "КФЕН 305", parity: "odd" },
    { day: 4, pair: 4, subject: "Компьютерные сети", kind: "lab", teacher: "Васильев Пётр Афанасьевич", room: "КФЕН 306", parity: "even" },
    { day: 5, pair: 1, subject: "Иностранный язык (английский)", kind: "practice", teacher: "Аргунова Светлана Михайловна", room: "КФЕН 219" },
    { day: 5, pair: 2, subject: "Компьютерные сети", kind: "lecture", teacher: "Васильев Пётр Афанасьевич", room: "КФЕН 412" },
    { day: 5, pair: 3, subject: "Компьютерные сети", kind: "lab", teacher: "Васильев Пётр Афанасьевич", room: "КФЕН 306" },
    { day: 6, pair: 2, subject: "История и культура Якутии", kind: "practice", teacher: "Слепцова Ирина Николаевна", room: "КФЕН 121" },
  ],
  "Ф-25-2": [
    { day: 1, pair: 1, subject: "Математический анализ", kind: "lecture", teacher: "Колесов Егор Петрович", room: "КФЕН 201" },
    { day: 1, pair: 2, subject: "Математический анализ", kind: "practice", teacher: "Колесов Егор Петрович", room: "КФЕН 214" },
    { day: 1, pair: 3, subject: "Молекулярная физика", kind: "lecture", teacher: "Фёдорова Лена Гаврильевна", room: "КФЕН 201" },
    { day: 2, pair: 1, subject: "Электричество и магнетизм", kind: "lecture", teacher: "Попов Алексей Романович", room: "КФЕН 201" },
    { day: 2, pair: 2, subject: "Общий физический практикум", kind: "lab", teacher: "Иванова Мария Петровна", room: "Лаб. 105" },
    { day: 2, pair: 3, subject: "Иностранный язык (английский)", kind: "practice", teacher: "Аргунова Светлана Михайловна", room: "КФЕН 219" },
    { day: 3, pair: 2, subject: "Линейная алгебра", kind: "lecture", teacher: "Гоголев Сергей Васильевич", room: "КФЕН 203" },
    { day: 3, pair: 3, subject: "Линейная алгебра", kind: "practice", teacher: "Гоголев Сергей Васильевич", room: "КФЕН 214" },
    { day: 3, pair: 4, subject: "Физическая культура", kind: "practice", teacher: "Пестряков Иван Иванович", room: "Спортзал" },
    { day: 4, pair: 1, subject: "Дифференциальные уравнения", kind: "lecture", teacher: "Мордосова Ольга Ивановна", room: "КФЕН 203" },
    { day: 4, pair: 2, subject: "Молекулярная физика", kind: "practice", teacher: "Фёдорова Лена Гаврильевна", room: "КФЕН 216" },
    { day: 4, pair: 3, subject: "Программирование на Python", kind: "lab", teacher: "Ноговицын Артём Олегович", room: "КФЕН 118" },
    { day: 5, pair: 2, subject: "Электричество и магнетизм", kind: "practice", teacher: "Попов Алексей Романович", room: "КФЕН 216" },
    { day: 5, pair: 3, subject: "Дифференциальные уравнения", kind: "practice", teacher: "Мордосова Ольга Ивановна", room: "КФЕН 214" },
  ],
};

/**
 * Demo changes repeat in a 3-week cycle, from the week of 2 Nov to mid-December,
 * so whenever the site is opened the current week has a few realistic changes.
 * `day`/`pair` point at a regular class; moves go to `toDay`/`toPair` of the same week.
 */
type SeedChange = {
  group: string;
  day: number;
  pair: number;
  kind: "cancelled" | "moved" | "modified";
  toDay?: number;
  toPair?: number;
  toRoom?: string;
  toTeacher?: (typeof seedTeachers)[number];
  reason: string;
};

export const seedChangeWeeks = { firstMonday: "2026-11-02", count: 7 } as const;

export const seedChangeCycle: SeedChange[][] = [
  [
    { group: "ПИ-24-1", day: 3, pair: 1, kind: "cancelled", reason: "Преподаватель на конференции" },
    { group: "ПИ-24-1", day: 2, pair: 3, kind: "modified", toRoom: "КФЕН 214", reason: "В аудитории 305 ремонтируют проектор" },
    { group: "Ф-25-2", day: 1, pair: 3, kind: "moved", toDay: 5, toPair: 4, reason: "Перенос по просьбе преподавателя" },
  ],
  [
    { group: "ПИ-24-1", day: 4, pair: 2, kind: "moved", toDay: 6, toPair: 3, toRoom: "КФЕН 410", reason: "Преподаватель в командировке" },
    { group: "ПИ-24-1", day: 1, pair: 1, kind: "modified", toTeacher: "Захаров Василий Егорович", reason: "Замена преподавателя" },
    { group: "Ф-25-2", day: 2, pair: 1, kind: "cancelled", reason: "Учёный совет института" },
  ],
  [
    { group: "ПИ-24-1", day: 5, pair: 2, kind: "modified", toRoom: "Актовый зал", reason: "Совмещённая лекция для всего потока" },
    { group: "ПИ-24-1", day: 3, pair: 2, kind: "moved", toDay: 3, toPair: 5, reason: "Перенос на вечер того же дня" },
    { group: "Ф-25-2", day: 4, pair: 3, kind: "modified", toRoom: "КФЕН 120", reason: "Компьютерный класс 118 занят под экзамен" },
  ],
];
