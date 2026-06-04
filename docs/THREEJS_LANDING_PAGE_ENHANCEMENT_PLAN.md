# Three.js Landing Page Enhancement Plan

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

Product principle: Utility first. Community second. Social feed last.

Identity principle: Verified privately. Anonymous publicly. Accountable internally.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or employer.

This is a documentation-only plan. It does not implement Three.js, add dependencies, create assets, modify the landing page, change deployment config, or add product features.

## 1. Purpose

This plan defines how jmpseat could add a premium aviation-native 3D hero layer to the existing public splash/waitlist page. The goal is to strengthen the airport-at-night atmosphere, make the founder-pitch surface feel more memorable, and support waitlist conversion.

3D should support trust, aviation context, and conversion. It should not become a gimmick, hide the product promise, slow the page down, or make jmpseat feel like a travel-booking site, dating app, flight tracker, or cartoon aviation demo.

## 2. Current State

- Public splash page is live.
- Production URL: https://jmpseat.vercel.app.
- Waitlist URL: https://tally.so/r/jav6aa.
- Current landing page is CSS/HTML only.
- Current routes are `/` and `/app`.
- `/app` remains a private beta placeholder.
- Waitlist capture remains external through `NEXT_PUBLIC_WAITLIST_FORM_URL`.
- No auth, database, Supabase, API persistence, community features, AI, payments, analytics SDK, or internal waitlist capture exists.

## 3. Research Basis

Research accessed: May 28, 2026.

| Source | Type | What it supports | Plan impact |
| --- | --- | --- | --- |
| Three.js WebGLRenderer docs - https://threejs.org/docs/pages/WebGLRenderer.html | Official docs | Renderer configuration, including GPU power preference and WebGL renderer options. | Prefer a single lightweight renderer/canvas and avoid high-cost renderer settings for a marketing page. |
| Three.js disposal guide - https://threejs.org/manual/en/how-to-dispose-of-objects.html | Official docs | Three.js resources such as geometries, materials, textures, and render targets require explicit cleanup. | Future implementation should isolate the scene and cleanly dispose resources on unmount. |
| Three.js cleanup guide - https://threejs.org/manual/en/cleanup.html | Official docs | Textures, geometries, and materials consume memory and must be disposed when no longer needed. | Avoid textures/models in first pass and keep rollback/resource cleanup simple. |
| React Three Fiber Canvas docs - https://r3f.docs.pmnd.rs/api/canvas | Official docs | Canvas supports `dpr`, `frameloop`, renderer props, and resize configuration. | Cap DPR and consider `frameloop="demand"` or minimal animation where practical. |
| React Three Fiber scaling performance - https://r3f.docs.pmnd.rs/advanced/scaling-performance | Official docs | On-demand rendering, adaptive DPR, instancing, and performance monitoring patterns. | Use lazy loading, limited scene complexity, adaptive quality, and procedural reuse. |
| React Three Fiber performance pitfalls - https://r3f.docs.pmnd.rs/advanced/pitfalls | Official docs | Avoid expensive mount/unmount cycles, avoid state updates inside frame loops, reuse objects, and avoid recreating objects each frame. | Use refs/mutation for animation, memoize geometry/materials, and keep the scene stable. |
| Drei docs - https://drei.docs.pmnd.rs/ | Official docs | Drei provides helpers for React Three Fiber, but it is a broad helper library. | Use Drei only if it reduces real complexity; do not add it reflexively. |
| Next.js lazy loading guide - https://nextjs.org/docs/app/guides/lazy-loading | Official docs | Client Components and libraries can be lazy-loaded; `ssr: false` can skip prerendering for client-only components. | Use a dynamically imported client-only scene behind an HTML/CSS fallback. |
| MDN prefers-reduced-motion - https://developer.mozilla.org/en-US/docs/Web/CSS/%40media/prefers-reduced-motion | Standards/reference docs | Users can request reduced motion; motion can trigger vestibular discomfort. | Respect reduced motion and provide a non-animated fallback. |
| MDN WebGL best practices - https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices | Standards/reference docs | WebGL performance depends on memory, draw calls, back buffer size, batching, and avoiding blocking calls. | Keep draw calls low, render smaller where possible, avoid heavy postprocessing and large assets. |
| W3C WCAG 2.2 Pause, Stop, Hide - https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide | Accessibility standard guidance | Moving content that starts automatically and lasts more than five seconds needs a pause/stop/hide mechanism unless essential. | Keep motion subtle/decorative, respect reduced motion, and consider a disable mechanism if continuous animation ships. |
| Awwwards Three.js/WebGL collections - https://www.awwwards.com/awwwards/collections/three-js/ and https://www.awwwards.com/websites/webgl/ | Inspiration/gallery | High-end WebGL landing pages often use atmospheric, cinematic 3D as visual support. | Use premium visual inspiration but reject scroll-jacking, heavy spectacle, and CTA distraction. |

