export const GLASS_CARD_RISE_START_PROGRESS = 0.82;
export const GLASS_CARD_RISE_END_PROGRESS = 0.97;
export const GLASS_CARD_SETTLE_START_PROGRESS = 0.88;
export const GLASS_CARD_SETTLE_END_PROGRESS = 1;
export const GLASS_CARD_HERO_ENTRY_START_PROGRESS = 0.9;
export const GLASS_CARD_HERO_ENTRY_END_PROGRESS = 0.98;

type GlassCardLayoutArgs = {
  isMobileLayout: boolean;
};

type GlassCardTransitionArgs = GlassCardLayoutArgs & {
  currentScrollProgress: number;
};

type GlassCardBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
};

type GlassCardTransform = {
  x: number;
  y: number;
  z: number;
  scale: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
};

type GlassCardTransitionState = GlassCardTransform & {
  visible: boolean;
  presence: number;
  riseProgress: number;
  settleProgress: number;
};

type GlassCardEntryLocalPointArgs = {
  normalizedBounds: GlassCardBounds;
  leftPaneBounds?: GlassCardBounds | null;
  rightPaneBounds?: GlassCardBounds | null;
};

type GlassCardJourneyPresentationArgs = {
  entryBlend: number;
  preEntryOffset: number;
};

type GlassCardJourneyPathArgs = {
  entryPoint: {
    x: number;
    y: number;
    z: number;
  };
  entryBlend: number;
  preEntryOffset: number;
};

type GlassCardRecoveryPathArgs = {
  entryPoint: {
    x: number;
    y: number;
    z: number;
  };
  preEntryOffset: number;
  recoveryLift: number;
};

type GlassCardDisplayPathPointsArgs = {
  includeOrigin: boolean;
  originPoint: { x: number; y: number; z: number };
  sampledCurvePoints: Array<{ x: number; y: number; z: number }>;
  approachPoint: { x: number; y: number; z: number };
  currentPoint: { x: number; y: number; z: number };
};

type GlassCardRecoveryDropPathArgs = {
  entryPoint: { x: number; y: number; z: number };
  preEntryOffset: number;
  recoveryLift: number;
  dropBlend: number;
};

type GlassCardRecoverySequenceArgs = {
  elapsedSeconds: number;
  reconnectDuration: number;
  dropDuration: number;
};

type GlassCardHeroFlightReadinessArgs = {
  currentScrollProgress: number;
  glassCardLoaded: boolean;
};

type GlassCardReconnectControlPointArgs = {
  originPoint: { x: number; y: number; z: number };
  topPoint: { x: number; y: number; z: number };
  sweepLift: number;
  verticalLeadIn: number;
};

