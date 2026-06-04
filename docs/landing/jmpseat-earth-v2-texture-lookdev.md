# jmpseat Earth V2 Texture Lookdev

Date: 2026-05-30

## Scope

This pass is limited to globe map and material lookdev for `/lab/live-globe-proof`.

Preserved intentionally:

- production homepage
- waitlist behavior
- globe placement
- globe orientation
- camera/framing
- rotation behavior
- disabled routes
- disabled aircraft
- disabled scanner
- disabled ticket
- disabled ENTER CTA

## Audit

### Current live globe route

- Route: `/lab/live-globe-proof`
- Runtime file: `app/lab/live-globe-proof/page.tsx`
- Verification URL used in this pass: `http://127.0.0.1:3001/lab/live-globe-proof`

### Which model/asset is actually loaded

- Runtime globe asset: `THREE.SphereGeometry` created directly in `app/lab/live-globe-proof/page.tsx`
- Current runtime does **not** load a GLB, FBX, OBJ, or embedded Earth mesh
- Generated model on disk for audit only: `public/cinematic/models/cgtrader-earth-live-proof.glb`

Important result: the live proof route is procedural Three.js geometry with external texture inputs, not a GLB-driven runtime.

### External vs embedded vs overridden

- External image textures: yes
- Embedded GLB textures used by the live route: no
- Runtime material override path available: yes
- R3F-specific override: not applicable because this route is not React Three Fiber; it is custom Three.js running inside a client component

Practical conclusion: textures can be swapped cleanly in runtime code without re-exporting a model.

### Exact source paths identified

Private raw CGTrader-local source package:

- `Globe/uploads_files_6328163_Earth.blend`
- `Globe/uploads_files_6328163_cgtrader_optimized_Earth.fbx`
- `Globe/uploads_files_6328163_Earth.obj`
- `Globe/uploads_files_6328163_Earth.mtl`
- `Globe/uploads_files_6328163_textures.zip`

Existing web-safe source derivatives used for this pass:

- `public/cinematic/textures/cgtrader-earth-day-4k.jpg`
- `public/cinematic/textures/cgtrader-earth-night-4k.jpg`
- `public/cinematic/textures/cgtrader-earth-clouds-4k.jpg`
- `public/cinematic/textures/cgtrader-earth-normal-4k.jpg`
- `public/cinematic/textures/cgtrader-earth-specular-4k.jpg`

### Current map controls

- Albedo/base/day surface source: `public/cinematic/textures/cgtrader-earth-day-4k.jpg`
- Night/emission/city-light source: `public/cinematic/textures/cgtrader-earth-night-4k.jpg`
- Cloud source: `public/cinematic/textures/cgtrader-earth-clouds-4k.jpg`
- Normal/bump/displacement source available: `public/cinematic/textures/cgtrader-earth-normal-4k.jpg`
- Roughness/specular/ocean response source: `public/cinematic/textures/cgtrader-earth-specular-4k.jpg`
- Atmosphere/rim: procedural shader plus CSS glow layer; no asset-backed atmosphere texture

### Current runtime wiring after this pass

- Day/albedo: `public/cinematic/textures/jmpseat-earth-albedo-v2.webp`
- Night/emission: `public/cinematic/textures/jmpseat-earth-emission-v2.webp`
- Night halo support: `public/cinematic/textures/jmpseat-earth-emission-halo-v2.webp`
- Clouds: `public/cinematic/textures/jmpseat-earth-clouds-v2.webp`
- Ocean response helper: `public/cinematic/textures/jmpseat-earth-ocean-mask-v2.webp`
- Desert suppression helper: `public/cinematic/textures/jmpseat-earth-desert-suppression-v2.webp`
- Ice suppression helper: `public/cinematic/textures/jmpseat-earth-ice-suppression-v2.webp`

Normal/bump data is still identified and documented, but it is not sampled by the current live shader.

## Derived Outputs

### Required outputs

- `public/cinematic/textures/jmpseat-earth-albedo-v2.webp`
- `public/cinematic/textures/jmpseat-earth-emission-v2.webp`
- `public/cinematic/textures/jmpseat-earth-clouds-v2.webp`
- `public/cinematic/textures/jmpseat-earth-lookdev-metadata.json`

### Supporting outputs used in runtime

- `public/cinematic/textures/jmpseat-earth-emission-halo-v2.webp`
- `public/cinematic/textures/jmpseat-earth-ocean-mask-v2.webp`
- `public/cinematic/textures/jmpseat-earth-desert-suppression-v2.webp`
- `public/cinematic/textures/jmpseat-earth-ice-suppression-v2.webp`

