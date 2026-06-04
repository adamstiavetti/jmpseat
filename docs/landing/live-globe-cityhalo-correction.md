# Live Globe City Halo Correction

Date: 2026-05-30

## Scope

This pass was limited to one safe city-halo cohesion correction for `/lab/live-globe-proof`.

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

- `public/cinematic/previews/live-globe-proof-cityhalo-baseline-desktop.png`
- `public/cinematic/previews/live-globe-proof-cityhalo-baseline-mobile.png`

## Brief Material Audit

- Albedo/base:
  - prior accepted default: `public/cinematic/textures/jmpseat-earth-europe-candidate-albedo.webp`
  - accepted city-halo default: `public/cinematic/textures/jmpseat-earth-cityhalo-candidate-albedo.webp`
- Emission/city lights:
  - prior accepted default: `public/cinematic/textures/jmpseat-earth-europe-candidate-emission.webp`
  - accepted city-halo default: `public/cinematic/textures/jmpseat-earth-cityhalo-candidate-emission.webp`
- Clouds:
  - preserved from the accepted Europe state
  - `public/cinematic/textures/jmpseat-earth-cityhalo-candidate-clouds.webp`
- Atmosphere/rim controls:
  - procedural shader and runtime grade controls in `app/lab/live-globe-proof/page.tsx`

## Candidate Outputs

- `public/cinematic/textures/jmpseat-earth-cityhalo-candidate-albedo.webp`
- `public/cinematic/textures/jmpseat-earth-cityhalo-candidate-emission.webp`
- `public/cinematic/textures/jmpseat-earth-cityhalo-candidate-clouds.webp`
- `public/cinematic/textures/jmpseat-earth-cityhalo-candidate-metadata.json`
- `public/cinematic/previews/live-globe-proof-cityhalo-desktop.png`
- `public/cinematic/previews/live-globe-proof-cityhalo-mobile.png`
- `public/cinematic/previews/live-globe-proof-cityhalo-comparison.png`

## What Changed

- Started from the accepted `europe` state so the warmer Europe read, accepted Atlantic depth, polar cleanup, deep navy oceans, thin rim glow, and cloud/surface detail were preserved.
- Preserved albedo and clouds unchanged so the correction stays focused on city-light cohesion.
- Re-authored the emission map only, adding restrained warm halo support around existing city-light geography so large clusters read more embedded and luminous instead of isolated points.
- Paired the new emission with a modestly warmer runtime halo grade to improve premium cohesion without pushing broad overexposed bloom.

## Acceptance Decision

Accepted.

Reason:

- North America and Europe feel warmer and more premium in both desktop and mobile proofs.
- Major visible city regions have better soft cohesion without turning noisy or glittery.
- Oceans, land balance, Atlantic depth, polar cleanup, thin rim glow, and cloud/surface detail do not regress.
- The whole globe does not get darker or chalkier.

## Default Route State

The route default was promoted to the accepted city-halo candidate:

- default texture set: `cityhalo`
- default grade: `cityhalo`

## Next Single Correction

Author one restrained Arctic/top-light shaping pass to make the top highlight feel a touch more cinematic and premium without reintroducing a chalky Greenland cap or thick cyan atmosphere.
