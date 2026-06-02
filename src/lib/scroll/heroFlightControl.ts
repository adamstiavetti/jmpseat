type HeroFlightMode = "ROUTE_IDLE" | "HERO_TRANSITION" | "JOURNEY_READY" | "HERO_RETURN";

type HeroReturnProgressInput = {
  autoRewindActive: boolean;
  manualReverseHoldActive: boolean;
  currentScrollProgress: number;
  rewindStartScrollProgress: number;
  elapsed: number;
  returnStartTime: number;
  durationSeconds: number;
};

type ShouldStartHeroReturnInput = {
  autoCompleteActive: boolean;
  autoRewindActive: boolean;
  manualReverseHoldActive: boolean;
  heroMode: HeroFlightMode;
};

export const shouldStartHeroReturn = ({
  autoCompleteActive,
  autoRewindActive,
  manualReverseHoldActive,
  heroMode,
}: ShouldStartHeroReturnInput) => {
  if (heroMode === "ROUTE_IDLE" || heroMode === "HERO_RETURN") {
    return false;
  }

  if (autoRewindActive || manualReverseHoldActive) {
    return true;
  }

  return !autoCompleteActive;
};

export const getHeroReturnLinearProgress = ({
  autoRewindActive,
  manualReverseHoldActive,
  currentScrollProgress,
  rewindStartScrollProgress,
  elapsed,
  returnStartTime,
  durationSeconds,
}: HeroReturnProgressInput) => {
  if (autoRewindActive || manualReverseHoldActive) {
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