## 4. Visual Target

The enhancement should extend the already-approved jmpseat visual direction:

- Airside Night palette.
- Airport-at-night feel.
- Premium aviation-native look.
- Boarding-pass cards.
- Flight-board and terminal-signage microcopy.
- Route-line arcs.
- Airport-code labels.
- Crew utility club aesthetic.
- Deep navy/black background, charcoal/navy panels, cloud-white text, taxiway amber CTA, signal-blue accents, and minimal runway-red warnings.

The result should feel like a trusted crew utility club, not a consumer travel booking page.

## 5. Recommended 3JS Concept

Primary concept: Airside Network Scene.

Definition:

- A subtle dark 3D globe, radar plane, or network field in the hero/right-side visual area.
- Glowing airport nodes.
- Route arcs connecting illustrative airport labels such as ATL, DFW, LAX, JFK, and ORD.
- A floating boarding-pass/access card that echoes the current brand cards.
- Subtle motion: slow orbital drift, route-line pulse, or node glow.
- No realistic aircraft model.
- No heavy GLB assets in the first pass.
- No live operational, route, schedule, load, location, or flight-tracking implication.

Recommended first shape:

- Use a stylized radar/network field rather than a realistic globe if performance or visual clarity is at risk.
- Keep all product copy, labels that matter, and CTAs in normal HTML outside the canvas.
- Treat the 3D scene as decorative/atmospheric unless a later accessibility plan labels it explicitly.

## 6. Alternative Concepts Considered

| Concept | Pros | Cons | Recommendation |
| --- | --- | --- | --- |
| 3D boarding pass only | Strong brand fit, lower complexity, easy fallback. | Less spatial aviation atmosphere; may duplicate existing CSS boarding pass. | Good fallback or Phase 3D-1 simplification if network scene is too much. |
| Airport radar/grid only | Strong airport ops feel, lightweight procedural geometry, avoids travel-booking visuals. | Can look security/operations-sensitive if too realistic. | Good candidate if styled as illustrative and non-operational. |
| Terminal board scene | Clear airport-native metaphor and good typography. | Text in canvas can hurt accessibility and SEO if essential. | Use as CSS/HTML supporting detail, not primary 3D. |
| Floating feature-card space | Ties to product features and can reinforce utility. | Risk of generic SaaS hero and visual clutter. | Consider only after conversion baseline is known. |
| Realistic 3D aircraft/airport model | Immediately communicates aviation. | Heavy assets, brand/legal risks, cartoon/travel-booking feel, performance cost. | Do not use in first pass. |

## 7. Recommendation

Phase 1 should implement a lightweight, client-only, procedural 3D hero enhancement using React Three Fiber.

The scene should enhance the hero/right-side visual area, not replace page content. All text, navigation, disclaimers, and waitlist CTAs must remain normal accessible HTML outside the canvas.

CSS fallback must exist before the 3D component is enabled. If 3D fails to load, WebGL is unavailable, motion reduction is requested, or the device is low-power, the page should still look complete using the current CSS-based visual system.

Do not implement this until explicitly approved in a future app branch.

## 8. Technical Architecture

Future implementation shape:

- Next.js App Router.
- Client-only component for the 3D canvas.
- Dynamically imported with SSR disabled where appropriate, following Next.js lazy-loading guidance.
- React Three Fiber for declarative Three.js integration.
- Drei only if it meaningfully reduces complexity, such as lines/text helpers or performance monitoring. Avoid broad helper usage by default.
- No GLB/model assets initially.
- Procedural geometry first: points, arcs, planes, simple meshes, and shader-light materials if necessary.
- No server dependency.
- No API routes.
- No database.
- No analytics SDK.
- No product behavior change.

