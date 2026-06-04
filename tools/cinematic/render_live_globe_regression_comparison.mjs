import fs from "node:fs/promises";
import path from "node:path";
import { chromium, devices } from "playwright";
import sharp from "sharp";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
const previewsDir = path.join(repoRoot, "public", "cinematic", "previews");
const comparisonPath = path.join(previewsDir, "live-globe-texture-regression-comparison.png");
const recoveredDesktopPath = path.join(previewsDir, "live-globe-proof-recovered-desktop.png");
const recoveredMobilePath = path.join(previewsDir, "live-globe-proof-recovered-mobile.png");
const referencePath = path.join(repoRoot, "docs", "landing", "references", "jmpseat-globe-material-reference.jpg");

const baseUrl = process.env.LIVE_GLOBE_BASE_URL ?? "http://127.0.0.1:3001";

const desktopCandidates = [
  {
    key: "reference",
    title: "Design Spec Reference",
    kind: "reference",
    sourcePath: referencePath,
  },
  {
    key: "v4-regressed",
    title: "Last Known Better Candidate",
    subtitle: "v4 baseline",
    url: `${baseUrl}/lab/live-globe-proof?candidate=v4&grade=regressed`,
  },
  {
    key: "v2-regressed",
    title: "Current Dark Candidate",
    subtitle: "v2 regressed",
    url: `${baseUrl}/lab/live-globe-proof?candidate=v2&grade=regressed`,
  },
  {
    key: "v3-regressed",
    title: "Best Available Alternative",
    subtitle: "v3 alternative",
    url: `${baseUrl}/lab/live-globe-proof?candidate=v3&grade=regressed`,
  },
  {
    key: "v4-recovered",
    title: "Recovered Selection",
    subtitle: "v4 recovered",
    url: `${baseUrl}/lab/live-globe-proof`,
  },
];

async function ensureDirs() {
  await fs.mkdir(previewsDir, { recursive: true });
}

async function captureDesktop(browser, candidate) {
  const outPath = path.join(previewsDir, `_tmp-regression-${candidate.key}.png`);
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(candidate.url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: outPath, fullPage: true });
  await page.close();
  return outPath;
}

async function captureRecoveredOutputs(browser) {
  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await desktopPage.emulateMedia({ reducedMotion: "reduce" });
  await desktopPage.goto(`${baseUrl}/lab/live-globe-proof`, { waitUntil: "networkidle" });
  await desktopPage.waitForTimeout(1800);
  await desktopPage.screenshot({ path: recoveredDesktopPath, fullPage: true });
  await desktopPage.close();

  const mobileContext = await browser.newContext({ ...devices["iPhone 14 Pro Max"] });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.emulateMedia({ reducedMotion: "reduce" });
  await mobilePage.goto(`${baseUrl}/lab/live-globe-proof`, { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(1800);
  await mobilePage.screenshot({ path: recoveredMobilePath, fullPage: true });
  await mobileContext.close();
}

function labelOverlay(width, height, title, subtitle = "") {
  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="18" y="${height - 84}" width="${width - 36}" height="58" rx="14" fill="rgba(2,8,18,0.82)" stroke="rgba(110,170,235,0.35)" />
      <text x="38" y="${height - 48}" font-family="Helvetica, Arial, sans-serif" font-size="24" fill="#f7fbff">${title}</text>
      ${subtitle ? `<text x="38" y="${height - 22}" font-family="Helvetica, Arial, sans-serif" font-size="16" fill="rgba(214,229,245,0.78)">${subtitle}</text>` : ""}
    </svg>
  `);
}

async function buildComparisonSheet(candidates) {
  const tileWidth = 640;
  const tileHeight = 400;
  const gap = 28;
  const cols = 2;
  const rows = 3;
  const canvasWidth = gap + cols * tileWidth + (cols - 1) * gap + gap;
  const canvasHeight = gap + rows * tileHeight + (rows - 1) * gap + gap;
  const composites = [];

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    const row = Math.floor(index / cols);
    const col = index % cols;
    const left = gap + col * (tileWidth + gap);
    const top = gap + row * (tileHeight + gap);

    const image = await sharp(candidate.sourcePath)
      .resize(tileWidth, tileHeight, { fit: "cover", position: "center" })
      .composite([{ input: labelOverlay(tileWidth, tileHeight, candidate.title, candidate.subtitle), left: 0, top: 0 }])
      .png()
      .toBuffer();

    composites.push({ input: image, left, top });
  }

  await sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 3,
      background: { r: 2, g: 7, b: 15 },
    },
  })
    .composite(composites)
    .png()
    .toFile(comparisonPath);
}

async function main() {
  await ensureDirs();
  const browser = await chromium.launch({ headless: true });

  try {
    const capturedCandidates = [];
    for (const candidate of desktopCandidates) {
      if (candidate.kind === "reference") {
        capturedCandidates.push(candidate);
        continue;
      }

      capturedCandidates.push({
        ...candidate,
        sourcePath: await captureDesktop(browser, candidate),
      });
    }

    await captureRecoveredOutputs(browser);
    await buildComparisonSheet(capturedCandidates);

    console.log(
      JSON.stringify(
        {
          comparisonPath: path.relative(repoRoot, comparisonPath),
          recoveredDesktopPath: path.relative(repoRoot, recoveredDesktopPath),
          recoveredMobilePath: path.relative(repoRoot, recoveredMobilePath),
        },
        null,
        2,
      ),
    );
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
