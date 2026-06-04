import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
const textureDir = path.join(repoRoot, "public", "cinematic", "textures");
const previewDir = path.join(repoRoot, "public", "cinematic", "previews");
const versionArg = process.argv.find((value) => value.startsWith("--version="));
const version = versionArg ? versionArg.split("=")[1] : "v2";

const INPUTS = {
  day: path.join(textureDir, "cgtrader-earth-day-4k.jpg"),
  night: path.join(textureDir, "cgtrader-earth-night-4k.jpg"),
  clouds: path.join(textureDir, "cgtrader-earth-clouds-4k.jpg"),
  specular: path.join(textureDir, "cgtrader-earth-specular-4k.jpg"),
};

const OUTPUTS = {
  albedo: path.join(textureDir, `jmpseat-earth-albedo-${version}.webp`),
  emission: path.join(textureDir, `jmpseat-earth-emission-${version}.webp`),
  emissionHalo: path.join(textureDir, `jmpseat-earth-emission-halo-${version}.webp`),
  clouds: path.join(textureDir, `jmpseat-earth-clouds-${version}.webp`),
  oceanMask: path.join(textureDir, `jmpseat-earth-ocean-mask-${version}.webp`),
  desertMask: path.join(textureDir, `jmpseat-earth-desert-suppression-${version}.webp`),
  iceMask: path.join(textureDir, `jmpseat-earth-ice-suppression-${version}.webp`),
  metadata:
    version === "v2"
      ? path.join(textureDir, "jmpseat-earth-lookdev-metadata.json")
      : path.join(textureDir, `jmpseat-earth-lookdev-metadata-${version}.json`),
  albedoPreview: path.join(previewDir, `jmpseat-earth-albedo-${version}-preview.png`),
  emissionPreview: path.join(previewDir, `jmpseat-earth-emission-${version}-preview.png`),
  emissionHaloPreview: path.join(previewDir, `jmpseat-earth-emission-halo-${version}-preview.png`),
  cloudsPreview: path.join(previewDir, `jmpseat-earth-clouds-${version}-preview.png`),
};

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const mix = (a, b, t) => a + (b - a) * t;

function smoothstep(edge0, edge1, value) {
  if (edge0 === edge1) {
    return value < edge0 ? 0 : 1;
  }
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function color(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16) / 255,
    g: parseInt(hex.slice(3, 5), 16) / 255,
    b: parseInt(hex.slice(5, 7), 16) / 255,
  };
}

function blend(a, b, t) {
  return {
    r: mix(a.r, b.r, t),
    g: mix(a.g, b.g, t),
    b: mix(a.b, b.b, t),
  };
}

function hueDistanceDegrees(a, b) {
  const delta = Math.abs(a - b) % 360;
  return delta > 180 ? 360 - delta : delta;
}

function rgbToHsl(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;

  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    default:
      h = (r - g) / d + 4;
      break;
  }

  h /= 6;
  return { h: h * 360, s, l };
}

function lonLatMask(lon, lat, lonMin, lonMax, latMin, latMax, feather = 8) {
  const lonLeft = smoothstep(lonMin - feather, lonMin + feather, lon);
  const lonRight = 1 - smoothstep(lonMax - feather, lonMax + feather, lon);
  const latBottom = smoothstep(latMin - feather, latMin + feather, lat);
  const latTop = 1 - smoothstep(latMax - feather, latMax + feather, lat);
  return clamp01(Math.min(lonLeft, lonRight, latBottom, latTop));
}

function statSummary(values) {
  let min = Infinity;
  let max = -Infinity;
  let total = 0;

  for (const value of values) {
    min = Math.min(min, value);
    max = Math.max(max, value);
    total += value;
  }

  return {
    min: Number(min.toFixed(4)),
    max: Number(max.toFixed(4)),
    mean: Number((total / values.length).toFixed(4)),
  };
}

async function loadImage(filePath, channels = 4) {
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  if (channels === 4) {
    return { data, info };
  }

  const trimmed = new Uint8Array(info.width * info.height * channels);
  for (let i = 0; i < info.width * info.height; i += 1) {
    for (let channel = 0; channel < channels; channel += 1) {
      trimmed[i * channels + channel] = data[i * 4 + channel];
    }
  }
  return { data: trimmed, info: { ...info, channels } };
}

async function ensureDirs() {
  await fs.mkdir(textureDir, { recursive: true });
  await fs.mkdir(previewDir, { recursive: true });
}

