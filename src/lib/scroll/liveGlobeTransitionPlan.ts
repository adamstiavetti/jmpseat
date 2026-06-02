export type LiveGlobeTransitionLayout = "mobile" | "desktop";

type LiveGlobeTransitionShotStateArgs = {
  progress: number;
  layout: LiveGlobeTransitionLayout;
};

export type LiveGlobeTransitionShotState = {
  cameraTravelProgress: number;
  cameraLiftMix: number;
  cameraDriftX: number;
  collapseProgress: number;
  globeScaleMix: number;
  globeLiftMix: number;
  occlusionProgress: number;
  revealProgress: number;
  brandDissolveProgress: number;
  backgroundTakeoverProgress: number;
};

export const LIVE_GLOBE_TRANSITION_PHASES = {
  cameraTravelStart: 0.12,
  cameraTravelEnd: 0.9,
  collapseStart: 0.58,
  collapseEnd: 0.92,
  occlusionStart: 0.68,
  occlusionEnd: 0.84,
  revealStart: 0.84,
  revealEnd: 1,
  brandDissolveStart: 0.46,
  brandDissolveEnd: 0.78,
  backgroundTakeoverStart: 0.72,
  backgroundTakeoverEnd: 0.98,
} as const;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const smoothstep = (edge0: number, edge1: number, value: number) => {
  if (edge0 === edge1) {
    return value < edge0 ? 0 : 1;
  }

  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

const lerp = (start: number, end: number, progress: number) => start + (end - start) * progress;

export const getLiveGlobeTransitionShotState = ({
  progress,
  layout,
}: LiveGlobeTransitionShotStateArgs): LiveGlobeTransitionShotState => {
  const clampedProgress = clamp01(progress);
  const cameraTravelProgress = smoothstep(
    LIVE_GLOBE_TRANSITION_PHASES.cameraTravelStart,
    LIVE_GLOBE_TRANSITION_PHASES.cameraTravelEnd,
    clampedProgress,
  );
  const collapseProgress = smoothstep(
    LIVE_GLOBE_TRANSITION_PHASES.collapseStart,
    LIVE_GLOBE_TRANSITION_PHASES.collapseEnd,
    clampedProgress,
  );
  const occlusionProgress = smoothstep(
    LIVE_GLOBE_TRANSITION_PHASES.occlusionStart,
    LIVE_GLOBE_TRANSITION_PHASES.occlusionEnd,
    clampedProgress,
  );
  const revealProgress = smoothstep(
    LIVE_GLOBE_TRANSITION_PHASES.revealStart,
    LIVE_GLOBE_TRANSITION_PHASES.revealEnd,
    clampedProgress,
  );
  const brandDissolveProgress = smoothstep(
    LIVE_GLOBE_TRANSITION_PHASES.brandDissolveStart,
    LIVE_GLOBE_TRANSITION_PHASES.brandDissolveEnd,
    clampedProgress,
  );
  const backgroundTakeoverProgress = smoothstep(
    LIVE_GLOBE_TRANSITION_PHASES.backgroundTakeoverStart,
    LIVE_GLOBE_TRANSITION_PHASES.backgroundTakeoverEnd,
    clampedProgress,
  );
  const globeScaleMix = collapseProgress;
  const globeLiftMix = lerp(cameraTravelProgress * 0.16, 1, collapseProgress);
  const cameraLiftMix = cameraTravelProgress;
  const cameraDriftX = lerp(0, layout === "mobile" ? -0.08 : -0.14, smoothstep(0.22, 0.76, clampedProgress));

  return {
    cameraTravelProgress,
    cameraLiftMix,
    cameraDriftX,
    collapseProgress,
    globeScaleMix,
    globeLiftMix,
    occlusionProgress,
    revealProgress,
    brandDissolveProgress,
    backgroundTakeoverProgress,
  };
};
