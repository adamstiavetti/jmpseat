"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import { PerfHud } from "@/src/components/performance/PerfHud";
import {
  type QualityTier,
  type ScrollPhase,
  getWebglPerfDebugFlagsSnapshot,
  initWebglPerfMonitor,
  reportWebglFrame,
  setWebglPerfSceneState,
  subscribeWebglPerfDebugFlags,
} from "@/src/lib/performance/webglPerfMonitor";
import {
  getHeroLaunchSpawnFollow,
  getHeroReturnLinearProgress,
  shouldResumeHeroLaunchFromReturn,
  shouldResumeInterruptedAutoComplete,
  shouldKeepInterruptedTransitionTicking,
  shouldScrubHeroReturnWithScroll,
  shouldStartHeroReturn,
} from "@/src/lib/scroll/heroFlightControl";
import { applyReverseScrubStep, updateReverseActivationIntent } from "@/src/lib/scroll/autoRewindIntent";
import {
  getEarlyCanvasOpacity,
  getEarlyTransitionOnrampFactor,
  getEarlyTransitionOnrampStrength,
} from "@/src/lib/scroll/transitionOnramp";
import {
  GLASS_CARD_HERO_ENTRY_END_PROGRESS,
  GLASS_CARD_HERO_ENTRY_START_PROGRESS,
  GLASS_CARD_RISE_START_PROGRESS,
  getGlassCardEntryLocalPoint,
  getGlassCardFinalTransform,
  getGlassCardReconnectControlPoints,
  getGlassCardRecoveryDropPath,
  getGlassCardRecoveryPath,
  getGlassCardRecoverySequence,
  getGlassCardTransitionState,
  shouldDelayGlassCardHeroFlight,
} from "@/src/lib/scroll/glassCardTransition";
import { getLiveGlobeTransitionShotState } from "@/src/lib/scroll/liveGlobeTransitionPlan";
import styles from "./page.module.css";

type TextureSetName = "v2" | "v3" | "v4" | "cityrim" | "polar" | "atlantic" | "europe" | "cityhalo";
type GradeName = "regressed" | "recovered" | "cityrim" | "polar" | "atlantic" | "europe" | "cityhalo";
type RoutesMode = "on" | "off";
type AircraftMode = "on" | "off";
type ToggleMode = "on" | "off";
type ForcedQuality = "mobile" | "desktop" | null;

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
  initialT: number;
  speed: number;
  scaleMultiplier: number;
  visibilityBias: number;
  role: "hero" | "support";
  routeId: string;
};

type RouteCurveEntry = {
  routeIndex: number;
  routeConfig: RouteArcConfig;
  curve: THREE.CatmullRomCurve3;
  midpoint: THREE.Vector3;
};

type AircraftEntry = {
  anchor: THREE.Group;
  pose: THREE.Group;
  visual: THREE.Group;
  config: AircraftPlacementConfig;
  routeEntry: RouteCurveEntry;
  routeGlowColor: THREE.Color;
  progress: number;
  bank: number;
  materials: THREE.MeshPhongMaterial[];
  glowMaterials: THREE.Material[];
  trailPoints: THREE.Object3D[];
  revealScale: number;
  revealOpacity: number;
  assignmentOpacity: number;
  assignmentLockUntil: number;
  pendingRouteEntry: RouteCurveEntry | null;
};

type HeroFlightMode = "ROUTE_IDLE" | "HERO_TRANSITION" | "JOURNEY_READY" | "HERO_RETURN";

