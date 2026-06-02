import test from "node:test";
import assert from "node:assert/strict";

import {
  applyReverseScrubStep,
  updateReverseActivationIntent,
} from "../../src/lib/scroll/autoRewindIntent.ts";

test("single strong reverse gesture does not trigger auto rewind on mobile", () => {
  const result = updateReverseActivationIntent({
    currentIntent: 0,
    deltaY: -72,
    dtSeconds: 1 / 60,
    threshold: 140,
    decayPerSecond: 220,
  });

  assert.equal(result.shouldTrigger, false);
  assert.ok(result.nextIntent > 0);
  assert.ok(result.nextIntent < 140);
});

test("stacked reverse gestures trigger rewind once threshold is reached", () => {
  const first = updateReverseActivationIntent({
    currentIntent: 0,
    deltaY: -72,
    dtSeconds: 1 / 60,
    threshold: 140,
    decayPerSecond: 220,
  });
  const second = updateReverseActivationIntent({
    currentIntent: first.nextIntent,
    deltaY: -72,
    dtSeconds: 1 / 60,
    threshold: 140,
    decayPerSecond: 220,
  });

  assert.equal(first.shouldTrigger, false);
  assert.equal(second.shouldTrigger, true);
  assert.equal(second.nextIntent, 140);
});

test("reverse intent decays when the user pauses or scrolls forward", () => {
  const charged = updateReverseActivationIntent({
    currentIntent: 100,
    deltaY: 0,
    dtSeconds: 0.25,
    threshold: 140,
    decayPerSecond: 220,
  });

  assert.equal(charged.shouldTrigger, false);
  assert.ok(charged.nextIntent < 100);
  assert.ok(charged.nextIntent > 0);
});

test("reverse scrub step moves virtual scroll backward with the same damped delta before rewind triggers", () => {
  const result = applyReverseScrubStep({
    currentIntent: 0,
    deltaY: -72,
    dtSeconds: 1 / 60,
    threshold: 140,
    decayPerSecond: 220,
    virtualScrollY: 400,
    transitionDistance: 1000,
  });

  assert.equal(result.shouldTrigger, false);
  assert.equal(result.nextVirtualScrollY, 328);
  assert.ok(result.nextIntent > 0);
});

test("reverse scrub step still updates virtual scroll on the gesture that finally triggers rewind", () => {
  const result = applyReverseScrubStep({
    currentIntent: 80,
    deltaY: -72,
    dtSeconds: 1 / 60,
    threshold: 140,
    decayPerSecond: 220,
    virtualScrollY: 400,
    transitionDistance: 1000,
  });

  assert.equal(result.shouldTrigger, true);
  assert.equal(result.nextVirtualScrollY, 328);
  assert.equal(result.nextIntent, 140);
});
