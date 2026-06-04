"use server";

import { redirect } from "next/navigation";

import { AUTH_ROUTES } from "../auth/routes";
import {
  getVerificationRequestEventType,
} from "../securityEvents/securityEvents";
import { recordSecurityEvent } from "../securityEvents/server";
import { getSupabaseBrowserEnv } from "../supabase/config";
import { createClient } from "../supabase/server";
import { planWorkEmailVerificationSubmission } from "./requestFlow";

const VERIFICATION_ROUTE = "/app/verification";

type QueryVerificationRequestRow = {
  id: string;
  method: string;
  status: string;
};

type QueryVerificationEvidenceRow = {
  request_id: string;
  evidence_type: string;
};

type QueryApprovedEmailDomainRow = {
  domain: string;
  airline: string | null;
  status: string;
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

export async function submitWorkEmailVerificationAction(formData: FormData) {
  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    redirect(
      buildRedirect(VERIFICATION_ROUTE, {
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
        next: VERIFICATION_ROUTE,
      }),
    );
  }

  const workEmail = getString(formData, "work_email");

  const [
    requestsResult,
    evidenceResult,
    approvedDomainsResult,
  ] = await Promise.all([
    supabase
      .from("verification_requests")
      .select("id, method, status")
      .eq("user_id", user.id)
      .returns<QueryVerificationRequestRow[]>(),
    supabase
      .from("verification_evidence")
      .select("request_id, evidence_type")
      .eq("user_id", user.id)
      .returns<QueryVerificationEvidenceRow[]>(),
    supabase
      .from("approved_email_domains")
      .select("domain, airline, status")
      .eq("status", "active")
      .returns<QueryApprovedEmailDomainRow[]>(),
  ]);

  if (requestsResult.error || evidenceResult.error || approvedDomainsResult.error) {
    redirect(
      buildRedirect(VERIFICATION_ROUTE, {
        error:
          "Verification request storage is not ready yet. Try again after the verification foundation is available in this environment.",
      }),
    );
  }

  const submission = planWorkEmailVerificationSubmission({
    userId: user.id,
    workEmail,
    loginEmail: user.email,
    approvedDomains: approvedDomainsResult.data ?? [],
    existingRequests: requestsResult.data ?? [],
    existingEvidence: evidenceResult.data ?? [],
  });

  if (submission.kind === "invalid_email" || submission.kind === "unsupported_domain") {
    await recordSecurityEvent({
      userId: user.id,
      eventType: getVerificationRequestEventType({
        submissionKind: submission.kind,
      }),
      route: VERIFICATION_ROUTE,
      result: submission.kind,
      metadata: {
        email_domain: submission.kind === "unsupported_domain" ? submission.domain : null,
        verification_method: "work_email",
        support_result:
          submission.kind === "unsupported_domain" ? "unsupported_domain" : "invalid_email",
      },
    });
    redirect(
      buildRedirect(VERIFICATION_ROUTE, {
        error: submission.message,
      }),
    );
  }

  if (submission.kind === "duplicate_request") {
    await recordSecurityEvent({
      userId: user.id,
      eventType: getVerificationRequestEventType({
        submissionKind: submission.kind,
      }),
      route: VERIFICATION_ROUTE,
      result: "duplicate_active",
      metadata: {
        verification_request_id: submission.requestId,
        verification_method: "work_email",
        status: "submitted",
      },
    });
    redirect(
      buildRedirect(VERIFICATION_ROUTE, {
        message: submission.message,
      }),
    );
  }

  if (submission.kind === "attach_missing_evidence") {
    const { error } = await supabase.from("verification_evidence").insert({
      request_id: submission.requestId,
      ...submission.evidence,
    });

    if (error) {
      redirect(
        buildRedirect(VERIFICATION_ROUTE, {
          error:
            "Your verification request exists, but the work-email evidence metadata could not be attached yet. Try again.",
        }),
      );
    }

    await recordSecurityEvent({
      userId: user.id,
      eventType: "verification_evidence.created",
      route: VERIFICATION_ROUTE,
      result: "attached_missing_evidence",
      metadata: {
        verification_request_id: submission.requestId,
        evidence_type: submission.evidence.evidence_type,
        email_domain: submission.evidence.metadata.email_domain,
        support_result: submission.evidence.metadata.support_result,
        claim_value: submission.evidence.metadata.airline,
      },
    });

    redirect(
      buildRedirect(VERIFICATION_ROUTE, {
        message: submission.message,
      }),
    );
  }

  const { data: createdRequest, error: requestError } = await supabase
    .from("verification_requests")
    .insert(submission.request)
    .select("id")
    .single<{ id: string }>();

  if (requestError || !createdRequest) {
    redirect(
      buildRedirect(VERIFICATION_ROUTE, {
        error:
          "The work-email verification request could not be created. Try again.",
      }),
    );
  }

  const { error: evidenceError } = await supabase.from("verification_evidence").insert({
    request_id: createdRequest.id,
    ...submission.evidence,
  });

  if (evidenceError) {
    redirect(
      buildRedirect(VERIFICATION_ROUTE, {
        error:
          "Your verification request was created, but the work-email evidence metadata could not be attached yet. Try again to refresh the request state.",
      }),
    );
  }

  await recordSecurityEvent({
    userId: user.id,
    eventType: getVerificationRequestEventType({
      submissionKind: submission.kind,
    }),
    route: VERIFICATION_ROUTE,
    result: "submitted",
    metadata: {
      verification_request_id: createdRequest.id,
      verification_method: submission.request.method,
      status: submission.request.status,
      email_domain: submission.evidence.metadata.email_domain,
      support_result: submission.evidence.metadata.support_result,
    },
  });

  await recordSecurityEvent({
    userId: user.id,
    eventType: "verification_evidence.created",
    route: VERIFICATION_ROUTE,
    result: "created",
    metadata: {
      verification_request_id: createdRequest.id,
      evidence_type: submission.evidence.evidence_type,
      email_domain: submission.evidence.metadata.email_domain,
      support_result: submission.evidence.metadata.support_result,
      claim_value: submission.evidence.metadata.airline,
    },
  });

  redirect(
    buildRedirect(VERIFICATION_ROUTE, {
      message: submission.message,
    }),
  );
}
