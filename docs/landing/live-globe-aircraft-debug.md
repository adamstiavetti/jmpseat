# Live Globe Aircraft Debug

Date: 2026-05-31

## Route

- Route URL: `/lab/live-globe-proof`
- Verification URL: `http://localhost:3001/lab/live-globe-proof?aircraft=on`

## Selected Debug Contract

- Route selected: `Lagos -> Dallas`
- Route source used: `createRouteGroup()` -> `routeEntries[]` -> `createRouteCurve(route)` in `app/lab/live-globe-proof/page.tsx`
- Initial `t` value: `0.01`
- Motion: `t` advances by `speed * delta`, loops with `THREE.MathUtils.euclideanModulo(...)`
- Route-progress scale: aircraft starts very small near `t=0`, reaches maximum size around `t=0.5`, and shrinks back near `t=1`
- Aircraft model path: `public/cinematic/models/deadhead-aircraft-v1.glb`
- Forward-axis correction used: `AIRCRAFT_FORWARD_AXIS_CORRECTION = identity quaternion`

## Contract Result

- Aircraft position uses `routeEntry.curve.getPointAt(t)`
- Aircraft direction uses `routeEntry.curve.getTangentAt(t)`
- Aircraft faces the sampled tangent through the route-driven pose basis
- Aircraft remains parented to the same `routeGroup` / globe rig hierarchy
- One moving aircraft only

## Readability Polish

- subtle white/silver aircraft material
- fake nav-light/emission blobs removed after review
- short restrained fading trail sampled from the same route curve behind the aircraft
- subtle bank derived from curve turn direction
- depth-based scale and opacity retained

## Debug Proof Outputs

- `public/cinematic/previews/live-globe-proof-aircraft-debug-desktop.png`
- `public/cinematic/previews/live-globe-proof-aircraft-debug-mobile.png`

## Validation

- `npm run lint`: passed
- `npm run typecheck`: passed
- `npm run build`: passed
