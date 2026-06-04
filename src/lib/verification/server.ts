import "server-only";

import type { User } from "@supabase/supabase-js";

import { getSupabaseBrowserEnv } from "../supabase/config";
import { createClient } from "../supabase/server";

export const VERIFICATION_STORAGE_NOT_READY_MESSAGE =
  "Verification storage is not ready yet. Apply the verification foundation migration to this Supabase project before using the verification surface.";

type QueryVerificationRequestRow = {
  id: string;
  status: string;
  requested_claim_types: string[] | null;
  method: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  expires_at: string | null;
  reason: string | null;
  created_at: string;
};

type QueryVerificationClaimRow = {
  id: string;
  claim_type: string;
  claim_value: string | null;
  status: string;
  verification_method: string | null;
  approved_at: string | null;
  expires_at: string | null;
  reason: string | null;
  created_at: string;
};

type QueryVerificationEvidenceRow = {
  id: string;
  evidence_type: string;
  status: string;
  uploaded_at: string | null;
  delete_after: string | null;
  deleted_at: string | null;
  redaction_acknowledged: boolean;
  created_at: string;
};

type QueryApprovedEmailDomainRow = {
  domain: string;
};

export type CurrentVerificationSurfaceContext = {
  authConfigured: boolean;
  user: User | null;
  requests: QueryVerificationRequestRow[];
  claims: QueryVerificationClaimRow[];
  evidence: QueryVerificationEvidenceRow[];
  approvedDomainCount: number;
  loadError: string | null;
};

export async function getCurrentVerificationSurfaceContext(): Promise<CurrentVerificationSurfaceContext> {
  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    return {
      authConfigured: false,
      user: null,
      requests: [],
      claims: [],
      evidence: [],
      approvedDomainCount: 0,
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
      requests: [],
      claims: [],
      evidence: [],
      approvedDomainCount: 0,
      loadError: userError?.message ?? null,
    };
  }

  const [
    requestsResult,
    claimsResult,
    evidenceResult,
    domainsResult,
  ] = await Promise.all([
    supabase
      .from("verification_requests")
      .select("id, status, requested_claim_types, method, submitted_at, reviewed_at, expires_at, reason, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .returns<QueryVerificationRequestRow[]>(),
    supabase
      .from("verification_claims")
      .select("id, claim_type, claim_value, status, verification_method, approved_at, expires_at, reason, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .returns<QueryVerificationClaimRow[]>(),
    supabase
      .from("verification_evidence")
      .select("id, evidence_type, status, uploaded_at, delete_after, deleted_at, redaction_acknowledged, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .returns<QueryVerificationEvidenceRow[]>(),
    supabase
      .from("approved_email_domains")
      .select("domain")
      .eq("status", "active")
      .returns<QueryApprovedEmailDomainRow[]>(),
  ]);

  if (requestsResult.error || claimsResult.error || evidenceResult.error) {
    return {
      authConfigured: true,
      user,
      requests: [],
      claims: [],
      evidence: [],
      approvedDomainCount: 0,
      loadError: VERIFICATION_STORAGE_NOT_READY_MESSAGE,
    };
  }

  return {
    authConfigured: true,
    user,
    requests: requestsResult.data ?? [],
    claims: claimsResult.data ?? [],
    evidence: evidenceResult.data ?? [],
    approvedDomainCount: domainsResult.error ? 0 : (domainsResult.data?.length ?? 0),
    loadError: null,
  };
}
