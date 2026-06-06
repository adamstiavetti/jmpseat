import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  getCurrentAirlineEmailAccessState,
} from "../../src/lib/verification/airlineEmailAccess.ts";

const NOW_ISO = "2026-06-06T12:00:00.000Z";

const ACTIVE_DOMAINS = [
  { domain: "airline.test", airline: "Test Air", status: "active" },
  { domain: "disabled.test", airline: "Disabled Air", status: "disabled" },
];

test("no verification data resolves to not_verified without granting airline email access", () => {
  assert.deepEqual(
    getCurrentAirlineEmailAccessState({
      approvedDomains: ACTIVE_DOMAINS,
      requests: [],
      evidence: [],
      claims: [],
      nowIso: NOW_ISO,
    }),
    {
      status: "not_verified",
      airlineEmailVerified: false,
      domain: null,
      airline: null,
      verifiedAt: null,
      source: "unknown",
      messageKey: "airline_email_not_verified",
    },
  );
});

test("unsupported work-email evidence resolves to unsupported_domain without leaking a full email", () => {
  assert.deepEqual(
    getCurrentAirlineEmailAccessState({
      approvedDomains: ACTIVE_DOMAINS,
      requests: [
        {
          id: "request-1",
          method: "work_email",
          status: "submitted",
          submitted_at: "2026-06-06T10:00:00.000Z",
        },
      ],
      evidence: [
        {
          request_id: "request-1",
          evidence_type: "work_email",
          status: "submitted",
          uploaded_at: "2026-06-06T10:01:00.000Z",
          metadata: {
            email_domain: "unknown.test",
            support_result: "unsupported_domain",
            verification_method: "work_email",
            raw_email: "crew.member@unknown.test",
          },
        },
      ],
      claims: [],
      nowIso: NOW_ISO,
    }),
    {
      status: "unsupported_domain",
      airlineEmailVerified: false,
      domain: "unknown.test",
      airline: null,
      verifiedAt: null,
      source: "work_email",
      messageKey: "airline_email_unsupported_domain",
    },
  );
});

test("approved work-email request with active approved domain resolves to verified", () => {
  assert.deepEqual(
    getCurrentAirlineEmailAccessState({
      approvedDomains: ACTIVE_DOMAINS,
      requests: [
        {
          id: "request-1",
          method: "work_email",
          status: "approved",
          submitted_at: "2026-06-06T10:00:00.000Z",
          reviewed_at: "2026-06-06T10:30:00.000Z",
        },
      ],
      evidence: [
        {
          request_id: "request-1",
          evidence_type: "work_email",
          status: "accepted",
          uploaded_at: "2026-06-06T10:01:00.000Z",
          metadata: {
            email_domain: "airline.test",
            airline: "Untrusted Metadata Air",
            support_result: "supported_domain",
            verification_method: "work_email",
          },
        },
      ],
      claims: [],
      nowIso: NOW_ISO,
    }),
    {
      status: "verified",
      airlineEmailVerified: true,
      domain: "airline.test",
      airline: "Test Air",
      verifiedAt: "2026-06-06T10:30:00.000Z",
      source: "work_email",
      messageKey: "airline_email_verified",
    },
  );
});

test("disabled approved domain and expired or revoked work-email provenance do not verify access", () => {
  assert.equal(
    getCurrentAirlineEmailAccessState({
      approvedDomains: ACTIVE_DOMAINS,
      requests: [
        {
          id: "request-1",
          method: "work_email",
          status: "approved",
          reviewed_at: "2026-06-06T10:30:00.000Z",
        },
      ],
      evidence: [
        {
          request_id: "request-1",
          evidence_type: "work_email",
          status: "accepted",
          uploaded_at: "2026-06-06T10:01:00.000Z",
          metadata: {
            email_domain: "disabled.test",
            support_result: "supported_domain",
            verification_method: "work_email",
          },
        },
      ],
      claims: [],
      nowIso: NOW_ISO,
    }).status,
    "unsupported_domain",
  );

  assert.equal(
    getCurrentAirlineEmailAccessState({
      approvedDomains: ACTIVE_DOMAINS,
      requests: [],
      evidence: [
        {
          request_id: "request-2",
          evidence_type: "work_email",
          status: "accepted",
          metadata: {
            email_domain: "airline.test",
            support_result: "supported_domain",
            verification_method: "work_email",
          },
        },
      ],
      claims: [
        {
          request_id: "request-2",
          claim_type: "airline_worker",
          claim_value: null,
          status: "approved",
          verification_method: "work_email",
          approved_at: "2026-01-01T00:00:00.000Z",
          expires_at: "2026-02-01T00:00:00.000Z",
          revoked_at: null,
        },
      ],
      nowIso: NOW_ISO,
    }).status,
    "expired",
  );

  assert.equal(
    getCurrentAirlineEmailAccessState({
      approvedDomains: ACTIVE_DOMAINS,
      requests: [],
      evidence: [
        {
          request_id: "request-3",
          evidence_type: "work_email",
          status: "accepted",
          metadata: {
            email_domain: "airline.test",
            support_result: "supported_domain",
            verification_method: "work_email",
          },
        },
      ],
      claims: [
        {
          request_id: "request-3",
          claim_type: "airline_worker",
          claim_value: null,
          status: "approved",
          verification_method: "work_email",
          approved_at: "2026-01-01T00:00:00.000Z",
          expires_at: null,
          revoked_at: "2026-02-01T00:00:00.000Z",
        },
      ],
      nowIso: NOW_ISO,
    }).status,
    "revoked",
  );
});

