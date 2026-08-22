// Verify demo page renders correctly (DOM-level assertions).
import path from "node:path";
import fs from "node:fs";

const harness = "/home/almaver/deepseek-harness";
const pwDir = path.join(harness, "node_modules/.pnpm");
const entry = fs.readdirSync(pwDir).find(d => d.startsWith("playwright-core@"));
const pw = await import(path.join(pwDir, entry, "node_modules/playwright-core/index.mjs"));

const cacheDir = process.env.HOME + "/.cache/ms-playwright";
const fullChromium = path.join(cacheDir, "chromium-1234", "chrome-linux64", "chrome");

const browser = await pw.chromium.launch({
    executablePath: fs.existsSync(fullChromium) ? fullChromium : undefined,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"]
});
const page = await browser.newPage({ viewport: { width: 900, height: 640 } });
const errors = [];
page.on("pageerror", e => errors.push(e.message));

await page.goto("file:///home/almaver/Projects/model-search-plugin/docs/demo.html");
await page.waitForTimeout(500);

const triggerText = await page.locator(".dsh-ms-triggerLabel").textContent();
console.log("trigger label:", JSON.stringify(triggerText));
const badge = await page.locator(".dsh-ms-effortBadge").textContent();
console.log("effort badge:", JSON.stringify(badge));

await page.click(".dsh-ms-trigger");
await page.waitForTimeout(300);

const groups = await page.locator("section[role=group]").evaluateAll(
    els => els.map(e => e.getAttribute("aria-label"))
);
console.log("groups:", groups.join(" | "));

const recentModels = await page.locator('section[aria-label="Recent"] .dsh-ms-modelName').allTextContents();
console.log("recent models:", recentModels.join(", "));

const optionCount = await page.locator(".dsh-ms-option").count();
console.log("total options:", optionCount);

const checked = await page.locator('.dsh-ms-option[aria-checked="true"] .dsh-ms-modelName').allTextContents();
console.log("checked:", checked.join(", "));

await page.fill(".dsh-ms-input", "claude");
await page.waitForTimeout(200);
const filtered = await page.locator(".dsh-ms-modelName").allTextContents();
console.log("filtered by 'claude':", filtered.join(", "));
const footer = await page.locator(".dsh-ms-count span").first().textContent();
console.log("footer:", footer);

await page.fill(".dsh-ms-input", "");
await page.waitForTimeout(200);
// select a model from Recent
await page.locator('section[aria-label="Recent"] .dsh-ms-option').first().click();
await page.waitForTimeout(300);
const triggerAfter = await page.locator(".dsh-ms-triggerLabel").textContent();
console.log("trigger after selecting Claude Sonnet 4:", JSON.stringify(triggerAfter));

console.log("page errors:", errors.length === 0 ? "none" : errors.join("; "));
await browser.close();
