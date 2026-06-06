import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { AdminShell } from "../../../../src/components/admin/AdminShell";
import { AuthCard } from "../../../../src/components/auth/AuthCard";
import authStyles from "../../../../src/components/auth/auth.module.css";
import {
  ADMIN_ROUTES,
  buildAdminNavigation,
  getCurrentOperatorAccess,
  hasOperatorScope,
} from "../../../../src/lib/admin/access";
import {
  PROOF_CLEANUP_MONITORING_SCOPE,
  normalizeProofCleanupMonitoringLimit,
} from "../../../../src/lib/admin/proofCleanupMonitoringShared";
import { runProofCleanupForOperatorAction } from "../../../../src/lib/admin/proofCleanupControls";
import {
  PROOF_CLEANUP_RUN_CONFIRMATION,
  PROOF_CLEANUP_RUN_SCOPE,
  normalizeProofCleanupRunLimit,
} from "../../../../src/lib/admin/proofCleanupControlsShared";
import {
  PROOF_CLEANUP_MONITORING_ROUTE,
  getProofCleanupMonitoringForOperator,
  recordProofCleanupMonitoringUnauthorizedRouteAttempt,
} from "../../../../src/lib/admin/proofCleanupMonitoring";
import { AUTH_ROUTES } from "../../../../src/lib/auth/routes";
import { getCurrentAppAccessContext } from "../../../../src/lib/betaAccess/server";
import {
  getPrivateAccessSource,
  getPrivateAppGateResult,
  getPrivateRouteAuditResult,
} from "../../../../src/lib/privateApp/access";
import { getPrivateAccessEventType } from "../../../../src/lib/securityEvents/securityEvents";
import { recordSecurityEvent } from "../../../../src/lib/securityEvents/server";
import { getSupabaseBrowserEnv } from "../../../../src/lib/supabase/config";
import { getCurrentVerificationReviewerAuthorizationContext } from "../../../../src/lib/verification/reviewServer";
import styles from "./proofCleanup.module.css";

type ProofCleanupPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatNullable(value: string | null | undefined) {
  return value || "none";
}

