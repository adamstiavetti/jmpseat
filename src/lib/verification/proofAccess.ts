import "server-only";

import { redirect } from "next/navigation";

import { AUTH_ROUTES } from "../auth/routes";
import { recordSecurityEvent } from "../securityEvents/server";
import { createStorageAdminClient, STORAGE_ADMIN_UNAVAILABLE_MESSAGE } from "../supabase/storageAdmin";
import { createClient } from "../supabase/server";
import { hasActiveReviewerScope, type ReviewerScope } from "./review";
import {
  resolveProofViewAccess,
  type ProofViewReasonCode,
} from "./proofAccessCore";

const VERIFICATION_REVIEW_ROUTE = "/app/admin/verification";
const PROOF_EVIDENCE_TYPE = "redacted_badge_or_proof";

type QueryReviewerScopeRow = {
  scope_type: string;
  scope_value: string | null;
  status: string;
};

type QueryVerificationRequestRow = {
  id: string;
  user_id: string;
  status: string;
};

type QueryVerificationEvidenceRow = {
  id: string;
  request_id: string;
  evidence_type: string;
  storage_bucket: string | null;
  storage_path: string | null;
  status: string;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function buildReviewRedirect(
  params: Record<string, string | null | undefined>,
) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const suffix = search.toString();
  return suffix ? `${VERIFICATION_REVIEW_ROUTE}?${suffix}` : VERIFICATION_REVIEW_ROUTE;
}

async function loadReviewerScopes(
  reviewerId: string,
): Promise<ReviewerScope[] | null> {
  const supabase = await createClient();
  const result = await supabase
    .from("verification_reviewer_scopes")
    .select("scope_type, scope_value, status")
    .eq("reviewer_id", reviewerId)
    .returns<QueryReviewerScopeRow[]>();

  if (result.error) {
    return null;
  }

  return (result.data ?? []).map((scope) => ({
    scope_type: scope.scope_type,
    scope_value: scope.scope_value,
    status: scope.status,
  }));
}

async function recordDeniedProofViewEvent(input: {
  reviewerId: string | null;
  requestId: string | null;
  evidenceId: string | null;
  evidenceType?: string | null;
  status?: string | null;
  reasonCode: ProofViewReasonCode;
}) {
  await recordSecurityEvent({
    userId: input.reviewerId,
    eventType: "verification_evidence.view_denied",
    route: VERIFICATION_REVIEW_ROUTE,
    result: "denied",
    metadata: {
      verification_request_id: input.requestId,
      verification_evidence_id: input.evidenceId,
      evidence_type: input.evidenceType ?? null,
      status: input.status ?? null,
      reason_code: input.reasonCode,
    },
  });
}

export async function viewVerificationProofAction(formData: FormData) {
  "use server";

  const requestId = getString(formData, "request_id");
  const evidenceId = getString(formData, "evidence_id");
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(
      `${AUTH_ROUTES.login}?${new URLSearchParams({
        next: VERIFICATION_REVIEW_ROUTE,
      }).toString()}`,
    );
  }

  const reviewerScopes = await loadReviewerScopes(user.id);
  const reviewerAuthorized = hasActiveReviewerScope(reviewerScopes ?? []);

  const evidenceResult = await supabase
    .from("verification_evidence")
    .select("id, request_id, evidence_type, storage_bucket, storage_path, status")
    .eq("id", evidenceId)
    .maybeSingle<QueryVerificationEvidenceRow>();

  const requestLookupId = evidenceResult.data?.request_id ?? requestId;
  const requestResult = requestLookupId
    ? await supabase
        .from("verification_requests")
        .select("id, user_id, status")
        .eq("id", requestLookupId)
        .maybeSingle<QueryVerificationRequestRow>()
    : { data: null, error: null };

  const canReviewResult =
    requestResult.data && user.id
      ? await supabase.rpc("can_review_verification_request", {
          actor_id: user.id,
          request_owner_id: requestResult.data.user_id,
          request_id: requestResult.data.id,
        })
      : { data: false, error: null };

  const decision = resolveProofViewAccess({
    reviewerId: user.id,
    reviewerAuthorized,
    request: requestResult.data ?? null,
    evidence: evidenceResult.data ?? null,
    canReviewRequest:
      canReviewResult.error == null && Boolean(canReviewResult.data),
  });

  if (decision.kind === "denied") {
    await recordDeniedProofViewEvent({
      reviewerId: user.id,
      requestId: requestResult.data?.id ?? requestId ?? null,
      evidenceId: evidenceResult.data?.id ?? evidenceId ?? null,
      evidenceType: evidenceResult.data?.evidence_type ?? null,
      status: evidenceResult.data?.status ?? requestResult.data?.status ?? null,
      reasonCode: decision.reasonCode,
    });

    redirect(
      buildReviewRedirect({
        error: decision.message,
      }),
    );
  }

  await recordSecurityEvent({
    userId: user.id,
    eventType: "verification_evidence.view_requested",
    route: VERIFICATION_REVIEW_ROUTE,
    result: "requested",
    metadata: {
      verification_request_id: decision.requestId,
      verification_evidence_id: decision.evidenceId,
      evidence_type: PROOF_EVIDENCE_TYPE,
      status: requestResult.data?.status ?? null,
    },
  });

  try {
    const storageAdmin = createStorageAdminClient();
    const signedUrlResult = await storageAdmin.storage
      .from(decision.bucket)
      .createSignedUrl(decision.storagePath, decision.ttlSeconds);

    if (signedUrlResult.error || !signedUrlResult.data?.signedUrl) {
      await recordDeniedProofViewEvent({
        reviewerId: user.id,
        requestId: decision.requestId,
        evidenceId: decision.evidenceId,
        evidenceType: PROOF_EVIDENCE_TYPE,
        status: requestResult.data?.status ?? null,
        reasonCode: "signed_url_unavailable",
      });

      redirect(
        buildReviewRedirect({
          error: STORAGE_ADMIN_UNAVAILABLE_MESSAGE,
        }),
      );
    }

    await recordSecurityEvent({
      userId: user.id,
      eventType: "verification_evidence.view_granted",
      route: VERIFICATION_REVIEW_ROUTE,
      result: "granted",
      metadata: {
        verification_request_id: decision.requestId,
        verification_evidence_id: decision.evidenceId,
        evidence_type: PROOF_EVIDENCE_TYPE,
        status: requestResult.data?.status ?? null,
      },
    });

    redirect(signedUrlResult.data.signedUrl);
  } catch {
    await recordDeniedProofViewEvent({
      reviewerId: user.id,
      requestId: decision.requestId,
      evidenceId: decision.evidenceId,
      evidenceType: PROOF_EVIDENCE_TYPE,
      status: requestResult.data?.status ?? null,
      reasonCode: "signed_url_unavailable",
    });

    redirect(
      buildReviewRedirect({
        error: STORAGE_ADMIN_UNAVAILABLE_MESSAGE,
      }),
    );
  }
}
