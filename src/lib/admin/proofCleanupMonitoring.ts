import "server-only";

import { ADMIN_ROUTES, hasOperatorScope } from "./access";
import { recordSecurityEvent } from "../securityEvents/server";
import { getSupabaseBrowserEnv } from "../supabase/config";
import { createClient } from "../supabase/server";
import {
  PROOF_CLEANUP_MONITORING_SCOPE,
  normalizeProofCleanupMonitoringLimit,
  normalizeProofCleanupMonitoringOffset,
  sanitizeProofCleanupMetadata,
  type ProofCleanupEventRecord,
  type ProofCleanupFailureRecord,
  type ProofCleanupMonitoringSummary,
} from "./proofCleanupMonitoringShared";

export const PROOF_CLEANUP_MONITORING_ROUTE = ADMIN_ROUTES.proofCleanup;
export const PROOF_CLEANUP_MONITORING_NOT_READY_MESSAGE =
  "Proof cleanup monitoring is not ready yet. Apply the E05-T06 migration before using this route.";

type ProofCleanupSummaryRpcResponse = {
  ok?: boolean;
  code?: string;
  message?: string | null;
  summary?: unknown | null;
};

type ProofCleanupFailuresRpcResponse = {
  ok?: boolean;
  code?: string;
  message?: string | null;
  failures?: unknown[] | null;
};

type ProofCleanupEventsRpcResponse = {
  ok?: boolean;
  code?: string;
  message?: string | null;
  events?: unknown[] | null;
};

export type ProofCleanupMonitoringResult =
  | {
      ok: true;
      code: string;
      summary: ProofCleanupMonitoringSummary;
      failures: ProofCleanupFailureRecord[];
      events: ProofCleanupEventRecord[];
    }
  | {
      ok: false;
      code: string;
      message: string;
      summary: null;
      failures: [];
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

function getMetadata(value: unknown) {
  return isRecord(value) ? sanitizeProofCleanupMetadata(value) : {};
}

function toSummaryRecord(value: unknown): ProofCleanupMonitoringSummary | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    scheduledCount: getNumber(value.scheduled_count),
    dueCount: getNumber(value.due_count),
    overdueCount: getNumber(value.overdue_count),
    deletedCount: getNumber(value.deleted_count),
    failedEventCount: getNumber(value.failed_event_count),
    recentFailureCount: getNumber(value.recent_failure_count),
    lastCleanupEventAt: getString(value.last_cleanup_event_at),
    lastFailureAt: getString(value.last_failure_at),
  };
}

function toFailureRecord(row: unknown): ProofCleanupFailureRecord | null {
  if (!isRecord(row)) {
    return null;
  }

  const eventId = getString(row.event_id);
  const failedAt = getString(row.failed_at);

  if (!eventId || !failedAt) {
    return null;
  }

  return {
    eventId,
    verificationEvidenceId: getString(row.verification_evidence_id),
    verificationRequestId: getString(row.verification_request_id),
    evidenceStatus: getString(row.evidence_status),
    deleteAfter: getString(row.delete_after),
    deletedAt: getString(row.deleted_at),
    reasonCode: getString(row.reason_code),
    result: getString(row.result),
    failedAt,
  };
}

function toEventRecord(row: unknown): ProofCleanupEventRecord | null {
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
    userId: getString(row.user_id),
    route: getString(row.route),
    result: getString(row.result),
    metadata: getMetadata(row.metadata),
    createdAt,
  };
}

