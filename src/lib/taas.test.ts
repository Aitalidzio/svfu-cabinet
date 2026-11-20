import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { lineForPath, pickRandomTap, pickTaasState, TAAS_TAP_EMOTIONS, type TaasSnapshot } from "./taas";

const day: TaasSnapshot = {
  role: "student",
  unreadCount: 0,
  yakutskMinutes: 12 * 60,
  gradeLevel: "info",
  readyRequest: true,
  pendingQueue: 0,
};

describe("Таас — реплики", () => {
  it("на «Сегодня» говорит про готовую справку", () => {
    const s = pickTaasState(day, "/ru");
    assert.equal(s.line, "ready");
    assert.equal(s.emotion, "happy");
  });

  it("на других экранах не залипает на справке", () => {
    assert.equal(pickTaasState(day, "/ru/schedule").line, "schedule");
    assert.equal(pickTaasState(day, "/ru/grades").line, "grades");
    assert.equal(pickTaasState(day, "/ru/profile").line, "profile");
  });

  it("на заявках снова напоминает про готовую справку", () => {
    assert.equal(pickTaasState(day, "/ru/requests").line, "ready");
  });

  it("lineForPath понимает экраны", () => {
    assert.equal(lineForPath("/sah"), "hello");
    assert.equal(lineForPath("/en/schedule/changes"), "changes");
  });

  it("эмоция меняется по экрану, даже если справка готова", () => {
    assert.equal(pickTaasState(day, "/ru/schedule").emotion, "neutral");
    assert.equal(pickTaasState(day, "/ru/grades").emotion, "tired");
    assert.equal(pickTaasState(day, "/ru/profile").emotion, "happy");
    assert.equal(pickTaasState(day, "/ru/requests").emotion, "happy");
    assert.equal(pickTaasState(day, "/ru/schedule/changes").emotion, "angry");
  });

  it("случайный клик не повторяет прошлую фразу и берёт эмоцию из карты", () => {
    const next = pickRandomTap("tap3", () => 0);
    assert.notEqual(next.line, "tap3");
    assert.equal(next.emotion, TAAS_TAP_EMOTIONS[next.line]);
  });
});
