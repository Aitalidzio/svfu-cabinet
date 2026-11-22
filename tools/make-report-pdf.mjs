import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = path.join(root, "docs", "ai-process", "report.html");
const pdf = path.join(root, "docs", "ai-process", "report.pdf");

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`file://${html.replaceAll("\\", "/")}`, { waitUntil: "networkidle" });
await page.pdf({
  path: pdf,
  format: "A4",
  printBackground: true,
  margin: { top: "12mm", bottom: "14mm", left: "12mm", right: "12mm" },
});
await browser.close();
console.log("Wrote", pdf);
