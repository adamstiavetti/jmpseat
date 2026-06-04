# Glass Card Second Transition Design

## Goal
Integrate the `two_piece_cut_glass_card_FFC56F` asset into the latter portion of the second transition on the jmpseat live globe waitlist route so it rises from below frame, settles horizontally facing camera with the smaller piece on screen-left, and receives the hero aircraft through the center cut as the next journey object.

## Scope
This change affects only the live globe waitlist scene choreography on `/lab/live-globe-proof`. The glass card is a 3D scene object inside the second-page phase. It does not replace the second background/environment.

## Desired motion
1. The glass remains hidden during hero/early transition.
2. During the latter part of the second transition, once the hero aircraft is approaching its final handoff position, the glass rises from below the frame.
3. The card rotates/settles into a flat horizontal presentation with the glass surface facing the screen.
4. The split must read correctly in composition, with the smaller cut section on the left side.
5. The hero aircraft route is adjusted so the aircraft enters directly into the card’s center cut around the lower-middle of the object.
6. The card remains on screen as the next use-journey object after the handoff.

## Technical approach
1. Load the GLB into the existing `LiveGlobeCanvas` scene rather than a second renderer/canvas.
2. Treat the card as its own staged scene group with:
   - base transform
   - transition rise/settle transform
   - optional glow/refraction material tuning only if required for scene matching
3. Drive the card reveal from the existing chapter/handoff progress range rather than a new independent timeline.
4. Re-target the hero aircraft end path by updating the launch target / free-flight handoff so the aircraft enters the split cleanly.
5. Keep all existing background, globe, route, and second-page environment logic intact outside the new choreography.

## Constraints
- No reduction in globe/transition quality.
- No extra renderer/canvas.
- No detached overlay effect.
- The motion must feel continuous with the current premium transition.
- Existing interrupted-scroll / auto-complete plane behavior must remain intact.

## Verification
1. Build/typecheck must pass.
2. The glass must only appear in the latter second-transition phase.
3. The card must settle horizontal, facing screen, smaller piece left.
4. The plane must enter the split without clipping or relaunch artifacts.
5. The card must remain on screen as the next phase object.
