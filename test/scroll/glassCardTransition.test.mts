import test from "node:test";
import assert from "node:assert/strict";

import {
  getGlassCardDisplayPathIncludesCurrentPoint,
  getGlassCardEntryLocalPoint,
  getGlassCardRecoveryDropPath,
  getGlassCardFinalTransform,
  getGlassCardDisplayPathPoints,
  getGlassCardJourneyPath,
  getGlassCardJourneyPresentation,
  getGlassCardReconnectControlPoints,
  getGlassCardRecoveryPath,
  getGlassCardRecoverySequence,
  getGlassCardTransitionState,
  shouldDelayGlassCardHeroFlight,
} from "../../src/lib/scroll/glassCardTransition.ts";

test("glass card settles fully camera-facing in its final pose", () => {
  const transform = getGlassCardFinalTransform({ isMobileLayout: true });

  assert.equal(transform.rotation.x, Math.PI / 2);
  assert.equal(transform.rotation.y, 0);
  assert.equal(transform.rotation.z, 0);
  assert.equal(transform.y, 0.08);
  assert.equal(transform.scale.x, 1.22);
  assert.equal(transform.scale.z, 1.42);
});

test("glass card stays hidden before the late second-phase handoff", () => {
  const state = getGlassCardTransitionState({
    currentScrollProgress: 0.7,
    isMobileLayout: true,
  });

  assert.equal(state.presence, 0);
  assert.equal(state.visible, false);
});

test("glass card rises during the latter transition window and settles front-facing", () => {
  const state = getGlassCardTransitionState({
    currentScrollProgress: 0.88,
    isMobileLayout: true,
  });

  assert.ok(state.presence > 0);
  assert.ok(state.rotation.y > 0);
  assert.ok(state.rotation.z < 0);
});

test("glass card locks into the approved final pose by the end of the settle window", () => {
  const state = getGlassCardTransitionState({
    currentScrollProgress: 1,
    isMobileLayout: true,
  });

  assert.equal(state.rotation.x, Math.PI / 2);
  assert.equal(state.rotation.y, 0);
  assert.equal(state.rotation.z, 0);
});

test("glass card entry point uses the actual split between the left and right panes", () => {
  const point = getGlassCardEntryLocalPoint({
    normalizedBounds: {
      minX: -0.5,
      maxX: 0.5,
      minY: -0.03,
      maxY: 0.03,
      minZ: -0.22,
      maxZ: 0.22,
    },
    leftPaneBounds: {
      minX: -0.5,
      maxX: -0.18,
      minY: -0.03,
      maxY: 0.03,
      minZ: -0.22,
      maxZ: 0.22,
    },
    rightPaneBounds: {
      minX: -0.12,
      maxX: 0.5,
      minY: -0.03,
      maxY: 0.03,
      minZ: -0.22,
      maxZ: 0.22,
    },
  });

  assert.equal(point.x, -0.15);
  assert.equal(point.z, 0);
});

test("hero plane presentation stays visible while it approaches the glass separation", () => {
  const presentation = getGlassCardJourneyPresentation({
    entryBlend: 1,
    preEntryOffset: 0.08,
  });

  assert.equal(presentation.opacity, 1);
  assert.equal(presentation.offset, 0);
});

test("glass card journey path stays vertically aligned above the cut", () => {
  const path = getGlassCardJourneyPath({
    entryPoint: { x: -0.15, y: 0.1, z: 0.02 },
    entryBlend: 0.5,
    preEntryOffset: 0.2,
  });

  assert.equal(path.approachPoint.x, -0.15);
  assert.equal(path.approachPoint.z, 0.02);
  assert.equal(path.currentPoint.x, -0.15);
  assert.equal(path.currentPoint.z, 0.02);
  assert.equal(path.approachPoint.y, 0.30000000000000004);
  assert.equal(path.currentPoint.y, 0.2);
});

test("glass card recovery path always returns to a predetermined top entry point above the cut", () => {
  const recovery = getGlassCardRecoveryPath({
    entryPoint: { x: -0.15, y: 0.1, z: 0.02 },
    preEntryOffset: 0.2,
    recoveryLift: 0.24,
  });

  assert.deepEqual(recovery.approachPoint, {
    x: -0.15,
    y: 0.30000000000000004,
    z: 0.02,
  });
  assert.deepEqual(recovery.reentryTopPoint, {
    x: -0.15,
    y: 0.54,
    z: 0.02,
  });
});

