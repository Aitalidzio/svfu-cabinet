// Demo data. Every person, group and number below is invented.
// Institute names are real NEFU (СВФУ) institutes — the contest allows using the university's real structure.
// Each demo student has their own study group so any account can be checked in isolation.

export const seedInstitutes = [
  { code: "ИМИ", name: "Институт математики и информатики" },
  { code: "ФТИ", name: "Физико-технический институт" },
  { code: "ФЭИ", name: "Финансово-экономический институт" },
  { code: "ЮФ", name: "Юридический факультет" },
] as const;

export const seedGroups = [
  { code: "ПИ-24-1", institute: "ИМИ", programCode: "09.03.04", programName: "Программная инженерия", course: 3 },
  { code: "ПИ-24-2", institute: "ИМИ", programCode: "09.03.04", programName: "Программная инженерия", course: 3 },
  { code: "Ф-25-2", institute: "ФТИ", programCode: "03.03.02", programName: "Физика", course: 2 },
  { code: "Ф-24-1", institute: "ФТИ", programCode: "03.03.02", programName: "Физика", course: 3 },
  { code: "ЭК-24-1", institute: "ФЭИ", programCode: "38.03.01", programName: "Экономика", course: 3 },
  { code: "ЭК-23-1", institute: "ФЭИ", programCode: "38.03.01", programName: "Экономика", course: 4 },
  { code: "Ю-25-1", institute: "ЮФ", programCode: "40.03.01", programName: "Юриспруденция", course: 2 },
  { code: "Ю-24-1", institute: "ЮФ", programCode: "40.03.01", programName: "Юриспруденция", course: 3 },
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
    group: "ПИ-24-2",
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
    login: "m.semenova",
    role: "student",
    fullName: "Семёнова Мира Андреевна",
    institute: "ФТИ",
    group: "Ф-24-1",
    recordBookNumber: "24-ФТИ-0088",
  },
  {
    login: "a.ivanov",
    role: "student",
    fullName: "Иванов Айаал Петрович",
    institute: "ФЭИ",
    group: "ЭК-24-1",
    recordBookNumber: "24-ФЭИ-0214",
  },
  {
    login: "k.vasileva",
    role: "student",
    fullName: "Васильева Кюннэй Егоровна",
    institute: "ФЭИ",
    group: "ЭК-23-1",
    recordBookNumber: "23-ФЭИ-0091",
  },
  {
    login: "n.pavlov",
    role: "student",
    fullName: "Павлов Ньургун Сергеевич",
    institute: "ЮФ",
    group: "Ю-25-1",
    recordBookNumber: "25-ЮФ-0330",
  },
  {
    login: "t.andreyeva",
    role: "student",
    fullName: "Андреева Туяра Ильинична",
    institute: "ЮФ",
    group: "Ю-24-1",
    recordBookNumber: "24-ЮФ-0175",
  },
  {
    login: "dekanat.imi",
    role: "staff",
    fullName: "Захарова Туйаара Николаевна",
    institute: "ИМИ",
    group: null,
    recordBookNumber: null,
  },
  {
    login: "dekanat.fti",
    role: "staff",
    fullName: "Егорова Мария Семёновна",
    institute: "ФТИ",
    group: null,
    recordBookNumber: null,
  },
  {
    login: "dekanat.fei",
    role: "staff",
    fullName: "Соколова Анна Викторовна",
    institute: "ФЭИ",
    group: null,
    recordBookNumber: null,
  },
  {
    login: "dekanat.uf",
    role: "staff",
    fullName: "Николаев Пётр Иванович",
    institute: "ЮФ",
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
  "Захаров Василий Егорович",
  "Борисов Юрий Павлович",
  "Алексеева Дария Семёновна",
  "Григорьев Михаил Иванович",
  "Степанова Елена Викторовна",
  "Максимов Афанасий Петрович",
  "Романова Саргылана Егоровна",
  "Дмитриев Кирилл Олегович",
  "Филиппова Оксана Николаевна",
  "Яковлев Денис Андреевич",
  "Кузьмина Вера Ивановна",
  "Тарасов Игорь Владимирович",
  "Чернова Людмила Петровна",
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
  "ПИ-24-2": [
    { day: 1, pair: 2, subject: "Базы данных", kind: "lecture", teacher: "Тимофеев Николай Ильич", room: "КФЕН 410" },
    { day: 1, pair: 3, subject: "Базы данных", kind: "lab", teacher: "Тимофеев Николай Ильич", room: "КФЕН 306" },
    { day: 1, pair: 4, subject: "Иностранный язык (английский)", kind: "practice", teacher: "Аргунова Светлана Михайловна", room: "КФЕН 220" },
    { day: 2, pair: 1, subject: "Веб-программирование", kind: "lecture", teacher: "Сивцева Анна Егоровна", room: "КФЕН 410" },
    { day: 2, pair: 2, subject: "Веб-программирование", kind: "lab", teacher: "Сивцева Анна Егоровна", room: "КФЕН 306" },
    { day: 2, pair: 3, subject: "Теория вероятностей и математическая статистика", kind: "practice", teacher: "Кычкина Мария Дмитриевна", room: "КФЕН 318" },
    { day: 3, pair: 2, subject: "Операционные системы", kind: "lecture", teacher: "Васильев Пётр Афанасьевич", room: "КФЕН 410" },
    { day: 3, pair: 3, subject: "Теория вероятностей и математическая статистика", kind: "lecture", teacher: "Кычкина Мария Дмитриевна", room: "КФЕН 412" },
    { day: 3, pair: 4, subject: "Физическая культура", kind: "practice", teacher: "Пестряков Иван Иванович", room: "Спортзал" },
    { day: 4, pair: 1, subject: "Проектирование программного обеспечения", kind: "lecture", teacher: "Охлопков Дмитрий Семёнович", room: "КФЕН 412" },
    { day: 4, pair: 2, subject: "Проектирование программного обеспечения", kind: "practice", teacher: "Охлопков Дмитрий Семёнович", room: "КФЕН 309" },
    { day: 4, pair: 3, subject: "Операционные системы", kind: "lab", teacher: "Васильев Пётр Афанасьевич", room: "КФЕН 306", parity: "odd" },
    { day: 4, pair: 3, subject: "Компьютерные сети", kind: "lab", teacher: "Васильев Пётр Афанасьевич", room: "КФЕН 305", parity: "even" },
    { day: 5, pair: 2, subject: "Иностранный язык (английский)", kind: "practice", teacher: "Аргунова Светлана Михайловна", room: "КФЕН 220" },
    { day: 5, pair: 3, subject: "Компьютерные сети", kind: "lecture", teacher: "Васильев Пётр Афанасьевич", room: "КФЕН 410" },
    { day: 5, pair: 4, subject: "Компьютерные сети", kind: "lab", teacher: "Васильев Пётр Афанасьевич", room: "КФЕН 305" },
    { day: 6, pair: 1, subject: "История и культура Якутии", kind: "practice", teacher: "Слепцова Ирина Николаевна", room: "КФЕН 122" },
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
  "Ф-24-1": [
    { day: 1, pair: 1, subject: "Квантовая механика", kind: "lecture", teacher: "Борисов Юрий Павлович", room: "КФЕН 202" },
    { day: 1, pair: 2, subject: "Квантовая механика", kind: "practice", teacher: "Борисов Юрий Павлович", room: "КФЕН 215" },
    { day: 1, pair: 3, subject: "Статистическая физика", kind: "lecture", teacher: "Алексеева Дария Семёновна", room: "КФЕН 202" },
    { day: 2, pair: 1, subject: "Оптика", kind: "lecture", teacher: "Попов Алексей Романович", room: "КФЕН 202" },
    { day: 2, pair: 2, subject: "Оптика", kind: "lab", teacher: "Иванова Мария Петровна", room: "Лаб. 107" },
    { day: 2, pair: 3, subject: "Иностранный язык (английский)", kind: "practice", teacher: "Аргунова Светлана Михайловна", room: "КФЕН 221" },
    { day: 3, pair: 1, subject: "Методы математической физики", kind: "lecture", teacher: "Гоголев Сергей Васильевич", room: "КФЕН 204" },
    { day: 3, pair: 2, subject: "Методы математической физики", kind: "practice", teacher: "Гоголев Сергей Васильевич", room: "КФЕН 215" },
    { day: 3, pair: 3, subject: "Физическая культура", kind: "practice", teacher: "Пестряков Иван Иванович", room: "Спортзал" },
    { day: 4, pair: 2, subject: "Статистическая физика", kind: "practice", teacher: "Алексеева Дария Семёновна", room: "КФЕН 217" },
    { day: 4, pair: 3, subject: "Численные методы в физике", kind: "lab", teacher: "Ноговицын Артём Олегович", room: "КФЕН 119" },
    { day: 4, pair: 4, subject: "Оптика", kind: "practice", teacher: "Попов Алексей Романович", room: "КФЕН 217", parity: "odd" },
    { day: 4, pair: 4, subject: "Квантовая механика", kind: "lab", teacher: "Борисов Юрий Павлович", room: "Лаб. 108", parity: "even" },
    { day: 5, pair: 1, subject: "История и культура Якутии", kind: "practice", teacher: "Слепцова Ирина Николаевна", room: "КФЕН 123" },
    { day: 5, pair: 2, subject: "Численные методы в физике", kind: "lecture", teacher: "Ноговицын Артём Олегович", room: "КФЕН 204" },
    { day: 5, pair: 3, subject: "Иностранный язык (английский)", kind: "practice", teacher: "Аргунова Светлана Михайловна", room: "КФЕН 221" },
  ],
  "ЭК-24-1": [
    { day: 1, pair: 1, subject: "Микроэкономика", kind: "lecture", teacher: "Григорьев Михаил Иванович", room: "ФЭИ 301" },
    { day: 1, pair: 2, subject: "Микроэкономика", kind: "practice", teacher: "Григорьев Михаил Иванович", room: "ФЭИ 215" },
    { day: 1, pair: 3, subject: "Бухгалтерский учёт", kind: "lecture", teacher: "Степанова Елена Викторовна", room: "ФЭИ 301" },
    { day: 2, pair: 1, subject: "Макроэкономика", kind: "lecture", teacher: "Максимов Афанасий Петрович", room: "ФЭИ 302" },
    { day: 2, pair: 2, subject: "Макроэкономика", kind: "practice", teacher: "Максимов Афанасий Петрович", room: "ФЭИ 216" },
    { day: 2, pair: 3, subject: "Иностранный язык (английский)", kind: "practice", teacher: "Романова Саргылана Егоровна", room: "ФЭИ 110" },
    { day: 3, pair: 2, subject: "Статистика", kind: "lecture", teacher: "Дмитриев Кирилл Олегович", room: "ФЭИ 303" },
    { day: 3, pair: 3, subject: "Статистика", kind: "practice", teacher: "Дмитриев Кирилл Олегович", room: "ФЭИ 217" },
    { day: 3, pair: 4, subject: "Физическая культура", kind: "practice", teacher: "Пестряков Иван Иванович", room: "Спортзал" },
    { day: 4, pair: 1, subject: "Бухгалтерский учёт", kind: "practice", teacher: "Степанова Елена Викторовна", room: "ФЭИ 218" },
    { day: 4, pair: 2, subject: "Финансы организаций", kind: "lecture", teacher: "Филиппова Оксана Николаевна", room: "ФЭИ 302" },
    { day: 4, pair: 3, subject: "Финансы организаций", kind: "practice", teacher: "Филиппова Оксана Николаевна", room: "ФЭИ 219" },
    { day: 5, pair: 1, subject: "Эконометрика", kind: "lecture", teacher: "Дмитриев Кирилл Олегович", room: "ФЭИ 304" },
    { day: 5, pair: 2, subject: "Эконометрика", kind: "lab", teacher: "Дмитриев Кирилл Олегович", room: "ФЭИ 120" },
    { day: 5, pair: 3, subject: "Иностранный язык (английский)", kind: "practice", teacher: "Романова Саргылана Егоровна", room: "ФЭИ 110" },
    { day: 6, pair: 2, subject: "История и культура Якутии", kind: "practice", teacher: "Слепцова Ирина Николаевна", room: "ФЭИ 101" },
  ],
  "ЭК-23-1": [
    { day: 1, pair: 1, subject: "Корпоративные финансы", kind: "lecture", teacher: "Филиппова Оксана Николаевна", room: "ФЭИ 401" },
    { day: 1, pair: 2, subject: "Корпоративные финансы", kind: "practice", teacher: "Филиппова Оксана Николаевна", room: "ФЭИ 312" },
    { day: 1, pair: 3, subject: "Налоги и налогообложение", kind: "lecture", teacher: "Степанова Елена Викторовна", room: "ФЭИ 401" },
    { day: 2, pair: 2, subject: "Инвестиционный анализ", kind: "lecture", teacher: "Максимов Афанасий Петрович", room: "ФЭИ 402" },
    { day: 2, pair: 3, subject: "Инвестиционный анализ", kind: "practice", teacher: "Максимов Афанасий Петрович", room: "ФЭИ 313" },
    { day: 2, pair: 4, subject: "Иностранный язык (английский)", kind: "practice", teacher: "Романова Саргылана Егоровна", room: "ФЭИ 111" },
    { day: 3, pair: 1, subject: "Банковское дело", kind: "lecture", teacher: "Григорьев Михаил Иванович", room: "ФЭИ 403" },
    { day: 3, pair: 2, subject: "Банковское дело", kind: "practice", teacher: "Григорьев Михаил Иванович", room: "ФЭИ 314" },
    { day: 3, pair: 3, subject: "Физическая культура", kind: "practice", teacher: "Пестряков Иван Иванович", room: "Спортзал" },
    { day: 4, pair: 1, subject: "Налоги и налогообложение", kind: "practice", teacher: "Степанова Елена Викторовна", room: "ФЭИ 315" },
    { day: 4, pair: 2, subject: "Международная экономика", kind: "lecture", teacher: "Дмитриев Кирилл Олегович", room: "ФЭИ 402" },
    { day: 4, pair: 3, subject: "Международная экономика", kind: "practice", teacher: "Дмитриев Кирилл Олегович", room: "ФЭИ 316" },
    { day: 5, pair: 2, subject: "Аудит", kind: "lecture", teacher: "Степанова Елена Викторовна", room: "ФЭИ 404" },
    { day: 5, pair: 3, subject: "Аудит", kind: "practice", teacher: "Степанова Елена Викторовна", room: "ФЭИ 317" },
    { day: 5, pair: 4, subject: "Иностранный язык (английский)", kind: "practice", teacher: "Романова Саргылана Егоровна", room: "ФЭИ 111" },
    { day: 6, pair: 1, subject: "История и культура Якутии", kind: "practice", teacher: "Слепцова Ирина Николаевна", room: "ФЭИ 102" },
  ],
  "Ю-25-1": [
    { day: 1, pair: 1, subject: "Теория государства и права", kind: "lecture", teacher: "Яковлев Денис Андреевич", room: "ЮФ 201" },
    { day: 1, pair: 2, subject: "Теория государства и права", kind: "practice", teacher: "Яковлев Денис Андреевич", room: "ЮФ 115" },
    { day: 1, pair: 3, subject: "Конституционное право", kind: "lecture", teacher: "Кузьмина Вера Ивановна", room: "ЮФ 201" },
    { day: 2, pair: 1, subject: "Гражданское право", kind: "lecture", teacher: "Тарасов Игорь Владимирович", room: "ЮФ 202" },
    { day: 2, pair: 2, subject: "Гражданское право", kind: "practice", teacher: "Тарасов Игорь Владимирович", room: "ЮФ 116" },
    { day: 2, pair: 3, subject: "Иностранный язык (английский)", kind: "practice", teacher: "Чернова Людмила Петровна", room: "ЮФ 108" },
    { day: 3, pair: 2, subject: "Уголовное право", kind: "lecture", teacher: "Яковлев Денис Андреевич", room: "ЮФ 203" },
    { day: 3, pair: 3, subject: "Уголовное право", kind: "practice", teacher: "Яковлев Денис Андреевич", room: "ЮФ 117" },
    { day: 3, pair: 4, subject: "Физическая культура", kind: "practice", teacher: "Пестряков Иван Иванович", room: "Спортзал" },
    { day: 4, pair: 1, subject: "Конституционное право", kind: "practice", teacher: "Кузьмина Вера Ивановна", room: "ЮФ 118" },
    { day: 4, pair: 2, subject: "История государства и права", kind: "lecture", teacher: "Кузьмина Вера Ивановна", room: "ЮФ 202" },
    { day: 4, pair: 3, subject: "История государства и права", kind: "practice", teacher: "Кузьмина Вера Ивановна", room: "ЮФ 119" },
    { day: 5, pair: 1, subject: "Римское право", kind: "lecture", teacher: "Тарасов Игорь Владимирович", room: "ЮФ 204" },
    { day: 5, pair: 2, subject: "Римское право", kind: "practice", teacher: "Тарасов Игорь Владимирович", room: "ЮФ 120" },
    { day: 5, pair: 3, subject: "Иностранный язык (английский)", kind: "practice", teacher: "Чернова Людмила Петровна", room: "ЮФ 108" },
    { day: 6, pair: 2, subject: "История и культура Якутии", kind: "practice", teacher: "Слепцова Ирина Николаевна", room: "ЮФ 101" },
  ],
  "Ю-24-1": [
    { day: 1, pair: 1, subject: "Гражданский процесс", kind: "lecture", teacher: "Тарасов Игорь Владимирович", room: "ЮФ 301" },
    { day: 1, pair: 2, subject: "Гражданский процесс", kind: "practice", teacher: "Тарасов Игорь Владимирович", room: "ЮФ 215" },
    { day: 1, pair: 3, subject: "Уголовный процесс", kind: "lecture", teacher: "Яковлев Денис Андреевич", room: "ЮФ 301" },
    { day: 2, pair: 1, subject: "Трудовое право", kind: "lecture", teacher: "Кузьмина Вера Ивановна", room: "ЮФ 302" },
    { day: 2, pair: 2, subject: "Трудовое право", kind: "practice", teacher: "Кузьмина Вера Ивановна", room: "ЮФ 216" },
    { day: 2, pair: 3, subject: "Иностранный язык (английский)", kind: "practice", teacher: "Чернова Людмила Петровна", room: "ЮФ 109" },
    { day: 3, pair: 1, subject: "Административное право", kind: "lecture", teacher: "Яковлев Денис Андреевич", room: "ЮФ 303" },
    { day: 3, pair: 2, subject: "Административное право", kind: "practice", teacher: "Яковлев Денис Андреевич", room: "ЮФ 217" },
    { day: 3, pair: 3, subject: "Физическая культура", kind: "practice", teacher: "Пестряков Иван Иванович", room: "Спортзал" },
    { day: 4, pair: 2, subject: "Уголовный процесс", kind: "practice", teacher: "Яковлев Денис Андреевич", room: "ЮФ 218" },
    { day: 4, pair: 3, subject: "Финансовое право", kind: "lecture", teacher: "Кузьмина Вера Ивановна", room: "ЮФ 302" },
    { day: 4, pair: 4, subject: "Финансовое право", kind: "practice", teacher: "Кузьмина Вера Ивановна", room: "ЮФ 219" },
    { day: 5, pair: 1, subject: "Международное право", kind: "lecture", teacher: "Тарасов Игорь Владимирович", room: "ЮФ 304" },
    { day: 5, pair: 2, subject: "Международное право", kind: "practice", teacher: "Тарасов Игорь Владимирович", room: "ЮФ 220" },
    { day: 5, pair: 3, subject: "Иностранный язык (английский)", kind: "practice", teacher: "Чернова Людмила Петровна", room: "ЮФ 109" },
    { day: 6, pair: 1, subject: "История и культура Якутии", kind: "practice", teacher: "Слепцова Ирина Николаевна", room: "ЮФ 102" },
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
    { group: "ПИ-24-2", day: 3, pair: 2, kind: "moved", toDay: 5, toPair: 1, reason: "Перенос по просьбе кафедры" },
    { group: "Ф-25-2", day: 1, pair: 3, kind: "moved", toDay: 5, toPair: 4, reason: "Перенос по просьбе преподавателя" },
    { group: "ЭК-24-1", day: 2, pair: 1, kind: "cancelled", reason: "День открытых дверей ФЭИ" },
    { group: "Ю-25-1", day: 1, pair: 1, kind: "modified", toRoom: "ЮФ 101", reason: "Лекция в актовом зале для потока" },
  ],
  [
    { group: "ПИ-24-1", day: 4, pair: 2, kind: "moved", toDay: 6, toPair: 3, toRoom: "КФЕН 410", reason: "Преподаватель в командировке" },
    { group: "ПИ-24-1", day: 1, pair: 1, kind: "modified", toTeacher: "Захаров Василий Егорович", reason: "Замена преподавателя" },
    { group: "ПИ-24-2", day: 1, pair: 2, kind: "cancelled", reason: "Больничный преподавателя" },
    { group: "Ф-25-2", day: 2, pair: 1, kind: "cancelled", reason: "Учёный совет института" },
    { group: "Ф-24-1", day: 4, pair: 3, kind: "modified", toRoom: "КФЕН 120", reason: "Компьютерный класс занят под экзамен" },
    { group: "ЭК-23-1", day: 3, pair: 1, kind: "moved", toDay: 3, toPair: 5, reason: "Перенос на вечер того же дня" },
    { group: "Ю-24-1", day: 2, pair: 1, kind: "modified", toTeacher: "Кузьмина Вера Ивановна", reason: "Замена преподавателя" },
  ],
  [
    { group: "ПИ-24-1", day: 5, pair: 2, kind: "modified", toRoom: "Актовый зал", reason: "Совмещённая лекция для всего потока" },
    { group: "ПИ-24-1", day: 3, pair: 2, kind: "moved", toDay: 3, toPair: 5, reason: "Перенос на вечер того же дня" },
    { group: "ПИ-24-2", day: 5, pair: 3, kind: "modified", toRoom: "КФЕН 412", reason: "Объединённая лекция двух групп" },
    { group: "Ф-25-2", day: 4, pair: 3, kind: "modified", toRoom: "КФЕН 120", reason: "Компьютерный класс 118 занят под экзамен" },
    { group: "Ф-24-1", day: 1, pair: 1, kind: "cancelled", reason: "Конференция по квантовой физике" },
    { group: "ЭК-24-1", day: 4, pair: 2, kind: "moved", toDay: 6, toPair: 3, reason: "Преподаватель в командировке" },
    { group: "Ю-25-1", day: 3, pair: 2, kind: "cancelled", reason: "Судебное заседание с участием преподавателя" },
    { group: "Ю-24-1", day: 5, pair: 1, kind: "moved", toDay: 5, toPair: 4, reason: "Перенос внутри дня" },
  ],
];
