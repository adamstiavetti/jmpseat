"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import styles from "./page.module.css";

type TextureSetName = "v2" | "v3" | "v4" | "cityrim" | "polar" | "atlantic" | "europe" | "cityhalo";
type GradeName = "regressed" | "recovered" | "cityrim" | "polar" | "atlantic" | "europe" | "cityhalo";
type RoutesMode = "on" | "off";
type AircraftMode = "on" | "off";

type TextureSet = {
  day: string;
  night: string;
  nightHalo: string;
  clouds: string;
  oceanMask: string;
  desertMask: string;
  iceMask: string;
};

type GradeConfig = {
  rendererExposure: number;
  ambientLight: number;
  coolFill: number;
  softKey: number;
  rimLight: number;
  cityHaloColor: number;
  atmosphereColor: number;
  cityOpacity: number;
  cityHaloOpacity: number;
  cloudOpacity: number;
  atmosphereStrength: number;
  atmosphereScale: number;
  dayGain: number;
  twilightGain: number;
  cityGain: number;
  coastGain: number;
  rimFillGain: number;
  iceGain: number;
  atlanticDepthGain: number;
  atlanticVariationGain: number;
  europeCityGain: number;
  europeCoastGain: number;
  europeAtlanticGain: number;
};

type RouteArcConfig = {
  color: number;
  glowColor: number;
  start: { lat: number; lon: number };
  end: { lat: number; lon: number };
  altitude: number;
  coreRadius: number;
  glowRadius: number;
  opacity: number;
  glowOpacity: number;
};

type AircraftPlacementConfig = {
  routeIndex: number;
  progress: number;
  speed: number;
  baseScale: number;
};

type RouteCurveEntry = {
  routeIndex: number;
  routeConfig: RouteArcConfig;
  curve: THREE.CatmullRomCurve3;
};

type AircraftEntry = {
  anchor: THREE.Group;
  pose: THREE.Group;
  visual: THREE.Group;
  routeEntry: RouteCurveEntry;
  progress: number;
  speed: number;
  baseScale: number;
  materials: THREE.MeshPhongMaterial[];
  trailPoints: THREE.Mesh[];
};

const TEXTURE_SETS: Record<TextureSetName, TextureSet> = {
  v2: {
    day: "/cinematic/textures/deadhead-earth-albedo-v2.webp",
    night: "/cinematic/textures/deadhead-earth-emission-v2.webp",
    nightHalo: "/cinematic/textures/deadhead-earth-emission-halo-v2.webp",
    clouds: "/cinematic/textures/deadhead-earth-clouds-v2.webp",
    oceanMask: "/cinematic/textures/deadhead-earth-ocean-mask-v2.webp",
    desertMask: "/cinematic/textures/deadhead-earth-desert-suppression-v2.webp",
    iceMask: "/cinematic/textures/deadhead-earth-ice-suppression-v2.webp",
  },
  v3: {
    day: "/cinematic/textures/deadhead-earth-albedo-v3.webp",
    night: "/cinematic/textures/deadhead-earth-emission-v3.webp",
    nightHalo: "/cinematic/textures/deadhead-earth-emission-halo-v3.webp",
    clouds: "/cinematic/textures/deadhead-earth-clouds-v3.webp",
    oceanMask: "/cinematic/textures/deadhead-earth-ocean-mask-v3.webp",
    desertMask: "/cinematic/textures/deadhead-earth-desert-suppression-v3.webp",
    iceMask: "/cinematic/textures/deadhead-earth-ice-suppression-v3.webp",
  },
  v4: {
    day: "/cinematic/textures/deadhead-earth-albedo-v4.webp",
    night: "/cinematic/textures/deadhead-earth-emission-v4.webp",
    nightHalo: "/cinematic/textures/deadhead-earth-emission-halo-v4.webp",
    clouds: "/cinematic/textures/deadhead-earth-clouds-v4.webp",
    oceanMask: "/cinematic/textures/deadhead-earth-ocean-mask-v4.webp",
    desertMask: "/cinematic/textures/deadhead-earth-desert-suppression-v4.webp",
    iceMask: "/cinematic/textures/deadhead-earth-ice-suppression-v4.webp",
  },
  cityrim: {
    day: "/cinematic/textures/deadhead-earth-cityrim-candidate-albedo.webp",
    night: "/cinematic/textures/deadhead-earth-cityrim-candidate-emission.webp",
    nightHalo: "/cinematic/textures/deadhead-earth-emission-halo-v4.webp",
    clouds: "/cinematic/textures/deadhead-earth-cityrim-candidate-clouds.webp",
    oceanMask: "/cinematic/textures/deadhead-earth-ocean-mask-v4.webp",
    desertMask: "/cinematic/textures/deadhead-earth-desert-suppression-v4.webp",
    iceMask: "/cinematic/textures/deadhead-earth-ice-suppression-v4.webp",
  },
  polar: {
    day: "/cinematic/textures/deadhead-earth-polar-candidate-albedo.webp",
    night: "/cinematic/textures/deadhead-earth-polar-candidate-emission.webp",
    nightHalo: "/cinematic/textures/deadhead-earth-emission-halo-v4.webp",
    clouds: "/cinematic/textures/deadhead-earth-polar-candidate-clouds.webp",
    oceanMask: "/cinematic/textures/deadhead-earth-ocean-mask-v4.webp",
    desertMask: "/cinematic/textures/deadhead-earth-desert-suppression-v4.webp",
    iceMask: "/cinematic/textures/deadhead-earth-ice-suppression-v4.webp",
  },
  atlantic: {
    day: "/cinematic/textures/deadhead-earth-atlantic-candidate-albedo.webp",
    night: "/cinematic/textures/deadhead-earth-atlantic-candidate-emission.webp",
    nightHalo: "/cinematic/textures/deadhead-earth-emission-halo-v4.webp",
    clouds: "/cinematic/textures/deadhead-earth-atlantic-candidate-clouds.webp",
    oceanMask: "/cinematic/textures/deadhead-earth-ocean-mask-v4.webp",
    desertMask: "/cinematic/textures/deadhead-earth-desert-suppression-v4.webp",
    iceMask: "/cinematic/textures/deadhead-earth-ice-suppression-v4.webp",
  },
  europe: {
    day: "/cinematic/textures/deadhead-earth-europe-candidate-albedo.webp",
    night: "/cinematic/textures/deadhead-earth-europe-candidate-emission.webp",
    nightHalo: "/cinematic/textures/deadhead-earth-emission-halo-v4.webp",
    clouds: "/cinematic/textures/deadhead-earth-europe-candidate-clouds.webp",
    oceanMask: "/cinematic/textures/deadhead-earth-ocean-mask-v4.webp",
    desertMask: "/cinematic/textures/deadhead-earth-desert-suppression-v4.webp",
    iceMask: "/cinematic/textures/deadhead-earth-ice-suppression-v4.webp",
  },
  cityhalo: {
    day: "/cinematic/textures/deadhead-earth-cityhalo-candidate-albedo.webp",
    night: "/cinematic/textures/deadhead-earth-cityhalo-candidate-emission.webp",
    nightHalo: "/cinematic/textures/deadhead-earth-emission-halo-v4.webp",
    clouds: "/cinematic/textures/deadhead-earth-cityhalo-candidate-clouds.webp",
    oceanMask: "/cinematic/textures/deadhead-earth-ocean-mask-v4.webp",
    desertMask: "/cinematic/textures/deadhead-earth-desert-suppression-v4.webp",
    iceMask: "/cinematic/textures/deadhead-earth-ice-suppression-v4.webp",
  },
};

