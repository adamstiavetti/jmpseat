import "server-only";

import type { User } from "@supabase/supabase-js";

import { getSupabaseBrowserEnv } from "../supabase/config";
import { createClient } from "../supabase/server";
import {
  filterReviewQueueByScopes,
  hasActiveReviewerScope,
  type ReviewQueueEntry,
  type ReviewerScope,
} from "./review";

export const VERIFICATION_REVIEW_NOT_READY_MESSAGE =
  "Verification review is not ready yet. Apply the reviewer-scope migration to this Supabase project before using the reviewer queue.";

type QueryReviewerScopeRow = {
  id: string;
  reviewer_id: string;
  scope_type: string;
  scope_value: string | null;
  status: string;
  created_at: string;
};

type QueryReviewRequestRow = {
  id: string;
  user_id: string;
  status: string;
  method: string;
  requested_claim_types: string[] | null;
  submitted_at: string | null;
  reason: string | null;
  created_at: string;
};

type QueryReviewEvidenceRow = {
  id: string;
  request_id: string;
  evidence_type: string;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type VerificationReviewQueueItem = {
  request: QueryReviewRequestRow;
  evidence: QueryReviewEvidenceRow[];
};

export type CurrentVerificationReviewContext = {
  authConfigured: boolean;
  user: User | null;
  reviewerScopes: ReviewerScope[];
  reviewerAuthorized: boolean;
  queue: VerificationReviewQueueItem[];
  loadError: string | null;
};

export async function getCurrentVerificationReviewContext(): Promise<CurrentVerificationReviewContext> {
  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    return {
      authConfigured: false,
      user: null,
      reviewerScopes: [],
      reviewerAuthorized: false,
      queue: [],
      loadError: null,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      authConfigured: true,
      user: null,
      reviewerScopes: [],
      reviewerAuthorized: false,
      queue: [],
      loadError: userError?.message ?? null,
    };
  }

  const reviewerScopesResult = await supabase
    .from("verification_reviewer_scopes")
    .select("id, reviewer_id, scope_type, scope_value, status, created_at")
    .eq("reviewer_id", user.id)
    .returns<QueryReviewerScopeRow[]>();

  if (reviewerScopesResult.error) {
    return {
      authConfigured: true,
      user,
      reviewerScopes: [],
      reviewerAuthorized: false,
      queue: [],
      loadError: VERIFICATION_REVIEW_NOT_READY_MESSAGE,
    };
  }

  const reviewerScopes = (reviewerScopesResult.data ?? []).map((scope) => ({
    scope_type: scope.scope_type,
    scope_value: scope.scope_value,
    status: scope.status,
  }));
  const reviewerAuthorized = hasActiveReviewerScope(reviewerScopes);

  if (!reviewerAuthorized) {
    return {
      authConfigured: true,
      user,
      reviewerScopes,
      reviewerAuthorized: false,
      queue: [],
      loadError: null,
    };
  }

  const requestsResult = await supabase
    .from("verification_requests")
    .select("id, user_id, status, method, requested_claim_types, submitted_at, reason, created_at")
    .in("status", ["submitted", "pending_review"])
    .order("created_at", { ascending: true })
    .returns<QueryReviewRequestRow[]>();

  if (requestsResult.error) {
    return {
      authConfigured: true,
      user,
      reviewerScopes,
      reviewerAuthorized: true,
      queue: [],
      loadError: VERIFICATION_REVIEW_NOT_READY_MESSAGE,
    };
  }

  const requestIds = (requestsResult.data ?? []).map((request) => request.id);

  const evidenceResult =
    requestIds.length > 0
      ? await supabase
          .from("verification_evidence")
          .select("id, request_id, evidence_type, status, metadata, created_at")
          .in("request_id", requestIds)
          .order("created_at", { ascending: true })
          .returns<QueryReviewEvidenceRow[]>()
      : { data: [], error: null };

  if (evidenceResult.error) {
    return {
      authConfigured: true,
      user,
      reviewerScopes,
      reviewerAuthorized: true,
      queue: [],
      loadError: VERIFICATION_REVIEW_NOT_READY_MESSAGE,
    };
  }

  const evidenceByRequestId = new Map<string, QueryReviewEvidenceRow[]>();

  for (const evidence of evidenceResult.data ?? []) {
    const existing = evidenceByRequestId.get(evidence.request_id) ?? [];
    existing.push(evidence);
    evidenceByRequestId.set(evidence.request_id, existing);
  }

  const filteredQueue = filterReviewQueueByScopes({
    queue: (requestsResult.data ?? []).map(
      (request): ReviewQueueEntry & { request: QueryReviewRequestRow; evidence: QueryReviewEvidenceRow[] } => ({
        request,
        evidence: evidenceByRequestId.get(request.id) ?? [],
      }),
    ),
    scopes: reviewerScopes,
  });

  return {
    authConfigured: true,
    user,
    reviewerScopes,
    reviewerAuthorized: true,
    queue: filteredQueue,
    loadError: null,
  };
}
