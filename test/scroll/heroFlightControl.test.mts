import test from "node:test";
import assert from "node:assert/strict";

import {
  getHeroLaunchSpawnFollow,
  getHeroReturnLinearProgress,
  shouldResumeHeroLaunchFromReturn,
  shouldResumeInterruptedAutoComplete,
  shouldKeepInterruptedTransitionTicking,
  shouldScrubHeroReturnWithScroll,
  shouldStartHeroReturn,
} from "../../src/lib/scroll/heroFlightControl.ts";

test("manual reverse hold starts hero return for active hero flight", () => {
  assert.equal(
    shouldStartHeroReturn({
      autoRewindActive: false,
      manualReverseHoldActive: true,
      heroMode: "JOURNEY_READY",
      userInputActive: true,
      manualScrollDirection: -1,
    }),
    true,
  );
});

test("manual reverse hold does not start hero return from idle", () => {
  assert.equal(
    shouldStartHeroReturn({
      autoRewindActive: false,
      manualReverseHoldActive: true,
      heroMode: "ROUTE_IDLE",
      userInputActive: true,
      manualScrollDirection: -1,
    }),
    false,
  );
});

test("manual reverse hold does not start hero return without active reverse input", () => {
  assert.equal(
    shouldStartHeroReturn({
      autoRewindActive: false,
      manualReverseHoldActive: true,
      heroMode: "JOURNEY_READY",
      userInputActive: false,
      manualScrollDirection: 0,
    }),
    false,
  );
});

test("manual reverse hold uses scroll-driven hero return progress", () => {
  assert.ok(
    Math.abs(
      getHeroReturnLinearProgress({
        useScrollScrub: true,
        currentScrollProgress: 0.18,
        rewindStartScrollProgress: 0.2,
        elapsed: 10,
        returnStartTime: 8,
        durationSeconds: 1.5,
      }) - 0.1,
    ) < 1e-9,
  );
});

test("non-rewind hero return still uses elapsed time", () => {
  assert.equal(
    getHeroReturnLinearProgress({
      useScrollScrub: false,
      currentScrollProgress: 0.18,
      rewindStartScrollProgress: 0.2,
      elapsed: 10,
      returnStartTime: 8.5,
      durationSeconds: 3,
    }),
    0.5,
  );
});

test("hero return stays scroll-scrubbed while the user is still within the interrupted range", () => {
  assert.equal(
    shouldScrubHeroReturnWithScroll({
      autoRewindActive: false,
      manualReverseHoldActive: true,
      userInputActive: true,
      manualScrollDirection: -1,
    }),
    true,
  );
});

test("hero launch resumes from return immediately when forward control resumes", () => {
  assert.equal(
    shouldResumeHeroLaunchFromReturn({
      autoCompleteActive: false,
      manualReverseHoldActive: true,
      heroMode: "HERO_RETURN",
      userInputActive: true,
      manualScrollDirection: 1,
    }),
    true,
  );
});

test("idle interrupted transition resumes auto-complete after a short pause", () => {
  assert.equal(
    shouldResumeInterruptedAutoComplete({
      manualReverseHoldActive: true,
      currentScrollProgress: 0.23,
      nowMs: 1200,
      lastManualScrollInputMs: 900,
      idleResumeMs: 220,
      minResumeProgress: 0.2,
    }),
    true,
  );
});

test("idle interrupted transition does not resume too early", () => {
  assert.equal(
    shouldResumeInterruptedAutoComplete({
      manualReverseHoldActive: true,
      currentScrollProgress: 0.23,
      nowMs: 1060,
      lastManualScrollInputMs: 900,
      idleResumeMs: 220,
      minResumeProgress: 0.2,
    }),
    false,
  );
});

test("resumed hero launch starts fully from current pose instead of re-spawning from the hidden origin", () => {
  assert.equal(
    getHeroLaunchSpawnFollow({
      launchProgress: 0,
      resumedFromCurrentPose: true,
    }),
    1,
  );
});

test("interrupted reverse hold keeps the control loop alive even when progress is visually settled", () => {
  assert.equal(
    shouldKeepInterruptedTransitionTicking({
      manualReverseHoldActive: true,
      targetProgress: 0.22,
      smoothedProgress: 0.22,
      autoCompleting: false,
      autoRewindTriggered: false,
    }),
    true,
  );
});
