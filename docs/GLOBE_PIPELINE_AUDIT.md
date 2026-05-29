# Globe Pipeline Audit

## 1. Purpose

This document defines the globe-only pipeline before implementation. It is a planning and discovery artifact for a future premium interactive aviation globe prototype. It does not implement the globe, add packages, download large assets, change app behavior, deploy, or modify the production homepage or `/app`.

The audit is scoped to the future globe visual/toolchain only. It does not include the printer, ticket, boarding-pass sequence, waitlist redesign, auth, database, persistence, analytics, or product functionality.

## 2. Visual Target

The target is a cinematic aviation network globe that can become the foundation for a future waitlist hero:

- Realistic Earth at night with visible continents, deep oceans, and warm city lights.
- Blue atmospheric halo with convincing rim glow.
- Optional cloud layer if it improves realism without obscuring city lights or hurting mobile performance.
- Blue and amber route arcs that feel intentional, sparse, and premium.
- Small aircraft or travel markers that reinforce the aviation/network story without looking toy-like.
- Slow auto-rotation with desktop drag and mobile touch interaction.
- High-end airline, airport, and global-network feel.
- Strong mobile performance and clear reduced-motion/no-WebGL fallbacks.

## 3. Toolchain Availability Table

| tool | status | version | role | required now / later / optional | notes |
| --- | --- | --- | --- | --- | --- |
| Node.js | installed | `v22.22.1` | Next.js app runtime, package scripts, asset scripts, CLI tools. | required now | Current repo scripts rely on Node. |
| npm | installed | `10.9.4` | Dependency management and `npm run` checks. | required now | Do not add globe packages until implementation phase. |
| npx | installed | `10.9.4` | Temporary CLI execution for audit and future asset tooling. | required now | Used for `gltfjsx` and GLTF Transform checks without global install. |
| Python 3 | installed | `3.9.6` | Future Blender scripting, asset preprocessing, and automation. | later | Useful for Blender Python and image/file automation. |
| Blender | installed | `5.1.2` | Future GLB aircraft marker creation and possible art-directed asset work. | later | Use for aircraft/marker GLBs if procedural markers are not good enough. Do not use Blender to make a weak Earth if R3F texture layering is better. |
| ImageMagick `magick` / `convert` | missing | n/a | Texture resizing/conversion/inspection. | later | Install or use an alternative before G1 texture optimization. |
| ffmpeg | missing | n/a | Optional video/sprite/texture conversion and screenshot/video capture workflows. | optional | Not required for first static globe; useful later for motion QA or compressed visual assets. |
| `npx gltf-transform --version` | missing / wrong package command | npm reports `ENOVERSIONS` | Requested check for GLB optimization CLI. | later | The package name in the requested command has no npm versions. Use the official CLI package command `npx @gltf-transform/cli --version`, which returned `4.3.0`. |
| `npx @gltf-transform/cli --version` | available through npx | `4.3.0` | GLB inspection, optimization, texture compression, pruning, and transforms. | later | Prefer this for future GLB optimization. |
| `npx gltfjsx --version` | available through npx | `6.5.3` | Convert GLB models into reusable React Three Fiber JSX components. | later | Useful after GLB aircraft/marker assets exist. |

## 4. Package Availability Table

| package | installed? | current version if installed | future role | needed for which phase |
| --- | --- | --- | --- | --- |
| `three` | no | n/a | Core WebGL rendering, geometry, materials, shaders, textures. | G2 |
| `@react-three/fiber` | no | n/a | React renderer for the globe scene. | G2 |
| `@react-three/drei` | no | n/a | Texture/model loading helpers, OrbitControls, Preload, performance helpers. | G2-G3 |
| `@react-three/postprocessing` | no | n/a | Declarative bloom/glow effects if performance allows. | G5 |
| `postprocessing` | no | n/a | Underlying postprocessing effects library. | G5 |
| `gsap` | no | n/a | Smooth route/marker progress animation if needed. | G4 |
| `@types/three` | no | n/a | TypeScript support for Three.js APIs. | G2 |

Current installed app dependencies are only `next`, `react`, and `react-dom`, with TypeScript/ESLint type tooling in dev dependencies.

## 5. Recommended Globe Pipeline

1. Acquire safe Earth textures from official or clearly licensed sources.
2. Optimize texture sizes before adding them to `public/`.
3. Build the Earth globe in React Three Fiber using a sphere and layered texture/material approach.
4. Use day/surface, night/city-light, optional cloud, and optional bump/specular layers.
5. Add an atmosphere shader/glow shell with a Fresnel-like rim.
6. Add sparse route arcs and aircraft/travel markers.
7. Add slow auto-rotation, desktop drag, mobile touch, and reduced-motion behavior.
8. Run mobile QA for performance, canvas sizing, texture memory, and touch behavior.
9. Deploy a Vercel preview only after the route passes checks and screenshots.

