# Globe Art Plate Strategy

Status: active pivot. The prior Blender globe material/composite route is preserved for audit, but it is no longer the visual source of truth for the next hero pass.

## Why This Pivot Exists

The scripted Blender globe proofs plateaued around the low 20s out of 30. They improved technical correctness, but kept oscillating between these failure modes:

- black sphere plus city lights
- bright or chalky daytime Earth
- cyan/glass display orb
- raw texture look without premium aviation art direction

The supplied jmpseat globe reference needs a stronger art-directed plate: deep navy Earth, rich surface texture, warm embedded cities, thin rim atmosphere, and cinematic depth.

## Plate Role

The globe plate is a temporary visual source of truth for composition and quality review. It does not replace the future R3F globe system permanently.

Expected local plate paths:

- `public/cinematic/plates/globe-mobile.png`
- `public/cinematic/plates/globe-desktop.png`
- `public/cinematic/plates/globe-only.png`

Current status: the three files exist, but they are duplicated from the current generated globe-only plate. They are placeholders until separate mobile and desktop art-directed exports are approved.

## Integration Model

The plate integration lab layers live browser elements over the static plate:

- globe plate as the hero visual source
- SVG route arcs above the plate
- live aircraft markers above the route layer
- scanner, ticket, and ENTER CTA scaffold below the globe
- no production waitlist behavior

This keeps the aviation interaction model alive while avoiding more low-value globe shader tweaking.

## Interaction Contract

The plate is only the visual base. The final hero still needs to support the full cinematic journey:

- live blue and amber route arcs
- live aircraft movement
- scanner/printer physical object
- printed ticket surface
- ENTER CTA integrated into the ticket
- ticket scan and absorption
- plane launch
- plane-to-card reconstruction
- scroll chapter transitions

The lab may use DOM/SVG placeholders for the overlays, but the layer boundaries should map cleanly to future Three.js/R3F systems.

## Replacement Path

The plate can later be replaced by:

- a production-approved generated/rendered globe plate
- a Blender-rendered transparent globe pass
- a true R3F globe shader once lookdev quality catches up

The overlay route and aircraft layers should remain separate so they can animate independently.

## Acceptance Gate

The plate route should not be promoted beyond lab status unless:

- the globe resembles the supplied jmpseat globe reference more than the failed Blender proofs
- oceans read deep navy/blue, not black or cyan
- city lights are warm and geography-shaped
- atmosphere is a thin rim, not a front-face coating
- overlays remain editable/animatable
- the plate does not prevent live route, aircraft, scan, launch, reconstruction, or scroll-state animation
- mobile and desktop compositions can use distinct plates or crops
- production homepage and waitlist behavior remain untouched

## Still Needed

- production-approved mobile globe plate
- production-approved desktop globe plate
- transparent or alpha-safe globe-only export if overlay depth needs refinement
- final route and aircraft motion plan
- scanner/ticket/CTA replacement with the existing GLB/DOM hybrid pipeline
- state machine for scan, absorption, launch, reconstruction, and scroll chapters
- eventual replacement plan for R3F or hybrid static/dynamic globe
