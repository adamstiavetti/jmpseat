# FBMVP Remaining Functional Backlog

Date: 2026-06-11

## Purpose

This docs-only backlog captures what remains from the current DFW Hub +
Channels foundation checkpoint to a narrow private-beta MVP.

This record does not edit app code, edit migrations, edit tests, mutate runtime
data, apply migrations, run broad Supabase database push, deploy, stage files,
or commit.

## Current Checkpoint

- Repo checkpoint: `c2bbd73 docs: record dfw hub channels checkpoint`
- Active lane: `05B / First-Base MVP`
- Current surface: `DFW Hub`
- Current functional foundation: Channels metadata route plus runtime RPC
- Current route foundation: `/app/hubs/dfw/channels`
- Current runtime function: `public.list_open_hub_channels(p_base_code text)`
- Current channel data model: `hub_channel` child rows in `public.boards`
- Authenticated browser smoke for `/app/hubs/dfw/channels` remains pending.

T25B and T26A are implemented, committed, runtime-applied, and documented. The
current gap is not whether Channels metadata exists; the gap is completing the
DFW Hub utility loop across the four MVP pillars below.

## Narrow DFW MVP Pillars

Channels are not the entire MVP. The narrow DFW Hub MVP should include four
utility pillars:

1. DFW Today
2. Base
3. Layover
4. Channels

Each pillar should start with a lightweight functional baseline. DFW
Today/Base/Layover should not require live integrations, scraping, or large new
systems for MVP.

## DFW Today

Purpose:

- current curated DFW utility snapshot
- not live operational data
- not scraped airport or airline data

MVP baseline:

- curated/admin-managed cards or static editorial sections
- pinned useful item or small set of useful items
- high-signal updates
- clear timestamp/source framing if updates are manually maintained

Out of scope:

- live airport operations
- security-sensitive procedures
- airline portal scraping
- schedule scraping
- operational claims that require live verification

## Base

Purpose:

- DFW-based worker utility guide

MVP baseline:

- base orientation
- commuting/parking high-level information
- terminal/ground logistics basics
- safe FAQs
- links into relevant Channels

Out of scope:

- confidential company policies
- restricted procedures
- exact sensitive access details
- employer-private documents

## Layover

Purpose:

- useful local guidance for aviation workers laying over around DFW

MVP baseline:

- food/coffee
- transport basics
- gym/walkable options
- safe local recommendations
- crew-friendly notes

Out of scope:

- exact crew hotel exposure
- live crew location
- hotel-specific operational patterns
- unsafe meetups or dating-style behavior

## Channels

Purpose:

- verified-worker discussion around focused topics

MVP baseline:

- channel overview
- channel thread list
- channel post detail
- channel composer inside selected channel
- comments
- reporting
- moderation review integration

Out of scope:

- generic social feed
- reactions/saves/search/media until later
- `Request a Channel` workflow until later

## Recommended Sequencing From Here

Recommended order:

1. Authenticated browser smoke for `/app/hubs/dfw/channels`.
2. Stale test cleanup:
   - `test/community/hubChannelSeeds.test.mts`
   - `test/community/boardPostActions.test.mts`
   - `test/community/boardPostDetail.test.mts`
3. `T26B` channel thread-list read foundation.
4. `T26C` channel post detail.
5. `T26D` channel composer.
6. `T26E` channel comments/reporting/moderation integration.
7. DFW Today MVP baseline.
8. Base MVP baseline.
9. Layover MVP baseline.
10. Private-beta policy/ops readiness.
11. Route-by-route UI/UX polish.

DFW Today, Base, and Layover can be scoped as lightweight functional baselines.
They should not require live integrations or scraping for MVP.

## UI/UX Rule

Do not broadly redesign routes before they are functional.

A route is ready for UI/UX polish when:

- the route exists
- data/source behavior is real or intentionally static
- access control is correct
- the route has been browser-smoked or explicitly deferred
- route status is documented

## Deferred Work

Deferred until after the narrow DFW Hub MVP loop is functional unless
explicitly rescoped:

- search
- saves
- reactions/helpful marks
- `Request a Channel` workflow
- NonRev Deals
- AI/Jumpseat utility
- media/photo uploads
- live weather/traffic/ops integrations
- multi-airport expansion
- native mobile/Expo
- app-store work
- full marketplace/payments

## Safety Boundaries

The remaining MVP work must preserve these boundaries:

- no airline portal login
- no schedule scraping
- no roster/calendar integrations
- no public crew tracking
- no dating/swiping behavior
- no exact public crew hotel exposure
- no passenger private information
- no airport/security-sensitive procedures
- no company-confidential content
- no AI final verification
- no AI final moderation/bans
- no public proof exposure

## Acceptance Criteria For This Backlog State

- DFW Hub MVP is understood as four utility pillars, not Channels alone.
- Channels completion remains sequenced before composer-heavy work.
- DFW Today/Base/Layover remain lightweight MVP baselines, not live-data
  integrations.
- UI/UX polish follows route functionality and smoke status.
- Deferred V1 features remain out of the narrow private-beta MVP path.
