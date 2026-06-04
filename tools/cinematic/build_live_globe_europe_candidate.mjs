import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
const textureDir = path.join(repoRoot, "public", "cinematic", "textures");

const inputPaths = {
  albedo: path.join(textureDir, "jmpseat-earth-atlantic-candidate-albedo.webp"),
  emission: path.join(textureDir, "jmpseat-earth-atlantic-candidate-emission.webp"),
  clouds: path.join(textureDir, "jmpseat-earth-atlantic-candidate-clouds.webp"),
  oceanMask: path.join(textureDir, "jmpseat-earth-ocean-mask-v4.webp"),
  desertMask: path.join(textureDir, "jmpseat-earth-desert-suppression-v4.webp"),
  metadata: path.join(textureDir, "jmpseat-earth-atlantic-candidate-metadata.json"),
};

const outputPaths = {
  albedo: path.join(textureDir, "jmpseat-earth-europe-candidate-albedo.webp"),
  emission: path.join(textureDir, "jmpseat-earth-europe-candidate-emission.webp"),
  clouds: path.join(textureDir, "jmpseat-earth-europe-candidate-clouds.webp"),
  metadata: path.join(textureDir, "jmpseat-earth-europe-candidate-metadata.json"),
};

function clampUnit(value) {
  return Math.min(1, Math.max(0, value));
}

function gaussian2d(x, y, centerX, centerY, radiusX, radiusY) {
  const nx = (x - centerX) / radiusX;
  const ny = (y - centerY) / radiusY;
  return Math.exp(-(nx * nx + ny * ny) * 2.05);
}

function europeLandMask(xNorm, yNorm, landMask, desertMask) {
  const westernEurope = gaussian2d(xNorm, yNorm, 0.488, 0.308, 0.06, 0.09);
  const centralEurope = gaussian2d(xNorm, yNorm, 0.54, 0.266, 0.072, 0.09);
  const northEurope = gaussian2d(xNorm, yNorm, 0.55, 0.206, 0.064, 0.102);
  const southEurope = gaussian2d(xNorm, yNorm, 0.572, 0.335, 0.055, 0.078);
  return Math.max(westernEurope, centralEurope, northEurope, southEurope) * landMask * (1 - desertMask * 0.82);
}

