# jmpseat Earth Texture Regression Recovery

Date: 2026-05-30

## Purpose

This pass recovered `/lab/live-globe-proof` from the darker post-`v2` regression by selecting the best actual texture baseline from matched screenshots instead of assuming the newest requested filename was the correct answer.

The supplied design reference was treated as the visual target, but planes and route arcs in the reference were not added to the live route.

## Scope Guardrails

Untouched intentionally:

- production homepage
- waitlist behavior
- globe placement
- globe orientation
- globe camera/framing
- globe rotation behavior
- Step 1 background
- route arcs
- aircraft
- scanner
- ticket
- ENTER CTA

## Candidate Texture Sets Found

### Complete jmpseat route-ready sets

`v2`

- Albedo: `public/cinematic/textures/jmpseat-earth-albedo-v2.webp`
- Emission: `public/cinematic/textures/jmpseat-earth-emission-v2.webp`
- Emission halo: `public/cinematic/textures/jmpseat-earth-emission-halo-v2.webp`
- Clouds: `public/cinematic/textures/jmpseat-earth-clouds-v2.webp`
- Helper masks:
  - `public/cinematic/textures/jmpseat-earth-ocean-mask-v2.webp`
  - `public/cinematic/textures/jmpseat-earth-desert-suppression-v2.webp`
  - `public/cinematic/textures/jmpseat-earth-ice-suppression-v2.webp`
- Complete for current route: yes
- Prior screenshot evidence:
  - `public/cinematic/previews/live-globe-proof-v2-desktop.png`
  - `public/cinematic/previews/live-globe-proof-v2-mobile.png`

`v3`

- Albedo: `public/cinematic/textures/jmpseat-earth-albedo-v3.webp`
- Emission: `public/cinematic/textures/jmpseat-earth-emission-v3.webp`
- Emission halo: `public/cinematic/textures/jmpseat-earth-emission-halo-v3.webp`
- Clouds: `public/cinematic/textures/jmpseat-earth-clouds-v3.webp`
- Helper masks:
  - `public/cinematic/textures/jmpseat-earth-ocean-mask-v3.webp`
  - `public/cinematic/textures/jmpseat-earth-desert-suppression-v3.webp`
  - `public/cinematic/textures/jmpseat-earth-ice-suppression-v3.webp`
- Complete for current route: yes
- Prior screenshot evidence:
  - `public/cinematic/previews/_tmp-live-globe-proof-v3-desktop.png`
  - `public/cinematic/previews/_tmp-live-globe-proof-v3-mobile.png`

`v4`

- Albedo: `public/cinematic/textures/jmpseat-earth-albedo-v4.webp`
- Emission: `public/cinematic/textures/jmpseat-earth-emission-v4.webp`
- Emission halo: `public/cinematic/textures/jmpseat-earth-emission-halo-v4.webp`
- Clouds: `public/cinematic/textures/jmpseat-earth-clouds-v4.webp`
- Helper masks:
  - `public/cinematic/textures/jmpseat-earth-ocean-mask-v4.webp`
  - `public/cinematic/textures/jmpseat-earth-desert-suppression-v4.webp`
  - `public/cinematic/textures/jmpseat-earth-ice-suppression-v4.webp`
- Complete for current route: yes
- Prior screenshot evidence:
  - `public/cinematic/previews/_tmp-live-globe-proof-v4-desktop.png`
  - `public/cinematic/previews/_tmp-live-globe-proof-v4-mobile.png`

### Original CGTrader/source-derived web inputs

- Day: `public/cinematic/textures/cgtrader-earth-day-4k.jpg`
- Night: `public/cinematic/textures/cgtrader-earth-night-4k.jpg`
- Clouds: `public/cinematic/textures/cgtrader-earth-clouds-4k.jpg`
- Normal: `public/cinematic/textures/cgtrader-earth-normal-4k.jpg`
- Specular: `public/cinematic/textures/cgtrader-earth-specular-4k.jpg`

Complete for current route as a direct set: no.

Why incomplete:

- no matching jmpseat emission halo
- no dedicated ocean mask
- no dedicated desert suppression mask
- no dedicated ice suppression mask

These source-derived web inputs remain valid audit inputs and derivation sources, but they are not a drop-in current-route candidate without borrowing later helper assets.

### Auxiliary exploratory files found

