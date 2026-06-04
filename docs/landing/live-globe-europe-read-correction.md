# Live Globe Europe Read Correction

Date: 2026-05-30

## Scope

This pass was limited to one safe Europe and eastern-Atlantic readability correction for `/lab/live-globe-proof`.

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

- `public/cinematic/previews/live-globe-proof-europe-baseline-desktop.png`
- `public/cinematic/previews/live-globe-proof-europe-baseline-mobile.png`

## Brief Material Audit

- Albedo/base:
  - prior accepted default: `public/cinematic/textures/jmpseat-earth-atlantic-candidate-albedo.webp`
  - accepted Europe default: `public/cinematic/textures/jmpseat-earth-europe-candidate-albedo.webp`
- Emission/city lights:
  - prior accepted default: `public/cinematic/textures/jmpseat-earth-atlantic-candidate-emission.webp`
  - accepted Europe default: `public/cinematic/textures/jmpseat-earth-europe-candidate-emission.webp`
- Clouds:
  - preserved from the accepted Atlantic state
  - `public/cinematic/textures/jmpseat-earth-europe-candidate-clouds.webp`
- Atmosphere/rim controls:
  - procedural shader and runtime grade controls in `app/lab/live-globe-proof/page.tsx`

## Candidate Outputs

- `public/cinematic/textures/jmpseat-earth-europe-candidate-albedo.webp`
- `public/cinematic/textures/jmpseat-earth-europe-candidate-emission.webp`
- `public/cinematic/textures/jmpseat-earth-europe-candidate-clouds.webp`
- `public/cinematic/textures/jmpseat-earth-europe-candidate-metadata.json`
- `public/cinematic/previews/live-globe-proof-europe-desktop.png`
- `public/cinematic/previews/live-globe-proof-europe-mobile.png`
- `public/cinematic/previews/live-globe-proof-europe-comparison.png`

## What Changed

- Started from the accepted `atlantic` state so the deepened Atlantic, accepted polar cleanup, warm North America lights, thin rim glow, and current framing/motion were preserved.
- Re-authored the emission map locally over western and central Europe so existing city-light geography reads warmer and slightly stronger instead of introducing random fake sparkle.
- Re-authored the albedo locally around the eastern Atlantic and Europe-facing coastlines to give the water-to-land transition a cleaner, richer separation.
- Preserved clouds unchanged so cloud detail and motion-ready layering did not regress.
- Added localized Europe runtime grade controls instead of using a broad global city-light lift.

## Acceptance Decision

Accepted.

Reason:

- Europe reads warmer and slightly stronger on the visible right-side slice in both desktop and mobile proofs.
- The eastern Atlantic to Europe/North Africa boundary reads cleaner.
- North America stays intact.
- North Africa and the Sahara do not become harsh or noisy.
- Ocean depth, polar cleanup, cloud detail, and thin rim glow remain intact.

## Default Route State

The route default was promoted to the accepted Europe candidate:

- default texture set: `europe`
- default grade: `europe`

## Next Single Correction

Author one restrained city-halo pass to improve premium glow cohesion around the brightest visible light clusters without creating glitter, cyan glass, or route/aircraft overlays.