test("work-email airline_worker claim maps forward only with clear work-email provenance", () => {
  assert.equal(
    getCurrentAirlineEmailAccessState({
      approvedDomains: ACTIVE_DOMAINS,
      requests: [{ id: "request-1", method: "work_email", status: "approved" }],
      evidence: [
        {
          request_id: "request-1",
          evidence_type: "work_email",
          status: "accepted",
          metadata: {
            email_domain: "airline.test",
            support_result: "supported_domain",
            verification_method: "work_email",
          },
        },
      ],
      claims: [
        {
          request_id: "request-1",
          claim_type: "airline_worker",
          claim_value: null,
          status: "approved",
          verification_method: "work_email",
          approved_at: "2026-06-06T10:30:00.000Z",
        },
      ],
      nowIso: NOW_ISO,
    }).airlineEmailVerified,
    true,
  );

  assert.equal(
    getCurrentAirlineEmailAccessState({
      approvedDomains: ACTIVE_DOMAINS,
      requests: [],
      evidence: [],
      claims: [
        {
          claim_type: "airline_worker",
          claim_value: null,
          status: "approved",
          verification_method: null,
          approved_at: "2026-06-06T10:30:00.000Z",
        },
      ],
      nowIso: NOW_ISO,
    }).airlineEmailVerified,
    false,
  );
});

test("older pending request does not override newer verified work-email history", () => {
  const result = getCurrentAirlineEmailAccessState({
    approvedDomains: ACTIVE_DOMAINS,
    requests: [
      {
        id: "request-pending",
        method: "work_email",
        status: "submitted",
        submitted_at: "2026-06-01T09:00:00.000Z",
      },
      {
        id: "request-verified",
        method: "work_email",
        status: "approved",
        submitted_at: "2026-06-06T09:00:00.000Z",
        reviewed_at: "2026-06-06T10:00:00.000Z",
      },
    ],
    evidence: [
      {
        request_id: "request-pending",
        evidence_type: "work_email",
        status: "submitted",
        uploaded_at: "2026-06-01T09:01:00.000Z",
        metadata: {
          email_domain: "airline.test",
          support_result: "supported_domain",
          verification_method: "work_email",
        },
      },
      {
        request_id: "request-verified",
        evidence_type: "work_email",
        status: "accepted",
        uploaded_at: "2026-06-06T09:01:00.000Z",
        metadata: {
          email_domain: "airline.test",
          support_result: "supported_domain",
          verification_method: "work_email",
        },
      },
    ],
    claims: [],
    nowIso: NOW_ISO,
  });

  assert.equal(result.status, "verified");
  assert.equal(result.verifiedAt, "2026-06-06T10:00:00.000Z");
});

test("older expired work-email history does not override newer verified re-verification", () => {
  const result = getCurrentAirlineEmailAccessState({
    approvedDomains: ACTIVE_DOMAINS,
    requests: [
      {
        id: "request-verified",
        method: "work_email",
        status: "approved",
        submitted_at: "2026-06-06T09:00:00.000Z",
        reviewed_at: "2026-06-06T10:00:00.000Z",
      },
    ],
    evidence: [
      {
        request_id: "claim-expired",
        evidence_type: "work_email",
        status: "accepted",
        uploaded_at: "2026-05-01T09:01:00.000Z",
        metadata: {
          email_domain: "airline.test",
          support_result: "supported_domain",
          verification_method: "work_email",
        },
      },
      {
        request_id: "request-verified",
        evidence_type: "work_email",
        status: "accepted",
        uploaded_at: "2026-06-06T09:01:00.000Z",
        metadata: {
          email_domain: "airline.test",
          support_result: "supported_domain",
          verification_method: "work_email",
        },
      },
    ],
    claims: [
      {
        request_id: "claim-expired",
        claim_type: "airline_worker",
        claim_value: null,
        status: "expired",
        verification_method: "work_email",
        approved_at: "2026-05-01T09:00:00.000Z",
        expires_at: "2026-05-15T09:00:00.000Z",
      },
    ],
    nowIso: NOW_ISO,
  });

  assert.equal(result.status, "verified");
  assert.equal(result.verifiedAt, "2026-06-06T10:00:00.000Z");
});

