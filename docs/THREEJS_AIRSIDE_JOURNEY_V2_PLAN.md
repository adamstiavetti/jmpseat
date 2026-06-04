# Three.js Airside Journey V2 Plan

## 1. Purpose

This document defines a future V2 visual direction for turning the jmpseat public landing page into a premium full-page Three.js/WebGL aviation experience across desktop and mobile.

The current Three.js prototype branch is technically safe but visually underpowered for the founder's target. It behaves like a subtle hero enhancement, not a full-page aviation-native journey. V2 should make the page feel more fantastic and immersive while preserving the product's conversion goal, accessibility, performance, and safety boundaries.

This is a planning document only. It does not implement code, add dependencies, deploy, merge the current prototype branch, or change the live production page.

Controlling principles:

- Utility first. Community second. Social feed last.
- Verified privately. Anonymous publicly. Accountable internally.
- jmpseat is a working name pending legal/trademark clearance.
- jmpseat must not imply official airline, airport, union, or employer affiliation.
- The waitlist conversion remains the top goal.
- All essential text, CTA buttons, disclaimers, and product explanations remain normal accessible HTML.
- Three.js/WebGL remains visual and storytelling support, not the source of essential content.
- No V1 scope expansion and no product features are added.
- No operational/live-flight tracking implication.
- No airline logos, exact routes, schedules, security procedures, crew hotel data, or passenger data.

## 2. Current State

- Production site: https://jmpseat.vercel.app
- Waitlist form: https://tally.so/r/jav6aa
- Current production page includes the public splash/waitlist page and `/app` private beta placeholder.
- Current production page does not include the unmerged Three.js prototype unless separately deployed as a preview.
- Current landing page content is conversion-focused and mostly CSS/HTML.
- The `app/threejs-hero-prototype` branch added a safe technical prototype, but it is not visually ambitious enough for the desired Airside Journey direction.
- Current mobile behavior is not sufficiently immersive for the founder goal. A subtle or small background canvas can read as static or invisible on a phone.

## 3. Creative Target: Airside Journey

Airside Journey is a scroll-aware visual journey through an aviation-worker network. It should feel like a premium crew utility club, not a travel product.

Core motifs:

- Floating boarding pass / access card.
- Airport nodes and route arcs.
- Base, layover, and verified-room story moments.
- Privacy and verification visual moments.
- Final waitlist "boarding/access granted" moment.

What it is not:

- Not a travel booking site.
- Not a flight tracker.
- Not a game.
- Not dating or social matching.
- Not airline-branded.
- Not a simulation of live operations.

The visual system should reinforce: "Real off-duty airline intel from verified airline people."

## 4. Full Page 3D Storyboard

### A. Hero

Visual concept:

- A floating boarding-pass/access-card object sits near the hero visual area.
- Airport nodes appear as illustrative labels such as ATL, DFW, LAX, JFK, and ORD.
- Route arcs pulse slowly between nodes.
- The hero CTA remains normal HTML, visually dominant, and reachable without waiting for WebGL.

Story goal:

- Establish premium aviation atmosphere immediately.
- Make "off-duty network for airline people" feel tangible.

Do not:

- Move the CTA into canvas.
- Use live-looking departure boards.
- Use exact or operational route data.

### B. Problem Section

Visual concept:

- Scattered information fragments drift or orbit loosely, then begin organizing into a cleaner system.
- Fragments can represent group chats, Facebook posts, Reddit threads, and word-of-mouth snippets.

Story goal:

- Show the current state: airline knowledge is useful but scattered, fragile, and hard to trust.

HTML pairing:

- Existing problem cards remain normal HTML and readable without the 3D layer.

### C. Feature Section

Visual concept:

- Base Boards, Layover Boards, and Verified Rooms appear as layered 3D panels/cards.
- Supporting panels can hint at Jumpseat Brief, Ready Room, and NonRev Deals.

Story goal:

- Translate the product wedge into visible structure: base intel, layover knowledge, and verified crew discussion.

