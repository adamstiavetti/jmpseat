import test from "node:test";
import assert from "node:assert/strict";

import {
  getEarlyCanvasOpacity,
  getEarlyTransitionOnrampFactor,
  getEarlyTransitionOnrampStrength,
} from "../../src/lib/scroll/transitionOnramp.ts";

test("early transition onramp stays off before the minimum gesture count", () => {
  assert.equal(
    getEarlyTransitionOnrampStrength({
      gestureCount: 1,
      progress: 0.08,
      minimumGestureCount: 2,
      progressStart: 0.03,
      progressEnd: 0.11,
      maxStrength: 0.18,
    }),
    0,
  );
});

test("early transition onramp stays off before the progress threshold", () => {
  assert.equal(
    getEarlyTransitionOnrampStrength({
      gestureCount: 3,
      progress: 0.02,
      minimumGestureCount: 2,
      progressStart: 0.03,
      progressEnd: 0.11,
      maxStrength: 0.18,
    }),
    0,
  );
});

test("early transition onramp becomes subtle after the second gesture", () => {
  const strength = getEarlyTransitionOnrampStrength({
    gestureCount: 2,
    progress: 0.07,
    minimumGestureCount: 2,
    progressStart: 0.03,
    progressEnd: 0.11,
    maxStrength: 0.18,
  });

  assert.ok(strength > 0);
  assert.ok(strength < 0.18);
});

test("early transition onramp caps at the configured max strength", () => {
  assert.equal(
    getEarlyTransitionOnrampStrength({
      gestureCount: 4,
      progress: 0.18,
      minimumGestureCount: 2,
      progressStart: 0.03,
      progressEnd: 0.11,
      maxStrength: 0.18,
    }),
    0.18,
  );
});

test("progress fallback onramp can engage without the second-gesture gate once progress is far enough in", () => {
  const strength = getEarlyTransitionOnrampStrength({
    gestureCount: 1,
    progress: 0.1,
    minimumGestureCount: 1,
    progressStart: 0.055,
    progressEnd: 0.14,
    maxStrength: 0.22,
  });

  assert.ok(strength > 0);
  assert.ok(strength < 0.22);
});

test("early transition factor normalizes scaled strength back to a visible ramp factor", () => {
  assert.equal(
    getEarlyTransitionOnrampFactor({
      strength: 0.022,
      maxStrength: 0.22,
    }),
    0.09999999999999999,
  );
});

test("early canvas opacity can reveal the transition canvas before the main takeover begins", () => {
  assert.equal(
    getEarlyCanvasOpacity({
      mainOpacity: 0,
      earlyFactor: 0.18,
      maxOpacity: 0.3,
    }),
    0.054,
  );
});

test("main canvas takeover still wins once it exceeds the early onramp opacity", () => {
  assert.equal(
    getEarlyCanvasOpacity({
      mainOpacity: 0.28,
      earlyFactor: 0.18,
      maxOpacity: 0.3,
    }),
    0.28,
  );
});