async function buildCandidateAlbedo() {
  const albedo = sharp(inputPaths.albedo).removeAlpha();
  const oceanMask = sharp(inputPaths.oceanMask).removeAlpha();
  const desertMask = sharp(inputPaths.desertMask).removeAlpha();
  const [{ data: albedoData, info }, { data: oceanMaskData }, { data: desertMaskData }] = await Promise.all([
    albedo.raw().toBuffer({ resolveWithObject: true }),
    oceanMask.raw().toBuffer({ resolveWithObject: true }),
    desertMask.raw().toBuffer({ resolveWithObject: true }),
  ]);

  const out = Buffer.alloc(albedoData.length);
  const texelX = 1 / Math.max(1, info.width - 1);
  const texelY = 1 / Math.max(1, info.height - 1);

  for (let y = 0; y < info.height; y += 1) {
    const yNorm = y * texelY;

    for (let x = 0; x < info.width; x += 1) {
      const xNorm = x * texelX;
      const index = (y * info.width + x) * info.channels;
      const northY = Math.min(info.height - 1, y + 1);
      const southY = Math.max(0, y - 1);
      const eastX = Math.min(info.width - 1, x + 1);
      const westX = Math.max(0, x - 1);
      const northIndex = (northY * info.width + x) * info.channels;
      const southIndex = (southY * info.width + x) * info.channels;
      const eastIndex = (y * info.width + eastX) * info.channels;
      const westIndex = (y * info.width + westX) * info.channels;
      const r = albedoData[index] / 255;
      const g = albedoData[index + 1] / 255;
      const b = albedoData[index + 2] / 255;
      const ocean = oceanMaskData[index] / 255;
      const desert = desertMaskData[index] / 255;
      const landMask = 1 - ocean;
      const oceanNorth = oceanMaskData[northIndex] / 255;
      const oceanSouth = oceanMaskData[southIndex] / 255;
      const oceanEast = oceanMaskData[eastIndex] / 255;
      const oceanWest = oceanMaskData[westIndex] / 255;
      const coastline = clampUnit((Math.abs(oceanNorth - oceanSouth) + Math.abs(oceanEast - oceanWest)) * 2.6) * landMask;

      const eastAtlantic = gaussian2d(xNorm, yNorm, 0.492, 0.355, 0.09, 0.19) * ocean;
      const northAtlantic = gaussian2d(xNorm, yNorm, 0.485, 0.27, 0.076, 0.13) * ocean;
      const oceanSeparationMask = Math.max(eastAtlantic, northAtlantic);
      const europeMask = europeLandMask(xNorm, yNorm, landMask, desert);
      const oceanWave = 0.5 + 0.5 * Math.sin(xNorm * 43 - yNorm * 31);
      const deepening = oceanSeparationMask * (0.1 + oceanWave * 0.1);
      const navyLift = oceanSeparationMask * (0.045 + oceanWave * 0.06);
      const coastEdge = coastline * europeMask * 0.08;

      const finalR = clampUnit(r * (1 - deepening * 0.32) - coastEdge * 0.022);
      const finalG = clampUnit(g * (1 - deepening * 0.2) + navyLift * 0.01 - coastEdge * 0.01);
      const finalB = clampUnit(b * (1 - deepening * 0.07) + navyLift * 0.028 + coastEdge * 0.012);

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

async function buildCandidateEmission() {
  const emission = sharp(inputPaths.emission).ensureAlpha();
  const oceanMask = sharp(inputPaths.oceanMask).removeAlpha();
  const desertMask = sharp(inputPaths.desertMask).removeAlpha();
  const [{ data: emissionData, info }, { data: oceanMaskData }, { data: desertMaskData }] = await Promise.all([
    emission.raw().toBuffer({ resolveWithObject: true }),
    oceanMask.raw().toBuffer({ resolveWithObject: true }),
    desertMask.raw().toBuffer({ resolveWithObject: true }),
  ]);

  const out = Buffer.alloc(emissionData.length);
  const texelX = 1 / Math.max(1, info.width - 1);
  const texelY = 1 / Math.max(1, info.height - 1);

  for (let y = 0; y < info.height; y += 1) {
    const yNorm = y * texelY;

    for (let x = 0; x < info.width; x += 1) {
      const xNorm = x * texelX;
      const index = (y * info.width + x) * info.channels;
      const r = emissionData[index] / 255;
      const g = emissionData[index + 1] / 255;
      const b = emissionData[index + 2] / 255;
      const a = emissionData[index + 3] / 255;
      const ocean = oceanMaskData[index] / 255;
      const desert = desertMaskData[index] / 255;
      const landMask = 1 - ocean;
      const europeMask = europeLandMask(xNorm, yNorm, landMask, desert);
      const citySignal = Math.max(a, r, g, b);
      const boost = europeMask * (0.2 + citySignal * 0.56);

      const finalR = clampUnit(r * (1 + boost * 0.74) + boost * 0.038);
      const finalG = clampUnit(g * (1 + boost * 0.46) + boost * 0.024);
      const finalB = clampUnit(b * (1 + boost * 0.14));
      const finalA = clampUnit(a * (1 + boost * 0.52));

      out[index] = Math.round(finalR * 255);
      out[index + 1] = Math.round(finalG * 255);
      out[index + 2] = Math.round(finalB * 255);
      out[index + 3] = Math.round(finalA * 255);
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
    .toFile(outputPaths.emission);
}

async function copySupportingMaps() {
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
      desertMask: path.relative(repoRoot, inputPaths.desertMask),
      prior_metadata: path.relative(repoRoot, inputPaths.metadata),
    },
    outputs: {
      albedo: path.relative(repoRoot, outputPaths.albedo),
      emission: path.relative(repoRoot, outputPaths.emission),
      clouds: path.relative(repoRoot, outputPaths.clouds),
      metadata: path.relative(repoRoot, outputPaths.metadata),
    },
    candidate_goal: "Single safe Europe/eastern-Atlantic readability correction for /lab/live-globe-proof.",
    transforms: [
      "Started from the accepted Atlantic candidate so the current ocean depth, polar cleanup, cloud detail, and North America light balance remain intact.",
      "Boosted existing western and central Europe city-light signal selectively from the emission map so the lights stay geography-shaped rather than becoming fake random glitter.",
      "Warmed Europe light color slightly toward amber/gold while keeping the strongest gain confined to existing dense city regions.",
      "Deepened the eastern Atlantic and tightened Europe coastline separation in the albedo without globally darkening the globe or over-brightening the Sahara.",
      "Preserved clouds unchanged so cloud detail and motion-compatible surface layering do not regress.",
    ],
    notes: [
      "This candidate is intended to pair with localized Europe runtime grade controls, not a broad global brightness lift.",
      "No routes, aircraft, scanner, ticket, ENTER CTA, chapter cards, placement, framing, orientation, rotation, homepage, or waitlist changes are encoded here.",
    ],
    inherited_from_atlantic: sourceMetadata.outputs ?? null,
  };

  await fs.writeFile(outputPaths.metadata, `${JSON.stringify(metadata, null, 2)}\n`);
}

async function main() {
  await buildCandidateAlbedo();
  await buildCandidateEmission();
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
