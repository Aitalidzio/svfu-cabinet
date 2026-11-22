/**
 * Final smoke against live site. Reads SEED_DEMO_PASSWORD from .env.local.
 * Never prints the password. Writes docs/ai-process/screenshots/16-final-check/
 */
import { chromium } from "playwright";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "docs/ai-process/screenshots/16-final-check");
mkdirSync(outDir, { recursive: true });

function loadPassword() {
  const env = readFileSync(resolve(root, ".env.local"), "utf8");
  const m = env.match(/^\s*SEED_DEMO_PASSWORD=(.*)$/m);
  if (!m) throw new Error("SEED_DEMO_PASSWORD missing");
  return m[1].trim().replace(/^["']|["']$/g, "");
}

const BASE = process.env.SMOKE_BASE ?? "https://argocabinet.tw1.su";
const password = loadPassword();
const results = [];

function ok(name, detail = "") {
  results.push({ name, ok: true, detail });
  console.log(`OK  ${name}${detail ? " — " + detail : ""}`);
}
function fail(name, detail) {
  results.push({ name, ok: false, detail });
  console.log(`FAIL ${name} — ${detail}`);
}

async function loginAs(page, username) {
  await page.goto(`${BASE}/ru/login`, { waitUntil: "networkidle" });
  await page.getByRole("textbox", { name: "Логин" }).fill(username);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Войти" }).click();
  await page.waitForTimeout(3500);
  const err = ((await page.locator("#login-error").textContent().catch(() => "")) || "").trim();
  return { url: page.url(), err };
}

const browser = await chromium.launch({ headless: true });

try {
  // --- A: successful student login first (fresh context) ---
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();

    const r = await loginAs(page, "s.nikolaeva");
    await page.screenshot({ path: resolve(outDir, "03-home.png") });
    if (r.url.includes("/login")) fail("student_login", r.err || r.url);
    else ok("student_login", r.url);

    if (!r.url.includes("/login")) {
      for (const [path, shot] of [
        ["/ru/schedule", "04-schedule.png"],
        ["/ru/grades", "05-grades.png"],
        ["/ru/requests", "06-requests.png"],
        ["/ru/notifications", "07-notifications.png"],
        ["/ru/profile", "08-profile.png"],
      ]) {
        const res = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
        await page.screenshot({ path: resolve(outDir, shot) });
        const code = res?.status() ?? 0;
        if (code >= 400) fail(`page_${path}`, `HTTP ${code}`);
        else if (page.url().includes("/login")) fail(`page_${path}`, "redirected to login");
        else ok(`page_${path}`, `HTTP ${code}`);
      }

      // Foreign / missing request → cabinet 404
      await page.goto(`${BASE}/ru/requests/999999999`, { waitUntil: "networkidle" });
      await page.waitForTimeout(800);
      await page.screenshot({ path: resolve(outDir, "09-request-404.png") });
      const body = await page.locator("body").innerText();
      if (/не найден|не найдена|not found|көстүбэт/i.test(body) && !page.url().includes("/login")) {
        ok("request_404");
      } else fail("request_404", body.slice(0, 180).replace(/\s+/g, " "));

      // Unknown route while logged in
      await page.goto(`${BASE}/ru/this-route-does-not-exist-xyz`, { waitUntil: "networkidle" });
      await page.waitForTimeout(800);
      await page.screenshot({ path: resolve(outDir, "10-route-404.png") });
      const body2 = await page.locator("body").innerText();
      const url6 = page.url();
      if (/не найден|не найдена|not found|көстүбэт/i.test(body2) && !url6.includes("/login")) {
        ok("logged_in_route_404", url6);
      } else if (url6.includes("/login")) fail("logged_in_route_404", "redirected to login instead of 404");
      else fail("logged_in_route_404", body2.slice(0, 180).replace(/\s+/g, " "));

      if (/концепт для конкурса/i.test(body2) || /концепт для конкурса/i.test(await page.locator("body").innerText())) {
        ok("concept_note");
      } else {
        await page.goto(`${BASE}/ru/profile`, { waitUntil: "networkidle" });
        if (/концепт для конкурса/i.test(await page.locator("body").innerText())) ok("concept_note", "on profile");
        else fail("concept_note", "missing");
      }
    }

    await ctx.close();
  }

  // --- B: staff login (fresh) ---
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    const r = await loginAs(page, "dekanat.imi");
    await page.screenshot({ path: resolve(outDir, "11-staff-home.png") });
    if (r.url.includes("/login")) fail("staff_login", r.err || r.url);
    else {
      ok("staff_login", r.url);
      await page.goto(`${BASE}/ru/requests`, { waitUntil: "networkidle" });
      await page.screenshot({ path: resolve(outDir, "12-staff-requests.png") });
      if (page.url().includes("/login")) fail("staff_requests", "redirected to login");
      else ok("staff_requests", page.url());

      await page.goto(`${BASE}/ru/announcements`, { waitUntil: "networkidle" });
      await page.screenshot({ path: resolve(outDir, "13-staff-announcements.png") });
      if (page.url().includes("/login")) fail("staff_announcements", "redirected to login");
      else ok("staff_announcements");
    }
    await ctx.close();
  }

  // --- C: login errors (separate context, after success checks) ---
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/ru/login`, { waitUntil: "networkidle" });
    await page.screenshot({ path: resolve(outDir, "01-login.png") });
    if (await page.getByRole("heading", { name: /Вход в кабинет/i }).count()) ok("login_page");
    else fail("login_page", "heading missing");

    await page.getByRole("textbox", { name: "Логин" }).fill("nobody.fake");
    await page.locator("#password").fill("definitely-wrong");
    await page.getByRole("button", { name: "Войти" }).click();
    const alert = page.locator("#login-error");
    await alert.waitFor({ state: "visible", timeout: 15000 });
    const alertText = (await alert.textContent())?.trim() ?? "";
    await page.screenshot({ path: resolve(outDir, "02-login-error.png") });
    if (alertText.includes("Неверный логин или пароль")) ok("login_error_ui", alertText);
    else fail("login_error_ui", alertText || "no alert");

    await page.getByRole("textbox", { name: "Логин" }).fill("s.nikolaeva");
    await page.locator("#password").fill("definitely-wrong");
    await page.getByRole("button", { name: "Войти" }).click();
    await alert.waitFor({ state: "visible", timeout: 15000 });
    const alert2 = (await alert.textContent())?.trim() ?? "";
    if (alert2.includes("Неверный логин или пароль")) ok("login_same_message_wrong_pw");
    else fail("login_same_message_wrong_pw", alert2);

    // Unauthenticated unknown page → redirect to login (by design of proxy)
    await page.goto(`${BASE}/ru/ghost-page-xyz`, { waitUntil: "networkidle" });
    await page.screenshot({ path: resolve(outDir, "14-anon-unknown.png") });
    if (page.url().includes("/login")) ok("anon_unknown_to_login", "proxy redirects (expected)");
    else fail("anon_unknown_to_login", page.url());

    await ctx.close();
  }
} catch (e) {
  fail("uncaught", String(e));
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
writeFileSync(
  resolve(outDir, "results.txt"),
  results.map((r) => `${r.ok ? "OK" : "FAIL"}\t${r.name}\t${r.detail ?? ""}`).join("\n") + `\n\nfailed=${failed.length}\n`,
  "utf8",
);
console.log(`\nfailed=${failed.length}`);
process.exit(failed.length ? 1 : 0);
