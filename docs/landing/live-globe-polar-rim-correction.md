# Live Globe Polar Rim Correction

Date: 2026-05-30

## Scope

This pass was limited to one safe polar/ice and top-rim correction for `/lab/live-globe-proof`.

Preserved intentionally:

- production homepage
- waitlist behavior
- globe placement
- camera/framing
- orientation
- rotation
- routes
- aircraft
- scanner
- ticket
- ENTER CTA
- chapter cards

## Baseline Captures

- `public/cinematic/previews/live-globe-proof-polar-baseline-desktop.png`
- `public/cinematic/previews/live-globe-proof-polar-baseline-mobile.png`

## Brief Material Audit

- Albedo/base:
  - prior accepted default: `public/cinematic/textures/jmpseat-earth-cityrim-candidate-albedo.webp`
  - accepted polar default: `public/cinematic/textures/jmpseat-earth-polar-candidate-albedo.webp`
- Emission/city lights:
  - preserved from accepted cityrim state
  - `public/cinematic/textures/jmpseat-earth-polar-candidate-emission.webp`
- Clouds:
  - preserved from accepted cityrim state
  - `public/cinematic/textures/jmpseat-earth-polar-candidate-clouds.webp`
- Atmosphere/rim controls:
  - procedural shader and runtime grade controls in `app/lab/live-globe-proof/page.tsx`

## Candidate Outputs

- `public/cinematic/textures/jmpseat-earth-polar-candidate-albedo.webp`
- `public/cinematic/textures/jmpseat-earth-polar-candidate-emission.webp`
- `public/cinematic/textures/jmpseat-earth-polar-candidate-clouds.webp`
- `public/cinematic/textures/jmpseat-earth-polar-candidate-metadata.json`
- `public/cinematic/previews/live-globe-proof-polar-desktop.png`
- `public/cinematic/previews/live-globe-proof-polar-mobile.png`
- `public/cinematic/previews/live-globe-proof-polar-comparison.png`

## What Changed

- Started from the accepted `cityrim` state so warm city lights, North America/Europe visibility, deep navy oceans, and cloud/surface detail were preserved.
- Re-authored only the albedo for the polar candidate by lowering harsh Greenland/Arctic brightness and cooling it slightly toward a less chalky polar read.
- Preserved emission and clouds so the city-light and surface-detail gains do not regress.
- Strengthened the top-edge atmospheric read through a small grade update: slightly stronger top/rim support with lower direct ice gain.

## Acceptance Decision

Accepted.

Reason:

- The top ice cap is less harsh and less chalky than baseline.
- The top brightness reads more like controlled atmospheric glow instead of a hard white plate.
- The atmosphere stays thin and edge-based.
- Warm city lights remain intact.
- Oceans remain deep navy.
- Surface/cloud detail remains intact.
- The full globe does not get darker.

## Default Route State

The route default was promoted to the accepted polar candidate:

- default texture set: `polar`
- default grade: `polar`

## Next Single Correction

Author one dedicated continental-edge and Atlantic-depth pass to make Europe/Atlantic shape separation feel richer without changing the accepted placement, framing, or motion.
