import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isNotificationCategory, notificationHref, parseNotificationFilter } from "./notifications";

describe("категория уведомления", () => {
  it("известные категории", () => {
    assert.equal(isNotificationCategory("deanery"), true);
    assert.equal(isNotificationCategory("schedule"), true);
    assert.equal(isNotificationCategory("requests"), true);
  });
  it("чужая строка — нет", () => assert.equal(isNotificationCategory("hack"), false));
});

describe("фильтр из адреса", () => {
  it("пустой и мусор → все", () => {
    assert.equal(parseNotificationFilter(undefined), "all");
    assert.equal(parseNotificationFilter("nope"), "all");
  });
  it("известная категория", () => assert.equal(parseNotificationFilter("requests"), "requests"));
});

describe("ссылка с языком", () => {
  it("без пути — null", () => assert.equal(notificationHref("ru", null), null));
  it("путь заявки", () => assert.equal(notificationHref("ru", "/requests/1"), "/ru/requests/1"));
  it("якутский", () => assert.equal(notificationHref("sah", "/schedule"), "/sah/schedule"));
});
