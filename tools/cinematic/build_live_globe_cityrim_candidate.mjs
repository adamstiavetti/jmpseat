import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
const textureDir = path.join(repoRoot, "public", "cinematic", "textures");

const inputPaths = {
  albedo: path.join(textureDir, "jmpseat-earth-albedo-v4.webp"),
  emission: path.join(textureDir, "jmpseat-earth-emission-v4.webp"),
  clouds: path.join(textureDir, "jmpseat-earth-clouds-v4.webp"),
  metadata: path.join(textureDir, "jmpseat-earth-lookdev-metadata-v4.json"),
};

const outputPaths = {
  albedo: path.join(textureDir, "jmpseat-earth-cityrim-candidate-albedo.webp"),
  emission: path.join(textureDir, "jmpseat-earth-cityrim-candidate-emission.webp"),
  clouds: path.join(textureDir, "jmpseat-earth-cityrim-candidate-clouds.webp"),
  metadata: path.join(textureDir, "jmpseat-earth-cityrim-candidate-metadata.json"),
};

function clampUnit(value) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(edge0, edge1, value) {
  const t = clampUnit((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function gaussian2d(x, y, centerX, centerY, radiusX, radiusY) {
  const nx = (x - centerX) / radiusX;
  const ny = (y - centerY) / radiusY;
  return Math.exp(-(nx * nx + ny * ny) * 2.2);
}

async function buildCandidateEmission() {
  const image = sharp(inputPaths.emission).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(data.length);

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const index = (y * info.width + x) * info.channels;
      const r = data[index] / 255;
      const g = data[index + 1] / 255;
      const b = data[index + 2] / 255;
      const a = data[index + 3] / 255;

      const brightness = Math.max(r, g, b);
      const lightMask = smoothstep(0.015, 0.24, brightness) * smoothstep(0.02, 0.3, a);
      const northAmericaMask = gaussian2d(x / info.width, y / info.height, 0.19, 0.25, 0.12, 0.12);
      const europeMask = gaussian2d(x / info.width, y / info.height, 0.56, 0.2, 0.09, 0.09);
      const regionalLift = Math.max(northAmericaMask, europeMask * 1.08);
      const globalLift = 1 + lightMask * 0.11;
      const regionalGain = 1 + regionalLift * lightMask * 0.24;
      const warmBlend = 0.16 + regionalLift * 0.06;

      const warmedR = clampUnit((r * (1.03 + warmBlend) + g * 0.06) * globalLift * regionalGain);
      const warmedG = clampUnit((g * (1.01 + warmBlend * 0.36) + r * 0.03) * globalLift * (1 + regionalLift * lightMask * 0.12));
      const warmedB = clampUnit((b * (0.77 - regionalLift * 0.05) + g * 0.02) * (1 + lightMask * 0.03));
      const warmedA = clampUnit(a * (1 + lightMask * 0.08 + regionalLift * lightMask * 0.18));

      out[index] = Math.round(warmedR * 255);
      out[index + 1] = Math.round(warmedG * 255);
      out[index + 2] = Math.round(warmedB * 255);
      out[index + 3] = Math.round(warmedA * 255);
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
    candidate_goal: "Single safe globe-only city-light and rim candidate for /lab/live-globe-proof.",
    reused_runtime_maps: {
      oceanMask: sourceMetadata.outputs.oceanMask,
      desertMask: sourceMetadata.outputs.desertMask,
      iceMask: sourceMetadata.outputs.iceMask,
      nightHalo: sourceMetadata.outputs.emissionHalo,
    },
    transforms: [
      "Copied the current v4 albedo unchanged to preserve the working ocean depth, land values, and cloud/surface balance.",
      "Copied the current v4 cloud map unchanged so cloud density stays stable and does not crush surface detail.",
      "Re-authored only the emission map by warming existing city geography toward amber/gold and selectively lifting North America and Europe visibility without inventing random dots or routes.",
      "Kept all non-city darkness geography-shaped by using the existing emission alpha and brightness structure as the mask.",
    ],
    notes: [
      "This candidate is intended to pair with a small runtime rim/halo grade adjustment.",
      "No camera, layout, route, aircraft, scanner, ticket, ENTER, homepage, or waitlist changes are encoded here.",
    ],
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
