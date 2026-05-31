import fs from "node:fs/promises";
import path from "node:path";
import { chromium, devices } from "playwright";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
const previewsDir = path.join(repoRoot, "public", "cinematic", "previews");
const desktopPath = path.join(previewsDir, "live-globe-proof-aircraft-debug-desktop.png");
const mobilePath = path.join(previewsDir, "live-globe-proof-aircraft-debug-mobile.png");
const baseUrl = process.env.LIVE_GLOBE_BASE_URL ?? "http://localhost:3001";

async function ensurePreviewDir() {
  await fs.mkdir(previewsDir, { recursive: true });
}

async function captureScreens(browser) {
  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await desktopPage.emulateMedia({ reducedMotion: "reduce" });
  await desktopPage.goto(`${baseUrl}/lab/live-globe-proof?aircraft=on`, { waitUntil: "networkidle" });
  await desktopPage.waitForTimeout(2200);
  await desktopPage.screenshot({ path: desktopPath, fullPage: true });
  await desktopPage.close();

  const mobileContext = await browser.newContext({ ...devices["iPhone 14 Pro Max"] });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.emulateMedia({ reducedMotion: "reduce" });
  await mobilePage.goto(`${baseUrl}/lab/live-globe-proof?aircraft=on`, { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(2200);
  await mobilePage.screenshot({ path: mobilePath, fullPage: true });
  await mobileContext.close();
}

async function main() {
  await ensurePreviewDir();
  const browser = await chromium.launch({ headless: true });
  try {
    await captureScreens(browser);
  } finally {
    await browser.close();
  }

  console.log(
    JSON.stringify(
      {
        desktopPath: path.relative(repoRoot, desktopPath),
        mobilePath: path.relative(repoRoot, mobilePath),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
