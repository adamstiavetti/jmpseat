import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  getVerificationSurfaceSummary,
  getWorkEmailSurfaceState,
} from "../../src/lib/verification/surface.ts";

test("verification surface summary shows no-request state when the user has no verification records", () => {
  assert.deepEqual(
    getVerificationSurfaceSummary({
      requests: [],
      claims: [],
      evidence: [],
    }),
    {
      state: "no_request",
      title: "No airline-email access request yet",
      description:
        "Your account can exist without a legacy proof request. General app eligibility is moving toward confirmed approved airline employee email, not badge or proof upload.",
    },
  );
});

test("verification surface summary prioritizes pending and needs-resubmission states", () => {
  assert.deepEqual(
    getVerificationSurfaceSummary({
      requests: [{ status: "submitted" }],
      claims: [],
      evidence: [],
    }),
    {
      state: "pending",
      title: "Legacy verification request is in progress",
      description:
        "A verification request exists, but no approved claim has been issued yet. This status remains historical and does not replace the airline-email access model.",
    },
  );

  assert.deepEqual(
    getVerificationSurfaceSummary({
      requests: [{ status: "needs_resubmission" }],
      claims: [],
      evidence: [],
    }),
    {
      state: "needs_resubmission",
      title: "Legacy verification needs follow-up",
      description:
        "A legacy request was marked incomplete or unsafe. Proof upload remains frozen for forward access, and future general eligibility should use confirmed approved airline employee email.",
    },
  );
});

test("verification surface summary shows approved state when approved claims exist", () => {
  assert.deepEqual(
    getVerificationSurfaceSummary({
      requests: [{ status: "approved" }],
      claims: [{ status: "approved" }],
      evidence: [],
    }),
    {
      state: "approved",
      title: "Historical verification claim is approved",
      description:
        "At least one historical verification claim has been approved. Future general app eligibility should still move through confirmed approved airline employee email, and restricted boards remain separate.",
    },
  );
});

test("verification surface summary can show a rejected request state", () => {
  assert.deepEqual(
    getVerificationSurfaceSummary({
      requests: [{ status: "rejected" }],
      claims: [],
      evidence: [],
    }),
    {
      state: "rejected",
      title: "Legacy verification request was rejected",
      description:
        "A prior request was rejected. Forward access should use airline-email eligibility instead of treating proof review as the launch path.",
    },
  );
});

test("work-email surface state explains unavailable or deferred self-serve submission", () => {
  assert.deepEqual(
    getWorkEmailSurfaceState({ approvedDomainCount: 0 }),
    {
      kind: "unsupported",
      title: "No supported work-email domains are currently available",
      description:
        "Airline-email verification is supported only where an approved airline-controlled domain has been configured. No configured domain is available for self-serve request tracking yet.",
    },
  );

  assert.deepEqual(
    getWorkEmailSurfaceState({ approvedDomainCount: 2 }),
    {
      kind: "available",
      title: "Airline-email request tracking is available for supported domains",
      description:
        "Approved domains can start an airline-email request here, but this ticket still stops short of email delivery, automatic approval, launch-gate access, or claim issuance.",
    },
  );
});

test("/app/verification copy freezes proof upload while preserving airline-email guidance", () => {
  const source = readFileSync(
    new URL("../../app/app/verification/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /confirmed approved airline employee email/i);
  assert.match(source, /employee email is not public/i);
  assert.match(source, /app\s+entry\s+now\s+checks\s+your\s+profile,\s+airline-email\s+eligibility,\s+and\s+beta\s+access\s+when\s+private\s+testing\s+requires\s+it/i);
  assert.match(source, /does\s+not\s+grant\s+role,\s+base,\s+or\s+restricted-board\s+membership/i);
  assert.match(source, /approved airline-controlled domain/i);
  assert.match(source, /only approved airline-controlled domains are currently supported/i);
  assert.match(source, /submit work-email verification request/i);
  assert.match(source, /no employer-system lookup/i);
  assert.match(source, /Proof upload is frozen/i);
  assert.match(source, /no longer asks normal users to upload badges/i);
  assert.match(source, /runtime-applied\s+safety and cleanup infrastructure/i);
  assert.match(source, /community-admin approval/i);
  assert.doesNotMatch(source, /submitRedactedProofVerificationAction/i);
  assert.doesNotMatch(source, /encType="multipart\/form-data"/i);
  assert.doesNotMatch(source, /name="proof_file"/i);
  assert.doesNotMatch(source, /type="file"/i);
  assert.doesNotMatch(source, /accept="image\/jpeg,image\/png"/i);
  assert.doesNotMatch(source, /Upload redacted proof for review/i);
  assert.doesNotMatch(source, /Requested airline for reviewer routing/i);
  assert.doesNotMatch(source, /employee IDs|badge numbers|barcodes|QR codes|crew hotel info/i);
  assert.doesNotMatch(source, /public url|download button|automatic approval|openai|ai pre-check/i);
});

test("/app/verification is configured as the airline-email remedy route", () => {
  const source = readFileSync(
    new URL("../../app/app/verification/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /routeKind:\s*"verification"/);
  assert.match(source, /AUTH_ROUTES\.verification/);
  assert.doesNotMatch(source, /routeKind:\s*"private-child"/);
});

test("access-hold links missing airline-email users to verification before invite redemption", () => {
  const source = readFileSync(
    new URL("../../app/app/access-hold/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /AUTH_ROUTES\.verification/);
  assert.match(source, /Verify airline employee email/);
  assert.match(source, /Beta invite codes do not replace airline-email verification/);
  assert.match(source, /context\.airlineEmailAccessState\.airlineEmailVerified/);
  assert.doesNotMatch(source, /submitRedactedProofVerificationAction/i);
  assert.doesNotMatch(source, /encType="multipart\/form-data"/i);
  assert.doesNotMatch(source, /name="proof_file"/i);
  assert.doesNotMatch(source, /type="file"/i);
});
