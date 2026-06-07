import "server-only";

import {
  ADMIN_ROUTES,
  hasAnyOperatorScope,
} from "./access";
import { recordSecurityEvent } from "../securityEvents/server";
import { getSupabaseBrowserEnv } from "../supabase/config";
import { createClient } from "../supabase/server";
import {
  AUDIT_INSPECTION_SCOPES,
  canReadAuditEvents,
  canReadVerificationRequests,
  isSelectedAuditRequestIdValid,
  normalizeAuditLimit,
  normalizeAuditOffset,
  normalizeSelectedAuditRequestId,
  redactAuditUserReference,
  sanitizeAuditMetadata,
  type VerificationAuditDetailRecord,
  type VerificationAuditEventRecord,
  type VerificationAuditRequestRecord,
} from "./verificationAuditShared";

export const VERIFICATION_AUDIT_ROUTE = ADMIN_ROUTES.auditInspection;
export const VERIFICATION_AUDIT_NOT_READY_MESSAGE =
  "Verification audit inspection is not ready yet. Apply the E05-T05 migration before using this route.";

type VerificationRequestListRpcResponse = {
  ok?: boolean;
  code?: string;
  message?: string | null;
  verification_requests?: unknown[] | null;
};

type VerificationRequestDetailRpcResponse = {
  ok?: boolean;
  code?: string;
  message?: string | null;
  verification_request?: unknown | null;
};

type SecurityEventListRpcResponse = {
  ok?: boolean;
  code?: string;
  message?: string | null;
  security_events?: unknown[] | null;
};

export type VerificationAuditResult =
  | {
      ok: true;
      code: string;
      canReadRequests: boolean;
      canReadEvents: boolean;
      requests: VerificationAuditRequestRecord[];
      selectedRequest: VerificationAuditDetailRecord | null;
      selectedRequestError: { code: string; message: string } | null;
      events: VerificationAuditEventRecord[];
    }
  | {
      ok: false;
      code: string;
      message: string;
      canReadRequests: boolean;
      canReadEvents: boolean;
      requests: [];
      selectedRequest: null;
      selectedRequestError: null;
      events: [];
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function getNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function getBoolean(value: unknown) {
  return typeof value === "boolean" ? value : false;
}

function getStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function getMetadata(value: unknown) {
  return isRecord(value) ? sanitizeAuditMetadata(value) : {};
}

function toRequestRecord(row: unknown): VerificationAuditRequestRecord | null {
  if (!isRecord(row)) {
    return null;
  }

  const id = getString(row.id);
  const userId = getString(row.user_id);
  const status = getString(row.status);
  const method = getString(row.method);
  const createdAt = getString(row.created_at);
  const updatedAt = getString(row.updated_at);

  if (!id || !userId || !status || !method || !createdAt || !updatedAt) {
    return null;
  }

  return {
    id,
    userId: redactAuditUserReference(userId) ?? "user reference redacted",
    status,
    method,
    requestedClaimTypes: getStringArray(row.requested_claim_types),
    submittedAt: getString(row.submitted_at),
    reviewedAt: getString(row.reviewed_at),
    reviewedBy: redactAuditUserReference(getString(row.reviewed_by)),
    expiresAt: getString(row.expires_at),
    createdAt,
    updatedAt,
    evidenceCount: getNumber(row.evidence_count),
    claimCount: getNumber(row.claim_count),
    reviewActionCount: getNumber(row.review_action_count),
  };
}

function toDetailRecord(row: unknown): VerificationAuditDetailRecord | null {
  const request = toRequestRecord(row);

  if (!request || !isRecord(row)) {
    return null;
  }

  const evidence = Array.isArray(row.evidence)
    ? row.evidence.flatMap((entry) => {
        if (!isRecord(entry)) {
          return [];
        }

        const id = getString(entry.id);
        const evidenceType = getString(entry.evidence_type);
        const status = getString(entry.status);

        if (!id || !evidenceType || !status) {
          return [];
        }

        return [
          {
            id,
            evidenceType,
            status,
            uploadedAt: getString(entry.uploaded_at),
            deleteAfter: getString(entry.delete_after),
            deletedAt: getString(entry.deleted_at),
            redactionAcknowledged: getBoolean(entry.redaction_acknowledged),
            proofPresent: getBoolean(entry.proof_present),
            metadata: getMetadata(entry.metadata),
          },
        ];
      })
    : [];

  const claims = Array.isArray(row.claims)
    ? row.claims.flatMap((entry) => {
        if (!isRecord(entry)) {
          return [];
        }

        const id = getString(entry.id);
        const claimType = getString(entry.claim_type);
        const status = getString(entry.status);
        const createdAt = getString(entry.created_at);

        if (!id || !claimType || !status || !createdAt) {
          return [];
        }

        return [
          {
            id,
            claimType,
            claimValue: getString(entry.claim_value),
            status,
            verificationMethod: getString(entry.verification_method),
            confidenceLevel: getString(entry.confidence_level),
            approvedBy: getString(entry.approved_by),
            approvedAt: getString(entry.approved_at),
            expiresAt: getString(entry.expires_at),
            revokedAt: getString(entry.revoked_at),
            createdAt,
          },
        ];
      })
    : [];

  const reviewActions = Array.isArray(row.review_actions)
    ? row.review_actions.flatMap((entry) => {
        if (!isRecord(entry)) {
          return [];
        }

        const id = getString(entry.id);
        const reviewerId = getString(entry.reviewer_id);
        const action = getString(entry.action);
        const createdAt = getString(entry.created_at);

        if (!id || !reviewerId || !action || !createdAt) {
          return [];
        }

        return [
          {
            id,
            reviewerId: redactAuditUserReference(reviewerId) ?? "user reference redacted",
            action,
            createdAt,
            claimId: getString(entry.claim_id),
            notesPresent: getBoolean(entry.notes_present),
          },
        ];
      })
    : [];

  return {
    ...request,
    evidence,
    claims,
    reviewActions,
  };
}

function toEventRecord(row: unknown): VerificationAuditEventRecord | null {
  if (!isRecord(row)) {
    return null;
  }

  const id = getString(row.id);
  const eventType = getString(row.event_type);
  const createdAt = getString(row.created_at);

  if (!id || !eventType || !createdAt) {
    return null;
  }

  return {
    id,
    eventType,
    userId: redactAuditUserReference(getString(row.user_id)),
    route: getString(row.route),
    result: getString(row.result),
    metadata: getMetadata(row.metadata),
    createdAt,
  };
}

async function getAuthorizedVerificationAuditClient() {
  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    return {
      kind: "storage_not_ready" as const,
      message:
        "Verification audit inspection is not ready yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in this environment first.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      kind: "redirect_login" as const,
    };
  }

  const scopesResult = await supabase.rpc("current_user_operator_scopes");
  const scopes = Array.isArray(scopesResult.data)
    ? scopesResult.data.filter((value): value is string => typeof value === "string")
    : [];

  if (scopesResult.error) {
    return {
      kind: "not_ready" as const,
      message: VERIFICATION_AUDIT_NOT_READY_MESSAGE,
    };
  }

  if (
    !hasAnyOperatorScope({
      scopes,
      requiredScopes: AUDIT_INSPECTION_SCOPES,
    })
  ) {
    return {
      kind: "unauthorized" as const,
      userId: user.id,
    };
  }

  return {
    kind: "authorized" as const,
    supabase,
    userId: user.id,
    scopes,
    canReadRequests: canReadVerificationRequests(scopes),
    canReadEvents: canReadAuditEvents(scopes),
  };
}