HTML pairing:

- Normal feature cards remain the source of truth.
- 3D panels should support the HTML cards, not replace them.

### D. Why Verified Matters

Visual concept:

- A private identity node connects to a public handle node through an internal accountability line.
- An access-gate motif opens only for verified worker identity.

Story goal:

- Visualize "Verified privately. Anonymous publicly. Accountable internally."

Do not:

- Suggest the app has official airline identity systems.
- Suggest anonymous activity has no internal accountability.

### E. Privacy Boundaries

Visual concept:

- A boundary ring or rejected signal motif blocks unsafe data categories.
- Blocked signals can represent portal login, schedule scraping, exact crew hotel exposure, passenger info, and live location.

Story goal:

- Make safety boundaries feel like a product feature, not legal fine print.

Do not:

- Show realistic airport security procedures.
- Show exact hotels, schedules, passenger data, or live tracking.

### F. Waitlist Section

Visual concept:

- The visual journey ends in a final boarding-pass/access-granted state.
- A route pulse leads toward the waitlist CTA.
- The waitlist CTA remains a normal HTML link to Tally.

Story goal:

- Convert interest into a waitlist action.

Do not:

- Add internal form capture.
- Add input fields or persistence.
- Make the 3D finale distract from the CTA.

## 5. Mobile Experience Strategy

Mobile is the highest-risk and highest-importance part of V2. The current prototype direction can feel static on mobile because a subtle background scene is easy to miss on a small screen. V2 should make mobile 3D obvious but lightweight.

Mobile pattern:

1. Hero copy and CTA first.
2. Visible mobile 3D boarding-pass/network panel.
3. Problem section.
4. 3D scattered-info visual.
5. Feature section.
6. 3D feature-card stack.
7. Trust/verification section.
8. 3D access-gate visual.
9. Privacy boundaries.
10. Waitlist section with final access/boarding visual.

Mobile rules:

- Do not hide 3D as a tiny background.
- Use larger visible chapter panels between sections.
- Keep each mobile 3D moment lightweight and short.
- Keep CTA visible early.
- Do not use full desktop scene complexity.
- Avoid canvas touch interactions that interfere with normal page scroll.
- All essential copy remains in HTML.
- Reduced-motion, no-WebGL, and error states use static fallback visuals.

Recommended mobile 3D moments:

- Hero: compact boarding pass with 2-3 airport nodes and 1-2 route arcs.
- Problem: a few fragments drifting into order.
- Features: 2-3 layered cards, not all six features at once.
- Verified: simple gate/identity-node transition.
- Privacy: boundary ring blocking a small set of unsafe signals.
- Waitlist: final access-card glow leading to CTA.

## 6. Desktop Experience Strategy

Desktop can support a larger persistent scene because there is more screen area and more GPU headroom.

Recommended desktop approach:

- Use a persistent visual layer that changes state as the user scrolls.
- Keep hero text and CTA in HTML.
- Use the right-side hero or background visual area for the highest-intensity 3D.
- Let feature cards feel layered in 3D space without replacing HTML cards.
- Use scroll state to change scene composition, not to hijack native scrolling.
- Avoid camera moves that make reading difficult.
- Provide a stable CSS fallback.

Desktop should feel like a premium aviation command surface, but it must remain a landing page.

## 7. Tablet Experience Strategy

Tablet should use a hybrid approach:

- Scene remains visible and more immersive than mobile fallback.
- Object count and animation intensity are lower than desktop.
- Canvas height and layout should avoid pushing CTA too far below the fold.
- If performance or viewport constraints are poor, tablet can degrade to the mobile chapter-panel model.

## 8. Technical Architecture Options

### Option A - One Persistent Canvas With Scroll-Driven Scene States

Pros:

- Best chance of a coherent full-page journey.
- Avoids multiple WebGL contexts.
- Allows smooth transitions between hero, problem, feature, verified, privacy, and waitlist moments.
- Easier to isolate in one component boundary.

Cons:

