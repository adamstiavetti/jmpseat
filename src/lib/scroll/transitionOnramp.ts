type EarlyTransitionOnrampInput = {
  gestureCount: number;
  progress: number;
  minimumGestureCount: number;
  progressStart: number;
  progressEnd: number;
  maxStrength: number;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const smoothstep = (edge0: number, edge1: number, value: number) => {
  if (edge0 === edge1) {
    return value < edge0 ? 0 : 1;
  }
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

export const getEarlyTransitionOnrampStrength = ({
  gestureCount,
  progress,
  minimumGestureCount,
  progressStart,
  progressEnd,
  maxStrength,
}: EarlyTransitionOnrampInput) => {
  if (gestureCount < minimumGestureCount) {
    return 0;
  }

  return smoothstep(progressStart, progressEnd, progress) * Math.max(0, maxStrength);
};

type EarlyTransitionOnrampFactorInput = {
  strength: number;
  maxStrength: number;
};

export const getEarlyTransitionOnrampFactor = ({
  strength,
  maxStrength,
}: EarlyTransitionOnrampFactorInput) => {
  return clamp01(strength / Math.max(maxStrength, 1e-6));
};

type EarlyCanvasOpacityInput = {
  mainOpacity: number;
  earlyFactor: number;
  maxOpacity: number;
};

export const getEarlyCanvasOpacity = ({
  mainOpacity,
  earlyFactor,
  maxOpacity,
}: EarlyCanvasOpacityInput) => {
  return Math.max(mainOpacity, clamp01(earlyFactor) * clamp01(maxOpacity));
};
