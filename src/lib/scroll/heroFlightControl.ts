type HeroFlightMode = "ROUTE_IDLE" | "HERO_TRANSITION" | "JOURNEY_READY" | "HERO_RETURN";
type ManualScrollDirection = -1 | 0 | 1;

type HeroReturnProgressInput = {
  useScrollScrub: boolean;
  currentScrollProgress: number;
  rewindStartScrollProgress: number;
  elapsed: number;
  returnStartTime: number;
  durationSeconds: number;
};

type ShouldStartHeroReturnInput = {
  autoRewindActive: boolean;
  manualReverseHoldActive: boolean;
  heroMode: HeroFlightMode;
  userInputActive: boolean;
  manualScrollDirection: ManualScrollDirection;
};

export const shouldStartHeroReturn = ({
  autoRewindActive,
  manualReverseHoldActive,
  heroMode,
  userInputActive,
  manualScrollDirection,
}: ShouldStartHeroReturnInput) => {
  if (heroMode === "ROUTE_IDLE" || heroMode === "HERO_RETURN") {
    return false;
  }

  if (autoRewindActive) {
    return true;
  }

  if (manualReverseHoldActive && userInputActive && manualScrollDirection < 0) {
    return true;
  }

  return false;
};

type ShouldScrubHeroReturnWithScrollInput = {
  autoRewindActive: boolean;
  manualReverseHoldActive: boolean;
  userInputActive: boolean;
  manualScrollDirection: ManualScrollDirection;
};

export const shouldScrubHeroReturnWithScroll = ({
  autoRewindActive,
  manualReverseHoldActive,
  userInputActive,
  manualScrollDirection,
}: ShouldScrubHeroReturnWithScrollInput) => {
  if (autoRewindActive) {
    return true;
  }

  if (manualReverseHoldActive) {
    return true;
  }

  return false;
};

type ShouldResumeHeroLaunchFromReturnInput = {
  autoCompleteActive: boolean;
  manualReverseHoldActive: boolean;
  heroMode: HeroFlightMode;
  userInputActive: boolean;
  manualScrollDirection: ManualScrollDirection;
};

export const shouldResumeHeroLaunchFromReturn = ({
  autoCompleteActive,
  manualReverseHoldActive,
  heroMode,
  userInputActive,
  manualScrollDirection,
}: ShouldResumeHeroLaunchFromReturnInput) => {
  return (
    heroMode === "HERO_RETURN" &&
    (autoCompleteActive || (manualReverseHoldActive && userInputActive && manualScrollDirection > 0))
  );
};

type ShouldResumeInterruptedAutoCompleteInput = {
  manualReverseHoldActive: boolean;
  currentScrollProgress: number;
  nowMs: number;
  lastManualScrollInputMs: number;
  idleResumeMs: number;
  minResumeProgress: number;
};

export const shouldResumeInterruptedAutoComplete = ({
  manualReverseHoldActive,
  currentScrollProgress,
  nowMs,
  lastManualScrollInputMs,
  idleResumeMs,
  minResumeProgress,
}: ShouldResumeInterruptedAutoCompleteInput) => {
  if (!manualReverseHoldActive || currentScrollProgress < minResumeProgress) {
    return false;
  }

  if (lastManualScrollInputMs <= 0) {
    return false;
  }

  return nowMs - lastManualScrollInputMs >= idleResumeMs;
};

type HeroLaunchSpawnFollowInput = {
  launchProgress: number;
  resumedFromCurrentPose: boolean;
};

export const getHeroLaunchSpawnFollow = ({
  launchProgress,
  resumedFromCurrentPose,
}: HeroLaunchSpawnFollowInput) => {
  if (resumedFromCurrentPose) {
    return 1;
  }

  return Math.max(0, Math.min(1, (launchProgress - 0.02) / Math.max(0.18 - 0.02, 0.001)));
};

type ShouldKeepInterruptedTransitionTickingInput = {
  manualReverseHoldActive: boolean;
  targetProgress: number;
  smoothedProgress: number;
  autoCompleting: boolean;
  autoRewindTriggered: boolean;
};

export const shouldKeepInterruptedTransitionTicking = ({
  manualReverseHoldActive,
  targetProgress,
  smoothedProgress,
  autoCompleting,
  autoRewindTriggered,
}: ShouldKeepInterruptedTransitionTickingInput) => {
  if (manualReverseHoldActive) {
    return true;
  }

  return (
    Math.abs(targetProgress - smoothedProgress) > 0.0006 ||
    autoCompleting ||
    autoRewindTriggered
  );
};

export const getHeroReturnLinearProgress = ({
  useScrollScrub,
  currentScrollProgress,
  rewindStartScrollProgress,
  elapsed,
  returnStartTime,
  durationSeconds,
}: HeroReturnProgressInput) => {
  if (useScrollScrub) {
    return Math.max(
      0,
      Math.min(1, 1 - currentScrollProgress / Math.max(rewindStartScrollProgress, 0.001)),
    );
  }

  return Math.max(
    0,
    Math.min(1, (elapsed - returnStartTime) / Math.max(durationSeconds, 0.001)),
  );
};
