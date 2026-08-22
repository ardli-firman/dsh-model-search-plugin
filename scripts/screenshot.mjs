// Screenshot demo states with Playwright — element-anchored crops so the
// menu always sits centered in frame.
import path from "node:path";
import fs from "node:fs";

const root = "/home/almaver/Projects/model-search-plugin";
const outDir = path.join(root, "docs/screenshots");
fs.mkdirSync(outDir, { recursive: true });

const harness = "/home/almaver/deepseek-harness";
const pwDir = path.join(harness, "node_modules/.pnpm");
const entry = fs.readdirSync(pwDir).find(d => d.startsWith("playwright-core@"));
const pw = await import(path.join(pwDir, entry, "node_modules/playwright-core/index.mjs"));
const chromium = pw.chromium;

const cacheDir = process.env.HOME + "/.cache/ms-playwright";
const fullChromium = path.join(cacheDir, "chromium-1234", "chrome-linux64", "chrome");
const headlessShell = path.join(cacheDir, "chromium_headless_shell-1234", "chrome-headless-shell-linux64", "chrome-headless-shell");

const browser = await chromium.launch({
    executablePath: fs.existsSync(fullChromium) ? fullChromium : headlessShell,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"]
});

// Tall viewport: menu (up to 360px) + composer must both fit comfortably.
const page = await browser.newPage({ viewport: { width: 900, height: 760 }, deviceScaleFactor: 2 });
page.on("pageerror", e => console.log("[pageerror]", e.message));

await page.goto("file://" + path.join(root, "docs/demo.html"));
await page.waitForTimeout(600);

// Helper: crop a window around an element, clamped to the viewport.
async function shotAround(selector, name, pad = 24) {
    const box = await page.locator(selector).boundingBox();
    const vp = page.viewportSize();
    let x = Math.max(0, Math.floor(box.x - pad));
    let y = Math.max(0, Math.floor(box.y - pad));
    let width = Math.min(vp.width - x, Math.ceil(box.width + pad * 2));
    let height = Math.min(vp.height - y, Math.ceil(box.height + pad * 2));
    await page.screenshot({ path: path.join(outDir, name), clip: { x, y, width, height } });
    console.log("shot:", name, `(crop ${width}x${height} at ${x},${y})`);
}

// 1. Closed state — trigger chip inside the composer.
await page.screenshot({ path: path.join(outDir, "composer.png") });
console.log("shot: composer.png");

// 2. Open menu (Recent + provider groups + effort selector), centered on the card.
await page.click(".dsh-ms-trigger");
await page.waitForTimeout(400);
await shotAround(".dsh-ms-menu", "menu-open.png", 28);

// 3. Search filtering for "claude".
await page.fill(".dsh-ms-input", "claude");
await page.waitForTimeout(300);
await shotAround(".dsh-ms-menu", "search.png", 28);

// 4. Collapsed DeepSeek group (header stays visible with count).
await page.fill(".dsh-ms-input", "");
await page.waitForTimeout(200);
const titles = await page.locator(".dsh-ms-groupTitle").all();
await titles[titles.length - 1].click();
await page.waitForTimeout(300);
await shotAround(".dsh-ms-menu", "collapsed.png", 28);

// Re-expand for the next shot.
await titles[titles.length - 1].click();
await page.waitForTimeout(200);

// 5. Keyboard focus ring on an option (focus-visible surface).
await page.focus('.section[aria-label="Recent"] .dsh-ms-option').catch(async () => {
    const opt = page.locator('section[aria-label="Recent"] .dsh-ms-option').first();
    await opt.focus();
});
await page.waitForTimeout(150);
await shotAround(".dsh-ms-menu", "focus.png", 28);

// 6. Light theme variant of the open menu.
await page.evaluate(() => document.body.removeAttribute("data-ds-dark-theme"));
await page.waitForTimeout(250);
await shotAround(".dsh-ms-menu", "menu-light.png", 28);

await browser.close();
console.log("done");