const GRADE_CONFIGS: Record<GradeName, GradeConfig> = {
  regressed: {
    rendererExposure: 1.06,
    ambientLight: 0.32,
    coolFill: 1.16,
    softKey: 0.94,
    rimLight: 3.35,
    cityHaloColor: 0xfff0d6,
    atmosphereColor: 0x1b84ff,
    cityOpacity: 0.62,
    cityHaloOpacity: 0.34,
    cloudOpacity: 0.14,
    atmosphereStrength: 0.15,
    atmosphereScale: 1.444,
    dayGain: 1.12,
    twilightGain: 1,
    cityGain: 1,
    coastGain: 1,
    rimFillGain: 1,
    iceGain: 1,
    atlanticDepthGain: 0,
    atlanticVariationGain: 0,
    europeCityGain: 0,
    europeCoastGain: 0,
    europeAtlanticGain: 0,
  },
  recovered: {
    rendererExposure: 1.22,
    ambientLight: 0.39,
    coolFill: 0.98,
    softKey: 1.08,
    rimLight: 2.8,
    cityHaloColor: 0xfff0d6,
    atmosphereColor: 0x1b84ff,
    cityOpacity: 0.88,
    cityHaloOpacity: 0.22,
    cloudOpacity: 0.24,
    atmosphereStrength: 0.09,
    atmosphereScale: 1.442,
    dayGain: 1.38,
    twilightGain: 1.46,
    cityGain: 1.42,
    coastGain: 1.12,
    rimFillGain: 0.58,
    iceGain: 0.66,
    atlanticDepthGain: 0,
    atlanticVariationGain: 0,
    europeCityGain: 0,
    europeCoastGain: 0,
    europeAtlanticGain: 0,
  },
  cityrim: {
    rendererExposure: 1.22,
    ambientLight: 0.4,
    coolFill: 0.94,
    softKey: 1.14,
    rimLight: 3.08,
    cityHaloColor: 0xffd79a,
    atmosphereColor: 0x2a9dff,
    cityOpacity: 0.96,
    cityHaloOpacity: 0.34,
    cloudOpacity: 0.24,
    atmosphereStrength: 0.116,
    atmosphereScale: 1.444,
    dayGain: 1.38,
    twilightGain: 1.5,
    cityGain: 1.56,
    coastGain: 1.18,
    rimFillGain: 0.82,
    iceGain: 0.62,
    atlanticDepthGain: 0,
    atlanticVariationGain: 0,
    europeCityGain: 0,
    europeCoastGain: 0,
    europeAtlanticGain: 0,
  },
  polar: {
    rendererExposure: 1.22,
    ambientLight: 0.4,
    coolFill: 0.94,
    softKey: 1.14,
    rimLight: 3.18,
    cityHaloColor: 0xffd79a,
    atmosphereColor: 0x31a5ff,
    cityOpacity: 0.96,
    cityHaloOpacity: 0.34,
    cloudOpacity: 0.24,
    atmosphereStrength: 0.148,
    atmosphereScale: 1.447,
    dayGain: 1.38,
    twilightGain: 1.5,
    cityGain: 1.56,
    coastGain: 1.18,
    rimFillGain: 0.94,
    iceGain: 0.38,
    atlanticDepthGain: 0,
    atlanticVariationGain: 0,
    europeCityGain: 0,
    europeCoastGain: 0,
    europeAtlanticGain: 0,
  },
  atlantic: {
    rendererExposure: 1.22,
    ambientLight: 0.4,
    coolFill: 0.94,
    softKey: 1.14,
    rimLight: 3.18,
    cityHaloColor: 0xffd79a,
    atmosphereColor: 0x31a5ff,
    cityOpacity: 0.96,
    cityHaloOpacity: 0.34,
    cloudOpacity: 0.24,
    atmosphereStrength: 0.148,
    atmosphereScale: 1.447,
    dayGain: 1.38,
    twilightGain: 1.5,
    cityGain: 1.56,
    coastGain: 1.32,
    rimFillGain: 0.96,
    iceGain: 0.38,
    atlanticDepthGain: 0.28,
    atlanticVariationGain: 0.24,
    europeCityGain: 0,
    europeCoastGain: 0,
    europeAtlanticGain: 0,
  },
  europe: {
    rendererExposure: 1.22,
    ambientLight: 0.4,
    coolFill: 0.94,
    softKey: 1.14,
    rimLight: 3.18,
    cityHaloColor: 0xffd79a,
    atmosphereColor: 0x31a5ff,
    cityOpacity: 0.96,
    cityHaloOpacity: 0.34,
    cloudOpacity: 0.24,
    atmosphereStrength: 0.148,
    atmosphereScale: 1.447,
    dayGain: 1.38,
    twilightGain: 1.5,
    cityGain: 1.56,
    coastGain: 1.32,
    rimFillGain: 0.96,
    iceGain: 0.38,
    atlanticDepthGain: 0.28,
    atlanticVariationGain: 0.24,
    europeCityGain: 0.78,
    europeCoastGain: 0.56,
    europeAtlanticGain: 0.28,
  },
  cityhalo: {
    rendererExposure: 1.22,
    ambientLight: 0.4,
    coolFill: 0.94,
    softKey: 1.14,
    rimLight: 3.18,
    cityHaloColor: 0xffcc84,
    atmosphereColor: 0xf2feff,
    cityOpacity: 0.96,
    cityHaloOpacity: 0.44,
    cloudOpacity: 0.24,
    atmosphereStrength: 0.58,
    atmosphereScale: 1.434,
    dayGain: 1.38,
    twilightGain: 1.5,
    cityGain: 1.56,
    coastGain: 2.3,
    rimFillGain: 1.22,
    iceGain: 0.38,
    atlanticDepthGain: 0.28,
    atlanticVariationGain: 0.24,
    europeCityGain: 0.78,
    europeCoastGain: 0.56,
    europeAtlanticGain: 0.28,
  },
};

const INITIAL_GLOBE_ROTATION = {
  x: 0.34,
  y: -0.78,
  z: -0.025,
};

const DEFAULT_TEXTURE_SET: TextureSetName = "cityhalo";
const DEFAULT_GRADE: GradeName = "cityhalo";
const DEFAULT_ROUTES_MODE: RoutesMode = "on";
const DEFAULT_AIRCRAFT_MODE: AircraftMode = "off";
const AIRCRAFT_MODEL_PATH = "/cinematic/models/deadhead-aircraft-v1.glb";
const AIRCRAFT_CLEARANCE = 0;
const AIRCRAFT_VISUAL_SIZE = 0.132;
const AIRCRAFT_FORWARD_AXIS_CORRECTION = new THREE.Quaternion();
const AIRCRAFT_TRAIL_STEPS = 6;
const AIRCRAFT_TRAIL_STEP = 0.016;
const AIRCRAFT_ROUTE_MIN_SCALE = 0.24;
const AIRCRAFT_ROUTE_MAX_SCALE = 1.24;
const AIRCRAFT_DEBUG_ROUTE = {
  routeIndex: 10,
  routeName: "Lagos -> Dallas",
  progress: 0.01,
  speed: 0.038,
  baseScale: 1,
} satisfies AircraftPlacementConfig & { routeName: string };