async function main() {
  await ensureDirs();

  const [day, night, clouds, specular] = await Promise.all([
    loadImage(INPUTS.day),
    loadImage(INPUTS.night),
    loadImage(INPUTS.clouds),
    loadImage(INPUTS.specular),
  ]);

  const { width, height } = day.info;
  const pixelCount = width * height;

  const albedoBuffer = new Uint8Array(pixelCount * 3);
  const emissionBuffer = new Uint8Array(pixelCount * 4);
  const emissionHaloBuffer = new Uint8Array(pixelCount * 4);
  const cloudBuffer = new Uint8Array(pixelCount * 4);
  const oceanMaskBuffer = new Uint8Array(pixelCount);
  const desertMaskBuffer = new Uint8Array(pixelCount);
  const iceMaskBuffer = new Uint8Array(pixelCount);

  const navyDeep = color("#020812");
  const navyLift = color("#0a2449");
  const oceanGlow = color("#194778");
  const landBase = color("#141b22");
  const landLift = color("#425057");
  const desertTarget = color("#34343a");
  const iceTarget = color("#71849a");
  const cloudCool = color("#d7e4f5");
  const cityWarm = color("#d08a3b");
  const cityHot = color("#ffebb6");

  const oceanSamples = [];
  const desertSamples = [];
  const iceSamples = [];
  const citySamples = [];
  const cloudSamples = [];

  for (let index = 0; index < pixelCount; index += 1) {
    const baseOffset = index * 4;
    const outOffsetRgb = index * 3;

    const dayR = day.data[baseOffset] / 255;
    const dayG = day.data[baseOffset + 1] / 255;
    const dayB = day.data[baseOffset + 2] / 255;

    const nightR = night.data[baseOffset] / 255;
    const nightG = night.data[baseOffset + 1] / 255;
    const nightB = night.data[baseOffset + 2] / 255;

    const cloudR = clouds.data[baseOffset] / 255;
    const cloudG = clouds.data[baseOffset + 1] / 255;
    const cloudB = clouds.data[baseOffset + 2] / 255;

    const specR = specular.data[baseOffset] / 255;
    const specG = specular.data[baseOffset + 1] / 255;
    const specB = specular.data[baseOffset + 2] / 255;

    const { h, s, l } = rgbToHsl(dayR, dayG, dayB);
    const dayLuma = dayR * 0.2126 + dayG * 0.7152 + dayB * 0.0722;
    const nightLuma = Math.max(nightR, nightG, nightB);
    const cloudLuma = cloudR * 0.299 + cloudG * 0.587 + cloudB * 0.114;
    const specLuma = specR * 0.299 + specG * 0.587 + specB * 0.114;

    const oceanMask = clamp01(Math.max(smoothstep(0.16, 0.72, specLuma), smoothstep(0.38, 0.74, dayB - dayR * 0.54)));
    const landMask = 1 - oceanMask;
    const warmHue = 1 - smoothstep(12, 94, hueDistanceDegrees(h, 42));
    const desertDryness = clamp01(Math.max(0, dayR - dayB * 0.52) + Math.max(0, dayG - dayB * 0.68));
    const desertMask =
      landMask *
      warmHue *
      smoothstep(0.16, 0.78, dayLuma) *
      (0.52 + smoothstep(0.02, 0.34, s) * 0.48) *
      smoothstep(0.08, 0.46, desertDryness) *
      (1 - smoothstep(0.1, 0.42, dayB));

    const latitude = 90 - ((Math.floor(index / width) + 0.5) / height) * 180;
    const longitude = ((index % width) + 0.5) / width * 360 - 180;
    const polarMask = smoothstep(50, 82, Math.abs(latitude));
    const iceMask =
      landMask *
      polarMask *
      smoothstep(0.5, 0.94, l) *
      (1 - smoothstep(0.22, 0.56, s));

    const cloudAlpha = Math.pow(smoothstep(0.34, 0.9, cloudLuma), 1.1) * 0.78;
    const oceanDetail = oceanMask * (0.22 + smoothstep(0.06, 0.42, dayB) * 0.78);
    const relief = landMask * smoothstep(0.08, 0.72, dayLuma) * (0.32 + s * 0.48);
    const oceanSwirl = oceanMask * smoothstep(0.08, 0.46, dayB - dayG * 0.12);

    let oceanColor = blend(navyDeep, navyLift, oceanDetail);
    oceanColor = blend(oceanColor, oceanGlow, cloudAlpha * 0.08 + oceanSwirl * 0.16 + smoothstep(0.22, 0.56, dayB) * 0.04);

    let landColor = blend(landBase, landLift, relief);
    landColor = blend(landColor, { r: dayR * 0.4, g: dayG * 0.38, b: dayB * 0.34 }, 0.28);
    landColor = blend(landColor, desertTarget, desertMask * 0.82);
    landColor = blend(landColor, iceTarget, iceMask * 0.58);

    let albedoColor = blend(landColor, oceanColor, oceanMask);
    albedoColor = blend(albedoColor, cloudCool, cloudAlpha * 0.12);

    albedoBuffer[outOffsetRgb] = Math.round(clamp01(albedoColor.r) * 255);
    albedoBuffer[outOffsetRgb + 1] = Math.round(clamp01(albedoColor.g) * 255);
    albedoBuffer[outOffsetRgb + 2] = Math.round(clamp01(albedoColor.b) * 255);

    const northAmericaMask =
      lonLatMask(longitude, latitude, -132, -58, 18, 60, 9) +
      lonLatMask(longitude, latitude, -92, -66, 24, 48, 7) * 0.44;
    const europeMask =
      lonLatMask(longitude, latitude, -12, 38, 34, 64, 8) +
      lonLatMask(longitude, latitude, -7, 18, 44, 58, 6) * 0.38;
    const eastAsiaMask = lonLatMask(longitude, latitude, 104, 144, 22, 48, 10) * 0.14;
    const cityMask = landMask * Math.pow(smoothstep(0.025, 0.62, nightLuma), 0.98);
    const cityBoost = 1 + northAmericaMask * 0.66 + europeMask * 0.62 + eastAsiaMask * 1.14;
    const cityCore = Math.pow(smoothstep(0.08, 0.84, nightLuma), 1.02);
    const cityStrength = clamp01(cityMask * cityBoost * (1 - desertMask * 0.18));
    const cityColor = blend(cityWarm, cityHot, cityCore * 0.78);
    const cityAlpha = clamp01(cityStrength * (0.62 + cityCore * 1.24));
    const cityHaloAlpha = clamp01(cityStrength * (0.54 + cityCore * 0.82));

    emissionBuffer[baseOffset] = Math.round(clamp01(cityColor.r * cityStrength) * 255);
    emissionBuffer[baseOffset + 1] = Math.round(clamp01(cityColor.g * cityStrength) * 255);
    emissionBuffer[baseOffset + 2] = Math.round(clamp01(cityColor.b * cityStrength) * 255);
    emissionBuffer[baseOffset + 3] = Math.round(cityAlpha * 255);

    emissionHaloBuffer[baseOffset] = Math.round(clamp01(cityColor.r * cityStrength) * 255);
    emissionHaloBuffer[baseOffset + 1] = Math.round(clamp01(cityColor.g * cityStrength) * 255);
    emissionHaloBuffer[baseOffset + 2] = Math.round(clamp01(cityColor.b * cityStrength) * 255);
    emissionHaloBuffer[baseOffset + 3] = Math.round(cityHaloAlpha * 255);

    const cloudLight = Math.round(clamp01(0.72 + cloudAlpha * 0.28) * 255);
    cloudBuffer[baseOffset] = cloudLight;
    cloudBuffer[baseOffset + 1] = Math.round(clamp01(0.76 + cloudAlpha * 0.2) * 255);
    cloudBuffer[baseOffset + 2] = Math.round(clamp01(0.84 + cloudAlpha * 0.16) * 255);
    cloudBuffer[baseOffset + 3] = Math.round(cloudAlpha * 255);

    oceanMaskBuffer[index] = Math.round(oceanMask * 255);
    desertMaskBuffer[index] = Math.round(clamp01(desertMask) * 255);
    iceMaskBuffer[index] = Math.round(clamp01(iceMask) * 255);

    oceanSamples.push(oceanMask);
    desertSamples.push(desertMask);
    iceSamples.push(iceMask);
    citySamples.push(cityStrength);
    cloudSamples.push(cloudAlpha);
  }

  await Promise.all([
    sharp(albedoBuffer, { raw: { width, height, channels: 3 } }).webp({ quality: 92 }).toFile(OUTPUTS.albedo),
    sharp(emissionBuffer, { raw: { width, height, channels: 4 } }).webp({ quality: 92, alphaQuality: 96 }).toFile(OUTPUTS.emission),
    sharp(emissionHaloBuffer, { raw: { width, height, channels: 4 } })
      .blur(1.8)
      .webp({ quality: 92, alphaQuality: 96 })
      .toFile(OUTPUTS.emissionHalo),
    sharp(cloudBuffer, { raw: { width, height, channels: 4 } }).webp({ quality: 90, alphaQuality: 94 }).toFile(OUTPUTS.clouds),
    sharp(oceanMaskBuffer, { raw: { width, height, channels: 1 } }).webp({ quality: 90 }).toFile(OUTPUTS.oceanMask),
    sharp(desertMaskBuffer, { raw: { width, height, channels: 1 } }).webp({ quality: 90 }).toFile(OUTPUTS.desertMask),
    sharp(iceMaskBuffer, { raw: { width, height, channels: 1 } }).webp({ quality: 90 }).toFile(OUTPUTS.iceMask),
    sharp(albedoBuffer, { raw: { width, height, channels: 3 } }).png().toFile(OUTPUTS.albedoPreview),
    sharp(emissionBuffer, { raw: { width, height, channels: 4 } }).png().toFile(OUTPUTS.emissionPreview),
    sharp(emissionHaloBuffer, { raw: { width, height, channels: 4 } }).blur(1.8).png().toFile(OUTPUTS.emissionHaloPreview),
    sharp(cloudBuffer, { raw: { width, height, channels: 4 } }).png().toFile(OUTPUTS.cloudsPreview),
  ]);

  const metadata = {
    generated_at: new Date().toISOString(),
    inputs: {
      day: path.relative(repoRoot, INPUTS.day),
      night: path.relative(repoRoot, INPUTS.night),
      clouds: path.relative(repoRoot, INPUTS.clouds),
      specular: path.relative(repoRoot, INPUTS.specular),
    },
    outputs: Object.fromEntries(Object.entries(OUTPUTS).map(([key, value]) => [key, path.relative(repoRoot, value)])),
    texture_audit: {
      runtime_geometry: "SphereGeometry in app/lab/live-globe-proof/page.tsx",
      glb_present_but_unused_at_runtime: "public/cinematic/models/cgtrader-earth-live-proof.glb",
      runtime_loading: "External textures loaded directly in Three.js code; no embedded GLB textures are sampled by the live route.",
      current_map_usage: {
        albedo_base_color: "cgtrader-earth-day-4k.jpg",
        emission_city_lights: "cgtrader-earth-night-4k.jpg",
        clouds: "cgtrader-earth-clouds-4k.jpg",
        bump_normal_displacement: "cgtrader-earth-normal-4k.jpg exists but was not consumed by the active shader during this pass.",
        ocean_response: "cgtrader-earth-specular-4k.jpg",
        atmosphere_rim: "Procedural shader only; not texture-backed.",
      },
    },
    transforms: {
      albedo: [
        "Deepened oceans toward navy/blue-black using the CGTrader specular-derived ocean mask.",
        "Muted land saturation, reduced bright desert response, and cooled polar whites into restrained blue-gray values.",
        "Kept subtle cloud lift in the beauty map so the surface stays dimensional instead of turning into a flat dark sphere.",
      ],
      emission: [
        "Derived from the CGTrader night map with transparent non-city areas instead of keeping the source's dark land background.",
        "Shifted lights toward amber/gold and boosted source geography selectively over North America and Europe.",
      ],
      emission_halo: [
        "Derived from the same CGTrader night geography, then blurred to produce broader metro and coastline glow without inventing new city locations.",
      ],
      clouds: [
        "Derived from the CGTrader cloud texture with the low-level haze removed and the remaining cloud bodies carried in alpha.",
      ],
      helper_masks: [
        "Ocean mask derived from the specular source plus day-map blue separation.",
        "Desert and ice suppression masks derived from day-map color, brightness, saturation, and latitude cues.",
      ],
    },
    statistics: {
      ocean_mask: statSummary(oceanSamples),
      desert_mask: statSummary(desertSamples),
      ice_mask: statSummary(iceSamples),
      city_strength: statSummary(citySamples),
      cloud_alpha: statSummary(cloudSamples),
    },
    procedural_supporting_maps: [
      `jmpseat-earth-ocean-mask-${version}.webp`,
      `jmpseat-earth-desert-suppression-${version}.webp`,
      `jmpseat-earth-ice-suppression-${version}.webp`,
    ],
    notes: [
      "Raw CGTrader assets remain private under the ignored Globe/ source directory.",
      "These outputs are lab-safe derivatives intended for live-globe proof evaluation, not a production approval claim.",
    ],
  };

  await fs.writeFile(OUTPUTS.metadata, JSON.stringify(metadata, null, 2));
  console.log(JSON.stringify(metadata, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
