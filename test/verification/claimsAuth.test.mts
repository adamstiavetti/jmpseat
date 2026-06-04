import test from "node:test";
import assert from "node:assert/strict";

import {
  buildAirlineRoomRequirements,
  buildBaseAreaRequirements,
  buildBroadVerifiedWorkerRequirements,
  buildRoleAreaRequirements,
  evaluateClaimAuthorization,
} from "../../src/lib/verification/claimsAuth.ts";

const NOW_ISO = "2026-06-04T19:00:00.000Z";

test("approved airline_worker satisfies the broad verified-worker requirement", () => {
  const result = evaluateClaimAuthorization({
    requirements: buildBroadVerifiedWorkerRequirements(),
    claims: [
      {
        claim_type: "airline_worker",
        claim_value: null,
        status: "approved",
        expires_at: "2026-12-01T00:00:00.000Z",
        revoked_at: null,
      },
    ],
    nowIso: NOW_ISO,
  });

  assert.deepEqual(result, {
    allowed: true,
    matchedRequirements: [{ claimType: "airline_worker" }],
    missingRequirements: [],
    denyReasons: [],
  });
});

test("pending, rejected, revoked, and expired claims do not satisfy requirements", () => {
  const result = evaluateClaimAuthorization({
    requirements: buildBroadVerifiedWorkerRequirements(),
    claims: [
      {
        claim_type: "airline_worker",
        claim_value: null,
        status: "pending",
        expires_at: null,
        revoked_at: null,
      },
      {
        claim_type: "airline_worker",
        claim_value: null,
        status: "rejected",
        expires_at: null,
        revoked_at: null,
      },
      {
        claim_type: "airline_worker",
        claim_value: null,
        status: "approved",
        expires_at: "2026-01-01T00:00:00.000Z",
        revoked_at: null,
      },
      {
        claim_type: "airline_worker",
        claim_value: null,
        status: "approved",
        expires_at: "2026-12-01T00:00:00.000Z",
        revoked_at: "2026-06-01T00:00:00.000Z",
      },
    ],
    nowIso: NOW_ISO,
  });

  assert.equal(result.allowed, false);
  assert.deepEqual(result.missingRequirements, [{ claimType: "airline_worker" }]);
  assert.match(result.denyReasons.join(" "), /missing approved active airline_worker claim/i);
});

test("airline-specific requirements need both broad worker and airline claims", () => {
  const result = evaluateClaimAuthorization({
    requirements: buildAirlineRoomRequirements("United"),
    claims: [
      {
        claim_type: "airline_worker",
        claim_value: null,
        status: "approved",
        expires_at: null,
        revoked_at: null,
      },
      {
        claim_type: "airline",
        claim_value: "uNiTeD",
        status: "approved",
        expires_at: null,
        revoked_at: null,
      },
    ],
    nowIso: NOW_ISO,
  });

  assert.equal(result.allowed, true);
  assert.deepEqual(result.matchedRequirements, [
    { claimType: "airline_worker" },
    { claimType: "airline", claimValue: "United" },
  ]);
});

test("role and base claims are not inferred from airline_worker or airline approval alone", () => {
  const roleResult = evaluateClaimAuthorization({
    requirements: buildRoleAreaRequirements("Pilot"),
    claims: [
      {
        claim_type: "airline_worker",
        claim_value: null,
        status: "approved",
        expires_at: null,
        revoked_at: null,
      },
      {
        claim_type: "airline",
        claim_value: "Test Air",
        status: "approved",
        expires_at: null,
        revoked_at: null,
      },
    ],
    nowIso: NOW_ISO,
  });

  const baseResult = evaluateClaimAuthorization({
    requirements: buildBaseAreaRequirements("DEN"),
    claims: [
      {
        claim_type: "airline_worker",
        claim_value: null,
        status: "approved",
        expires_at: null,
        revoked_at: null,
      },
      {
        claim_type: "airline",
        claim_value: "Test Air",
        status: "approved",
        expires_at: null,
        revoked_at: null,
      },
    ],
    nowIso: NOW_ISO,
  });

  assert.equal(roleResult.allowed, false);
  assert.deepEqual(roleResult.missingRequirements, [
    { claimType: "role", claimValue: "Pilot" },
  ]);

  assert.equal(baseResult.allowed, false);
  assert.deepEqual(baseResult.missingRequirements, [
    { claimType: "base", claimValue: "DEN" },
  ]);
});

test("self-declared profile-style fields are not accepted as verified claims", () => {
  const result = evaluateClaimAuthorization({
    requirements: buildAirlineRoomRequirements("Test Air"),
    claims: [
      {
        claim_type: "claimed_airline",
        claim_value: "Test Air",
        status: "approved",
        expires_at: null,
        revoked_at: null,
      },
      {
        claim_type: "claimed_role",
        claim_value: "Pilot",
        status: "approved",
        expires_at: null,
        revoked_at: null,
      },
    ],
    nowIso: NOW_ISO,
  });

  assert.equal(result.allowed, false);
  assert.match(result.denyReasons.join(" "), /airline_worker/i);
});

test("structured deny reasons explain the first missing requirement conservatively", () => {
  const result = evaluateClaimAuthorization({
    requirements: [
      { claimType: "airline_worker" },
      { claimType: "airline", claimValue: "Delta" },
    ],
    claims: [
      {
        claim_type: "airline_worker",
        claim_value: null,
        status: "approved",
        expires_at: null,
        revoked_at: null,
      },
    ],
    nowIso: NOW_ISO,
  });

  assert.deepEqual(result.missingRequirements, [
    { claimType: "airline", claimValue: "Delta" },
  ]);
  assert.equal(result.denyReasons.length, 1);
  assert.match(result.denyReasons[0] ?? "", /missing approved active airline claim/i);
});

test("claims-auth helper stays bounded to verification claims and no room or board implementation", async () => {
  const { readFileSync } = await import("node:fs");

  const source = readFileSync(
    new URL("../../src/lib/verification/claimsAuth.ts", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(
    source,
    /base board|layover board|post comment|community feed|search index|supabase storage|upload proof/i,
  );
});