const lerp = (start: number, end: number, progress: number) => start + (end - start) * progress;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const smoothstep = (value: number, edge0: number, edge1: number) => {
  if (edge0 === edge1) {
    return value >= edge1 ? 1 : 0;
  }

  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

const getGlassCardHiddenTransform = ({ isMobileLayout }: GlassCardLayoutArgs): GlassCardTransform => ({
  x: isMobileLayout ? 0.03 : 0.06,
  y: isMobileLayout ? -1.72 : -1.84,
  z: isMobileLayout ? 0.92 : 1.04,
  scale: {
    x: isMobileLayout ? 0.82 : 0.94,
    y: isMobileLayout ? 0.82 : 0.94,
    z: isMobileLayout ? 0.92 : 1.04,
  },
  rotation: {
    x: Math.PI / 2 - 0.16,
    y: isMobileLayout ? 0.52 : 0.44,
    z: isMobileLayout ? -0.38 : -0.3,
  },
});

export const getGlassCardFinalTransform = ({ isMobileLayout }: GlassCardLayoutArgs): GlassCardTransform => ({
  x: isMobileLayout ? 0.02 : 0.05,
  y: isMobileLayout ? 0.08 : 0.12,
  z: isMobileLayout ? 0.78 : 0.9,
  scale: {
    x: isMobileLayout ? 1.22 : 1.34,
    y: isMobileLayout ? 1.22 : 1.34,
    z: isMobileLayout ? 1.42 : 1.56,
  },
  rotation: { x: Math.PI / 2, y: 0, z: 0 },
});

export const getGlassCardEntryLocalPoint = ({
  normalizedBounds,
  leftPaneBounds,
  rightPaneBounds,
}: GlassCardEntryLocalPointArgs) => {
  const thickness = Math.max(normalizedBounds.maxY - normalizedBounds.minY, 0);
  const hasPaneBounds = Boolean(leftPaneBounds && rightPaneBounds);

  return {
    x: hasPaneBounds
      ? ((leftPaneBounds?.maxX ?? 0) + (rightPaneBounds?.minX ?? 0)) * 0.5
      : normalizedBounds.minX + (normalizedBounds.maxX - normalizedBounds.minX) * 0.335,
    y: normalizedBounds.maxY - Math.max(thickness * 0.12, 0.002),
    z: (normalizedBounds.minZ + normalizedBounds.maxZ) * 0.5,
  };
};

export const getGlassCardJourneyPresentation = ({
  entryBlend,
  preEntryOffset,
}: GlassCardJourneyPresentationArgs) => ({
  offset: lerp(preEntryOffset, 0, clamp01(entryBlend)),
  opacity: 1,
});

export const getGlassCardJourneyPath = ({
  entryPoint,
  entryBlend,
  preEntryOffset,
}: GlassCardJourneyPathArgs) => {
  const presentation = getGlassCardJourneyPresentation({
    entryBlend,
    preEntryOffset,
  });

  return {
    approachPoint: {
      x: entryPoint.x,
      y: entryPoint.y + preEntryOffset,
      z: entryPoint.z,
    },
    currentPoint: {
      x: entryPoint.x,
      y: entryPoint.y + presentation.offset,
      z: entryPoint.z,
    },
    opacity: presentation.opacity,
  };
};

export const getGlassCardRecoveryPath = ({
  entryPoint,
  preEntryOffset,
  recoveryLift,
}: GlassCardRecoveryPathArgs) => {
  const approachPoint = {
    x: entryPoint.x,
    y: entryPoint.y + preEntryOffset,
    z: entryPoint.z,
  };

  return {
    approachPoint,
    reentryTopPoint: {
      x: entryPoint.x,
      y: approachPoint.y + recoveryLift,
      z: entryPoint.z,
    },
  };
};

export const getGlassCardDisplayPathPoints = ({
  includeOrigin,
  originPoint,
  sampledCurvePoints,
  approachPoint,
  currentPoint,
}: GlassCardDisplayPathPointsArgs) => {
  const points = includeOrigin ? [originPoint, ...sampledCurvePoints] : [...sampledCurvePoints];
  points.push(approachPoint);
  if (getGlassCardDisplayPathIncludesCurrentPoint({ approachPoint, currentPoint })) {
    points.push(currentPoint);
  }
  return points;
};

export const getGlassCardDisplayPathIncludesCurrentPoint = ({
  approachPoint,
  currentPoint,
}: Pick<GlassCardDisplayPathPointsArgs, "approachPoint" | "currentPoint">) => {
  const dx = currentPoint.x - approachPoint.x;
  const dy = currentPoint.y - approachPoint.y;
  const dz = currentPoint.z - approachPoint.z;
  return dx * dx + dy * dy + dz * dz > 1e-8;
};

export const getGlassCardRecoveryDropPath = ({
  entryPoint,
  preEntryOffset,
  recoveryLift,
  dropBlend,
}: GlassCardRecoveryDropPathArgs) => {
  const recoveryPath = getGlassCardRecoveryPath({
    entryPoint,
    preEntryOffset,
    recoveryLift,
  });
  const clampedBlend = clamp01(dropBlend);
  return {
    reentryTopPoint: recoveryPath.reentryTopPoint,
    currentPoint: {
      x: entryPoint.x,
      y: lerp(recoveryPath.reentryTopPoint.y, entryPoint.y, clampedBlend),
      z: entryPoint.z,
    },
  };
};

export const getGlassCardRecoverySequence = ({
  elapsedSeconds,
  reconnectDuration,
  dropDuration,
}: GlassCardRecoverySequenceArgs) => {
  const clampedElapsed = Math.max(0, elapsedSeconds);
  const reconnectBlend =
    reconnectDuration <= 0 ? 1 : clamp01(clampedElapsed / reconnectDuration);
  const dropBlend =
    dropDuration <= 0
      ? 1
      : clamp01((clampedElapsed - Math.max(reconnectDuration, 0)) / dropDuration);

  return {
    reconnectBlend,
    dropBlend,
  };
};

export const shouldDelayGlassCardHeroFlight = ({
  glassCardLoaded,
}: GlassCardHeroFlightReadinessArgs) => !glassCardLoaded;

export const getGlassCardReconnectControlPoints = ({
  originPoint,
  topPoint,
  sweepLift,
  verticalLeadIn,
}: GlassCardReconnectControlPointArgs) => {
  const dx = topPoint.x - originPoint.x;
  const dy = topPoint.y - originPoint.y;
  const dz = topPoint.z - originPoint.z;
  const length = Math.hypot(dx, dy, dz) || 1;
  const normalX = -dz / length;
  const normalZ = dx / length;

  return {
    controlA: {
      x: originPoint.x + dx * 0.34 + normalX * sweepLift * 0.38,
      y: originPoint.y + dy * 0.34 + sweepLift,
      z: originPoint.z + dz * 0.34 + normalZ * sweepLift * 0.38,
    },
    controlB: {
      x: topPoint.x,
      y: topPoint.y + verticalLeadIn,
      z: topPoint.z,
    },
  };
};

export const getGlassCardTransitionState = ({
  currentScrollProgress,
  isMobileLayout,
}: GlassCardTransitionArgs): GlassCardTransitionState => {
  const hidden = getGlassCardHiddenTransform({ isMobileLayout });
  const finalPose = getGlassCardFinalTransform({ isMobileLayout });
  const riseProgress = smoothstep(
    currentScrollProgress,
    GLASS_CARD_RISE_START_PROGRESS,
    GLASS_CARD_RISE_END_PROGRESS,
  );
  const settleProgress = smoothstep(
    currentScrollProgress,
    GLASS_CARD_SETTLE_START_PROGRESS,
    GLASS_CARD_SETTLE_END_PROGRESS,
  );
  const presence = smoothstep(riseProgress, 0.08, 0.34);

  return {
    visible: presence > 0.001,
    presence,
    riseProgress,
    settleProgress,
    x: lerp(hidden.x, finalPose.x, settleProgress),
    y: lerp(hidden.y, finalPose.y, riseProgress),
    z: lerp(hidden.z, finalPose.z, settleProgress),
    scale: {
      x: lerp(hidden.scale.x, finalPose.scale.x, settleProgress),
      y: lerp(hidden.scale.y, finalPose.scale.y, settleProgress),
      z: lerp(hidden.scale.z, finalPose.scale.z, settleProgress),
    },
    rotation: {
      x: lerp(hidden.rotation.x, finalPose.rotation.x, settleProgress),
      y: lerp(hidden.rotation.y, finalPose.rotation.y, settleProgress),
      z: lerp(hidden.rotation.z, finalPose.rotation.z, settleProgress),
    },
  };
};
