import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
const textureDir = path.join(repoRoot, "public", "cinematic", "textures");

const inputPaths = {
  albedo: path.join(textureDir, "jmpseat-earth-europe-candidate-albedo.webp"),
  emission: path.join(textureDir, "jmpseat-earth-europe-candidate-emission.webp"),
  clouds: path.join(textureDir, "jmpseat-earth-europe-candidate-clouds.webp"),
  metadata: path.join(textureDir, "jmpseat-earth-europe-candidate-metadata.json"),
};

const outputPaths = {
  albedo: path.join(textureDir, "jmpseat-earth-cityhalo-candidate-albedo.webp"),
  emission: path.join(textureDir, "jmpseat-earth-cityhalo-candidate-emission.webp"),
  clouds: path.join(textureDir, "jmpseat-earth-cityhalo-candidate-clouds.webp"),
  metadata: path.join(textureDir, "jmpseat-earth-cityhalo-candidate-metadata.json"),
};

function clampUnit(value) {
  return Math.min(1, Math.max(0, value));
}

async function buildCandidateEmission() {
  const emissionBuffer = await fs.readFile(inputPaths.emission);
  const source = sharp(emissionBuffer).ensureAlpha();
  const mediumBlur = sharp(emissionBuffer).ensureAlpha().blur(2.2);
  const wideBlur = sharp(emissionBuffer).ensureAlpha().blur(5.6);

  const [
    { data: sourceData, info },
    { data: mediumData },
    { data: wideData },
  ] = await Promise.all([
    source.raw().toBuffer({ resolveWithObject: true }),
    mediumBlur.raw().toBuffer({ resolveWithObject: true }),
    wideBlur.raw().toBuffer({ resolveWithObject: true }),
  ]);

  const out = Buffer.alloc(sourceData.length);

  for (let index = 0; index < sourceData.length; index += info.channels) {
    const sourceR = sourceData[index] / 255;
    const sourceG = sourceData[index + 1] / 255;
    const sourceB = sourceData[index + 2] / 255;
    const sourceA = sourceData[index + 3] / 255;
    const mediumA = mediumData[index + 3] / 255;
    const wideA = wideData[index + 3] / 255;
    const sourceSignal = Math.max(sourceA, sourceR, sourceG, sourceB);
    const mediumSignal = Math.max(mediumA, mediumData[index] / 255, mediumData[index + 1] / 255);
    const wideSignal = Math.max(wideA, wideData[index] / 255, wideData[index + 1] / 255);

    const clusterMask = clampUnit((mediumSignal - 0.018) / 0.2);
    const wideMask = clampUnit((wideSignal - 0.012) / 0.13);
    const denseMask = clampUnit((sourceSignal - 0.05) / 0.3);
    const cohesion = clusterMask * (0.32 + denseMask * 0.68) + wideMask * 0.18;
    const warmHalo = cohesion * (0.05 + mediumSignal * 0.08 + denseMask * 0.04);

    const finalR = clampUnit(sourceR + warmHalo * 0.72 + wideMask * 0.012);
    const finalG = clampUnit(sourceG + warmHalo * 0.46 + wideMask * 0.007);
    const finalB = clampUnit(sourceB + warmHalo * 0.12);
    const finalA = clampUnit(sourceA + cohesion * 0.05 + denseMask * 0.02);

    out[index] = Math.round(finalR * 255);
    out[index + 1] = Math.round(finalG * 255);
    out[index + 2] = Math.round(finalB * 255);
    out[index + 3] = Math.round(finalA * 255);
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
  await fs.copyFile(inputPaths.albedo, outputPaths.albedo);
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
      prior_metadata: path.relative(repoRoot, inputPaths.metadata),
    },
    outputs: {
      albedo: path.relative(repoRoot, outputPaths.albedo),
      emission: path.relative(repoRoot, outputPaths.emission),
      clouds: path.relative(repoRoot, outputPaths.clouds),
      metadata: path.relative(repoRoot, outputPaths.metadata),
    },
    candidate_goal: "Single safe city-halo cohesion correction for /lab/live-globe-proof.",
    transforms: [
      "Started from the accepted Europe candidate so Europe readability, Atlantic depth, polar cleanup, cloud detail, and current land/ocean balance remain intact.",
      "Preserved albedo and clouds unchanged so the pass stays focused on city-light cohesion rather than land or ocean grading.",
      "Re-authored the emission map by layering restrained medium and wide blur support around existing city-light geography to make the brightest clusters feel more embedded and premium.",
      "Kept the cohesion warm amber/gold and tied to existing city structure to avoid fake random glitter or large blown-out bloom blobs.",
    ],
    notes: [
      "This candidate is intended to pair with a modestly warmer runtime city-halo material grade.",
      "No routes, aircraft, scanner, ticket, ENTER CTA, chapter cards, placement, framing, orientation, rotation, homepage, or waitlist changes are encoded here.",
    ],
    inherited_from_europe: sourceMetadata.outputs ?? null,
  };

  await fs.writeFile(outputPaths.metadata, `${JSON.stringify(metadata, null, 2)}\n`);
}

async function main() {
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
