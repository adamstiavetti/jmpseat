import type * as THREE from "three";

import { PERF_BUDGETS } from "./perfBudgets";

export type ScrollPhase = "hero" | "transition" | "chapter" | "idle" | "offscreen";
export type QualityTier = "desktop" | "mobile" | "reduced-motion";

export type PerfDebugFlags = {
  pauseRenderLoop: boolean;
  manualRenderNonce: number;
  postprocessing: boolean;
  bloom: boolean;
  frost: boolean;
  chromatic: boolean;
  starfield: boolean;
  haze: boolean;
  grid: boolean;
  globeAtmosphere: boolean;
  globeRoutes: boolean;
  globeCities: boolean;
  globeRotation: boolean;
  globeVisible: boolean;
  forceMobileQuality: boolean;
  forceDesktopQuality: boolean;
  showWarnings: boolean;
};

export type PerfSceneState = {
  scrollProgress: number;
  scrollPhase: ScrollPhase;
  qualityTier: QualityTier;
  postprocessingScale: number;
  postprocessingEnabled: boolean;
  bloomEnabled: boolean;
  frostEnabled: boolean;
  chromaticEnabled: boolean;
  globeVisible: boolean;
  globeRotating: boolean;
  globeAtmosphereEnabled: boolean;
  globeRoutesEnabled: boolean;
  globeCityLightsEnabled: boolean;
  starfieldEnabled: boolean;
  gridEnabled: boolean;
  hazeEnabled: boolean;
  renderLoopActive: boolean;
  renderLoopPaused: boolean;
  pageVisible: boolean;
  sceneOnscreen: boolean;
};

export type PerfSnapshot = {
  enabled: boolean;
  timestamp: number;
  fps: number;
  fpsAvg: number;
  frameMs: number;
  frameMsAvg: number;
  worstFrameMs: number;
  longFrameCount: number;
  rendererCount: number;
  canvasCount: number;
  devicePixelRatio: number;
  rendererPixelRatio: number;
  canvasCssWidth: number;
  canvasCssHeight: number;
  drawingBufferWidth: number;
  drawingBufferHeight: number;
  estimatedRenderedPixels: number;
  renderLoopActive: boolean;
  renderLoopPaused: boolean;
  pageVisible: boolean;
  sceneOnscreen: boolean;
  scrollY: number;
  scrollProgress: number;
  scrollPhase: ScrollPhase;
  qualityTier: QualityTier;
  postprocessingScale: number;
  activePostprocessingPasses: string[];
  postprocessingEnabled: boolean;
  bloomEnabled: boolean;
  frostEnabled: boolean;
  chromaticEnabled: boolean;
  globeVisible: boolean;
  globeRotating: boolean;
  globeAtmosphereEnabled: boolean;
  globeRoutesEnabled: boolean;
  globeCityLightsEnabled: boolean;
  starfieldEnabled: boolean;
  gridEnabled: boolean;
  hazeEnabled: boolean;
  drawCalls: number;
  triangles: number;
  points: number;
  lines: number;
  geometries: number;
  textures: number;
  shaderPrograms: number;
  debugFlags: PerfDebugFlags;
  warnings: string[];
  recording: boolean;
  recordingSamples: number;
};

type PerfFrameReport = {
  source: string;
  now: number;
  frameMs: number;
  renderLoopActive: boolean;
  renderLoopPaused: boolean;
  pageVisible: boolean;
  sceneOnscreen: boolean;
  scrollProgress: number;
  scrollPhase: ScrollPhase;
  qualityTier: QualityTier;
  postprocessingScale: number;
  activePostprocessingPasses: string[];
  postprocessingEnabled: boolean;
  bloomEnabled: boolean;
  frostEnabled: boolean;
  chromaticEnabled: boolean;
  globeVisible: boolean;
  globeRotating: boolean;
  globeAtmosphereEnabled: boolean;
  globeRoutesEnabled: boolean;
  globeCityLightsEnabled: boolean;
  starfieldEnabled: boolean;
  gridEnabled: boolean;
  hazeEnabled: boolean;
  renderer?: THREE.WebGLRenderer | null;
  canvas?: HTMLCanvasElement | null;
};

