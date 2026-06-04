# Live Globe Cityrim Correction

Date: 2026-05-30

## Scope

This pass was limited to one safe globe-only city-light and rim-glow correction for `/lab/live-globe-proof`.

Preserved intentionally:

- live rotating globe
- placement/orientation/camera/framing
- Step 1 cinematic background
- routes disabled
- aircraft disabled
- scanner disabled
- ticket disabled
- ENTER disabled
- production homepage untouched
- waitlist untouched

## Baseline Captures

- `public/cinematic/previews/live-globe-proof-baseline-desktop.png`
- `public/cinematic/previews/live-globe-proof-baseline-mobile.png`

## Brief Material Audit

- Albedo/base:
  - baseline source set: `public/cinematic/textures/jmpseat-earth-albedo-v4.webp`
  - accepted candidate default: `public/cinematic/textures/jmpseat-earth-cityrim-candidate-albedo.webp`
- Emission/city lights:
  - baseline source set: `public/cinematic/textures/jmpseat-earth-emission-v4.webp`
  - accepted candidate default: `public/cinematic/textures/jmpseat-earth-cityrim-candidate-emission.webp`
  - halo support layer: `public/cinematic/textures/jmpseat-earth-emission-halo-v4.webp`
- Clouds:
  - baseline source set: `public/cinematic/textures/jmpseat-earth-clouds-v4.webp`
  - accepted candidate default: `public/cinematic/textures/jmpseat-earth-cityrim-candidate-clouds.webp`
- Atmosphere/rim controls:
  - procedural shader and light-grade controls in `app/lab/live-globe-proof/page.tsx`

## Candidate Outputs

- `public/cinematic/textures/jmpseat-earth-cityrim-candidate-albedo.webp`
- `public/cinematic/textures/jmpseat-earth-cityrim-candidate-emission.webp`
- `public/cinematic/textures/jmpseat-earth-cityrim-candidate-clouds.webp`
- `public/cinematic/textures/jmpseat-earth-cityrim-candidate-metadata.json`
- `public/cinematic/previews/live-globe-proof-cityrim-desktop.png`
- `public/cinematic/previews/live-globe-proof-cityrim-mobile.png`
- `public/cinematic/previews/live-globe-proof-cityrim-comparison.png`

## What Changed

- Reused the working albedo and cloud maps so ocean depth, land balance, and cloud detail stayed stable.
- Re-authored only the city-light emission map into a warmer amber/gold read while preserving the original geography-shaped city network.
- Lifted North America and Europe visibility selectively inside the emission map instead of inventing random dots.
- Strengthened the candidate runtime grade slightly with warmer halo color, a little more city intensity, and a slightly stronger thin top/rim atmosphere read.
- Kept the atmosphere edge-based and restrained so it does not turn into a cyan glass shell.

## Acceptance Decision

Accepted.

Reason:

- The candidate is visibly warmer than baseline.
- North America and Europe read slightly better in both desktop and mobile proof renders.
- The globe did not get darker.
- Oceans stayed deep navy.
- Land did not turn chalky.
- Clouds and surface detail remained intact.
- The rim/top edge is slightly stronger without becoming a thick blue shell.

## Default Route State

The route default was promoted to the accepted candidate:

- default texture set: `cityrim`
- default grade: `cityrim`
