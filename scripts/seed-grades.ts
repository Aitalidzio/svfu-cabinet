// Demo grades. Every number is invented; marks follow from points via the BRS rules (src/lib/brs.ts).
// Assessments dated up to GRADED_UNTIL already have points; later ones are planned («впереди»).
import type { seedTeachers } from "./seed-data";

type ControlType = "credit" | "graded_credit" | "exam";
type PlanItem = { title: string; kind: "current" | "midterm"; max: number; due: string };

export const GRADED_UNTIL = "2026-11-12";

export const seedPlans = {
  // exam: 70 points during the term
  examFront: [
    { title: "Лабораторная работа № 1", kind: "current", max: 10, due: "2026-09-22" },
    { title: "Лабораторная работа № 2", kind: "current", max: 10, due: "2026-10-06" },
    { title: "Рубежный контроль 1", kind: "midterm", max: 15, due: "2026-10-20" },
    { title: "Лабораторная работа № 3", kind: "current", max: 10, due: "2026-11-03" },
    { title: "Лабораторная работа № 4", kind: "current", max: 10, due: "2026-11-10" },
    { title: "Рубежный контроль 2", kind: "midterm", max: 15, due: "2026-12-08" },
  ],
  examDone: [
    { title: "Лабораторная работа № 1", kind: "current", max: 10, due: "2026-09-15" },
    { title: "Лабораторная работа № 2", kind: "current", max: 10, due: "2026-09-29" },
    { title: "Рубежный контроль 1", kind: "midterm", max: 15, due: "2026-10-13" },
    { title: "Лабораторная работа № 3", kind: "current", max: 10, due: "2026-10-27" },
    { title: "Лабораторная работа № 4", kind: "current", max: 10, due: "2026-11-03" },
    { title: "Рубежный контроль 2", kind: "midterm", max: 15, due: "2026-11-11" },
  ],
  examBack: [
    { title: "Тест 1", kind: "current", max: 10, due: "2026-09-24" },
    { title: "Рубежный контроль 1", kind: "midterm", max: 20, due: "2026-10-22" },
    { title: "Домашнее задание", kind: "current", max: 10, due: "2026-11-05" },
    { title: "Рубежный контроль 2", kind: "midterm", max: 20, due: "2026-12-03" },
    { title: "Тест 2", kind: "current", max: 10, due: "2026-12-10" },
  ],
  // graded credit: 100 points
  gradedProject: [
    { title: "Проект: этап 1", kind: "current", max: 20, due: "2026-10-01" },
    { title: "Лабораторная работа № 1", kind: "current", max: 10, due: "2026-10-15" },
    { title: "Проект: этап 2", kind: "current", max: 20, due: "2026-10-29" },
    { title: "Лабораторная работа № 2", kind: "current", max: 10, due: "2026-11-12" },
    { title: "Защита проекта", kind: "midterm", max: 40, due: "2026-12-17" },
  ],
  gradedTests: [
    { title: "Контрольная работа 1", kind: "midterm", max: 20, due: "2026-10-08" },
    { title: "Индивидуальное задание 1", kind: "current", max: 10, due: "2026-10-22" },
    { title: "Контрольная работа 2", kind: "midterm", max: 20, due: "2026-11-05" },
    { title: "Индивидуальное задание 2", kind: "current", max: 10, due: "2026-11-12" },
    { title: "Итоговая контрольная", kind: "midterm", max: 40, due: "2026-12-16" },
  ],
  gradedFront: [
    { title: "Лабораторная работа № 1", kind: "current", max: 15, due: "2026-09-17" },
    { title: "Лабораторная работа № 2", kind: "current", max: 15, due: "2026-10-01" },
    { title: "Лабораторная работа № 3", kind: "current", max: 15, due: "2026-10-15" },
    { title: "Лабораторная работа № 4", kind: "current", max: 15, due: "2026-10-29" },
    { title: "Контрольная работа", kind: "midterm", max: 30, due: "2026-11-11" },
    { title: "Итоговое задание", kind: "current", max: 10, due: "2026-12-15" },
  ],
  // credit: 100 points
  credit: [
    { title: "Задания", kind: "current", max: 30, due: "2026-11-06" },
    { title: "Работа на занятиях", kind: "current", max: 30, due: "2026-11-12" },
    { title: "Итоговое занятие", kind: "midterm", max: 40, due: "2026-12-14" },
  ],
  creditPE: [
    { title: "Нормативы", kind: "current", max: 20, due: "2026-10-30" },
    { title: "Посещаемость", kind: "current", max: 40, due: "2026-11-12" },
    { title: "Зачётные нормативы", kind: "midterm", max: 40, due: "2026-12-12" },
  ],
} satisfies Record<string, PlanItem[]>;

