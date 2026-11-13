import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addWorkingDays, isRequestType, validateRequest } from "./requests";

describe("срок готовности — рабочие дни", () => {
  it("подана в четверг — готова в пятницу", () => assert.equal(addWorkingDays("2026-11-12", 1), "2026-11-13"));
  it("подана в пятницу — готова в понедельник", () => assert.equal(addWorkingDays("2026-11-13", 1), "2026-11-16"));
  it("подана в субботу — тоже в понедельник", () => assert.equal(addWorkingDays("2026-11-14", 1), "2026-11-16"));
  it("3 рабочих дня с пятницы — среда", () => assert.equal(addWorkingDays("2026-11-13", 3), "2026-11-18"));
});

describe("тип заявки", () => {
  it("известный тип", () => assert.equal(isRequestType("study_certificate"), true));
  it("чужая строка — нет", () => assert.equal(isRequestType("drop table"), false));
});

describe("проверка формы на сервере", () => {
  it("справка об обучении: цель обязательна, количество по умолчанию 1", () => {
    assert.deepEqual(validateRequest("study_certificate", { purpose: "social" }), {
      ok: true,
      details: { purpose: "social", copies: "1" },
      comment: null,
    });
  });
  it("без цели — ошибка «обязательно»", () => {
    assert.deepEqual(validateRequest("study_certificate", {}), { ok: false, errors: { purpose: "required" } });
  });
  it("значения не из списка отклоняются", () => {
    const v = validateRequest("study_certificate", { purpose: "<script>", copies: "100" });
    assert.deepEqual(v, { ok: false, errors: { purpose: "invalid", copies: "invalid" } });
  });
  it("лишние поля из формы игнорируются", () => {
    const v = validateRequest("scholarship_certificate", { period: "6", studentId: "someone-else", status: "ready" });
    assert.deepEqual(v, { ok: true, details: { period: "6", copies: "1" }, comment: null });
  });
  it("матпомощь: пояснение обязательно и не короче 10 символов", () => {
    assert.deepEqual(validateRequest("financial_aid", { reason: "medical" }), { ok: false, errors: { comment: "required" } });
    assert.deepEqual(validateRequest("financial_aid", { reason: "medical", comment: " коротко " }), {
      ok: false,
      errors: { comment: "tooShort" },
    });
  });
  it("слишком длинный комментарий", () => {
    const v = validateRequest("student_card", { cardReason: "lost", comment: "а".repeat(501) });
    assert.deepEqual(v, { ok: false, errors: { comment: "tooLong" } });
  });
  it("комментарий обрезается по краям", () => {
    const v = validateRequest("student_card", { cardReason: "lost", comment: "  потерял в автобусе  " });
    assert.deepEqual(v, { ok: true, details: { cardReason: "lost" }, comment: "потерял в автобусе" });
  });
});