### Flat previews

- `public/cinematic/previews/jmpseat-earth-albedo-v2-preview.png`
- `public/cinematic/previews/jmpseat-earth-emission-v2-preview.png`
- `public/cinematic/previews/jmpseat-earth-clouds-v2-preview.png`
- `public/cinematic/previews/jmpseat-earth-emission-halo-v2-preview.png`

## Exact Visual Changes

### Albedo / beauty map

- Re-derived from `cgtrader-earth-day-4k.jpg`
- Oceans pushed further toward deep navy and blue-black while keeping low-contrast cloud and current detail in the water
- Land saturation reduced so the globe stops reading like a bright daytime satellite Earth
- Sahara and adjacent desert fields darkened and neutralized so Africa stays readable without flaring tan
- Polar and ice regions cooled into restrained blue-gray rather than raw chalk-white blobs

### Emission / city-light map

- Re-derived from `cgtrader-earth-night-4k.jpg`
- Kept geography-shaped light clusters from source data
- Shifted light color toward warm amber/gold
- Boosted North America and Europe selectively
- Preserved coastline and metro clustering instead of inventing random dots

### Cloud map

- Re-derived from `cgtrader-earth-clouds-4k.jpg`
- Increased useful cloud alpha relative to the older v2 set
- Removed low-value haze so the cloud layer adds richness without milking over city lights

### Runtime material follow-up

- Rewired the live route from `v4` maps back to the required `v2` paths
- Reduced overall top bloom and atmosphere thickness
- Kept the atmosphere as a thin procedural electric-blue rim rather than a glass shell
- Tightened city-light core versus halo balance so metro regions feel warmer and more embedded

## Procedural / Supporting Map Disclosure

Source-derived required maps:

- `jmpseat-earth-albedo-v2.webp`
- `jmpseat-earth-emission-v2.webp`
- `jmpseat-earth-clouds-v2.webp`

Supporting derived maps:

- `jmpseat-earth-emission-halo-v2.webp`
  - blurred from the same source night geography
- `jmpseat-earth-ocean-mask-v2.webp`
  - derived from the source specular map plus day-map color separation
- `jmpseat-earth-desert-suppression-v2.webp`
  - derived from source hue, luma, and dryness cues
- `jmpseat-earth-ice-suppression-v2.webp`
  - derived from source brightness, saturation, and latitude cues

No required map was replaced with invented fantasy content.

## Privacy / Asset Handling

- Raw CGTrader files stayed private/local: yes
- Raw `.blend`, `.fbx`, `.obj`, `.mtl`, or original full-resolution source textures copied into `/public`: no
- Ignored private folders already protected in `.gitignore`: yes
- Protected entries confirmed: `Globe/`, `private-assets/`, `assets-private/`, `local-assets/`

## Before / After Notes

### Before

- The live route was using `v4` derived maps and already had the correct structural globe setup
- The globe was directionally cinematic but still leaned a bit too realistic-Earth, with a broader top bloom and weaker v2 asset alignment than the task requested
- Older `v2` outputs on disk lagged behind the current lookdev logic

### After

- The required `v2` outputs were regenerated from the identified CGTrader-safe web sources
- The live route now uses the exact required `v2` texture filenames
- Oceans are darker and richer
- City-light density is warmer and more assertive in North America and Europe
- Desert control is materially stronger than the old v2 outputs
- Cloud signal is stronger but still restrained
- The top-edge atmosphere presentation is thinner than the earlier live route state

## Lab Status

- Raw source stayed private: yes
- Lab-only derivative set: yes
- Production candidate value: yes
- Production-ready claim: no

## Remaining Exact-Match Gaps

- Greenland and other bright polar regions still catch more top light than the supplied jmpseat reference wants
- The dark-side surface still reads as a graded Earth map, not a fully art-authored premium aviation globe
- The route orientation is intentionally preserved, so Europe is not as dominant in the current proof frame as it is in the strongest reference art
- Cloud richness is improved, but still below the reference’s integrated render quality
- Atmosphere is thinner now, but the top cap still reads more like a screen-space highlight than a truly authored halo pass

## Single Next Best Correction

Create a dedicated authored atmosphere and polar-control pass, likely as a Blender or composited halo/top-cap deliverable, so the globe can keep continent detail and warm city lights without the current broad top highlight and Greenland lift.