type HeroFlightController = {
  mode: HeroFlightMode;
  sourceEntry: AircraftEntry | null;
  actor: AircraftEntry | null;
  launchCurve: THREE.Curve<THREE.Vector3> | null;
  returnCurve: THREE.Curve<THREE.Vector3> | null;
  routeProgress: number;
  snapshotScale: number;
  snapshotOpacity: number;
  launchStartTime: number;
  returnStartTime: number;
  transitionProgress: number;
  resumedFromCurrentPose: boolean;
  glassRecoveryMode: boolean;
  glassDropStartTime: number;
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

const GLOBE_INTERACTION = {
  dragSensitivity: 0.0065,
  inertiaDamping: 4.8,
  returnDamping: 0.8,
  minPitch: -0.92,
  maxPitch: 0.92,
} as const;

const DEFAULT_TEXTURE_SET: TextureSetName = "cityhalo";
const DEFAULT_GRADE: GradeName = "cityhalo";
const DEFAULT_ROUTES_MODE: RoutesMode = "on";
const DEFAULT_AIRCRAFT_MODE: AircraftMode = "on";
const AIRCRAFT_MODEL_PATH = "/cinematic/models/deadhead-aircraft-v1.glb";
const GLASS_CARD_MODEL_PATH = "/cinematic/models/two-piece-cut-glass-card-ffc56f.glb";
const AIRCRAFT_CLEARANCE = 0;
const AIRCRAFT_VISUAL_SIZE = 0.132;
const AIRCRAFT_FORWARD_AXIS_CORRECTION = new THREE.Quaternion();
const AIRCRAFT_TRAIL_STEPS = 6;
const AIRCRAFT_TRAIL_STEP = 0.016;
const HERO_CONTRAIL_STEPS = 18;
const HERO_CONTRAIL_STEP = 0.026;
const AIRCRAFT_ROUTE_MIN_SCALE = 0.24;
const AIRCRAFT_ROUTE_MAX_SCALE = 1.24;
const AIRCRAFT_ROUTE_COVERAGE_RATIO = 0.8;
const HERO_LAUNCH_RESET_PROGRESS = 0.18;
const HERO_LAUNCH_DURATION_SECONDS = 4.35;
const HERO_RETURN_DURATION_SECONDS = 5;
const ORB_SHELL_MODE_START = 0.68;
const ORB_SHELL_MODE_FULL = 0.84;
const MOBILE_SUPPORT_AIRCRAFT_COUNT = 6;
const DESKTOP_SUPPORT_AIRCRAFT_COUNT = 9;
const MOBILE_SUPPORT_TRAIL_STEPS = 0;
const DESKTOP_SUPPORT_TRAIL_STEPS = 1;
const SUPPORT_ROUTE_SCAN_INTERVAL_SECONDS = 0.08;
const SUPPORT_ROUTE_ASSIGNMENT_LOCK_SECONDS = 0.18;
const SUPPORT_ASSIGNMENT_FADE_OUT_PER_SECOND = 28;
const SUPPORT_ASSIGNMENT_FADE_IN_PER_SECOND = 24;
const SUPPORT_ROUTE_MIN_FRONT = -0.03;
const SUPPORT_ROUTE_KEEP_FRONT = 0.04;

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

function buildAircraftTrafficConfigs(routes: RouteArcConfig[]) {
  const routeCount = routes.length;
  if (routeCount === 0) {
    return [] as AircraftPlacementConfig[];
  }

  const desiredCount = Math.max(4, Math.min(routeCount, Math.round(routeCount * AIRCRAFT_ROUTE_COVERAGE_RATIO)));
  const spacing = routeCount / desiredCount;
  const selectedRouteIndices: number[] = [];

  for (let slot = 0; slot < desiredCount; slot += 1) {
    let routeIndex = Math.floor(slot * spacing);
    while (selectedRouteIndices.includes(routeIndex)) {
      routeIndex = (routeIndex + 1) % routeCount;
    }
    selectedRouteIndices.push(routeIndex);
  }

  return selectedRouteIndices.map((routeIndex, slot) => {
    const phase = THREE.MathUtils.euclideanModulo(routeIndex * 0.173 + slot * 0.127, 1);
    const initialT = THREE.MathUtils.euclideanModulo(0.08 + phase * 0.84, 1);
    const role = routeIndex === 0 ? "hero" : "support";
    return {
      routeId: `route-${routeIndex}`,
      routeIndex,
      initialT,
      speed: 0.0105 + (slot % 5) * 0.0012,
      scaleMultiplier: role === "hero" ? 1.08 : 0.72 + (slot % 4) * 0.05,
      visibilityBias: role === "hero" ? 0.2 : -0.02 + (slot % 6) * 0.028,
      role,
    } satisfies AircraftPlacementConfig;
  });
}

const AIRCRAFT_TRAFFIC = buildAircraftTrafficConfigs(ROUTE_ARCS);

function getSupportAircraftPoolSize(isMobileLayout: boolean) {
  return isMobileLayout ? MOBILE_SUPPORT_AIRCRAFT_COUNT : DESKTOP_SUPPORT_AIRCRAFT_COUNT;
}

function getSupportTrailSteps(isMobileLayout: boolean) {
  return isMobileLayout ? MOBILE_SUPPORT_TRAIL_STEPS : DESKTOP_SUPPORT_TRAIL_STEPS;
}

const WAITLIST_SCROLL_TRANSITION = {
  fogDensity: 0.78,
  bloomStrength: 0.34,
  chromaticAberration: 0.0032,
  cameraStartZ: 6.35,
  cameraEndZ: 6.7,
  gridOpacity: 0.42,
  hazeIntensity: 0.74,
  transitionStart: 0.0,
  transitionEnd: 1.0,
  pullbackEnd: 0.25,
  distortionStart: 0.25,
  distortionEnd: 0.65,
  handoffStart: 0.78,
  autoCompleteThreshold: 0.82,
  autoCompleteDurationMs: 4200,
  autoHandoffEnabled: true,
  autoHandoffMinMs: 320,
  autoHandoffMaxMs: 920,
  autoHandoffVelocitySmoothing: 0.18,
  autoHandoffSpeedClampMin: 0.05,
  autoHandoffSpeedClampMax: 1.25,
  autoHandoffEndVelocityFactor: 0.06,
  autoRewindMsPerProgress: 2450,
  autoRewindMinDurationMs: 900,
  mobileTransitionDistance: 3.8,
  desktopTransitionDistance: 3.1,
  mobileScrollDeltaScale: 0.32,
  mobileScrollDeltaMaxStep: 72,
  earlyDistortionGestureCount: 2,
  earlyDistortionProgressStart: 0.03,
  earlyDistortionProgressEnd: 0.11,
  earlyDistortionMaxStrength: 0.18,
  earlyDistortionFallbackStart: 0.055,
  earlyDistortionFallbackEnd: 0.14,
  earlyDistortionFallbackStrength: 0.22,
  mobileReverseActivationThreshold: 140,
  mobileReverseIntentDecayPerSecond: 220,
  interruptedAutoCompleteResumeMs: 220,
} as const;

const WAITLIST_PERFORMANCE = {
  mobileTransitionPixelRatio: 1.25,
  desktopTransitionPixelRatio: 1.75,
  mobileTransitionPostScale: 0.82,
  desktopTransitionPostScale: 1,
  mobileGlobeMinPixelRatio: 1.55,
  mobileGlobeMaxPixelRatio: 2.15,
  lowMobileGlobeMaxPixelRatio: 1.75,
  desktopGlobeMinPixelRatio: 1.2,
  desktopGlobeMaxPixelRatio: 2.4,
  mobileSphereSegments: { width: 192, height: 112 },
  desktopSphereSegments: { width: 192, height: 112 },
  mobileRouteSegments: 144,
  desktopRouteSegments: 160,
  mobileRouteRadialSegments: 9,
  desktopRouteRadialSegments: 10,
  mobileHeroArcSegments: 192,
  desktopHeroArcSegments: 220,
  mobileHeroArcRadialSegments: 10,
  desktopHeroArcRadialSegments: 12,
  mobileActiveFrameRate: 45,
  mobileIdleFrameRate: 30,
  desktopFrameRate: 60,
} as const;

export default function LiveGlobeProofPage() {
  const [isGlobeReady, setIsGlobeReady] = useState(false);
  const [areUiAssetsReady, setAreUiAssetsReady] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [isLoaderFading, setIsLoaderFading] = useState(false);
  const [isLoaderHidden, setIsLoaderHidden] = useState(false);
  const [isSceneMaterializing, setIsSceneMaterializing] = useState(false);
  const [isSceneMaterialized, setIsSceneMaterialized] = useState(false);
  const [isScrollUnlocked, setIsScrollUnlocked] = useState(false);
  const pageRef = useRef<HTMLElement | null>(null);
  const orbProgressRef = useRef(0);
  const scrollProgressRef = useRef(0);
  const autoCompleteActiveRef = useRef(false);
  const autoRewindActiveRef = useRef(false);
  const manualReverseHoldActiveRef = useRef(false);
  const manualScrollDirectionRef = useRef<-1 | 0 | 1>(0);
  const lastManualScrollInputMsRef = useRef(0);
  const earlyForwardGestureCountRef = useRef(0);
  const firstScrollIntentRef = useRef(false);
  const materializeSignalRef = useRef(0);
  const loaderStartRef = useRef<number | null>(null);
  const interactionReadyRef = useRef(false);
  const handleGlobeReady = useCallback(() => setIsGlobeReady(true), []);
  const {
    textureSetName,
    gradeName,
    routesMode,
    aircraftMode,
    globeEnabled,
    postprocessingEnabled,
    starsEnabled,
    hazeEnabled,
    gridEnabled,
    rotationEnabled,
    atmosphereEnabled,
    cityLightsEnabled,
    diagnosticsEnabled,
    perfQueryEnabled,
  } = useLiveGlobeOverrides();
  const currentSearch = useSyncExternalStore(
    subscribeToSearchParams,
    getClientSearch,
    getServerSearch,
  );
  const perfDebugFlags = useSyncExternalStore(
    subscribeWebglPerfDebugFlags,
    getWebglPerfDebugFlagsSnapshot,
    getWebglPerfDebugFlagsSnapshot,
  );
  const [perfStorageEnabled, setPerfStorageEnabled] = useState(false);
  const [perfHudStorageVisible, setPerfHudStorageVisible] = useState(false);
  const currentSearchParams = new URLSearchParams(currentSearch);
  const perfHudVisible = currentSearchParams.get("perfHud") === "1" || perfHudStorageVisible;
  const perfEnvEnabled = process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_DH_PERF_HUD === "1";
  const perfEnabled = perfQueryEnabled || perfStorageEnabled || perfEnvEnabled;
  const forcedQuality: ForcedQuality = perfDebugFlags.forceMobileQuality
    ? "mobile"
    : perfDebugFlags.forceDesktopQuality
      ? "desktop"
      : null;
  const effectiveGlobeEnabled = globeEnabled && (!perfEnabled || perfDebugFlags.globeVisible);
  const effectivePostprocessingEnabled = postprocessingEnabled && (!perfEnabled || perfDebugFlags.postprocessing);
  const effectiveStarsEnabled = starsEnabled && (!perfEnabled || perfDebugFlags.starfield);
  const effectiveHazeEnabled = hazeEnabled && (!perfEnabled || perfDebugFlags.haze);
  const effectiveGridEnabled = gridEnabled && (!perfEnabled || perfDebugFlags.grid);
  const effectiveBloomEnabled = !perfEnabled || perfDebugFlags.bloom;
  const effectiveFrostEnabled = !perfEnabled || perfDebugFlags.frost;
  const effectiveChromaticEnabled = !perfEnabled || perfDebugFlags.chromatic;
  const effectiveRoutesEnabled = routesMode === "on" && (!perfEnabled || perfDebugFlags.globeRoutes);
  const effectiveRotationEnabled = rotationEnabled && (!perfEnabled || perfDebugFlags.globeRotation);
  const effectiveAtmosphereEnabled = atmosphereEnabled && (!perfEnabled || perfDebugFlags.globeAtmosphere);
  const effectiveCityLightsEnabled = cityLightsEnabled && (!perfEnabled || perfDebugFlags.globeCities);
  const isPageReady = isGlobeReady && areUiAssetsReady;
  const isInteractionReady = isHeroVisible && isScrollUnlocked;

  useEffect(() => {
    interactionReadyRef.current = isInteractionReady;
  }, [isInteractionReady]);

  useEffect(() => {
    const readPerfStorageFlags = () => {
      if (typeof window === "undefined") {
        return;
      }

      setPerfStorageEnabled(window.localStorage.getItem("DH_PERF_HUD") === "1");
      setPerfHudStorageVisible(window.localStorage.getItem("DH_PERF_HUD_VISIBLE") === "1");
    };

    readPerfStorageFlags();
    window.addEventListener("storage", readPerfStorageFlags);
    window.addEventListener("focus", readPerfStorageFlags);
    document.addEventListener("visibilitychange", readPerfStorageFlags);

    return () => {
      window.removeEventListener("storage", readPerfStorageFlags);
      window.removeEventListener("focus", readPerfStorageFlags);
      document.removeEventListener("visibilitychange", readPerfStorageFlags);
    };
  }, []);

  useEffect(() => {
    initWebglPerfMonitor(perfEnabled);
    if (perfEnabled) {
      window.console.info(
        "Deadhead Club Perf monitor enabled.\\nHUD is hidden by default. Add ?perfHud=1 or set localStorage.DH_PERF_HUD_VISIBLE=\"1\" to show it.\\nUse:\\nwindow.DH_PERF.summary()\\nwindow.DH_PERF.snapshot()\\nwindow.DH_PERF.setDebugFlag(\"postprocessing\", false)",
      );
    }
  }, [perfEnabled]);

  useEffect(() => {
    if (loaderStartRef.current === null) {
      loaderStartRef.current = Date.now();
    }
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const isMobileViewport = window.matchMedia("(max-width: 760px)").matches;

    if (isInteractionReady && !isMobileViewport) {
      html.style.overflow = "";
      body.style.overflow = "";
      body.style.touchAction = "";
      return;
    }

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";

    return () => {
      html.style.overflow = "";
      body.style.overflow = "";
      body.style.touchAction = "";
    };
  }, [isInteractionReady]);

  useEffect(() => {
    if (!isPageReady) {
      return;
    }

    const startTime = loaderStartRef.current ?? Date.now();
    const elapsed = Date.now() - startTime;
    const holdForMs = Math.max(0, 4000 - elapsed);
    const loaderFadeMs = 840;
    const materializePrerollMs = 1100;

    const fadeLoaderTimeout = window.setTimeout(() => {
      setIsLoaderFading(true);
    }, holdForMs);
    const hideLoaderTimeout = window.setTimeout(() => {
      setIsLoaderHidden(true);
    }, holdForMs + loaderFadeMs + 20);
    const materializeTimeout = window.setTimeout(() => {
      setIsSceneMaterializing(true);
      setIsSceneMaterialized(false);
      setIsScrollUnlocked(false);
      materializeSignalRef.current += 1;
    }, Math.max(0, holdForMs - materializePrerollMs));
    const scrollUnlockTimeout = window.setTimeout(() => {
      setIsScrollUnlocked(true);
    }, Math.max(0, holdForMs - materializePrerollMs) + 3100);
    const materializedTimeout = window.setTimeout(() => {
      setIsSceneMaterialized(true);
    }, Math.max(0, holdForMs - materializePrerollMs) + 4600);
    const revealTimeout = window.setTimeout(() => {
      setIsHeroVisible(true);
    }, holdForMs + loaderFadeMs + 80);

    return () => {
      window.clearTimeout(fadeLoaderTimeout);
      window.clearTimeout(hideLoaderTimeout);
      window.clearTimeout(materializeTimeout);
      window.clearTimeout(scrollUnlockTimeout);
      window.clearTimeout(materializedTimeout);
      window.clearTimeout(revealTimeout);
    };
  }, [isPageReady]);

  useEffect(() => {
    let cancelled = false;

    const preloadImage = (src: string) =>
      new Promise<void>((resolve) => {
        const image = new Image();
        image.decoding = "async";
        image.onload = () => resolve();
        image.onerror = () => resolve();
        image.src = src;
        if (image.complete) {
          resolve();
        }
      });

    const preloadFetch = (src: string) =>
      fetch(src, { cache: "force-cache" })
        .then(() => undefined)
        .catch(() => undefined);

    const fontReady = "fonts" in document ? (document.fonts.ready as Promise<unknown>).catch(() => undefined) : Promise.resolve();

    Promise.all([
      preloadImage("/cinematic/backgrounds/boarding-portal-entry-background.png"),
      preloadImage("/cinematic/backgrounds/boarding-portal-entry-background-transition.png"),
      preloadImage("/cinematic/backgrounds/skybyrd-scroll-wave-background.jpg"),
      preloadImage("/cinematic/branding/optimized/skybyrd-logo-ui.png"),
      preloadImage("/cinematic/branding/optimized/skybyrd-logo-loader.png"),
      preloadImage("/cinematic/branding/skybyrd-wordmark-8k.png"),
      preloadFetch(GLASS_CARD_MODEL_PATH),
      fontReady,
    ]).then(() => {
      if (cancelled) {
        return;
      }
      window.requestAnimationFrame(() => {
        if (!cancelled) {
          setAreUiAssetsReady(true);
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let targetProgress = 0;
    let smoothedProgress = 0;
    let autoCompleteTriggered = false;
    let autoCompleteStartMs = 0;
    let autoCompleteStartProgress = 0;
    let autoHandoffActive = false;
    let autoHandoffStartMs = 0;
    let autoHandoffDurationMs = 0;
    let autoHandoffStartProgress = 0;
    let autoHandoffStartVelocity = 0;
    let autoHandoffTargetVelocity = 0;
    let autoHandoffLastMs = 0;
    let autoRewindTriggered = false;
    let autoRewindStartMs = 0;
    let autoRewindStartProgress = 0;
    let autoRewindDurationMs = 0;
    let ticking = false;
    let lastTickTime = 0;
    let isMobileViewport = window.matchMedia("(max-width: 760px)").matches;
    let virtualScrollY = 0;
    let touchLastY: number | null = null;
    let lastScrollSource = 0;
    let hasUserScrollIntent = false;
    let stableViewportWidth = window.innerWidth;
    let stableViewportHeight = Math.max(window.innerHeight, window.visualViewport?.height ?? 0, 1);
    let sceneOnscreen = true;
    let pageVisible = !document.hidden;
    let lastUserVelocitySampleMs = performance.now();
    let lastUserVelocitySampleProgress = 0;
    let smoothedUserProgressVelocity = 0;
    let reverseActivationIntent = 0;
    let lastReverseActivationSampleMs = performance.now();
    let earlyForwardGestureCount = 0;
    let lastForwardGestureMs = 0;
    let manualReverseHoldActive = false;
    let manualScrollDirection: -1 | 0 | 1 = 0;
    let lastManualScrollInputMs = 0;
    const AUTO_COMPLETE_THRESHOLD = WAITLIST_SCROLL_TRANSITION.autoCompleteThreshold;
    const AUTO_COMPLETE_REWIND_PROGRESS = 0;
    const AUTO_COMPLETE_DURATION_MS = WAITLIST_SCROLL_TRANSITION.autoCompleteDurationMs;
    const AUTO_HANDOFF_ENABLED = WAITLIST_SCROLL_TRANSITION.autoHandoffEnabled;
    const AUTO_HANDOFF_MIN_MS = WAITLIST_SCROLL_TRANSITION.autoHandoffMinMs;
    const AUTO_HANDOFF_MAX_MS = WAITLIST_SCROLL_TRANSITION.autoHandoffMaxMs;
    const AUTO_HANDOFF_VELOCITY_SMOOTHING = WAITLIST_SCROLL_TRANSITION.autoHandoffVelocitySmoothing;
    const AUTO_HANDOFF_SPEED_CLAMP_MIN = WAITLIST_SCROLL_TRANSITION.autoHandoffSpeedClampMin;
    const AUTO_HANDOFF_SPEED_CLAMP_MAX = WAITLIST_SCROLL_TRANSITION.autoHandoffSpeedClampMax;
    const AUTO_HANDOFF_END_VELOCITY_FACTOR = WAITLIST_SCROLL_TRANSITION.autoHandoffEndVelocityFactor;
    const AUTO_REWIND_MS_PER_PROGRESS = WAITLIST_SCROLL_TRANSITION.autoRewindMsPerProgress;
    const AUTO_REWIND_MIN_DURATION_MS = WAITLIST_SCROLL_TRANSITION.autoRewindMinDurationMs;
    const MOBILE_REVERSE_ACTIVATION_THRESHOLD = WAITLIST_SCROLL_TRANSITION.mobileReverseActivationThreshold;
    const MOBILE_REVERSE_INTENT_DECAY_PER_SECOND = WAITLIST_SCROLL_TRANSITION.mobileReverseIntentDecayPerSecond;
    const INTERRUPTED_AUTO_COMPLETE_RESUME_MS = WAITLIST_SCROLL_TRANSITION.interruptedAutoCompleteResumeMs;
    const FIRST_SCROLL_KICKOFF_PROGRESS = 0.01;
    autoCompleteActiveRef.current = false;
    const getViewportHeight = () => stableViewportHeight;
    const refreshStableViewportSize = (force = false) => {
      const nextWidth = window.innerWidth;
      const nextHeight = Math.max(window.innerHeight, window.visualViewport?.height ?? 0, 1);
      const widthChanged = Math.abs(nextWidth - stableViewportWidth) > 24;
      if (force || widthChanged || !isMobileViewport) {
        stableViewportWidth = nextWidth;
        stableViewportHeight = nextHeight;
      } else {
        stableViewportHeight = Math.max(stableViewportHeight, nextHeight);
      }
    };

    const applyProgressStyles = (rawProgress: number, viewportHeight: number) => {
      const clampedProgress = THREE.MathUtils.clamp(rawProgress, 0, 1);
      const transitionShot = getLiveGlobeTransitionShotState({
        progress: clampedProgress,
        layout: isMobileViewport ? "mobile" : "desktop",
      });
      scrollProgressRef.current = clampedProgress;
      const earlyOnramp = getEarlyTransitionOnrampStrength({
        gestureCount: earlyForwardGestureCountRef.current,
        progress: clampedProgress,
        minimumGestureCount: WAITLIST_SCROLL_TRANSITION.earlyDistortionGestureCount,
        progressStart: WAITLIST_SCROLL_TRANSITION.earlyDistortionProgressStart,
        progressEnd: WAITLIST_SCROLL_TRANSITION.earlyDistortionProgressEnd,
        maxStrength: WAITLIST_SCROLL_TRANSITION.earlyDistortionMaxStrength,
      });
      const fallbackEarlyOnramp = getEarlyTransitionOnrampStrength({
        gestureCount: firstScrollIntentRef.current ? 1 : 0,
        progress: clampedProgress,
        minimumGestureCount: 1,
        progressStart: WAITLIST_SCROLL_TRANSITION.earlyDistortionFallbackStart,
        progressEnd: WAITLIST_SCROLL_TRANSITION.earlyDistortionFallbackEnd,
        maxStrength: WAITLIST_SCROLL_TRANSITION.earlyDistortionFallbackStrength,
      });
      const effectiveEarlyOnramp = Math.max(earlyOnramp, fallbackEarlyOnramp);
      const effectiveEarlyOnrampFactor = Math.max(
        getEarlyTransitionOnrampFactor({
          strength: earlyOnramp,
          maxStrength: WAITLIST_SCROLL_TRANSITION.earlyDistortionMaxStrength,
        }),
        getEarlyTransitionOnrampFactor({
          strength: fallbackEarlyOnramp,
          maxStrength: WAITLIST_SCROLL_TRANSITION.earlyDistortionFallbackStrength,
        }),
      );
      const washPhase = Math.max(
        THREE.MathUtils.smoothstep(
          clampedProgress,
          WAITLIST_SCROLL_TRANSITION.distortionStart,
          WAITLIST_SCROLL_TRANSITION.distortionEnd,
        ) *
          (1 - THREE.MathUtils.smoothstep(clampedProgress, 0.74, 0.94)),
        effectiveEarlyOnrampFactor * 0.16,
      );
      const handoffPhase = THREE.MathUtils.smoothstep(
        clampedProgress,
        WAITLIST_SCROLL_TRANSITION.handoffStart,
        WAITLIST_SCROLL_TRANSITION.transitionEnd,
      );
      const orbProgress = transitionShot.collapseProgress;
      const collapseProgress = transitionShot.collapseProgress;
      const widthCollapseProgress = THREE.MathUtils.smoothstep(clampedProgress, 0.6, 0.9);
      const absorptionExit = transitionShot.brandDissolveProgress;
      const absorbLead = THREE.MathUtils.smoothstep(clampedProgress, 0.42, 0.78);
      const absorbProgress = absorbLead * (1 - transitionShot.revealProgress * 0.82);
      const perspectiveProgress = transitionShot.cameraTravelProgress;
      const backgroundBlendProgress = THREE.MathUtils.smoothstep(clampedProgress, 0.24, 0.88);
      const webglBackgroundTakeover = transitionShot.backgroundTakeoverProgress;
      const earlyCanvasOpacity = getEarlyCanvasOpacity({
        mainOpacity: webglBackgroundTakeover,
        earlyFactor: effectiveEarlyOnrampFactor,
        maxOpacity: 0.18,
      });
      const wakeFadeProgress = THREE.MathUtils.smoothstep(clampedProgress, 0.46, 0.9);
      const vignetteFadeProgress = THREE.MathUtils.smoothstep(clampedProgress, 0.72, 0.98);
      const suckedWordProgress = THREE.MathUtils.smoothstep(clampedProgress, 0.42, 0.9);
      const particleLeadProgress = THREE.MathUtils.lerp(
        transitionShot.cameraTravelProgress,
        1,
        transitionShot.collapseProgress,
      );
      const fastPullProgress = transitionShot.cameraTravelProgress;
      const gapCloseProgress = THREE.MathUtils.smoothstep(clampedProgress, 0.38, 0.82);
      const wordmarkMouthY = Math.min(38, 14 * fastPullProgress + 18 * gapCloseProgress);
      const absorptionMouthY = Math.min(18, 10 * particleLeadProgress + 12 * gapCloseProgress);
      const wordmarkYpx = -(wordmarkMouthY / 100) * viewportHeight;
      const absorbYpx = -(absorptionMouthY / 100) * viewportHeight;
      const suckedWordYvh = -10 * transitionShot.cameraTravelProgress - 18 * suckedWordProgress;
      const suckedWordYpx = (suckedWordYvh / 100) * viewportHeight;
      const backgroundScale = THREE.MathUtils.lerp(1.018, isMobileViewport ? 0.978 : 0.966, perspectiveProgress);
      const backgroundY = -viewportHeight * THREE.MathUtils.lerp(0, isMobileViewport ? 0.04 : 0.055, perspectiveProgress);
      const wordmarkWidth = THREE.MathUtils.lerp(
        isMobileViewport ? 52 : 46,
        isMobileViewport ? 26 : 22,
        transitionShot.cameraTravelProgress,
      );
      const wordmarkBlur = THREE.MathUtils.lerp(0, isMobileViewport ? 10 : 8, Math.max(transitionShot.brandDissolveProgress, transitionShot.occlusionProgress * 0.92));
      page.style.setProperty("--orb-progress", `${orbProgress}`);
      page.style.setProperty("--background-perspective-scale", `${backgroundScale}`);
      page.style.setProperty("--background-perspective-y", `${backgroundY}px`);
      page.style.setProperty("--background-extension-opacity", `${backgroundBlendProgress}`);
      page.style.setProperty("--hero-background-opacity", `${Math.max(0, 1 - earlyCanvasOpacity)}`);
      page.style.setProperty("--transition-canvas-opacity", `${earlyCanvasOpacity}`);
      page.style.setProperty("--transition-wash-phase", `${washPhase}`);
      page.style.setProperty("--transition-handoff-phase", `${handoffPhase}`);
      page.style.setProperty("--wake-layer-opacity", `${Math.max(0, 1 - wakeFadeProgress)}`);
      page.style.setProperty("--vignette-layer-opacity", `${Math.max(0, 1 - vignetteFadeProgress)}`);
      page.style.setProperty("--final-background-opacity", `${transitionShot.backgroundTakeoverProgress}`);
      page.style.setProperty("--wordmark-y", `${wordmarkYpx}px`);
      page.style.setProperty("--wordmark-width", `${wordmarkWidth}vw`);
      page.style.setProperty("--wordmark-blur", `${wordmarkBlur}px`);
      page.style.setProperty("--wordmark-scale", `${THREE.MathUtils.lerp(1, 0.92, transitionShot.cameraTravelProgress)}`);
      page.style.setProperty("--wordmark-collapse-x", `${Math.max(0.045, 1 - collapseProgress * 0.955)}`);
      page.style.setProperty("--wordmark-opacity", `${Math.max(0, 1 - absorptionExit * 1.2 - transitionShot.occlusionProgress * 0.12)}`);
      page.style.setProperty("--absorb-opacity", `${Math.max(0, absorbProgress * 0.92)}`);
      page.style.setProperty("--absorb-y", `${absorbYpx}px`);
      page.style.setProperty("--absorb-scale-x", `${Math.max(0.06, 1 - widthCollapseProgress * 0.94)}`);
      page.style.setProperty("--absorb-cone-opacity", `${Math.max(0, absorbProgress * 0.62)}`);
      page.style.setProperty("--sucked-word-y", `${suckedWordYpx}px`);
      page.style.setProperty("--particle-lead-progress", `${particleLeadProgress}`);
      page.style.setProperty("--sucked-gap-close", `${gapCloseProgress}`);
      page.style.setProperty("--sucked-word-collapse-x", `${Math.max(0.028, 1 - widthCollapseProgress * 0.972)}`);
      page.style.setProperty("--sucked-word-opacity", `${Math.max(0, absorbProgress)}`);
      page.style.setProperty("--scroll-cue-opacity", `${Math.max(0, 1 - THREE.MathUtils.smoothstep(clampedProgress, 0.08, 0.24))}`);
      orbProgressRef.current = orbProgress;
      if (perfEnabled) {
        let scrollPhase: ScrollPhase = "idle";
        if (!sceneOnscreen || !pageVisible) {
          scrollPhase = "offscreen";
        } else if (clampedProgress < 0.24) {
          scrollPhase = "hero";
        } else if (clampedProgress < 0.7) {
          scrollPhase = "transition";
        } else if (clampedProgress < 0.995) {
          scrollPhase = "chapter";
        }
        const debugFlags = getWebglPerfDebugFlagsSnapshot();
        const mobileQuality = forcedQuality === "mobile" || (forcedQuality !== "desktop" && isMobileViewport);
        const qualityTier: QualityTier = prefersReducedMotion ? "reduced-motion" : mobileQuality ? "mobile" : "desktop";
        setWebglPerfSceneState({
          scrollProgress: clampedProgress,
          scrollPhase,
          qualityTier,
          postprocessingEnabled: effectivePostprocessingEnabled,
          bloomEnabled: effectivePostprocessingEnabled && effectiveBloomEnabled,
          frostEnabled: effectivePostprocessingEnabled && effectiveFrostEnabled,
          chromaticEnabled: effectivePostprocessingEnabled && effectiveChromaticEnabled,
          globeVisible: effectiveGlobeEnabled,
          globeRotating: effectiveRotationEnabled && debugFlags.globeRotation,
          globeAtmosphereEnabled: effectiveAtmosphereEnabled,
          globeRoutesEnabled: effectiveRoutesEnabled,
          globeCityLightsEnabled: effectiveCityLightsEnabled,
          starfieldEnabled: effectiveStarsEnabled,
          gridEnabled: effectiveGridEnabled,
          hazeEnabled: effectiveHazeEnabled,
          renderLoopActive: autoCompleteTriggered || autoRewindTriggered || clampedProgress > 0.001,
          renderLoopPaused: false,
          pageVisible,
          sceneOnscreen,
        });
      }
    };

    const getTransitionDistance = () => {
      const viewportHeight = getViewportHeight();
      const distanceMultiplier = isMobileViewport
        ? WAITLIST_SCROLL_TRANSITION.mobileTransitionDistance
        : WAITLIST_SCROLL_TRANSITION.desktopTransitionDistance;
      return viewportHeight * distanceMultiplier;
    };

    const markUserScrollIntent = () => {
      if (prefersReducedMotion || hasUserScrollIntent) {
        return;
      }
      hasUserScrollIntent = true;
      firstScrollIntentRef.current = true;
      targetProgress = Math.max(targetProgress, FIRST_SCROLL_KICKOFF_PROGRESS);
    };

    const resetScrollIntent = () => {
      hasUserScrollIntent = false;
      firstScrollIntentRef.current = false;
      earlyForwardGestureCount = 0;
      earlyForwardGestureCountRef.current = 0;
      lastForwardGestureMs = 0;
      manualScrollDirection = 0;
      manualScrollDirectionRef.current = 0;
      lastManualScrollInputMs = 0;
      lastManualScrollInputMsRef.current = 0;
      autoCompleteActiveRef.current = false;
      autoRewindActiveRef.current = false;
      manualReverseHoldActiveRef.current = false;
      autoHandoffActive = false;
      manualReverseHoldActive = false;
      reverseActivationIntent = 0;
      targetProgress = 0;
    };

    const resetToStart = () => {
      resetScrollIntent();
      smoothedProgress = 0;
      smoothedUserProgressVelocity = 0;
      lastUserVelocitySampleProgress = 0;
      lastUserVelocitySampleMs = performance.now();
      applyProgressStyles(0, getViewportHeight());
    };

    const sampleUserScrollVelocity = (sourceProgress: number, nowMs: number) => {
      const dt = Math.max((nowMs - lastUserVelocitySampleMs) / 1000, 1 / 240);
      const instantaneousVelocity = (sourceProgress - lastUserVelocitySampleProgress) / dt;
      const clampedVelocity = THREE.MathUtils.clamp(instantaneousVelocity, -2.5, 2.5);
      smoothedUserProgressVelocity = THREE.MathUtils.lerp(
        smoothedUserProgressVelocity,
        clampedVelocity,
        AUTO_HANDOFF_VELOCITY_SMOOTHING,
      );
      lastUserVelocitySampleProgress = sourceProgress;
      lastUserVelocitySampleMs = nowMs;
    };

    const startAutoComplete = (nowMs: number) => {
      autoCompleteTriggered = true;
      autoCompleteActiveRef.current = true;
      manualReverseHoldActiveRef.current = false;
      autoCompleteStartMs = nowMs;
      autoCompleteStartProgress = smoothedProgress;
      reverseActivationIntent = 0;
      lastReverseActivationSampleMs = nowMs;
      manualReverseHoldActive = false;

      const userForwardVelocity = THREE.MathUtils.clamp(smoothedUserProgressVelocity, 0, AUTO_HANDOFF_SPEED_CLAMP_MAX);
      if (!prefersReducedMotion && AUTO_HANDOFF_ENABLED && userForwardVelocity > AUTO_HANDOFF_SPEED_CLAMP_MIN) {
        const handoffBlend = THREE.MathUtils.clamp(
          (userForwardVelocity - AUTO_HANDOFF_SPEED_CLAMP_MIN) /
            Math.max(AUTO_HANDOFF_SPEED_CLAMP_MAX - AUTO_HANDOFF_SPEED_CLAMP_MIN, 1e-4),
          0,
          1,
        );
        autoHandoffActive = true;
        autoHandoffStartMs = nowMs;
        autoHandoffDurationMs = THREE.MathUtils.lerp(AUTO_HANDOFF_MIN_MS, AUTO_HANDOFF_MAX_MS, handoffBlend);
        autoHandoffStartProgress = smoothedProgress;
        autoHandoffStartVelocity = userForwardVelocity;
        autoHandoffTargetVelocity = Math.min(
          userForwardVelocity * AUTO_HANDOFF_END_VELOCITY_FACTOR,
          0.04,
        );
        autoHandoffLastMs = 0;
      } else {
        autoHandoffActive = false;
      }
    };

    const beginAutoRewind = () => {
      autoCompleteTriggered = false;
      autoCompleteActiveRef.current = false;
      autoHandoffActive = false;
      autoRewindActiveRef.current = true;
      manualReverseHoldActiveRef.current = false;
      autoRewindTriggered = true;
      reverseActivationIntent = 0;
      manualReverseHoldActive = false;
      autoRewindStartMs = performance.now();
      autoRewindStartProgress = smoothedProgress;
      autoRewindDurationMs = Math.max(AUTO_REWIND_MIN_DURATION_MS, autoRewindStartProgress * AUTO_REWIND_MS_PER_PROGRESS);
      targetProgress = smoothedProgress;
    };

    const shouldStartMobileAutoRewind = (deltaY: number, nowMs: number) => {
      const dtSeconds = THREE.MathUtils.clamp((nowMs - lastReverseActivationSampleMs) / 1000, 0, 0.25);
      lastReverseActivationSampleMs = nowMs;
      const result = updateReverseActivationIntent({
        currentIntent: reverseActivationIntent,
        deltaY,
        dtSeconds,
        threshold: MOBILE_REVERSE_ACTIVATION_THRESHOLD,
        decayPerSecond: MOBILE_REVERSE_INTENT_DECAY_PER_SECOND,
      });
      reverseActivationIntent = result.nextIntent;
      return result.shouldTrigger;
    };

    const nudgeAutoRewind = (deltaY: number) => {
      if (!autoRewindTriggered || deltaY >= -0.5) {
        return;
      }
      const rewindImpulse = THREE.MathUtils.clamp(Math.abs(deltaY) / 1800, 0.015, 0.12);
      const rewoundProgress = THREE.MathUtils.clamp(smoothedProgress - rewindImpulse, 0, 1);
      smoothedProgress = rewoundProgress;
      targetProgress = rewoundProgress;
      const nowMs = performance.now();
      autoRewindStartProgress = rewoundProgress;
      autoRewindStartMs = nowMs;
      const rewindBoost = THREE.MathUtils.clamp(Math.abs(deltaY) / 420, 0.16, 0.52);
      autoRewindDurationMs = Math.max(
        180,
        autoRewindStartProgress * AUTO_REWIND_MS_PER_PROGRESS * (1 - rewindBoost),
      );
      if (rewoundProgress <= 0.0035) {
        autoRewindTriggered = false;
        autoCompleteActiveRef.current = false;
        autoRewindActiveRef.current = false;
        if (isMobileViewport) {
          virtualScrollY = 0;
        } else {
          window.scrollTo(0, 0);
        }
        resetToStart();
      }
    };

    const computeTargetProgress = () => {
      const transitionDistance = getTransitionDistance();
      const scrollSource = isMobileViewport ? virtualScrollY : window.scrollY;
      const nowMs = performance.now();
      const userInputActive =
        lastManualScrollInputMs > 0 && nowMs - lastManualScrollInputMs < INTERRUPTED_AUTO_COMPLETE_RESUME_MS;
      const sourceProgress = prefersReducedMotion ? 0 : THREE.MathUtils.clamp(scrollSource / transitionDistance, 0, 1);
      if (!autoCompleteTriggered && !autoRewindTriggered) {
        sampleUserScrollVelocity(sourceProgress, nowMs);
      }
      const scrollDelta = scrollSource - lastScrollSource;
      const scrollingBackward = scrollDelta < -1;
      const scrollingForward = scrollDelta > 1;
      if (scrollingForward || scrollingBackward) {
        manualScrollDirection = scrollingForward ? 1 : -1;
        manualScrollDirectionRef.current = manualScrollDirection;
        lastManualScrollInputMs = nowMs;
        lastManualScrollInputMsRef.current = nowMs;
      }
      lastScrollSource = scrollSource;
      if (scrollSource <= 0.5 && !autoCompleteTriggered && !autoRewindTriggered) {
        resetToStart();
      }
      if (scrollSource > 0.5) {
        markUserScrollIntent();
      }

      if (autoCompleteTriggered) {
        if (scrollingBackward) {
          beginAutoRewind();
        }
        return;
      }

      if (autoRewindTriggered) {
        return;
      }

      const kickoffProgress = hasUserScrollIntent ? FIRST_SCROLL_KICKOFF_PROGRESS : 0;
      targetProgress = Math.max(sourceProgress, kickoffProgress);
      if (manualReverseHoldActive) {
        if (scrollingForward || sourceProgress <= AUTO_COMPLETE_THRESHOLD - 0.01) {
          manualReverseHoldActive = false;
          manualReverseHoldActiveRef.current = false;
        } else if (
          shouldResumeInterruptedAutoComplete({
            manualReverseHoldActive,
            currentScrollProgress: sourceProgress,
            nowMs,
            lastManualScrollInputMs,
            idleResumeMs: INTERRUPTED_AUTO_COMPLETE_RESUME_MS,
            minResumeProgress: AUTO_COMPLETE_THRESHOLD,
          })
        ) {
          manualReverseHoldActive = false;
          manualReverseHoldActiveRef.current = false;
          manualScrollDirection = 0;
          manualScrollDirectionRef.current = 0;
          startAutoComplete(nowMs);
          return;
        } else {
          return;
        }
      }
      if (!prefersReducedMotion && targetProgress >= AUTO_COMPLETE_THRESHOLD) {
        startAutoComplete(nowMs);
      }
    };

    const tick = (timestamp: number) => {
      if (manualReverseHoldActive && !autoCompleteTriggered && !autoRewindTriggered) {
        computeTargetProgress();
      }
      if (autoCompleteTriggered) {
        if (autoHandoffActive) {
          const handoffProgress = THREE.MathUtils.clamp(
            (timestamp - autoHandoffStartMs) / Math.max(autoHandoffDurationMs, 1),
            0,
            1,
          );
          const handoffEase = handoffProgress * handoffProgress * (3 - 2 * handoffProgress);
          const handoffVelocity = THREE.MathUtils.lerp(
            autoHandoffStartVelocity,
            autoHandoffTargetVelocity,
            handoffEase,
          );
          const dt = autoHandoffLastMs === 0 ? 1 / 60 : THREE.MathUtils.clamp((timestamp - autoHandoffLastMs) / 1000, 1 / 180, 1 / 20);
          autoHandoffLastMs = timestamp;
          const handoffStep = Math.max(0, handoffVelocity * dt);
          targetProgress = THREE.MathUtils.clamp(targetProgress + handoffStep, autoHandoffStartProgress, 1);
          if (handoffProgress >= 0.999 || targetProgress >= 0.999) {
            autoHandoffActive = false;
            autoCompleteStartMs = timestamp;
            autoCompleteStartProgress = targetProgress;
          }
        } else {
          const autoProgress = THREE.MathUtils.clamp((timestamp - autoCompleteStartMs) / AUTO_COMPLETE_DURATION_MS, 0, 1);
          const easedAutoProgress = autoProgress * autoProgress * (3 - 2 * autoProgress);
          targetProgress = THREE.MathUtils.lerp(autoCompleteStartProgress, 1, easedAutoProgress);
        }
      } else if (autoRewindTriggered) {
        const rewindDuration = Math.max(AUTO_REWIND_MIN_DURATION_MS, autoRewindDurationMs);
        const rewindProgress = THREE.MathUtils.clamp((timestamp - autoRewindStartMs) / rewindDuration, 0, 1);
        targetProgress = THREE.MathUtils.lerp(autoRewindStartProgress, AUTO_COMPLETE_REWIND_PROGRESS, rewindProgress);
        if (rewindProgress >= 0.999) {
          autoRewindTriggered = false;
          autoCompleteActiveRef.current = false;
          autoRewindActiveRef.current = false;
          if (isMobileViewport) {
            virtualScrollY = getTransitionDistance() * AUTO_COMPLETE_REWIND_PROGRESS;
          } else {
            window.scrollTo(0, getTransitionDistance() * AUTO_COMPLETE_REWIND_PROGRESS);
          }
          resetToStart();
        }
      }
      const dt = lastTickTime === 0 ? 1 / 60 : THREE.MathUtils.clamp((timestamp - lastTickTime) / 1000, 1 / 180, 1 / 20);
      lastTickTime = timestamp;
      const smoothStrength = isMobileViewport ? 12 : 15;
      const alpha = 1 - Math.exp(-smoothStrength * dt);
      smoothedProgress = autoRewindTriggered ? targetProgress : THREE.MathUtils.lerp(smoothedProgress, targetProgress, alpha);
      if (Math.abs(targetProgress - smoothedProgress) < 0.0006) {
        smoothedProgress = targetProgress;
      }
      applyProgressStyles(smoothedProgress, getViewportHeight());

      const autoCompleting = autoCompleteTriggered && targetProgress < 0.9995;
      if (
        shouldKeepInterruptedTransitionTicking({
          manualReverseHoldActive,
          targetProgress,
          smoothedProgress,
          autoCompleting,
          autoRewindTriggered,
        })
      ) {
        frame = window.requestAnimationFrame(tick);
        return;
      }

      frame = 0;
      lastTickTime = 0;
      ticking = false;
    };

    const requestScrollProgress = () => {
      isMobileViewport = window.matchMedia("(max-width: 760px)").matches;
      computeTargetProgress();
      if (ticking) {
        return;
      }
      ticking = true;
      lastTickTime = 0;
      frame = window.requestAnimationFrame(tick);
    };

    const registerScrollIntent = (deltaY: number) => {
      if (prefersReducedMotion || deltaY <= 0 || hasUserScrollIntent) {
        return;
      }
      markUserScrollIntent();
      requestScrollProgress();
    };

    const registerForwardGestureBurst = (deltaY: number) => {
      if (prefersReducedMotion || deltaY <= 0.5) {
        return;
      }
      if (smoothedProgress > 0.18 || autoCompleteTriggered || autoRewindTriggered) {
        return;
      }
      const nowMs = performance.now();
      if (nowMs - lastForwardGestureMs < 220) {
        return;
      }
      lastForwardGestureMs = nowMs;
      earlyForwardGestureCount = Math.min(earlyForwardGestureCount + 1, 6);
      earlyForwardGestureCountRef.current = earlyForwardGestureCount;
    };

    const getNormalizedVirtualScrollDelta = (deltaY: number) => {
      const scaledDelta = deltaY * WAITLIST_SCROLL_TRANSITION.mobileScrollDeltaScale;
      const clampedDelta = THREE.MathUtils.clamp(
        scaledDelta,
        -WAITLIST_SCROLL_TRANSITION.mobileScrollDeltaMaxStep,
        WAITLIST_SCROLL_TRANSITION.mobileScrollDeltaMaxStep,
      );
      return Math.abs(clampedDelta) < 0.5 ? 0 : clampedDelta;
    };

    const applyVirtualScrollDelta = (deltaY: number) => {
      if (!isMobileViewport || !interactionReadyRef.current || prefersReducedMotion) {
        return;
      }
      const normalizedDeltaY = getNormalizedVirtualScrollDelta(deltaY);
      if (normalizedDeltaY === 0) {
        return;
      }
      const nowMs = performance.now();
      manualScrollDirection = normalizedDeltaY > 0 ? 1 : -1;
      manualScrollDirectionRef.current = manualScrollDirection;
      lastManualScrollInputMs = nowMs;
      lastManualScrollInputMsRef.current = nowMs;
      registerForwardGestureBurst(normalizedDeltaY);
      registerScrollIntent(deltaY);
      if (autoCompleteTriggered && normalizedDeltaY < -0.5) {
        virtualScrollY = THREE.MathUtils.clamp(smoothedProgress * getTransitionDistance(), 0, getTransitionDistance());
        autoCompleteTriggered = false;
        autoCompleteActiveRef.current = false;
        autoHandoffActive = false;
        manualReverseHoldActive = true;
        manualReverseHoldActiveRef.current = true;
        const reverseStep = applyReverseScrubStep({
          currentIntent: reverseActivationIntent,
          deltaY: normalizedDeltaY,
          dtSeconds: THREE.MathUtils.clamp((nowMs - lastReverseActivationSampleMs) / 1000, 0, 0.25),
          threshold: MOBILE_REVERSE_ACTIVATION_THRESHOLD,
          decayPerSecond: MOBILE_REVERSE_INTENT_DECAY_PER_SECOND,
          virtualScrollY,
          transitionDistance: getTransitionDistance(),
        });
        lastReverseActivationSampleMs = nowMs;
        reverseActivationIntent = reverseStep.nextIntent;
        virtualScrollY = reverseStep.nextVirtualScrollY;
        if (!reverseStep.shouldTrigger) {
          requestScrollProgress();
          return;
        }
        beginAutoRewind();
        requestScrollProgress();
        return;
      }
      if (manualReverseHoldActive && normalizedDeltaY < -0.5) {
        const nowMs = performance.now();
        const reverseStep = applyReverseScrubStep({
          currentIntent: reverseActivationIntent,
          deltaY: normalizedDeltaY,
          dtSeconds: THREE.MathUtils.clamp((nowMs - lastReverseActivationSampleMs) / 1000, 0, 0.25),
          threshold: MOBILE_REVERSE_ACTIVATION_THRESHOLD,
          decayPerSecond: MOBILE_REVERSE_INTENT_DECAY_PER_SECOND,
          virtualScrollY,
          transitionDistance: getTransitionDistance(),
        });
        lastReverseActivationSampleMs = nowMs;
        reverseActivationIntent = reverseStep.nextIntent;
        virtualScrollY = reverseStep.nextVirtualScrollY;
        if (reverseStep.shouldTrigger) {
          beginAutoRewind();
        }
        requestScrollProgress();
        return;
      }
      if (normalizedDeltaY >= -0.5) {
        reverseActivationIntent = 0;
        manualReverseHoldActive = false;
        manualReverseHoldActiveRef.current = false;
        lastReverseActivationSampleMs = performance.now();
        manualScrollDirection = normalizedDeltaY > 0 ? 1 : 0;
        manualScrollDirectionRef.current = manualScrollDirection;
      }
      if (autoRewindTriggered) {
        nudgeAutoRewind(normalizedDeltaY);
        requestScrollProgress();
        return;
      }
      virtualScrollY = THREE.MathUtils.clamp(virtualScrollY + normalizedDeltaY, 0, getTransitionDistance());
      if (virtualScrollY <= 0.5 && normalizedDeltaY < 0) {
        resetToStart();
      }
      requestScrollProgress();
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (!isMobileViewport || event.touches.length !== 1) {
        touchLastY = null;
        return;
      }
      if ((window as typeof window & { __deadheadGlobeDragging?: boolean }).__deadheadGlobeDragging) {
        touchLastY = null;
        return;
      }
      touchLastY = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isMobileViewport || event.touches.length !== 1) {
        return;
      }
      if ((window as typeof window & { __deadheadGlobeDragging?: boolean }).__deadheadGlobeDragging) {
        touchLastY = null;
        return;
      }
      event.preventDefault();
      const nextY = event.touches[0]?.clientY ?? touchLastY;
      if (nextY === null || touchLastY === null) {
        touchLastY = nextY;
        return;
      }
      applyVirtualScrollDelta(touchLastY - nextY);
      touchLastY = nextY;
    };

    const handleWheel = (event: WheelEvent) => {
      registerScrollIntent(event.deltaY);
      const normalizedDeltaY = isMobileViewport ? getNormalizedVirtualScrollDelta(event.deltaY) : event.deltaY;
      if (!isMobileViewport) {
        registerForwardGestureBurst(normalizedDeltaY);
      }
      if (autoRewindTriggered && normalizedDeltaY < -0.5) {
        nudgeAutoRewind(normalizedDeltaY);
        requestScrollProgress();
        if (isMobileViewport) {
          event.preventDefault();
        }
        return;
      }
      if (!isMobileViewport) {
        return;
      }
      event.preventDefault();
      applyVirtualScrollDelta(event.deltaY);
    };

    const visibilityHandler = () => {
      pageVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", visibilityHandler);
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        sceneOnscreen = Boolean(entry?.isIntersecting);
      },
      { threshold: 0.05 },
    );
    intersectionObserver.observe(page);

    computeTargetProgress();
    smoothedProgress = targetProgress;
    applyProgressStyles(smoothedProgress, getViewportHeight());
    window.addEventListener("scroll", requestScrollProgress, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("wheel", handleWheel, { passive: false });
    const handleViewportResize = () => {
      refreshStableViewportSize();
      requestScrollProgress();
    };
    const handleOrientationChange = () => {
      refreshStableViewportSize(true);
      requestScrollProgress();
    };
    window.addEventListener("resize", handleViewportResize);
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      autoCompleteActiveRef.current = false;
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
      ticking = false;
      window.removeEventListener("scroll", requestScrollProgress);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", handleViewportResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
      document.removeEventListener("visibilitychange", visibilityHandler);
      intersectionObserver.disconnect();
    };
  }, [
    effectiveAtmosphereEnabled,
    effectiveBloomEnabled,
    effectiveChromaticEnabled,
    effectiveCityLightsEnabled,
    effectiveFrostEnabled,
    effectiveGlobeEnabled,
    effectiveGridEnabled,
    effectiveHazeEnabled,
    effectivePostprocessingEnabled,
    effectiveRotationEnabled,
    effectiveRoutesEnabled,
    effectiveStarsEnabled,
    forcedQuality,
    perfEnabled,
  ]);

  const pageClassName = [
    styles.page,
    isSceneMaterializing ? styles.pageMaterializing : "",
    isSceneMaterialized ? styles.pageMaterialized : "",
    isInteractionReady ? styles.pageInteractionReady : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main ref={pageRef} className={pageClassName} aria-label="Deadhead live globe proof lab">
      <section className={styles.heroStage} aria-label="Skybyrd live globe hero">
        <div className={styles.heroContent}>
          <div className={styles.backgroundPlate}>
            <WaitlistSceneTransition
              scrollProgressRef={scrollProgressRef}
              earlyForwardGestureCountRef={earlyForwardGestureCountRef}
              firstScrollIntentRef={firstScrollIntentRef}
              postprocessingEnabled={effectivePostprocessingEnabled}
              starsEnabled={effectiveStarsEnabled}
              hazeEnabled={effectiveHazeEnabled}
              gridEnabled={effectiveGridEnabled}
              diagnosticsEnabled={diagnosticsEnabled}
              bloomEnabled={effectiveBloomEnabled}
              frostEnabled={effectiveFrostEnabled}
              chromaticEnabled={effectiveChromaticEnabled}
              perfEnabled={perfEnabled}
              forcedQuality={forcedQuality}
            />
            <div className={styles.finalBackgroundImage} aria-hidden="true" />
          </div>
          <div className={styles.wakeLayer} />
          <div className={styles.cornerLogo} aria-hidden="true">
            <img
              src="/cinematic/branding/optimized/skybyrd-logo-ui.png"
              alt=""
              className={styles.cornerLogoImage}
              decoding="async"
              loading="eager"
              fetchPriority="high"
              draggable={false}
            />
          </div>
          <div className={styles.globeOrbRig}>
            <LiveGlobeCanvas
              onReady={handleGlobeReady}
              textureSet={TEXTURE_SETS[textureSetName]}
              grade={GRADE_CONFIGS[gradeName]}
              globeEnabled={effectiveGlobeEnabled}
              routesEnabled={effectiveRoutesEnabled}
              aircraftEnabled={aircraftMode === "on"}
              rotationEnabled={effectiveRotationEnabled}
              atmosphereEnabled={effectiveAtmosphereEnabled}
              cityLightsEnabled={effectiveCityLightsEnabled}
              diagnosticsEnabled={diagnosticsEnabled}
              scrollProgressRef={scrollProgressRef}
              orbProgressRef={orbProgressRef}
              autoCompleteActiveRef={autoCompleteActiveRef}
              autoRewindActiveRef={autoRewindActiveRef}
              manualReverseHoldActiveRef={manualReverseHoldActiveRef}
              manualScrollDirectionRef={manualScrollDirectionRef}
              lastManualScrollInputMsRef={lastManualScrollInputMsRef}
              materializeSignalRef={materializeSignalRef}
              perfEnabled={perfEnabled}
              forcedQuality={forcedQuality}
            />
          </div>
          <div className={styles.wordmark} aria-hidden="true">
            <img
              src="/cinematic/branding/skybyrd-wordmark-8k.png"
              alt=""
              className={styles.wordmarkImage}
              decoding="async"
              loading="eager"
              draggable={false}
            />
          </div>
          <div className={styles.wordmarkAbsorption} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className={styles.topGlowLayer} />
          <div className={styles.vignetteLayer} />
          <div className={styles.scrollCue} aria-hidden="true">
            <div className={styles.scrollCueIcon}>
              <div className={styles.scrollCueRing} />
              <div className={styles.scrollCueChevronTrack}>
                <span className={styles.scrollCueChevron} />
                <span className={`${styles.scrollCueChevron} ${styles.scrollCueChevronAlt}`} />
              </div>
            </div>
            <span className={styles.scrollCueText}>SCROLL TO CONTINUE</span>
          </div>
        </div>
        <div className={`${styles.revealCurtain} ${isHeroVisible ? styles.revealCurtainOpen : ""}`} aria-hidden="true" />
        <div
          className={`${styles.loadingLayer} ${isLoaderFading ? styles.loadingLayerFading : ""} ${isLoaderHidden ? styles.loadingLayerHidden : ""}`}
          aria-hidden="true"
        >
          <div className={styles.loadingOrb}>
            <img
              src="/cinematic/branding/optimized/skybyrd-logo-loader.png"
              alt=""
              className={styles.loadingOrbLogo}
              decoding="sync"
              loading="eager"
              fetchPriority="high"
              draggable={false}
            />
          </div>
          <div className={styles.loadingLine} />
        </div>
        <h1 className={styles.srOnly}>Live CGTrader Earth globe proof</h1>
        <PerfHud enabled={perfEnabled && perfHudVisible} />
      </section>
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

function getToggleMode(value: string | null, defaultMode: ToggleMode = "on"): ToggleMode {
  if (value === "off" || value === "0" || value === "false") {
    return "off";
  }
  if (value === "on" || value === "1" || value === "true") {
    return "on";
  }

  return defaultMode;
}

function useLiveGlobeOverrides() {
  const search = useSyncExternalStore(subscribeToSearchParams, getClientSearch, getServerSearch);
  const params = new URLSearchParams(search);

  return {
    textureSetName: getTextureSetName(params.get("candidate")),
    gradeName: getGradeName(params.get("grade")),
    routesMode: getRoutesMode(params.get("routes")),
    aircraftMode: getAircraftMode(params.get("aircraft")),
    globeEnabled: getToggleMode(params.get("globe")) === "on",
    postprocessingEnabled: getToggleMode(params.get("post")) === "on",
    starsEnabled: getToggleMode(params.get("stars")) === "on",
    hazeEnabled: getToggleMode(params.get("haze")) === "on",
    gridEnabled: getToggleMode(params.get("grid")) === "on",
    rotationEnabled: getToggleMode(params.get("rotation")) === "on",
    atmosphereEnabled: getToggleMode(params.get("atmosphere")) === "on",
    cityLightsEnabled: getToggleMode(params.get("cities")) === "on",
    diagnosticsEnabled: getToggleMode(params.get("diagnostics"), "off") === "on",
    perfQueryEnabled: getToggleMode(params.get("perf"), "off") === "on",
  };
}

function clamp01(value: number) {
  return THREE.MathUtils.clamp(value, 0, 1);
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const x = clamp01((value - edge0) / Math.max(edge1 - edge0, 0.00001));
  return x * x * (3 - 2 * x);
}

function bell(progress: number, center: number, width: number) {
  const x = (progress - center) / Math.max(width, 0.00001);
  return Math.exp(-x * x * 2.8);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

const FROST_DISPLACEMENT_SHADER = {
  uniforms: {
    tDiffuse: { value: null },
    uProgress: { value: 0 },
    uTime: { value: 0 },
    uFrostStrength: { value: 0 },
    uDisplacementStrength: { value: 0 },
    uNoiseScale: { value: 7.5 },
    uResolution: { value: new THREE.Vector2(1, 1) },
  },
  vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    precision highp float;

    uniform sampler2D tDiffuse;
    uniform float uProgress;
    uniform float uTime;
    uniform float uFrostStrength;
    uniform float uDisplacementStrength;
    uniform float uNoiseScale;
    uniform vec2 uResolution;
    varying vec2 vUv;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amp = 0.5;
      for (int i = 0; i < 5; i++) {
        value += amp * noise(p);
        p = p * 2.05 + vec2(13.7, 8.9);
        amp *= 0.5;
      }
      return value;
    }

    void main() {
      vec2 uv = vUv;
      vec2 center = uv - 0.5;
      center.x *= uResolution.x / max(uResolution.y, 1.0);
      float radial = smoothstep(0.95, 0.05, length(center));
      float broad = fbm(uv * uNoiseScale + vec2(uTime * 0.035, -uTime * 0.02));
      float fine = fbm(uv * (uNoiseScale * 3.4) + vec2(-uTime * 0.12, uTime * 0.08));
      vec2 flow = normalize(vec2(broad - 0.48, fine - 0.48) + vec2(0.001, -0.16));
      vec2 smear = vec2(sin(uv.y * 18.0 + broad * 4.0), cos(uv.x * 14.0 - fine * 3.0)) * 0.35;
      vec2 offset = (flow + smear) * uDisplacementStrength * radial;

      vec3 color = texture2D(tDiffuse, clamp(uv + offset, 0.0, 1.0)).rgb;
      vec3 blur = (
        texture2D(tDiffuse, clamp(uv + offset * 1.8 + vec2(0.006, 0.0) * uFrostStrength, 0.0, 1.0)).rgb +
        texture2D(tDiffuse, clamp(uv + offset * 1.2 - vec2(0.005, 0.0) * uFrostStrength, 0.0, 1.0)).rgb +
        texture2D(tDiffuse, clamp(uv + offset * 1.4 + vec2(0.0, 0.006) * uFrostStrength, 0.0, 1.0)).rgb +
        texture2D(tDiffuse, clamp(uv + offset * 0.8 - vec2(0.0, 0.005) * uFrostStrength, 0.0, 1.0)).rgb
      ) * 0.25;

      float frostVeil = smoothstep(0.38, 0.88, broad) * radial * uFrostStrength;
      vec3 frostColor = vec3(0.48, 0.62, 0.72);
      color = mix(color, blur, uFrostStrength * 0.38);
      color = mix(color, max(color, frostColor), frostVeil * 0.12);
      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

const CHROMATIC_ABERRATION_SHADER = {
  uniforms: {
    tDiffuse: { value: null },
    uStrength: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
  },
  vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    precision highp float;

    uniform sampler2D tDiffuse;
    uniform float uStrength;
    uniform vec2 uResolution;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      vec2 dir = uv - 0.5;
      dir.x *= uResolution.x / max(uResolution.y, 1.0);
      float dist = length(dir);
      vec2 offset = normalize(dir + vec2(0.0001)) * dist * uStrength;
      vec3 color;
      color.r = texture2D(tDiffuse, clamp(uv + offset, 0.0, 1.0)).r;
      color.g = texture2D(tDiffuse, uv).g;
      color.b = texture2D(tDiffuse, clamp(uv - offset * 0.82, 0.0, 1.0)).b;
      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

function WaitlistSceneTransition({
  scrollProgressRef,
  earlyForwardGestureCountRef,
  firstScrollIntentRef,
  postprocessingEnabled,
  starsEnabled,
  hazeEnabled,
  gridEnabled,
  diagnosticsEnabled,
  bloomEnabled,
  frostEnabled,
  chromaticEnabled,
  perfEnabled,
  forcedQuality,
}: {
  scrollProgressRef: React.MutableRefObject<number>;
  earlyForwardGestureCountRef: React.MutableRefObject<number>;
  firstScrollIntentRef: React.MutableRefObject<boolean>;
  postprocessingEnabled: boolean;
  starsEnabled: boolean;
  hazeEnabled: boolean;
  gridEnabled: boolean;
  diagnosticsEnabled: boolean;
  bloomEnabled: boolean;
  frostEnabled: boolean;
  chromaticEnabled: boolean;
  perfEnabled: boolean;
  forcedQuality: ForcedQuality;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobileViewport = () => {
      if (forcedQuality === "mobile") {
        return true;
      }
      if (forcedQuality === "desktop") {
        return false;
      }
      return window.matchMedia("(max-width: 760px)").matches;
    };
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020712, 0.014);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 80);
    camera.position.set(0, 0.15, WAITLIST_SCROLL_TRANSITION.cameraStartZ);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
    renderer.setClearColor(0x020712, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    mount.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.35, 0.35, 0.15);
    composer.addPass(bloomPass);

    const frostPass = new ShaderPass(FROST_DISPLACEMENT_SHADER);
    composer.addPass(frostPass);

    const chromaticPass = new ShaderPass(CHROMATIC_ABERRATION_SHADER);
    composer.addPass(chromaticPass);
    bloomPass.enabled = postprocessingEnabled && bloomEnabled;
    frostPass.enabled = false;
    chromaticPass.enabled = false;

    const scrollTriggerProgressRef = { current: 0 };
    const scrollTrigger = ScrollTrigger.create({
      trigger: document.querySelector("main") ?? mount,
      start: "top top",
      end: () => `+=${window.innerHeight * (isMobileViewport() ? 2.4 : 2.0)}`,
      scrub: true,
      onUpdate: (self) => {
        scrollTriggerProgressRef.current = self.progress;
      },
    });

    const textureLoader = new THREE.TextureLoader();
    const loadedTextures: THREE.Texture[] = [];
    const disposableObjects: THREE.Object3D[] = [];
    const disposableMaterials: THREE.Material[] = [];
    const disposableGeometries: THREE.BufferGeometry[] = [];

    const loadTexture = (src: string) =>
      new Promise<THREE.Texture>((resolve, reject) => {
        textureLoader.load(src, resolve, undefined, reject);
      });

    const oldMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1, depthWrite: false });
    const newMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false });
    disposableMaterials.push(oldMaterial, newMaterial);

    const backgroundGeometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    disposableGeometries.push(backgroundGeometry);
    const oldPlane = new THREE.Mesh(backgroundGeometry, oldMaterial);
    const newPlane = new THREE.Mesh(backgroundGeometry, newMaterial);
    oldPlane.position.set(0, 0, -4.5);
    newPlane.position.set(0, -0.04, -4.55);
    scene.add(oldPlane, newPlane);
    disposableObjects.push(oldPlane, newPlane);

    const starCount = isMobileViewport() ? 420 : 760;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      const radius = THREE.MathUtils.randFloat(6, 24);
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      starPositions[i * 3] = Math.cos(theta) * radius;
      starPositions[i * 3 + 1] = THREE.MathUtils.randFloat(-2.4, 9.6);
      starPositions[i * 3 + 2] = -THREE.MathUtils.randFloat(7, 34);
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xdcefff,
      size: isMobileViewport() ? 0.018 : 0.014,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const starfield = new THREE.Points(starGeometry, starMaterial);
    starfield.visible = starsEnabled;
    scene.add(starfield);
    disposableObjects.push(starfield);
    disposableGeometries.push(starGeometry);
    disposableMaterials.push(starMaterial);

    const networkGroup = new THREE.Group();
    networkGroup.position.set(0, -2.08, -6.6);
    networkGroup.rotation.x = -1.23;
    networkGroup.visible = gridEnabled;
    scene.add(networkGroup);
    disposableObjects.push(networkGroup);

    const runwayGeometry = new THREE.PlaneGeometry(7.5, 16, 1, 1);
    const runwayMaterial = new THREE.MeshBasicMaterial({
      color: 0x08111f,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const runwayPlane = new THREE.Mesh(runwayGeometry, runwayMaterial);
    runwayPlane.position.z = -0.6;
    networkGroup.add(runwayPlane);
    disposableGeometries.push(runwayGeometry);
    disposableMaterials.push(runwayMaterial);

    const nodeCount = isMobileViewport() ? 150 : 260;
    const nodeGeometry = new THREE.BoxGeometry(0.028, 0.012, 0.028);
    const cyanNodeMaterial = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.68, blending: THREE.AdditiveBlending });
    const amberNodeMaterial = new THREE.MeshBasicMaterial({ color: 0xf6b65b, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending });
    const cyanNodes = new THREE.InstancedMesh(nodeGeometry, cyanNodeMaterial, nodeCount);
    const amberNodes = new THREE.InstancedMesh(nodeGeometry, amberNodeMaterial, Math.floor(nodeCount * 0.42));
    const dummy = new THREE.Object3D();
    for (let i = 0; i < nodeCount; i += 1) {
      const lane = i % 12;
      const row = Math.floor(i / 12);
      const x = (lane - 5.5) * 0.42 + (row % 2) * 0.08;
      const z = -7.2 + row * 0.34;
      dummy.position.set(x, 0.02 + (i % 3) * 0.006, z);
      dummy.scale.setScalar(i % 11 === 0 ? 1.8 : 1);
      dummy.updateMatrix();
      cyanNodes.setMatrixAt(i, dummy.matrix);
    }
    for (let i = 0; i < amberNodes.count; i += 1) {
      const lane = i % 8;
      const row = Math.floor(i / 8);
      const side = lane < 4 ? -1 : 1;
      const x = side * (1.55 + (lane % 4) * 0.36);
      const z = -6.9 + row * 0.5;
      dummy.position.set(x, 0.024, z);
      dummy.scale.setScalar(i % 9 === 0 ? 1.6 : 0.85);
      dummy.updateMatrix();
      amberNodes.setMatrixAt(i, dummy.matrix);
    }
    networkGroup.add(cyanNodes, amberNodes);
    disposableGeometries.push(nodeGeometry);
    disposableMaterials.push(cyanNodeMaterial, amberNodeMaterial);

    const hazeMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uOpacity: { value: 0.12 },
      },
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;

        uniform float uTime;
        uniform float uProgress;
        uniform float uOpacity;
        varying vec2 vUv;

        float hash(vec2 p) {
          p = fract(p * vec2(91.7, 437.2));
          p += dot(p, p + 21.13);
          return fract(p.x * p.y);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
        }

        void main() {
          vec2 uv = vUv;
          float column = exp(-pow((uv.x - 0.5) * 3.2, 2.0));
          float vertical = smoothstep(0.0, 0.2, uv.y) * (1.0 - smoothstep(0.88, 1.0, uv.y));
          float mist = noise(uv * vec2(4.0, 9.0) + vec2(uTime * 0.025, -uTime * 0.035));
          vec3 color = mix(vec3(0.02, 0.09, 0.16), vec3(0.06, 0.34, 0.54), mist);
          float alpha = column * vertical * uOpacity * (0.58 + 0.42 * mist);
          gl_FragColor = vec4(color, alpha);
        }
      `,
    });
    const hazeGeometry = new THREE.PlaneGeometry(5.4, 8.6, 1, 1);
    const hazePlane = new THREE.Mesh(hazeGeometry, hazeMaterial);
    hazePlane.position.set(0, 0.4, -3.2);
    hazePlane.visible = hazeEnabled;
    scene.add(hazePlane);
    disposableObjects.push(hazePlane);
    disposableGeometries.push(hazeGeometry);
    disposableMaterials.push(hazeMaterial);

    const foregroundOccluderGeometry = new THREE.PlaneGeometry(2.8, 5.8, 1, 1);
    disposableGeometries.push(foregroundOccluderGeometry);
    const createForegroundOccluder = ({
      x,
      y,
      z,
      rotationZ,
      seed,
      opacity,
    }: {
      x: number;
      y: number;
      z: number;
      rotationZ: number;
      seed: number;
      opacity: number;
    }) => {
      const material = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.NormalBlending,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 0 },
          uSeed: { value: seed },
          uWarmth: { value: opacity },
        },
        vertexShader: `
          varying vec2 vUv;

          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          precision highp float;

          uniform float uTime;
          uniform float uOpacity;
          uniform float uSeed;
          uniform float uWarmth;
          varying vec2 vUv;

          float hash(vec2 p) {
            p = fract(p * vec2(123.34, 345.45));
            p += dot(p, p + 34.23);
            return fract(p.x * p.y);
          }

          float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(
              mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
              mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
              u.y
            );
          }

          void main() {
            vec2 uv = vUv;
            vec2 p = uv - 0.5;
            p.x += sin((uv.y + uSeed) * 7.0 + uTime * 0.18) * 0.08;
            float core = exp(-pow(p.x * 2.2, 2.0));
            float feather = smoothstep(0.0, 0.22, uv.y) * (1.0 - smoothstep(0.68, 1.0, uv.y));
            float turbulence = noise(uv * vec2(4.0, 11.0) + vec2(uSeed * 3.0, -uTime * 0.05));
            float streak = smoothstep(0.24, 0.88, core + turbulence * 0.24);
            float alpha = streak * feather * uOpacity * (0.62 + turbulence * 0.32);
            vec3 cool = vec3(0.72, 0.86, 0.94);
            vec3 warm = vec3(0.94, 0.9, 0.76);
            vec3 color = mix(cool, warm, uWarmth * 0.7);
            gl_FragColor = vec4(color, alpha);
          }
        `,
      });
      const mesh = new THREE.Mesh(foregroundOccluderGeometry, material);
      mesh.position.set(x, y, z);
      mesh.rotation.z = rotationZ;
      scene.add(mesh);
      disposableObjects.push(mesh);
      disposableMaterials.push(material);
      return {
        baseX: x,
        baseY: y,
        baseZ: z,
        mesh,
        material,
        opacity,
        rotationZ,
      };
    };

    const foregroundOccluders = [
      createForegroundOccluder({ x: -1.22, y: 0.34, z: -1.6, rotationZ: 0.18, seed: 0.13, opacity: 0.28 }),
      createForegroundOccluder({ x: 0.96, y: 0.18, z: -1.42, rotationZ: -0.12, seed: 0.37, opacity: 0.22 }),
      createForegroundOccluder({ x: 0.06, y: -0.26, z: -1.22, rotationZ: 0.04, seed: 0.61, opacity: 0.18 }),
    ];

    let frame = 0;
    let disposed = false;
    let smoothedProgress = 0;
    let lastTime = performance.now();
    let texturesReady = false;
    let renderedOnce = false;
    let sceneOnscreen = true;
    let pageVisible = !document.hidden;
    let lastManualRenderNonce = 0;

    const sizeBackgroundPlanes = () => {
      const rect = mount.getBoundingClientRect();
      const width = Math.max(rect.width, 1);
      const height = Math.max(rect.height, 1);
      const pixelRatio = isMobileViewport()
        ? Math.min(window.devicePixelRatio || 1, WAITLIST_PERFORMANCE.mobileTransitionPixelRatio)
        : Math.min(window.devicePixelRatio || 1, WAITLIST_PERFORMANCE.desktopTransitionPixelRatio);
      const postScale = isMobileViewport() ? WAITLIST_PERFORMANCE.mobileTransitionPostScale : WAITLIST_PERFORMANCE.desktopTransitionPostScale;
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      composer.setPixelRatio(pixelRatio * postScale);
      composer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      frostPass.uniforms.uResolution.value.set(width, height);
      chromaticPass.uniforms.uResolution.value.set(width, height);
      bloomPass.setSize(width, height);

      if (diagnosticsEnabled) {
        window.console.info("[waitlist-transition] renderer metrics", {
          canvas: { width, height, pixelRatio },
          composerPixelRatio: pixelRatio * postScale,
          mobile: isMobileViewport(),
          renderers: 2,
          canvases: 2,
          passes: {
            render: true,
            bloom: postprocessingEnabled,
            frost: postprocessingEnabled,
            chromatic: postprocessingEnabled,
          },
          toggles: {
            postprocessingEnabled,
            starsEnabled,
            hazeEnabled,
            gridEnabled,
          },
        });
      }

      const distance = camera.position.z - oldPlane.position.z;
      const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * distance;
      const visibleWidth = visibleHeight * camera.aspect;
      oldPlane.scale.set(visibleWidth * 1.08, visibleHeight * 1.08, 1);
      newPlane.scale.copy(oldPlane.scale);
      hazePlane.scale.set(THREE.MathUtils.clamp(camera.aspect * 1.2, 0.9, 2.4), 1, 1);
    };

    sizeBackgroundPlanes();
    window.addEventListener("resize", sizeBackgroundPlanes);
    window.addEventListener("orientationchange", sizeBackgroundPlanes);
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        sceneOnscreen = Boolean(entries[0]?.isIntersecting);
      },
      { threshold: 0.05 },
    );
    intersectionObserver.observe(mount);

    Promise.all([
      loadTexture("/cinematic/backgrounds/boarding-portal-entry-background-transition.png"),
      loadTexture("/cinematic/backgrounds/skybyrd-scroll-wave-background.jpg"),
    ])
      .then(([oldTexture, newTexture]) => {
        if (disposed) {
          oldTexture.dispose();
          newTexture.dispose();
          return;
        }
        oldTexture.colorSpace = THREE.SRGBColorSpace;
        newTexture.colorSpace = THREE.SRGBColorSpace;
        oldTexture.minFilter = THREE.LinearFilter;
        oldTexture.magFilter = THREE.LinearFilter;
        newTexture.minFilter = THREE.LinearFilter;
        newTexture.magFilter = THREE.LinearFilter;
        oldTexture.wrapS = THREE.ClampToEdgeWrapping;
        oldTexture.wrapT = THREE.ClampToEdgeWrapping;
        newTexture.wrapS = THREE.ClampToEdgeWrapping;
        newTexture.wrapT = THREE.ClampToEdgeWrapping;
        oldMaterial.map = oldTexture;
        newMaterial.map = newTexture;
        oldMaterial.needsUpdate = true;
        newMaterial.needsUpdate = true;
        loadedTextures.push(oldTexture, newTexture);
        texturesReady = true;
      })
      .catch(() => {
        texturesReady = true;
      });

    const render = (now: number) => {
      if (disposed) {
        return;
      }

      const debugFlags = perfEnabled ? getWebglPerfDebugFlagsSnapshot() : null;
      pageVisible = !document.hidden;
      if (document.hidden) {
        lastTime = now;
        if (perfEnabled) {
          reportWebglFrame({
            source: "transition",
            now,
            frameMs: 0,
            renderLoopActive: false,
            renderLoopPaused: true,
            pageVisible: false,
            sceneOnscreen,
            scrollProgress: clamp01(smoothedProgress),
            scrollPhase: "offscreen",
            qualityTier: prefersReducedMotion ? "reduced-motion" : isMobileViewport() ? "mobile" : "desktop",
            postprocessingScale: isMobileViewport() ? WAITLIST_PERFORMANCE.mobileTransitionPostScale : WAITLIST_PERFORMANCE.desktopTransitionPostScale,
            activePostprocessingPasses: [],
            postprocessingEnabled,
            bloomEnabled: postprocessingEnabled && bloomEnabled,
            frostEnabled: false,
            chromaticEnabled: false,
            globeVisible: Boolean(debugFlags?.globeVisible ?? true),
            globeRotating: Boolean(debugFlags?.globeRotation ?? true),
            globeAtmosphereEnabled: Boolean(debugFlags?.globeAtmosphere ?? true),
            globeRoutesEnabled: Boolean(debugFlags?.globeRoutes ?? true),
            globeCityLightsEnabled: Boolean(debugFlags?.globeCities ?? true),
            starfieldEnabled: Boolean(debugFlags?.starfield ?? true),
            gridEnabled: Boolean(debugFlags?.grid ?? true),
            hazeEnabled: Boolean(debugFlags?.haze ?? true),
            renderer,
            canvas: renderer.domElement,
          });
        }
        frame = window.requestAnimationFrame(render);
        return;
      }

      const pauseRequested = Boolean(perfEnabled && debugFlags?.pauseRenderLoop);
      const manualRenderNonce = Number(debugFlags?.manualRenderNonce ?? 0);
      const manualRenderRequested = pauseRequested && manualRenderNonce !== lastManualRenderNonce;
      if (manualRenderRequested) {
        lastManualRenderNonce = manualRenderNonce;
      }
      if (pauseRequested && !manualRenderRequested) {
        if (perfEnabled) {
          reportWebglFrame({
            source: "transition",
            now,
            frameMs: 0,
            renderLoopActive: false,
            renderLoopPaused: true,
            pageVisible,
            sceneOnscreen,
            scrollProgress: clamp01(smoothedProgress),
            scrollPhase: sceneOnscreen ? "idle" : "offscreen",
            qualityTier: prefersReducedMotion ? "reduced-motion" : isMobileViewport() ? "mobile" : "desktop",
            postprocessingScale: isMobileViewport() ? WAITLIST_PERFORMANCE.mobileTransitionPostScale : WAITLIST_PERFORMANCE.desktopTransitionPostScale,
            activePostprocessingPasses: [],
            postprocessingEnabled,
            bloomEnabled: postprocessingEnabled && bloomEnabled,
            frostEnabled: false,
            chromaticEnabled: false,
            globeVisible: Boolean(debugFlags?.globeVisible ?? true),
            globeRotating: Boolean(debugFlags?.globeRotation ?? true),
            globeAtmosphereEnabled: Boolean(debugFlags?.globeAtmosphere ?? true),
            globeRoutesEnabled: Boolean(debugFlags?.globeRoutes ?? true),
            globeCityLightsEnabled: Boolean(debugFlags?.globeCities ?? true),
            starfieldEnabled: Boolean(debugFlags?.starfield ?? true),
            gridEnabled: Boolean(debugFlags?.grid ?? true),
            hazeEnabled: Boolean(debugFlags?.haze ?? true),
            renderer,
            canvas: renderer.domElement,
          });
        }
        lastTime = now;
        frame = window.requestAnimationFrame(render);
        return;
      }

      const delta = THREE.MathUtils.clamp((now - lastTime) / 1000, 1 / 120, 1 / 20);
      lastTime = now;
      const sourceProgress = Math.max(scrollProgressRef.current, scrollTriggerProgressRef.current);
      const targetProgress = prefersReducedMotion ? smoothstep(0.35, 0.88, sourceProgress) : sourceProgress;
      const damping = prefersReducedMotion ? 8 : 13;
      smoothedProgress = lerp(smoothedProgress, targetProgress, 1 - Math.exp(-damping * delta));
      if (Math.abs(smoothedProgress - targetProgress) < 0.0005) {
        smoothedProgress = targetProgress;
      }

      const activation = firstScrollIntentRef.current || smoothedProgress > 0.001 ? 1 : 0;
      const p = clamp01(smoothedProgress) * activation;
      const mobile = isMobileViewport();
      const transitionShot = getLiveGlobeTransitionShotState({
        progress: p,
        layout: mobile ? "mobile" : "desktop",
      });
      const phase1 = smoothstep(0, 0.32, p);
      const earlyOnramp = prefersReducedMotion
        ? 0
        : getEarlyTransitionOnrampStrength({
            gestureCount: earlyForwardGestureCountRef.current,
            progress: p,
            minimumGestureCount: WAITLIST_SCROLL_TRANSITION.earlyDistortionGestureCount,
            progressStart: WAITLIST_SCROLL_TRANSITION.earlyDistortionProgressStart,
            progressEnd: WAITLIST_SCROLL_TRANSITION.earlyDistortionProgressEnd,
            maxStrength: WAITLIST_SCROLL_TRANSITION.earlyDistortionMaxStrength,
          });
      const fallbackEarlyOnramp = prefersReducedMotion
        ? 0
        : getEarlyTransitionOnrampStrength({
            gestureCount: firstScrollIntentRef.current ? 1 : 0,
            progress: p,
            minimumGestureCount: 1,
            progressStart: WAITLIST_SCROLL_TRANSITION.earlyDistortionFallbackStart,
            progressEnd: WAITLIST_SCROLL_TRANSITION.earlyDistortionFallbackEnd,
            maxStrength: WAITLIST_SCROLL_TRANSITION.earlyDistortionFallbackStrength,
          });
      const effectiveEarlyOnramp = Math.max(earlyOnramp, fallbackEarlyOnramp);
      const effectiveEarlyOnrampFactor = Math.max(
        getEarlyTransitionOnrampFactor({
          strength: earlyOnramp,
          maxStrength: WAITLIST_SCROLL_TRANSITION.earlyDistortionMaxStrength,
        }),
        getEarlyTransitionOnrampFactor({
          strength: fallbackEarlyOnramp,
          maxStrength: WAITLIST_SCROLL_TRANSITION.earlyDistortionFallbackStrength,
        }),
      );
      const frostPeak = prefersReducedMotion ? 0 : Math.max(bell(p, 0.52, 0.24), effectiveEarlyOnramp);
      const chromaPeak = prefersReducedMotion ? 0 : bell(p, 0.58, 0.2);
      const hazeRise = transitionShot.occlusionProgress;
      const hazeFall = transitionShot.revealProgress;
      const underlayReveal = prefersReducedMotion ? transitionShot.revealProgress : smoothstep(0.6, 0.88, p);
      const runwayAxisAlign = smoothstep(0.74, 0.98, p);
      const hazeOpacity = prefersReducedMotion
        ? lerp(0.08, 0.16, smoothstep(0.56, 0.86, p))
        : lerp(0.12, 0.68, hazeRise * (1 - hazeFall * 0.22)) + effectiveEarlyOnrampFactor * 0.06;
      const oldSceneOpacity = prefersReducedMotion
        ? 1 - smoothstep(0.56, 0.92, p)
        : 1 - smoothstep(0.56, 0.96, p);
      const newSceneOpacity = Math.min(1, underlayReveal * 0.76 + transitionShot.revealProgress * 0.34);
      const gridOpacity = lerp(0.22, 0.62, smoothstep(0.46, 0.94, p)) * (1 - smoothstep(0.96, 1, p) * 0.12);

      camera.position.z = prefersReducedMotion
        ? WAITLIST_SCROLL_TRANSITION.cameraStartZ
        : lerp(WAITLIST_SCROLL_TRANSITION.cameraStartZ, mobile ? WAITLIST_SCROLL_TRANSITION.cameraEndZ + 0.95 : WAITLIST_SCROLL_TRANSITION.cameraEndZ + 0.7, transitionShot.cameraTravelProgress);
      camera.position.x = prefersReducedMotion
        ? 0
        : lerp(transitionShot.cameraDriftX * 0.65, 0, runwayAxisAlign);
      camera.position.y = prefersReducedMotion
        ? 0.15
        : lerp(0.18, mobile ? -0.12 : -0.08, transitionShot.cameraLiftMix);
      camera.rotation.x = prefersReducedMotion ? 0 : lerp(-0.018, mobile ? 0.052 : 0.036, transitionShot.cameraTravelProgress);

      oldPlane.position.y = lerp(0, 0.08, phase1);
      newPlane.position.y = lerp(-0.26, 0.03, underlayReveal);
      oldMaterial.opacity = oldSceneOpacity;
      newMaterial.opacity = newSceneOpacity;
      starMaterial.opacity = lerp(0.45, 0.72, phase1) * (1 - newSceneOpacity * 0.12);
      cyanNodeMaterial.opacity = WAITLIST_SCROLL_TRANSITION.gridOpacity * gridOpacity;
      amberNodeMaterial.opacity = 0.62 * WAITLIST_SCROLL_TRANSITION.gridOpacity * gridOpacity;
      runwayMaterial.opacity = 0.07 + underlayReveal * 0.14 + gridOpacity * 0.18;
      starfield.visible = starsEnabled;
      networkGroup.visible = gridEnabled;
      hazePlane.visible = hazeEnabled;
      networkGroup.position.x = lerp(transitionShot.cameraDriftX * -0.42, 0, runwayAxisAlign);
      networkGroup.position.z = lerp(-7.15, -5.05, underlayReveal);
      networkGroup.position.y = lerp(-2.16, -1.82, smoothstep(0.68, 1, p));
      networkGroup.rotation.x = lerp(-1.28, -1.18, runwayAxisAlign);
      starfield.position.y = -transitionShot.cameraTravelProgress * 0.32;
      starfield.position.z = transitionShot.cameraTravelProgress * 1.08;
      oldPlane.position.x = transitionShot.cameraDriftX * -0.08;
      newPlane.position.x = lerp(transitionShot.cameraDriftX * -0.16, 0, runwayAxisAlign);
      runwayPlane.position.x = 0;
      runwayPlane.position.y = lerp(0.02, -0.015, runwayAxisAlign);
      runwayPlane.scale.set(
        lerp(0.92, 1.04, underlayReveal),
        lerp(0.88, 1.02, underlayReveal),
        1,
      );

      hazeMaterial.uniforms.uTime.value = now / 1000;
      hazeMaterial.uniforms.uProgress.value = p;
      hazeMaterial.uniforms.uOpacity.value = hazeOpacity * WAITLIST_SCROLL_TRANSITION.hazeIntensity;
      hazePlane.scale.setScalar(lerp(1, 1.36, hazeRise * (1 - hazeFall * 0.42)));
      hazePlane.position.z = lerp(-1.2, -0.3, transitionShot.occlusionProgress);
      hazePlane.position.x = transitionShot.cameraDriftX * -0.24;

      const occluderPassProgress = transitionShot.occlusionProgress * (1 - transitionShot.revealProgress * 0.42);
      foregroundOccluders.forEach((occluder, index) => {
        occluder.material.uniforms.uTime.value = now / 1000;
        occluder.material.uniforms.uOpacity.value = occluder.opacity * occluderPassProgress;
        occluder.mesh.position.x =
          occluder.baseX +
          transitionShot.cameraDriftX * (index === 1 ? -4.4 : -3.2) +
          occluderPassProgress * (index === 1 ? -0.7 : 0.56);
        occluder.mesh.position.y =
          occluder.baseY +
          Math.sin(now * 0.00032 + index * 1.8) * 0.05 +
          occluderPassProgress * (index === 2 ? 0.12 : -0.08);
        occluder.mesh.position.z = occluder.baseZ + occluderPassProgress * (index === 2 ? 0.28 : 0.16);
        occluder.mesh.rotation.z = occluder.rotationZ + occluderPassProgress * (index === 1 ? -0.2 : 0.16);
      });

      frostPass.uniforms.uTime.value = now / 1000;
      frostPass.uniforms.uProgress.value = p;
      const earlyFrostStrength = effectiveEarlyOnrampFactor * 0.12;
      const effectiveFrostStrength = Math.max(frostPeak * 0.34, transitionShot.occlusionProgress * 0.38, earlyFrostStrength);
      frostPass.uniforms.uFrostStrength.value = effectiveFrostStrength;
      frostPass.uniforms.uDisplacementStrength.value = Math.max(
        frostPeak * (mobile ? 0.024 : 0.038) + transitionShot.occlusionProgress * (mobile ? 0.012 : 0.018),
        effectiveEarlyOnrampFactor * (mobile ? 0.0065 : 0.0095),
      );
      frostPass.uniforms.uNoiseScale.value = lerp(8.2, 5.8, Math.max(frostPeak, transitionShot.occlusionProgress));
      chromaticPass.uniforms.uStrength.value = Math.max(
        chromaPeak * (mobile ? 0.0022 : WAITLIST_SCROLL_TRANSITION.chromaticAberration),
        transitionShot.occlusionProgress * (mobile ? 0.0012 : 0.0018),
      );
      bloomPass.strength = prefersReducedMotion
        ? 0.28
        : lerp(mobile ? 0.18 : 0.28, mobile ? 0.5 : 0.76, Math.max(bell(p, 0.72, 0.18), transitionShot.occlusionProgress));
      bloomPass.radius = 0.35;
      bloomPass.threshold = 0.15;
      frostPass.enabled =
        postprocessingEnabled &&
        frostEnabled &&
        (frostPeak > 0.018 || effectiveEarlyOnrampFactor > 0.08);
      chromaticPass.enabled = postprocessingEnabled && chromaticEnabled && chromaPeak > 0.018;
      bloomPass.enabled = postprocessingEnabled && bloomEnabled && p > 0.001 && p < 0.995;
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.density = prefersReducedMotion ? 0.008 : 0.012 + hazeOpacity * 0.028;
      }

      const transitionChanging = Math.abs(smoothedProgress - targetProgress) > 0.0007 || (p > 0.001 && p < 0.999);
      const activePasses = [
        bloomPass.enabled ? "bloom" : "",
        frostPass.enabled ? "frost" : "",
        chromaticPass.enabled ? "chromatic" : "",
      ].filter(Boolean);
      if (texturesReady && (!renderedOnce || transitionChanging)) {
        composer.render();
        renderedOnce = true;
      }
      if (perfEnabled) {
        const scrollPhase: ScrollPhase = !sceneOnscreen ? "offscreen" : p < 0.24 ? "hero" : p < 0.7 ? "transition" : p < 0.995 ? "chapter" : "idle";
        reportWebglFrame({
          source: "transition",
          now,
          frameMs: delta * 1000,
          renderLoopActive: transitionChanging,
          renderLoopPaused: pauseRequested && !manualRenderRequested,
          pageVisible,
          sceneOnscreen,
          scrollProgress: p,
          scrollPhase,
          qualityTier: prefersReducedMotion ? "reduced-motion" : mobile ? "mobile" : "desktop",
          postprocessingScale: mobile ? WAITLIST_PERFORMANCE.mobileTransitionPostScale : WAITLIST_PERFORMANCE.desktopTransitionPostScale,
          activePostprocessingPasses: activePasses,
          postprocessingEnabled,
          bloomEnabled: bloomPass.enabled,
          frostEnabled: frostPass.enabled,
          chromaticEnabled: chromaticPass.enabled,
          globeVisible: Boolean(debugFlags?.globeVisible ?? true),
          globeRotating: Boolean(debugFlags?.globeRotation ?? true),
          globeAtmosphereEnabled: Boolean(debugFlags?.globeAtmosphere ?? true),
          globeRoutesEnabled: Boolean(debugFlags?.globeRoutes ?? true),
          globeCityLightsEnabled: Boolean(debugFlags?.globeCities ?? true),
          starfieldEnabled: starsEnabled,
          gridEnabled: gridEnabled,
          hazeEnabled: hazeEnabled,
          renderer,
          canvas: renderer.domElement,
        });
      }
      frame = window.requestAnimationFrame(render);
    };

    frame = window.requestAnimationFrame(render);

    return () => {
      disposed = true;
      scrollTrigger.kill();
      window.removeEventListener("resize", sizeBackgroundPlanes);
      window.removeEventListener("orientationchange", sizeBackgroundPlanes);
      intersectionObserver.disconnect();
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      loadedTextures.forEach((texture) => texture.dispose());
      disposableObjects.forEach((object) => {
        if (object.parent) {
          object.parent.remove(object);
        }
      });
      disposableGeometries.forEach((geometry) => geometry.dispose());
      disposableMaterials.forEach((material) => material.dispose());
      composer.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      mount.removeChild(renderer.domElement);
    };
  }, [
    bloomEnabled,
    chromaticEnabled,
    scrollProgressRef,
    firstScrollIntentRef,
    forcedQuality,
    frostEnabled,
    postprocessingEnabled,
    perfEnabled,
    starsEnabled,
    hazeEnabled,
    gridEnabled,
    diagnosticsEnabled,
  ]);

  return <div ref={mountRef} className={styles.backgroundTransitionMount} aria-hidden="true" />;
}

function LiveGlobeCanvas({
  onReady,
  textureSet,
  grade,
  globeEnabled,
  routesEnabled,
  aircraftEnabled,
  rotationEnabled,
  atmosphereEnabled,
  cityLightsEnabled,
  diagnosticsEnabled,
  scrollProgressRef,
  orbProgressRef,
  autoCompleteActiveRef,
  autoRewindActiveRef,
  manualReverseHoldActiveRef,
  manualScrollDirectionRef,
  lastManualScrollInputMsRef,
  materializeSignalRef,
  perfEnabled,
  forcedQuality,
}: {
  onReady: () => void;
  textureSet: TextureSet;
  grade: GradeConfig;
  globeEnabled: boolean;
  routesEnabled: boolean;
  aircraftEnabled: boolean;
  rotationEnabled: boolean;
  atmosphereEnabled: boolean;
  cityLightsEnabled: boolean;
  diagnosticsEnabled: boolean;
  scrollProgressRef: React.MutableRefObject<number>;
  orbProgressRef: React.MutableRefObject<number>;
  autoCompleteActiveRef: React.MutableRefObject<boolean>;
  autoRewindActiveRef: React.MutableRefObject<boolean>;
  manualReverseHoldActiveRef: React.MutableRefObject<boolean>;
  manualScrollDirectionRef: React.MutableRefObject<-1 | 0 | 1>;
  lastManualScrollInputMsRef: React.MutableRefObject<number>;
  materializeSignalRef: React.MutableRefObject<number>;
  perfEnabled: boolean;
  forcedQuality: ForcedQuality;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return;
    }
    if (!globeEnabled) {
      const readyFrame = window.requestAnimationFrame(() => onReady());
      return () => window.cancelAnimationFrame(readyFrame);
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
    const constructionShellMaterials: THREE.ShaderMaterial[] = [];
    const aircraftMaterials: THREE.MeshPhongMaterial[] = [];
    const aircraftEntries: AircraftEntry[] = [];
    const supportAircraftEntries: AircraftEntry[] = [];
    const aircraftGlowTextures: THREE.Texture[] = [];
    const glassCardMaterials: THREE.Material[] = [];
    const glassCardGeometries: THREE.BufferGeometry[] = [];
    let baseGlobeY = 0;
    let baseGlobeScale = 1;
    let isMobileLayout = false;
    let sceneOnscreen = true;
    let lastManualRenderNonce = 0;
    let currentScrollProgress = 0;
    let currentOrbProgress = 0;
    let rewindHeroReturnStartScrollProgress = 1;
    let lastMaterializeSignal = materializeSignalRef.current;
    let materializeStartTime = -1;
    let materializeProgress = 0;
    let constructionShellMesh: THREE.Object3D | null = null;
    let globeRouteGroup: THREE.Group | null = null;
    let globeRouteEntries: RouteCurveEntry[] = [];
    let globePointerId: number | null = null;
    let globePointerLastX = 0;
    let globePointerLastY = 0;
    let globePointerLastTime = 0;
    let globeTargetYaw = 0;
    let globeTargetPitch = 0;
    let globeYaw = 0;
    let globePitch = 0;
    let globeYawVelocity = 0;
    let globePitchVelocity = 0;
    const projectedGlobeCenter = new THREE.Vector3();
    const projectedGlobeEdge = new THREE.Vector3();
    const heroFlight: HeroFlightController = {
      mode: "ROUTE_IDLE",
      sourceEntry: null,
      actor: null,
      launchCurve: null,
      returnCurve: null,
      routeProgress: 0,
      snapshotScale: 1,
      snapshotOpacity: 1,
      launchStartTime: -1,
      returnStartTime: -1,
      transitionProgress: 0,
      resumedFromCurrentPose: false,
      glassRecoveryMode: false,
      glassDropStartTime: -1,
    };

    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = grade.rendererExposure;
    let activePixelRatio = 1;
    let minPixelRatio = 1;
    let maxPixelRatio = 1;
    let performanceSampleFrames = 0;
    let smoothedFps = 60;
    let lastRenderTime = 0;
    let visibilityPaused = false;
    let diagnosticsLogged = false;
    let loopActiveState = false;
    let supportRouteScanAccumulator = 0;
    const resolveMobileLayout = (width: number) => {
      if (forcedQuality === "mobile") {
        return true;
      }
      if (forcedQuality === "desktop") {
        return false;
      }
      return width < 760;
    };
    const getTargetFrameInterval = () => {
      if (!isMobileLayout) {
        loopActiveState = true;
        return 1000 / WAITLIST_PERFORMANCE.desktopFrameRate;
      }

      const pointerActive = globePointerId !== null;
      const inertialMotion = Math.abs(globeYawVelocity) > 0.0008 || Math.abs(globePitchVelocity) > 0.0008;
      const scrollTransitionActive = currentOrbProgress > 0.002 && currentOrbProgress < 0.998;
      const materializeActive = materializeProgress < 0.995 || materializeStartTime < 0;
      const aircraftTransitionActive = heroFlight.mode !== "ROUTE_IDLE";
      const active =
        pointerActive ||
        inertialMotion ||
        scrollTransitionActive ||
        materializeActive ||
        aircraftTransitionActive ||
        autoCompleteActiveRef.current ||
        autoRewindActiveRef.current;
      loopActiveState = active;
      return 1000 / (active ? WAITLIST_PERFORMANCE.mobileActiveFrameRate : WAITLIST_PERFORMANCE.mobileIdleFrameRate);
    };
    const getPixelRatioBounds = (width: number) => {
      const devicePixelRatio = window.devicePixelRatio || 1;
      const isMobile = resolveMobileLayout(width);
      const lowMobile = isMobile && (width <= 520 || devicePixelRatio > 2.6);
      const max = isMobile
        ? Math.min(devicePixelRatio, lowMobile ? WAITLIST_PERFORMANCE.lowMobileGlobeMaxPixelRatio : WAITLIST_PERFORMANCE.mobileGlobeMaxPixelRatio)
        : Math.min(Math.max(devicePixelRatio * 1.08, devicePixelRatio), WAITLIST_PERFORMANCE.desktopGlobeMaxPixelRatio);
      const min = isMobile
        ? Math.min(max, WAITLIST_PERFORMANCE.mobileGlobeMinPixelRatio)
        : Math.min(max, Math.max(WAITLIST_PERFORMANCE.desktopGlobeMinPixelRatio, Math.min(devicePixelRatio * 0.88, 1.9)));
      return { min: Math.min(min, max), max };
    };
    const setPixelRatio = (nextPixelRatio: number) => {
      const nextRatio = Math.round(nextPixelRatio * 100) / 100;
      if (Math.abs(nextRatio - activePixelRatio) < 0.01) {
        return;
      }
      renderer.setPixelRatio(nextRatio);
      activePixelRatio = nextRatio;
      performanceSampleFrames = 0;
      smoothedFps = 60;
    };
    const updatePixelRatio = (width: number, preferMaxQuality = false) => {
      const bounds = getPixelRatioBounds(width);
      minPixelRatio = bounds.min;
      maxPixelRatio = bounds.max;
      const nextRatio = preferMaxQuality
        ? maxPixelRatio
        : THREE.MathUtils.clamp(activePixelRatio, minPixelRatio, maxPixelRatio);
      setPixelRatio(nextRatio);
    };
    const readOrbProgress = () => {
      if (prefersReducedMotion) {
        return 0;
      }

      return THREE.MathUtils.clamp(orbProgressRef.current, 0, 1);
    };
    const applyGlobeOrbTransform = () => {
      currentScrollProgress = prefersReducedMotion ? 0 : THREE.MathUtils.clamp(scrollProgressRef.current, 0, 1);
      const progress = readOrbProgress();
      currentOrbProgress = progress;
      const transitionShot = getLiveGlobeTransitionShotState({
        progress: currentScrollProgress,
        layout: isMobileLayout ? "mobile" : "desktop",
      });
      const finalScale = isMobileLayout ? 0.24 : 0.23;
      const finalY = isMobileLayout ? 0.78 : 1.12;
      const cameraZ = isMobileLayout ? WAITLIST_SCROLL_TRANSITION.cameraStartZ : WAITLIST_SCROLL_TRANSITION.cameraStartZ - 0.2;
      const cameraEndZ = isMobileLayout
        ? WAITLIST_SCROLL_TRANSITION.cameraEndZ + 0.85
        : WAITLIST_SCROLL_TRANSITION.cameraEndZ + 0.55;
      const cameraTravel = transitionShot.cameraTravelProgress;
      const collapseProgress = transitionShot.collapseProgress;
      const preCollapseScale = THREE.MathUtils.lerp(1, isMobileLayout ? 0.88 : 0.84, cameraTravel);
      const settledScale = THREE.MathUtils.lerp(preCollapseScale, finalScale, collapseProgress);
      const globeLift = THREE.MathUtils.lerp(
        THREE.MathUtils.lerp(0, isMobileLayout ? 0.18 : 0.24, cameraTravel),
        finalY,
        transitionShot.globeLiftMix,
      );
      globeRig.position.set(0, baseGlobeY + globeLift, 0);
      globeRig.scale.setScalar(baseGlobeScale * settledScale);
      camera.position.x = THREE.MathUtils.lerp(
        transitionShot.cameraDriftX,
        0,
        transitionShot.terminalCenteringProgress,
      );
      camera.position.z = THREE.MathUtils.lerp(cameraZ, cameraEndZ, cameraTravel);
      camera.position.y = (isMobileLayout ? 0.01 : 0.03) + THREE.MathUtils.lerp(0, isMobileLayout ? 0.22 : 0.28, transitionShot.cameraLiftMix);
      camera.rotation.x = THREE.MathUtils.lerp(isMobileLayout ? -0.025 : -0.018, isMobileLayout ? -0.082 : -0.072, cameraTravel);
      for (const material of routeShaderMaterials) {
        material.uniforms.globeCenter.value.copy(globeRig.position);
      }
    };
    const updateGlassCardTransform = () => {
      if (!glassCardLoaded || !glassCardRoot) {
        glassCardRig.visible = false;
        return;
      }

      const transitionState = getGlassCardTransitionState({
        currentScrollProgress,
        isMobileLayout,
      });
      const { presence } = transitionState;
      glassCardRig.visible = presence > 0.001;
      if (!glassCardRig.visible) {
        return;
      }

      glassCardRig.position.set(
        transitionState.x,
        transitionState.y,
        transitionState.z,
      );
      glassCardRig.scale.set(
        transitionState.scale.x,
        transitionState.scale.y,
        transitionState.scale.z,
      );
      glassCardRig.rotation.set(
        transitionState.rotation.x,
        transitionState.rotation.y,
        transitionState.rotation.z,
      );

      for (const material of glassCardMaterials) {
        if ("opacity" in material && typeof material.opacity === "number") {
          const baseOpacity = typeof material.userData.baseOpacity === "number" ? material.userData.baseOpacity : 1;
          material.opacity = baseOpacity * Math.pow(presence, 1.65);
        }
      }
    };
    const pickVoxelBudget = (desktop: number, mobile: number, lowMobile: number) => {
      const width = mount.getBoundingClientRect().width;
      if (isMobileLayout && (width <= 520 || window.devicePixelRatio > 2.2)) {
        return lowMobile;
      }
      return isMobileLayout ? mobile : desktop;
    };
    const startMaterialize = (elapsed: number) => {
      materializeStartTime = elapsed;
      materializeProgress = 0;
      if (constructionShellMesh) {
        constructionShellMesh.visible = true;
      }
    };
    const initialBounds = mount.getBoundingClientRect();
    isMobileLayout = resolveMobileLayout(initialBounds.width);
    updatePixelRatio(initialBounds.width, true);
    mount.appendChild(renderer.domElement);
    renderer.domElement.dataset.globeInteraction = "true";

    const heroPlaneRig = new THREE.Group();
    heroPlaneRig.name = "hero-plane-rig";
    const heroLaunchArcRig = new THREE.Group();
    heroLaunchArcRig.name = "hero-launch-arc-rig";
    const glassCardRig = new THREE.Group();
    glassCardRig.name = "glass-card-rig";
    glassCardRig.visible = false;
    scene.add(globeRig);
    scene.add(heroPlaneRig);
    scene.add(heroLaunchArcRig);
    scene.add(glassCardRig);
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
      // A single asset error should not unlock the scroll choreography before
      // the rest of the scene, especially the glass-card target, has settled.
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
      transparent: true,
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
        materializeProgress: { value: 0 },
        materializeTime: { value: 0 },
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
          float continentLift = pow(smoothstep(0.3, 0.82, elevationSignal), 1.28) * landMask * (1.0 - iceMask * 0.72);
          float dayLuma = dot(daySample, vec3(0.299, 0.587, 0.114));
          float detailLuma = dot(detailSample, vec3(0.299, 0.587, 0.114));
          float terrainMicro = smoothstep(
            0.02,
            0.14,
            abs(dayLuma - detailLuma) + abs(daySample.r - daySample.g) * 0.42 + abs(daySample.g - daySample.b) * 0.18
          ) * landMask * (1.0 - iceMask * 0.35);
          float arcticTerrain = smoothstep(0.46, 0.96, sphereY) * landMask * (terrainMicro * 0.08 + iceMask * 0.18);
          vec3 displaced = position + normal * (continentLift * 0.018 + terrainMicro * 0.007 + iceMask * 0.0015 + arcticTerrain * 0.0018);
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
        uniform float materializeProgress;
        uniform float materializeTime;
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
          float materializeCoord = clamp((sphereY + 1.0) * 0.5, 0.0, 1.0);
          float materializeCell = fract(sin(dot(floor(vSpherePosition * 56.0), vec3(12.9898, 78.233, 37.719))) * 43758.5453);
          float materializeEdgeCoord = materializeCoord + (materializeCell - 0.5) * 0.07;
          float materializeResolveProgress = materializeProgress + smoothstep(0.82, 1.0, materializeProgress) * 0.09;
          float materializeReveal = smoothstep(materializeEdgeCoord - 0.03, materializeEdgeCoord + 0.075, materializeResolveProgress);
          float materializeEdge = 1.0 - smoothstep(0.0, 0.055, abs(materializeEdgeCoord - materializeResolveProgress));
          if (materializeReveal < 0.01) discard;
          vec3 constructionBlue = vec3(0.02, 0.26, 0.58);
          vec3 constructionEdge = vec3(0.33, 0.82, 1.0) * (0.72 + materializeEdge * 1.1);
          color = mix(constructionBlue, color, materializeReveal);
          color += constructionEdge * materializeEdge * (0.28 + materializeCell * 0.18);
          gl_FragColor = vec4(color, materializeReveal);
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
        materializeProgress: { value: 0 },
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
        uniform float materializeProgress;
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
          float materializeCoord = clamp((vWorldNormal.y + 1.0) * 0.5, 0.0, 1.0);
          float materializeReveal = smoothstep(materializeCoord - 0.04, materializeCoord + 0.1, materializeProgress);
          alpha *= materializeReveal;
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
        materializeProgress: { value: 0 },
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
        uniform float materializeProgress;
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
          float materializeCoord = clamp((sphereY + 1.0) * 0.5, 0.0, 1.0);
          haloAlpha *= smoothstep(materializeCoord - 0.06, materializeCoord + 0.14, materializeProgress);
          gl_FragColor = vec4(haloColor, haloAlpha);
        }
      `,
    });
    const atmosphereBaseColor = new THREE.Color(grade.atmosphereColor);
    const atmosphereAliveColor = new THREE.Color(0x28cfff);
    const cityHaloBaseColor = new THREE.Color(grade.cityHaloColor);
    const cityHaloAliveColor = new THREE.Color(0xfff8e8);

    const orbAuraMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      uniforms: {
        auraColor: { value: new THREE.Color(0x32d8ff) },
        progress: { value: 0 },
        time: { value: 0 },
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
        uniform vec3 auraColor;
        uniform float progress;
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vSpherePosition;
        varying vec3 vWorldPosition;

        void main() {
          vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
          float fresnel = 1.0 - max(dot(vNormal, viewDirection), 0.0);
          float rim = pow(fresnel, 11.0);
          float needle = pow(fresnel, 34.0);
          float electric = 0.54 + 0.46 * pow(max(sin(time * 5.6 + vSpherePosition.y * 11.0 + vSpherePosition.x * 6.0), 0.0), 1.7);
          float sparkle = pow(max(sin(time * 9.6 + vSpherePosition.x * 20.0 - vSpherePosition.z * 17.0), 0.0), 5.0);
          float topBias = smoothstep(-0.32, 0.94, vSpherePosition.y);
          float alpha = progress * (rim * 0.24 + needle * 0.86 + sparkle * rim * 0.12) * (0.34 + topBias * 0.78) * electric;
          if (alpha < 0.002) discard;
          vec3 color = mix(auraColor, vec3(0.58, 0.94, 1.0), needle * 0.36 + sparkle * 0.18);
          gl_FragColor = vec4(color, alpha);
        }
      `,
    });

    const updateOrbAliveLook = (elapsed: number) => {
      const energy = Math.pow(currentOrbProgress, 1.18);
      const shellMode = THREE.MathUtils.smoothstep(currentOrbProgress, ORB_SHELL_MODE_START, ORB_SHELL_MODE_FULL);
      const supportTrafficVisibility = 1 - shellMode;
      const shellRouteVisibility = THREE.MathUtils.lerp(1, 0.24, shellMode);
      const globeReveal = THREE.MathUtils.smootherstep(materializeProgress, 0, 1);
      const cityReveal = THREE.MathUtils.smootherstep(materializeProgress, 0.58, 1);
      const routeReveal = THREE.MathUtils.smootherstep(materializeProgress, 0.38, 1);
      const shimmer = 0.5 + 0.5 * Math.sin(elapsed * 4.2);
      const quickFlicker = 0.5 + 0.5 * Math.sin(elapsed * 9.4 + Math.sin(elapsed * 1.7) * 1.6);
      const pulse = shimmer * 0.64 + quickFlicker * 0.36;
      renderer.toneMappingExposure = grade.rendererExposure * (1 + energy * (0.72 + pulse * 0.32));
      earthMaterial.uniforms.materializeProgress.value = globeReveal;
      earthMaterial.uniforms.materializeTime.value = elapsed;
      cityMaterial.opacity = grade.cityOpacity * (1 + energy * (2.6 + pulse * 1.35)) * cityReveal;
      cityHaloMaterial.opacity = grade.cityHaloOpacity * (1 + energy * (7.2 + pulse * 3.4)) * cityReveal;
      cityHaloMaterial.color.copy(cityHaloBaseColor).lerp(cityHaloAliveColor, energy * 0.94);
      cloudMaterial.uniforms.materializeProgress.value = globeReveal;
      cloudMaterial.uniforms.opacity.value = Math.min(grade.cloudOpacity + 0.1 + energy * (0.18 + pulse * 0.07), 0.58);
      atmosphereMaterial.uniforms.materializeProgress.value = globeReveal;
      atmosphereMaterial.uniforms.strength.value = grade.atmosphereStrength * (1 + energy * (8.4 + pulse * 4.2));
      atmosphereMaterial.uniforms.glowColor.value.copy(atmosphereBaseColor).lerp(atmosphereAliveColor, energy * (0.98 + pulse * 0.02));
      orbAuraMaterial.uniforms.progress.value = energy * (2.65 + pulse * 1.75);
      orbAuraMaterial.uniforms.time.value = elapsed;
      const aircraftReveal = THREE.MathUtils.smootherstep(materializeProgress, 0.74, 1);
      const supportAircraftRevealScale = THREE.MathUtils.lerp(0.001, 1, aircraftReveal * supportTrafficVisibility);
      for (const entry of aircraftEntries) {
        entry.revealOpacity = aircraftReveal * supportTrafficVisibility;
        entry.revealScale = supportAircraftRevealScale;
      }
      if (heroFlight.actor) {
        heroFlight.actor.revealOpacity = aircraftReveal;
        heroFlight.actor.revealScale = THREE.MathUtils.lerp(0.001, 1, aircraftReveal);
      }
      const shellVisible = materializeProgress < 0.985;
      if (constructionShellMesh) {
        constructionShellMesh.visible = shellVisible;
      }
      if (globeRouteGroup) {
        globeRouteGroup.visible = routesEnabled && shellRouteVisibility > 0.035;
      }
      heroPlaneRig.visible = heroFlight.mode !== "ROUTE_IDLE" || supportTrafficVisibility > 0.035;
      if (shellVisible) {
        for (const material of constructionShellMaterials) {
          material.uniforms.materializeProgress.value = globeReveal;
          material.uniforms.time.value = elapsed;
        }
      }
      for (const material of routeShaderMaterials) {
        const baseOpacity = typeof material.userData.baseOpacity === "number" ? material.userData.baseOpacity : material.uniforms.opacity.value;
        material.uniforms.opacity.value = baseOpacity * shellRouteVisibility * (1 + energy * (2.1 + pulse * 0.9));
        material.uniforms.aliveProgress.value = energy * THREE.MathUtils.lerp(1, 0.42, shellMode);
        material.uniforms.materializeProgress.value = routeReveal;
        material.uniforms.time.value = elapsed;
      }
    };

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
          aliveProgress: { value: 0 },
          materializeProgress: { value: 0 },
          time: { value: 0 },
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
          uniform float aliveProgress;
          uniform float materializeProgress;
          uniform float time;
          varying vec3 vWorldPosition;
          varying vec2 vUv;

          void main() {
            vec3 cameraDirection = normalize(cameraPosition - globeCenter);
            float hemisphereFacing = dot(normalize(vWorldPosition - globeCenter), cameraDirection);
            float front = smoothstep(-0.08, 0.18, hemisphereFacing);
            float edgeFade = sin(vUv.x * 3.14159265);
            edgeFade = pow(max(edgeFade, 0.0), 0.72);
            float routeReveal = smoothstep(vUv.x - 0.08, vUv.x + 0.14, materializeProgress);
            float travelingSpark = fract(vUv.x * 2.4 - time * 0.34);
            float sparkCore = pow(max(1.0 - abs(travelingSpark * 2.0 - 1.0), 0.0), 8.0);
            float carrierWave = 0.68 + 0.32 * sin(vUv.x * 28.0 + time * 4.4);
            float alpha = opacity * edgeFade * mix(0.22, 1.0, front) * routeReveal * (1.0 + aliveProgress * (carrierWave * 0.22 + sparkCore * front * 0.92));
            if (alpha < 0.01) discard;
            vec3 energizedColor = mix(routeColor, vec3(0.94, 0.99, 1.0), aliveProgress * sparkCore * front * 0.42);
            gl_FragColor = vec4(energizedColor, alpha);
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

    const createGlobeConstructionShell = (radius: number) => {
      const shellCount = pickVoxelBudget(5200, 1600, 720);
      const cubeSize = pickVoxelBudget(0.010, 0.013, 0.017);
      const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize, 1, 1, 1);
      routeDisposables.push(cubeGeometry);
      const heights = new Float32Array(shellCount);
      const delays = new Float32Array(shellCount);
      const flickers = new Float32Array(shellCount);
      const colors = new Float32Array(shellCount);
      const matrix = new THREE.Matrix4();
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const shellRadius = radius * 1.012;

      for (let index = 0; index < shellCount; index += 1) {
        const y = 1 - (index / Math.max(1, shellCount - 1)) * 2;
        const radial = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = index * goldenAngle;
        const position = new THREE.Vector3(
          Math.cos(theta) * radial * shellRadius,
          y * shellRadius,
          Math.sin(theta) * radial * shellRadius,
        );
        const randomA = Math.abs(Math.sin(index * 12.9898 + y * 78.233) * 43758.5453) % 1;
        const randomB = Math.abs(Math.sin(index * 4.898 + radial * 65.311) * 23421.631) % 1;
        matrix.makeTranslation(position.x, position.y, position.z);
        heights[index] = (y + 1) * 0.5;
        delays[index] = randomA;
        flickers[index] = randomB;
        colors[index] = randomA > 0.88 ? 1 : randomB * 0.62;
      }

      cubeGeometry.setAttribute("aHeight", new THREE.InstancedBufferAttribute(heights, 1));
      cubeGeometry.setAttribute("aDelay", new THREE.InstancedBufferAttribute(delays, 1));
      cubeGeometry.setAttribute("aFlicker", new THREE.InstancedBufferAttribute(flickers, 1));
      cubeGeometry.setAttribute("aColorMix", new THREE.InstancedBufferAttribute(colors, 1));

      const shellMaterial = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: true,
        blending: THREE.AdditiveBlending,
        uniforms: {
          materializeProgress: { value: 0 },
          time: { value: 0 },
        },
        vertexShader: `
          attribute float aHeight;
          attribute float aDelay;
          attribute float aFlicker;
          attribute float aColorMix;
          uniform float materializeProgress;
          uniform float time;
          varying float vAlpha;
          varying float vEdge;
          varying float vColorMix;

          void main() {
            float activation = clamp(aHeight + (aDelay - 0.5) * 0.08, 0.0, 1.0);
            float build = smoothstep(activation - 0.035, activation + 0.08, materializeProgress);
            float edge = 1.0 - smoothstep(0.0, 0.07, abs(materializeProgress - activation));
            float fade = 1.0 - smoothstep(0.78, 0.98, materializeProgress);
            float shimmer = 0.76 + 0.24 * sin(time * (8.0 + aFlicker * 6.0) + aFlicker * 18.0);
            float scale = max(0.001, build * fade * (0.55 + edge * 0.9) * shimmer);
            vec3 transformed = (instanceMatrix * vec4(position * scale, 1.0)).xyz;
            transformed += normal * edge * (0.006 + aDelay * 0.008);
            vAlpha = build * fade * (0.28 + edge * 0.9) * shimmer;
            vEdge = edge;
            vColorMix = aColorMix;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
          }
        `,
        fragmentShader: `
          varying float vAlpha;
          varying float vEdge;
          varying float vColorMix;

          void main() {
            if (vAlpha < 0.01) discard;
            vec3 deepBlue = vec3(0.02, 0.16, 0.34);
            vec3 electricBlue = vec3(0.18, 0.68, 1.0);
            vec3 cityGold = vec3(1.0, 0.72, 0.34);
            vec3 color = mix(deepBlue, electricBlue, 0.64 + vEdge * 0.28);
            color = mix(color, cityGold, smoothstep(0.82, 1.0, vColorMix) * (0.28 + vEdge * 0.34));
            gl_FragColor = vec4(color, vAlpha);
          }
        `,
      });
      constructionShellMaterials.push(shellMaterial);

      const shell = new THREE.InstancedMesh(cubeGeometry, shellMaterial, shellCount);
      for (let index = 0; index < shellCount; index += 1) {
        const y = 1 - (index / Math.max(1, shellCount - 1)) * 2;
        const radial = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = index * goldenAngle;
        matrix.makeTranslation(
          Math.cos(theta) * radial * shellRadius,
          y * shellRadius,
          Math.sin(theta) * radial * shellRadius,
        );
        shell.setMatrixAt(index, matrix);
      }
      shell.instanceMatrix.needsUpdate = true;
      shell.renderOrder = 20;
      shell.frustumCulled = false;
      return shell;
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

    const createAircraftGlowTexture = (width: number, height: number, verticalPower: number) => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) {
        return null;
      }
      const centerX = width * 0.5;
      const centerY = height * 0.5;
      for (let x = 0; x < width; x += 1) {
        for (let y = 0; y < height; y += 1) {
          const nx = Math.abs((x - centerX) / Math.max(centerX, 1));
          const ny = Math.abs((y - centerY) / Math.max(centerY, 1));
          const horizontal = Math.pow(Math.max(1 - nx, 0), 2.2);
          const vertical = Math.pow(Math.max(1 - ny, 0), verticalPower);
          const alpha = horizontal * vertical;
          const value = Math.floor(255 * alpha);
          context.fillStyle = `rgba(255,255,255,${value / 255})`;
          context.fillRect(x, y, 1, 1);
        }
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      aircraftGlowTextures.push(texture);
      return texture;
    };

    const aircraftGlowCoreTexture = createAircraftGlowTexture(128, 128, 2.4);
    const aircraftGlowStreakTexture = createAircraftGlowTexture(256, 80, 6.5);
    const aircraftContrailTexture = createAircraftGlowTexture(192, 104, 3.4);

    const aircraftUp = new THREE.Vector3();
    const aircraftPoint = new THREE.Vector3();
    const aircraftTangent = new THREE.Vector3();
    const aircraftTrailTangent = new THREE.Vector3();
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
    const aircraftNearBodyColor = new THREE.Color(0xc0cada);
    const aircraftFarBodyColor = new THREE.Color(0x546076);
    const aircraftBodyColor = new THREE.Color();
    const aircraftSpecularNear = new THREE.Color(0xd8e3f6);
    const aircraftSpecularFar = new THREE.Color(0x5e6f8f);
    const aircraftSpecularColor = new THREE.Color();
    const heroGlowWarm = new THREE.Color(0xff7b22);
    const heroGlowHot = new THREE.Color(0xffcf92);
    const contrailFarColor = new THREE.Color(0xf6fbff);
    const aircraftTargetQuaternion = new THREE.Quaternion();
    const aircraftFinalQuaternion = new THREE.Quaternion();
    const aircraftBankQuaternion = new THREE.Quaternion();
    const aircraftTargetScale = new THREE.Vector3();
    const aircraftWorldQuaternion = new THREE.Quaternion();
    const parentWorldPosition = new THREE.Vector3();
    const parentWorldQuaternion = new THREE.Quaternion();
    const parentWorldScale = new THREE.Vector3();
    const preservedWorldPosition = new THREE.Vector3();
    const preservedWorldQuaternion = new THREE.Quaternion();
    const preservedWorldScale = new THREE.Vector3();
    const launchCurvePoint = new THREE.Vector3();
    const launchCurveTangent = new THREE.Vector3();
    const launchFutureTangent = new THREE.Vector3();
    const launchControlA = new THREE.Vector3();
    const launchControlB = new THREE.Vector3();
    const launchTargetPoint = new THREE.Vector3();
    const launchTargetDirection = new THREE.Vector3();
    const launchTravelDirection = new THREE.Vector3();
    const launchSurfaceNormal = new THREE.Vector3();
    const launchCurveSafePoint = new THREE.Vector3();
    const preferredAircraftUp = new THREE.Vector3();
    const cameraFacingUp = new THREE.Vector3();
    const blendUp = new THREE.Vector3();
    const routeReturnPoint = new THREE.Vector3();
    const routeReturnTangent = new THREE.Vector3();
    const routeReturnWorldQuaternion = new THREE.Quaternion();
    const routeReturnNormal = new THREE.Vector3();
    const routeReturnOrbitPointA = new THREE.Vector3();
    const routeReturnOrbitPointB = new THREE.Vector3();
    const routeReturnOrbitPointC = new THREE.Vector3();
    const routeReturnOrbitNormal = new THREE.Vector3();
    const routeReturnRotation = new THREE.Quaternion();
    const routeReturnRotationStep = new THREE.Quaternion();
    const heroHiddenPoint = new THREE.Vector3();
    const glassCardTargetPoint = new THREE.Vector3();
    const glassCardEntryLocalPoint = new THREE.Vector3();
    const glassCardEntryWorldPoint = new THREE.Vector3();
    const glassCardCurrentPoint = new THREE.Vector3();
    const glassCardRecoveryTopPoint = new THREE.Vector3();
    const glassCardBoundsSize = new THREE.Vector3();
    const glassCardBoundsCenter = new THREE.Vector3();
    const glassCardWorldQuaternion = new THREE.Quaternion();
    const glassCardFinalPosition = new THREE.Vector3();
    const glassCardFinalScaleVector = new THREE.Vector3();
    const glassCardFinalMatrix = new THREE.Matrix4();
    const glassCardFinalEuler = new THREE.Euler();
    const routeMidpointWorld = new THREE.Vector3();
    const routeMidpointProjected = new THREE.Vector3();
    const routeFacingNormal = new THREE.Vector3();
    let heroLaunchArcGlowMaterial: THREE.ShaderMaterial | null = null;
    let heroLaunchArcCoreMaterial: THREE.ShaderMaterial | null = null;
    let heroLaunchArcGlowMesh: THREE.Mesh | null = null;
    let heroLaunchArcCoreMesh: THREE.Mesh | null = null;
    let glassCardRoot: THREE.Group | null = null;
    let glassCardLoaded = false;
    const getHeroJourneyScale = () => (isMobileLayout ? 1.12 : 1.18);
    const heroScaleNearDistance = () => globeRadius * globeRig.scale.x + 0.02;
    const getHeroScaleFromDistance = (point: THREE.Vector3) => {
      const heroJourneyScale = getHeroJourneyScale();
      const nearDistance = heroScaleNearDistance();
      const farDistance = Math.max(
        launchTargetPoint.distanceTo(globeRig.position),
        heroHiddenPoint.distanceTo(globeRig.position),
        nearDistance + 0.01,
      );
      const distanceProgress = THREE.MathUtils.clamp(
        (point.distanceTo(globeRig.position) - nearDistance) / Math.max(farDistance - nearDistance, 1e-4),
        0,
        1,
      );
      return THREE.MathUtils.lerp(
        heroJourneyScale * 0.24,
        heroJourneyScale,
        Math.pow(distanceProgress, 0.92),
      );
    };
    const worldUp = new THREE.Vector3(0, 1, 0);
    const worldDown = new THREE.Vector3(0, -1, 0);
    const worldForwardFallback = new THREE.Vector3(0, 0, 1);
    const globeRadius = 1.42;
    const heroLaunchSafeMargin = 0.08;
    const getGlassCardFinalMatrix = () => {
      if (!glassCardRoot) {
        return null;
      }

      const finalTransform = getGlassCardFinalTransform({ isMobileLayout });
      glassCardFinalPosition.set(finalTransform.x, finalTransform.y, finalTransform.z);
      glassCardFinalScaleVector.set(
        finalTransform.scale.x,
        finalTransform.scale.y,
        finalTransform.scale.z,
      );
      glassCardFinalEuler.set(
        finalTransform.rotation.x,
        finalTransform.rotation.y,
        finalTransform.rotation.z,
      );
      glassCardWorldQuaternion.setFromEuler(glassCardFinalEuler);
      glassCardFinalMatrix.compose(glassCardFinalPosition, glassCardWorldQuaternion, glassCardFinalScaleVector);
      return glassCardFinalMatrix.clone().multiply(glassCardRoot.matrix);
    };

    const getHeroJourneyStartPoint = () => {
      const glassCardFinalWorldMatrix = glassCardLoaded && glassCardRoot ? getGlassCardFinalMatrix() : null;
      if (glassCardFinalWorldMatrix) {
        const glassCardFinalTransform = getGlassCardFinalTransform({ isMobileLayout });
        glassCardEntryWorldPoint.copy(glassCardEntryLocalPoint).applyMatrix4(glassCardFinalWorldMatrix);
        const recoveryPath = getGlassCardRecoveryPath({
          entryPoint: {
            x: glassCardEntryWorldPoint.x,
            y: glassCardEntryWorldPoint.y,
            z: glassCardEntryWorldPoint.z,
          },
          preEntryOffset: isMobileLayout ? 0.16 : 0.2,
          recoveryLift: isMobileLayout ? 0.24 : 0.3,
        });
        launchTargetPoint.set(
          recoveryPath.reentryTopPoint.x,
          recoveryPath.reentryTopPoint.y,
          recoveryPath.reentryTopPoint.z,
        );
        launchTargetPoint.x = THREE.MathUtils.lerp(
          launchTargetPoint.x,
          glassCardFinalTransform.x * 0.9,
          0.72,
        );
        launchTargetPoint.y += isMobileLayout ? 0.03 : 0.02;
        launchTargetPoint.z += isMobileLayout ? 0.04 : 0.03;
        return launchTargetPoint;
      }

      launchTargetPoint.set(
        isMobileLayout ? -0.28 : -0.54,
        isMobileLayout ? 0.38 : 0.44,
        isMobileLayout ? 0.84 : 0.92,
      );
      return launchTargetPoint;
    };

    const getHeroJourneyDirection = () => {
      if (glassCardLoaded && glassCardRoot && getGlassCardFinalMatrix()) {
        launchTargetDirection.copy(worldDown);
        return launchTargetDirection;
      }

      launchTargetDirection.copy(worldDown);
      return launchTargetDirection;
    };

    const getGlassCardHeroEntryBlend = () =>
      THREE.MathUtils.smoothstep(
        currentScrollProgress,
        GLASS_CARD_HERO_ENTRY_START_PROGRESS,
        GLASS_CARD_HERO_ENTRY_END_PROGRESS,
      );

    const getHeroHiddenPoint = (lateralOffset: number, verticalOffset: number) => {
      globeToCamera.copy(camera.position).sub(globeRig.position).normalize();
      aircraftRight.crossVectors(worldUp, globeToCamera);
      if (aircraftRight.lengthSq() < 1e-5) {
        aircraftRight.set(1, 0, 0);
      } else {
        aircraftRight.normalize();
      }
      heroHiddenPoint
        .copy(globeRig.position)
        .addScaledVector(globeToCamera, -(globeRadius * globeRig.scale.x + 0.14))
        .addScaledVector(aircraftRight, lateralOffset)
        .addScaledVector(worldUp, verticalOffset);
      return heroHiddenPoint;
    };

    const getHeroLaunchOriginPoint = () =>
      getHeroHiddenPoint(0, isMobileLayout ? -0.04 : -0.06);

    const getHeroLaunchArcOriginPoint = () => {
      globeToCamera.copy(camera.position).sub(globeRig.position).normalize();
      heroHiddenPoint
        .copy(globeToCamera)
        .multiplyScalar(0.34)
        .addScaledVector(worldDown, 0.94)
        .normalize()
        .multiplyScalar(globeRadius * globeRig.scale.x + 0.026)
        .add(globeRig.position);
      return heroHiddenPoint;
    };

    const buildHeroLaunchDisplayCurve = (
      curve: THREE.Curve<THREE.Vector3>,
      progress: number,
      includeOrigin = true,
    ) => {
      const visibleStartProgress = 0.12;
      const samples = Math.max(3, Math.round(6 + progress * 28));
      const startProgress = Math.min(visibleStartProgress, progress);
      const points: THREE.Vector3[] = includeOrigin
        ? [getHeroLaunchArcOriginPoint().clone()]
        : [curve.getPointAt(startProgress)];
      for (let index = 1; index <= samples; index += 1) {
        const pointProgress = THREE.MathUtils.lerp(startProgress, progress, index / samples);
        points.push(curve.getPointAt(pointProgress));
      }
      return new THREE.CatmullRomCurve3(points, false, "centripetal", 0.48);
    };

    const createHeroGlassReconnectCurve = (topPoint: THREE.Vector3) => {
      const originPoint = getHeroLaunchArcOriginPoint().clone();
      const controls = getGlassCardReconnectControlPoints({
        originPoint: { x: originPoint.x, y: originPoint.y, z: originPoint.z },
        topPoint: { x: topPoint.x, y: topPoint.y, z: topPoint.z },
        sweepLift: isMobileLayout ? 0.28 : 0.36,
        verticalLeadIn: isMobileLayout ? 0.34 : 0.42,
      });
      launchControlA.set(controls.controlA.x, controls.controlA.y, controls.controlA.z);
      launchControlB.set(controls.controlB.x, controls.controlB.y, controls.controlB.z);
      return new THREE.CubicBezierCurve3(
        originPoint,
        launchControlA.clone(),
        launchControlB.clone(),
        topPoint.clone(),
      );
    };

    const buildHeroGlassReconnectDisplayCurve = (topPoint: THREE.Vector3, progress: number) =>
      buildHeroLaunchDisplayCurve(createHeroGlassReconnectCurve(topPoint), progress, true);

    const buildHeroGlassReconnectAndDropCurve = (topPoint: THREE.Vector3, currentPoint: THREE.Vector3) => {
      const path = new THREE.CurvePath<THREE.Vector3>();
      path.add(createHeroGlassReconnectCurve(topPoint));
      if (topPoint.distanceToSquared(currentPoint) > 1e-8) {
        path.add(new THREE.LineCurve3(topPoint.clone(), currentPoint.clone()));
      }
      return path;
    };

    const ensureHeroLaunchArc = (curve: THREE.Curve<THREE.Vector3>) => {
      const heroArcSegments = isMobileLayout ? WAITLIST_PERFORMANCE.mobileHeroArcSegments : WAITLIST_PERFORMANCE.desktopHeroArcSegments;
      const heroArcRadialSegments = isMobileLayout
        ? WAITLIST_PERFORMANCE.mobileHeroArcRadialSegments
        : WAITLIST_PERFORMANCE.desktopHeroArcRadialSegments;
      if (!heroLaunchArcGlowMaterial || !heroLaunchArcCoreMaterial || !heroLaunchArcGlowMesh || !heroLaunchArcCoreMesh) {
        heroLaunchArcGlowMaterial = createRouteMaterial({
          color: 0x8fe8ff,
          opacity: 0,
          additive: true,
        });
        heroLaunchArcGlowMaterial.userData.baseOpacity = 0.34;
        heroLaunchArcCoreMaterial = createRouteMaterial({
          color: 0x5fd6ff,
          opacity: 0,
          additive: true,
        });
        heroLaunchArcCoreMaterial.userData.baseOpacity = 0.92;
        routeMaterials.push(heroLaunchArcGlowMaterial, heroLaunchArcCoreMaterial);
        routeShaderMaterials.push(heroLaunchArcGlowMaterial, heroLaunchArcCoreMaterial);

        heroLaunchArcGlowMesh = new THREE.Mesh(
          new THREE.TubeGeometry(curve, heroArcSegments, 0.011, heroArcRadialSegments, false),
          heroLaunchArcGlowMaterial,
        );
        heroLaunchArcGlowMesh.renderOrder = 8;
        heroLaunchArcCoreMesh = new THREE.Mesh(
          new THREE.TubeGeometry(curve, heroArcSegments, 0.0047, heroArcRadialSegments, false),
          heroLaunchArcCoreMaterial,
        );
        heroLaunchArcCoreMesh.renderOrder = 9;
        routeDisposables.push(heroLaunchArcGlowMesh.geometry as THREE.BufferGeometry, heroLaunchArcCoreMesh.geometry as THREE.BufferGeometry);
        heroLaunchArcRig.add(heroLaunchArcGlowMesh, heroLaunchArcCoreMesh);
      } else {
        const nextGlowGeometry = new THREE.TubeGeometry(curve, heroArcSegments, 0.011, heroArcRadialSegments, false);
        const nextCoreGeometry = new THREE.TubeGeometry(curve, heroArcSegments, 0.0047, heroArcRadialSegments, false);
        routeDisposables.push(nextGlowGeometry, nextCoreGeometry);
        (heroLaunchArcGlowMesh.geometry as THREE.BufferGeometry).dispose();
        (heroLaunchArcCoreMesh.geometry as THREE.BufferGeometry).dispose();
        heroLaunchArcGlowMesh.geometry = nextGlowGeometry;
        heroLaunchArcCoreMesh.geometry = nextCoreGeometry;
      }
      heroLaunchArcGlowMaterial.uniforms.materializeProgress.value = 0;
      heroLaunchArcCoreMaterial.uniforms.materializeProgress.value = 0;
      heroLaunchArcGlowMaterial.uniforms.opacity.value = 0;
      heroLaunchArcCoreMaterial.uniforms.opacity.value = 0;
    };

    const setHeroLaunchArcState = (progress: number, glowOpacity: number, coreOpacity: number) => {
      if (!heroLaunchArcGlowMaterial || !heroLaunchArcCoreMaterial) {
        return;
      }
      heroLaunchArcGlowMaterial.uniforms.materializeProgress.value = progress;
      heroLaunchArcCoreMaterial.uniforms.materializeProgress.value = progress;
      heroLaunchArcGlowMaterial.uniforms.opacity.value = glowOpacity;
      heroLaunchArcCoreMaterial.uniforms.opacity.value = coreOpacity;
    };

    const getCameraFacingUpForDirection = (point: THREE.Vector3, direction: THREE.Vector3) => {
      cameraFacingUp.copy(camera.position).sub(point);
      const alongDirection = cameraFacingUp.dot(direction);
      cameraFacingUp.addScaledVector(direction, -alongDirection);
      if (cameraFacingUp.lengthSq() < 1e-5) {
        cameraFacingUp.copy(worldUp);
        if (Math.abs(cameraFacingUp.dot(direction)) > 0.96) {
          cameraFacingUp.set(1, 0, 0);
        }
      }
      return cameraFacingUp.normalize();
    };

    const reparentPreservingWorldTransform = (object: THREE.Object3D, newParent: THREE.Object3D) => {
      object.updateMatrixWorld(true);
      object.getWorldPosition(preservedWorldPosition);
      object.getWorldQuaternion(preservedWorldQuaternion);
      object.getWorldScale(preservedWorldScale);
      object.removeFromParent();
      newParent.add(object);
      newParent.updateMatrixWorld(true);
      newParent.getWorldPosition(parentWorldPosition);
      newParent.getWorldQuaternion(parentWorldQuaternion);
      newParent.getWorldScale(parentWorldScale);
      object.position.copy(preservedWorldPosition.sub(parentWorldPosition).applyQuaternion(parentWorldQuaternion.clone().invert()));
      object.position.divide(parentWorldScale);
      object.quaternion.copy(parentWorldQuaternion.clone().invert().multiply(preservedWorldQuaternion));
      object.scale.copy(preservedWorldScale.divide(parentWorldScale));
      object.updateMatrixWorld(true);
    };

    const orientAircraftForFreeFlight = (
      entry: AircraftEntry,
      point: THREE.Vector3,
      tangent: THREE.Vector3,
      scale: number,
      opacity: number,
      elapsed: number,
      curveProgress: number,
      preferredUpVector?: THREE.Vector3,
      rotationBlend = 0.12,
    ) => {
      launchTravelDirection.copy(tangent).normalize();
      if (launchTravelDirection.lengthSq() < 1e-5) {
        launchTravelDirection.copy(worldForwardFallback);
      }
      preferredAircraftUp.copy(preferredUpVector ?? worldUp);
      if (Math.abs(preferredAircraftUp.dot(launchTravelDirection)) > 0.96) {
        preferredAircraftUp.copy(worldUp);
        if (Math.abs(preferredAircraftUp.dot(launchTravelDirection)) > 0.96) {
          preferredAircraftUp.set(1, 0, 0);
        }
      }
      aircraftRight.crossVectors(preferredAircraftUp, launchTravelDirection);
      if (aircraftRight.lengthSq() < 1e-5) {
        aircraftRight.set(1, 0, 0);
      } else {
        aircraftRight.normalize();
      }
      aircraftUp.crossVectors(launchTravelDirection, aircraftRight).normalize();
      aircraftBasis.makeBasis(aircraftRight, aircraftUp, launchTravelDirection);
      entry.anchor.position.copy(point);
      aircraftTargetQuaternion.setFromRotationMatrix(aircraftBasis);
      const futureProgress = Math.min(curveProgress + 0.018, 1);
      const heroCurve =
        heroFlight.mode === "HERO_TRANSITION" ? heroFlight.launchCurve : heroFlight.mode === "HERO_RETURN" ? heroFlight.returnCurve : null;
      if (heroCurve) {
        heroCurve.getTangentAt(futureProgress, launchFutureTangent).normalize();
        const bankAmount = THREE.MathUtils.clamp(
          launchFutureTangent.sub(launchTravelDirection).dot(aircraftRight) * 2.2,
          -0.09,
          0.09,
        );
        entry.bank = THREE.MathUtils.lerp(entry.bank, bankAmount, 0.08);
      } else {
        entry.bank = THREE.MathUtils.lerp(entry.bank, 0, 0.08);
      }
      aircraftBankQuaternion.setFromAxisAngle(worldForwardFallback, entry.bank);
      aircraftFinalQuaternion.copy(aircraftTargetQuaternion).multiply(aircraftBankQuaternion);
      entry.pose.quaternion.slerp(aircraftFinalQuaternion, rotationBlend);
      entry.visual.quaternion.copy(AIRCRAFT_FORWARD_AXIS_CORRECTION);
      aircraftTargetScale.setScalar(scale);
      entry.anchor.scale.lerp(aircraftTargetScale, 0.12);

      globeToCamera.copy(camera.position).sub(point).normalize();
      const visibilityPresence = THREE.MathUtils.clamp(0.62 + Math.max(launchTravelDirection.dot(globeToCamera), -0.22) * 0.22, 0.42, 1);
      const isHeroActor = entry === heroFlight.actor;
      for (const material of entry.materials) {
        material.opacity = opacity;
        aircraftBodyColor.copy(aircraftFarBodyColor).lerp(aircraftNearBodyColor, visibilityPresence);
        material.color.copy(aircraftBodyColor);
        aircraftSpecularColor.copy(aircraftSpecularFar).lerp(aircraftSpecularNear, visibilityPresence);
        material.specular.copy(aircraftSpecularColor);
        material.shininess = THREE.MathUtils.lerp(20, 52, visibilityPresence);
        material.emissive.copy(isHeroActor ? heroGlowWarm : entry.routeGlowColor);
        material.emissiveIntensity = THREE.MathUtils.lerp(isHeroActor ? 0.48 : 0.3, isHeroActor ? 1.12 : 0.92, visibilityPresence);
      }

      const launchPulse = 0.78 + Math.pow(Math.max(Math.sin(elapsed * 1.08 + curveProgress * Math.PI * 2), 0), 3.4) * 1.2;
      const glowOpacity = THREE.MathUtils.lerp(isHeroActor ? 0.2 : 0.16, isHeroActor ? 0.46 : 0.34, visibilityPresence) * launchPulse * opacity;
      for (const material of entry.glowMaterials) {
        const glowGain = typeof material.userData.glowGain === "number" ? material.userData.glowGain : 1;
        if ("color" in material && material.color instanceof THREE.Color) {
          material.color.copy(isHeroActor ? heroGlowWarm.clone().lerp(heroGlowHot, 1 - glowGain * 0.35) : entry.routeGlowColor);
        }
        if ("opacity" in material) {
          material.opacity = glowOpacity * glowGain;
        }
      }

      for (const [index, trailPoint] of entry.trailPoints.entries()) {
        if (heroCurve) {
          const trailProgress = Math.max(curveProgress - (index + 1) * (isHeroActor ? HERO_CONTRAIL_STEP : 0.05), 0);
          heroCurve.getPointAt(trailProgress, aircraftTrailPoint);
          heroCurve.getTangentAt(Math.max(trailProgress - 0.01, 0), aircraftTrailTangent).normalize();
          if (isHeroActor) {
            const spread = index / Math.max(entry.trailPoints.length - 1, 1);
            const flutter = Math.sin(elapsed * 1.6 + index * 0.78) * 0.0028 * spread;
            const wake = Math.cos(elapsed * 1.12 + index * 0.44) * 0.0016 * spread;
            aircraftTrailPoint
              .addScaledVector(aircraftRight, flutter)
              .addScaledVector(aircraftUp, wake)
              .addScaledVector(aircraftTrailTangent, -0.012 * spread);
          }
          trailPoint.position.copy(aircraftTrailPoint);
        } else {
          aircraftTrailPoint.copy(point).addScaledVector(launchTravelDirection, -(index + 1) * 0.06);
          trailPoint.position.copy(aircraftTrailPoint);
        }
        const trailMaterial = (trailPoint as THREE.Mesh | THREE.Sprite).material as
          | THREE.MeshBasicMaterial
          | THREE.SpriteMaterial;
        const trailMix = index / Math.max(entry.trailPoints.length - 1, 1);
        if (trailPoint instanceof THREE.Sprite) {
          trailMaterial.opacity = 0;
        } else {
          trailMaterial.opacity = opacity * THREE.MathUtils.lerp(0.09, 0.016, trailMix);
        }
      }
    };

    const hideAircraftEntry = (entry: AircraftEntry) => {
      entry.anchor.scale.setScalar(0.001);
      for (const material of entry.materials) {
        material.opacity = 0;
      }
      for (const material of entry.glowMaterials) {
        if ("opacity" in material) {
          material.opacity = 0;
        }
      }
      for (const trailPoint of entry.trailPoints) {
        const trailMaterial = (trailPoint as THREE.Mesh | THREE.Sprite).material as
          | THREE.MeshBasicMaterial
          | THREE.SpriteMaterial;
        trailMaterial.opacity = 0;
      }
    };

    const getRouteFrontScore = (routeEntry: RouteCurveEntry, camera: THREE.PerspectiveCamera) => {
      routeMidpointWorld.copy(routeEntry.midpoint);
      globeRig.localToWorld(routeMidpointWorld);
      routeFacingNormal.copy(routeMidpointWorld).sub(globeRig.position).normalize();
      globeToCamera.copy(camera.position).sub(globeRig.position).normalize();
      const frontDot = routeFacingNormal.dot(globeToCamera);
      if (frontDot <= SUPPORT_ROUTE_MIN_FRONT) {
        return 0;
      }
      routeMidpointProjected.copy(routeMidpointWorld).project(camera);
      const centerBias = THREE.MathUtils.clamp(
        1 - Math.hypot(routeMidpointProjected.x * 0.86, routeMidpointProjected.y * 1.08) * 0.36,
        0,
        1,
      );
      return THREE.MathUtils.smoothstep(frontDot, SUPPORT_ROUTE_MIN_FRONT, 0.58) * (0.74 + centerBias * 0.26);
    };

    const updateSupportAircraftAssignments = (elapsed: number, delta: number, camera: THREE.PerspectiveCamera) => {
      if (supportAircraftEntries.length === 0 || globeRouteEntries.length === 0) {
        return;
      }

      for (const entry of supportAircraftEntries) {
        if (entry.pendingRouteEntry) {
          entry.assignmentOpacity = Math.max(0, entry.assignmentOpacity - delta * SUPPORT_ASSIGNMENT_FADE_OUT_PER_SECOND);
          if (entry.assignmentOpacity <= 0.05) {
            entry.routeEntry = entry.pendingRouteEntry;
            entry.routeGlowColor.set(entry.pendingRouteEntry.routeConfig.glowColor);
            entry.pendingRouteEntry = null;
            entry.assignmentLockUntil = elapsed + SUPPORT_ROUTE_ASSIGNMENT_LOCK_SECONDS;
            entry.progress = THREE.MathUtils.euclideanModulo(entry.progress + 0.19, 1);
          }
        } else {
          entry.assignmentOpacity = Math.min(1, entry.assignmentOpacity + delta * SUPPORT_ASSIGNMENT_FADE_IN_PER_SECOND);
        }
      }

      supportRouteScanAccumulator += delta;
      if (supportRouteScanAccumulator < SUPPORT_ROUTE_SCAN_INTERVAL_SECONDS) {
        return;
      }
      supportRouteScanAccumulator = 0;

      const heroRouteIndex = heroFlight.sourceEntry?.routeEntry.routeIndex ?? -1;
      const scoredRoutes = globeRouteEntries
        .filter((routeEntry) => routeEntry.routeIndex !== heroRouteIndex)
        .map((routeEntry) => ({ routeEntry, score: getRouteFrontScore(routeEntry, camera) }))
        .filter((candidate) => candidate.score > SUPPORT_ROUTE_MIN_FRONT)
        .sort((left, right) => right.score - left.score);

      const reservedRoutes = new Set<number>();
      for (const entry of supportAircraftEntries) {
        if (entry.pendingRouteEntry) {
          reservedRoutes.add(entry.pendingRouteEntry.routeIndex);
          continue;
        }
        const currentScore = getRouteFrontScore(entry.routeEntry, camera);
        if (currentScore >= SUPPORT_ROUTE_KEEP_FRONT) {
          reservedRoutes.add(entry.routeEntry.routeIndex);
        }
      }

      for (const entry of supportAircraftEntries) {
        if (entry.pendingRouteEntry || elapsed < entry.assignmentLockUntil) {
          continue;
        }
        const currentScore = getRouteFrontScore(entry.routeEntry, camera);
        if (currentScore >= SUPPORT_ROUTE_KEEP_FRONT && reservedRoutes.has(entry.routeEntry.routeIndex)) {
          continue;
        }
        const nextCandidate = scoredRoutes.find(
          (candidate) =>
            !reservedRoutes.has(candidate.routeEntry.routeIndex) &&
            candidate.routeEntry.routeIndex !== entry.routeEntry.routeIndex,
        );
        if (!nextCandidate) {
          continue;
        }
        entry.pendingRouteEntry = nextCandidate.routeEntry;
        reservedRoutes.add(nextCandidate.routeEntry.routeIndex);
      }
    };

    const resetHeroFlight = () => {
      if (heroFlight.actor) {
        hideAircraftEntry(heroFlight.actor);
        heroFlight.actor.bank = 0;
      }
      heroFlight.launchCurve = null;
      heroFlight.returnCurve = null;
      heroFlight.launchStartTime = -1;
      heroFlight.returnStartTime = -1;
      heroFlight.transitionProgress = 0;
      heroFlight.resumedFromCurrentPose = false;
      heroFlight.glassRecoveryMode = false;
      heroFlight.glassDropStartTime = -1;
      heroFlight.mode = "ROUTE_IDLE";
      setHeroLaunchArcState(0, 0, 0);
    };

    const startHeroFlight = (elapsed: number) => {
      if (!heroFlight.sourceEntry || !heroFlight.actor) {
        return;
      }

      getHeroLaunchOriginPoint();
      launchCurvePoint.copy(heroHiddenPoint);
      launchSurfaceNormal.copy(launchCurvePoint).sub(globeRig.position).normalize();
      heroFlight.routeProgress = heroFlight.sourceEntry.progress;
      heroFlight.snapshotScale = getHeroJourneyScale();
      heroFlight.snapshotOpacity = 1;
      getHeroJourneyStartPoint();
      getHeroJourneyDirection();
      heroFlight.launchCurve =
        glassCardLoaded && glassCardRoot
          ? createHeroGlassReconnectCurve(launchTargetPoint)
          : new THREE.CubicBezierCurve3(
              launchCurvePoint.clone(),
              launchControlA
                .copy(launchCurvePoint)
                .addScaledVector(launchSurfaceNormal, isMobileLayout ? 0.26 : 0.34)
                .addScaledVector(worldUp, isMobileLayout ? -0.02 : -0.04)
                .clone(),
              launchControlB
                .copy(launchTargetPoint)
                .addScaledVector(worldUp, isMobileLayout ? 0.24 : 0.3)
                .addScaledVector(new THREE.Vector3(1, 0, 0), isMobileLayout ? 0.025 : 0.05)
                .clone(),
              launchTargetPoint.clone(),
            );
      ensureHeroLaunchArc(heroFlight.launchCurve);
      heroFlight.actor.anchor.position.copy(launchCurvePoint);
      heroFlight.actor.anchor.scale.setScalar(0.001);
      heroFlight.launchStartTime = elapsed;
      heroFlight.returnCurve = null;
      heroFlight.returnStartTime = -1;
      heroFlight.transitionProgress = 0;
      heroFlight.resumedFromCurrentPose = false;
      heroFlight.glassRecoveryMode = false;
      heroFlight.glassDropStartTime = -1;
      heroFlight.mode = "HERO_TRANSITION";
    };

    const resumeHeroFlightFromCurrentPose = (elapsed: number) => {
      if (!heroFlight.actor) {
        return;
      }

      heroFlight.actor.anchor.updateMatrixWorld(true);
      heroFlight.actor.pose.updateMatrixWorld(true);
      heroFlight.actor.anchor.getWorldPosition(launchCurvePoint);
      heroFlight.actor.pose.getWorldQuaternion(aircraftWorldQuaternion);
      launchTravelDirection.set(0, 0, 1).applyQuaternion(aircraftWorldQuaternion).normalize();
      if (launchTravelDirection.lengthSq() < 1e-5) {
        launchTravelDirection.copy(worldForwardFallback);
      }
      heroFlight.snapshotScale = heroFlight.actor.anchor.scale.x;
      heroFlight.snapshotOpacity = 1;
      getHeroJourneyStartPoint();
      getHeroJourneyDirection();
      if (glassCardLoaded && currentScrollProgress >= GLASS_CARD_RISE_START_PROGRESS) {
        const recoveryPath = getGlassCardRecoveryPath({
          entryPoint: {
            x: glassCardEntryWorldPoint.x,
            y: glassCardEntryWorldPoint.y,
            z: glassCardEntryWorldPoint.z,
          },
          preEntryOffset: isMobileLayout ? 0.16 : 0.2,
          recoveryLift: isMobileLayout ? 0.24 : 0.3,
        });
        heroFlight.launchCurve = new THREE.CatmullRomCurve3(
          [
            launchCurvePoint.clone(),
            glassCardRecoveryTopPoint.set(
              recoveryPath.reentryTopPoint.x,
              recoveryPath.reentryTopPoint.y,
              recoveryPath.reentryTopPoint.z,
            ).clone(),
          ],
          false,
          "centripetal",
          0.42,
        );
        heroFlight.glassRecoveryMode = true;
        heroFlight.glassDropStartTime = -1;
      } else {
        launchControlA
          .copy(launchCurvePoint)
          .addScaledVector(launchTravelDirection, isMobileLayout ? 0.2 : 0.28)
          .addScaledVector(worldUp, isMobileLayout ? 0.05 : 0.08);
        launchControlB
          .copy(launchTargetPoint)
          .addScaledVector(worldUp, isMobileLayout ? 0.18 : 0.24)
          .addScaledVector(launchTargetDirection, isMobileLayout ? -0.12 : -0.18);
        heroFlight.launchCurve = new THREE.CubicBezierCurve3(
          launchCurvePoint.clone(),
          launchControlA.clone(),
          launchControlB.clone(),
          launchTargetPoint.clone(),
        );
        heroFlight.glassRecoveryMode = false;
        heroFlight.glassDropStartTime = -1;
      }
      ensureHeroLaunchArc(heroFlight.launchCurve);
      heroFlight.launchStartTime = elapsed;
      heroFlight.returnCurve = null;
      heroFlight.returnStartTime = -1;
      heroFlight.transitionProgress = 0;
      heroFlight.resumedFromCurrentPose = true;
      heroFlight.mode = "HERO_TRANSITION";
    };

    const startHeroReturn = (elapsed: number) => {
      if (!heroFlight.actor) {
        return;
      }

      heroFlight.actor.anchor.updateMatrixWorld(true);
      heroFlight.actor.pose.updateMatrixWorld(true);
      heroFlight.actor.anchor.getWorldPosition(launchCurvePoint);
      heroFlight.actor.pose.getWorldQuaternion(aircraftWorldQuaternion);
      launchTravelDirection.set(0, 0, 1).applyQuaternion(aircraftWorldQuaternion).normalize();
      getHeroHiddenPoint(isMobileLayout ? 0.14 : 0.22, isMobileLayout ? 0.02 : 0.06);
      routeReturnPoint.copy(heroHiddenPoint);
      routeReturnNormal.copy(routeReturnPoint).sub(globeRig.position).normalize();
      launchSurfaceNormal.copy(launchCurvePoint).sub(globeRig.position).normalize();
      routeReturnRotation.setFromUnitVectors(launchSurfaceNormal, routeReturnNormal);

      routeReturnRotationStep.identity().slerp(routeReturnRotation, 0.26);
      routeReturnOrbitNormal.copy(launchSurfaceNormal).applyQuaternion(routeReturnRotationStep).normalize();
      const returnOrbitClearance = isMobileLayout ? 0.28 : 0.34;
      routeReturnOrbitPointA
        .copy(routeReturnOrbitNormal)
        .multiplyScalar(globeRadius * globeRig.scale.x + returnOrbitClearance)
        .add(globeRig.position)
        .addScaledVector(worldUp, isMobileLayout ? 0.1 : 0.14);

      routeReturnRotationStep.identity().slerp(routeReturnRotation, 0.52);
      routeReturnOrbitNormal.copy(launchSurfaceNormal).applyQuaternion(routeReturnRotationStep).normalize();
      routeReturnOrbitPointB
        .copy(routeReturnOrbitNormal)
        .multiplyScalar(globeRadius * globeRig.scale.x + returnOrbitClearance)
        .add(globeRig.position)
        .addScaledVector(worldUp, isMobileLayout ? 0.08 : 0.1);

      routeReturnRotationStep.identity().slerp(routeReturnRotation, 0.78);
      routeReturnOrbitNormal.copy(launchSurfaceNormal).applyQuaternion(routeReturnRotationStep).normalize();
      routeReturnOrbitPointC
        .copy(routeReturnOrbitNormal)
        .multiplyScalar(globeRadius * globeRig.scale.x + (isMobileLayout ? 0.22 : 0.28))
        .add(globeRig.position)
        .addScaledVector(worldUp, isMobileLayout ? 0.03 : 0.05);

      heroFlight.returnCurve = new THREE.CatmullRomCurve3(
        [
          launchCurvePoint.clone(),
          routeReturnOrbitPointA.clone(),
          routeReturnOrbitPointB.clone(),
          routeReturnOrbitPointC.clone(),
          routeReturnPoint.clone(),
        ],
        false,
        "centripetal",
        0.42,
      );
      heroFlight.returnStartTime = elapsed;
      heroFlight.resumedFromCurrentPose = false;
      heroFlight.glassRecoveryMode = false;
      heroFlight.glassDropStartTime = -1;
      heroFlight.mode = "HERO_RETURN";
    };

    const addGlassCard = () => {
      const glassLoader = new GLTFLoader(loadingManager);
      glassLoader.load(GLASS_CARD_MODEL_PATH, (gltf) => {
        if (disposed) {
          return;
        }

        const normalizedRoot = gltf.scene;
        normalizedRoot.name = "glass-card-root";
        normalizedRoot.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(normalizedRoot);
        bounds.getCenter(glassCardBoundsCenter);
        bounds.getSize(glassCardBoundsSize);
        const width = Math.max(glassCardBoundsSize.x, 1e-4);
        normalizedRoot.position.sub(glassCardBoundsCenter);
        normalizedRoot.scale.setScalar(1 / width);
        normalizedRoot.updateMatrixWorld(true);

        const normalizedBounds = new THREE.Box3().setFromObject(normalizedRoot);
        let leftPaneBounds: THREE.Box3 | null = null;
        let rightPaneBounds: THREE.Box3 | null = null;
        normalizedRoot.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) {
            return;
          }

          child.castShadow = false;
          child.receiveShadow = false;
          child.renderOrder = 7;
          if (!glassCardGeometries.includes(child.geometry)) {
            glassCardGeometries.push(child.geometry);
          }
          const nextMaterials = (Array.isArray(child.material) ? child.material : [child.material]).map((material) => {
            if (!glassCardMaterials.includes(material)) {
              glassCardMaterials.push(material);
            }

            const isPaneMaterial =
              material.name === "SmokedNavyGlass" ||
              child.name.includes("SmokedGlassPane");
            const isBorderMaterial =
              material.name === "AmberGlow" ||
              material.name === "AmberSoftGlow" ||
              child.name.includes("border") ||
              child.name.includes("Glow") ||
              child.name.includes("CutEdge");

            let preparedMaterial = material;
            if (isPaneMaterial) {
              const baseColor =
                "color" in material && material.color instanceof THREE.Color
                  ? material.color.clone()
                  : new THREE.Color(0x12253d);
              preparedMaterial = new THREE.MeshPhysicalMaterial({
                color: baseColor.multiplyScalar(0.96),
                transparent: true,
                opacity: 0.9,
                metalness: 0.04,
                roughness: 0.16,
                transmission: 0.78,
                thickness: 0.34,
                ior: 1.14,
                reflectivity: 0.82,
                clearcoat: 0.92,
                clearcoatRoughness: 0.12,
                attenuationColor: new THREE.Color(0x17324d),
                attenuationDistance: 1.8,
                envMapIntensity: 1.25,
                side: THREE.DoubleSide,
              });
              preparedMaterial.depthWrite = false;
            } else if (isBorderMaterial) {
              const borderColor =
                "color" in material && material.color instanceof THREE.Color
                  ? material.color.clone()
                  : new THREE.Color(0xffc56f);
              const isSoftGlow = material.name === "AmberSoftGlow" || child.name.includes("SoftGlow");
              preparedMaterial = new THREE.MeshStandardMaterial({
                color: borderColor,
                emissive: borderColor.clone().multiplyScalar(isSoftGlow ? 0.74 : 0.92),
                emissiveIntensity: isSoftGlow ? 1.35 : 1.6,
                transparent: true,
                opacity: isSoftGlow ? 0.72 : 0.94,
                roughness: isSoftGlow ? 0.42 : 0.28,
                metalness: 0.08,
                side: THREE.DoubleSide,
              });
              preparedMaterial.depthWrite = false;
            }
            if (!glassCardMaterials.includes(preparedMaterial)) {
              glassCardMaterials.push(preparedMaterial);
            }
            if ("transparent" in preparedMaterial) {
              preparedMaterial.transparent = true;
            }
            if ("opacity" in preparedMaterial && typeof preparedMaterial.opacity === "number") {
              preparedMaterial.userData.baseOpacity = preparedMaterial.opacity;
            }
            return preparedMaterial;
          });
          child.material = Array.isArray(child.material) ? nextMaterials : nextMaterials[0];

          const childBounds = new THREE.Box3().setFromObject(child);
          if (childBounds.isEmpty() === false) {
            if (child.name.includes("LeftSmokedGlassPane")) {
              leftPaneBounds = childBounds.clone();
            }
            if (child.name.includes("RightSmokedGlassPane")) {
              rightPaneBounds = childBounds.clone();
            }
          }
        });
        const toGlassCardBoundsData = (bounds: THREE.Box3 | null) =>
          bounds
            ? {
                minX: bounds.min.x,
                maxX: bounds.max.x,
                minY: bounds.min.y,
                maxY: bounds.max.y,
                minZ: bounds.min.z,
                maxZ: bounds.max.z,
              }
            : null;
        const leftPaneBoundsData = toGlassCardBoundsData(leftPaneBounds);
        const rightPaneBoundsData = toGlassCardBoundsData(rightPaneBounds);
        const entryLocalPoint = getGlassCardEntryLocalPoint({
          normalizedBounds: {
            minX: normalizedBounds.min.x,
            maxX: normalizedBounds.max.x,
            minY: normalizedBounds.min.y,
            maxY: normalizedBounds.max.y,
            minZ: normalizedBounds.min.z,
            maxZ: normalizedBounds.max.z,
          },
          leftPaneBounds: leftPaneBoundsData,
          rightPaneBounds: rightPaneBoundsData,
        });
        glassCardEntryLocalPoint.set(entryLocalPoint.x, entryLocalPoint.y, entryLocalPoint.z);

        glassCardRoot = new THREE.Group();
        glassCardRoot.name = "glass-card-anchor";
        glassCardRoot.add(normalizedRoot);
        glassCardRig.add(glassCardRoot);
        glassCardLoaded = true;
      });
    };

    const applyAircraftPose = (
      entry: AircraftEntry,
      progress: number,
      camera: THREE.PerspectiveCamera,
      elapsed: number,
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
      aircraftPoint.addScaledVector(aircraftUp, AIRCRAFT_CLEARANCE);
      entry.anchor.position.copy(aircraftPoint);
      aircraftTargetQuaternion.setFromRotationMatrix(aircraftBasis);
      const bankAmount = THREE.MathUtils.clamp(
        aircraftFutureTangent.sub(aircraftTangent).dot(aircraftRight) * 2.3,
        -0.085,
        0.085,
      );
      entry.bank = THREE.MathUtils.lerp(entry.bank, bankAmount, 0.09);
      aircraftBankQuaternion.setFromAxisAngle(worldForwardFallback, entry.bank);
      aircraftFinalQuaternion.copy(aircraftTargetQuaternion).multiply(aircraftBankQuaternion);
      entry.pose.quaternion.slerp(aircraftFinalQuaternion, 0.14);
      entry.visual.quaternion.copy(AIRCRAFT_FORWARD_AXIS_CORRECTION);

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
      const roleScale = entry.config.role === "hero" ? 1.06 : 1;
      const assignmentVisibility = entry.config.role === "hero" ? 1 : entry.assignmentOpacity;
      const assignmentScale = entry.config.role === "hero" ? 1 : THREE.MathUtils.lerp(0.001, 1, assignmentVisibility);
      const visibilityPresence = THREE.MathUtils.clamp(depthPresence + entry.config.visibilityBias, 0, 1);
      const depthScale = THREE.MathUtils.lerp(0.76, 1.32, visibilityPresence) * entry.config.scaleMultiplier * roleScale;
      const routeScale = depthScale * routeProgressScale * entry.revealScale * assignmentScale;
      aircraftTargetScale.setScalar(routeScale);
      entry.anchor.scale.lerp(aircraftTargetScale, 0.14);
      const opacityMax = entry.config.role === "hero" ? 1 : 0.94;
      const heroPresenceBoost = entry.config.role === "hero" ? THREE.MathUtils.lerp(1.12, 1.36, visibilityPresence) : 1;
      const opacity = THREE.MathUtils.clamp(
        THREE.MathUtils.lerp(0.56, opacityMax, visibilityPresence) *
          entry.revealOpacity *
          assignmentVisibility *
          heroPresenceBoost,
        0,
        1,
      );
      for (const material of entry.materials) {
        material.opacity = opacity;
        aircraftBodyColor.copy(aircraftFarBodyColor).lerp(aircraftNearBodyColor, visibilityPresence);
        material.color.copy(aircraftBodyColor);
        aircraftSpecularColor.copy(aircraftSpecularFar).lerp(aircraftSpecularNear, visibilityPresence);
        material.specular.copy(aircraftSpecularColor);
        material.shininess = THREE.MathUtils.lerp(16, 44, visibilityPresence);
        material.emissive.copy(entry.routeGlowColor);
        material.emissiveIntensity = THREE.MathUtils.lerp(0.2, entry.config.role === "hero" ? 0.78 : 0.62, visibilityPresence);
      }
      const sunPulseBase = Math.sin(elapsed * 0.92 + entry.config.routeIndex * 0.77);
      const sunPulsePeak = Math.pow(Math.max(sunPulseBase, 0), 3.2);
      const sunPulse = 0.76 + sunPulsePeak * 1.05;
      const glowOpacity = THREE.MathUtils.clamp(
        THREE.MathUtils.lerp(0.1, entry.config.role === "hero" ? 0.4 : 0.26, visibilityPresence) *
          sunPulse *
          entry.revealOpacity *
          (entry.config.role === "hero" ? 1.18 : 1),
        0,
        1,
      );
      for (const material of entry.glowMaterials) {
        const glowGain = typeof material.userData.glowGain === "number" ? material.userData.glowGain : 1;
        if ("color" in material && material.color instanceof THREE.Color) {
          material.color.copy(entry.routeGlowColor);
        }
        if ("opacity" in material) {
          material.opacity = glowOpacity * glowGain;
        }
      }
      for (const [index, trailPoint] of entry.trailPoints.entries()) {
        const trailProgress = THREE.MathUtils.euclideanModulo(clampedProgress - (index + 1) * AIRCRAFT_TRAIL_STEP, 1);
        entry.routeEntry.curve.getPointAt(trailProgress, aircraftTrailPoint);
        aircraftTrailNormal.copy(aircraftTrailPoint).normalize();
        trailPoint.position.copy(aircraftTrailPoint).addScaledVector(aircraftTrailNormal, 0.003);
        const trailMaterial = (trailPoint as THREE.Mesh | THREE.Sprite).material as
          | THREE.MeshBasicMaterial
          | THREE.SpriteMaterial;
        trailMaterial.opacity =
          opacity *
          THREE.MathUtils.lerp(
            entry.config.role === "hero" ? 0.14 : 0.08,
            entry.config.role === "hero" ? 0.024 : 0.012,
            index / Math.max(entry.trailPoints.length - 1, 1),
          );
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
        const deployedTraffic: Array<{
          routeId: string;
          routeIndex: number;
          initialT: number;
          speed: number;
          role: "hero" | "support";
        }> = [];
        const heroConfig = AIRCRAFT_TRAFFIC.find((config) => config.role === "hero") ?? null;
        const supportConfigs = AIRCRAFT_TRAFFIC
          .filter((config) => config.role === "support")
          .slice(0, getSupportAircraftPoolSize(isMobileLayout));
        const trafficConfigs = heroConfig ? [heroConfig, ...supportConfigs] : supportConfigs;

        for (const config of trafficConfigs) {
          const routeEntry = routeEntries.find((entry) => entry.routeIndex === config.routeIndex);
          if (!routeEntry) {
            continue;
          }

          const { visual, materials } = buildAircraftModel(gltf.scene);

          const aircraftAnchor = new THREE.Group();
          aircraftAnchor.name = "aircraft-anchor";
          const aircraftPose = new THREE.Group();
          aircraftPose.name = "aircraft-pose";
          aircraftPose.add(visual);
          aircraftAnchor.add(aircraftPose);
          aircraftRig.add(aircraftAnchor);

          const routeGlowColor = new THREE.Color(routeEntry.routeConfig.glowColor);
          const glowMaterials: THREE.Material[] = [];
          if (aircraftGlowCoreTexture && aircraftGlowStreakTexture) {
            const flareGroup = new THREE.Group();
            flareGroup.name = "aircraft-flare";

            const coreMaterial = new THREE.SpriteMaterial({
              map: aircraftGlowCoreTexture,
              color: routeGlowColor.clone().lerp(new THREE.Color(0xffffff), 0.22),
              transparent: true,
              opacity: 0,
              depthWrite: false,
              depthTest: true,
              blending: THREE.AdditiveBlending,
            });
            coreMaterial.userData.glowGain = 1.08;
            const coreSprite = new THREE.Sprite(coreMaterial);
            coreSprite.scale.setScalar(config.role === "hero" ? 0.11 : 0.09);
            flareGroup.add(coreSprite);

            const wingStreakMaterial = new THREE.SpriteMaterial({
              map: aircraftGlowStreakTexture,
              color: routeGlowColor,
              transparent: true,
              opacity: 0,
              depthWrite: false,
              depthTest: true,
              blending: THREE.AdditiveBlending,
            });
            wingStreakMaterial.userData.glowGain = 0.8;
            const wingStreak = new THREE.Sprite(wingStreakMaterial);
            wingStreak.scale.set(config.role === "hero" ? 0.24 : 0.2, config.role === "hero" ? 0.06 : 0.05, 1);
            flareGroup.add(wingStreak);

            const crossStreakMaterial = new THREE.SpriteMaterial({
              map: aircraftGlowStreakTexture,
              color: routeGlowColor.clone().lerp(new THREE.Color(0xffffff), 0.12),
              transparent: true,
              opacity: 0,
              depthWrite: false,
              depthTest: true,
              blending: THREE.AdditiveBlending,
              rotation: Math.PI * 0.5,
            });
            crossStreakMaterial.userData.glowGain = 0.56;
            const crossStreak = new THREE.Sprite(crossStreakMaterial);
            crossStreak.scale.set(config.role === "hero" ? 0.13 : 0.11, config.role === "hero" ? 0.04 : 0.034, 1);
            flareGroup.add(crossStreak);

            visual.add(flareGroup);
            glowMaterials.push(coreMaterial, wingStreakMaterial, crossStreakMaterial);
            routeMaterials.push(coreMaterial, wingStreakMaterial, crossStreakMaterial);
          }

          const trailPoints: THREE.Mesh[] = [];
          const trailSteps = config.role === "hero" ? AIRCRAFT_TRAIL_STEPS : getSupportTrailSteps(isMobileLayout);
          for (let index = 0; index < trailSteps; index += 1) {
            const trailGeometry = new THREE.SphereGeometry(THREE.MathUtils.lerp(0.005, 0.002, index / Math.max(trailSteps - 1, 1)), 10, 10);
            const trailMaterial = new THREE.MeshBasicMaterial({
              color: config.role === "hero" ? 0xeaf5ff : 0xd8e7ff,
              transparent: true,
              opacity: config.role === "hero" ? 0.05 : 0.03,
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
            config,
            routeEntry,
            routeGlowColor,
            progress: config.initialT,
            bank: 0,
            materials,
            glowMaterials,
            trailPoints,
            revealScale: 0.001,
            revealOpacity: 0,
            assignmentOpacity: 1,
            assignmentLockUntil: 0,
            pendingRouteEntry: null,
          });
          if (config.role === "support") {
            supportAircraftEntries.push(aircraftEntries[aircraftEntries.length - 1]);
          }

          if (config.role === "hero") {
            heroFlight.sourceEntry = aircraftEntries[aircraftEntries.length - 1];

            const { visual: heroVisual, materials: heroMaterials } = buildAircraftModel(gltf.scene);
            const heroAnchor = new THREE.Group();
            heroAnchor.name = "hero-aircraft-anchor";
            const heroPose = new THREE.Group();
            heroPose.name = "hero-aircraft-pose";
            heroPose.add(heroVisual);
            heroAnchor.add(heroPose);
            heroPlaneRig.add(heroAnchor);

            const heroGlowMaterials: THREE.Material[] = [];
            if (aircraftGlowCoreTexture && aircraftGlowStreakTexture) {
              const flareGroup = new THREE.Group();
              flareGroup.name = "hero-aircraft-flare";

              const coreMaterial = new THREE.SpriteMaterial({
                map: aircraftGlowCoreTexture,
                color: heroGlowWarm.clone().lerp(heroGlowHot, 0.24),
                transparent: true,
                opacity: 0,
                depthWrite: false,
                depthTest: true,
                blending: THREE.AdditiveBlending,
              });
              coreMaterial.userData.glowGain = 1.18;
              const coreSprite = new THREE.Sprite(coreMaterial);
              coreSprite.scale.set(0.19, 0.12, 1);
              flareGroup.add(coreSprite);

              const wingStreakMaterial = new THREE.SpriteMaterial({
                map: aircraftGlowStreakTexture,
                color: heroGlowWarm,
                transparent: true,
                opacity: 0,
                depthWrite: false,
                depthTest: true,
                blending: THREE.AdditiveBlending,
              });
              wingStreakMaterial.userData.glowGain = 0.96;
              const wingStreak = new THREE.Sprite(wingStreakMaterial);
              wingStreak.scale.set(0.33, 0.07, 1);
              flareGroup.add(wingStreak);

              const crossStreakMaterial = new THREE.SpriteMaterial({
                map: aircraftGlowStreakTexture,
                color: heroGlowHot.clone().lerp(new THREE.Color(0xffffff), 0.08),
                transparent: true,
                opacity: 0,
                depthWrite: false,
                depthTest: true,
                blending: THREE.AdditiveBlending,
                rotation: Math.PI * 0.5,
              });
              crossStreakMaterial.userData.glowGain = 0.62;
              const crossStreak = new THREE.Sprite(crossStreakMaterial);
              crossStreak.scale.set(0.16, 0.05, 1);
              flareGroup.add(crossStreak);

              heroVisual.add(flareGroup);
              heroGlowMaterials.push(coreMaterial, wingStreakMaterial, crossStreakMaterial);
              routeMaterials.push(coreMaterial, wingStreakMaterial, crossStreakMaterial);
            }

            const heroTrailPoints: THREE.Object3D[] = [];
            for (let index = 0; index < HERO_CONTRAIL_STEPS; index += 1) {
              const trailMaterial = new THREE.SpriteMaterial({
                map: aircraftContrailTexture ?? aircraftGlowCoreTexture ?? undefined,
                color: contrailFarColor.clone(),
                transparent: true,
                opacity: 0,
                depthWrite: false,
                depthTest: true,
                blending: THREE.NormalBlending,
              });
              const trailPointSprite = new THREE.Sprite(trailMaterial);
              trailPointSprite.scale.set(
                THREE.MathUtils.lerp(0.03, 0.095, index / Math.max(HERO_CONTRAIL_STEPS - 1, 1)),
                THREE.MathUtils.lerp(0.012, 0.048, index / Math.max(HERO_CONTRAIL_STEPS - 1, 1)),
                1,
              );
              trailPointSprite.renderOrder = 11;
              heroTrailPoints.push(trailPointSprite);
              routeMaterials.push(trailMaterial);
              heroPlaneRig.add(trailPointSprite);
            }

            heroFlight.actor = {
              anchor: heroAnchor,
              pose: heroPose,
              visual: heroVisual,
              config,
              routeEntry,
              routeGlowColor,
              progress: config.initialT,
              bank: 0,
              materials: heroMaterials,
              glowMaterials: heroGlowMaterials,
              trailPoints: heroTrailPoints,
              revealScale: 1,
              revealOpacity: 1,
              assignmentOpacity: 1,
              assignmentLockUntil: 0,
              pendingRouteEntry: null,
            };
            hideAircraftEntry(heroFlight.actor);
          }

          deployedTraffic.push({
            routeId: config.routeId,
            routeIndex: config.routeIndex,
            initialT: config.initialT,
            speed: config.speed,
            role: config.role,
          });
        }

        window.console.info("[live-globe-proof] aircraft traffic", {
          aircraftModelPath: AIRCRAFT_MODEL_PATH,
          count: deployedTraffic.length,
          traffic: deployedTraffic,
        });
        routeGroup.add(aircraftRig);
      });
    };

    const createRouteGroup = () => {
      const group = new THREE.Group();
      group.name = "route-arcs";
      const routeEntries: RouteCurveEntry[] = [];
      const routeSegments = isMobileLayout ? WAITLIST_PERFORMANCE.mobileRouteSegments : WAITLIST_PERFORMANCE.desktopRouteSegments;
      const routeRadialSegments = isMobileLayout
        ? WAITLIST_PERFORMANCE.mobileRouteRadialSegments
        : WAITLIST_PERFORMANCE.desktopRouteRadialSegments;

      for (const [routeIndex, route] of ROUTE_ARCS.entries()) {
        const curve = createRouteCurve(route);
        routeEntries.push({ routeIndex, routeConfig: route, curve, midpoint: curve.getPointAt(0.5) });

        const glowGeometry = new THREE.TubeGeometry(curve, routeSegments, route.glowRadius, routeRadialSegments, false);
        const glowMaterial = createRouteMaterial({
          color: route.glowColor,
          opacity: route.glowOpacity,
          additive: true,
        });
        glowMaterial.userData.baseOpacity = route.glowOpacity;
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        glowMesh.renderOrder = 8;

        const coreGeometry = new THREE.TubeGeometry(curve, routeSegments, route.coreRadius, routeRadialSegments, false);
        const coreMaterial = createRouteMaterial({
          color: route.color,
          opacity: route.opacity,
          additive: true,
        });
        coreMaterial.userData.baseOpacity = route.opacity;
        const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
        coreMesh.renderOrder = 9;

        routeDisposables.push(glowGeometry, coreGeometry);
        routeMaterials.push(glowMaterial, coreMaterial);
        routeShaderMaterials.push(glowMaterial, coreMaterial);
        group.add(glowMesh, coreMesh);
      }

      globeRouteEntries = routeEntries;
      return { group, routeEntries };
    };

    const addGlobeSphere = () => {
      const sphereSegments = isMobileLayout ? WAITLIST_PERFORMANCE.mobileSphereSegments : WAITLIST_PERFORMANCE.desktopSphereSegments;
      const geometry = new THREE.SphereGeometry(1.42, sphereSegments.width, sphereSegments.height);
      const earth = new THREE.Mesh(geometry, earthMaterial);
      const constructionShell = createGlobeConstructionShell(1.42);
      constructionShellMesh = constructionShell;
      const cityGeometry = new THREE.SphereGeometry(1.424, sphereSegments.width, sphereSegments.height);
      const cityHaloGeometry = new THREE.SphereGeometry(1.43, sphereSegments.width, sphereSegments.height);
      const cloudGeometry = new THREE.SphereGeometry(1.438, sphereSegments.width, sphereSegments.height);
      const atmosphereGeometry = new THREE.SphereGeometry(grade.atmosphereScale, sphereSegments.width, sphereSegments.height);
      const orbAuraGeometry = new THREE.SphereGeometry(grade.atmosphereScale * 1.018, sphereSegments.width, sphereSegments.height);
      routeDisposables.push(geometry, cityGeometry, cityHaloGeometry, cloudGeometry, atmosphereGeometry, orbAuraGeometry);
      const cities = new THREE.Mesh(cityGeometry, cityMaterial);
      const cityHalo = new THREE.Mesh(cityHaloGeometry, cityHaloMaterial);
      const cloudRig = new THREE.Group();
      const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
      clouds.name = "cloud-base";
      const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
      const orbAura = new THREE.Mesh(orbAuraGeometry, orbAuraMaterial);
      cities.visible = cityLightsEnabled;
      cityHalo.visible = cityLightsEnabled;
      atmosphere.visible = atmosphereEnabled;
      orbAura.visible = atmosphereEnabled;
      cloudRig.add(clouds);
      cloudRig.name = "cloud-rig";
      globeRig.add(constructionShell, earth, cities, cityHalo, cloudRig, atmosphere, orbAura);
      const routeGroup = routesEnabled ? createRouteGroup() : null;
      if (routeGroup) {
        globeRouteGroup = routeGroup.group;
        globeRig.add(routeGroup.group);
        if (aircraftEnabled) {
          attachAircraftToRoutes(routeGroup.group, routeGroup.routeEntries);
        }
      }
    };

    addGlobeSphere();
    addGlassCard();

    const resize = () => {
      const rect = mount.getBoundingClientRect();
      updatePixelRatio(rect.width, true);
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();

      isMobileLayout = resolveMobileLayout(rect.width);
      const cameraZ = isMobileLayout ? WAITLIST_SCROLL_TRANSITION.cameraStartZ : WAITLIST_SCROLL_TRANSITION.cameraStartZ - 0.2;
      const visibleHeight = 2 * cameraZ * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
      const visibleWidth = visibleHeight * camera.aspect;
      const targetDiameter = isMobileLayout ? Math.min(visibleWidth * 0.84, visibleHeight * 0.5) : visibleHeight * 0.61;
      baseGlobeScale = THREE.MathUtils.clamp(
        targetDiameter / 2.84,
        isMobileLayout ? 0.37 : 0.66,
        isMobileLayout ? 0.56 : 0.84,
      );
      baseGlobeY = isMobileLayout ? 0.66 : 0.04;
      camera.position.set(0, isMobileLayout ? 0.02 : 0.04, cameraZ);
      applyGlobeOrbTransform();
      updateGlassCardTransform();
      if (diagnosticsEnabled && !diagnosticsLogged) {
        diagnosticsLogged = true;
        const routeSegments = isMobileLayout ? WAITLIST_PERFORMANCE.mobileRouteSegments : WAITLIST_PERFORMANCE.desktopRouteSegments;
        const routeRadialSegments = isMobileLayout
          ? WAITLIST_PERFORMANCE.mobileRouteRadialSegments
          : WAITLIST_PERFORMANCE.desktopRouteRadialSegments;
        const sphereSegments = isMobileLayout ? WAITLIST_PERFORMANCE.mobileSphereSegments : WAITLIST_PERFORMANCE.desktopSphereSegments;
        const pageCanvasCount = typeof document !== "undefined" ? document.querySelectorAll("canvas").length : 1;
        window.console.info("[live-globe-proof] renderer metrics", {
          canvas: { width: rect.width, height: rect.height, pixelRatio: activePixelRatio },
          sceneRendererCount: 1,
          pageCanvasCount,
          mobile: isMobileLayout,
          sphereSegments,
          routeArcs: routesEnabled ? ROUTE_ARCS.length : 0,
          routeSegments,
          routeRadialSegments,
          aircraftCount: aircraftEnabled ? AIRCRAFT_TRAFFIC.length : 0,
          textureSet,
          toggles: {
            globeEnabled,
            routesEnabled,
            aircraftEnabled,
            rotationEnabled,
            atmosphereEnabled,
            cityLightsEnabled,
          },
          frameRates: {
            desktop: WAITLIST_PERFORMANCE.desktopFrameRate,
            mobileActive: WAITLIST_PERFORMANCE.mobileActiveFrameRate,
            mobileIdle: WAITLIST_PERFORMANCE.mobileIdleFrameRate,
          },
        });
      }
    };

    const isPointerOnGlobe = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        return false;
      }
      projectedGlobeCenter.copy(globeRig.position).project(camera);
      projectedGlobeEdge
        .copy(globeRig.position)
        .add(new THREE.Vector3(globeRadius * globeRig.scale.x, 0, 0))
        .project(camera);
      const centerX = rect.left + (projectedGlobeCenter.x * 0.5 + 0.5) * rect.width;
      const centerY = rect.top + (-projectedGlobeCenter.y * 0.5 + 0.5) * rect.height;
      const edgeX = rect.left + (projectedGlobeEdge.x * 0.5 + 0.5) * rect.width;
      const edgeY = rect.top + (-projectedGlobeEdge.y * 0.5 + 0.5) * rect.height;
      const radius = Math.max(42, Math.hypot(edgeX - centerX, edgeY - centerY) * 1.18);
      return Math.hypot(clientX - centerX, clientY - centerY) <= radius;
    };

    const releaseGlobePointer = (event?: PointerEvent) => {
      if (event && globePointerId !== event.pointerId) {
        return;
      }
      if (globePointerId !== null && renderer.domElement.hasPointerCapture(globePointerId)) {
        renderer.domElement.releasePointerCapture(globePointerId);
      }
      globePointerId = null;
      (window as typeof window & { __deadheadGlobeDragging?: boolean }).__deadheadGlobeDragging = false;
      renderer.domElement.classList.remove(styles.canvasDragging);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!isPointerOnGlobe(event.clientX, event.clientY)) {
        return;
      }
      event.preventDefault();
      globePointerId = event.pointerId;
      globePointerLastX = event.clientX;
      globePointerLastY = event.clientY;
      globePointerLastTime = performance.now();
      globeYawVelocity = 0;
      globePitchVelocity = 0;
      renderer.domElement.setPointerCapture(event.pointerId);
      renderer.domElement.classList.add(styles.canvasDragging);
      (window as typeof window & { __deadheadGlobeDragging?: boolean }).__deadheadGlobeDragging = true;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (globePointerId !== event.pointerId) {
        return;
      }
      event.preventDefault();
      const now = performance.now();
      const deltaTime = Math.max((now - globePointerLastTime) / 1000, 1 / 120);
      const deltaX = event.clientX - globePointerLastX;
      const deltaY = event.clientY - globePointerLastY;
      const sensitivity = GLOBE_INTERACTION.dragSensitivity * (isMobileLayout ? 1.12 : 1);
      const yawDelta = deltaX * sensitivity;
      const pitchDelta = deltaY * sensitivity;
      globeTargetYaw += yawDelta;
      globeTargetPitch = THREE.MathUtils.clamp(
        globeTargetPitch + pitchDelta,
        GLOBE_INTERACTION.minPitch - INITIAL_GLOBE_ROTATION.x,
        GLOBE_INTERACTION.maxPitch - INITIAL_GLOBE_ROTATION.x,
      );
      globeYawVelocity = THREE.MathUtils.clamp(yawDelta / deltaTime, -4.8, 4.8);
      globePitchVelocity = THREE.MathUtils.clamp(pitchDelta / deltaTime, -3.2, 3.2);
      globePointerLastX = event.clientX;
      globePointerLastY = event.clientY;
      globePointerLastTime = now;
    };

    const handlePointerCancel = (event: PointerEvent) => releaseGlobePointer(event);

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerup", releaseGlobePointer);
    renderer.domElement.addEventListener("pointercancel", handlePointerCancel);
    renderer.domElement.addEventListener("lostpointercapture", handlePointerCancel);

    const animate = (now = performance.now()) => {
      const debugFlags = perfEnabled ? getWebglPerfDebugFlagsSnapshot() : null;
      const pauseRequested = Boolean(perfEnabled && debugFlags?.pauseRenderLoop);
      const manualRenderNonce = Number(debugFlags?.manualRenderNonce ?? 0);
      const manualRenderRequested = pauseRequested && manualRenderNonce !== lastManualRenderNonce;
      if (manualRenderRequested) {
        lastManualRenderNonce = manualRenderNonce;
      }
      if (document.hidden) {
        clock.getDelta();
        visibilityPaused = true;
        if (perfEnabled) {
          reportWebglFrame({
            source: "globe",
            now,
            frameMs: 0,
            renderLoopActive: false,
            renderLoopPaused: true,
            pageVisible: false,
            sceneOnscreen,
            scrollProgress: currentScrollProgress,
            scrollPhase: "offscreen",
            qualityTier: prefersReducedMotion ? "reduced-motion" : isMobileLayout ? "mobile" : "desktop",
            postprocessingScale: isMobileLayout ? WAITLIST_PERFORMANCE.mobileTransitionPostScale : WAITLIST_PERFORMANCE.desktopTransitionPostScale,
            activePostprocessingPasses: [],
            postprocessingEnabled: false,
            bloomEnabled: false,
            frostEnabled: false,
            chromaticEnabled: false,
            globeVisible: globeEnabled,
            globeRotating: rotationEnabled,
            globeAtmosphereEnabled: atmosphereEnabled,
            globeRoutesEnabled: routesEnabled,
            globeCityLightsEnabled: cityLightsEnabled,
            starfieldEnabled: Boolean(debugFlags?.starfield ?? true),
            gridEnabled: Boolean(debugFlags?.grid ?? true),
            hazeEnabled: Boolean(debugFlags?.haze ?? true),
            renderer,
            canvas: renderer.domElement,
          });
        }
        frame = window.requestAnimationFrame(animate);
        return;
      }
      if (visibilityPaused) {
        visibilityPaused = false;
        lastRenderTime = now;
        clock.getDelta();
      }
      if (pauseRequested && !manualRenderRequested) {
        if (perfEnabled) {
          reportWebglFrame({
            source: "globe",
            now,
            frameMs: 0,
            renderLoopActive: false,
            renderLoopPaused: true,
            pageVisible: true,
            sceneOnscreen,
            scrollProgress: currentScrollProgress,
            scrollPhase: sceneOnscreen ? (currentScrollProgress < 0.24 ? "hero" : currentScrollProgress < 0.7 ? "transition" : currentScrollProgress < 0.995 ? "chapter" : "idle") : "offscreen",
            qualityTier: prefersReducedMotion ? "reduced-motion" : isMobileLayout ? "mobile" : "desktop",
            postprocessingScale: isMobileLayout ? WAITLIST_PERFORMANCE.mobileTransitionPostScale : WAITLIST_PERFORMANCE.desktopTransitionPostScale,
            activePostprocessingPasses: [],
            postprocessingEnabled: false,
            bloomEnabled: false,
            frostEnabled: false,
            chromaticEnabled: false,
            globeVisible: globeEnabled,
            globeRotating: rotationEnabled,
            globeAtmosphereEnabled: atmosphereEnabled,
            globeRoutesEnabled: routesEnabled,
            globeCityLightsEnabled: cityLightsEnabled,
            starfieldEnabled: Boolean(debugFlags?.starfield ?? true),
            gridEnabled: Boolean(debugFlags?.grid ?? true),
            hazeEnabled: Boolean(debugFlags?.haze ?? true),
            renderer,
            canvas: renderer.domElement,
          });
        }
        frame = window.requestAnimationFrame(animate);
        return;
      }
      const targetFrameInterval = getTargetFrameInterval();
      if (lastRenderTime > 0 && now - lastRenderTime < targetFrameInterval) {
        frame = window.requestAnimationFrame(animate);
        return;
      }
      lastRenderTime = now;
      const delta = THREE.MathUtils.clamp(clock.getDelta(), 1 / 120, 1 / 20);
      const elapsed = clock.elapsedTime;
      const autoCompleteActive = autoCompleteActiveRef.current;
      const autoRewindActive = autoRewindActiveRef.current;
      const manualReverseHoldActive = manualReverseHoldActiveRef.current;
      const manualScrollDirection = manualScrollDirectionRef.current;
      const lastManualScrollInputMs = lastManualScrollInputMsRef.current;
      const userInputActive =
        lastManualScrollInputMs > 0 &&
        performance.now() - lastManualScrollInputMs < WAITLIST_SCROLL_TRANSITION.interruptedAutoCompleteResumeMs;
      const fps = 1 / Math.max(delta, 1 / 240);
      smoothedFps = THREE.MathUtils.lerp(smoothedFps, fps, 0.08);
      performanceSampleFrames += 1;
      if (performanceSampleFrames >= 45) {
        performanceSampleFrames = 0;
        const shouldAdaptPixelRatio =
          !isMobileLayout || targetFrameInterval <= 1000 / WAITLIST_PERFORMANCE.mobileActiveFrameRate + 0.5;
        const downThreshold = isMobileLayout ? WAITLIST_PERFORMANCE.mobileActiveFrameRate * 0.82 : 46;
        const upThreshold = isMobileLayout ? WAITLIST_PERFORMANCE.mobileActiveFrameRate * 0.98 : 58;
        if (shouldAdaptPixelRatio && smoothedFps < downThreshold && activePixelRatio > minPixelRatio + 0.01) {
          setPixelRatio(Math.max(minPixelRatio, activePixelRatio - 0.2));
        } else if (shouldAdaptPixelRatio && smoothedFps > upThreshold && activePixelRatio < maxPixelRatio - 0.01) {
          setPixelRatio(Math.min(maxPixelRatio, activePixelRatio + 0.12));
        }
      }
      applyGlobeOrbTransform();
      updateGlassCardTransform();
      if (materializeSignalRef.current !== lastMaterializeSignal) {
        lastMaterializeSignal = materializeSignalRef.current;
        startMaterialize(elapsed);
      }
      if (materializeStartTime >= 0) {
        const materializeLinear = THREE.MathUtils.clamp((elapsed - materializeStartTime) / 4.6, 0, 1);
        materializeProgress = THREE.MathUtils.smootherstep(materializeLinear, 0, 1);
      }
      updateOrbAliveLook(elapsed);
      const cloudRig = globeRig.getObjectByName("cloud-rig");
      const shellMode = THREE.MathUtils.smoothstep(currentOrbProgress, ORB_SHELL_MODE_START, ORB_SHELL_MODE_FULL);
      const shellModeActive = shellMode > 0.98;
      if (globePointerId === null) {
        if (!shellModeActive) {
          globeTargetYaw += globeYawVelocity * delta;
          globeTargetPitch = THREE.MathUtils.clamp(
            globeTargetPitch + globePitchVelocity * delta,
            GLOBE_INTERACTION.minPitch - INITIAL_GLOBE_ROTATION.x,
            GLOBE_INTERACTION.maxPitch - INITIAL_GLOBE_ROTATION.x,
          );
          const inertiaDamping = Math.exp(-GLOBE_INTERACTION.inertiaDamping * delta);
          globeYawVelocity *= inertiaDamping;
          globePitchVelocity *= inertiaDamping;
          if (Math.abs(globeYawVelocity) < 0.0008) {
            globeYawVelocity = 0;
          }
          if (Math.abs(globePitchVelocity) < 0.0008) {
            globePitchVelocity = 0;
          }
        } else {
          globeTargetYaw = THREE.MathUtils.lerp(globeTargetYaw, 0, 0.08);
          globeTargetPitch = THREE.MathUtils.lerp(globeTargetPitch, 0, 0.08);
          globeYawVelocity = 0;
          globePitchVelocity = 0;
        }
      }
      const interactionDamping = globePointerId === null ? GLOBE_INTERACTION.returnDamping : 16;
      const interactionAlpha = 1 - Math.exp(-interactionDamping * delta);
      globeYaw = THREE.MathUtils.lerp(globeYaw, globeTargetYaw, interactionAlpha);
      globePitch = THREE.MathUtils.lerp(globePitch, globeTargetPitch, interactionAlpha);
      if (!prefersReducedMotion) {
        const orbSpinBoost = Math.pow(currentOrbProgress, 1.35);
        const liveYawSpeed = THREE.MathUtils.lerp(0.0195, 0.092, orbSpinBoost);
        const shellYawSpeed = isMobileLayout ? 0.013 : 0.015;
        const idleYaw =
          INITIAL_GLOBE_ROTATION.y + (rotationEnabled ? elapsed * THREE.MathUtils.lerp(liveYawSpeed, shellYawSpeed, shellMode) : 0);
        const livePitchAmplitude = THREE.MathUtils.lerp(0.003, 0.013, orbSpinBoost);
        const shellPitchAmplitude = 0.0012;
        const idlePitch =
          INITIAL_GLOBE_ROTATION.x +
          (rotationEnabled
            ? Math.sin(elapsed * THREE.MathUtils.lerp(0.28, 1.1, orbSpinBoost)) * THREE.MathUtils.lerp(livePitchAmplitude, shellPitchAmplitude, shellMode)
            : 0);
        globeRig.rotation.y = idleYaw + globeYaw;
        globeRig.rotation.x = THREE.MathUtils.clamp(idlePitch + globePitch, GLOBE_INTERACTION.minPitch, GLOBE_INTERACTION.maxPitch);
        globeRig.rotation.z = INITIAL_GLOBE_ROTATION.z;
        if (heroFlight.actor && heroFlight.sourceEntry) {
          const earlyHeroHandoffReady =
            !autoRewindActive &&
            !manualReverseHoldActive &&
            !userInputActive &&
            currentScrollProgress >= (isMobileLayout ? 0.64 : 0.58) &&
            currentOrbProgress >= (isMobileLayout ? 0.018 : 0.012);
          if (currentOrbProgress <= 0.025 && heroFlight.mode !== "ROUTE_IDLE") {
            resetHeroFlight();
          } else if (
            shouldResumeHeroLaunchFromReturn({
              autoCompleteActive,
              manualReverseHoldActive,
              heroMode: heroFlight.mode,
              userInputActive,
              manualScrollDirection,
            })
          ) {
            resumeHeroFlightFromCurrentPose(elapsed);
          } else if (
            shouldStartHeroReturn({
              autoRewindActive,
              manualReverseHoldActive,
              heroMode: heroFlight.mode,
              userInputActive,
              manualScrollDirection,
            })
          ) {
            rewindHeroReturnStartScrollProgress = Math.max(currentScrollProgress, 0.04);
            startHeroReturn(elapsed);
          } else if (
            (autoCompleteActive || earlyHeroHandoffReady) &&
            !autoRewindActive &&
            heroFlight.mode === "ROUTE_IDLE" &&
            !shouldDelayGlassCardHeroFlight({
              currentScrollProgress,
              glassCardLoaded,
            })
          ) {
            startHeroFlight(elapsed);
          }

          if (heroFlight.mode === "HERO_TRANSITION" && heroFlight.launchCurve) {
            const launchLinearProgress = THREE.MathUtils.clamp(
              (elapsed - heroFlight.launchStartTime) / HERO_LAUNCH_DURATION_SECONDS,
              0,
              1,
            );
            const launchProgress = THREE.MathUtils.smootherstep(launchLinearProgress, 0, 1);
            const acceleratedLaunchProgress = Math.pow(launchProgress, 1.38);
            const spawnFollow = getHeroLaunchSpawnFollow({
              launchProgress,
              resumedFromCurrentPose: heroFlight.resumedFromCurrentPose,
            });
            const curveProgress = THREE.MathUtils.clamp((acceleratedLaunchProgress - 0.04) / 0.96, 0, 1);
            getHeroLaunchOriginPoint();
            heroFlight.launchCurve.getPointAt(curveProgress, launchCurvePoint);
            heroFlight.launchCurve.getTangentAt(Math.min(curveProgress + 0.02, 1), launchCurveTangent).normalize();
            if (!heroFlight.resumedFromCurrentPose) {
              launchCurvePoint.lerp(heroHiddenPoint, 1 - spawnFollow);
              launchTravelDirection.copy(launchCurvePoint).sub(heroHiddenPoint).normalize();
              if (launchTravelDirection.lengthSq() > 1e-5) {
                launchCurveTangent.lerp(launchTravelDirection, 1 - spawnFollow).normalize();
              }
            }
            launchCurveSafePoint.copy(launchCurvePoint).sub(globeRig.position);
            const minLaunchRadius = globeRadius * globeRig.scale.x + heroLaunchSafeMargin;
            if (launchCurveSafePoint.length() < minLaunchRadius) {
              launchCurveSafePoint.normalize().multiplyScalar(minLaunchRadius).add(globeRig.position);
              launchCurvePoint.copy(launchCurveSafePoint);
            }
            getCameraFacingUpForDirection(launchCurvePoint, launchCurveTangent);
            blendUp
              .copy(launchSurfaceNormal)
              .lerp(cameraFacingUp, THREE.MathUtils.smoothstep(launchProgress, 0.4, 1))
              .normalize();
            const launchScale = getHeroScaleFromDistance(launchCurvePoint);
            const launchOpacity = THREE.MathUtils.lerp(
              heroFlight.snapshotOpacity,
              1,
              THREE.MathUtils.smoothstep(launchProgress, 0.04, 0.62),
            );
            const launchArcProgress = THREE.MathUtils.clamp(curveProgress - 0.018, 0, 1);
            const launchArcFade = THREE.MathUtils.smoothstep(curveProgress, 0.03, 0.2);
            if (heroFlight.glassRecoveryMode) {
              setHeroLaunchArcState(0, 0, 0);
            } else {
              ensureHeroLaunchArc(
                buildHeroLaunchDisplayCurve(
                  heroFlight.launchCurve,
                  Math.max(launchArcProgress, 0.02),
                  true,
                ),
              );
              setHeroLaunchArcState(
                1,
                0.48 * launchArcFade,
                1 * launchArcFade,
              );
            }
            orientAircraftForFreeFlight(
              heroFlight.actor,
              launchCurvePoint,
              launchCurveTangent,
              launchScale,
              launchOpacity,
              elapsed,
              curveProgress,
              blendUp,
            );
            heroFlight.transitionProgress = curveProgress;
            if (launchProgress >= 0.999) {
              heroFlight.actor.bank = 0;
              heroFlight.transitionProgress = 1;
              heroFlight.resumedFromCurrentPose = false;
              if (glassCardLoaded) {
                heroFlight.glassDropStartTime = elapsed;
              }
              heroFlight.mode = "JOURNEY_READY";
            }
          } else if (heroFlight.mode === "JOURNEY_READY") {
            getHeroJourneyStartPoint();
            getHeroJourneyDirection();
            getCameraFacingUpForDirection(launchTargetPoint, launchTargetDirection);
            const glassEntrySequence =
              glassCardLoaded && !heroFlight.glassRecoveryMode
                ? getGlassCardRecoverySequence({
                    elapsedSeconds: Math.max(0, elapsed - heroFlight.glassDropStartTime),
                    reconnectDuration: 0,
                    dropDuration: isMobileLayout ? 0.72 : 0.86,
                  })
                : null;
            const glassEntryBlend = glassEntrySequence?.dropBlend ?? (glassCardLoaded ? getGlassCardHeroEntryBlend() : 0);
            const glassEntryPath = glassCardLoaded
              ? getGlassCardRecoveryDropPath({
                  entryPoint: {
                    x: glassCardEntryWorldPoint.x,
                    y: glassCardEntryWorldPoint.y,
                    z: glassCardEntryWorldPoint.z,
                  },
                  preEntryOffset: isMobileLayout ? 0.16 : 0.2,
                  recoveryLift: isMobileLayout ? 0.24 : 0.3,
                  dropBlend: glassEntryBlend,
                })
              : null;
            const glassRecoverySequence =
              glassCardLoaded && heroFlight.glassRecoveryMode
                ? getGlassCardRecoverySequence({
                    elapsedSeconds: Math.max(0, elapsed - heroFlight.glassDropStartTime),
                    reconnectDuration: isMobileLayout ? 0.44 : 0.52,
                    dropDuration: isMobileLayout ? 0.72 : 0.86,
                  })
                : null;
            const glassRecoveryDropPath =
              glassCardLoaded && heroFlight.glassRecoveryMode
                ? getGlassCardRecoveryDropPath({
                    entryPoint: {
                      x: glassCardEntryWorldPoint.x,
                      y: glassCardEntryWorldPoint.y,
                      z: glassCardEntryWorldPoint.z,
                    },
                    preEntryOffset: isMobileLayout ? 0.16 : 0.2,
                    recoveryLift: isMobileLayout ? 0.24 : 0.3,
                    dropBlend: glassRecoverySequence?.dropBlend ?? 0,
                  })
                : null;
            if (heroFlight.launchCurve) {
              ensureHeroLaunchArc(
                glassRecoverySequence && (glassRecoverySequence.reconnectBlend < 0.999 || glassRecoverySequence.dropBlend <= 0.001)
                  ? buildHeroGlassReconnectDisplayCurve(
                      glassCardRecoveryTopPoint.set(
                        glassRecoveryDropPath?.reentryTopPoint.x ?? glassEntryPath?.reentryTopPoint.x ?? glassCardEntryWorldPoint.x,
                        glassRecoveryDropPath?.reentryTopPoint.y ?? glassEntryPath?.reentryTopPoint.y ?? glassCardEntryWorldPoint.y,
                        glassRecoveryDropPath?.reentryTopPoint.z ?? glassEntryPath?.reentryTopPoint.z ?? glassCardEntryWorldPoint.z,
                      ),
                      Math.max(glassRecoverySequence.reconnectBlend, 0.02),
                    )
                  : glassRecoveryDropPath
                  ? buildHeroGlassReconnectAndDropCurve(
                      glassCardRecoveryTopPoint.set(
                        glassRecoveryDropPath.reentryTopPoint.x,
                        glassRecoveryDropPath.reentryTopPoint.y,
                        glassRecoveryDropPath.reentryTopPoint.z,
                      ),
                      glassCardCurrentPoint.set(
                        glassRecoveryDropPath.currentPoint.x,
                        glassRecoveryDropPath.currentPoint.y,
                        glassRecoveryDropPath.currentPoint.z,
                      ),
                    )
                  : glassEntryPath
                  ? buildHeroGlassReconnectAndDropCurve(
                      glassCardRecoveryTopPoint.set(
                        glassEntryPath.reentryTopPoint.x,
                        glassEntryPath.reentryTopPoint.y,
                        glassEntryPath.reentryTopPoint.z,
                      ),
                      glassCardCurrentPoint.set(
                        glassEntryPath.currentPoint.x,
                        glassEntryPath.currentPoint.y,
                        glassEntryPath.currentPoint.z,
                      )
                    )
                  : buildHeroLaunchDisplayCurve(heroFlight.launchCurve, 1),
              );
            }
            setHeroLaunchArcState(1, 0.34, 0.94);
            const journeyPoint = glassCardLoaded
              ? glassCardTargetPoint.set(
                  glassRecoverySequence && glassRecoverySequence.dropBlend <= 0.001
                    ? glassRecoveryDropPath?.reentryTopPoint.x ?? glassEntryPath?.reentryTopPoint.x ?? glassCardEntryWorldPoint.x
                    : glassRecoveryDropPath?.currentPoint.x ?? glassEntryPath?.currentPoint.x ?? glassCardEntryWorldPoint.x,
                  glassRecoverySequence && glassRecoverySequence.dropBlend <= 0.001
                    ? glassRecoveryDropPath?.reentryTopPoint.y ?? glassEntryPath?.reentryTopPoint.y ?? glassCardEntryWorldPoint.y
                    : glassRecoveryDropPath?.currentPoint.y ?? glassEntryPath?.currentPoint.y ?? glassCardEntryWorldPoint.y,
                  glassRecoverySequence && glassRecoverySequence.dropBlend <= 0.001
                    ? glassRecoveryDropPath?.reentryTopPoint.z ?? glassEntryPath?.reentryTopPoint.z ?? glassCardEntryWorldPoint.z
                    : glassRecoveryDropPath?.currentPoint.z ?? glassEntryPath?.currentPoint.z ?? glassCardEntryWorldPoint.z,
                )
              : launchTargetPoint;
            const journeyOpacity = 1;
            orientAircraftForFreeFlight(
              heroFlight.actor,
              journeyPoint,
              launchTargetDirection,
              getHeroJourneyScale(),
              journeyOpacity,
              elapsed,
              1,
              cameraFacingUp,
              0.22,
            );
          } else if (heroFlight.mode === "HERO_RETURN" && heroFlight.returnCurve) {
            setHeroLaunchArcState(0, 0, 0);
            const useScrollScrubForReturn = shouldScrubHeroReturnWithScroll({
              autoRewindActive,
              manualReverseHoldActive,
              userInputActive,
              manualScrollDirection,
            });
            const returnLinearProgress = getHeroReturnLinearProgress({
              useScrollScrub: useScrollScrubForReturn,
              currentScrollProgress,
              rewindStartScrollProgress: rewindHeroReturnStartScrollProgress,
              elapsed,
              returnStartTime: heroFlight.returnStartTime,
              durationSeconds: HERO_RETURN_DURATION_SECONDS,
            });
            const returnProgress = THREE.MathUtils.smootherstep(returnLinearProgress, 0, 1);
            const acceleratedReturnProgress = useScrollScrubForReturn
              ? THREE.MathUtils.lerp(
                  returnProgress,
                  Math.pow(returnProgress, 1.16),
                  0.28,
                )
              : Math.pow(returnProgress, 1.32);
            heroFlight.returnCurve.getPointAt(acceleratedReturnProgress, launchCurvePoint);
            heroFlight.returnCurve.getTangentAt(Math.min(acceleratedReturnProgress + 0.02, 1), launchCurveTangent).normalize();
            launchCurveSafePoint.copy(launchCurvePoint).sub(globeRig.position);
            const minReturnRadius = globeRadius * globeRig.scale.x + 0.025;
            if (launchCurveSafePoint.length() < minReturnRadius) {
              launchCurveSafePoint.normalize().multiplyScalar(minReturnRadius).add(globeRig.position);
              launchCurvePoint.copy(launchCurveSafePoint);
            }
            getCameraFacingUpForDirection(launchCurvePoint, launchCurveTangent);
            blendUp.copy(launchSurfaceNormal).lerp(cameraFacingUp, 0.35).normalize();
            const returnScaleFade = THREE.MathUtils.smoothstep(acceleratedReturnProgress, 0.72, 1);
            const launchScale = THREE.MathUtils.lerp(
              getHeroScaleFromDistance(launchCurvePoint),
              getHeroJourneyScale() * 0.24,
              returnScaleFade,
            );
            orientAircraftForFreeFlight(
              heroFlight.actor,
              launchCurvePoint,
              launchCurveTangent,
              launchScale,
              1 - returnScaleFade * 0.14,
              elapsed,
              acceleratedReturnProgress,
              blendUp,
              0.16,
            );
            heroFlight.transitionProgress = 1 - acceleratedReturnProgress;
            if (acceleratedReturnProgress >= 0.999) {
              resetHeroFlight();
            }
          } else {
            setHeroLaunchArcState(0, 0, 0);
          }
        }
        if (!shellModeActive) {
          updateSupportAircraftAssignments(elapsed, delta, camera);
          for (const entry of aircraftEntries) {
            if (rotationEnabled) {
              entry.progress = THREE.MathUtils.euclideanModulo(entry.progress + entry.config.speed * delta, 1);
            }
            applyAircraftPose(entry, entry.progress, camera, elapsed);
            if (entry === heroFlight.sourceEntry && heroFlight.mode !== "ROUTE_IDLE") {
              hideAircraftEntry(entry);
            }
          }
        }
        if (cloudRig && rotationEnabled) {
          const cloudDriftMix = 1 - shellMode;
          cloudRig.rotation.y = elapsed * THREE.MathUtils.lerp(0.0012, 0.0028, cloudDriftMix);
          cloudRig.rotation.x = Math.sin(elapsed * 0.09) * THREE.MathUtils.lerp(0.0012, 0.005, cloudDriftMix);
          cloudRig.rotation.z = Math.cos(elapsed * 0.07) * THREE.MathUtils.lerp(0.0006, 0.002, cloudDriftMix);
          const cloudBase = cloudRig.getObjectByName("cloud-base");
          if (cloudBase) {
            cloudBase.rotation.y = -elapsed * THREE.MathUtils.lerp(0.00045, 0.0011, cloudDriftMix);
            cloudBase.rotation.x = Math.sin(elapsed * 0.12) * THREE.MathUtils.lerp(0.001, 0.006, cloudDriftMix);
            cloudBase.rotation.z = Math.cos(elapsed * 0.08) * THREE.MathUtils.lerp(0.0005, 0.003, cloudDriftMix);
          }
        }
      } else {
        globeRig.rotation.set(
          THREE.MathUtils.clamp(INITIAL_GLOBE_ROTATION.x + globePitch, GLOBE_INTERACTION.minPitch, GLOBE_INTERACTION.maxPitch),
          INITIAL_GLOBE_ROTATION.y + globeYaw,
          INITIAL_GLOBE_ROTATION.z,
        );
        if (!shellModeActive) {
          for (const entry of aircraftEntries) {
            applyAircraftPose(entry, entry.progress, camera, elapsed);
            if (entry === heroFlight.sourceEntry && heroFlight.mode !== "ROUTE_IDLE") {
              hideAircraftEntry(entry);
            }
          }
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
      if (perfEnabled) {
        const scrollPhase: ScrollPhase = !sceneOnscreen
          ? "offscreen"
          : currentScrollProgress < 0.24
            ? "hero"
            : currentScrollProgress < 0.7
              ? "transition"
              : currentScrollProgress < 0.995
                ? "chapter"
                : "idle";
        reportWebglFrame({
          source: "globe",
          now,
          frameMs: delta * 1000,
          renderLoopActive: loopActiveState,
          renderLoopPaused: pauseRequested && !manualRenderRequested,
          pageVisible: !document.hidden,
          sceneOnscreen,
          scrollProgress: currentScrollProgress,
          scrollPhase,
          qualityTier: prefersReducedMotion ? "reduced-motion" : isMobileLayout ? "mobile" : "desktop",
          postprocessingScale: isMobileLayout ? WAITLIST_PERFORMANCE.mobileTransitionPostScale : WAITLIST_PERFORMANCE.desktopTransitionPostScale,
          activePostprocessingPasses: [],
          postprocessingEnabled: false,
          bloomEnabled: false,
          frostEnabled: false,
          chromaticEnabled: false,
          globeVisible: globeEnabled,
          globeRotating: rotationEnabled,
          globeAtmosphereEnabled: atmosphereEnabled,
          globeRoutesEnabled: routesEnabled,
          globeCityLightsEnabled: cityLightsEnabled,
          starfieldEnabled: Boolean(debugFlags?.starfield ?? true),
          gridEnabled: Boolean(debugFlags?.grid ?? true),
          hazeEnabled: Boolean(debugFlags?.haze ?? true),
          renderer,
          canvas: renderer.domElement,
        });
      }
      frame = window.requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        sceneOnscreen = Boolean(entries[0]?.isIntersecting);
      },
      { threshold: 0.05 },
    );
    intersectionObserver.observe(mount);
    animate();

    return () => {
      disposed = true;
      (window as typeof window & { __deadheadGlobeDragging?: boolean }).__deadheadGlobeDragging = false;
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerup", releaseGlobePointer);
      renderer.domElement.removeEventListener("pointercancel", handlePointerCancel);
      renderer.domElement.removeEventListener("lostpointercapture", handlePointerCancel);
      window.removeEventListener("resize", resize);
      intersectionObserver.disconnect();
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
      orbAuraMaterial.dispose();
      for (const geometry of routeDisposables) {
        geometry.dispose();
      }
      for (const material of routeMaterials) {
        material.dispose();
      }
      for (const material of constructionShellMaterials) {
        material.dispose();
      }
      for (const material of aircraftMaterials) {
        material.dispose();
      }
      for (const texture of aircraftGlowTextures) {
        texture.dispose();
      }
      for (const geometry of glassCardGeometries) {
        geometry.dispose();
      }
      for (const material of glassCardMaterials) {
        material.dispose();
      }
      renderer.forceContextLoss();
      mount.removeChild(renderer.domElement);
    };
  }, [
    aircraftEnabled,
    atmosphereEnabled,
    autoCompleteActiveRef,
    autoRewindActiveRef,
    cityLightsEnabled,
    diagnosticsEnabled,
    globeEnabled,
    grade,
    materializeSignalRef,
    onReady,
    orbProgressRef,
    rotationEnabled,
    scrollProgressRef,
    routesEnabled,
    textureSet,
    perfEnabled,
    forcedQuality,
  ]);

  return <div ref={mountRef} className={styles.canvasMount} data-globe-interaction="true" aria-hidden="true" />;
}