const ROUTE_ARCS: RouteArcConfig[] = [
  {
    color: 0x59c9ff,
    glowColor: 0xb4ecff,
    start: { lat: 40.7128, lon: -74.006 },
    end: { lat: 51.5072, lon: -0.1276 },
    altitude: 0.27,
    coreRadius: 0.0053,
    glowRadius: 0.0128,
    opacity: 0.96,
    glowOpacity: 0.34,
  },
  {
    color: 0x6ad1ff,
    glowColor: 0xc7f0ff,
    start: { lat: 42.3601, lon: -71.0589 },
    end: { lat: 40.4168, lon: -3.7038 },
    altitude: 0.25,
    coreRadius: 0.0049,
    glowRadius: 0.0112,
    opacity: 0.82,
    glowOpacity: 0.24,
  },
  {
    color: 0x6bd8ff,
    glowColor: 0xcaf2ff,
    start: { lat: 45.5017, lon: -73.5673 },
    end: { lat: 64.1466, lon: -21.9426 },
    altitude: 0.2,
    coreRadius: 0.0043,
    glowRadius: 0.0094,
    opacity: 0.74,
    glowOpacity: 0.2,
  },
  {
    color: 0xffc56f,
    glowColor: 0xffe0a8,
    start: { lat: 25.7617, lon: -80.1918 },
    end: { lat: -23.5505, lon: -46.6333 },
    altitude: 0.2,
    coreRadius: 0.005,
    glowRadius: 0.0112,
    opacity: 0.86,
    glowOpacity: 0.28,
  },
  {
    color: 0x58beff,
    glowColor: 0xb4ebff,
    start: { lat: 33.749, lon: -84.388 },
    end: { lat: 4.711, lon: -74.0721 },
    altitude: 0.16,
    coreRadius: 0.0044,
    glowRadius: 0.0098,
    opacity: 0.72,
    glowOpacity: 0.19,
  },
  {
    color: 0x58beff,
    glowColor: 0xb4ebff,
    start: { lat: -8.0476, lon: -34.877 },
    end: { lat: 38.7223, lon: -9.1393 },
    altitude: 0.22,
    coreRadius: 0.0045,
    glowRadius: 0.0102,
    opacity: 0.8,
    glowOpacity: 0.24,
  },
  {
    color: 0xffbf72,
    glowColor: 0xffe4b6,
    start: { lat: -23.5505, lon: -46.6333 },
    end: { lat: -33.9249, lon: 18.4241 },
    altitude: 0.22,
    coreRadius: 0.0043,
    glowRadius: 0.0098,
    opacity: 0.72,
    glowOpacity: 0.2,
  },
  {
    color: 0xffc779,
    glowColor: 0xffe5b6,
    start: { lat: 48.8566, lon: 2.3522 },
    end: { lat: 6.5244, lon: 3.3792 },
    altitude: 0.18,
    coreRadius: 0.0043,
    glowRadius: 0.0098,
    opacity: 0.8,
    glowOpacity: 0.22,
  },
  {
    color: 0xffc97b,
    glowColor: 0xffe8bc,
    start: { lat: 38.7223, lon: -9.1393 },
    end: { lat: 5.6037, lon: -0.187 },
    altitude: 0.18,
    coreRadius: 0.0042,
    glowRadius: 0.0094,
    opacity: 0.72,
    glowOpacity: 0.2,
  },
  {
    color: 0x5ac8ff,
    glowColor: 0xc8f3ff,
    start: { lat: 40.4168, lon: -3.7038 },
    end: { lat: 41.8781, lon: -87.6298 },
    altitude: 0.24,
    coreRadius: 0.0042,
    glowRadius: 0.0096,
    opacity: 0.76,
    glowOpacity: 0.2,
  },
  {
    color: 0xffbe68,
    glowColor: 0xffe2ae,
    start: { lat: 6.5244, lon: 3.3792 },
    end: { lat: 32.7767, lon: -96.797 },
    altitude: 0.23,
    coreRadius: 0.0045,
    glowRadius: 0.0103,
    opacity: 0.74,
    glowOpacity: 0.22,
  },
  {
    color: 0x6fdaff,
    glowColor: 0xd4f4ff,
    start: { lat: -33.8688, lon: 151.2093 },
    end: { lat: 21.3099, lon: -157.8581 },
    altitude: 0.18,
    coreRadius: 0.0042,
    glowRadius: 0.0094,
    opacity: 0.68,
    glowOpacity: 0.18,
  },
  {
    color: 0x68d2ff,
    glowColor: 0xd1f3ff,
    start: { lat: -33.4489, lon: -70.6693 },
    end: { lat: -33.8688, lon: 151.2093 },
    altitude: 0.19,
    coreRadius: 0.0041,
    glowRadius: 0.0092,
    opacity: 0.66,
    glowOpacity: 0.17,
  },
  {
    color: 0x72d8ff,
    glowColor: 0xd6f5ff,
    start: { lat: -12.0464, lon: -77.0428 },
    end: { lat: 21.3099, lon: -157.8581 },
    altitude: 0.24,
    coreRadius: 0.0042,
    glowRadius: 0.0096,
    opacity: 0.7,
    glowOpacity: 0.18,
  },
  {
    color: 0x72d9ff,
    glowColor: 0xd5f5ff,
    start: { lat: 32.7767, lon: -96.797 },
    end: { lat: 28.6139, lon: 77.209 },
    altitude: 0.22,
    coreRadius: 0.0042,
    glowRadius: 0.0096,
    opacity: 0.68,
    glowOpacity: 0.18,
  },
  {
    color: 0x63cfff,
    glowColor: 0xc8efff,
    start: { lat: 37.7749, lon: -122.4194 },
    end: { lat: 31.2304, lon: 121.4737 },
    altitude: 0.22,
    coreRadius: 0.0042,
    glowRadius: 0.0096,
    opacity: 0.68,
    glowOpacity: 0.18,
  },
  {
    color: 0x79dcff,
    glowColor: 0xdcf7ff,
    start: { lat: 35.6762, lon: 139.6503 },
    end: { lat: 61.2181, lon: -149.9003 },
    altitude: 0.24,
    coreRadius: 0.0042,
    glowRadius: 0.0096,
    opacity: 0.68,
    glowOpacity: 0.18,
  },
  {
    color: 0xffc97f,
    glowColor: 0xffe8bf,
    start: { lat: 34.0522, lon: -118.2437 },
    end: { lat: -33.8688, lon: 151.2093 },
    altitude: 0.19,
    coreRadius: 0.0041,
    glowRadius: 0.0094,
    opacity: 0.64,
    glowOpacity: 0.17,
  },
  {
    color: 0xffbf6c,
    glowColor: 0xffe3b2,
    start: { lat: 35.6762, lon: 139.6503 },
    end: { lat: -33.8688, lon: 151.2093 },
    altitude: 0.18,
    coreRadius: 0.0041,
    glowRadius: 0.0092,
    opacity: 0.66,
    glowOpacity: 0.17,
  },
  {
    color: 0xffc67b,
    glowColor: 0xffe6bc,
    start: { lat: 19.076, lon: 72.8777 },
    end: { lat: 1.3521, lon: 103.8198 },
    altitude: 0.15,
    coreRadius: 0.0041,
    glowRadius: 0.0092,
    opacity: 0.64,
    glowOpacity: 0.17,
  },
  {
    color: 0x72d9ff,
    glowColor: 0xd9f6ff,
    start: { lat: 1.3521, lon: 103.8198 },
    end: { lat: -33.8688, lon: 151.2093 },
    altitude: 0.18,
    coreRadius: 0.0041,
    glowRadius: 0.0092,
    opacity: 0.64,
    glowOpacity: 0.17,
  },
  {
    color: 0x67d4ff,
    glowColor: 0xd0f4ff,
    start: { lat: 22.3193, lon: 114.1694 },
    end: { lat: 35.6762, lon: 139.6503 },
    altitude: 0.16,
    coreRadius: 0.004,
    glowRadius: 0.009,
    opacity: 0.62,
    glowOpacity: 0.16,
  },
];

export default function LiveGlobeProofPage() {
  const [isGlobeReady, setIsGlobeReady] = useState(false);
  const handleGlobeReady = useCallback(() => setIsGlobeReady(true), []);
  const { textureSetName, gradeName, routesMode, aircraftMode } = useLiveGlobeOverrides();

  return (
    <main className={styles.page} aria-label="Deadhead live globe proof lab">
      <div className={styles.backgroundPlate} />
      <div className={styles.wakeLayer} />
      <LiveGlobeCanvas
        onReady={handleGlobeReady}
        textureSet={TEXTURE_SETS[textureSetName]}
        grade={GRADE_CONFIGS[gradeName]}
        routesEnabled={routesMode === "on"}
        aircraftEnabled={aircraftMode === "on"}
      />
      <div className={styles.topGlowLayer} />
      <div className={styles.vignetteLayer} />
      <div className={`${styles.loadingLayer} ${isGlobeReady ? styles.loadingLayerReady : ""}`} aria-hidden="true">
        <div className={styles.loadingOrb} />
        <div className={styles.loadingLine} />
      </div>
      <h1 className={styles.srOnly}>Live CGTrader Earth globe proof</h1>
    </main>
  );
}

function subscribeToSearchParams(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  return () => window.removeEventListener("popstate", onStoreChange);
}

function getClientSearch() {
  return window.location.search;
}

function getServerSearch() {
  return "";
}

function getTextureSetName(value: string | null): TextureSetName {
  if (
    value === "v2" ||
    value === "v3" ||
    value === "v4" ||
    value === "cityrim" ||
    value === "polar" ||
    value === "atlantic" ||
    value === "europe" ||
    value === "cityhalo"
  ) {
    return value;
  }

  return DEFAULT_TEXTURE_SET;
}

function getGradeName(value: string | null): GradeName {
  if (
    value === "regressed" ||
    value === "recovered" ||
    value === "cityrim" ||
    value === "polar" ||
    value === "atlantic" ||
    value === "europe" ||
    value === "cityhalo"
  ) {
    return value;
  }

  return DEFAULT_GRADE;
}

function getRoutesMode(value: string | null): RoutesMode {
  if (value === "on" || value === "off") {
    return value;
  }

  return DEFAULT_ROUTES_MODE;
}

