# jmpseat Hero Render Review Rubric

This rubric gates every jmpseat cinematic waitlist hero render iteration against the supplied mobile and desktop references.

Reference files:

- `docs/landing/references/jmpseatwaitlistglobemobile.jpeg`
- `docs/landing/references/jmpseatwaitlistglobedesktop.jpeg`

Current render files:

- `public/cinematic/previews/jmpseat-hero-mobile-preview.png`
- `public/cinematic/previews/jmpseat-hero-desktop-preview.png`
- `public/cinematic/previews/jmpseat-hero-contact-sheet.png`

## Scoring Scale

Each category is scored from 0 to 5.

- 0 = missing or completely wrong
- 1 = present but very poor
- 2 = recognizable but weak
- 3 = acceptable direction
- 4 = strong and close to reference
- 5 = excellent / reference-matching

Total score: **/55**

Do not claim visual success unless:

- Total score is at least **48/55**
- No category is below **4/5**
- No hard-fail condition is present
- Mobile framing independently passes the mobile-specific hard checks below

## Categories

### 1. Mobile Framing Accuracy

- 0: Mobile render is absent or not vertical.
- 1: Vertical frame exists but composition is wrong or incoherent.
- 2: Globe/scanner/ticket stack is recognizable but awkwardly cropped or poorly scaled.
- 3: Mobile composition is acceptable and shows globe, scanner, ticket, and CTA in order, but may still feel like a squeezed desktop render.
- 4: Mobile frame is strong and close to the reference proportions: large top-half globe, scanner directly below, long vertical ticket, centered ENTER CTA, and minimal wasted background.
- 5: Mobile frame closely matches the supplied mobile reference hierarchy, crop, scale, camera angle, and tall premium balance.

Mobile framing accuracy cannot receive 4/5 or 5/5 unless all of these are true:

- Globe is large and dominant in the top half of the frame.
- Globe sits directly above the scanner/printer, not floating too high or shrinking away from it.
- Scanner/printer is directly under the globe and clearly visible.
- Ticket emerges vertically downward from the scanner as a long boarding pass.
- Ticket does not read as a flat horizontal tabletop card.
- ENTER CTA is fully visible, centered, and near the lower portion of the ticket.
- Mobile camera feels front-facing and heroic, not overly top-down.
- Background has minimal wasted gray or empty space.
- The render feels tall, premium, and immersive like the mobile reference, not like a desktop render squeezed into portrait.

### 2. Desktop Framing Accuracy

- 0: Desktop render is absent or not wide.
- 1: Wide frame exists but composition is wrong or incoherent.
- 2: Globe/scanner/ticket layout is recognizable but lacks the reference's cinematic width and balance.
- 3: Desktop composition is acceptable and readable.
- 4: Desktop frame is strong and close to the reference.
- 5: Desktop frame closely matches the reference hierarchy, width, scale, and premium staging.

### 3. Globe Depth/Cinematic Quality

- 0: Globe is missing or flat.
- 1: Globe exists but reads like a sticker, icon, or simple sphere.
- 2: Globe has some depth but lacks convincing surface, lighting, or material treatment.
- 3: Globe has acceptable dimensionality and lighting direction.
- 4: Globe feels cinematic, dimensional, and close to reference depth.
- 5: Globe matches the reference as a premium lit Earth object with strong depth and surface richness.

### 4. Atmosphere Subtlety

- 0: Atmosphere is missing when needed or completely wrong.
- 1: Atmosphere is overpowering, thick, or synthetic.
- 2: Atmosphere is recognizable but too cyan, too thick, or too uniform.
- 3: Atmosphere is acceptable and supports the globe.
- 4: Atmosphere is restrained, subtle, and close to reference.
- 5: Atmosphere matches the reference with thin, cinematic fresnel and no cheap glow.

### 5. City Light Quality

- 0: City lights are missing.
- 1: City lights are random dots or noisy decoration.
- 2: City lights are recognizable but weak, sparse, or geographically unconvincing.
- 3: City lights are acceptable and support the night-side Earth effect.
- 4: City lights feel premium, warm, fine-grained, and close to reference.
- 5: City lights match the reference quality, geography feel, warmth, and scale.