type RendererCounters = {
  calls: number;
  triangles: number;
  points: number;
  lines: number;
  geometries: number;
  textures: number;
  programs: number;
};

type SourceStats = {
  renderer: THREE.WebGLRenderer | null;
  canvas: HTMLCanvasElement | null;
  counters: RendererCounters;
  pixelRatio: number;
  cssWidth: number;
  cssHeight: number;
  bufferWidth: number;
  bufferHeight: number;
  activePasses: string[];
  renderLoopActive: boolean;
  renderLoopPaused: boolean;
};

type RecordingEntry = {
  timestamp: number;
  scrollY: number;
  scrollProgress: number;
  scrollPhase: ScrollPhase;
  fps: number;
  frameMs: number;
  drawCalls: number;
  triangles: number;
  textures: number;
  devicePixelRatio: number;
  rendererPixelRatio: number;
  activePostprocessingPasses: string[];
  debugFlags: PerfDebugFlags;
  qualityTier: QualityTier;
};

type PerfState = PerfSnapshot;

const defaultDebugFlags: PerfDebugFlags = {
  pauseRenderLoop: false,
  manualRenderNonce: 0,
  postprocessing: true,
  bloom: true,
  frost: true,
  chromatic: true,
  starfield: true,
  haze: true,
  grid: true,
  globeAtmosphere: true,
  globeRoutes: true,
  globeCities: true,
  globeRotation: true,
  globeVisible: true,
  forceMobileQuality: false,
  forceDesktopQuality: false,
  showWarnings: true,
};

const emptyCounters: RendererCounters = {
  calls: 0,
  triangles: 0,
  points: 0,
  lines: 0,
  geometries: 0,
  textures: 0,
  programs: 0,
};

let enabled = false;
let recordingInterval: number | null = null;
let recording: RecordingEntry[] = [];
const marks: Array<{ label: string; timestamp: number }> = [];
const listeners = new Set<() => void>();
const debugFlagListeners = new Set<() => void>();
const sources = new Map<string, SourceStats>();
const frameSamples: number[] = [];
const longFrameThreshold = PERF_BUDGETS.warnFrameMs;
let maxFrameMs = 0;
let longFrameCount = 0;
let globeRemountSuspected = false;
let lastGlobeRenderer: THREE.WebGLRenderer | null = null;
let lastIdleActiveMs = 0;

let state: PerfState = {
  enabled: false,
  timestamp: 0,
  fps: 0,
  fpsAvg: 0,
  frameMs: 0,
  frameMsAvg: 0,
  worstFrameMs: 0,
  longFrameCount: 0,
  rendererCount: 0,
  canvasCount: 0,
  devicePixelRatio: 1,
  rendererPixelRatio: 1,
  canvasCssWidth: 0,
  canvasCssHeight: 0,
  drawingBufferWidth: 0,
  drawingBufferHeight: 0,
  estimatedRenderedPixels: 0,
  renderLoopActive: false,
  renderLoopPaused: false,
  pageVisible: true,
  sceneOnscreen: true,
  scrollY: 0,
  scrollProgress: 0,
  scrollPhase: "idle",
  qualityTier: "desktop",
  postprocessingScale: 1,
  activePostprocessingPasses: [],
  postprocessingEnabled: false,
  bloomEnabled: false,
  frostEnabled: false,
  chromaticEnabled: false,
  globeVisible: true,
  globeRotating: true,
  globeAtmosphereEnabled: true,
  globeRoutesEnabled: true,
  globeCityLightsEnabled: true,
  starfieldEnabled: true,
  gridEnabled: true,
  hazeEnabled: true,
  drawCalls: 0,
  triangles: 0,
  points: 0,
  lines: 0,
  geometries: 0,
  textures: 0,
  shaderPrograms: 0,
  debugFlags: { ...defaultDebugFlags },
  warnings: [],
  recording: false,
  recordingSamples: 0,
};

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function emitDebugFlags() {
  for (const listener of debugFlagListeners) {
    listener();
  }
}