Implementation boundary:

- Keep `app/page.tsx` primarily server-rendered/static where possible.
- Add a small client wrapper only around the 3D scene.
- Place loading and fallback markup in regular HTML/CSS.
- Keep waitlist CTA behavior unchanged through `NEXT_PUBLIC_WAITLIST_FORM_URL`.

## 9. Component Plan

| Component | Responsibility | Inputs / props | Performance notes | Accessibility notes |
| --- | --- | --- | --- | --- |
| `AirsideHeroScene` | Own the Canvas, camera, lighting, scene composition, and quality mode. | `reducedMotion`, `quality`, `className`, optional airport list. | Single canvas, capped DPR, no heavy postprocessing, procedural objects only. | Canvas decorative by default; `aria-hidden` unless later made meaningful. |
| `AirportNode` | Render an illustrative airport point/glow. | `code`, `position`, `active`, `tone`. | Reuse geometry/materials; avoid DOM labels inside canvas if possible. | Airport code duplicated only if decorative; essential labels stay in HTML. |
| `RouteArc` | Render route-like arcs between nodes. | `start`, `end`, `intensity`, `delay`. | Use memoized curve geometry or instanced/simple lines; avoid rebuilding each frame. | Route data is illustrative, not operational. |
| `FloatingBoardingPass` | Render a subtle 3D card motif that echoes current boarding pass styling. | `position`, `rotation`, `variant`. | Simple plane/box geometry; no texture required in first pass. | Do not put required readable copy only in canvas. |
| `ReducedMotionFallback` | Provide static visual when reduced motion, no WebGL, or low power is detected. | `reason`, `className`. | No WebGL; CSS-only. | Fully available to all users and does not depend on canvas. |
| `HeroSceneBoundary` | Future wrapper for dynamic import, loading state, error fallback, and feature flag. | `enabled`, `fallback`, `children`. | Prevent broken canvas from affecting page content. | Keeps semantic hero content independent from 3D. |

## 10. Performance Guardrails

- Lazy-load the 3D scene.
- Use dynamic import for the client-only scene.
- Cap device pixel ratio, for example with React Three Fiber `dpr={[1, 1.5]}` or another tested range.
- Avoid heavy postprocessing in the first pass.
- Avoid large textures and all GLB/model assets initially.
- Reuse geometries and materials.
- Avoid creating objects inside animation loops.
- Avoid React state updates inside `useFrame`; use refs and frame deltas for animation.
- Keep draw calls low; prefer shared or instanced primitives if many nodes are used.
- Pause or reduce animation when offscreen if practical.
- Respect `prefers-reduced-motion`.
- Provide a static fallback for low-power devices, no WebGL, or reduced motion.
- Keep hero text and CTA outside canvas.
- Target good mobile performance before desktop polish is accepted.
- Test on an actual phone, not only desktop responsive mode.

Suggested budget for a future implementation:

- No GLB assets in Phase 3D-1.
- No large image textures.
- One WebGL canvas maximum on the page.
- No scroll-jacking.
- No required interaction inside canvas.
- No more than a small number of animated objects in the initial hero view.

## 11. Accessibility Guardrails

- Canvas is decorative unless explicitly labeled in a future accessibility plan.
- Normal HTML content remains the primary content.
- No essential information appears only in 3D.
- Waitlist CTA remains keyboard accessible.
- Visible focus states remain unchanged.
- Respect `prefers-reduced-motion`.
- Provide fallback for no WebGL and disabled/reduced motion.
- Do not use color alone to communicate meaning.
- Avoid flashing, blinking, or fast pulsing.
- If continuous motion runs for more than five seconds, provide a pause/stop/hide mechanism or make reduced-motion behavior the default for users who request it.
- Preserve heading hierarchy and semantic sections.

## 12. Conversion Guardrails

- `Join the Waitlist` remains visually dominant.
- 3D must not delay interaction with the CTA.
- 3D must not push the headline or CTA below the fold on mobile.
- No scroll-jacking.
- No mandatory hover/touch interaction.
- No confusing interaction that looks like a product feature.
- The page should still explain the product in five seconds.
- If analytics are later approved, compare before/after conversion before keeping the enhancement.
- The 3D layer should support, not compete with, the current feature-card grid, trust strip, privacy boundaries, waitlist panel, and disclaimer.