function getNumberParam(value: string | string[] | undefined) {
  const parsed = Number.parseInt(getValue(value) ?? "", 10);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function getManualRunMessage(status: string | null) {
  switch (status) {
    case "completed":
      return "Manual cleanup completed for eligible expired proof files.";
    case "failed":
      return "Manual cleanup finished with failures. Failed proof deletion rows keep deleted_at unset.";
    case "confirmation_required":
      return `Type ${PROOF_CLEANUP_RUN_CONFIRMATION} to confirm a manual cleanup run.`;
    case "denied":
      return "Operator scope required to run proof cleanup.";
    case "not_ready":
      return "Manual cleanup controls are not ready in this environment.";
    case "audit_not_recorded":
      return "Manual cleanup did not run because the required audit event could not be recorded.";
    case "outcome_audit_not_recorded":
      return "Manual cleanup may have run, but the required outcome audit event could not be recorded. Treat this run as needing operator investigation.";
    default:
      return null;
  }
}

export default async function ProofCleanupMonitoringPage({
  searchParams,
}: ProofCleanupPageProps) {
  const params = await searchParams;
  const eventType = getValue(params.event_type)?.trim() || null;
  const limit = normalizeProofCleanupMonitoringLimit(getValue(params.limit));
  const manualStatus = getValue(params.manual_status)?.trim() || null;
  const manualLimit = normalizeProofCleanupRunLimit(getValue(params.manual_limit));
  const manualRunMessage = getManualRunMessage(manualStatus);

  const appContext = await getCurrentAppAccessContext();
  const gate = getPrivateAppGateResult({
    routeKind: "private-child",
    nextPath: ADMIN_ROUTES.proofCleanup,
    context: appContext,
  });

  await recordSecurityEvent({
    userId: appContext.user?.id,
    eventType: getPrivateAccessEventType(gate),
    route: ADMIN_ROUTES.proofCleanup,
    result: getPrivateRouteAuditResult(gate, appContext),
    metadata: {
      route_kind: "private-child",
      section: "admin-proof-cleanup-monitoring",
      access_source: getPrivateAccessSource(gate),
      ...(getPrivateAccessSource(gate) === "operator_internal"
        ? { operator_private_app_access: true }
        : {}),
    },
  });

  if (gate.kind === "redirect") {
    redirect(gate.path);
  }

  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    const cookieStore = await cookies();
    const hasSupabaseSessionCookie = cookieStore
      .getAll()
      .some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"));

    if (!hasSupabaseSessionCookie) {
      redirect(`${AUTH_ROUTES.login}?next=${encodeURIComponent(ADMIN_ROUTES.proofCleanup)}`);
    }

    return (
      <AuthCard
        eyebrow="Epoch 05 Admin"
        title="Proof cleanup monitoring needs Supabase auth"
        description="This operator-only monitoring surface depends on the same Supabase auth configuration used by the private web app."
        error="Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to exercise runtime cleanup monitoring."
      >
        <p className={authStyles.hint}>
          Private-app gating runs before this fallback. Runtime cleanup
          monitoring still requires configured Supabase auth plus explicit
          operator grants.
        </p>
      </AuthCard>
    );
  }

  const reviewerContext =
    await getCurrentVerificationReviewerAuthorizationContext();
  const operatorContext = await getCurrentOperatorAccess();
  const navigation = buildAdminNavigation({
    reviewerAuthorized: reviewerContext.reviewerAuthorized,
    operatorScopes: operatorContext.scopes,
  });

  if (operatorContext.loadError) {
    return (
      <AdminShell
        eyebrow="Epoch 05 Admin"
        title="Proof cleanup monitoring"
        description="Read-only cleanup health and failure visibility for explicitly scoped operators."
        currentPath={ADMIN_ROUTES.proofCleanup}
        navigation={navigation}
        error={operatorContext.loadError}
        message="Proof cleanup monitoring is not ready yet. Required operator-scope support may be unavailable, and no cleanup data was loaded."
        footer={
          <p className={authStyles.hint}>
            Private-app gating passed, but operator-scope support did not load.
            This route treats that as setup/not-ready rather than a missing
            permission denial.
          </p>
        }
      >
        <section className={styles.section} aria-labelledby="cleanup-not-ready">
          <h2 id="cleanup-not-ready" className={styles.sectionTitle}>
            Operator tooling setup required
          </h2>
          <p className={styles.sectionText}>
            Proof cleanup monitoring depends on the operator grants foundation
            plus the E05-T06 migration. While either dependency is unavailable,
            this route stays in a safe setup state.
          </p>
        </section>
      </AdminShell>
    );
  }

  const operatorCanMonitor = hasOperatorScope({
    scopes: operatorContext.scopes,
    scope: PROOF_CLEANUP_MONITORING_SCOPE,
  });
  const operatorCanRunCleanup = hasOperatorScope({
    scopes: operatorContext.scopes,
    scope: PROOF_CLEANUP_RUN_SCOPE,
  });

  if (!operatorCanMonitor && !operatorCanRunCleanup) {
    if (appContext.user?.id) {
      await recordProofCleanupMonitoringUnauthorizedRouteAttempt(appContext.user.id);
    }
    redirect(AUTH_ROUTES.accessRestricted);
  }

  const cleanupResult = operatorCanMonitor
    ? await getProofCleanupMonitoringForOperator({
        eventType,
        limit,
      })
    : null;

  return (
    <AdminShell
      eyebrow="Epoch 05 Admin"
      title="Proof cleanup"
      description="Cleanup health monitoring plus bounded manual execution for explicitly scoped operators."
      currentPath={PROOF_CLEANUP_MONITORING_ROUTE}
      navigation={navigation}
      error={cleanupResult && !cleanupResult.ok ? cleanupResult.message : undefined}
      message="This page never renders raw proof files, proof contents, proof-view links, URLs, filenames, or object-location details."
      footer={
        <p className={authStyles.hint}>
          Monitoring uses `operator.monitor_proof_cleanup`. Manual cleanup uses
          `operator.run_proof_cleanup` and only invokes the existing eligible
          proof-retention cleanup helper.
        </p>
      }
    >
      <div className={styles.stack}>
        {operatorCanMonitor ? (
          <section className={styles.section} aria-labelledby="cleanup-filters">
            <h2 id="cleanup-filters" className={styles.sectionTitle}>
              Filters
            </h2>
            <form className={styles.searchForm} method="get">
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <label htmlFor="cleanup-event-type">Cleanup event type</label>
                  <input
                    id="cleanup-event-type"
                    name="event_type"
                    defaultValue={eventType ?? ""}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="cleanup-limit">Limit</label>
                  <input
                    id="cleanup-limit"
                    name="limit"
                    type="number"
                    min="1"
                    max="50"
                    defaultValue={limit}
                  />
                </div>
              </div>
              <div className={styles.searchActions}>
                <input className={styles.buttonSecondary} type="submit" value="Apply filters" />
                <a className={styles.buttonSecondary} href={PROOF_CLEANUP_MONITORING_ROUTE}>
                  Clear
                </a>
              </div>
            </form>
          </section>
        ) : null}

        {cleanupResult?.ok ? (
          <section className={styles.section} aria-labelledby="cleanup-summary">
            <h2 id="cleanup-summary" className={styles.sectionTitle}>
              Cleanup health summary
            </h2>
            <div className={styles.summaryGrid}>
              <article className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Scheduled</span>
                <strong className={styles.summaryValue}>
                  {cleanupResult.summary.scheduledCount}
                </strong>
              </article>
              <article className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Due</span>
                <strong className={styles.summaryValue}>
                  {cleanupResult.summary.dueCount}
                </strong>
              </article>
              <article className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Overdue</span>
                <strong className={styles.summaryValue}>
                  {cleanupResult.summary.overdueCount}
                </strong>
              </article>
              <article className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Deleted</span>
                <strong className={styles.summaryValue}>
                  {cleanupResult.summary.deletedCount}
                </strong>
              </article>
              <article className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Failure events</span>
                <strong className={styles.summaryValue}>
                  {cleanupResult.summary.failedEventCount}
                </strong>
              </article>
              <article className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Recent failures</span>
                <strong className={styles.summaryValue}>
                  {cleanupResult.summary.recentFailureCount}
                </strong>
              </article>
            </div>
            <p className={styles.sectionText}>
              Last cleanup event: {formatNullable(cleanupResult.summary.lastCleanupEventAt)}.
              Last failure: {formatNullable(cleanupResult.summary.lastFailureAt)}.
            </p>
          </section>
        ) : null}

        <section className={styles.section} aria-labelledby="cleanup-controls">
          <h2 id="cleanup-controls" className={styles.sectionTitle}>
            Manual controls
          </h2>
          {manualRunMessage ? (
            <p className={styles.resultMessage}>{manualRunMessage}</p>
          ) : null}
          {manualStatus === "completed" ||
          manualStatus === "failed" ||
          manualStatus === "outcome_audit_not_recorded" ? (
            <div className={styles.summaryGrid}>
              <article className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Run limit</span>
                <strong className={styles.summaryValue}>{manualLimit}</strong>
              </article>
              <article className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Scanned</span>
                <strong className={styles.summaryValue}>
                  {getNumberParam(params.manual_scanned)}
                </strong>
              </article>
              <article className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Deleted</span>
                <strong className={styles.summaryValue}>
                  {getNumberParam(params.manual_deleted)}
                </strong>
              </article>
              <article className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Missing</span>
                <strong className={styles.summaryValue}>
                  {getNumberParam(params.manual_missing)}
                </strong>
              </article>
              <article className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Failed</span>
                <strong className={styles.summaryValue}>
                  {getNumberParam(params.manual_failed)}
                </strong>
              </article>
              <article className={styles.summaryCard}>
                <span className={styles.summaryLabel}>Skipped</span>
                <strong className={styles.summaryValue}>
                  {getNumberParam(params.manual_skipped)}
                </strong>
              </article>
            </div>
          ) : null}
          {operatorCanRunCleanup ? (
            <form className={styles.searchForm} action={runProofCleanupForOperatorAction}>
              <p className={styles.sectionText}>
                This action runs cleanup for eligible expired proof files only.
                It accepts a bounded batch limit and does not accept bucket,
                object, evidence, file, or path identifiers.
              </p>
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <label htmlFor="manual-cleanup-limit">Batch limit</label>
                  <input
                    id="manual-cleanup-limit"
                    name="limit"
                    type="number"
                    min="1"
                    max="25"
                    defaultValue={manualLimit}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="manual-cleanup-confirmation">
                    Type {PROOF_CLEANUP_RUN_CONFIRMATION}
                  </label>
                  <input
                    id="manual-cleanup-confirmation"
                    name="confirmation"
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className={styles.searchActions}>
                <button className={styles.buttonDanger} type="submit">
                  Run eligible cleanup
                </button>
              </div>
            </form>
          ) : (
            <p className={styles.sectionText}>
              Manual cleanup execution requires `operator.run_proof_cleanup`.
              Monitoring access alone cannot run cleanup.
            </p>
          )}
        </section>

        {cleanupResult?.ok ? (
          <section className={styles.section} aria-labelledby="cleanup-failures">
            <h2 id="cleanup-failures" className={styles.sectionTitle}>
              Recent failed cleanup references
            </h2>
            {cleanupResult.failures.length > 0 ? (
              <div className={styles.recordList}>
                {cleanupResult.failures.map((failure) => (
                  <article key={failure.eventId} className={styles.recordCard}>
                    <div className={styles.recordHeader}>
                      <h3 className={styles.recordTitle}>
                        {failure.reasonCode ?? "cleanup failure"}
                      </h3>
                      <span className={styles.statusBadge}>{failure.result ?? "failed"}</span>
                    </div>
                    <dl className={styles.metadata}>
                      <div>
                        <dt>Event</dt>
                        <dd>{failure.eventId}</dd>
                      </div>
                      <div>
                        <dt>Evidence</dt>
                        <dd>{formatNullable(failure.verificationEvidenceId)}</dd>
                      </div>
                      <div>
                        <dt>Request</dt>
                        <dd>{formatNullable(failure.verificationRequestId)}</dd>
                      </div>
                      <div>
                        <dt>Status</dt>
                        <dd>{formatNullable(failure.evidenceStatus)}</dd>
                      </div>
                      <div>
                        <dt>Delete after</dt>
                        <dd>{formatNullable(failure.deleteAfter)}</dd>
                      </div>
                      <div>
                        <dt>Deleted</dt>
                        <dd>{formatNullable(failure.deletedAt)}</dd>
                      </div>
                      <div>
                        <dt>Failed</dt>
                        <dd>{failure.failedAt}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.emptyState}>
                No failed cleanup references matched the current filters.
              </p>
            )}
          </section>
        ) : null}

        {cleanupResult?.ok ? (
          <section className={styles.section} aria-labelledby="cleanup-events">
            <h2 id="cleanup-events" className={styles.sectionTitle}>
              Recent cleanup events
            </h2>
            {cleanupResult.events.length > 0 ? (
              <div className={styles.recordList}>
                {cleanupResult.events.map((event) => (
                  <article key={event.id} className={styles.recordCard}>
                    <div className={styles.recordHeader}>
                      <h3 className={styles.recordTitle}>{event.eventType}</h3>
                      <span className={styles.statusBadge}>{event.result ?? "recorded"}</span>
                    </div>
                    <dl className={styles.metadata}>
                      <div>
                        <dt>Event</dt>
                        <dd>{event.id}</dd>
                      </div>
                      <div>
                        <dt>User</dt>
                        <dd>{formatNullable(event.userId)}</dd>
                      </div>
                      <div>
                        <dt>Route</dt>
                        <dd>{formatNullable(event.route)}</dd>
                      </div>
                      <div>
                        <dt>Metadata keys</dt>
                        <dd>{Object.keys(event.metadata).join(", ") || "none"}</dd>
                      </div>
                      <div>
                        <dt>Created</dt>
                        <dd>{event.createdAt}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.emptyState}>
                No cleanup events matched the current filters.
              </p>
            )}
          </section>
        ) : null}
      </div>
    </AdminShell>
  );
}