- Requires careful scroll-state architecture.
- Can become complex if the scene tries to do too much.
- Requires strong fallback handling if WebGL fails.

Performance risks:

- Continuous render loop can drain battery.
- Large object counts or postprocessing can hurt mobile and low-power devices.

Recommendation:

- Recommended for desktop/tablet V2, with strict performance budgets and scroll-state changes driven by normal page position.

### Option B - Multiple Lightweight Chapter Canvases

Pros:

- Mobile chapters can be highly visible and easy to place between sections.
- Each section can have a simpler scene.
- Easier for a future implementation to prototype one scene at a time.

Cons:

- Multiple WebGL canvases can increase memory and initialization cost.
- Resource cleanup becomes more important.
- The experience may feel less continuous.

Performance risks:

- Multiple active canvases are risky on mobile.
- WebGL context limits can create failures on some devices.

Recommendation:

- Acceptable for early mobile prototyping only if inactive canvases are not mounted, scenes are tiny, and fallback is robust. Do not run multiple heavy canvases at once.

### Option C - Single Hero Canvas Plus CSS/2D Animation Elsewhere

Pros:

- Lower complexity.
- Easier to preserve conversion and performance.
- Less implementation risk.

Cons:

- Likely not immersive enough for the founder's Airside Journey target.
- May repeat the current prototype problem: a subtle enhancement that does not transform the page.

Recommendation:

- Useful as a fallback strategy, not the preferred V2 direction.

### Option D - Use Current Subtle Prototype Only

Pros:

- Already technically explored.
- Safer than a larger V2 build.
- Lower maintenance cost.

Cons:

- Underpowered for the founder's current visual goal.
- Mobile can still read as static or invisible.
- Does not support the whole landing page journey.

Recommendation:

- Keep as a technical spike, but do not treat it as the final visual direction if V2 is approved.

## 9. Recommended Architecture

Recommended V2 architecture:

- Desktop/tablet: one persistent client-only React Three Fiber scene with scroll-driven states.
- Mobile: visible lightweight chapter panels or a simplified persistent scene with chapter-style compositions.
- Avoid multiple heavy canvases.
- Keep shared scene configuration for colors, airport labels, feature labels, motion durations, and object budgets.
- Keep all essential content in accessible HTML.
- Use a CSS fallback for reduced motion, no WebGL, loading failure, or low-performance devices.
- Do not introduce GLB assets, large textures, or postprocessing in the first V2 pass.

Implementation should be isolated so one revert can remove the V2 enhancement without touching product logic.

## 10. Scene State Model

| State | Visual Objects | Animations | Mobile Behavior | Desktop Behavior | Fallback Behavior | Performance Limits |
| --- | --- | --- | --- | --- | --- | --- |
| hero | Boarding pass, 3-5 airport nodes, route arcs | Slow float, route pulse, subtle card tilt | Large visible boarding-pass/network panel after CTA | Persistent right-side/ambient hero scene | Static boarding-pass graphic in CSS | Mobile: 2-3 nodes, 1-2 arcs. Desktop: 5 nodes, 3-5 arcs. |
| problem | Info fragments, messy signal lines | Fragments drift into ordered lanes | Standalone chapter panel | Scene shifts behind problem cards | Static scattered-to-ordered motif | No heavy particles; cap fragments to 8 mobile, 16 desktop. |
| features | Feature panels for Base Boards, Layover Boards, Verified Rooms | Gentle stack/tilt, route line connects panels | 2-3 feature cards only | Layered feature-card space | Static layered cards | No 3D text geometry; labels remain HTML/CSS. |
| verified | Identity node, handle node, accountability line, access gate | Gate opens, shield pulse | Simple gate panel between trust sections | Wider access-control scene | Static shield/gate motif | Limit glow effects; no rapid flashing. |
| privacy | Boundary ring, blocked signals | Signals hit boundary and fade | Compact boundary-ring panel | Larger boundary ring behind privacy section | Static privacy boundary graphic | No live/security dashboard styling. |
| waitlist | Final access card, route pulse to CTA | Card settles, final pulse | Visible final panel before CTA or alongside CTA | Scene leads attention toward waitlist card | Static boarding-pass/access card | CTA remains HTML and dominant. |

