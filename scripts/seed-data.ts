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
