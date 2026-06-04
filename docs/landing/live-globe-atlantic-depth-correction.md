# Live Globe Atlantic Depth Correction

Date: 2026-05-30

## Scope

This pass was limited to one safe Atlantic-depth and continental-edge separation correction for `/lab/live-globe-proof`.

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

- `public/cinematic/previews/live-globe-proof-atlantic-baseline-desktop.png`
- `public/cinematic/previews/live-globe-proof-atlantic-baseline-mobile.png`

## Brief Material Audit

- Albedo/base:
  - prior accepted default: `public/cinematic/textures/jmpseat-earth-polar-candidate-albedo.webp`
  - accepted Atlantic default: `public/cinematic/textures/jmpseat-earth-atlantic-candidate-albedo.webp`
- Emission/city lights:
  - preserved from accepted polar state
  - `public/cinematic/textures/jmpseat-earth-atlantic-candidate-emission.webp`
- Clouds:
  - preserved from accepted polar state
  - `public/cinematic/textures/jmpseat-earth-atlantic-candidate-clouds.webp`
- Atmosphere/rim controls:
  - procedural shader and runtime grade controls in `app/lab/live-globe-proof/page.tsx`

## Candidate Outputs

- `public/cinematic/textures/jmpseat-earth-atlantic-candidate-albedo.webp`
- `public/cinematic/textures/jmpseat-earth-atlantic-candidate-emission.webp`
- `public/cinematic/textures/jmpseat-earth-atlantic-candidate-clouds.webp`
- `public/cinematic/textures/jmpseat-earth-atlantic-candidate-metadata.json`
- `public/cinematic/previews/live-globe-proof-atlantic-desktop.png`
- `public/cinematic/previews/live-globe-proof-atlantic-mobile.png`
- `public/cinematic/previews/live-globe-proof-atlantic-comparison.png`

## What Changed

- Started from the accepted `polar` state so the warmer city lights, cleaner polar balance, deep navy oceans, and current framing/motion were preserved.
- Re-authored only the albedo for the Atlantic candidate by deepening the front Atlantic selectively and adding subtle navy variation inside the ocean region instead of globally darkening the globe.
- Increased coastal edge separation modestly so the east coasts of the Americas and west edge of Africa read a little cleaner against the Atlantic basin.
- Preserved emission and clouds so geography-shaped city lights and cloud detail did not regress.
- Added a localized Atlantic runtime grade so the ocean reads richer without changing the route’s placement, camera, orientation, or rotation.

## Acceptance Decision

Accepted.

Reason:

- The Atlantic basin reads slightly deeper and richer in both desktop and mobile proofs.
- Continental edges separate more cleanly without turning the ocean cyan or flattening the land.
- The full globe does not get darker overall.
- The accepted polar, city-light, and cloud-detail work remains intact.

## Default Route State

The route default was promoted to the accepted Atlantic candidate:

- default texture set: `atlantic`
- default grade: `atlantic`

## Next Single Correction

Author one restrained Europe-read pass to improve the eastern Atlantic to western Europe transition without changing the accepted placement, framing, or motion.
