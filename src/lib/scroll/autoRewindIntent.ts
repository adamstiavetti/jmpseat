type ReverseActivationIntentInput = {
  currentIntent: number;
  deltaY: number;
  dtSeconds: number;
  threshold: number;
  decayPerSecond: number;
};

type ReverseActivationIntentResult = {
  nextIntent: number;
  shouldTrigger: boolean;
};

type ReverseScrubStepInput = ReverseActivationIntentInput & {
  virtualScrollY: number;
  transitionDistance: number;
};

type ReverseScrubStepResult = ReverseActivationIntentResult & {
  nextVirtualScrollY: number;
};

export const updateReverseActivationIntent = ({
  currentIntent,
  deltaY,
  dtSeconds,
  threshold,
  decayPerSecond,
}: ReverseActivationIntentInput): ReverseActivationIntentResult => {
  const clampedThreshold = Math.max(threshold, 1);
  const clampedDecay = Math.max(decayPerSecond, 0);
  const decayedIntent = Math.max(0, currentIntent - clampedDecay * Math.max(dtSeconds, 0));

  if (deltaY >= -0.5) {
    return {
      nextIntent: decayedIntent,
      shouldTrigger: false,
    };
  }

  const nextIntent = Math.min(clampedThreshold, decayedIntent + Math.abs(deltaY));
  return {
    nextIntent,
    shouldTrigger: nextIntent >= clampedThreshold,
  };
};

export const applyReverseScrubStep = ({
  virtualScrollY,
  transitionDistance,
  ...intentInput
}: ReverseScrubStepInput): ReverseScrubStepResult => {
  const intentResult = updateReverseActivationIntent(intentInput);
  const clampedDistance = Math.max(transitionDistance, 1);
  const nextVirtualScrollY = Math.min(
    clampedDistance,
    Math.max(0, virtualScrollY + Math.min(intentInput.deltaY, 0)),
  );

  return {
    ...intentResult,
    nextVirtualScrollY,
  };
};