Recommended implementation shape:

- Start with R3F sphere + textures for Earth rather than a Blender-authored Earth mesh.
- Use custom shader/material layering for city lights and atmosphere.
- Keep route arcs to 5-9 lines, with blue/amber materials and additive glow.
- Use procedural delta/arrow markers first; upgrade to Blender/GLB aircraft only if the procedural markers look weak.
- Avoid heavy postprocessing until the base globe is visually strong. Bloom can help city lights and atmosphere, but it must be optional/reduced on mobile.

## 6. Texture Plan

| texture | preferred source | license / usage note | target file path | target size / resolution | optimization notes |
| --- | --- | --- | --- | --- | --- |
| Earth day / surface | NASA Blue Marble Next Generation / NASA Visible Earth | NASA media is generally usable for educational/informational purposes, but do not imply NASA endorsement and do not use NASA insignia. Confirm exact page terms before download. | `public/textures/earth/earth-day.jpg` | Start around 2048x1024 or 4096x2048; avoid 8K on mobile. | Convert to JPEG/WebP if acceptable, strip metadata, keep under a practical size budget. |
| Earth night / city lights | NASA Black Marble / Earth at Night global imagery | Same NASA usage caveats; city-light texture should come from official NASA/VIIRS/Black Marble source, not random copyrighted texture packs. | `public/textures/earth/earth-night.jpg` | Start around 2048x1024 or 4096x2048. | Use as emissive/city-light mask; tune levels so lights are visible but not blown out. |
| Earth clouds | NASA Visible Earth cloud imagery if a suitable global cloud map is available, or a permissively licensed cloud texture with explicit reuse terms | Confirm source/license before use. If licensing is unclear, skip clouds or create a subtle procedural layer. | `public/textures/earth/earth-clouds.png` | 2048x1024 is likely enough; clouds should be subtle. | Use transparent PNG/WebP if alpha is required; keep opacity low so city lights remain visible. |
| Optional bump / normal / specular | NASA/public-domain topography or ocean mask where available; otherwise defer | Confirm licensing and whether the texture is useful at hero scale. | `public/textures/earth/earth-specular.jpg` or `earth-bump.jpg` | 2048x1024. | Optional. Do not add if it does not improve the cinematic night-Earth look. |
| Texture README | local documentation | Records source URL, license assumption, date accessed, optimization command, and file sizes. | `public/textures/earth/README.md` | n/a | Required for provenance before implementation. |

G1 should acquire textures deliberately and record:

- Source URL.
- Access date.
- License/usage assumption.
- Original file size and resolution.
- Optimized file size and resolution.
- Exact optimization command.

## 7. Model / Asset Plan

Recommended approach:

- Build the Earth globe in R3F using a sphere and textures.
- Do not make the Earth itself a GLB unless a future art-directed asset is clearly better.
- Use Blender/GLB later for aircraft markers only if procedural markers look cheap.
- Use simple procedural triangular/delta markers first to validate scale, motion, and clutter.
- Reserve heavier Blender model work for future printer/ticket phases, not this globe-only phase.

Rationale:

- A textured R3F sphere is easier to keep interactive, responsive, and performance-tunable.
- NASA day/night textures can provide more realism than a low-quality modeled globe.
- Aircraft markers need the most art direction; a small GLB can help if silhouettes need to look premium.
- A full Blender Earth model risks slow iteration and does not solve shader, lighting, route, or mobile interaction requirements by itself.

## 8. Implementation Phases

### G0 - Pipeline Audit

Current phase. Output is this documentation-only audit.

Acceptance:

- No app behavior changes.
- No new dependencies.
- No large asset downloads.
- Toolchain and package availability recorded.
- Recommended pipeline and risks documented.

### G1 - Texture Acquisition And Optimization

Acquire safe Earth day/night/cloud textures, optimize them for web, and document provenance.

Acceptance:

- `public/textures/earth/` exists.
- `earth-day.jpg`, `earth-night.jpg`, optional clouds/specular files, and `README.md` exist.
- File sizes are reasonable.
- Sources and license assumptions are documented.
- No globe implementation yet unless separately approved.

### G2 - Static Globe Core

Install approved R3F packages and build a route-local static globe core with surface, city lights, atmosphere, and fallback.

Acceptance:

- Globe visually shows continents and city lights.
- Atmosphere is visible.
- Route is lab-only.
- `/` and `/app` are not changed.
- Reduced-motion/no-WebGL fallbacks exist.

### G3 - Rotation And Interaction

Add slow auto-rotation, desktop drag, mobile touch, pause/resume behavior, and motion reduction.

Acceptance:

- Drag/touch works without page scroll glitches.
- Auto-rotation feels slow and premium.
- Reduced motion freezes the scene.
- Mobile remains large and usable.

