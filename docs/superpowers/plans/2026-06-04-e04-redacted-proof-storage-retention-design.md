# E04 Redacted Proof Storage Retention Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lock the redacted proof storage, privacy, retention, and access policy before any upload, Storage bucket, or reviewer implementation begins.

**Architecture:** Keep this slice docs-only and aligned to the existing verification schema from E04-T02. The design should define a future private Storage model, bounded metadata rules, and retention/deletion expectations without creating buckets, policies, migrations, or UI.

**Tech Stack:** Markdown docs, existing verification schema docs, Supabase Storage design constraints, verification policy docs

---

### Task 1: Write the storage/retention design artifact

**Files:**
- Create: `docs/epochs/epoch-04-redacted-proof-storage-retention-design.md`

- [ ] **Step 1: Draft the design doc**

Cover:
- purpose and scope
- bucket strategy
- path convention
- file types and size limits
- redaction requirements and acknowledgement
- metadata rules
- retention and deletion policy
- reviewer access model
- future Storage/RLS policy expectations
- resubmission triggers
- security-event implications
- privacy/legal positioning
- implementation gates
- open questions
- impact on later Epoch 04 tickets

### Task 2: Update ticket tracking docs

**Files:**
- Modify: `docs/epochs/epoch-04-worker-verification-foundation-tickets.md`
- Modify: `docs/BUILD_TICKETS.md`

- [ ] **Step 1: Update Epoch 04 ticket pack**

Mark `E04-T04` complete for design and link the new design artifact.

- [ ] **Step 2: Update build-ticket index**

Add the new design doc to the supplemental Epoch 04 links.

### Task 3: Validate docs-only scope and commit

**Files:**
- Verify: `docs/epochs/epoch-04-redacted-proof-storage-retention-design.md`
- Verify: `docs/epochs/epoch-04-worker-verification-foundation-tickets.md`
- Verify: `docs/BUILD_TICKETS.md`

- [ ] **Step 1: Run docs-only validation**

Run:
- `git diff --stat`
- `git diff -- docs/`
- check whether markdown lint exists in `package.json`

Expected:
- docs-only diff
- no code/schema changes

- [ ] **Step 2: Commit**

Run:
`git add docs/`

Commit:
`git commit -m "docs: add redacted proof storage retention design"`