## 13. Safety / Brand Guardrails

- No airline logos.
- No official affiliation implication.
- No flight-tracking style that implies operational or live data.
- No exact route, schedule, crew, hotel, airport operations, or flight-load data.
- No realistic security or airport ops displays.
- Airport codes are illustrative only.
- No passenger/travel booking vibe.
- No dating/social matching vibe.
- No public nearby crew tracking mechanic.
- No visual that suggests real-time crew location.
- No V1-excluded features.

## 14. Implementation Phases

### Phase 3D-0 - Planning Only

Current task.

Outputs:

- This plan.
- README docs index update.
- No implementation.

### Phase 3D-1 - Prototype Branch

Future branch, not approved yet: `app/threejs-hero-prototype`.

Scope:

- Install only explicitly approved dependencies.
- Add client-only scene.
- Integrate only in the hero/right-side visual area.
- Preserve all existing content and CTAs.
- Provide CSS fallback.
- No product behavior change.

### Phase 3D-2 - Responsive / Performance Polish

Scope:

- Mobile screenshots.
- Desktop screenshots.
- Reduced-motion fallback.
- No-WebGL fallback.
- Lighthouse/manual performance review.
- Bundle-size review.
- Real phone smoke test.

### Phase 3D-3 - Optional Feature Storytelling

Scope:

- Tie illustrative nodes/cards to Base Boards, Layover Boards, and Verified Rooms.
- Keep it non-interactive or minimally interactive.
- Proceed only if performance and conversion remain strong.
- Do not imply these features are live if they are not.

## 15. Acceptance Criteria for Future Implementation

- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm run build` passes.
- Page loads on production-equivalent build.
- Mobile layout works.
- Waitlist CTA still works.
- `/app` remains a placeholder.
- No console errors from the 3D scene.
- Reduced-motion fallback works.
- No-WebGL fallback works or fails safely to CSS.
- No content regression.
- No forbidden product features added.
- No auth, database, Supabase, API persistence, verification, community, AI, payments, analytics SDK, schedule, flight-load, nearby crew, or dating features added.
- Before/after screenshot captured.
- Bundle/performance impact is reported.

## 16. Risks

- Performance degradation.
- Mobile battery/GPU load.
- Inaccessible visual-only content.
- Gimmicky look.
- Distracting from the waitlist CTA.
- Bundle size increase.
- Hydration/client-only issues.
- Visual mismatch with current page.
- Overly realistic route/radar visuals that imply live operations or tracking.
- Future maintainability burden for a non-core validation surface.

## 17. Rollback Plan

- Isolate all 3D changes in one component group.
- Keep CSS fallback intact.
- Keep existing hero copy and CTA markup outside the 3D component.
- Use a feature flag or simple config toggle if practical.
- Ensure one revert commit can remove the enhancement cleanly.
- Do not entangle the scene with waitlist logic, app routing, auth, analytics, or product data.

## 18. Recommended Future Codex Task

Recommended future implementation task, not approved yet:

`app/threejs-hero-prototype`

Goal:

- Implement lightweight client-only Airside Network Scene.
- Use React Three Fiber.
- Keep all text and CTAs in accessible HTML.
- Preserve current waitlist behavior.
- Add no product features.
- Provide screenshots, checks, performance notes, reduced-motion fallback proof, and rollback notes.

This should only run after explicit approval.

## 19. Open Questions

- Should the 3D element be a globe, radar field, or boarding pass first?
- Should the first prototype be desktop-only or include mobile from day one?
- What dependency budget limit should be enforced for the enhancement?
- Should Framer Motion be avoided to prevent another animation dependency?
- Should the scene be feature-flagged or controlled by a simple config?
- Should continuous animation have an explicit pause control in addition to reduced-motion handling?
- Should airport labels remain HTML/CSS overlays instead of canvas text?

## 20. Recommended Decision

Proceed with planning only for now.

Do not implement Three.js until there is explicit approval for a scoped app branch. When approved, keep the first pass procedural, lightweight, decorative, client-only, and reversible. The conversion page must remain usable, accessible, and credible without WebGL.