type SeedDiscipline = {
  subject: string;
  type: ControlType;
  plan: keyof typeof seedPlans;
  teacher: (typeof seedTeachers)[number];
  sessionDate: string;
  sessionRoom: string;
};

export const seedDisciplines: Record<string, { semester: number; list: SeedDiscipline[] }> = {
  "ПИ-24-1": {
    semester: 5,
    list: [
      { subject: "Базы данных", type: "exam", plan: "examFront", teacher: "Тимофеев Николай Ильич", sessionDate: "2027-01-12", sessionRoom: "412" },
      { subject: "Операционные системы", type: "exam", plan: "examDone", teacher: "Васильев Пётр Афанасьевич", sessionDate: "2027-01-16", sessionRoom: "412" },
      { subject: "Теория вероятностей и математическая статистика", type: "exam", plan: "examBack", teacher: "Кычкина Мария Дмитриевна", sessionDate: "2027-01-21", sessionRoom: "410" },
      { subject: "Веб-программирование", type: "graded_credit", plan: "gradedProject", teacher: "Сивцева Анна Егоровна", sessionDate: "2026-12-24", sessionRoom: "305" },
      { subject: "Проектирование программного обеспечения", type: "graded_credit", plan: "gradedProject", teacher: "Охлопков Дмитрий Семёнович", sessionDate: "2026-12-26", sessionRoom: "308" },
      { subject: "Компьютерные сети", type: "credit", plan: "credit", teacher: "Васильев Пётр Афанасьевич", sessionDate: "2026-12-22", sessionRoom: "306" },
      { subject: "Иностранный язык (английский)", type: "credit", plan: "credit", teacher: "Аргунова Светлана Михайловна", sessionDate: "2026-12-21", sessionRoom: "219" },
      { subject: "Физическая культура", type: "credit", plan: "creditPE", teacher: "Пестряков Иван Иванович", sessionDate: "2026-12-19", sessionRoom: "Спортзал" },
      { subject: "История и культура Якутии", type: "credit", plan: "credit", teacher: "Слепцова Ирина Николаевна", sessionDate: "2026-12-18", sessionRoom: "121" },
    ],
  },
  "Ф-25-2": {
    semester: 3,
    list: [
      { subject: "Математический анализ", type: "exam", plan: "examBack", teacher: "Колесов Егор Петрович", sessionDate: "2027-01-13", sessionRoom: "201" },
      { subject: "Молекулярная физика", type: "exam", plan: "examFront", teacher: "Фёдорова Лена Гаврильевна", sessionDate: "2027-01-18", sessionRoom: "201" },
      { subject: "Электричество и магнетизм", type: "exam", plan: "examDone", teacher: "Попов Алексей Романович", sessionDate: "2027-01-22", sessionRoom: "201" },
      { subject: "Линейная алгебра", type: "graded_credit", plan: "gradedTests", teacher: "Гоголев Сергей Васильевич", sessionDate: "2026-12-24", sessionRoom: "203" },
      { subject: "Дифференциальные уравнения", type: "graded_credit", plan: "gradedTests", teacher: "Мордосова Ольга Ивановна", sessionDate: "2026-12-26", sessionRoom: "214" },
      { subject: "Программирование на Python", type: "graded_credit", plan: "gradedFront", teacher: "Ноговицын Артём Олегович", sessionDate: "2026-12-23", sessionRoom: "118" },
      { subject: "Общий физический практикум", type: "credit", plan: "credit", teacher: "Иванова Мария Петровна", sessionDate: "2026-12-21", sessionRoom: "Лаб. 105" },
      { subject: "Иностранный язык (английский)", type: "credit", plan: "credit", teacher: "Аргунова Светлана Михайловна", sessionDate: "2026-12-19", sessionRoom: "219" },
      { subject: "Физическая культура", type: "credit", plan: "creditPE", teacher: "Пестряков Иван Иванович", sessionDate: "2026-12-17", sessionRoom: "Спортзал" },
    ],
  },
};

/** Points earned so far this term per student and course (≤ what the graded assessments allow). */
export const seedTermPoints: Record<string, Record<string, number>> = {
  "s.nikolaeva": {
    "Базы данных": 50,
    "Операционные системы": 66,
    "Теория вероятностей и математическая статистика": 28,
    "Веб-программирование": 57,
    "Проектирование программного обеспечения": 41,
    "Компьютерные сети": 60,
    "Иностранный язык (английский)": 52,
    "Физическая культура": 58,
    "История и культура Якутии": 60,
  },
  "e.petrov": {
    "Базы данных": 36,
    "Операционные системы": 52,
    "Теория вероятностей и математическая статистика": 14,
    "Веб-программирование": 33,
    "Проектирование программного обеспечения": 49,
    "Компьютерные сети": 39,
    "Иностранный язык (английский)": 55,
    "Физическая культура": 60,
    "История и культура Якутии": 47,
  },
  "a.egorov": {
    "Математический анализ": 31,
    "Молекулярная физика": 47,
    "Электричество и магнетизм": 68,
    "Линейная алгебра": 54,
    "Дифференциальные уравнения": 38,
    "Программирование на Python": 86,
    "Общий физический практикум": 60,
    "Иностранный язык (английский)": 49,
    "Физическая культура": 60,
  },
};

