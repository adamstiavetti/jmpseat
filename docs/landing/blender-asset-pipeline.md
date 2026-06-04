# jmpseat Blender Asset Pipeline

This document defines the Blender-first asset/previs pipeline for the jmpseat cinematic waitlist hero.

## Why Spline Is Not Being Used

Spline is not part of this pipeline because the user will not manually build or maintain a Spline scene. The hero needs a repeatable local process that Codex can script, version, regenerate, and inspect without depending on a hosted visual editor or manual handoff.

Spline can be useful for fast visual exploration, but it is the wrong dependency for this slice because:

- The pipeline must be reproducible from repo files.
- Asset generation should be scriptable and reviewable.
- GLB exports should be created locally.
- Camera previews should be generated from the same source scene.
- Future R3F work should load known assets with stable paths.

## Why Blender

Blender is the chosen asset pipeline because it can generate real 3D geometry, export optimized GLBs, render camera previews, and remain fully local. It also maps cleanly to the visual contract in `docs/landing/hero-cinematic-composition-contract.md`: hard-surface scanner, physical ticket plane, aircraft silhouette, optional atmosphere helpers, and thin route guide curves.

This is still not final art. The current scripts create previs/blockout assets that prevent the browser implementation from drifting into flat CSS mockups.

## File Structure

- `tools/cinematic/README.md`
- `tools/cinematic/build_jmpseat_hero_scene.py`
- `tools/cinematic/export_jmpseat_assets.py`
- `public/cinematic/models/`
- `public/cinematic/textures/`
- `public/cinematic/previews/`
- `public/cinematic/manifest.json`

## How To Run

From the repo root:

```bash
blender --background --python tools/cinematic/build_jmpseat_hero_scene.py
```

To export GLBs and refresh the manifest without rendering previews:

```bash
blender --background --python tools/cinematic/export_jmpseat_assets.py
```

Alternative no-render command:

```bash
blender --background --python tools/cinematic/build_jmpseat_hero_scene.py -- --skip-renders
```

## Expected Output Files

- `public/cinematic/models/jmpseat-scanner-printer.glb`
  - Sleek black scanner/printer base with rounded body, front slot, amber light strips, and dark glossy material.
- `public/cinematic/models/jmpseat-ticket-plane.glb`
  - Thin physical ticket/card surface aligned to emerge from the scanner. Text can remain DOM-driven later.
- `public/cinematic/models/jmpseat-aircraft.glb`
  - Small optimized passenger aircraft silhouette for route animation.
- `public/cinematic/models/jmpseat-globe-helpers.glb`
  - Optional atmosphere shell and reference rings. The final globe can still be procedural R3F.
- `public/cinematic/models/jmpseat-route-guides.glb`
  - Thin route guide curves for later R3F curve reconstruction.
- `public/cinematic/previews/jmpseat-hero-mobile-preview.png`
  - Vertical camera validation: globe over scanner over ticket.
- `public/cinematic/previews/jmpseat-hero-desktop-preview.png`
  - Wide cinematic camera validation: globe/scanner/ticket composition.
- `public/cinematic/manifest.json`
  - Integration manifest listing each expected asset, purpose, path, and existence state.

## R3F Connection Plan

The `/lab/cinematic-pipeline` route should remain a safe scaffold until the next implementation slice. Later, the R3F scene can use the manifest paths as stable loader inputs:

- `ScannerSystem` loads `/cinematic/models/jmpseat-scanner-printer.glb`.
- `TicketSystem` loads `/cinematic/models/jmpseat-ticket-plane.glb` or keeps DOM text mapped over the ticket surface.
- `AircraftSystem` loads `/cinematic/models/jmpseat-aircraft.glb` and instances it along route curves.
- `GlobeSystem` remains procedural with shader/material layers, optionally using `/cinematic/models/jmpseat-globe-helpers.glb` for atmosphere or guide references.
- `RouteSystem` can use `/cinematic/models/jmpseat-route-guides.glb` for art-direction guides, then recreate thin elegant curves natively in Three.js.

All loaders should have safe fallbacks so the lab route still renders if assets are missing.

## What Remains Manual And Art-Directed

- Final scanner proportions, bevels, material roughness, and slot detail.
- Aircraft model quality, silhouette readability, and material treatment.
- Exact globe shader, Earth texture layering, city lights, fresnel, and atmosphere.
- Mobile and desktop camera locks against the reference frames.
- Ticket typography, CTA integration, print treatment, and legibility.
- Route density, arc placement, and depth sorting.
- Lighting grade, bloom restraint, depth of field, and final color grade.

## Acceptance Criteria Before Animation Begins

- Mobile preview validates the vertical globe/scanner/ticket stack.
- Desktop preview validates the wide cinematic composition.
- Scanner reads as a physical hard-surface object, not a CSS rectangle.
- Ticket surface aligns with the scanner slot and remains readable once DOM or texture content is added.
- Aircraft reads as a passenger aircraft at small size.
- Route guides remain thin and elegant.
- Globe remains the main actor and is not treated as background decoration.
- The manifest lists every expected asset and accurately reports existence.
- R3F loaders are added only behind safe fallbacks.
- The production homepage and waitlist behavior remain untouched.
