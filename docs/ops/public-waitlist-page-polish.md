# Public Waitlist Page Polish

Date: 2026-06-07
Status: Implementation draft, not deployed

## Summary

The public landing page now implements first-party waitlist capture in jmpseat.
The page captures email before asking optional product-shaping questions, keeps
the public surface separate from private beta auth, and removes the public Beta
Access entry from `/`.

This task does not cut over root `jmpseat.com`, deploy, change DNS, change
Vercel settings, change Supabase runtime settings, or run `supabase db push`.

## Flow

1. Visitor lands on the public waitlist page.
2. Visitor enters email above the `join waitlist` CTA.
3. Email is persisted through the server-side waitlist action.
4. Duplicate email submission is idempotent and returns the same friendly
   success state.
5. After email capture succeeds, the page shows:
   - `You're on the waitlist.`
   - `Help us prioritize your invite and shape jmpseat.`
   - optional product-shaping questions
6. Visitor can submit optional answers or skip.

Raw email is not placed in URLs. Optional answers are attached through a
short-lived HTTP-only cookie containing an opaque survey token.

## Persistence

One migration adds:

- `public.waitlist_signups`
- `public.waitlist_survey_responses`
- `public.submit_waitlist_signup(...)`
- `public.submit_waitlist_survey_response(...)`

Tables have RLS enabled and public table reads are not exposed. Public
email submission happens through a bounded, idempotent `SECURITY DEFINER` RPC,
not direct client table access.

The optional survey write path is server-owned. Public clients cannot execute
the survey persistence RPC directly; the page submits through a server action
that uses the trusted server-side Supabase path. The survey RPC also validates
allowed single-select values, allowed multi-select values, maximum selection
counts, empty-string normalization, free-text length bounds, and blocked
sensitive-content categories before saving.

## Optional Survey

The optional questions derive from
`docs/ops/waitlist-question-research-selection.md` and cover:

- aviation connection
- base or airport community priority
- first-usefulness drivers
- biggest general pain point
- current tools or communities
- private verification comfort
- beta-shaping willingness
- discovery source
- privacy or trust concern

All follow-up questions are optional. The survey does not grant beta access,
airline employee email verification, role/base claims, restricted-board claims,
or operator access.

Survey persistence is defense-in-depth validated in both the server action and
the database so unsupported options, excessive feature selections, and
sensitive free-text categories are rejected instead of silently stored.

## Safety Boundaries

The public waitlist does not ask for employee IDs, badge/proof uploads,
documents, schedules, exact hotel information, portal credentials, passenger
information, live location, invite codes, tokens, or confidential company
information.

The page includes independence copy: jmpseat is independent and is not sponsored
by or affiliated with any airline.

## Deferred Work

- Runtime migration apply.
- Runtime waitlist submission validation.
- Public root-domain cutover.
- Waitlist funnel metrics events.
- Operator/admin waitlist metrics dashboard.
- Any production deploy.
