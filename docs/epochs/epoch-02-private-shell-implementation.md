# Epoch 02 Private Shell Implementation

## Purpose

This implementation note records the implemented private shell behavior for the app repo during Epoch 02.

## Route Implemented

- `/app`
- `/app/home`
- `/app/base`
- `/app/layovers`
- `/app/rooms`
- `/app/profile`
- `/app/verification`
- `/app/admin`

## What Was Implemented

- A locked private shell landing state for `/app`
- Locked private child-route placeholder behavior for future private surfaces under `/app`
- A mobile-first placeholder shell with:
  - Skybyrd branding
  - disabled future-surface navigation labels
  - an honest "not open yet" message
  - explicit notice that verification and login belong to later epochs
- A small shared data module for placeholder copy and navigation labels

## What Is Intentionally Locked Or Non-Functional

- No login
- No account state
- No session state
- No verification flow
- No Base Boards, Layover Boards, Verified Rooms, Profile, Verification, or Admin functionality
- No links to live feature pages
- No user-specific or server-derived data

The visible navigation labels are placeholders only and do not indicate live product capability.

## Why This Is Not Real Security

This slice is a client-rendered placeholder surface only. It does not enforce:

- auth
- session checks
- authorization
- invite-only beta access
- verification gates

The locked messaging is intentional product scaffolding, not a security boundary.

## What Future Epochs Own

- Epoch 03: auth, account state, beta-access gating, and real private entry control
- Epoch 04: verification state and workflows
- Epoch 05: boards, rooms, and community surfaces
- Epoch 06: moderation, reporting, and admin operations

## Docs Impact

- Added this local implementation note so the app repo records what `/app` currently does
- Kept the implementation aligned with the planning docs in `jmpseat-main-docs`
