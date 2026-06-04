import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
const textureDir = path.join(repoRoot, "public", "cinematic", "textures");

const inputPaths = {
  albedo: path.join(textureDir, "jmpseat-earth-polar-candidate-albedo.webp"),
  emission: path.join(textureDir, "jmpseat-earth-polar-candidate-emission.webp"),
  clouds: path.join(textureDir, "jmpseat-earth-polar-candidate-clouds.webp"),
  oceanMask: path.join(textureDir, "jmpseat-earth-ocean-mask-v4.webp"),
  metadata: path.join(textureDir, "jmpseat-earth-polar-candidate-metadata.json"),
};

const outputPaths = {
  albedo: path.join(textureDir, "jmpseat-earth-atlantic-candidate-albedo.webp"),
  emission: path.join(textureDir, "jmpseat-earth-atlantic-candidate-emission.webp"),
  clouds: path.join(textureDir, "jmpseat-earth-atlantic-candidate-clouds.webp"),
  metadata: path.join(textureDir, "jmpseat-earth-atlantic-candidate-metadata.json"),
};

function clampUnit(value) {
  return Math.min(1, Math.max(0, value));
}

function gaussian2d(x, y, centerX, centerY, radiusX, radiusY) {
  const nx = (x - centerX) / radiusX;
  const ny = (y - centerY) / radiusY;
  return Math.exp(-(nx * nx + ny * ny) * 2.15);
}

async function buildCandidateAlbedo() {
  const albedo = sharp(inputPaths.albedo).removeAlpha();
  const oceanMask = sharp(inputPaths.oceanMask).removeAlpha();
  const [{ data: albedoData, info }, { data: oceanMaskData }] = await Promise.all([
    albedo.raw().toBuffer({ resolveWithObject: true }),
    oceanMask.raw().toBuffer({ resolveWithObject: true }),
  ]);

  const out = Buffer.alloc(albedoData.length);

  for (let y = 0; y < info.height; y += 1) {
    const yNorm = y / Math.max(1, info.height - 1);

    for (let x = 0; x < info.width; x += 1) {
      const xNorm = x / Math.max(1, info.width - 1);
      const index = (y * info.width + x) * info.channels;
      const r = albedoData[index] / 255;
      const g = albedoData[index + 1] / 255;
      const b = albedoData[index + 2] / 255;
      const ocean = oceanMaskData[index] / 255;

      const atlanticNorth = gaussian2d(xNorm, yNorm, 0.372, 0.34, 0.132, 0.22);
      const atlanticSouth = gaussian2d(xNorm, yNorm, 0.408, 0.64, 0.168, 0.18);
      const westCoastBand = gaussian2d(xNorm, yNorm, 0.295, 0.47, 0.05, 0.28);
      const eastCoastBand = gaussian2d(xNorm, yNorm, 0.475, 0.43, 0.05, 0.31);
      const atlanticMask = Math.max(atlanticNorth, atlanticSouth) * ocean;
      const coastBand = Math.max(westCoastBand, eastCoastBand) * ocean * atlanticMask;
      const oceanWave = 0.5 + 0.5 * Math.sin(xNorm * 38 + yNorm * 29);
      const deepening = atlanticMask * (0.14 + oceanWave * 0.12);
      const navyLift = atlanticMask * (0.06 + oceanWave * 0.08);
      const coastContrast = coastBand * 0.07;

      const finalR = clampUnit(r * (1 - deepening * 0.4) - coastContrast * 0.026);
      const finalG = clampUnit(g * (1 - deepening * 0.3) + navyLift * 0.012 - coastContrast * 0.014);
      const finalB = clampUnit(b * (1 - deepening * 0.14) + navyLift * 0.026);

      out[index] = Math.round(finalR * 255);
      out[index + 1] = Math.round(finalG * 255);
      out[index + 2] = Math.round(finalB * 255);
    }
  }

  await sharp(out, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels,
    },
  })
    .webp({ quality: 96 })
    .toFile(outputPaths.albedo);
}

async function copySupportingMaps() {
  await fs.copyFile(inputPaths.emission, outputPaths.emission);
  await fs.copyFile(inputPaths.clouds, outputPaths.clouds);
}

async function buildMetadata() {
  const sourceMetadata = JSON.parse(await fs.readFile(inputPaths.metadata, "utf8"));
  const metadata = {
    generated_at: new Date().toISOString(),
    inputs: {
      albedo: path.relative(repoRoot, inputPaths.albedo),
      emission: path.relative(repoRoot, inputPaths.emission),
      clouds: path.relative(repoRoot, inputPaths.clouds),
      oceanMask: path.relative(repoRoot, inputPaths.oceanMask),
      prior_metadata: path.relative(repoRoot, inputPaths.metadata),
    },
    outputs: {
      albedo: path.relative(repoRoot, outputPaths.albedo),
      emission: path.relative(repoRoot, outputPaths.emission),
      clouds: path.relative(repoRoot, outputPaths.clouds),
      metadata: path.relative(repoRoot, outputPaths.metadata),
    },
    candidate_goal: "Single safe Atlantic-depth and continental-edge correction for /lab/live-globe-proof.",
    transforms: [
      "Started from the accepted polar albedo so polar balance, city-light integration, and overall land values remain aligned with the current working state.",
      "Deepened the front-facing Atlantic selectively with the existing ocean mask and Atlantic-centered regional targeting instead of darkening global oceans.",
      "Added subtle navy tonal variation inside the Atlantic region to reduce the flat uniform water read.",
      "Preserved emission and clouds unchanged so warm city lights, North America/Europe visibility, and cloud detail do not regress.",
    ],
    notes: [
      "This candidate is intended to pair with a small runtime coast/Atlantic depth grade adjustment.",
      "No routes, aircraft, scanner, ticket, ENTER CTA, chapter cards, placement, framing, orientation, rotation, homepage, or waitlist changes are encoded here.",
    ],
    inherited_from_polar: sourceMetadata.outputs ?? null,
  };

  await fs.writeFile(outputPaths.metadata, `${JSON.stringify(metadata, null, 2)}\n`);
}

async function main() {
  await buildCandidateAlbedo();
  await copySupportingMaps();
  await buildMetadata();
  console.log(
    JSON.stringify(
      Object.fromEntries(
        Object.entries(outputPaths).map(([key, value]) => [key, path.relative(repoRoot, value)]),
      ),
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
