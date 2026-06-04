# Globe Ticket Composition Lab Notes

## 1. Purpose Of Phase A

Phase A creates a static composition prototype for the future jmpseat waitlist hero sequence: globe -> printer -> ticket -> waitlist CTA.

This is a visual composition lab only. It does not build the final landing page, add animation, add interaction, create product features, replace `/`, or modify `/app`.

## 2. Route Path

- `/lab/globe-ticket-composition`

## 3. Reference Image

- `docs/design/reference/globe-ticket-composition-reference.png`
- `docs/design/reference/globe-ticket-composition-reference-desktop.png`

The provided mobile and desktop reference images were available locally and copied into the repository for visual direction.

## 4. Composition Approach

The route is a full-viewport constructed static scene, not a pasted reference image. The implementation uses layered CSS/HTML/SVG so the globe, printer, ticket, and CTA can be tuned independently while proving the hero composition.

The composition includes:

- a cinematic globe in the upper scene,
- a dark premium ticket-printer base below it,
- a boarding-pass ticket emerging downward,
- an `ENTER` CTA embedded at the bottom of the ticket,
- dark airport-at-night / space background treatment.

The page is intentionally a focused visual lab, not a marketing page or production landing page.

## 5. Mobile Layout Decisions

Mobile is the primary composition:

- globe occupies the upper visual area,
- printer is centered beneath the globe,
- ticket extends down toward the bottom of the viewport,
- CTA remains attached to the ticket and reachable,
- the page avoids horizontal scrolling and unrelated content.

## 6. Desktop Layout Decisions

Desktop keeps the same physical story:

- globe centered above the printer,
- printer and ticket centered below the globe,
- ticket widens into a desktop boarding-pass composition,
- CTA remains centered below the wide ticket surface,
- wider composition with extra background depth,
- floor/grid lighting suggests airport-tech environment without turning into a product dashboard.

## 7. Globe Approach

The Phase A globe is built with CSS/HTML layers using the prepared NASA textures:

- `public/textures/earth/earth-day.jpg`
- `public/textures/earth/earth-night.jpg`

The static globe includes:

- visible Earth surface,
- city-light layer,
- blue atmospheric rim,
- horizon glow,
- route arcs,
- aircraft markers.

This route does not add React Three Fiber or Three.js dependencies because Phase A prioritizes static composition proof over runtime 3D behavior.

## 8. Printer Approach

The printer/base is CSS/HTML:

- dark metallic rounded body,
- warm glowing slot lights,
- recessed ticket slot,
- shadows and blue/amber environmental glow.

It is designed to visually support the globe and make the ticket emergence read as a physical sequence.

## 9. Ticket Approach

The ticket is semantic HTML/CSS for crisp text, accessibility, and an actual clickable CTA.

Ticket content includes aviation-worker private beta fields, route-like visual hierarchy, barcode treatment, and a premium dark `ENTER` CTA.

## 10. CTA Behavior

The `ENTER` CTA is a normal clickable HTML link:

- `https://tally.so/r/jav6aa`

There is no internal waitlist capture, API route, persistence, database, or form handling.

## 11. Static Only

This phase is static only:

- no globe animation,
- no route arc animation,
- no moving planes,
- no ticket-printing animation,
- no drag/touch interaction,
- no auto-rotation.

## 12. Intentionally Not Animated Yet

The future animated sequence remains later work:

- live globe rotation,
- route pulses,
- moving aircraft,
- printer activation,
- ticket emergence,
- CTA reveal.

## 13. Known Visual Gaps

- The globe is CSS-layered rather than a live R3F sphere.
- The Earth texture projection is art-directed for still composition and is not physically correct.
- Aircraft are static SVG silhouettes and may need custom GLB or refined vector art for final quality.
- The printer is CSS geometry, not a modeled object.
- The final hero may still need a live R3F or hybrid asset pipeline before production integration.

## 14. Approval Needed Before Phase B

Before Phase B, approve:

- overall mobile composition,
- globe/printer/ticket vertical relationship,
- ticket content hierarchy,
- CTA placement,
- whether the next pass should be visual polish, a live R3F globe rebuild, or animation planning.

## 15. Screenshot Paths

Planned verification screenshots:

- `screenshots/globe-ticket-composition/mobile-globe-ticket-composition.png`
- `screenshots/globe-ticket-composition/desktop-globe-ticket-composition.png`

## 16. Preview URL

Preview URL will be recorded after Vercel preview deployment, if deployment succeeds.
