import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
const textureDir = path.join(repoRoot, "public", "cinematic", "textures");

const inputPaths = {
  albedo: path.join(textureDir, "jmpseat-earth-cityrim-candidate-albedo.webp"),
  emission: path.join(textureDir, "jmpseat-earth-cityrim-candidate-emission.webp"),
  clouds: path.join(textureDir, "jmpseat-earth-cityrim-candidate-clouds.webp"),
  iceMask: path.join(textureDir, "jmpseat-earth-ice-suppression-v4.webp"),
  metadata: path.join(textureDir, "jmpseat-earth-cityrim-candidate-metadata.json"),
};

const outputPaths = {
  albedo: path.join(textureDir, "jmpseat-earth-polar-candidate-albedo.webp"),
  emission: path.join(textureDir, "jmpseat-earth-polar-candidate-emission.webp"),
  clouds: path.join(textureDir, "jmpseat-earth-polar-candidate-clouds.webp"),
  metadata: path.join(textureDir, "jmpseat-earth-polar-candidate-metadata.json"),
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
  return Math.exp(-(nx * nx + ny * ny) * 2.35);
}

async function buildCandidateAlbedo() {
  const albedo = sharp(inputPaths.albedo).removeAlpha();
  const iceMask = sharp(inputPaths.iceMask).removeAlpha();
  const [{ data: albedoData, info }, { data: iceMaskData }] = await Promise.all([
    albedo.raw().toBuffer({ resolveWithObject: true }),
    iceMask.raw().toBuffer({ resolveWithObject: true }),
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
      const ice = iceMaskData[index] / 255;
      const brightness = Math.max(r, g, b);
      const northPoleMask = smoothstep(0.72, 1, 1 - yNorm);
      const greenlandMask = gaussian2d(xNorm, yNorm, 0.47, 0.11, 0.12, 0.12);
      const arcticMask = gaussian2d(xNorm, yNorm, 0.54, 0.14, 0.22, 0.11);
      const polarSignal = ice * (northPoleMask * 0.62 + greenlandMask * 0.88 + arcticMask * 0.42);
      const brightIce = polarSignal * smoothstep(0.42, 0.86, brightness);

      const coolGray = {
        r: r * 0.78 + b * 0.06,
        g: g * 0.82 + b * 0.04,
        b: b * 0.9 + g * 0.02,
      };

      const finalR = clampUnit(r * (1 - brightIce * 0.24) * (1 - northPoleMask * ice * 0.05) + coolGray.r * brightIce * 0.26);
      const finalG = clampUnit(g * (1 - brightIce * 0.18) * (1 - northPoleMask * ice * 0.04) + coolGray.g * brightIce * 0.22);
      const finalB = clampUnit(b * (1 - brightIce * 0.08) + coolGray.b * brightIce * 0.1);

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
      iceMask: path.relative(repoRoot, inputPaths.iceMask),
      prior_metadata: path.relative(repoRoot, inputPaths.metadata),
    },
    outputs: {
      albedo: path.relative(repoRoot, outputPaths.albedo),
      emission: path.relative(repoRoot, outputPaths.emission),
      clouds: path.relative(repoRoot, outputPaths.clouds),
      metadata: path.relative(repoRoot, outputPaths.metadata),
    },
    candidate_goal: "Single safe polar/ice and top-rim correction for /lab/live-globe-proof.",
    transforms: [
      "Started from the accepted cityrim albedo so city lights, ocean balance, and general land values remain aligned with the current working state.",
      "Reduced Greenland/Arctic harshness by selectively cooling and lowering the brightest north-polar ice response using the existing ice mask and top-latitude targeting.",
      "Preserved emission and clouds unchanged so warm city lights and current cloud detail do not regress.",
      "This candidate is intended to pair with a small runtime top/rim glow grade change rather than a broad material rewrite.",
    ],
    notes: [
      "No camera, placement, orientation, rotation, routes, aircraft, scanner, ticket, ENTER CTA, chapter cards, homepage, or waitlist changes are encoded here.",
      "The change is intentionally limited to one versioned candidate for accept/reject review.",
    ],
    inherited_from_cityrim: sourceMetadata.outputs ?? null,
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
