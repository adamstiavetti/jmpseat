import test from "node:test";
import assert from "node:assert/strict";

import {
  getHeroReturnLinearProgress,
  shouldStartHeroReturn,
} from "../../src/lib/scroll/heroFlightControl.ts";

test("manual reverse hold starts hero return for active hero flight", () => {
  assert.equal(
    shouldStartHeroReturn({
      autoCompleteActive: false,
      autoRewindActive: false,
      manualReverseHoldActive: true,
      heroMode: "JOURNEY_READY",
    }),
    true,
  );
});

test("manual reverse hold does not start hero return from idle", () => {
  assert.equal(
    shouldStartHeroReturn({
      autoCompleteActive: false,
      autoRewindActive: false,
      manualReverseHoldActive: true,
      heroMode: "ROUTE_IDLE",
    }),
    false,
  );
});

test("manual reverse hold uses scroll-driven hero return progress", () => {
  assert.ok(
    Math.abs(
      getHeroReturnLinearProgress({
        autoRewindActive: false,
        manualReverseHoldActive: true,
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
      autoRewindActive: false,
      manualReverseHoldActive: false,
      currentScrollProgress: 0.18,
      rewindStartScrollProgress: 0.2,
      elapsed: 10,
      returnStartTime: 8.5,
      durationSeconds: 3,
    }),
    0.5,
  );
});