## 11. Component Architecture

### AirsideJourneyExperience

- Responsibility: Top-level client-only enhancement wrapper.
- Client-only: Yes.
- Inputs/props: current route/page context, enable flag, reduced-motion status, responsive mode.
- Mobile considerations: selects mobile chapter strategy.
- Rollback considerations: removing this component should remove all V2 WebGL behavior.

### AirsideJourneyScene

- Responsibility: Owns the React Three Fiber Canvas and scene graph.
- Client-only: Yes.
- Inputs/props: scene state, responsive mode, performance profile.
- Mobile considerations: renders smaller object sets and lower DPR.
- Rollback considerations: isolated from page content and product logic.

### AirsideJourneyController

- Responsibility: Converts section visibility into scene state.
- Client-only: Yes.
- Inputs/props: section refs or IDs, thresholds, reduced-motion status.
- Mobile considerations: can use section-based state instead of continuous scroll progress.
- Rollback considerations: should not hijack scroll or mutate page layout.

### BoardingPassObject

- Responsibility: Procedural boarding-pass/access-card motif.
- Client-only: Yes within scene; fallback equivalent in CSS.
- Inputs/props: state, labels, emphasis, color theme.
- Mobile considerations: simplified geometry and fewer animated layers.
- Rollback considerations: no external assets required.

### AirportNetwork

- Responsibility: Airport nodes and illustrative network positions.
- Client-only: Yes within scene.
- Inputs/props: airport labels, node count, route list, intensity.
- Mobile considerations: max 2-3 nodes.
- Rollback considerations: labels are illustrative and not operational data.

### RouteArcSystem

- Responsibility: Procedural route arcs and route pulses.
- Client-only: Yes within scene.
- Inputs/props: node positions, arc count, pulse speed, opacity.
- Mobile considerations: max 1-2 arcs and low opacity.
- Rollback considerations: no live route data.

### InfoFragmentCloud

- Responsibility: Scattered knowledge fragments for problem story.
- Client-only: Yes within scene.
- Inputs/props: fragment count, scatter/order progress.
- Mobile considerations: tiny object count; no text in WebGL required.
- Rollback considerations: HTML problem cards remain source of truth.

### FeaturePanelStack

- Responsibility: Visual support for Base Boards, Layover Boards, and Verified Rooms.
- Client-only: Yes within scene.
- Inputs/props: feature labels, active feature, layout mode.
- Mobile considerations: 2-3 panels, minimal tilt.
- Rollback considerations: HTML feature grid remains source of truth.

### VerificationGate

- Responsibility: Visualizes verified identity, public handle, and internal accountability.
- Client-only: Yes within scene.
- Inputs/props: gate open progress, trust intensity.
- Mobile considerations: one simple gate card.
- Rollback considerations: no actual auth or verification behavior.

### PrivacyBoundaryRing

- Responsibility: Visualizes blocked unsafe signals.
- Client-only: Yes within scene.
- Inputs/props: blocked categories, ring intensity.
- Mobile considerations: compact ring; no dense labels.
- Rollback considerations: privacy text remains HTML.

### ThreeFallbackVisual

- Responsibility: CSS/SVG-like fallback visual for reduced motion, no WebGL, or error states.
- Client-only: No, can be server-rendered HTML/CSS.
- Inputs/props: current section or visual variant.
- Mobile considerations: must still feel intentional, not broken.
- Rollback considerations: should work without Three.js.

### useReducedMotion

- Responsibility: Detects `prefers-reduced-motion`.
- Client-only: Yes if it uses `matchMedia`; CSS fallback also required.
- Inputs/props: none.
- Mobile considerations: mobile reduced-motion should skip animated WebGL.
- Rollback considerations: can be reused by non-3D animation code.

### useResponsiveSceneMode