test("newer revoked or expired work-email history overrides older verified status for the same domain", () => {
  const revokedResult = getCurrentAirlineEmailAccessState({
    approvedDomains: ACTIVE_DOMAINS,
    requests: [
      {
        id: "request-verified",
        method: "work_email",
        status: "approved",
        submitted_at: "2026-06-01T09:00:00.000Z",
        reviewed_at: "2026-06-01T10:00:00.000Z",
      },
    ],
    evidence: [
      {
        request_id: "request-verified",
        evidence_type: "work_email",
        status: "accepted",
        metadata: {
          email_domain: "airline.test",
          support_result: "supported_domain",
          verification_method: "work_email",
        },
      },
      {
        request_id: "claim-revoked",
        evidence_type: "work_email",
        status: "accepted",
        metadata: {
          email_domain: "airline.test",
          support_result: "supported_domain",
          verification_method: "work_email",
        },
      },
    ],
    claims: [
      {
        request_id: "claim-revoked",
        claim_type: "airline_worker",
        claim_value: null,
        status: "revoked",
        verification_method: "work_email",
        approved_at: "2026-06-02T09:00:00.000Z",
        revoked_at: "2026-06-03T09:00:00.000Z",
      },
    ],
    nowIso: NOW_ISO,
  });

  assert.equal(revokedResult.status, "revoked");

  const expiredResult = getCurrentAirlineEmailAccessState({
    approvedDomains: ACTIVE_DOMAINS,
    requests: [
      {
        id: "request-verified",
        method: "work_email",
        status: "approved",
        submitted_at: "2026-06-01T09:00:00.000Z",
        reviewed_at: "2026-06-01T10:00:00.000Z",
      },
    ],
    evidence: [
      {
        request_id: "request-verified",
        evidence_type: "work_email",
        status: "accepted",
        metadata: {
          email_domain: "airline.test",
          support_result: "supported_domain",
          verification_method: "work_email",
        },
      },
      {
        request_id: "claim-expired",
        evidence_type: "work_email",
        status: "accepted",
        metadata: {
          email_domain: "airline.test",
          support_result: "supported_domain",
          verification_method: "work_email",
        },
      },
    ],
    claims: [
      {
        request_id: "claim-expired",
        claim_type: "airline_worker",
        claim_value: null,
        status: "expired",
        verification_method: "work_email",
        approved_at: "2026-06-02T09:00:00.000Z",
        expires_at: "2026-06-04T09:00:00.000Z",
      },
    ],
    nowIso: NOW_ISO,
  });

  assert.equal(expiredResult.status, "expired");
});