### G4 - Route Arcs And Aircraft Markers

Add 5-9 illustrative route arcs and a small number of aircraft/travel markers.

Acceptance:

- Arcs are curved in 3D and not cluttered.
- Blue/amber palette matches the reference direction.
- Markers are tasteful and scale correctly.
- No route is presented as live/operational data.

### G5 - Polish, Mobile QA, And Preview

Add optional bloom/postprocessing only if it improves the result, then run checks, screenshots, and preview deploy.

Acceptance:

- Desktop/mobile/reduced-motion screenshots captured.
- `npm run lint`, `npm run typecheck`, `npm run build`, and audits run.
- Preview deploy only.
- Honest visual evaluation completed against the reference direction.

## 9. Risks

| risk | why it matters | mitigation |
| --- | --- | --- |
| Texture licensing | Random Earth texture packs can be copyrighted or unclear. | Use official NASA/public-domain or clearly licensed sources and document provenance. |
| Asset file size | Large 8K textures can hurt mobile load and GPU memory. | Start with 2K/4K textures, optimize, cap DPR, and test mobile. |
| Mobile GPU load | Bloom, large textures, high DPR, and many arcs can make phones slow or blank. | Use capped DPR, sparse geometry, optional postprocessing, and static fallback. |
| Generic-looking globe | A basic blue sphere with lines fails the creative bar. | Prioritize real day/night texture quality, city lights, atmosphere shader, and reference-based art direction. |
| Route arc clutter | Too many arcs or random paths look messy and reduce premium feel. | Start with 5-9 intentional routes, vary opacity/thickness, and test screenshots. |
| City lights quality | City lights drive the premium night-Earth look. | Use NASA Black Marble or equivalent high-quality night texture; tune emissive levels. |
| Postprocessing cost | Bloom can help glow but can also create artifacts or hurt performance. | Treat bloom as G5 optional, reduce/disable on mobile, and verify screenshots. |
| npm vulnerabilities | Adding WebGL packages can introduce dependency advisories. | Run `npm audit` after dependency changes and report findings without blind `audit fix --force`. |
| Blender overuse | A weak modeled Earth can be worse than texture-based R3F. | Use Blender for marker assets only when it materially improves quality. |
| Interaction regressions | Canvas gestures can block mobile scroll or feel like default dev controls. | Scope touch action to the globe stage, tune limits/damping, and test mobile. |

## 10. Recommended Next Prompt

Recommended next task:

**G1 - acquire and optimize Earth textures**

Suggested prompt:

> Create branch `assets/globe-earth-textures` from clean main. Acquire official/permissively licensed Earth day, night/city-lights, and optional cloud textures for the future interactive globe. Use NASA Blue Marble / Black Marble where practical. Optimize textures for web, place them under `public/textures/earth/`, create `public/textures/earth/README.md` with source URLs, license assumptions, original/optimized sizes, and commands used. Do not implement the globe, do not add dependencies unless required for optimization, do not modify `/` or `/app`, and run checks.

## Research Sources

- NASA Blue Marble Next Generation / Visible Earth: https://visibleearth.nasa.gov/collection/1484/blue-marble
- NASA Black Marble / Earth at Night: https://earthobservatory.nasa.gov/features/NightLights
- NASA Images and Media Usage Guidelines: https://www.nasa.gov/nasa-brand-center/images-and-media/
- Blender Manual, glTF 2.0 export: https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html
- Khronos glTF overview: https://www.khronos.org/gltf/
- GLTF Transform documentation: https://gltf-transform.dev/
- GLTF Transform CLI: https://gltf-transform.dev/cli
- gltfjsx documentation: https://github.com/pmndrs/gltfjsx
- React Three Fiber Canvas docs: https://r3f.docs.pmnd.rs/api/canvas
- React Three Fiber scaling/performance docs: https://r3f.docs.pmnd.rs/advanced/scaling-performance
- React Three Fiber performance pitfalls: https://r3f.docs.pmnd.rs/advanced/pitfalls
- Drei documentation: https://drei.docs.pmnd.rs/
- Drei `useTexture`: https://drei.docs.pmnd.rs/loaders/texture-use-texture
- Drei `useGLTF`: https://drei.docs.pmnd.rs/loaders/gltf-use-gltf
- React Three Postprocessing docs: https://github.com/pmndrs/react-postprocessing
- postprocessing library docs: https://pmndrs.github.io/postprocessing/public/docs/
- Three.js WebGLRenderer docs: https://threejs.org/docs/#api/en/renderers/WebGLRenderer
- Three.js disposal guide: https://threejs.org/manual/en/how-to-dispose-of-objects.html
- MDN WebGL best practices: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices
- MDN `prefers-reduced-motion`: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
