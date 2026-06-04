# Latest jmpseat Hero Render Review

Generated: 2026-05-30T13:27:54.954950+00:00

Status: **FAILED BLOCKOUT**

This render is pipeline proof only. It is not visually acceptable, not complete, and must not be presented as a successful cinematic render.

## Reference Assets

- Mobile reference: `docs/landing/references/jmpseatwaitlistglobemobile.jpeg`
- Desktop reference: `docs/landing/references/jmpseatwaitlistglobedesktop.jpeg`
- Mobile render: `public/cinematic/previews/jmpseat-hero-mobile-preview.png`
- Desktop render: `public/cinematic/previews/jmpseat-hero-desktop-preview.png`
- Contact sheet: `public/cinematic/previews/jmpseat-hero-contact-sheet.png`
- Debug day-only globe: `public/cinematic/previews/debug-earth-day-only.png`
- Debug city-light-only globe: `public/cinematic/previews/debug-earth-night-city-lights-only.png`
- Debug final globe material: `public/cinematic/previews/debug-earth-final-material.png`
- Debug final globe without atmosphere: `public/cinematic/previews/debug-earth-final-no-atmosphere.png`
- Debug final globe with atmosphere: `public/cinematic/previews/debug-earth-final-with-atmosphere.png`

## Score

Total: **39/55**

| Category | Score | Notes |
| --- | ---: | --- |
| Mobile framing accuracy | 3/5 | The mobile render has the right stack, but the camera/ticket pass still reads too tabletop and does not yet match the long vertical boarding-pass reference. |
| Desktop framing accuracy | 4/5 | The desktop render is aligned to the reference silhouette with centered globe, scanner, wide foreground ticket, and negative space. |
| Globe depth/cinematic quality | 3/5 | The debug globe now reads as a darker opaque Earth with warm surface lights, but the final hero still needs clearer continent mass and richer Earth texture before it is close to reference. |
| Atmosphere subtlety | 4/5 | The atmosphere is no longer overpowering the surface in the debug renders; it now behaves more like a restrained edge support layer. |
| City light quality | 3/5 | City lights are now warm/gold and geographically mapped, but they still need more premium density and integration in the final hero frame. |
| Route arc elegance | 4/5 | Thin blue and amber arcs wrap around the globe without becoming thick neon clutter. |
| Aircraft readability | 3/5 | At least three small aircraft are visible, but their lighting and silhouettes remain blockout quality. |
| Scanner/printer physicality | 4/5 | The scanner has bevels, layered hard-surface body panels, recessed slot depth, amber strips, and reflective highlights. |
| Ticket readability | 3/5 | The ticket has boarding-pass structure and text, but mobile perspective still makes it feel too much like a tabletop card. |
| ENTER CTA visibility | 5/5 | The ENTER CTA is centered, fully visible, readable, and physically integrated into the ticket foreground. |
| Overall premium/cinematic feel | 3/5 | The scene is directionally cinematic, but globe material quality and mobile camera angle keep it below the premium reference bar. |

## Gate Result

**FAILED. Do not claim visual success.**

The render cannot pass until total score is at least 48/55, no category is below 4/5, no hard-fail condition is present, and the mobile-specific acceptance checks pass independently.

## Hard-Fail Conditions Present

- Current render status is FAILED.
- Mobile framing does not yet independently match the supplied mobile reference.
- Mobile camera still reads too top-down/tabletop for the ticket.
- Globe no longer reads primarily as glass in the debug renders, but the final hero globe is still too abstract and lacks clear continent mass compared with the references.
- City-light and cloud detail remain previs quality and do not yet fully resemble the reference geography.
- Aircraft are still blockout quality and do not yet match the reference aircraft readability.

## Texture Visibility Debug

- Day texture visibility: proven. `debug-earth-day-only.png` shows the Earth day texture mapped to the sphere with visible continental geography.
- Night/city-light texture visibility: proven. `debug-earth-night-city-lights-only.png` shows the city-light texture aligned to the same geography.
- Final material result: improved but still failed. `debug-earth-final-material.png` and the atmosphere comparison renders show a darker opaque Earth stack with warm city lights, but the hero still lacks the reference's clear continent mass, premium light/shadow depth, and rich city-light geography.
- UV/material mapping status: corrected by explicitly wiring texture-coordinate UVs into the Earth, cloud, and city-light texture nodes.
- Atmosphere status: improved. The atmosphere-disabled and atmosphere-enabled debug renders show that the atmosphere is no longer the main visible material, though the hero still carries a cool rim on the left edge.

## Mobile Camera/Ticket Pass

- Result: failed to clear the mobile gate.
- The mobile-only ticket narrowing and adjusted camera preserved scanner/globe hierarchy, but the ticket still reads as a flat tabletop card rather than a long boarding pass printing downward from the scanner.
- ENTER remains visible and centered, but the ticket body is still too horizontal and foreground-table-like compared with the supplied mobile reference.
- Next mobile correction likely needs an actual mobile-only ticket articulation/previs pose instead of camera framing alone.

## Mobile-Specific Gate

- Globe must be large and dominant in the top half of the frame.
- Globe must sit directly above the scanner/printer.
- Scanner/printer must be directly under the globe and clearly visible.
- Ticket must emerge vertically downward as a long boarding pass, not read as a tabletop card.
- ENTER CTA must be fully visible, centered, and near the lower portion of the ticket.
- Mobile camera must feel front-facing and heroic, not overly top-down.
- Background must avoid wasted gray/empty space.
- Mobile render must feel tall, premium, and immersive like the supplied mobile reference.

## Below-Threshold Categories

- Mobile framing accuracy
- Globe depth/cinematic quality
- City light quality
- Aircraft readability
- Ticket readability
- Overall premium/cinematic feel

## Iteration Rule

Preserve the working desktop hierarchy. The next correction priority is the lowest-scoring visual cluster: globe realism and mobile-specific camera/ticket readability. Do not claim success until the mobile gate passes independently.
