"use server";

import { redirect } from "next/navigation";

import { AUTH_ROUTES } from "../auth/routes";
import { getSupabaseBrowserEnv } from "../supabase/config";
import { createClient } from "../supabase/server";
import { planVerificationReviewDecision } from "./review";

const REVIEW_ROUTE = "/app/admin/verification";

type QueryReviewerScopeRow = {
  scope_type: string;
  scope_value: string | null;
  status: string;
};

type QueryReviewRequestRow = {
  id: string;
  user_id: string;
  method: string;
  status: string;
  requested_claim_types: string[] | null;
};

type QueryReviewEvidenceRow = {
  evidence_type: string;
  metadata: Record<string, unknown>;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function buildRedirect(
  path: string,
  params: Record<string, string | null | undefined>,
) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const suffix = search.toString();
  return suffix ? `${path}?${suffix}` : path;
}

export async function submitVerificationReviewAction(formData: FormData) {
  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    redirect(
      buildRedirect(REVIEW_ROUTE, {
        error:
          "Supabase auth is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
      }),
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(
      buildRedirect(AUTH_ROUTES.login, {
        next: REVIEW_ROUTE,
      }),
    );
  }

  const requestId = getString(formData, "request_id");
  const action = getString(formData, "action");

  if (!requestId || !["approve", "reject", "request_resubmission"].includes(action)) {
    redirect(
      buildRedirect(REVIEW_ROUTE, {
        error: "Choose a valid review action before submitting.",
      }),
    );
  }

  const [reviewerScopesResult, requestResult, evidenceResult] = await Promise.all([
    supabase
      .from("verification_reviewer_scopes")
      .select("scope_type, scope_value, status")
      .eq("reviewer_id", user.id)
      .returns<QueryReviewerScopeRow[]>(),
    supabase
      .from("verification_requests")
      .select("id, user_id, method, status, requested_claim_types")
      .eq("id", requestId)
      .single<QueryReviewRequestRow>(),
    supabase
      .from("verification_evidence")
      .select("evidence_type, metadata")
      .eq("request_id", requestId)
      .returns<QueryReviewEvidenceRow[]>(),
  ]);

  if (reviewerScopesResult.error || requestResult.error || evidenceResult.error || !requestResult.data) {
    redirect(
      buildRedirect(REVIEW_ROUTE, {
        error:
          "Verification review is not ready yet. Confirm reviewer scopes and verification schema are available.",
      }),
    );
  }

  const plan = planVerificationReviewDecision({
    reviewerId: user.id,
    reviewerScopes: reviewerScopesResult.data ?? [],
    request: requestResult.data,
    evidence: evidenceResult.data ?? [],
    action: action as "approve" | "reject" | "request_resubmission",
  });

  if (plan.kind !== "apply_review") {
    redirect(
      buildRedirect(REVIEW_ROUTE, {
        error: plan.message,
      }),
    );
  }

  if (plan.claimsToInsert.length > 0) {
    const { error: claimsError } = await supabase
      .from("verification_claims")
      .insert(plan.claimsToInsert);

    if (claimsError) {
      redirect(
        buildRedirect(REVIEW_ROUTE, {
          error:
            "The review decision could not issue the supported verification claims. Try again.",
        }),
      );
    }
  }

  const { error: requestUpdateError } = await supabase
    .from("verification_requests")
    .update(plan.requestUpdate)
    .eq("id", requestId);

  if (requestUpdateError) {
    redirect(
      buildRedirect(REVIEW_ROUTE, {
        error:
          "The verification request could not be updated with the review decision. Try again.",
      }),
    );
  }

  const { error: reviewActionError } = await supabase
    .from("verification_review_actions")
    .insert({
      request_id: requestId,
      claim_id: null,
      ...plan.reviewActionInsert,
    });

  if (reviewActionError) {
    redirect(
      buildRedirect(REVIEW_ROUTE, {
        error:
          "The review action audit row could not be recorded. The request status may already be updated.",
      }),
    );
  }

  redirect(
    buildRedirect(REVIEW_ROUTE, {
      message:
        action === "approve"
          ? "Verification request approved."
          : action === "reject"
            ? "Verification request rejected."
            : "Verification request marked for resubmission.",
    }),
  );
}
