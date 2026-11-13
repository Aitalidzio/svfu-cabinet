import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateAnnouncement } from "./announcements";

describe("объявление", () => {
  it("на весь институт", () => {
    assert.deepEqual(
      validateAnnouncement({ title: "Сессия", body: "Расписание сессии опубликовано.", audience: "institute" }),
      { ok: true, title: "Сессия", body: "Расписание сессии опубликовано.", audience: "institute", course: null, groupCode: null },
    );
  });
  it("на курс — нужен номер", () => {
    assert.deepEqual(validateAnnouncement({ title: "А", body: "Б", audience: "course" }), {
      ok: false,
      errors: { course: "invalid" },
    });
    assert.equal(validateAnnouncement({ title: "А", body: "Б", audience: "course", course: "3" }).ok, true);
  });
  it("на группу — нужен код", () => {
    assert.deepEqual(validateAnnouncement({ title: "А", body: "Б", audience: "group" }), {
      ok: false,
      errors: { groupCode: "required" },
    });
  });
  it("пустой заголовок и текст", () => {
    assert.deepEqual(validateAnnouncement({ audience: "institute" }), {
      ok: false,
      errors: { title: "required", body: "required" },
    });
  });
  it("неизвестная аудитория", () => {
    assert.deepEqual(validateAnnouncement({ title: "А", body: "Б", audience: "world" }), {
      ok: false,
      errors: { audience: "invalid" },
    });
  });
});