- Responsibility: Chooses desktop, tablet, mobile, low-power, or fallback mode.
- Client-only: Yes.
- Inputs/props: viewport width, reduced-motion, WebGL capability, optional performance signal.
- Mobile considerations: mobile must still get intentional 3D when capable.
- Rollback considerations: should default to safe fallback.

## 12. Motion Design

Motion should be slow, restrained, and legible:

- Route pulses should be calm and infrequent.
- Boarding-pass card tilt should be subtle.
- Section transitions should feel like a controlled airport-system interface, not a game camera.
- Avoid aggressive camera motion.
- Avoid motion that blocks reading.
- Avoid scroll-jacking.
- Avoid rapid flashing or strobing.
- Reduced-motion mode should replace animated WebGL with static or near-static visuals.

## 13. Mobile Performance Budget

Mobile constraints:

- DPR cap: 1.0.
- Max airport nodes: 3 per visible scene moment.
- Max route arcs: 2 per visible scene moment.
- Max info fragments: 8.
- Max feature panels: 3.
- No postprocessing.
- No GLB/model assets in V2 first pass.
- No heavy particle fields.
- No large textures.
- No 3D text geometry.
- No continuous render if not necessary; prefer low-frequency animation or paused/offscreen behavior where practical.
- Do not mount multiple active heavy canvases.
- Degrade to fallback if WebGL fails, reduced motion is preferred, or performance appears poor.

Mobile review must happen on a real phone before merge.

## 14. Desktop Performance Budget

Desktop constraints:

- DPR cap: 1.5 unless testing proves higher is safe.
- Procedural geometry first.
- Shared materials and geometries.
- No excessive postprocessing.
- Avoid large textures and GLB assets in V2 first pass.
- Lazy-load the client-only 3D enhancement.
- Keep hero content interactive before the 3D layer finishes loading.
- Review bundle-size impact.
- Capture desktop screenshots and production-like preview proof.

## 15. Accessibility Requirements

- Canvas is decorative unless a future implementation explicitly labels it.
- No essential information exists only in canvas.
- All product content, CTA buttons, disclaimers, and navigation remain HTML.
- Waitlist CTA remains keyboard-accessible.
- Visible focus states remain.
- Respect `prefers-reduced-motion`.
- Provide fallback if WebGL fails.
- Do not rely on color alone to communicate meaning.
- Avoid seizure and flash risk.
- If animation runs longer than five seconds alongside content, provide reduced-motion behavior and consider a pause/disable mechanism.

## 16. Conversion Requirements

- Join Waitlist CTA remains visually dominant.
- The page explains the product in five seconds.
- 3D supports trust and brand, not confusion.
- No scroll-jacking.
- No loading spinner blocks page content.
- Waitlist CTA still points to Tally.
- No UX makes joining the waitlist harder.
- Mobile users see the CTA early before deeper storytelling.

## 17. Brand/Safety Requirements

- No airline logos.
- No official airline, airport, union, or employer affiliation implication.
- No live-looking flight tracking.
- Airport codes are illustrative.
- No operational or security displays.
- No exact crew hotel data.
- No schedule data.
- No passenger information.
- No dating/social matching vibe.
- No realistic aircraft model required or recommended in V2 first pass.

## 18. Implementation Phases

### V2-0 - Planning Only

Current task.

Output:

- Airside Journey V2 plan.
- Research notes update.
- No app code or behavior changes.

### V2-1 - Visual Prototype Branch

Future branch only after explicit approval.

Scope:

- Implement scene-state skeleton.
- Implement mobile visible 3D chapter panels.
- Preserve existing landing page content and waitlist flow.
- No production deploy.
- No product behavior change.

### V2-2 - Mobile Polish

Scope:

- Real phone review.
- Mobile performance review.
- CTA positioning review.
- Screenshot proof.
- Reduced-motion proof.

### V2-3 - Desktop Polish

Scope:

