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
      title: "Airline-email confirmation is available for supported domains",
      description:
        "Approved domains can receive a six-digit verification code here. Confirmation verifies control of the email address only and does not issue role, base, or restricted-board claims.",
    },
  );
});

test("/app/verification is deprecated in favor of the access-hold verification flow", () => {
  const source = readFileSync(
    new URL("../../app/app/verification/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /DeprecatedVerificationPage/);
  assert.match(source, /redirect\(AUTH_ROUTES\.accessHold\)/);
  assert.doesNotMatch(source, /Airline-email access status/i);
  assert.doesNotMatch(source, /submitWorkEmailVerificationAction/i);
  assert.doesNotMatch(source, /verifyWorkEmailConfirmationCodeAction/i);
  assert.doesNotMatch(source, /submitRedactedProofVerificationAction/i);
  assert.doesNotMatch(source, /encType="multipart\/form-data"/i);
  assert.doesNotMatch(source, /name="proof_file"/i);
  assert.doesNotMatch(source, /type="file"/i);
});

test("work-email verification defaults to access-hold while preserving legacy confirmation compatibility", () => {
  const actions = readFileSync(
    new URL("../../src/lib/verification/actions.ts", import.meta.url),
    "utf8",
  );
  const confirmRoute = readFileSync(
    new URL("../../app/app/verification/confirm/route.ts", import.meta.url),
    "utf8",
  );

  assert.match(actions, /WORK_EMAIL_VERIFICATION_RETURN_ROUTES/);
  assert.match(actions, /AUTH_ROUTES\.verification/);
  assert.match(actions, /AUTH_ROUTES\.accessHold/);
  assert.match(actions, /:\s*AUTH_ROUTES\.accessHold/);
  assert.match(confirmRoute, /AUTH_ROUTES\.verificationConfirm/);
  assert.match(confirmRoute, /AUTH_ROUTES\.accessHold/);
});

test("access-hold lets missing airline-email users verify inline before invite redemption", () => {
  const source = readFileSync(
    new URL("../../app/app/access-hold/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /Verify airline employee email/);
  assert.match(source, /submitWorkEmailVerificationAction/);
  assert.match(source, /verifyWorkEmailConfirmationCodeAction/);
  assert.match(source, /name="work_email"/);
  assert.match(source, /name="return_to"\s+value=\{AUTH_ROUTES\.accessHold\}/);
  assert.match(source, /pendingWorkEmailConfirmation/);
  assert.match(source, /We sent a confirmation to/);
  assert.match(source, /codeName="verification_code"/);
  assert.match(source, /Beta invite codes do not replace airline-email verification/);
  assert.match(source, /context\.airlineEmailAccessState\.airlineEmailVerified/);
  assert.match(source, /!context\.airlineEmailAccessState\.airlineEmailVerified \? \(/);
  assert.doesNotMatch(source, /submitRedactedProofVerificationAction/i);
  assert.doesNotMatch(source, /encType="multipart\/form-data"/i);
  assert.doesNotMatch(source, /name="proof_file"/i);
  assert.doesNotMatch(source, /type="file"/i);
});
