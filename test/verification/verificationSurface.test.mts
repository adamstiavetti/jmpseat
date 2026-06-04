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
      title: "No verification request yet",
      description:
        "Your account can exist without worker verification. When verification opens for your path, this page will show request status and approved claims here.",
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
      title: "Verification is in progress",
      description:
        "A verification request exists, but no approved claim has been issued yet.",
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
      title: "Verification needs resubmission",
      description:
        "A reviewer or verification rule flagged your current submission as incomplete or unsafe, so you should expect to resubmit a safer verification method later.",
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
      title: "Verification claim is approved",
      description:
        "At least one verification claim has been approved. Airline, role, and base claims may still remain separate or arrive later.",
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
        "Work-email verification is supported only where an approved airline-controlled domain has been configured. This beta does not expose any supported domains for self-serve verification yet.",
    },
  );

  assert.deepEqual(
    getWorkEmailSurfaceState({ approvedDomainCount: 2 }),
    {
      kind: "deferred",
      title: "Work-email verification is a supported path",
      description:
        "Approved domains can support a later work-email verification flow, but this ticket keeps self-serve request creation deferred until the request/evidence submission flow is wired more fully.",
    },
  );
});

test("/app/verification copy stays bounded to status and guidance only", () => {
  const source = readFileSync(
    new URL("../../app/app/verification/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /verification is separate from signup, profile completion, and beta access/i);
  assert.match(source, /work email may be different from your login email/i);
  assert.match(source, /approved airline-controlled domain/i);
  assert.match(source, /work email is not public/i);
  assert.match(source, /no employer-system lookup/i);
  assert.match(source, /employee IDs/i);
  assert.match(source, /badge numbers/i);
  assert.match(source, /barcodes/i);
  assert.match(source, /QR codes/i);
  assert.match(source, /crew hotel info/i);
  assert.match(source, /coming next|not live yet|deferred/i);
  assert.doesNotMatch(source, /type="file"|supabase storage|upload proof now|automatic claim issuance/i);
});
