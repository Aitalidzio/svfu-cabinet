import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "docs/ai-process/screenshots/16-final-check");
mkdirSync(out, { recursive: true });
const password = readFileSync(resolve(root, ".env.local"), "utf8")
  .match(/^\s*SEED_DEMO_PASSWORD=(.*)$/m)[1]
  .trim()
  .replace(/^["']|["']$/g, "");
const BASE = process.env.SMOKE_BASE ?? "http://127.0.0.1:3000";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.on("console", (msg) => console.log("CONSOLE", msg.type(), msg.text()));
page.on("pageerror", (err) => console.log("PAGEERROR", String(err)));

await page.goto(`${BASE}/ru/login`, { waitUntil: "networkidle" });
await page.getByRole("textbox", { name: "Логин" }).fill("s.nikolaeva");
await page.locator("#password").fill(password);
await page.getByRole("button", { name: "Войти" }).click();
await page.waitForTimeout(2500);
console.log("home", page.url());

for (const path of ["/ru/requests/999999999", "/ru/requests/abc", "/ru/this-route-does-not-exist-xyz"]) {
  const res = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const status = res?.status();
  const title = await page.title();
  const text = (await page.locator("body").innerText()).replace(/\s+/g, " ").slice(0, 300);
  const html = await page.content();
  const htmlLen = html.length;
  const shot = path.replace(/\W+/g, "_") + ".png";
  await page.screenshot({ path: resolve(out, shot), fullPage: true });
  writeFileSync(resolve(out, path.replace(/\W+/g, "_") + ".html"), html);
  const meta = await page.evaluate(() => {
    const textLen = (document.body.textContent || "").trim().length;
    const hasEmpty = !!document.querySelector("[class*='EmptyState'], .rounded-3xl.border-dashed");
    const h2 = [...document.querySelectorAll("h1,h2")].map((el) => el.textContent?.trim()).filter(Boolean);
    const nextError = document.querySelector("#__next-error, [data-next-error], template[data-next-error-message]");
    const styles = getComputedStyle(document.body);
    return {
      textLen,
      hasEmpty,
      headings: h2.slice(0, 5),
      bodyBg: styles.backgroundColor,
      bodyColor: styles.color,
      childCount: document.body.children.length,
      nextError: nextError ? nextError.outerHTML.slice(0, 200) : null,
      sample: (document.body.innerHTML || "").replace(/\s+/g, " ").slice(0, 400),
    };
  });
  console.log(JSON.stringify({ path, status, title, htmlLen, text, shot, meta }));
}

await browser.close();
