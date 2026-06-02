# Igloo-Style Globe Transition Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the live globe waitlist transition so it reads like a camera-led cinematic traversal with stronger spatial depth, slower handoff timing, and a center-axis reveal that approaches the Igloo reference quality.

**Architecture:** Keep the existing live globe route and Three.js scene, but shift the choreography away from early orb-collapse and toward a longer hero hold, stronger camera travel, volumetric occlusion, and a reveal that emerges through one continuous world-space axis. The transition canvas remains useful, but it becomes a masking and atmospheric layer that supports the 3D shot instead of replacing it.

**Tech Stack:** Next.js, React, Three.js, GLTFLoader, existing waitlist scroll helpers, CSS custom properties, Playwright screenshot verification, Node-based test suite.

---

### Task 1: Lock the new transition phases and camera-led timing

**Files:**
- Modify: `app/lab/live-globe-proof/page.tsx`
- Test: `test/scroll/liveGlobeTransitionPhasePlan.test.mts`

- [ ] Add pure helpers for transition phase timing, orb-collapse delay, and camera travel blending.
- [ ] Write failing unit tests that prove the globe stays dominant longer and that handoff timing resolves later than the current implementation.
- [ ] Replace the current front-loaded phase math in the scroll style layer and globe transform layer with the new helpers.
- [ ] Verify tests pass and the route no longer reaches its final state too early on mobile or desktop.

### Task 2: Turn the shot into a camera move instead of an object-collapse move

**Files:**
- Modify: `app/lab/live-globe-proof/page.tsx`
- Test: `test/scroll/liveGlobeTransitionPhasePlan.test.mts`

- [ ] Split camera motion from globe motion so each can be tuned independently.
- [ ] Increase real camera travel in `z`, `y`, and slight lateral drift while reducing early globe shrink.
- [ ] Keep the globe large through the majority of the transition and move compact-orb behavior to the late phase only.
- [ ] Verify the camera-led shot reads correctly in captured mobile and desktop frames.

### Task 3: Add foreground occlusion and stronger volumetric masking

**Files:**
- Modify: `app/lab/live-globe-proof/page.tsx`
- Modify: `app/lab/live-globe-proof/page.module.css`

- [ ] Add near, mid, and far atmospheric/occlusion layers in the Three.js scene for depth and masking.
- [ ] Retune haze, frost, bloom, and chromatic behavior so they peak around the atmospheric handoff instead of carrying the whole transition.
- [ ] Ensure the transition canvas and 3D scene cooperate rather than fighting for ownership of the shot.
- [ ] Verify the reveal passes through believable occlusion instead of reading like a simple UI state change.

### Task 4: Preserve axis continuity into the reveal and demote center branding

**Files:**
- Modify: `app/lab/live-globe-proof/page.tsx`
- Modify: `app/lab/live-globe-proof/page.module.css`
- Modify: `src/lib/scroll/heroFlightControl.ts` (if helper extraction is needed)
- Test: `test/scroll/heroFlightControl.test.mts` (if helper behavior changes)

- [ ] Reduce the center-stage role of the `SKYBYRD` wordmark during the critical transition window.
- [ ] Rework the reveal so the next object/aircraft/chapter target emerges on the same axis the eye is already following.
- [ ] Preserve interrupted scroll, rewind, and resume behaviors while using the new reveal grammar.
- [ ] Verify the handoff reads as a continuous shot rather than a composition reset.

### Task 5: Mobile-first composition tuning and quality/performance polish

**Files:**
- Modify: `app/lab/live-globe-proof/page.tsx`
- Modify: `app/lab/live-globe-proof/page.module.css`
- Test: `test/scroll/liveGlobeTransitionPhasePlan.test.mts` (if thresholds/helpers change)

- [ ] Tune the mobile shot first for lower-feeling camera placement, stronger parallax, and a cleaner late reveal.
- [ ] Derive desktop tuning from the approved mobile choreography instead of keeping a separate fast-collapse rhythm.
- [ ] Run lint, typecheck, targeted tests, and frame captures.
- [ ] Save representative validation screenshots and document the final behavior deltas for review.