test("globally ranks older claim history against newer work-email request history", () => {
  const verifiedResult = getCurrentAirlineEmailAccessState({
    approvedDomains: ACTIVE_DOMAINS,
    requests: [
      {
        id: "request-verified",
        method: "work_email",
        status: "approved",
        submitted_at: "2026-06-06T09:00:00.000Z",
        reviewed_at: "2026-06-06T10:00:00.000Z",
      },
    ],
    evidence: [
      {
        request_id: "claim-expired",
        evidence_type: "work_email",
        status: "accepted",
        uploaded_at: "2026-05-01T09:01:00.000Z",
        metadata: {
          email_domain: "airline.test",
          support_result: "supported_domain",
          verification_method: "work_email",
        },
      },
      {
        request_id: "request-verified",
        evidence_type: "work_email",
        status: "accepted",
        uploaded_at: "2026-06-06T09:01:00.000Z",
        metadata: {
          email_domain: "airline.test",
          support_result: "supported_domain",
          verification_method: "work_email",
        },
      },
    ],
    claims: [
      {
        request_id: "claim-expired",
        claim_type: "airline_worker",
        claim_value: null,
        status: "expired",
        verification_method: "work_email",
        approved_at: "2026-05-01T09:00:00.000Z",
        expires_at: "2026-05-15T09:00:00.000Z",
      },
    ],
    nowIso: NOW_ISO,
  });

  assert.equal(verifiedResult.status, "verified");
  assert.equal(verifiedResult.source, "work_email");
  assert.equal(verifiedResult.verifiedAt, "2026-06-06T10:00:00.000Z");

  const revokedResult = getCurrentAirlineEmailAccessState({
    approvedDomains: ACTIVE_DOMAINS,
    requests: [
      {
        id: "request-revoked",
        method: "work_email",
        status: "revoked",
        submitted_at: "2026-06-06T09:00:00.000Z",
        reviewed_at: "2026-06-06T10:00:00.000Z",
      },
    ],
    evidence: [
      {
        request_id: "claim-verified",
        evidence_type: "work_email",
        status: "accepted",
        uploaded_at: "2026-05-01T09:01:00.000Z",
        metadata: {
          email_domain: "airline.test",
          support_result: "supported_domain",
          verification_method: "work_email",
        },
      },
      {
        request_id: "request-revoked",
        evidence_type: "work_email",
        status: "accepted",
        uploaded_at: "2026-06-06T09:01:00.000Z",
        metadata: {
          email_domain: "airline.test",
          support_result: "supported_domain",
          verification_method: "work_email",
        },
      },
    ],
    claims: [
      {
        request_id: "claim-verified",
        claim_type: "airline_worker",
        claim_value: null,
        status: "approved",
        verification_method: "work_email",
        approved_at: "2026-05-01T09:00:00.000Z",
      },
    ],
    nowIso: NOW_ISO,
  });

  assert.equal(revokedResult.status, "revoked");
  assert.equal(revokedResult.source, "work_email");
});

test("globally ranks older request history against newer work-email claim history", () => {
  const result = getCurrentAirlineEmailAccessState({
    approvedDomains: ACTIVE_DOMAINS,
    requests: [
      {
        id: "request-pending",
        method: "work_email",
        status: "submitted",
        submitted_at: "2026-06-01T09:00:00.000Z",
      },
    ],
    evidence: [
      {
        request_id: "request-pending",
        evidence_type: "work_email",
        status: "submitted",
        uploaded_at: "2026-06-01T09:01:00.000Z",
        metadata: {
          email_domain: "airline.test",
          support_result: "supported_domain",
          verification_method: "work_email",
        },
      },
      {
        request_id: "claim-verified",
        evidence_type: "work_email",
        status: "accepted",
        uploaded_at: "2026-06-06T09:01:00.000Z",
        metadata: {
          email_domain: "airline.test",
          support_result: "supported_domain",
          verification_method: "work_email",
        },
      },
    ],
    claims: [
      {
        request_id: "claim-verified",
        claim_type: "airline_worker",
        claim_value: null,
        status: "approved",
        verification_method: "work_email",
        approved_at: "2026-06-06T10:00:00.000Z",
      },
    ],
    nowIso: NOW_ISO,
  });

  assert.equal(result.status, "verified");
  assert.equal(result.source, "legacy_claim_work_email");
  assert.equal(result.verifiedAt, "2026-06-06T10:00:00.000Z");
});

test("input order does not change the returned work-email access state", () => {
  const input = {
    approvedDomains: ACTIVE_DOMAINS,
    requests: [
      {
        id: "request-pending",
        method: "work_email",
        status: "submitted",
        submitted_at: "2026-06-01T09:00:00.000Z",
      },
      {
        id: "request-verified",
        method: "work_email",
        status: "approved",
        submitted_at: "2026-06-06T09:00:00.000Z",
        reviewed_at: "2026-06-06T10:00:00.000Z",
      },
    ],
    evidence: [
      {
        request_id: "request-verified",
        evidence_type: "work_email",
        status: "accepted",
        uploaded_at: "2026-06-06T09:01:00.000Z",
        metadata: {
          email_domain: "airline.test",
          support_result: "supported_domain",
          verification_method: "work_email",
        },
      },
      {
        request_id: "request-pending",
        evidence_type: "work_email",
        status: "submitted",
        uploaded_at: "2026-06-01T09:01:00.000Z",
        metadata: {
          email_domain: "airline.test",
          support_result: "supported_domain",
          verification_method: "work_email",
        },
      },
    ],
    claims: [
      {
        request_id: "claim-expired",
        claim_type: "airline_worker",
        claim_value: null,
        status: "expired",
        verification_method: "work_email",
        approved_at: "2026-05-01T09:00:00.000Z",
        expires_at: "2026-05-15T09:00:00.000Z",
      },
    ],
    nowIso: NOW_ISO,
  };

  const reversed = {
    ...input,
    requests: [...input.requests].reverse(),
    evidence: [...input.evidence].reverse(),
    claims: [...input.claims].reverse(),
  };

  assert.deepEqual(
    getCurrentAirlineEmailAccessState(input),
    getCurrentAirlineEmailAccessState(reversed),
  );
});

