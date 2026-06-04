import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  REVIEW_ACTIONS,
  REVIEWER_SCOPE_STATUSES,
  REVIEWER_SCOPE_TYPES,
  filterReviewQueueByScopes,
  planVerificationReviewDecision,
} from "../../src/lib/verification/review.ts";

test("reviewer scope and review-action constants stay bounded for E04-T07", () => {
  assert.deepEqual(REVIEWER_SCOPE_TYPES, ["global", "airline", "role", "base"]);
  assert.deepEqual(REVIEWER_SCOPE_STATUSES, ["active", "paused", "revoked"]);
  assert.deepEqual(REVIEW_ACTIONS, ["approve", "reject", "request_resubmission"]);
});

test("review queue filtering only exposes requests allowed by active reviewer scopes", () => {
  const queue = [
    {
      request: { id: "req-global", user_id: "user-1" },
      evidence: [{ metadata: { airline: "Test Air" } }],
    },
    {
      request: { id: "req-other", user_id: "user-2" },
      evidence: [{ metadata: { airline: "Other Air" } }],
    },
  ];

  assert.deepEqual(
    filterReviewQueueByScopes({
      queue,
      scopes: [{ scope_type: "global", scope_value: null, status: "active" }],
    }).map((entry) => entry.request.id),
    ["req-global", "req-other"],
  );

  assert.deepEqual(
    filterReviewQueueByScopes({
      queue,
      scopes: [{ scope_type: "airline", scope_value: "Test Air", status: "active" }],
    }).map((entry) => entry.request.id),
    ["req-global"],
  );
});

test("review planning blocks unauthorized and self-review attempts", () => {
  const request = {
    id: "req-1",
    user_id: "reviewer-1",
    method: "work_email",
    status: "submitted",
    requested_claim_types: ["airline_worker", "airline"],
  };

  assert.deepEqual(
    planVerificationReviewDecision({
      reviewerId: "reviewer-1",
      reviewerScopes: [],
      request,
      evidence: [],
      action: "approve",
      nowIso: "2026-06-04T18:00:00.000Z",
    }),
    {
      kind: "unauthorized",
      message: "You are not authorized to review verification requests.",
    },
  );

  assert.deepEqual(
    planVerificationReviewDecision({
      reviewerId: "reviewer-1",
      reviewerScopes: [{ scope_type: "global", scope_value: null, status: "active" }],
      request,
      evidence: [],
      action: "approve",
      nowIso: "2026-06-04T18:00:00.000Z",
    }),
    {
      kind: "self_review_blocked",
      message: "Reviewers cannot approve or reject their own verification requests.",
    },
  );
});

test("approve issues only supported work-email claims and never role/base claims", () => {
  const result = planVerificationReviewDecision({
    reviewerId: "reviewer-9",
    reviewerScopes: [{ scope_type: "global", scope_value: null, status: "active" }],
    request: {
      id: "req-2",
      user_id: "user-2",
      method: "work_email",
      status: "submitted",
      requested_claim_types: ["airline_worker", "airline", "role", "base"],
    },
    evidence: [
      {
        evidence_type: "work_email",
        metadata: {
          airline: "Test Air",
          support_result: "supported_domain",
          verification_method: "work_email",
        },
      },
    ],
    action: "approve",
    nowIso: "2026-06-04T18:00:00.000Z",
  });

  assert.equal(result.kind, "apply_review");

  if (result.kind !== "apply_review") {
    return;
  }

  assert.deepEqual(result.requestUpdate, {
    status: "approved",
    reviewed_by: "reviewer-9",
    reviewed_at: "2026-06-04T18:00:00.000Z",
  });

  assert.deepEqual(result.reviewActionInsert, {
    action: "approve",
    reviewer_id: "reviewer-9",
    notes: null,
  });

  assert.deepEqual(result.claimsToInsert, [
    {
      user_id: "user-2",
      request_id: "req-2",
      claim_type: "airline_worker",
      claim_value: null,
      status: "approved",
      verification_method: "work_email",
      approved_by: "reviewer-9",
      approved_at: "2026-06-04T18:00:00.000Z",
      expires_at: "2027-06-04T18:00:00.000Z",
      reason: null,
    },
    {
      user_id: "user-2",
      request_id: "req-2",
      claim_type: "airline",
      claim_value: "Test Air",
      status: "approved",
      verification_method: "work_email",
      approved_by: "reviewer-9",
      approved_at: "2026-06-04T18:00:00.000Z",
      expires_at: "2026-12-01T18:00:00.000Z",
      reason: null,
    },
  ]);
});

