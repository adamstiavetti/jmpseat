# FBMVP-T23B Static Wireframe Prototype Manual Review

Date: 2026-06-11

Status: approved with future UI polish

Reviewed route: `/app/admin/design/dfw-hub-wireframes`

Reviewed host: `beta.jmpseat.com`

Commit reviewed: `07ebf7b fix: polish hub wireframe prototype`

## Scope

This note records manual visual review of the protected static Hub wireframe
prototype route. It is a docs-only record. It does not implement app code,
change the prototype route, apply migrations, mutate runtime data, run a broad
Supabase push, deploy, or change Vercel settings.

## Access And Data Posture

The route remained protected/admin-only from the product navigation
perspective during review. It was reviewed in an authenticated
admin/reviewer/operator-capable beta session.

The prototype uses fake/static review content only. No real UGC, board posts,
comments, reports, author IDs, reporter identity, signed URLs, private storage
paths, or runtime data were observed in the prototype review.

This record should not be associated with any runtime mutation, migration,
broad database push, or deployment action.

## Product Hierarchy Decision

The manual review approved the intended product hierarchy:

- Home points users toward `DFW Hub`.
- `DFW Hub` overview is section-based, not raw-feed-based.
- `DFW Today`, Base, Layover, Channels, and Recent Useful Threads are the main
  Hub surfaces.
- Channels overview is browse-first.
- Request a Channel is secondary on the Channels overview.
- Start a Thread belongs inside a selected Channel detail page.
- Thread detail centers reading, replying, and reporting.

## Manual Review Result

Decision: approved with future UI polish.

No issue was found that blocks future functionality or requires another
prototype patch before proceeding. The remaining issues are visual polish and
production UI implementation details, not prototype blockers.

Do not keep polishing the static prototype route before moving on.

## Future UI Polish Notes

These items should be handled during real implementation or a scoped product
UI polish pass. They are not blockers for T23B closeout.

- The static prototype route still feels like a review gallery because
  multiple screens are stacked vertically. Real implementation should use
  actual routes/screens rather than a gallery of mock screens.
- The DFW hero image/visual treatment remains placeholder-like and should be
  improved during real implementation.
- Header and navigation icons are acceptable for the prototype but are not
  final app-quality.
- Channel and thread rows are directionally right but need production-level
  spacing, metadata, and tap affordance polish.
- `Sample threads` near the Replies heading should be refined later, likely to
  Recent, reply count, or omitted.
- Safari/mobile browser chrome can obscure lower content during review. This
  is not a product issue.
- Do not copy the prototype CSS directly as final production styling without
  cleanup.

## Recommended Next Step

Move from prototype review into implementation planning. The next work should
be a narrow implementation ticket, not more prototype polishing.

Likely next ticket: implement the real Home / DFW Hub visual refresh first,
preserving existing access gates and using existing safe data paths.

Do not start DB/RPC-backed Channels until the implementation sequence
explicitly scopes it.

## Non-Goals

T23B manual review did not approve or implement:

- free user-created channels
- DB/RPC-backed Channels
- live weather or traffic integrations
- real search, saves, reactions, media, or photo uploads
- database table or RPC renames
- changes to access, moderation, RLS, admin, or public-domain protections