export async function recordVerificationAuditUnauthorizedRouteAttempt(userId: string) {
  await recordSecurityEvent({
    userId,
    eventType: "operator_audit.unauthorized_attempt",
    route: VERIFICATION_AUDIT_ROUTE,
    result: "denied",
    metadata: {
      reason_code: "missing_audit_inspection_scope",
    },
  });
}

export async function getVerificationAuditForOperator(input?: {
  requestStatus?: string | null;
  requestMethod?: string | null;
  eventType?: string | null;
  selectedRequestId?: string | null;
  limit?: string | number | null;
  offset?: string | number | null;
}): Promise<VerificationAuditResult> {
  const access = await getAuthorizedVerificationAuditClient();

  if (access.kind === "storage_not_ready" || access.kind === "not_ready") {
    return {
      ok: false,
      code: "verification_audit_not_ready",
      message: access.message,
      canReadRequests: false,
      canReadEvents: false,
      requests: [],
      selectedRequest: null,
      selectedRequestError: null,
      events: [],
    };
  }

  if (access.kind === "redirect_login") {
    return {
      ok: false,
      code: "authenticated_operator_required",
      message: "Authenticated operator required.",
      canReadRequests: false,
      canReadEvents: false,
      requests: [],
      selectedRequest: null,
      selectedRequestError: null,
      events: [],
    };
  }

  if (access.kind === "unauthorized") {
    return {
      ok: false,
      code: "missing_audit_inspection_scope",
      message: "Operator scope required to inspect verification audit data.",
      canReadRequests: false,
      canReadEvents: false,
      requests: [],
      selectedRequest: null,
      selectedRequestError: null,
      events: [],
    };
  }

  const limit = normalizeAuditLimit(input?.limit);
  const offset = normalizeAuditOffset(input?.offset);
  const requests: VerificationAuditRequestRecord[] = [];
  let selectedRequest: VerificationAuditDetailRecord | null = null;
  let selectedRequestError: { code: string; message: string } | null = null;
  const events: VerificationAuditEventRecord[] = [];

  if (access.canReadRequests) {
    const rpcResult = await access.supabase.rpc("list_verification_requests_for_operator", {
      requested_status: input?.requestStatus?.trim() || null,
      requested_method: input?.requestMethod?.trim() || null,
      requested_limit: limit,
      requested_offset: offset,
    });

    if (rpcResult.error) {
      return {
        ok: false,
        code: "verification_audit_not_ready",
        message: VERIFICATION_AUDIT_NOT_READY_MESSAGE,
        canReadRequests: access.canReadRequests,
        canReadEvents: access.canReadEvents,
        requests: [],
        selectedRequest: null,
        selectedRequestError: null,
        events: [],
      };
    }

    const payload =
      (rpcResult.data as VerificationRequestListRpcResponse | null | undefined) ?? null;

    if (!payload?.ok) {
      return {
        ok: false,
        code: payload?.code ?? "verification_request_audit_denied",
        message:
          payload?.message?.trim() ||
          "Verification request audit inspection is unavailable for this account.",
        canReadRequests: access.canReadRequests,
        canReadEvents: access.canReadEvents,
        requests: [],
        selectedRequest: null,
        selectedRequestError: null,
        events: [],
      };
    }

    requests.push(
      ...(payload.verification_requests ?? [])
        .map((row) => toRequestRecord(row))
        .filter((row): row is VerificationAuditRequestRecord => row !== null),
    );

    if (!isSelectedAuditRequestIdValid(input?.selectedRequestId)) {
      selectedRequestError = {
        code: "invalid_request_id",
        message: "Invalid request id.",
      };
    }

    const selectedRequestId = normalizeSelectedAuditRequestId(input?.selectedRequestId);

    if (selectedRequestId) {
      const detailResult = await access.supabase.rpc(
        "get_verification_request_audit_detail",
        {
          target_request_id: selectedRequestId,
        },
      );

      if (detailResult.error) {
        return {
          ok: false,
          code: "verification_audit_not_ready",
          message: VERIFICATION_AUDIT_NOT_READY_MESSAGE,
          canReadRequests: access.canReadRequests,
          canReadEvents: access.canReadEvents,
          requests: [],
          selectedRequest: null,
          selectedRequestError: null,
          events: [],
        };
      }

      const detailPayload =
        (detailResult.data as VerificationRequestDetailRpcResponse | null | undefined) ??
        null;

      selectedRequest = detailPayload?.ok
        ? toDetailRecord(detailPayload.verification_request)
        : null;
      selectedRequestError = detailPayload?.ok
        ? null
        : {
            code: detailPayload?.code ?? "target_request_not_found",
            message:
              detailPayload?.message?.trim() ||
              "No verification request matched that request id.",
          };
    }
  }

  if (access.canReadEvents) {
    const eventResult = await access.supabase.rpc("list_security_events_for_operator", {
      requested_event_type: input?.eventType?.trim() || null,
      requested_limit: limit,
      requested_offset: offset,
    });

    if (eventResult.error) {
      return {
        ok: false,
        code: "verification_audit_not_ready",
        message: VERIFICATION_AUDIT_NOT_READY_MESSAGE,
        canReadRequests: access.canReadRequests,
        canReadEvents: access.canReadEvents,
        requests: [],
        selectedRequest: null,
        selectedRequestError: null,
        events: [],
      };
    }

    const payload =
      (eventResult.data as SecurityEventListRpcResponse | null | undefined) ?? null;

    if (!payload?.ok) {
      return {
        ok: false,
        code: payload?.code ?? "security_event_audit_denied",
        message:
          payload?.message?.trim() ||
          "Security-event audit inspection is unavailable for this account.",
        canReadRequests: access.canReadRequests,
        canReadEvents: access.canReadEvents,
        requests: [],
        selectedRequest: null,
        selectedRequestError: null,
        events: [],
      };
    }

    events.push(
      ...(payload.security_events ?? [])
        .map((row) => toEventRecord(row))
        .filter((row): row is VerificationAuditEventRecord => row !== null),
    );
  }

  return {
    ok: true,
    code: "verification_audit_loaded",
    canReadRequests: access.canReadRequests,
    canReadEvents: access.canReadEvents,
    requests,
    selectedRequest,
    selectedRequestError,
    events,
  };
}
