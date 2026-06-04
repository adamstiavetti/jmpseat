# jmpseat Cinematic Blender Pipeline

This folder contains the local Blender-first asset/previs pipeline for the jmpseat cinematic waitlist hero.

The scripts create first-pass physical assets and camera validation previews:

- Scanner/printer GLB
- Ticket plane GLB
- Small passenger aircraft GLB
- Optional globe helper GLB
- Thin route guide GLB
- Mobile and desktop preview renders
- `public/cinematic/manifest.json`

## Run

From the repo root:

```bash
blender --background --python tools/cinematic/build_jmpseat_hero_scene.py
```

To export GLBs and refresh the manifest without rendering previews:

```bash
blender --background --python tools/cinematic/export_jmpseat_assets.py
```

Or:

```bash
blender --background --python tools/cinematic/build_jmpseat_hero_scene.py -- --skip-renders
```

## Outputs

- `public/cinematic/models/jmpseat-scanner-printer.glb`
- `public/cinematic/models/jmpseat-ticket-plane.glb`
- `public/cinematic/models/jmpseat-aircraft.glb`
- `public/cinematic/models/jmpseat-globe-helpers.glb`
- `public/cinematic/models/jmpseat-route-guides.glb`
- `public/cinematic/previews/jmpseat-hero-mobile-preview.png`
- `public/cinematic/previews/jmpseat-hero-desktop-preview.png`
- `public/cinematic/manifest.json`

These assets are blockout/previs quality. They exist to establish physical scale, camera framing, and R3F loader contracts before final art direction.