### 6. Route Arc Elegance

- 0: Route arcs are missing or completely wrong.
- 1: Route arcs are thick, noisy, neon, or chaotic.
- 2: Route arcs are recognizable but too heavy or decorative.
- 3: Route arcs are thin enough and compositionally acceptable.
- 4: Route arcs are elegant, restrained, and close to reference.
- 5: Route arcs match the reference: thin, graceful, depth-aware, and premium.

### 7. Aircraft Readability

- 0: Aircraft are missing.
- 1: Aircraft look like flat icons, random markers, or noise.
- 2: Aircraft silhouette is recognizable but weak or poorly lit.
- 3: Aircraft read acceptably as small planes.
- 4: Aircraft read clearly as 3D passenger aircraft and are close to reference.
- 5: Aircraft match the reference in clarity, scale, lighting, and route integration.

### 8. Scanner/Printer Physicality

- 0: Scanner/printer is missing.
- 1: Scanner/printer looks like CSS rectangles or an abstract block.
- 2: Scanner/printer is recognizable but lacks hard-surface material, bevels, or scale.
- 3: Scanner/printer feels acceptably physical.
- 4: Scanner/printer is strong, glossy, bevelled, lit, and close to reference.
- 5: Scanner/printer matches the reference as a premium physical foreground object.

### 9. Ticket Readability

- 0: Ticket is missing.
- 1: Ticket is disconnected, clipped, or unreadable.
- 2: Ticket surface exists but boarding-pass information is mostly unreadable.
- 3: Ticket is connected and has acceptable legibility.
- 4: Ticket is readable, integrated, and close to reference.
- 5: Ticket matches the reference in physical integration, print clarity, and foreground readability.

### 10. ENTER CTA Visibility

- 0: ENTER CTA is missing.
- 1: ENTER CTA exists but is clipped or unreadable.
- 2: ENTER CTA is recognizable but weak, misplaced, or poorly integrated.
- 3: ENTER CTA is readable and integrated enough for the current stage.
- 4: ENTER CTA is strong, physically integrated, and close to reference.
- 5: ENTER CTA matches the reference in readability, glow restraint, placement, and physical integration.

### 11. Overall Premium/Cinematic Feel

- 0: Scene is missing or unrelated.
- 1: Scene feels like a basic mockup or generated placeholder.
- 2: Scene has the right idea but lacks premium cinematic fidelity.
- 3: Scene is moving in an acceptable cinematic direction.
- 4: Scene feels premium and close to the reference.
- 5: Scene matches the reference as a polished cinematic aviation render.

## Hard-Fail Conditions

Any hard fail blocks visual approval, regardless of numeric score.

- ENTER CTA is clipped, missing, or unreadable.
- Globe is not the dominant hero object.
- Scanner/printer is missing or visually unclear.
- Ticket is unreadable or disconnected from the scanner.
- Mobile framing is awkwardly cropped or overflowing.
- Route arcs are thick/noisy/neon spaghetti.
- Aircraft look like flat icons or random markers.
- Scene does not clearly resemble the supplied mobile/desktop references.

## Mobile-Specific Hard-Fail Conditions

Any mobile-specific hard fail blocks visual approval, regardless of desktop quality or total score.

- ENTER is clipped, unreadable, too low, or too high.
- Ticket is not vertical enough.
- Globe is too small or not dominant in the top half of the frame.
- Scanner/ticket relationship is unclear.
- Camera angle makes the ticket look like a tabletop card instead of a printed boarding pass.
- Mobile scene does not clearly resemble the supplied mobile reference.

## Iteration Rule

After each review, fix only the lowest-scoring visual category first. If multiple categories tie for lowest score, prioritize hard-fail categories before ordinary quality gaps. Re-render, regenerate the contact sheet, update `docs/landing/render-review-latest.md`, then score again before continuing.
