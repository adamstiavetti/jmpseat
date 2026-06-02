import test from "node:test";
import assert from "node:assert/strict";

import {
  getGlassCardFinalTransform,
  getGlassCardTransitionState,
} from "../../src/lib/scroll/glassCardTransition.ts";

test("glass card stays effectively hidden through most of the atmospheric transition", () => {
  const earlyState = getGlassCardTransitionState({
    currentScrollProgress: 0.82,
    isMobileLayout: true,
  });

  assert.ok(earlyState.presence < 0.05);
  assert.equal(earlyState.visible, false);
});

test("glass card only becomes materially present near the late reveal window", () => {
  const midState = getGlassCardTransitionState({
    currentScrollProgress: 0.9,
    isMobileLayout: false,
  });
  const lateState = getGlassCardTransitionState({
    currentScrollProgress: 0.98,
    isMobileLayout: false,
  });

  assert.ok(midState.settleProgress < 0.12);
  assert.ok(midState.y < -0.5);
  assert.ok(lateState.presence > 0.9);
  assert.ok(lateState.settleProgress > 0.9);
});

test("glass card reveal keeps its final cut offset to the left of center", () => {
  const desktopFinal = getGlassCardFinalTransform({ isMobileLayout: false });
  const mobileFinal = getGlassCardFinalTransform({ isMobileLayout: true });

  assert.ok(desktopFinal.x < -0.04);
  assert.ok(mobileFinal.x < -0.03);
});
