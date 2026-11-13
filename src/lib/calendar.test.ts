import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addDays, dayOfWeek, isISODate, mondayOf, semesterWeek, weekParity, yakutskNow } from "./calendar";

describe("календарь", () => {
  it("день недели: понедельник = 1, воскресенье = 7", () => {
    assert.equal(dayOfWeek("2026-11-16"), 1);
    assert.equal(dayOfWeek("2026-11-22"), 7);
  });
  it("понедельник недели и переход через месяц", () => {
    assert.equal(mondayOf("2026-11-22"), "2026-11-16");
    assert.equal(addDays("2026-11-30", 1), "2026-12-01");
  });
  it("номер и чётность недели считаются от 1 сентября", () => {
    assert.equal(semesterWeek("2026-09-01"), 1);
    assert.equal(semesterWeek("2026-09-07"), 2);
    assert.equal(weekParity("2026-11-13"), "odd");
  });
  it("проверка формата даты", () => {
    assert.equal(isISODate("2026-11-13"), true);
    assert.equal(isISODate("2026-02-30"), false);
    assert.equal(isISODate("not-a-date"), false);
  });
});

describe("время по Якутску (UTC+9)", () => {
  it("в 20:00 по UTC в Якутске уже следующий день", () => {
    assert.equal(yakutskNow(new Date("2026-11-13T20:00:00Z")).date, "2026-11-14");
  });
  it("00:30 по UTC — это 09:30 в Якутске", () => {
    assert.equal(yakutskNow(new Date("2026-11-13T00:30:00Z")).minutes, 9 * 60 + 30);
  });
});

describe("семестры", () => {
  it("3 курс сейчас: 5-й семестр — осень 2026/27, 4-й — весна 2025/26, 1-й — осень 2024/25", async () => {
    const { termOf } = await import("./calendar");
    assert.deepEqual(termOf(5, 3), { season: "autumn", years: "2026/27" });
    assert.deepEqual(termOf(4, 3), { season: "spring", years: "2025/26" });
    assert.deepEqual(termOf(1, 3), { season: "autumn", years: "2024/25" });
  });
});
