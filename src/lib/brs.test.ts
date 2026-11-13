import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assess, effort, markFor } from "./brs";

describe("markFor — пороги 55 / 65 / 85", () => {
  it("границы оценок", () => {
    assert.equal(markFor(54), 2);
    assert.equal(markFor(55), 3);
    assert.equal(markFor(64), 3);
    assert.equal(markFor(65), 4);
    assert.equal(markFor(84), 4);
    assert.equal(markFor(85), 5);
    assert.equal(markFor(100), 5);
  });
});

describe("effort — насколько тревожно, с учётом оставшихся баллов", () => {
  it("цель достигнута", () => assert.equal(effort(0, 40), "success"));
  it("нужно не больше половины оставшегося — спокойно", () => assert.equal(effort(20, 40), "info"));
  it("нужно больше половины — внимание", () => assert.equal(effort(21, 40), "warning"));
  it("нужно больше, чем осталось, — опасно", () => assert.equal(effort(41, 40), "danger"));
  it("в конце семестра любая нехватка опасна", () => assert.equal(effort(1, 0), "danger"));
});

describe("зачёт — от 60 баллов", () => {
  it("60 — зачтено", () => {
    assert.deepEqual(assess("credit", 60, 0), { type: "credit", passed: true, need: 0, level: "success" });
  });
  it("52 при 40 впереди — не хватает 8, это нормально для середины семестра", () => {
    assert.deepEqual(assess("credit", 52, 40), { type: "credit", passed: false, need: 8, level: "info" });
  });
  it("39 при 40 впереди — нужно 21 из 40, нужно внимание", () => {
    assert.equal(assess("credit", 39, 40).level, "warning");
  });
  it("52 при 5 впереди — плановых баллов не хватит", () => {
    assert.equal(assess("credit", 52, 5).level, "danger");
  });
});

describe("зачёт с оценкой — уровень считается до «4» (нужна для стипендии)", () => {
  it("72 — «4», до «5» не хватает 13", () => {
    assert.deepEqual(assess("graded_credit", 72, 28), {
      type: "graded_credit",
      mark: 4,
      next: { mark: 5, need: 13 },
      level: "success",
    });
  });
  it("середина семестра: 57 из 60 возможных, впереди 40 — на «4» нужно 8, спокойно", () => {
    const a = assess("graded_credit", 57, 40);
    assert.equal(a.type === "graded_credit" && a.mark, 3);
    assert.equal(a.level, "info");
  });
  it("41 при 40 впереди — на «4» нужно 24 из 40, внимание", () => {
    assert.equal(assess("graded_credit", 41, 40).level, "warning");
  });
  it("«4» уже не набрать, но «3» можно — внимание, а не долг", () => {
    assert.equal(assess("graded_credit", 50, 10).level, "warning");
  });
  it("даже «3» не набрать — опасно", () => {
    assert.equal(assess("graded_credit", 30, 10).level, "danger");
  });
  it("90 — «5», дальше расти некуда", () => {
    const a = assess("graded_credit", 90, 0);
    assert.equal(a.type === "graded_credit" && a.next, null);
  });
});

describe("экзамен: семестр до 70, экзамен до 30", () => {
  it("34 при 30 впереди — до допуска 11, спокойно", () => {
    assert.deepEqual(assess("exam", 34, 30), { type: "exam", stage: "noAdmission", need: 11, level: "info" });
  });
  it("28 при 30 впереди — до допуска 17, внимание", () => {
    assert.equal(assess("exam", 28, 30).level, "warning");
  });
  it("14 при 30 впереди — до допуска 31, опасно", () => {
    assert.equal(assess("exam", 14, 30).level, "danger");
  });
  it("45 — допуск есть", () => {
    const a = assess("exam", 45, 0);
    assert.equal(a.type === "exam" && a.stage, "admitted");
  });
  it("66 — автомат «4», а для «5» на экзамене нужно 19 из 30 (пример из product.md)", () => {
    assert.deepEqual(assess("exam", 66, 0), {
      type: "exam",
      stage: "admitted",
      automat: true,
      target: { mark: 5, examNeed: 19 },
      level: "success",
    });
  });
  it("50 — «5» уже не получить (нужно 35 > 30), лучшее — «4» за 15", () => {
    const a = assess("exam", 50, 0);
    assert.ok(a.type === "exam" && a.stage === "admitted");
    assert.deepEqual(a.target, { mark: 4, examNeed: 15 });
    assert.equal(a.automat, false);
  });
  it("экзамен сдан: 52 + 20 = 72 → «4»", () => {
    assert.deepEqual(assess("exam", 52, 0, 20), { type: "exam", stage: "done", total: 72, mark: 4, level: "success" });
  });
  it("баллы семестра сверх 70 не засчитываются", () => {
    const a = assess("exam", 80, 0, 10);
    assert.ok(a.type === "exam" && a.stage === "done");
    assert.equal(a.total, 80);
  });
});