function getAircraftMode(value: string | null): AircraftMode {
  if (value === "on" || value === "off") {
    return value;
  }

  return DEFAULT_AIRCRAFT_MODE;
}

function useLiveGlobeOverrides() {
  const search = useSyncExternalStore(subscribeToSearchParams, getClientSearch, getServerSearch);
  const params = new URLSearchParams(search);

  return {
    textureSetName: getTextureSetName(params.get("candidate")),
    gradeName: getGradeName(params.get("grade")),
    routesMode: getRoutesMode(params.get("routes")),
    aircraftMode: getAircraftMode(params.get("aircraft")),
  };
}

function LiveGlobeCanvas({
  onReady,
  textureSet,
  grade,
  routesEnabled,
  aircraftEnabled,
}: {
  onReady: () => void;
  textureSet: TextureSet;
  grade: GradeConfig;
  routesEnabled: boolean;
  aircraftEnabled: boolean;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      mount.dataset.webgl = "unavailable";
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
    const clock = new THREE.Clock();
    const globeRig = new THREE.Group();
    let frame = 0;
    let disposed = false;
    const routeDisposables: THREE.BufferGeometry[] = [];
    const routeMaterials: THREE.Material[] = [];
    const routeShaderMaterials: THREE.ShaderMaterial[] = [];
    const aircraftMaterials: THREE.MeshPhongMaterial[] = [];
    const aircraftEntries: AircraftEntry[] = [];

    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = grade.rendererExposure;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    scene.add(globeRig);
    scene.add(new THREE.AmbientLight(0x08182a, grade.ambientLight));

    const coolFill = new THREE.DirectionalLight(0x4aa4ff, grade.coolFill);
    coolFill.position.set(-2.8, 2.15, 3.4);
    scene.add(coolFill);

    const softKey = new THREE.DirectionalLight(0xf3f8ff, grade.softKey);
    softKey.position.set(2.5, 2.7, 4.0);
    scene.add(softKey);

    const rim = new THREE.DirectionalLight(0x1598ff, grade.rimLight);
    rim.position.set(-3.8, 3.4, -2.2);
    scene.add(rim);

    const loadingManager = new THREE.LoadingManager();
    loadingManager.onLoad = () => {
      window.setTimeout(() => {
        if (!disposed) {
          onReady();
        }
      }, 180);
    };
    loadingManager.onError = () => {
      if (!disposed) {
        onReady();
      }
    };

    const textureLoader = new THREE.TextureLoader(loadingManager);
    const loadTexture = (path: string, colorSpace: THREE.ColorSpace = THREE.SRGBColorSpace) => {
      const texture = textureLoader.load(path);
      texture.colorSpace = colorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      return texture;
    };

    const dayMap = loadTexture(textureSet.day);
    const nightMap = loadTexture(textureSet.night);
    const nightHaloMap = loadTexture(textureSet.nightHalo);
    const cloudMap = loadTexture(textureSet.clouds);
    const oceanMaskMap = loadTexture(textureSet.oceanMask, THREE.NoColorSpace);
    const desertMaskMap = loadTexture(textureSet.desertMask, THREE.NoColorSpace);
    const iceMaskMap = loadTexture(textureSet.iceMask, THREE.NoColorSpace);

    const earthMaterial = new THREE.ShaderMaterial({
      uniforms: {
        dayMap: { value: dayMap },
        nightMap: { value: nightMap },
        cloudMap: { value: cloudMap },
        oceanMaskMap: { value: oceanMaskMap },
        desertMaskMap: { value: desertMaskMap },
        iceMaskMap: { value: iceMaskMap },
        lightDirection: { value: new THREE.Vector3(0.28, 0.42, 0.86).normalize() },
        oceanTint: { value: new THREE.Color(0x010f26) },
        dayGain: { value: grade.dayGain },
        twilightGain: { value: grade.twilightGain },
        cityGain: { value: grade.cityGain },
        coastGain: { value: grade.coastGain },
        rimFillGain: { value: grade.rimFillGain },
        iceGain: { value: grade.iceGain },
        atlanticDepthGain: { value: grade.atlanticDepthGain },
        atlanticVariationGain: { value: grade.atlanticVariationGain },
        europeCityGain: { value: grade.europeCityGain },
        europeCoastGain: { value: grade.europeCoastGain },
        europeAtlanticGain: { value: grade.europeAtlanticGain },
      },
      vertexShader: `
        uniform sampler2D dayMap;
        uniform sampler2D oceanMaskMap;
        uniform sampler2D iceMaskMap;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vSpherePosition;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
          vUv = uv;
          vec3 daySample = texture2D(dayMap, uv).rgb;
          vec3 detailSample = texture2D(dayMap, uv + vec2(0.0016, -0.0012)).rgb;
          float oceanMask = texture2D(oceanMaskMap, uv).r;
          float iceMask = texture2D(iceMaskMap, uv).r;
          float landMask = 1.0 - oceanMask;
          float sphereY = normalize(position).y;
          float elevationSignal = max(daySample.g, daySample.r * 0.82);
          float continentLift = pow(smoothstep(0.3, 0.82, elevationSignal), 1.28) * landMask * (1.0 - iceMask * 0.42);
          float dayLuma = dot(daySample, vec3(0.299, 0.587, 0.114));
          float detailLuma = dot(detailSample, vec3(0.299, 0.587, 0.114));
          float terrainMicro = smoothstep(
            0.02,
            0.14,
            abs(dayLuma - detailLuma) + abs(daySample.r - daySample.g) * 0.42 + abs(daySample.g - daySample.b) * 0.18
          ) * landMask * (1.0 - iceMask * 0.35);
          float arcticTerrain = smoothstep(0.46, 0.96, sphereY) * landMask * (terrainMicro * 0.35 + iceMask * 0.95);
          vec3 displaced = position + normal * (continentLift * 0.036 + terrainMicro * 0.019 + iceMask * 0.0075 + arcticTerrain * 0.012);
          vNormal = normalize(normalMatrix * normal);
          vSpherePosition = normalize(displaced);
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D dayMap;
        uniform sampler2D nightMap;
        uniform sampler2D cloudMap;
        uniform sampler2D oceanMaskMap;
        uniform sampler2D desertMaskMap;
        uniform sampler2D iceMaskMap;
        uniform vec3 lightDirection;
        uniform vec3 oceanTint;
        uniform float dayGain;
        uniform float twilightGain;
        uniform float cityGain;
        uniform float coastGain;
        uniform float rimFillGain;
        uniform float iceGain;
        uniform float atlanticDepthGain;
        uniform float atlanticVariationGain;
        uniform float europeCityGain;
        uniform float europeCoastGain;
        uniform float europeAtlanticGain;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vSpherePosition;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
          vec3 day = texture2D(dayMap, vUv).rgb;
          vec4 nightTex = texture2D(nightMap, vUv);
          vec4 cloudTex = texture2D(cloudMap, vUv);
          float oceanMask = texture2D(oceanMaskMap, vUv).r;
          float desertMask = texture2D(desertMaskMap, vUv).r;
          float iceMask = texture2D(iceMaskMap, vUv).r;
          float landMask = 1.0 - oceanMask;
          vec2 texel = vec2(1.0 / 4096.0, 1.0 / 2048.0);
          vec3 dayNorth = texture2D(dayMap, vUv + vec2(0.0, texel.y)).rgb;
          vec3 daySouth = texture2D(dayMap, vUv - vec2(0.0, texel.y)).rgb;
          vec3 dayEast = texture2D(dayMap, vUv + vec2(texel.x, 0.0)).rgb;
          vec3 dayWest = texture2D(dayMap, vUv - vec2(texel.x, 0.0)).rgb;
          float oceanNorth = texture2D(oceanMaskMap, vUv + vec2(0.0, texel.y)).r;
          float oceanSouth = texture2D(oceanMaskMap, vUv - vec2(0.0, texel.y)).r;
          float oceanEast = texture2D(oceanMaskMap, vUv + vec2(texel.x, 0.0)).r;
          float oceanWest = texture2D(oceanMaskMap, vUv - vec2(texel.x, 0.0)).r;
          float coastline = smoothstep(0.06, 0.34, abs(oceanNorth - oceanSouth) + abs(oceanEast - oceanWest)) * landMask;
          float landTextureSignal = (length(dayNorth - daySouth) + length(dayEast - dayWest)) * 0.5;
          float daylight = smoothstep(-0.22, 0.74, dot(normalize(vWorldNormal), lightDirection));
          float nightSide = 1.0 - daylight;
          float sphereY = vSpherePosition.y;
          float topLift = smoothstep(0.12, 0.98, sphereY);
          float cloudBase = max(cloudTex.a, dot(cloudTex.rgb, vec3(0.2126, 0.7152, 0.0722)) * 0.88);
          float cloudSignal = pow(smoothstep(0.36, 0.9, cloudBase), 1.12);
          float oceanDetail = smoothstep(0.1, 0.52, day.b) * oceanMask;
          float oceanSwirl = smoothstep(0.08, 0.44, day.b - day.g * 0.18) * oceanMask;
          float oceanDepthField = smoothstep(0.04, 0.34, day.b - day.g * 0.54) * oceanMask;
          float oceanCurrentField = smoothstep(0.08, 0.4, abs(day.b - day.g) + oceanSwirl * 0.16) * oceanMask;
          vec3 landGrade = day * mix(0.46, 1.0, daylight * 0.7);
          vec3 oceanGrade = mix(oceanTint, vec3(0.024, 0.128, 0.29), oceanDetail * 0.42 + daylight * 0.18 + oceanSwirl * 0.08);
          vec3 darkDay = mix(landGrade, oceanGrade, oceanMask * 0.9);
          darkDay += vec3(0.0, 0.014, 0.034) * oceanDepthField * (0.12 + oceanDetail * 0.22 + daylight * 0.08);
          darkDay -= vec3(0.004, 0.008, 0.016) * oceanCurrentField * (0.16 + oceanSwirl * 0.18 + oceanDetail * 0.08);
          darkDay = mix(darkDay, darkDay * vec3(0.78, 0.8, 0.84), desertMask * 0.48);
          darkDay = mix(darkDay, vec3(0.34, 0.42, 0.52), iceMask * 0.24);
          float coastLift = smoothstep(0.14, 0.44, day.g + day.b * 0.52) * landMask * (1.0 - desertMask * 0.5);
          float landTexture = smoothstep(0.03, 0.2, landTextureSignal) * landMask * (1.0 - desertMask * 0.24);
          vec3 twilightLand = day * vec3(0.72, 0.77, 0.84) * nightSide * (0.26 + coastLift * 0.26 + coastline * 0.14) * twilightGain;
          vec3 twilightOcean = vec3(0.018, 0.084, 0.18) * oceanMask * nightSide * (0.54 + oceanDetail * 0.34) * twilightGain;
          darkDay += twilightLand + twilightOcean;
          darkDay += vec3(0.014, 0.056, 0.126) * oceanSwirl * (0.24 + nightSide * 0.38 + cloudSignal * 0.16);
          darkDay += vec3(0.082, 0.074, 0.066) * landTexture * (0.14 + daylight * 0.56 + topLift * 0.14);
          darkDay -= vec3(0.042, 0.036, 0.03) * landTexture * (0.18 + nightSide * 0.26);
          float polarLandTexture = landTexture * smoothstep(0.42, 0.97, sphereY) * (0.3 + iceMask * 0.9);
          darkDay += vec3(0.11, 0.118, 0.13) * polarLandTexture * (0.16 + daylight * 0.44);
          darkDay -= vec3(0.038, 0.04, 0.046) * polarLandTexture * (0.12 + nightSide * 0.18);
          vec3 continentOutline = vec3(0.76, 0.48, 0.14) * coastline * (0.22 + nightSide * 0.86 + daylight * 0.12) * coastGain;
          darkDay += vec3(0.052, 0.066, 0.078) * coastline * (0.42 + daylight * 0.48) * coastGain;
          darkDay -= vec3(0.006, 0.01, 0.018) * cloudSignal * (0.08 + daylight * 0.12);
          float arcticLift = smoothstep(0.48, 0.97, sphereY);
          float topSpot = arcticLift * (1.0 - smoothstep(0.14, 0.68, length(vSpherePosition.xz)));
          darkDay += vec3(0.08, 0.124, 0.18) * iceMask * (0.12 + topLift * 0.34) * iceGain;
          darkDay += vec3(0.064, 0.094, 0.138) * arcticLift * landMask * (0.24 + iceMask * 0.52 + daylight * 0.16);
          darkDay += vec3(0.032, 0.076, 0.168) * arcticLift * oceanMask * (0.26 + oceanDetail * 0.36 + oceanSwirl * 0.22);
          darkDay += vec3(0.24, 0.25, 0.28) * topSpot * (0.16 + iceMask * 0.88 + landMask * 0.08 + oceanMask * 0.12);
          float atlanticNorth = exp(-(
            pow((vUv.x - 0.372) / 0.132, 2.0) +
            pow((vUv.y - 0.34) / 0.22, 2.0)
          ) * 2.2);
          float atlanticSouth = exp(-(
            pow((vUv.x - 0.408) / 0.168, 2.0) +
            pow((vUv.y - 0.64) / 0.18, 2.0)
          ) * 2.2);
          float atlanticMask = max(atlanticNorth, atlanticSouth) * oceanMask;
          float atlanticWave = 0.5 + 0.5 * sin(vUv.x * 42.0 + vUv.y * 36.0);
          darkDay -= vec3(0.02, 0.026, 0.008) * atlanticMask * atlanticDepthGain;
          darkDay += vec3(0.0, 0.007, 0.02) * atlanticMask * (0.24 + atlanticWave * 0.76) * atlanticVariationGain;
          float europeWest = exp(-(
            pow((vUv.x - 0.49) / 0.05, 2.0) +
            pow((vUv.y - 0.31) / 0.08, 2.0)
          ) * 2.0);
          float europeCore = exp(-(
            pow((vUv.x - 0.538) / 0.065, 2.0) +
            pow((vUv.y - 0.268) / 0.084, 2.0)
          ) * 2.0);
          float europeNorth = exp(-(
            pow((vUv.x - 0.548) / 0.058, 2.0) +
            pow((vUv.y - 0.208) / 0.094, 2.0)
          ) * 2.0);
          float europeSouth = exp(-(
            pow((vUv.x - 0.57) / 0.05, 2.0) +
            pow((vUv.y - 0.335) / 0.072, 2.0)
          ) * 2.0);
          float europeMask = max(max(europeWest, europeCore), max(europeNorth, europeSouth)) * landMask * (1.0 - desertMask * 0.82);
          float eastAtlantic = exp(-(
            pow((vUv.x - 0.492) / 0.09, 2.0) +
            pow((vUv.y - 0.355) / 0.19, 2.0)
          ) * 2.15) * oceanMask;
          float europeAtlanticWave = 0.5 + 0.5 * sin(vUv.x * 54.0 - vUv.y * 31.0);
          darkDay -= vec3(0.012, 0.016, 0.006) * eastAtlantic * europeAtlanticGain;
          darkDay += vec3(0.0, 0.004, 0.014) * eastAtlantic * (0.24 + europeAtlanticWave * 0.76) * europeAtlanticGain;
          darkDay += vec3(0.024, 0.03, 0.038) * coastline * europeMask * (0.12 + nightSide * 0.28 + daylight * 0.08) * europeCoastGain;
          darkDay += vec3(0.02, 0.046, 0.09) * (0.3 + oceanMask * 0.28 + landMask * 0.2);
          vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
          float fresnel = 1.0 - max(dot(normalize(vNormal), viewDirection), 0.0);
          float rim = pow(fresnel, 3.7);
          float thinRim = pow(fresnel, 10.8);
          float upperBias = smoothstep(-0.12, 0.9, sphereY);
          float topCrown = smoothstep(0.58, 0.98, sphereY);
          vec3 blueFill = vec3(0.022, 0.19, 0.44) * (0.06 + rim * 0.13 + thinRim * 0.22 + topLift * 0.12 + topCrown * 0.14) * (0.04 + upperBias * 0.96) * rimFillGain;
          float cityMask = nightTex.a;
          float cityCore = smoothstep(0.18, 0.92, max(max(nightTex.r, nightTex.g), nightTex.b));
          float europeCityLift = 1.0 + europeMask * (0.18 + coastline * 0.18 + cityCore * 0.12) * europeCityGain;
          vec3 coastalAmber = vec3(0.34, 0.2, 0.07) * coastline * nightSide * 0.42 * cityGain;
          coastalAmber += vec3(0.12, 0.074, 0.024) * coastline * europeMask * nightSide * europeCityGain;
          vec3 cities = (nightTex.rgb * cityMask * (1.34 + cityCore * 1.02 + coastline * 0.6) * (1.08 + nightSide * 1.36) * europeCityLift + coastalAmber) * cityGain;
          vec3 color = darkDay * (dayGain + daylight * 0.24) + blueFill + continentOutline * 0.62 + cities;
          float bottomFade = 1.0 - smoothstep(-0.46, 0.34, sphereY);
          float oceanBottomFade = bottomFade * (0.38 + oceanMask * 0.62);
          float landBottomFade = bottomFade * landMask * 0.18;
          color *= mix(vec3(1.0), vec3(0.16, 0.18, 0.26), oceanBottomFade * 0.92);
          color *= mix(vec3(1.0), vec3(0.84, 0.85, 0.9), landBottomFade);
          color -= vec3(0.028, 0.032, 0.038) * oceanBottomFade * (0.6 + oceanMask * 0.28);
          color += vec3(0.02, 0.016, 0.012) * landMask * bottomFade * 0.22;
          color = pow(max(color, vec3(0.0)), vec3(0.94));
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    const cityMaterial = new THREE.MeshBasicMaterial({
      map: nightMap,
      color: new THREE.Color(0xffffff),
      transparent: true,
      opacity: grade.cityOpacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const cityHaloMaterial = new THREE.MeshBasicMaterial({
      map: nightHaloMap,
      color: new THREE.Color(grade.cityHaloColor),
      transparent: true,
      opacity: grade.cityHaloOpacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const cloudMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        cloudMap: { value: cloudMap },
        lightDirection: { value: new THREE.Vector3(0.28, 0.42, 0.86).normalize() },
        opacity: { value: Math.min(grade.cloudOpacity + 0.1, 0.3) },
      },
      vertexShader: `
        uniform sampler2D cloudMap;
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        varying float vDensity;

        void main() {
          vUv = uv;
          vec4 sampleColor = texture2D(cloudMap, uv);
          vec4 detailSample = texture2D(cloudMap, uv + vec2(0.0026, -0.0018));
          vec4 detailSampleB = texture2D(cloudMap, uv + vec2(-0.0032, 0.0024));
          float luminance = dot(sampleColor.rgb, vec3(0.2126, 0.7152, 0.0722));
          float detailLuminance = dot(detailSample.rgb, vec3(0.2126, 0.7152, 0.0722));
          float detailLuminanceB = dot(detailSampleB.rgb, vec3(0.2126, 0.7152, 0.0722));
          float baseSignal = max(sampleColor.a * 1.18, luminance * 0.9);
          float detailSignal = max(
            max(detailSample.a * 1.08, detailLuminance * 0.88),
            max(detailSampleB.a * 1.08, detailLuminanceB * 0.88)
          );
          float density = pow(smoothstep(0.24, 0.78, baseSignal), 1.08);
          float billow = pow(smoothstep(0.34, 0.9, mix(baseSignal, detailSignal, 0.42)), 1.3);
          vec3 displaced = position + normal * (density * 0.018 + billow * 0.03);
          vDensity = density;
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D cloudMap;
        uniform vec3 lightDirection;
        uniform float opacity;
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        varying float vDensity;

        void main() {
          vec4 cloudSample = texture2D(cloudMap, vUv);
          vec4 cloudSampleB = texture2D(cloudMap, vUv + vec2(0.0022, -0.0014));
          vec4 cloudSampleC = texture2D(cloudMap, vUv + vec2(-0.0018, 0.0026));
          vec4 cloudSampleD = texture2D(cloudMap, vUv + vec2(0.0036, 0.0018));
          float luminanceA = dot(cloudSample.rgb, vec3(0.2126, 0.7152, 0.0722));
          float luminanceB = dot(cloudSampleB.rgb, vec3(0.2126, 0.7152, 0.0722));
          float luminanceC = dot(cloudSampleC.rgb, vec3(0.2126, 0.7152, 0.0722));
          float luminanceD = dot(cloudSampleD.rgb, vec3(0.2126, 0.7152, 0.0722));
          float baseSignal = max(cloudSample.a * 1.16, luminanceA * 0.9);
          float detailSignal = max(
            max(cloudSampleB.a * 1.08, luminanceB * 0.9),
            max(max(cloudSampleC.a * 1.08, luminanceC * 0.9), max(cloudSampleD.a * 1.08, luminanceD * 0.9))
          );
          float density = pow(smoothstep(0.24, 0.78, baseSignal), 1.06);
          float veil = smoothstep(0.16, 0.56, baseSignal);
          float core = pow(smoothstep(0.34, 0.88, detailSignal), 1.3);
          float body = max(density, veil * 0.78);
          float ridge = smoothstep(0.48, 0.92, detailSignal) * (1.0 - veil * 0.18);
          float turbulence = abs(detailSignal - baseSignal);
          vec3 normal = normalize(vWorldNormal);
          vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
          float diffuse = max(dot(normal, lightDirection), 0.0);
          float fresnel = pow(1.0 - max(dot(normal, viewDirection), 0.0), 1.9);
          float shadowPocket = smoothstep(0.18, 0.7, body - core * 0.22);
          vec3 darkTone = vec3(0.28, 0.31, 0.37);
          vec3 midTone = vec3(0.56, 0.6, 0.67);
          vec3 brightTone = vec3(0.9, 0.93, 0.97);
          vec3 color = mix(darkTone, midTone, body * (0.42 + diffuse * 0.18));
          color = mix(color, brightTone, core * (0.22 + diffuse * 0.7) + ridge * 0.1 + veil * 0.04 + fresnel * 0.05);
          color -= vec3(0.12, 0.13, 0.15) * shadowPocket * (0.42 + (1.0 - diffuse) * 0.66 + turbulence * 0.34);
          color += vec3(0.03, 0.038, 0.056) * vDensity * fresnel * 0.22;
          float alpha = max(core * (opacity + diffuse * 0.04), veil * opacity * 0.28) + body * fresnel * 0.025;
          if (alpha < 0.03) discard;
          gl_FragColor = vec4(color, alpha);
        }
      `,
    });

    const atmosphereMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      uniforms: {
        glowColor: { value: new THREE.Color(grade.atmosphereColor) },
        strength: { value: grade.atmosphereStrength },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vSpherePosition;
        varying vec3 vWorldPosition;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vSpherePosition = normalize(position);
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float strength;
        varying vec3 vNormal;
        varying vec3 vSpherePosition;
        varying vec3 vWorldPosition;

        void main() {
          vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
          float sphereY = vSpherePosition.y;
          float fresnel = 1.0 - max(dot(vNormal, viewDirection), 0.0);
          float rim = pow(fresnel, 34.0);
          float thinRim = pow(fresnel, 16.5);
          float topEdge = smoothstep(0.16, 0.98, sphereY);
          float upperBias = smoothstep(-0.1, 0.94, sphereY);
          float lowerFade = smoothstep(-0.82, -0.02, sphereY);
          float crown = smoothstep(0.68, 0.98, sphereY);
          float crownCore = crown * (1.0 - smoothstep(0.1, 0.58, length(vSpherePosition.xz)));
          vec3 haloColor = mix(glowColor, vec3(0.99, 0.998, 1.0), crownCore * 0.76 + topEdge * 0.22);
          float haloAlpha = (
            rim * strength * (0.72 + topEdge * 1.62) +
            thinRim * strength * 0.08 +
            crownCore * strength * 1.12 +
            crown * strength * 0.16
          ) * (0.38 + upperBias * 0.62) * lowerFade;
          gl_FragColor = vec4(haloColor, haloAlpha);
        }
      `,
    });

    const createRouteMaterial = ({
      color,
      opacity,
      additive,
    }: {
      color: number;
      opacity: number;
      additive: boolean;
    }) =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: true,
        blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
        uniforms: {
          routeColor: { value: new THREE.Color(color) },
          opacity: { value: opacity },
          globeCenter: { value: new THREE.Vector3() },
        },
        vertexShader: `
          varying vec3 vWorldPosition;
          varying vec2 vUv;

          void main() {
            vUv = uv;
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPosition;
          }
        `,
        fragmentShader: `
          uniform vec3 routeColor;
          uniform float opacity;
          uniform vec3 globeCenter;
          varying vec3 vWorldPosition;
          varying vec2 vUv;

          void main() {
            vec3 cameraDirection = normalize(cameraPosition - globeCenter);
            float hemisphereFacing = dot(normalize(vWorldPosition - globeCenter), cameraDirection);
            float front = smoothstep(-0.08, 0.18, hemisphereFacing);
            float edgeFade = sin(vUv.x * 3.14159265);
            edgeFade = pow(max(edgeFade, 0.0), 0.72);
            float alpha = opacity * edgeFade * mix(0.22, 1.0, front);
            if (alpha < 0.01) discard;
            gl_FragColor = vec4(routeColor, alpha);
          }
        `,
      });

    const latLonToVector3 = (lat: number, lon: number, radius: number) => {
      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lon + 180);
      return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta),
      );
    };

    const slerpDirection = (start: THREE.Vector3, end: THREE.Vector3, t: number) => {
      const dot = THREE.MathUtils.clamp(start.dot(end), -0.9999, 0.9999);
      const theta = Math.acos(dot) * t;
      const relative = end
        .clone()
        .sub(start.clone().multiplyScalar(dot))
        .normalize();

      return start
        .clone()
        .multiplyScalar(Math.cos(theta))
        .add(relative.multiplyScalar(Math.sin(theta)))
        .normalize();
    };

    const createRouteCurve = (route: RouteArcConfig) => {
      const startDirection = latLonToVector3(route.start.lat, route.start.lon, 1).normalize();
      const endDirection = latLonToVector3(route.end.lat, route.end.lon, 1).normalize();
      const points: THREE.Vector3[] = [];
      for (let index = 0; index <= 72; index += 1) {
        const t = index / 72;
        const direction = slerpDirection(startDirection, endDirection, t);
        const lift = 1.454 + Math.sin(Math.PI * t) * route.altitude;
        points.push(direction.multiplyScalar(lift));
      }
      return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.28);
    };

    const aircraftUp = new THREE.Vector3();
    const aircraftPoint = new THREE.Vector3();
    const aircraftTangent = new THREE.Vector3();
    const aircraftRight = new THREE.Vector3();
    const aircraftForward = new THREE.Vector3();
    const aircraftLookTarget = new THREE.Vector3();
    const aircraftBasis = new THREE.Matrix4();
    const aircraftWorldPosition = new THREE.Vector3();
    const globeToCamera = new THREE.Vector3();
    const aircraftNormal = new THREE.Vector3();
    const aircraftFutureTangent = new THREE.Vector3();
    const aircraftTrailPoint = new THREE.Vector3();
    const aircraftTrailNormal = new THREE.Vector3();

    const applyAircraftPose = (
      entry: AircraftEntry,
      progress: number,
      camera: THREE.PerspectiveCamera,
    ) => {
      const clampedProgress = THREE.MathUtils.euclideanModulo(progress, 1);
      entry.routeEntry.curve.getPointAt(clampedProgress, aircraftPoint);
      entry.routeEntry.curve.getTangentAt(clampedProgress, aircraftTangent).normalize();
      entry.routeEntry.curve.getTangentAt(THREE.MathUtils.euclideanModulo(clampedProgress + 0.008, 1), aircraftFutureTangent).normalize();
      aircraftUp.copy(aircraftPoint).normalize();
      aircraftLookTarget.copy(aircraftPoint).add(aircraftTangent);
      aircraftForward.copy(aircraftLookTarget).sub(aircraftPoint).normalize();
      aircraftRight.crossVectors(aircraftUp, aircraftForward).normalize();
      aircraftForward.crossVectors(aircraftRight, aircraftUp).normalize();
      aircraftBasis.makeBasis(aircraftRight, aircraftUp, aircraftForward);
      entry.anchor.position.copy(aircraftPoint).addScaledVector(aircraftUp, AIRCRAFT_CLEARANCE);
      entry.pose.quaternion.setFromRotationMatrix(aircraftBasis);
      const bankAmount = THREE.MathUtils.clamp(
        aircraftFutureTangent.sub(aircraftTangent).dot(aircraftRight) * 4.5,
        -0.18,
        0.18,
      );
      entry.visual.quaternion.copy(AIRCRAFT_FORWARD_AXIS_CORRECTION);
      entry.visual.rotateZ(bankAmount);

      entry.anchor.getWorldPosition(aircraftWorldPosition);
      globeToCamera.copy(camera.position).sub(globeRig.position).normalize();
      aircraftNormal.copy(aircraftWorldPosition).sub(globeRig.position).normalize();
      const front = THREE.MathUtils.smoothstep(aircraftNormal.dot(globeToCamera), -0.12, 0.24);
      const visibleHeight = THREE.MathUtils.smoothstep(1.46, 1.66, aircraftPoint.length());
      const depthPresence = THREE.MathUtils.clamp(front * 0.82 + visibleHeight * 0.18, 0, 1);
      const routeCenterPresence = Math.pow(Math.max(Math.sin(clampedProgress * Math.PI), 0), 1.16);
      const routeProgressScale = THREE.MathUtils.lerp(
        AIRCRAFT_ROUTE_MIN_SCALE,
        AIRCRAFT_ROUTE_MAX_SCALE,
        routeCenterPresence,
      );
      const depthScale = THREE.MathUtils.lerp(0.82, 1.34, depthPresence) * entry.baseScale;
      entry.anchor.scale.setScalar(depthScale * routeProgressScale);
      const opacity = THREE.MathUtils.lerp(0.22, 0.98, depthPresence);
      for (const material of entry.materials) {
        material.opacity = opacity;
      }
      for (const [index, trailPoint] of entry.trailPoints.entries()) {
        const trailProgress = THREE.MathUtils.euclideanModulo(clampedProgress - (index + 1) * AIRCRAFT_TRAIL_STEP, 1);
        entry.routeEntry.curve.getPointAt(trailProgress, aircraftTrailPoint);
        aircraftTrailNormal.copy(aircraftTrailPoint).normalize();
        trailPoint.position.copy(aircraftTrailPoint).addScaledVector(aircraftTrailNormal, 0.003);
        const trailMaterial = trailPoint.material as THREE.MeshBasicMaterial;
        trailMaterial.opacity = opacity * THREE.MathUtils.lerp(0.08, 0.012, index / Math.max(entry.trailPoints.length - 1, 1));
      }
    };

    const buildAircraftModel = (source: THREE.Object3D) => {
      const normalizedRoot = source.clone(true);
      const materials: THREE.MeshPhongMaterial[] = [];
      normalizedRoot.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) {
          return;
        }

        const material = new THREE.MeshPhongMaterial({
          color: new THREE.Color(0xf7fbff),
          specular: new THREE.Color(0xffffff),
          shininess: 54,
          transparent: true,
          opacity: 1,
        });
        aircraftMaterials.push(material);
        materials.push(material);
        child.castShadow = false;
        child.receiveShadow = false;
        child.renderOrder = 10;
        child.material = material;
      });

      const bounds = new THREE.Box3().setFromObject(normalizedRoot);
      const size = bounds.getSize(new THREE.Vector3());
      const maxDimension = Math.max(size.x, size.y, size.z, 1e-4);
      normalizedRoot.scale.setScalar(AIRCRAFT_VISUAL_SIZE / maxDimension);
      normalizedRoot.updateMatrixWorld(true);
      const centeredBounds = new THREE.Box3().setFromObject(normalizedRoot);
      const centeredPosition = centeredBounds.getCenter(new THREE.Vector3());
      const centeredSize = centeredBounds.getSize(new THREE.Vector3());
      normalizedRoot.position.sub(centeredPosition);

      const visual = new THREE.Group();
      visual.name = "aircraft-visual";
      visual.quaternion.copy(AIRCRAFT_FORWARD_AXIS_CORRECTION);
      visual.add(normalizedRoot);
      return { visual, materials, centeredSize };
    };

    const attachAircraftToRoutes = (routeGroup: THREE.Group, routeEntries: RouteCurveEntry[]) => {
      const aircraftLoader = new GLTFLoader(loadingManager);
      aircraftLoader.load(AIRCRAFT_MODEL_PATH, (gltf) => {
        if (disposed) {
          return;
        }

        const aircraftRig = new THREE.Group();
        aircraftRig.name = "aircraft-rig";

        const routeEntry = routeEntries.find((entry) => entry.routeIndex === AIRCRAFT_DEBUG_ROUTE.routeIndex);
        if (!routeEntry) {
          routeGroup.add(aircraftRig);
          return;
        }

        const { visual, materials } = buildAircraftModel(gltf.scene);

        const aircraftAnchor = new THREE.Group();
        aircraftAnchor.name = "aircraft-anchor";
        const aircraftPose = new THREE.Group();
        aircraftPose.name = "aircraft-pose";
        aircraftPose.add(visual);
        aircraftAnchor.add(aircraftPose);
        aircraftRig.add(aircraftAnchor);

        const trailPoints: THREE.Mesh[] = [];
        for (let index = 0; index < AIRCRAFT_TRAIL_STEPS; index += 1) {
          const trailGeometry = new THREE.SphereGeometry(THREE.MathUtils.lerp(0.005, 0.002, index / Math.max(AIRCRAFT_TRAIL_STEPS - 1, 1)), 10, 10);
          const trailMaterial = new THREE.MeshBasicMaterial({
            color: 0xd8e7ff,
            transparent: true,
            opacity: 0.05,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          });
          const trailPointMesh = new THREE.Mesh(trailGeometry, trailMaterial);
          trailPointMesh.renderOrder = 11;
          trailPoints.push(trailPointMesh);
          routeDisposables.push(trailGeometry);
          routeMaterials.push(trailMaterial);
          routeGroup.add(trailPointMesh);
        }
        aircraftEntries.push({
          anchor: aircraftAnchor,
          pose: aircraftPose,
          visual,
          routeEntry,
          progress: AIRCRAFT_DEBUG_ROUTE.progress,
          speed: AIRCRAFT_DEBUG_ROUTE.speed,
          baseScale: AIRCRAFT_DEBUG_ROUTE.baseScale,
          materials,
          trailPoints,
        });
        window.console.info("[live-globe-proof] aircraft motion debug", {
          route: AIRCRAFT_DEBUG_ROUTE.routeName,
          initialT: AIRCRAFT_DEBUG_ROUTE.progress,
          speed: AIRCRAFT_DEBUG_ROUTE.speed,
          aircraftModelPath: AIRCRAFT_MODEL_PATH,
        });
        routeGroup.add(aircraftRig);
      });
    };

    const createRouteGroup = () => {
      const group = new THREE.Group();
      group.name = "route-arcs";
      const routeEntries: RouteCurveEntry[] = [];

      for (const [routeIndex, route] of ROUTE_ARCS.entries()) {
        const curve = createRouteCurve(route);
        routeEntries.push({ routeIndex, routeConfig: route, curve });

        const glowGeometry = new THREE.TubeGeometry(curve, 160, route.glowRadius, 10, false);
        const glowMaterial = createRouteMaterial({
          color: route.glowColor,
          opacity: route.glowOpacity,
          additive: true,
        });
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        glowMesh.renderOrder = 8;

        const coreGeometry = new THREE.TubeGeometry(curve, 160, route.coreRadius, 10, false);
        const coreMaterial = createRouteMaterial({
          color: route.color,
          opacity: route.opacity,
          additive: true,
        });
        const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
        coreMesh.renderOrder = 9;

        routeDisposables.push(glowGeometry, coreGeometry);
        routeMaterials.push(glowMaterial, coreMaterial);
        routeShaderMaterials.push(glowMaterial, coreMaterial);
        group.add(glowMesh, coreMesh);
      }

      return { group, routeEntries };
    };

    const addGlobeSphere = () => {
      const geometry = new THREE.SphereGeometry(1.42, 192, 112);
      const earth = new THREE.Mesh(geometry, earthMaterial);
      const cities = new THREE.Mesh(new THREE.SphereGeometry(1.424, 192, 112), cityMaterial);
      const cityHalo = new THREE.Mesh(new THREE.SphereGeometry(1.43, 192, 112), cityHaloMaterial);
      const cloudRig = new THREE.Group();
      const clouds = new THREE.Mesh(new THREE.SphereGeometry(1.438, 192, 112), cloudMaterial);
      clouds.name = "cloud-base";
      const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(grade.atmosphereScale, 192, 112), atmosphereMaterial);
      const routeGroup = routesEnabled ? createRouteGroup() : null;
      cloudRig.add(clouds);
      cloudRig.name = "cloud-rig";
      globeRig.add(earth, cities, cityHalo, cloudRig, atmosphere);
      if (routeGroup) {
        globeRig.add(routeGroup.group);
        if (aircraftEnabled) {
          attachAircraftToRoutes(routeGroup.group, routeGroup.routeEntries);
        }
      }
    };

    addGlobeSphere();

    const resize = () => {
      const rect = mount.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();

      const isMobile = rect.width < 760;
      const cameraZ = isMobile ? 6.35 : 6.15;
      const visibleHeight = 2 * cameraZ * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
      const visibleWidth = visibleHeight * camera.aspect;
      const targetDiameter = isMobile ? Math.min(visibleWidth * 0.84, visibleHeight * 0.5) : visibleHeight * 0.61;
      const scale = THREE.MathUtils.clamp(targetDiameter / 2.84, isMobile ? 0.37 : 0.66, isMobile ? 0.56 : 0.84);
      camera.position.set(0, isMobile ? 0.02 : 0.04, cameraZ);
      globeRig.position.set(0, isMobile ? 0.66 : 0.04, 0);
      globeRig.scale.setScalar(scale);
      for (const material of routeShaderMaterials) {
        material.uniforms.globeCenter.value.copy(globeRig.position);
      }
    };

    const animate = () => {
      const delta = clock.getDelta();
      const elapsed = clock.elapsedTime;
      const cloudRig = globeRig.getObjectByName("cloud-rig");
      if (!prefersReducedMotion) {
        globeRig.rotation.y = INITIAL_GLOBE_ROTATION.y + elapsed * 0.0118;
        globeRig.rotation.x = INITIAL_GLOBE_ROTATION.x + Math.sin(elapsed * 0.28) * 0.003;
        globeRig.rotation.z = INITIAL_GLOBE_ROTATION.z;
        for (const material of routeShaderMaterials) {
          material.uniforms.globeCenter.value.copy(globeRig.position);
        }
        for (const entry of aircraftEntries) {
          entry.progress = THREE.MathUtils.euclideanModulo(entry.progress + entry.speed * delta, 1);
          applyAircraftPose(entry, entry.progress, camera);
        }
        if (cloudRig) {
          cloudRig.rotation.y = elapsed * 0.0028;
          cloudRig.rotation.x = Math.sin(elapsed * 0.09) * 0.005;
          cloudRig.rotation.z = Math.cos(elapsed * 0.07) * 0.002;
          const cloudBase = cloudRig.getObjectByName("cloud-base");
          if (cloudBase) {
            cloudBase.rotation.y = -elapsed * 0.0011;
            cloudBase.rotation.x = Math.sin(elapsed * 0.12) * 0.006;
            cloudBase.rotation.z = Math.cos(elapsed * 0.08) * 0.003;
          }
        }
      } else {
        globeRig.rotation.set(INITIAL_GLOBE_ROTATION.x, INITIAL_GLOBE_ROTATION.y, INITIAL_GLOBE_ROTATION.z);
        for (const entry of aircraftEntries) {
          applyAircraftPose(entry, entry.progress, camera);
        }
        if (cloudRig) {
          cloudRig.rotation.set(0, 0, 0);
          const cloudBase = cloudRig.getObjectByName("cloud-base");
          if (cloudBase) {
            cloudBase.rotation.set(0, 0, 0);
          }
        }
      }

      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    animate();

    return () => {
      disposed = true;
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(frame);
      renderer.dispose();
      dayMap.dispose();
      nightMap.dispose();
      nightHaloMap.dispose();
      cloudMap.dispose();
      oceanMaskMap.dispose();
      desertMaskMap.dispose();
      iceMaskMap.dispose();
      earthMaterial.dispose();
      cityMaterial.dispose();
      cityHaloMaterial.dispose();
      cloudMaterial.dispose();
      atmosphereMaterial.dispose();
      for (const geometry of routeDisposables) {
        geometry.dispose();
      }
      for (const material of routeMaterials) {
        material.dispose();
      }
      for (const material of aircraftMaterials) {
        material.dispose();
      }
      mount.removeChild(renderer.domElement);
    };
  }, [aircraftEnabled, grade, onReady, routesEnabled, textureSet]);

  return <div ref={mountRef} className={styles.canvasMount} aria-hidden="true" />;
}
