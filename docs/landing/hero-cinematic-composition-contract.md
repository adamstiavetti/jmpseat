# jmpseat Waitlist Hero Cinematic Composition Contract

This contract defines the visual target for the jmpseat waitlist hero based on the supplied mobile and desktop reference frames:

- `/Users/ClawdBot/Downloads/jmpseatwaitlistglobemobile.png`
- `/Users/ClawdBot/Downloads/jmpseatwaitlistglobedesktop.png`

The goal is to prevent another generic WebGL or CSS mockup result. Future work should treat the hero as an art-directed cinematic aviation scene, not a decorative website background.

## 1. Visual Target

- The hero must read as a premium cinematic aviation render.
- The environment is dark navy to black, with controlled blue rim light and small warm airport/city-light accents.
- The globe is the main actor. It is a large, dimensional, lit object with visible curvature, surface relief cues, city lights, atmosphere, and believable shadowing.
- The globe must not behave as background decoration. It anchors the scene and drives the composition.
- The scanner/printer and ticket are physical foreground objects in the same world as the globe.
- The scanner/printer should feel like a machined object: rounded hard-surface body, recessed slot, warm internal light, contact shadows, and real scale relative to the ticket.
- The ticket/card emerges from the scanner and acts as the foreground plane for the CTA.
- The ENTER CTA is integrated into the ticket assembly, not floating elsewhere on the page.
- The ticket must remain readable and physically plausible. It should feel printed or illuminated on the ticket surface.
- Mobile is the primary composition: tall vertical frame, globe centered and dominant in the upper half, scanner below the globe, ticket extending toward the viewer, ENTER at the lower ticket edge.
- Desktop is a cinematic wide composition: globe remains dominant and centered above the scanner, ticket spreads horizontally in the foreground, ENTER remains integrated near the front center.
- Flight arcs should be thin, elegant, and sparse enough to reinforce aviation motion without creating visual noise.
- Aircraft must read as small 3D planes catching light, not as flat icons.

## 2. Negative Reference: What Failed

The previous `/lab/globe-ticket-composition` attempt is the negative reference. Do not continue polishing it with CSS hacks, extra glow, or more decorative effects.

It failed because:

- The globe looked like a flat textured sticker instead of a lit sphere with depth.
- The atmosphere was too thick and cyan, making the globe feel synthetic and cheap.
- The planes looked like icons rather than physical aircraft.
- The routes were too thick and noisy, competing with the globe instead of supporting it.
- The scanner looked like CSS rectangles instead of a hard-surface object.
- The ticket was clipped and not physically integrated with the scanner or foreground plane.
- The composition felt like a web mockup, not a rendered scene.

These failures should be used as explicit QA checks before any future implementation is accepted.

## 3. Asset List

Required assets and systems:

- Globe shader/material system
  - Lit Earth surface with day/night balance, roughness, normal or bump detail, and cinematic rim response.
- Dark Earth texture or procedural Earth layer
  - Must support a premium night-side look and avoid bright stock-map coloration.
- City lights layer
  - Warm, fine-grained, geographically plausible lights that sit on the surface and do not bloom into noise.
- Atmosphere/fresnel shell
  - Thin shell with restrained blue rim light, strongest at the horizon, not a thick cyan outline.
- Thin flight arcs
  - Curved paths that wrap around the globe with proper depth sorting and minimal glow.
- Small 3D aircraft model
  - Low-poly or optimized GLB with recognizable wings, fuselage, tail, material highlights, and scale controls.
- Scanner/printer base GLB
  - Hard-surface asset with slot geometry, bevels, warm internal light areas, and contact-shadow-friendly proportions.
- Ticket/card geometry or DOM overlay
  - The ticket can be true geometry, a DOM overlay transformed into the scene, or a hybrid, but it must align physically with the scanner and CTA.
- Scan beam effect
  - Warm or cool linear light pass tied to scanner/ticket interaction, not a generic overlay.
- Particle system for later transitions
  - Reserved for ticket absorption, aircraft launch, and card reconstruction phases.

No future implementation should rely on CSS alone for objects that must feel physical.

## 4. Blender/Previs Stage

A Blender or Blender-like previs stage is required before final web animation.

The previs must:

- Block the globe, scanner, ticket, and aircraft in a single scene.
- Lock the mobile camera first.
- Lock the desktop camera second.
- Validate lighting, scale, silhouette, and foreground/background relationships.
- Confirm that the globe feels volumetric and cinematic in the first frame.
- Confirm that the scanner reads as a physical foreground object.
- Confirm that the ticket is readable, not clipped, and aligned with the scanner slot.
- Export the scanner and aircraft as GLB assets.
- Optionally export route guide curves for browser reconstruction.
- Define camera focal length, approximate object scale, and object origin conventions for the web scene.
- Avoid relying on CSS alone for physical 3D objects.

The web build should not start final animation polish until the locked previs frames satisfy this contract on mobile and desktop.

## 5. Three.js/R3F Stage

The browser scene should be built around a persistent Canvas and a stable component architecture.

Required structure:

- `CinematicHeroLab`
  - Lab shell for validating the scene contract without touching production.
- `SceneRoot`
  - Owns the persistent Canvas, scene lighting, environment, render loop, and high-level layout contract.
- `GlobeSystem`
  - Owns globe mesh, Earth material, city lights, atmosphere/fresnel shell, rotation hooks, and lighting response.
- `RouteSystem`
  - Owns route guide curves, thin line rendering, depth sorting, and route phase animation.
- `AircraftSystem`
  - Owns aircraft GLB instances, route attachment, scale, orientation, and launch motion.
- `ScannerSystem`
  - Owns scanner/printer GLB, slot light, contact shadows, and scan beam origin.
- `TicketSystem`
  - Owns ticket/card geometry or DOM overlay alignment, printed ticket details, CTA placement, and ticket transition states.
- `CameraRig`
  - Owns mobile and desktop camera positions, focal length, scroll offsets, and cinematic framing.
- `PostProcessing`
  - Owns restrained bloom, color grading, vignette, depth of field, and any final cinematic pass.
- `JourneyStateMachine`
  - Owns sequencing and guards between hero states so animation does not become scattered across unrelated components.

The first browser implementation may use placeholders, but the component boundaries should match the intended final systems.

## 6. Animation Phases

Later phases only. Do not implement these in the current foundation slice.

- Intro fade
- Globe reveal
- Ticket print
- CTA scan
- Ticket absorption
- Plane launch
- Plane-to-card reconstruction
- Mini-globe top-center state
- Scroll chapter transitions

Each phase should be driven by `JourneyStateMachine` rather than ad hoc component-local timers.

## 7. Acceptance Criteria

The scene is not acceptable unless:

- The first frame strongly resembles the supplied reference images.
- The globe has depth and cinematic lighting.
- The scanner feels physical.
- The ticket is readable and not clipped.
- Aircraft look like aircraft, not icons.
- Route arcs are thin and elegant.
- The mobile composition is not awkwardly cropped.
- The desktop composition feels wide and premium.
- The ENTER CTA is visibly integrated with the ticket assembly.
- The environment stays dark, premium, and aviation-focused rather than bright, cyan, or decorative.
- The implementation has clear asset boundaries and does not disguise CSS-only placeholders as final 3D quality.
