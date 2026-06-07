# jmpseat Auth Design System Style Guide

This note defines the current auth and onboarding visual system used by the
jmpseat private beta flow. It is the source of truth for login, signup, account
code confirmation, password recovery, profile setup, access hold, and airline
employee email verification surfaces.

## Canonical Surfaces

- `/login` is the canonical sign-in surface.
- `/signup` is the canonical account creation and account-code confirmation
  surface.
- `/reset-password` is the canonical account recovery surface.
- `/app/profile` is the canonical profile setup surface.
- `/app/access-hold` is the canonical access status and airline employee email
  verification surface.
- `/app/verification` is deprecated and should redirect to `/app/access-hold`.
- `/app/verification/confirm` remains as a legacy-compatible confirmation route
  for existing work-email confirmation links.

## Visual Constants

- Background: deep navy aviation scene with subdued image blending, faint radar
  arcs, and amber highlights.
- Typography: bold rounded jmpseat wordmark, uppercase amber eyebrow labels, and
  heavy white hero headings with tight negative tracking.
- Cards: white or near-white rounded cards with soft slate borders and deep
  navy shadows.
- Inputs: white input shells, slate icons, amber focus rings, consistent height,
  and the same radius across auth forms.
- Primary buttons: navy gradient fill, amber label, right arrow, bold centered
  text, and one shared height/radius.
- Secondary actions: white outline buttons or blue text links only when the
  hierarchy is clearly secondary.
- Notices: amber shield/info treatment for required or explanatory access
  states.
- Security notes: small lock icon plus muted slate text at the bottom of the
  auth card.

## Mobile Rules

- Auth screens should fit in the first viewport under normal mobile heights.
- Pages must not hard-clip content; scrolling is allowed only when content,
  browser chrome, zoom, or validation messages make it necessary.
- Use compact density tokens before reducing typography arbitrarily.
- Avoid large blank white tails below the final security note.
- Preserve touch-safe inputs and buttons even in compact layouts.

## Desktop Rules

- Auth and onboarding pages should avoid incidental scroll at standard desktop
  heights when no validation, browser zoom, or runtime error copy is present.
- Profile setup must use the shared auth density for title scale, card padding,
  field height, icon size, and form gaps; do not re-expand those values to match
  oversized mockups if they create unnecessary page scroll.
- Centered recovery cards and split login/signup cards may use different
  compositions, but their controls should still share the same button, input,
  border, focus, and card constants.
- Desktop aviation imagery should blend into the navy background instead of
  creating a hard image/card seam unless the accepted spec explicitly calls for
  a split panel.

## Deprecated Patterns

- Do not build new auth surfaces with the old dark `AuthCard` stack.
- Do not add standalone proof upload, badge upload, document upload, or proof
  review calls to action.
- Do not route normal users to `/app/verification` as a primary remedy page.
- Do not introduce page-specific button or field sizes unless a new shared
  variant is first added to `src/components/auth/auth.module.css`.

## Implementation Notes

Shared constants live on `.loginPage` in
`src/components/auth/auth.module.css`. New auth pages should reuse those tokens
or add named variants there instead of copying raw dimensions.
