# Epoch 02 Accessibility Baseline

## Purpose

This note records the `E02-T08` accessibility baseline audit for the private shell and locked placeholder routes under `/app`.

## Audit Verdict

The current private shell implementation satisfies the Epoch 02 accessibility baseline.

This is a shell-level baseline only. It does not certify later auth, form, moderation, or content-surface accessibility.

## What Meets The Baseline

### Landmarks And Structure

- The private shell uses clear landmark structure:
  - `main`
  - `header`
  - `nav`
  - `section`
  - `footer`
- The main placeholder message is associated with a single `h1`, which gives each private route a clear page-level heading.

### Heading Hierarchy

- The page-level route message uses a single `h1`.
- Supporting copy is grouped beneath the heading in a consistent reading order.
- The shell avoids decorative heading jumps that would confuse screen-reader navigation.

### Placeholder Navigation

- The navigation is presented as a list of placeholder cards, not as fake links or buttons.
- The cards do not pretend to be interactive controls.
- Disabled/current placeholder status is conveyed in text:
  - `Coming later`
  - `Current placeholder`
- Current placeholder state is reinforced with `aria-label` messaging so assistive technology can distinguish the current route card from future-only cards.

### Focus And Keyboard Expectations

- The shell does not introduce fake interactive controls that would mislead keyboard users.
- Because the placeholder navigation is intentionally non-interactive, there is no keyboard trap or broken tab sequence inside the nav area.
- The shell keeps focusable behavior limited to real controls that exist elsewhere in the app, not placeholder-only cards.

### Locked-State Messaging

- The copy is understandable without relying on visuals alone.
- The copy states that access is not open yet.
- The copy states that verification and login come later.
- The copy explicitly states that the placeholder is not a real security boundary or sign-in system.

### Visual Baseline

- Private shell text and status surfaces use light-on-dark contrast that is reasonable for the current shell scope.
- Current placeholder state is differentiated by both text and visual treatment rather than color alone.

## What Remains For Later Epochs

Later epochs still own:

- auth and sign-in accessibility
- form labeling and validation accessibility
- moderation/admin workflow accessibility
- feature-specific keyboard flows
- richer route-state announcements if interactive navigation is introduced

## Docs Impact

- Added this note so the app repo records the shell-level accessibility baseline rather than leaving it only in code review or chat.
- This note is intentionally narrow and scoped to Epoch 02 private shell behavior.