type RecordRow = [semester: number, subject: string, type: ControlType, points: number];

/** Final results of past terms (out of 100). */
export const seedRecordBook: Record<string, RecordRow[]> = {
  "s.nikolaeva": [
    [1, "Математический анализ", "exam", 88],
    [1, "Алгебра и геометрия", "exam", 79],
    [1, "Основы программирования", "graded_credit", 92],
    [1, "История России", "graded_credit", 81],
    [1, "Иностранный язык (английский)", "credit", 85],
    [1, "Физическая культура", "credit", 90],
    [2, "Математический анализ", "exam", 76],
    [2, "Дискретная математика", "exam", 86],
    [2, "Объектно-ориентированное программирование", "graded_credit", 95],
    [2, "Философия", "graded_credit", 74],
    [2, "Иностранный язык (английский)", "credit", 82],
    [2, "Физическая культура", "credit", 88],
    [3, "Алгоритмы и структуры данных", "exam", 91],
    [3, "Архитектура вычислительных систем", "exam", 72],
    [3, "Теория графов", "graded_credit", 87],
    [3, "Экономика", "graded_credit", 78],
    [3, "Иностранный язык (английский)", "credit", 80],
    [3, "Физическая культура", "credit", 86],
    [4, "Численные методы", "exam", 83],
    [4, "Компьютерная графика", "exam", 90],
    [4, "Основы информационной безопасности", "graded_credit", 77],
    [4, "Безопасность жизнедеятельности", "credit", 85],
    [4, "Иностранный язык (английский)", "credit", 79],
    [4, "Физическая культура", "credit", 84],
  ],
  "e.petrov": [
    [1, "Математический анализ", "exam", 61],
    [1, "Алгебра и геометрия", "exam", 66],
    [1, "Основы программирования", "graded_credit", 70],
    [1, "История России", "graded_credit", 58],
    [1, "Иностранный язык (английский)", "credit", 72],
    [1, "Физическая культура", "credit", 80],
    [2, "Математический анализ", "exam", 56],
    [2, "Дискретная математика", "exam", 63],
    [2, "Объектно-ориентированное программирование", "graded_credit", 78],
    [2, "Философия", "graded_credit", 67],
    [2, "Иностранный язык (английский)", "credit", 65],
    [2, "Физическая культура", "credit", 75],
    [3, "Алгоритмы и структуры данных", "exam", 68],
    [3, "Архитектура вычислительных систем", "exam", 57],
    [3, "Теория графов", "graded_credit", 71],
    [3, "Экономика", "graded_credit", 60],
    [3, "Иностранный язык (английский)", "credit", 61],
    [3, "Физическая культура", "credit", 70],
    [4, "Численные методы", "exam", 55],
    [4, "Компьютерная графика", "exam", 74],
    [4, "Основы информационной безопасности", "graded_credit", 66],
    [4, "Безопасность жизнедеятельности", "credit", 70],
    [4, "Иностранный язык (английский)", "credit", 64],
    [4, "Физическая культура", "credit", 72],
  ],
  "a.egorov": [
    [1, "Математический анализ", "exam", 81],
    [1, "Аналитическая геометрия", "exam", 86],
    [1, "Механика", "exam", 90],
    [1, "Информатика", "graded_credit", 94],
    [1, "История России", "graded_credit", 76],
    [1, "Иностранный язык (английский)", "credit", 78],
    [1, "Физическая культура", "credit", 85],
    [2, "Математический анализ", "exam", 73],
    [2, "Общая химия", "graded_credit", 80],
    [2, "Философия", "graded_credit", 85],
    [2, "Компьютерное моделирование", "graded_credit", 91],
    [2, "Иностранный язык (английский)", "credit", 75],
    [2, "Физическая культура", "credit", 82],
  ],
};

/**
 * Splits a student's term points across the already graded assessments in proportion to their maximum,
 * so the breakdown always adds up exactly to the total.
 */
export function splitPoints(total: number, maxes: number[]): number[] {
  const cap = maxes.reduce((a, b) => a + b, 0);
  if (total > cap) throw new Error(`${total} points do not fit into ${cap}`);
  const parts = maxes.map((m) => Math.floor((m * total) / cap));
  let rest = total - parts.reduce((a, b) => a + b, 0);
  for (let i = 0; rest > 0; i = (i + 1) % parts.length) {
    if (parts[i] < maxes[i]) {
      parts[i]++;
      rest--;
    }
  }
  return parts;
}