Additional `earth_*` and `globe_*` files exist in `public/cinematic/textures/`, but they are isolated lookdev experiments rather than a consistent route-ready set with all required maps.

## Comparison Method

Added a temporary internal comparison mode to the live route:

- `?candidate=v2|v3|v4`
- `?grade=regressed|recovered`

This kept the following fixed across comparison captures:

- camera
- orientation
- placement
- background
- reduced-motion rotation frame
- screenshot size

Comparison outputs:

- `public/cinematic/previews/live-globe-texture-regression-comparison.png`
- `public/cinematic/previews/live-globe-proof-recovered-desktop.png`
- `public/cinematic/previews/live-globe-proof-recovered-mobile.png`

## What Each Candidate Looked Like

`v2` regressed

- darkest of the route-ready jmpseat sets in the matched capture
- oceans acceptable, but surface detail felt most crushed
- weakest apparent city-light read in this fixed camera/orientation
- closest to the user-reported regression

`v3` regressed

- slightly better than `v2`
- similar ocean darkness
- marginally stronger light and coast readability
- still not the strongest overall baseline

`v4` regressed

- strongest warm city-light presence of the shipped sets
- best North America read
- best overall baseline before any new correction
- still darker and flatter than the design spec

`v4` recovered

- selected baseline plus one controlled surface-light recovery grade
- better cloud and surface readability than regressed `v4`
- stronger city-light visibility without flipping into bright daytime Earth
- still below the premium reference, but clearly stronger than regressed `v2`

## Why Current `v2` Regressed

The regression came from selecting the route baseline by filename requirement rather than by matched screenshot quality.

Practically:

- the route had been moved off the newer `v4` set and back onto `v2`
- the current dark grade then exposed `v2` as the weakest visible candidate at the preserved orientation
- that combination reduced apparent surface separation and made city lights feel underpowered

The comparison pass isolated the texture-set effect under one shared route setup and confirmed that `v2` was not the best baseline.

## Selected Baseline

- Selected baseline: `v4`
- Best of `v2`, `v3`, and `v4`: `v4`
- Reason: it carried the strongest warm city-light geography and best overall premium read in the fixed current framing

## One Controlled Correction Applied

Applied only one lookdev correction after baseline selection:

- a recovered `v4` grade in `app/lab/live-globe-proof/page.tsx`

What that correction did:

- lifted global exposure modestly
- increased surface/twilight gain
- increased visible city-light contribution
- increased cloud presence slightly
- reduced atmosphere/rim strength slightly
- reduced ice gain slightly to avoid pushing top whites too far

What it did not do:

- no layout changes
- no orientation change
- no new routes or aircraft
- no production homepage changes
- no waitlist changes
- no model re-export

## Score Table

| Candidate | Deep Navy Ocean Richness | Warm City-Light Integration | NA/EU Light Emphasis | Surface/Cloud Richness | Atmosphere/Rim Quality | Overall Premium Match | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `v2` regressed | 3.9 | 3.3 | 3.3 | 3.2 | 3.7 | 3.3 | 20.7 / 30 |
| `v3` regressed | 4.0 | 3.5 | 3.4 | 3.3 | 3.7 | 3.4 | 21.3 / 30 |
| `v4` regressed | 4.0 | 3.7 | 3.6 | 3.4 | 3.7 | 3.5 | 21.9 / 30 |
| `v4` recovered | 4.1 | 3.9 | 3.7 | 3.7 | 3.8 | 3.7 | 22.9 / 30 |

Reference conclusion:

- `v4` recovered is visibly better than the current dark `v2` regression
- none of the available candidates match the supplied reference exactly
- the comparison still justifies restoring `v4` as the live baseline

## Restored Route State

- default route now uses `v4` plus the recovered grade
- comparison mode still exists internally through query params for future controlled audits

## Screenshot Paths

- Comparison sheet: `public/cinematic/previews/live-globe-texture-regression-comparison.png`
- Recovered desktop: `public/cinematic/previews/live-globe-proof-recovered-desktop.png`
- Recovered mobile: `public/cinematic/previews/live-globe-proof-recovered-mobile.png`

## Production / Waitlist Safety

- Production homepage untouched: yes
- Waitlist behavior untouched: yes

## Next Single Correction

Create a dedicated halo and polar-control pass so the recovered `v4` baseline can gain stronger premium depth and better Greenland/top-cap control without reintroducing the dark crushed-surface regression.