async function getAuthorizedProofCleanupMonitoringClient() {
  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    return {
      kind: "storage_not_ready" as const,
      message:
        "Proof cleanup monitoring is not ready yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in this environment first.",
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
      message: PROOF_CLEANUP_MONITORING_NOT_READY_MESSAGE,
    };
  }

  if (
    !hasOperatorScope({
      scopes,
      scope: PROOF_CLEANUP_MONITORING_SCOPE,
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
  };
}

export async function recordProofCleanupMonitoringUnauthorizedRouteAttempt(
  userId: string,
) {
  await recordSecurityEvent({
    userId,
    eventType: "proof_cleanup.monitor_unauthorized_attempt",
    route: PROOF_CLEANUP_MONITORING_ROUTE,
    result: "denied",
    metadata: {
      reason_code: "missing_monitor_proof_cleanup_scope",
    },
  });
}

export async function getProofCleanupMonitoringForOperator(input?: {
  eventType?: string | null;
  limit?: string | number | null;
  offset?: string | number | null;
}): Promise<ProofCleanupMonitoringResult> {
  const access = await getAuthorizedProofCleanupMonitoringClient();

  if (access.kind === "storage_not_ready" || access.kind === "not_ready") {
    return {
      ok: false,
      code: "proof_cleanup_monitoring_not_ready",
      message: access.message,
      summary: null,
      failures: [],
      events: [],
    };
  }

  if (access.kind === "redirect_login") {
    return {
      ok: false,
      code: "authenticated_operator_required",
      message: "Authenticated operator required.",
      summary: null,
      failures: [],
      events: [],
    };
  }

  if (access.kind === "unauthorized") {
    return {
      ok: false,
      code: "missing_monitor_proof_cleanup_scope",
      message: "Operator scope required to monitor proof cleanup.",
      summary: null,
      failures: [],
      events: [],
    };
  }

  const limit = normalizeProofCleanupMonitoringLimit(input?.limit);
  const offset = normalizeProofCleanupMonitoringOffset(input?.offset);

  const summaryResult = await access.supabase.rpc(
    "get_proof_cleanup_monitoring_summary",
  );

  if (summaryResult.error) {
    return {
      ok: false,
      code: "proof_cleanup_monitoring_not_ready",
      message: PROOF_CLEANUP_MONITORING_NOT_READY_MESSAGE,
      summary: null,
      failures: [],
      events: [],
    };
  }

  const summaryPayload =
    (summaryResult.data as ProofCleanupSummaryRpcResponse | null | undefined) ?? null;

  if (!summaryPayload?.ok) {
    return {
      ok: false,
      code: summaryPayload?.code ?? "proof_cleanup_summary_denied",
      message:
        summaryPayload?.message?.trim() ||
        "Proof cleanup monitoring is unavailable for this account.",
      summary: null,
      failures: [],
      events: [],
    };
  }

  const summary = toSummaryRecord(summaryPayload.summary);

  if (!summary) {
    return {
      ok: false,
      code: "proof_cleanup_monitoring_not_ready",
      message: PROOF_CLEANUP_MONITORING_NOT_READY_MESSAGE,
      summary: null,
      failures: [],
      events: [],
    };
  }

  const failuresResult = await access.supabase.rpc(
    "list_proof_cleanup_failures_for_operator",
    {
      requested_limit: limit,
      requested_offset: offset,
    },
  );

  if (failuresResult.error) {
    return {
      ok: false,
      code: "proof_cleanup_monitoring_not_ready",
      message: PROOF_CLEANUP_MONITORING_NOT_READY_MESSAGE,
      summary: null,
      failures: [],
      events: [],
    };
  }

  const failuresPayload =
    (failuresResult.data as ProofCleanupFailuresRpcResponse | null | undefined) ??
    null;

  if (!failuresPayload?.ok) {
    return {
      ok: false,
      code: failuresPayload?.code ?? "proof_cleanup_failures_denied",
      message:
        failuresPayload?.message?.trim() ||
        "Proof cleanup failure monitoring is unavailable for this account.",
      summary: null,
      failures: [],
      events: [],
    };
  }

  const eventsResult = await access.supabase.rpc(
    "list_proof_cleanup_events_for_operator",
    {
      requested_event_type: input?.eventType?.trim() || null,
      requested_limit: limit,
      requested_offset: offset,
    },
  );

  if (eventsResult.error) {
    return {
      ok: false,
      code: "proof_cleanup_monitoring_not_ready",
      message: PROOF_CLEANUP_MONITORING_NOT_READY_MESSAGE,
      summary: null,
      failures: [],
      events: [],
    };
  }

  const eventsPayload =
    (eventsResult.data as ProofCleanupEventsRpcResponse | null | undefined) ?? null;

  if (!eventsPayload?.ok) {
    return {
      ok: false,
      code: eventsPayload?.code ?? "proof_cleanup_events_denied",
      message:
        eventsPayload?.message?.trim() ||
        "Proof cleanup event monitoring is unavailable for this account.",
      summary: null,
      failures: [],
      events: [],
    };
  }

  return {
    ok: true,
    code: "proof_cleanup_monitoring_loaded",
    summary,
    failures: (failuresPayload.failures ?? [])
      .map((row) => toFailureRecord(row))
      .filter((row): row is ProofCleanupFailureRecord => row !== null),
    events: (eventsPayload.events ?? [])
      .map((row) => toEventRecord(row))
      .filter((row): row is ProofCleanupEventRecord => row !== null),
  };
}