- Richer desktop scene.
- Route arcs and scene-state transitions.
- Smoothness and visual fidelity pass.
- Ensure the design still feels premium and not gimmicky.

### V2-4 - Preview Deploy and Decision

Scope:

- Vercel preview only.
- Founder review.
- Decision: keep, revise, or revert.
- No production deploy unless explicitly approved after review.

## 19. Acceptance Criteria for Future V2 Implementation

- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm run build` passes.
- `npm audit` reviewed.
- Desktop screenshot captured.
- Mobile screenshot captured.
- Reduced-motion proof captured.
- Production-like preview URL provided.
- Mobile CTA remains visible and usable.
- Waitlist CTA still opens Tally.
- No product features added.
- No app auth, database, API, Supabase, verification, community, AI, payments, analytics, airline integrations, schedule scraping, nearby crew tracking, flight-load requests, or dating/swiping added.
- Rollback path is clear.
- Founder approval before merge.

## 20. Current Prototype Disposition

Recommendation for `app/threejs-hero-prototype`:

- Keep it as a safe technical prototype and learning branch.
- Do not merge it into `main` yet if the founder wants the V2 Airside Journey direction.
- Reuse lessons where useful:
  - client-only dynamic loading,
  - WebGL failure fallback,
  - reduced-motion fallback,
  - procedural geometry,
  - DPR caps,
  - no product behavior changes.
- Supersede the visual direction with Airside Journey V2.
- If V2 is approved, start a fresh branch named `app/airside-journey-v2-prototype` from `main`.

## 21. Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Performance degradation | Lazy-load 3D, cap DPR, avoid GLB/assets/postprocessing, test on real phone. |
| Mobile GPU/battery load | Use tiny object counts, pause/offscreen behavior, fallback on reduced motion or poor performance. |
| Gimmicky experience | Tie every visual state to product meaning: base intel, layover boards, verified rooms, privacy, waitlist. |
| Accessibility issues | Keep content in HTML, support reduced motion, provide fallback, avoid color-only meaning. |
| Bundle bloat | Track dependency impact and avoid new animation libraries unless justified. |
| Conversion distraction | Keep CTA dominant and visible early; no scroll-jacking or blocking loaders. |
| Harder maintainability | Isolate all 3D code in dedicated components and shared config. |
| Dependency vulnerabilities | Run `npm audit`; do not add avoidable dependencies. |
| Preview/production confusion | Preview deploy only until explicit production approval. |

## 22. Rollback Plan

- Isolate V2 changes in dedicated components.
- Preserve the current static landing page structure.
- Add a simple feature/config toggle if practical.
- Keep CSS fallback as a first-class path.
- Ensure one revert can remove the enhancement cleanly.
- Do not entangle V2 with app data, auth, API routes, or product logic.

## 23. Recommended Next Codex Task

Future implementation prompt summary, not approved yet:

- Branch: `app/airside-journey-v2-prototype`
- Epoch: Epoch 01 - Public Splash + Waitlist
- Goal: implement scroll-aware Airside Journey V2.
- Scope:
  - client-only React Three Fiber visual enhancement,
  - mobile visible 3D chapter panels,
  - desktop/tablet scroll-aware scene states,
  - preserve existing landing page, CTA, and Tally waitlist flow,
  - preview deploy only,
  - no product features.
- Required proof:
  - lint/typecheck/build,
  - audit review,
  - desktop screenshot,
  - mobile screenshot,
  - reduced-motion proof,
  - preview URL,
  - explicit no-product-feature confirmation.

## 24. Open Questions

- Should V2 use one persistent canvas, mobile chapter canvases, or a hybrid?
- What exact mobile canvas height keeps the scene visible without hurting CTA conversion?
- Should current prototype components be reused or replaced?
- Should Framer Motion be avoided to keep dependency count low?
- What bundle-size increase is acceptable?
- Should mobile state changes be scroll-driven or section-based static transitions?
- How much visual intensity is too much for the trust-focused aviation brand?
- Should a visible "reduce motion" control be added beyond respecting system preferences?