test("deterministic fallback prefers stable authority ordering when timestamps are absent", () => {
  const verifiedResult = getCurrentAirlineEmailAccessState({
    approvedDomains: ACTIVE_DOMAINS,
    requests: [
      { id: "request-pending", method: "work_email", status: "submitted" },
      { id: "request-verified", method: "work_email", status: "approved" },
    ],
    evidence: [
      {
        request_id: "request-pending",
        evidence_type: "work_email",
        status: "submitted",
        metadata: {
          email_domain: "airline.test",
          support_result: "supported_domain",
          verification_method: "work_email",
        },
      },
      {
        request_id: "request-verified",
        evidence_type: "work_email",
        status: "accepted",
        metadata: {
          email_domain: "airline.test",
          support_result: "supported_domain",
          verification_method: "work_email",
        },
      },
    ],
    claims: [],
    nowIso: NOW_ISO,
  });

  assert.equal(verifiedResult.status, "verified");

  const revokedResult = getCurrentAirlineEmailAccessState({
    approvedDomains: ACTIVE_DOMAINS,
    requests: [{ id: "request-verified", method: "work_email", status: "approved" }],
    evidence: [
      {
        request_id: "request-verified",
        evidence_type: "work_email",
        status: "accepted",
        metadata: {
          email_domain: "airline.test",
          support_result: "supported_domain",
          verification_method: "work_email",
        },
      },
      {
        request_id: "claim-revoked",
        evidence_type: "work_email",
        status: "accepted",
        metadata: {
          email_domain: "airline.test",
          support_result: "supported_domain",
          verification_method: "work_email",
        },
      },
    ],
    claims: [
      {
        request_id: "claim-revoked",
        claim_type: "airline_worker",
        claim_value: null,
        status: "revoked",
        verification_method: "work_email",
      },
    ],
    nowIso: NOW_ISO,
  });

  assert.equal(revokedResult.status, "revoked");
});

test("proof evidence, profile claims, beta access, role claims, and base claims do not count", () => {
  const result = getCurrentAirlineEmailAccessState({
    approvedDomains: ACTIVE_DOMAINS,
    requests: [
      { id: "proof-request", method: "redacted_badge_or_proof", status: "approved" },
    ],
    evidence: [
      {
        request_id: "proof-request",
        evidence_type: "redacted_badge_or_proof",
        status: "accepted",
        metadata: {
          email_domain: "airline.test",
          support_result: "supported_domain",
          verification_method: "redacted_badge_or_proof",
        },
      },
    ],
    claims: [
      {
        request_id: "proof-request",
        claim_type: "airline_worker",
        claim_value: null,
        status: "approved",
        verification_method: "redacted_badge_or_proof",
      },
      {
        claim_type: "role",
        claim_value: "Pilot",
        status: "approved",
        verification_method: "work_email",
      },
      {
        claim_type: "base",
        claim_value: "DFW",
        status: "approved",
        verification_method: "work_email",
      },
    ],
    profile: {
      claimed_airline: "Test Air",
      claimed_role: "Pilot",
      claimed_base: "DFW",
    },
    betaActive: true,
    loginEmail: "crew.member@airline.test",
    nowIso: NOW_ISO,
  });

  assert.equal(result.status, "not_verified");
  assert.equal(result.airlineEmailVerified, false);
});

test("not_ready setup state is distinct and source stays unknown", () => {
  assert.deepEqual(
    getCurrentAirlineEmailAccessState({
      approvedDomains: [],
      requests: [],
      evidence: [],
      claims: [],
      loadError: "verification storage missing",
      nowIso: NOW_ISO,
    }),
    {
      status: "not_ready",
      airlineEmailVerified: false,
      domain: null,
      airline: null,
      verifiedAt: null,
      source: "unknown",
      messageKey: "airline_email_access_not_ready",
    },
  );
});

test("airline-email access helper stays pure and does not change gates or expose proof internals", () => {
  const source = readFileSync(
    new URL("../../src/lib/verification/airlineEmailAccess.ts", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(source, /getPrivateAppGateResult|betaActive\s*&&|access-hold|first_base_launch|broader_launch/i);
  assert.doesNotMatch(source, /storage_path|storage_bucket|signed_url|public_url|filename|proof_file_contents|service_role/i);
  assert.doesNotMatch(source, /claim_type:\s*["']role["']|claim_type:\s*["']base["']/i);
});