test("glass recovery drop path starts from the top anchor and descends into the cut", () => {
  const dropPath = getGlassCardRecoveryDropPath({
    entryPoint: { x: -0.15, y: 0.1, z: 0.02 },
    preEntryOffset: 0.2,
    recoveryLift: 0.24,
    dropBlend: 0,
  });

  assert.deepEqual(dropPath.currentPoint, {
    x: -0.15,
    y: 0.54,
    z: 0.02,
  });

  const completedDrop = getGlassCardRecoveryDropPath({
    entryPoint: { x: -0.15, y: 0.1, z: 0.02 },
    preEntryOffset: 0.2,
    recoveryLift: 0.24,
    dropBlend: 1,
  });

  assert.equal(completedDrop.currentPoint.x, -0.15);
  assert.ok(Math.abs(completedDrop.currentPoint.y - 0.1) < 1e-9);
  assert.equal(completedDrop.currentPoint.z, 0.02);
});

test("glass display path omits the globe origin prefix while in glass recovery mode", () => {
  const points = getGlassCardDisplayPathPoints({
    includeOrigin: false,
    originPoint: { x: 0, y: 1, z: 0 },
    sampledCurvePoints: [
      { x: -0.15, y: 0.54, z: 0.02 },
      { x: -0.15, y: 0.3, z: 0.02 },
    ],
    approachPoint: { x: -0.15, y: 0.3, z: 0.02 },
    currentPoint: { x: -0.15, y: 0.2, z: 0.02 },
  });

  assert.deepEqual(points[0], { x: -0.15, y: 0.54, z: 0.02 });
});

test("glass display path does not duplicate the vertical anchor when the current point is nearly identical", () => {
  assert.equal(
    getGlassCardDisplayPathIncludesCurrentPoint({
      approachPoint: { x: -0.15, y: 0.54, z: 0.02 },
      currentPoint: { x: -0.1500000001, y: 0.5400000001, z: 0.0200000001 },
    }),
    false,
  );
});

test("glass recovery sequence reconnects before it starts the vertical drop", () => {
  const early = getGlassCardRecoverySequence({
    elapsedSeconds: 0.2,
    reconnectDuration: 0.4,
    dropDuration: 0.6,
  });

  assert.equal(early.reconnectBlend, 0.5);
  assert.equal(early.dropBlend, 0);

  const late = getGlassCardRecoverySequence({
    elapsedSeconds: 0.7,
    reconnectDuration: 0.4,
    dropDuration: 0.6,
  });

  assert.equal(late.reconnectBlend, 1);
  assert.ok(Math.abs(late.dropBlend - 0.5) < 1e-9);
});

test("glass entry sequence can start the drop from the top anchor without a reconnect delay", () => {
  const start = getGlassCardRecoverySequence({
    elapsedSeconds: 0,
    reconnectDuration: 0,
    dropDuration: 0.8,
  });

  assert.equal(start.reconnectBlend, 1);
  assert.equal(start.dropBlend, 0);

  const middle = getGlassCardRecoverySequence({
    elapsedSeconds: 0.4,
    reconnectDuration: 0,
    dropDuration: 0.8,
  });

  assert.equal(middle.reconnectBlend, 1);
  assert.equal(middle.dropBlend, 0.5);
});

test("glass hero flight waits for the card model once the glass phase is active", () => {
  assert.equal(
    shouldDelayGlassCardHeroFlight({
      currentScrollProgress: 0.78,
      glassCardLoaded: false,
    }),
    true,
  );

  assert.equal(
    shouldDelayGlassCardHeroFlight({
      currentScrollProgress: 0.78,
      glassCardLoaded: true,
    }),
    false,
  );

  assert.equal(
    shouldDelayGlassCardHeroFlight({
      currentScrollProgress: 0.2,
      glassCardLoaded: false,
    }),
    true,
  );
});

test("glass reconnect route ends tangent-aligned to the vertical drop", () => {
  const controls = getGlassCardReconnectControlPoints({
    originPoint: { x: 0.2, y: 1.2, z: -0.4 },
    topPoint: { x: -0.15, y: 0.54, z: 0.02 },
    sweepLift: 0.24,
    verticalLeadIn: 0.32,
  });

  assert.equal(controls.controlB.x, -0.15);
  assert.equal(controls.controlB.z, 0.02);
  assert.ok(Math.abs(controls.controlB.y - 0.86) < 1e-9);
  assert.notEqual(controls.controlA.x, controls.controlB.x);
});