function patch(next: Partial<PerfState>) {
  state = { ...state, ...next };
  state.warnings = computeWarnings(state);
  emit();
}

function computeAverage(values: number[]) {
  if (values.length === 0) {
    return 0;
  }
  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

function readRendererCounters(renderer: THREE.WebGLRenderer | null): RendererCounters {
  if (!renderer || !renderer.info) {
    return { ...emptyCounters };
  }
  const renderInfo = renderer.info.render;
  const memoryInfo = renderer.info.memory;
  const programs = Array.isArray((renderer.info as { programs?: unknown[] }).programs)
    ? ((renderer.info as { programs?: unknown[] }).programs?.length ?? 0)
    : 0;
  return {
    calls: renderInfo?.calls ?? 0,
    triangles: renderInfo?.triangles ?? 0,
    points: renderInfo?.points ?? 0,
    lines: renderInfo?.lines ?? 0,
    geometries: memoryInfo?.geometries ?? 0,
    textures: memoryInfo?.textures ?? 0,
    programs,
  };
}

function refreshSourceMetrics(report: PerfFrameReport) {
  const previous = sources.get(report.source);
  const renderer = report.renderer ?? previous?.renderer ?? null;
  const canvas = report.canvas ?? previous?.canvas ?? null;

  if (report.source === "globe" && renderer && lastGlobeRenderer && lastGlobeRenderer !== renderer && report.scrollPhase !== "idle") {
    globeRemountSuspected = true;
  }
  if (report.source === "globe" && renderer) {
    lastGlobeRenderer = renderer;
  }

  const counters = readRendererCounters(renderer);
  const cssWidth = canvas ? Math.round(canvas.clientWidth) : previous?.cssWidth ?? 0;
  const cssHeight = canvas ? Math.round(canvas.clientHeight) : previous?.cssHeight ?? 0;
  const bufferWidth = canvas ? canvas.width : previous?.bufferWidth ?? 0;
  const bufferHeight = canvas ? canvas.height : previous?.bufferHeight ?? 0;
  const pixelRatio = renderer ? renderer.getPixelRatio() : previous?.pixelRatio ?? 1;

  sources.set(report.source, {
    renderer,
    canvas,
    counters,
    pixelRatio,
    cssWidth,
    cssHeight,
    bufferWidth,
    bufferHeight,
    activePasses: report.activePostprocessingPasses,
    renderLoopActive: report.renderLoopActive,
    renderLoopPaused: report.renderLoopPaused,
  });
}

function aggregateSourceMetrics() {
  const rendererCount = Array.from(sources.values()).filter((source) => source.renderer).length;
  const total: RendererCounters = { ...emptyCounters };
  let rendererPixelRatio = 1;
  let cssWidth = 0;
  let cssHeight = 0;
  let drawingBufferWidth = 0;
  let drawingBufferHeight = 0;
  let estimatedRenderedPixels = 0;
  const activePasses = new Set<string>();
  let renderLoopActive = false;
  let renderLoopPaused = false;

  for (const source of sources.values()) {
    total.calls += source.counters.calls;
    total.triangles += source.counters.triangles;
    total.points += source.counters.points;
    total.lines += source.counters.lines;
    total.geometries += source.counters.geometries;
    total.textures += source.counters.textures;
    total.programs += source.counters.programs;
    rendererPixelRatio = Math.max(rendererPixelRatio, source.pixelRatio);
    cssWidth = Math.max(cssWidth, source.cssWidth);
    cssHeight = Math.max(cssHeight, source.cssHeight);
    drawingBufferWidth = Math.max(drawingBufferWidth, source.bufferWidth);
    drawingBufferHeight = Math.max(drawingBufferHeight, source.bufferHeight);
    estimatedRenderedPixels += source.bufferWidth * source.bufferHeight;
    source.activePasses.forEach((pass) => activePasses.add(pass));
    renderLoopActive = renderLoopActive || source.renderLoopActive;
    renderLoopPaused = renderLoopPaused || source.renderLoopPaused;
  }

  const canvasCount = typeof document !== "undefined" ? document.querySelectorAll("canvas").length : rendererCount;

  return {
    rendererCount,
    canvasCount,
    rendererPixelRatio,
    cssWidth,
    cssHeight,
    drawingBufferWidth,
    drawingBufferHeight,
    estimatedRenderedPixels,
    drawCalls: total.calls,
    triangles: total.triangles,
    points: total.points,
    lines: total.lines,
    geometries: total.geometries,
    textures: total.textures,
    shaderPrograms: total.programs,
    activePasses: Array.from(activePasses.values()),
    renderLoopActive,
    renderLoopPaused,
  };
}

function pushFrameMetric(frameMs: number) {
  const safeFrameMs = Number.isFinite(frameMs) ? Math.max(frameMs, 0) : 0;
  frameSamples.push(safeFrameMs);
  if (frameSamples.length > 240) {
    frameSamples.shift();
  }
  maxFrameMs = Math.max(maxFrameMs, safeFrameMs);
  if (safeFrameMs >= longFrameThreshold) {
    longFrameCount += 1;
  }
}

function computeWarnings(snapshot: PerfSnapshot) {
  const warnings: string[] = [];
  if (!snapshot.enabled) {
    return warnings;
  }
  if (snapshot.rendererCount > PERF_BUDGETS.maxRendererCount) {
    warnings.push(`Renderer count ${snapshot.rendererCount} exceeds budget ${PERF_BUDGETS.maxRendererCount}`);
  }
  if (snapshot.canvasCount > PERF_BUDGETS.maxCanvasCount) {
    warnings.push(`Canvas count ${snapshot.canvasCount} exceeds budget ${PERF_BUDGETS.maxCanvasCount}`);
  }
  if (snapshot.qualityTier === "mobile" && snapshot.devicePixelRatio > PERF_BUDGETS.maxMobileDpr) {
    warnings.push(`Mobile DPR ${snapshot.devicePixelRatio.toFixed(2)} above max ${PERF_BUDGETS.maxMobileDpr}`);
  }
  if (snapshot.qualityTier === "mobile" && snapshot.devicePixelRatio > PERF_BUDGETS.warnMobileDpr) {
    warnings.push(`Mobile DPR ${snapshot.devicePixelRatio.toFixed(2)} above warning ${PERF_BUDGETS.warnMobileDpr}`);
  }
  if (snapshot.worstFrameMs > PERF_BUDGETS.badFrameMs) {
    warnings.push(`Worst frame ${snapshot.worstFrameMs.toFixed(1)}ms exceeds ${PERF_BUDGETS.badFrameMs}ms`);
  }
  if (snapshot.fpsAvg > 0 && snapshot.fpsAvg < PERF_BUDGETS.minMobileFps) {
    warnings.push(`Average FPS ${snapshot.fpsAvg.toFixed(1)} below ${PERF_BUDGETS.minMobileFps}`);
  }
  if (snapshot.drawCalls > PERF_BUDGETS.maxDrawCallsMobile) {
    warnings.push(`Draw calls ${snapshot.drawCalls} exceed warning budget ${PERF_BUDGETS.maxDrawCallsMobile}`);
  }
  if (snapshot.textures > PERF_BUDGETS.maxTexturesMobile) {
    warnings.push(`Textures ${snapshot.textures} exceed warning budget ${PERF_BUDGETS.maxTexturesMobile}`);
  }
  if (snapshot.triangles > PERF_BUDGETS.maxTrianglesMobile) {
    warnings.push(`Triangles ${snapshot.triangles} exceed warning budget ${PERF_BUDGETS.maxTrianglesMobile}`);
  }
  if (snapshot.renderLoopActive && snapshot.scrollPhase === "idle" && snapshot.timestamp - lastIdleActiveMs > PERF_BUDGETS.maxIdleRenderMsAfterScroll) {
    warnings.push("Render loop active while idle phase");
  }
  if (snapshot.activePostprocessingPasses.length > 0 && snapshot.scrollPhase === "idle") {
    warnings.push("Postprocessing active while idle");
  }
  if (globeRemountSuspected) {
    warnings.push("Possible globe remount/reload detected during scroll");
  }
  if (snapshot.estimatedRenderedPixels > 8_000_000) {
    warnings.push(`Large drawing buffer load: ${snapshot.estimatedRenderedPixels.toLocaleString()} pixels`);
  }
  return warnings;
}

function recordingTick() {
  if (!enabled || !state.recording) {
    return;
  }
  recording.push({
    timestamp: Date.now(),
    scrollY: state.scrollY,
    scrollProgress: state.scrollProgress,
    scrollPhase: state.scrollPhase,
    fps: state.fps,
    frameMs: state.frameMs,
    drawCalls: state.drawCalls,
    triangles: state.triangles,
    textures: state.textures,
    devicePixelRatio: state.devicePixelRatio,
    rendererPixelRatio: state.rendererPixelRatio,
    activePostprocessingPasses: [...state.activePostprocessingPasses],
    debugFlags: { ...state.debugFlags },
    qualityTier: state.qualityTier,
  });
  patch({ recordingSamples: recording.length });
}

function bindWindowApi() {
  if (typeof window === "undefined") {
    return;
  }
  window.DH_PERF = {
    snapshot: () => getWebglPerfSnapshot(),
    summary: () => getWebglPerfSummary(),
    reset: () => resetWebglPerfMonitor(),
    mark: (label: string) => markWebglPerf(label),
    setDebugFlag: (flagName: keyof PerfDebugFlags, value: boolean | number) => setWebglPerfDebugFlag(flagName, value),
    getDebugFlags: () => ({ ...state.debugFlags }),
    startRecording: () => startWebglPerfRecording(),
    stopRecording: () => stopWebglPerfRecording(),
    exportRecording: () => exportWebglPerfRecording(),
  };
}

function unbindWindowApi() {
  if (typeof window === "undefined") {
    return;
  }
  delete window.DH_PERF;
}

export function initWebglPerfMonitor(shouldEnable: boolean) {
  enabled = shouldEnable;
  if (!enabled) {
    if (recordingInterval) {
      window.clearInterval(recordingInterval);
      recordingInterval = null;
    }
    patch({ enabled: false, recording: false });
    unbindWindowApi();
    return;
  }
  patch({ enabled: true });
  bindWindowApi();
}

export function subscribeWebglPerfMonitor(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getWebglPerfSnapshot() {
  return state;
}

export function subscribeWebglPerfDebugFlags(listener: () => void) {
  debugFlagListeners.add(listener);
  return () => debugFlagListeners.delete(listener);
}

export function getWebglPerfDebugFlagsSnapshot() {
  return state.debugFlags;
}

export function setWebglPerfSceneState(next: Partial<PerfSceneState>) {
  if (!enabled) {
    return;
  }
  if (next.scrollPhase === "idle" && next.renderLoopActive) {
    lastIdleActiveMs = Date.now();
  }
  patch({
    scrollProgress: next.scrollProgress ?? state.scrollProgress,
    scrollPhase: next.scrollPhase ?? state.scrollPhase,
    qualityTier: next.qualityTier ?? state.qualityTier,
    postprocessingScale: next.postprocessingScale ?? state.postprocessingScale,
    postprocessingEnabled: next.postprocessingEnabled ?? state.postprocessingEnabled,
    bloomEnabled: next.bloomEnabled ?? state.bloomEnabled,
    frostEnabled: next.frostEnabled ?? state.frostEnabled,
    chromaticEnabled: next.chromaticEnabled ?? state.chromaticEnabled,
    globeVisible: next.globeVisible ?? state.globeVisible,
    globeRotating: next.globeRotating ?? state.globeRotating,
    globeAtmosphereEnabled: next.globeAtmosphereEnabled ?? state.globeAtmosphereEnabled,
    globeRoutesEnabled: next.globeRoutesEnabled ?? state.globeRoutesEnabled,
    globeCityLightsEnabled: next.globeCityLightsEnabled ?? state.globeCityLightsEnabled,
    starfieldEnabled: next.starfieldEnabled ?? state.starfieldEnabled,
    gridEnabled: next.gridEnabled ?? state.gridEnabled,
    hazeEnabled: next.hazeEnabled ?? state.hazeEnabled,
    renderLoopActive: next.renderLoopActive ?? state.renderLoopActive,
    renderLoopPaused: next.renderLoopPaused ?? state.renderLoopPaused,
    pageVisible: next.pageVisible ?? state.pageVisible,
    sceneOnscreen: next.sceneOnscreen ?? state.sceneOnscreen,
  });
}

export function reportWebglFrame(report: PerfFrameReport) {
  if (!enabled) {
    return;
  }

  refreshSourceMetrics(report);
  pushFrameMetric(report.frameMs);

  const aggregates = aggregateSourceMetrics();
  const frameMsAvg = computeAverage(frameSamples);
  const fps = report.frameMs > 0 ? 1000 / report.frameMs : 0;
  const fpsAvg = frameMsAvg > 0 ? 1000 / frameMsAvg : 0;
  const scrollY = typeof window !== "undefined" ? window.scrollY : state.scrollY;
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : state.devicePixelRatio;

  if (report.scrollPhase === "idle" && report.renderLoopActive) {
    lastIdleActiveMs = Date.now();
  }

  patch({
    enabled: true,
    timestamp: report.now,
    fps,
    fpsAvg,
    frameMs: report.frameMs,
    frameMsAvg,
    worstFrameMs: maxFrameMs,
    longFrameCount,
    rendererCount: aggregates.rendererCount,
    canvasCount: aggregates.canvasCount,
    devicePixelRatio: dpr,
    rendererPixelRatio: aggregates.rendererPixelRatio,
    canvasCssWidth: aggregates.cssWidth,
    canvasCssHeight: aggregates.cssHeight,
    drawingBufferWidth: aggregates.drawingBufferWidth,
    drawingBufferHeight: aggregates.drawingBufferHeight,
    estimatedRenderedPixels: aggregates.estimatedRenderedPixels,
    renderLoopActive: report.renderLoopActive || aggregates.renderLoopActive,
    renderLoopPaused: report.renderLoopPaused || aggregates.renderLoopPaused,
    pageVisible: report.pageVisible,
    sceneOnscreen: report.sceneOnscreen,
    scrollY,
    scrollProgress: report.scrollProgress,
    scrollPhase: report.scrollPhase,
    qualityTier: report.qualityTier,
    postprocessingScale: report.postprocessingScale,
    activePostprocessingPasses: aggregates.activePasses,
    postprocessingEnabled: report.postprocessingEnabled,
    bloomEnabled: report.bloomEnabled,
    frostEnabled: report.frostEnabled,
    chromaticEnabled: report.chromaticEnabled,
    globeVisible: report.globeVisible,
    globeRotating: report.globeRotating,
    globeAtmosphereEnabled: report.globeAtmosphereEnabled,
    globeRoutesEnabled: report.globeRoutesEnabled,
    globeCityLightsEnabled: report.globeCityLightsEnabled,
    starfieldEnabled: report.starfieldEnabled,
    gridEnabled: report.gridEnabled,
    hazeEnabled: report.hazeEnabled,
    drawCalls: aggregates.drawCalls,
    triangles: aggregates.triangles,
    points: aggregates.points,
    lines: aggregates.lines,
    geometries: aggregates.geometries,
    textures: aggregates.textures,
    shaderPrograms: aggregates.shaderPrograms,
  });
}

export function setWebglPerfDebugFlag(flagName: keyof PerfDebugFlags, value: boolean | number) {
  const nextFlags = { ...state.debugFlags, [flagName]: value } as PerfDebugFlags;
  if (flagName === "forceMobileQuality" && value === true) {
    nextFlags.forceDesktopQuality = false;
  }
  if (flagName === "forceDesktopQuality" && value === true) {
    nextFlags.forceMobileQuality = false;
  }
  patch({ debugFlags: nextFlags });
  emitDebugFlags();
}

export function getWebglPerfDebugFlags() {
  return state.debugFlags;
}

export function startWebglPerfRecording() {
  if (!enabled || state.recording) {
    return;
  }
  recording = [];
  if (recordingInterval) {
    window.clearInterval(recordingInterval);
    recordingInterval = null;
  }
  patch({ recording: true, recordingSamples: 0 });
  if (typeof window !== "undefined") {
    recordingInterval = window.setInterval(recordingTick, 500);
  }
}

export function stopWebglPerfRecording() {
  if (!state.recording) {
    return;
  }
  if (recordingInterval) {
    window.clearInterval(recordingInterval);
    recordingInterval = null;
  }
  patch({ recording: false, recordingSamples: recording.length });
}

export function exportWebglPerfRecording() {
  return {
    meta: {
      capturedAt: new Date().toISOString(),
      samples: recording.length,
      marks: [...marks],
      budgets: PERF_BUDGETS,
    },
    samples: [...recording],
  };
}

export function markWebglPerf(label: string) {
  marks.push({ label, timestamp: Date.now() });
}

export function resetWebglPerfMonitor() {
  frameSamples.length = 0;
  sources.clear();
  recording = [];
  marks.length = 0;
  maxFrameMs = 0;
  longFrameCount = 0;
  globeRemountSuspected = false;
  lastGlobeRenderer = null;
  if (recordingInterval) {
    window.clearInterval(recordingInterval);
    recordingInterval = null;
  }
  state = {
    ...state,
    timestamp: 0,
    fps: 0,
    fpsAvg: 0,
    frameMs: 0,
    frameMsAvg: 0,
    worstFrameMs: 0,
    longFrameCount: 0,
    rendererCount: 0,
    canvasCount: 0,
    rendererPixelRatio: 1,
    canvasCssWidth: 0,
    canvasCssHeight: 0,
    drawingBufferWidth: 0,
    drawingBufferHeight: 0,
    estimatedRenderedPixels: 0,
    postprocessingEnabled: false,
    drawCalls: 0,
    triangles: 0,
    points: 0,
    lines: 0,
    geometries: 0,
    textures: 0,
    shaderPrograms: 0,
    warnings: [],
    recording: false,
    recordingSamples: 0,
    debugFlags: { ...defaultDebugFlags },
  };
  emit();
}

export function getWebglPerfSummary() {
  return {
    timestamp: state.timestamp,
    fps: state.fps,
    fpsAvg: state.fpsAvg,
    frameMs: state.frameMs,
    frameMsAvg: state.frameMsAvg,
    worstFrameMs: state.worstFrameMs,
    longFrameCount: state.longFrameCount,
    rendererCount: state.rendererCount,
    canvasCount: state.canvasCount,
    devicePixelRatio: state.devicePixelRatio,
    rendererPixelRatio: state.rendererPixelRatio,
    drawingBuffer: `${state.drawingBufferWidth}x${state.drawingBufferHeight}`,
    estimatedRenderedPixels: state.estimatedRenderedPixels,
    drawCalls: state.drawCalls,
    triangles: state.triangles,
    textures: state.textures,
    shaderPrograms: state.shaderPrograms,
    scrollPhase: state.scrollPhase,
    scrollProgress: state.scrollProgress,
    qualityTier: state.qualityTier,
    activePostprocessingPasses: [...state.activePostprocessingPasses],
    warnings: [...state.warnings],
    debugFlags: { ...state.debugFlags },
  };
}

declare global {
  interface Window {
    DH_PERF?: {
      snapshot: typeof getWebglPerfSnapshot;
      summary: typeof getWebglPerfSummary;
      reset: typeof resetWebglPerfMonitor;
      mark: typeof markWebglPerf;
      setDebugFlag: (flagName: keyof PerfDebugFlags, value: boolean | number) => void;
      getDebugFlags: () => PerfDebugFlags;
      startRecording: typeof startWebglPerfRecording;
      stopRecording: typeof stopWebglPerfRecording;
      exportRecording: typeof exportWebglPerfRecording;
    };
  }
}