test("reject and request-resubmission update request state without issuing claims", () => {
  const shared = {
    reviewerId: "reviewer-9",
    reviewerScopes: [{ scope_type: "global", scope_value: null, status: "active" }],
    request: {
      id: "req-3",
      user_id: "user-3",
      method: "work_email",
      status: "submitted",
      requested_claim_types: ["airline_worker"],
    },
    evidence: [],
    nowIso: "2026-06-04T18:00:00.000Z",
  } as const;

  const rejectPlan = planVerificationReviewDecision({
    ...shared,
    action: "reject",
  });

  assert.equal(rejectPlan.kind, "apply_review");
  if (rejectPlan.kind === "apply_review") {
    assert.equal(rejectPlan.requestUpdate.status, "rejected");
    assert.deepEqual(rejectPlan.claimsToInsert, []);
  }

  const resubmissionPlan = planVerificationReviewDecision({
    ...shared,
    action: "request_resubmission",
  });

  assert.equal(resubmissionPlan.kind, "apply_review");
  if (resubmissionPlan.kind === "apply_review") {
    assert.equal(resubmissionPlan.requestUpdate.status, "needs_resubmission");
    assert.deepEqual(resubmissionPlan.claimsToInsert, []);
  }
});

test("approve is blocked when work-email evidence cannot support any issuable claims", () => {
  assert.deepEqual(
    planVerificationReviewDecision({
      reviewerId: "reviewer-9",
      reviewerScopes: [{ scope_type: "global", scope_value: null, status: "active" }],
      request: {
        id: "req-4",
        user_id: "user-4",
        method: "work_email",
        status: "submitted",
        requested_claim_types: ["role", "base"],
      },
      evidence: [
        {
          evidence_type: "work_email",
          metadata: {
            airline: "Test Air",
            support_result: "supported_domain",
            verification_method: "work_email",
          },
        },
      ],
      action: "approve",
      nowIso: "2026-06-04T18:00:00.000Z",
    }),
    {
      kind: "unsupported_evidence",
      message:
        "This verification request does not contain enough approved evidence metadata to issue any supported claims.",
    },
  );
});

test("review migration adds reviewer scopes, RLS, and no-self-review reviewer policies", () => {
  const sql = readFileSync(
    new URL("../../supabase/migrations/20260604165541_create_verification_reviewer_scopes.sql", import.meta.url),
    "utf8",
  );

  assert.match(sql, /create table public\.verification_reviewer_scopes/i);
  assert.match(sql, /alter table public\.verification_reviewer_scopes enable row level security/i);
  assert.match(sql, /users can read their own reviewer scopes/i);
  assert.match(sql, /reviewers can read verification requests/i);
  assert.match(sql, /reviewers can update verification requests/i);
  assert.match(sql, /reviewers can read verification evidence metadata/i);
  assert.match(sql, /reviewers can read verification claims/i);
  assert.match(sql, /reviewers can insert approved verification claims/i);
  assert.match(sql, /reviewers can read verification review actions/i);
  assert.match(sql, /reviewers can create verification review actions/i);
  assert.match(sql, /create or replace function public\.has_matching_verification_reviewer_scope/i);
  assert.match(sql, /create or replace function public\.can_review_verification_request/i);
  assert.match(sql, /public\.can_review_verification_request\(auth\.uid\(\), user_id, id\)/i);
  assert.match(sql, /metadata ->> 'airline'/i);
  assert.doesNotMatch(sql, /with check \(\s+and reviewer_id = auth\.uid\(\)/i);
  assert.doesNotMatch(sql, /public read|for select using \(true\)|for all/i);
  assert.doesNotMatch(
    sql,
    /create policy "reviewers can read verification requests"[\s\S]*using \(public\.has_active_verification_reviewer_scope\(auth\.uid\(\)\)\)/i,
  );
});

test("human review foundation source does not add storage, upload, ai, or employer-system lookup", () => {
  const reviewSource = readFileSync(
    new URL("../../src/lib/verification/review.ts", import.meta.url),
    "utf8",
  );
  const routeSource = readFileSync(
    new URL("../../app/app/admin/verification/page.tsx", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(
    reviewSource,
    /supabase storage|type="file"|upload proof|openai|ai pre-check|employer system lookup/i,
  );
  assert.match(routeSource, /verification review queue/i);
  assert.match(routeSource, /must not use employer systems/i);
  assert.doesNotMatch(
    routeSource,
    /type="file"|supabase storage|full admin dashboard|user management|beta access admin/i,
  );
});
