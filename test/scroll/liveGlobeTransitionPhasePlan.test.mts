import test from "node:test";
import assert from "node:assert/strict";

import { getLiveGlobeTransitionShotState } from "../../src/lib/scroll/liveGlobeTransitionPlan.ts";

test("mobile hero hold keeps the globe dominant through the early transition", () => {
  const shot = getLiveGlobeTransitionShotState({
    progress: 0.25,
    layout: "mobile",
  });

  assert.equal(shot.collapseProgress, 0);
  assert.equal(shot.revealProgress, 0);
  assert.ok(shot.globeScaleMix < 0.12);
  assert.ok(shot.cameraTravelProgress > 0);
  assert.ok(shot.cameraTravelProgress < 0.3);
});

test("desktop reveal stays deferred until the late atmospheric handoff window", () => {
  const shot = getLiveGlobeTransitionShotState({
    progress: 0.72,
    layout: "desktop",
  });

  assert.equal(shot.revealProgress, 0);
  assert.ok(shot.occlusionProgress > 0);
  assert.ok(shot.occlusionProgress < 0.5);
  assert.ok(shot.collapseProgress < 0.4);
});

test("compact orb behavior does not fully resolve until the late collapse window", () => {
  const midShot = getLiveGlobeTransitionShotState({
    progress: 0.6,
    layout: "mobile",
  });
  const lateShot = getLiveGlobeTransitionShotState({
    progress: 0.92,
    layout: "mobile",
  });

  assert.ok(midShot.collapseProgress < 0.15);
  assert.ok(lateShot.collapseProgress > 0.95);
  assert.ok(midShot.globeScaleMix < 0.2);
  assert.ok(lateShot.globeScaleMix > 0.9);
});

test("camera travel becomes the main transition driver before full reveal", () => {
  const earlyShot = getLiveGlobeTransitionShotState({
    progress: 0.18,
    layout: "desktop",
  });
  const traversalShot = getLiveGlobeTransitionShotState({
    progress: 0.58,
    layout: "desktop",
  });

  assert.ok(earlyShot.cameraTravelProgress < 0.15);
  assert.ok(traversalShot.cameraTravelProgress > 0.45);
  assert.ok(traversalShot.cameraDriftX < 0);
  assert.ok(traversalShot.cameraLiftMix > earlyShot.cameraLiftMix);
});
