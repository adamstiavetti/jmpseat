import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { AdminShell } from "../../../../src/components/admin/AdminShell";
import { AuthCard } from "../../../../src/components/auth/AuthCard";
import authStyles from "../../../../src/components/auth/auth.module.css";
import {
  ADMIN_ROUTES,
  buildAdminNavigation,
  getCurrentOperatorAccess,
  hasAnyOperatorScope,
} from "../../../../src/lib/admin/access";
import {
  AUDIT_INSPECTION_SCOPES,
  canReadAuditEvents,
  canReadVerificationRequests,
  normalizeAuditLimit,
} from "../../../../src/lib/admin/verificationAuditShared";
import {
  VERIFICATION_AUDIT_ROUTE,
  getVerificationAuditForOperator,
  recordVerificationAuditUnauthorizedRouteAttempt,
} from "../../../../src/lib/admin/verificationAudit";
import { AUTH_ROUTES } from "../../../../src/lib/auth/routes";
import { getCurrentAppAccessContext } from "../../../../src/lib/betaAccess/server";
import {
  getPrivateAppGateResult,
  getPrivateRouteAuditResult,
} from "../../../../src/lib/privateApp/access";
import { getPrivateAccessEventType } from "../../../../src/lib/securityEvents/securityEvents";
import { recordSecurityEvent } from "../../../../src/lib/securityEvents/server";
import { getSupabaseBrowserEnv } from "../../../../src/lib/supabase/config";
import { getCurrentVerificationReviewerAuthorizationContext } from "../../../../src/lib/verification/reviewServer";
import styles from "./audit.module.css";

type VerificationAuditPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatNullable(value: string | null | undefined) {
  return value || "none";
}

export default async function VerificationAuditPage({
  searchParams,
}: VerificationAuditPageProps) {
  const params = await searchParams;
  const requestStatus = getValue(params.status)?.trim() || null;
  const requestMethod = getValue(params.method)?.trim() || null;
  const eventType = getValue(params.event_type)?.trim() || null;
  const selectedRequestId = getValue(params.request_id)?.trim() || null;
  const limit = normalizeAuditLimit(getValue(params.limit));

  const appContext = await getCurrentAppAccessContext();
  const gate = getPrivateAppGateResult({
    routeKind: "private-child",
    nextPath: ADMIN_ROUTES.auditInspection,
    context: appContext,
  });

  await recordSecurityEvent({
    userId: appContext.user?.id,
    eventType: getPrivateAccessEventType(gate),
    route: ADMIN_ROUTES.auditInspection,
    result: getPrivateRouteAuditResult(gate, appContext),
    metadata: {
      route_kind: "private-child",
      section: "admin-audit-inspection",
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
      redirect(`${AUTH_ROUTES.login}?next=${encodeURIComponent(ADMIN_ROUTES.auditInspection)}`);
    }

    return (
      <AuthCard
        eyebrow="Epoch 05 Admin"
        title="Audit inspection needs Supabase auth"
        description="This operator-only audit surface depends on the same Supabase auth configuration used by the private web app."
        error="Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to exercise runtime audit inspection."
      >
        <p className={authStyles.hint}>
          Private-app gating runs before this fallback. Runtime audit inspection
          still requires configured Supabase auth plus explicit operator grants.
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
        title="Verification audit inspection"
        description="Metadata-only verification and security-event inspection for explicitly scoped operators."
        currentPath={ADMIN_ROUTES.auditInspection}
        navigation={navigation}
        error={operatorContext.loadError}
        message="Audit inspection operator tooling is not ready yet. Required operator-scope support may be unavailable, and no verification or event data was loaded."
        footer={
          <p className={authStyles.hint}>
            Private-app gating passed, but operator-scope support did not load.
            This route treats that as setup/not-ready rather than a missing
            permission denial.
          </p>
        }
      >
        <section className={styles.section} aria-labelledby="audit-not-ready">
          <h2 id="audit-not-ready" className={styles.sectionTitle}>
            Operator tooling setup required
          </h2>
          <p className={styles.sectionText}>
            Verification audit inspection depends on the operator grants
            foundation plus the E05-T05 migration. While either dependency is
            unavailable, this route stays in a safe setup state.
          </p>
        </section>
      </AdminShell>
    );
  }

  if (
    !hasAnyOperatorScope({
      scopes: operatorContext.scopes,
      requiredScopes: AUDIT_INSPECTION_SCOPES,
    })
  ) {
    if (appContext.user?.id) {
      await recordVerificationAuditUnauthorizedRouteAttempt(appContext.user.id);
    }
    redirect(AUTH_ROUTES.accessRestricted);
  }

  const auditResult = await getVerificationAuditForOperator({
    requestStatus,
    requestMethod,
    eventType,
    selectedRequestId,
    limit,
  });
  const canReadRequests = canReadVerificationRequests(operatorContext.scopes);
  const canReadEvents = canReadAuditEvents(operatorContext.scopes);

  return (
    <AdminShell
      eyebrow="Epoch 05 Admin"
      title="Verification audit inspection"
      description="Metadata-only verification and security-event inspection for explicitly scoped operators."
      currentPath={VERIFICATION_AUDIT_ROUTE}
      navigation={navigation}
      error={!auditResult.ok ? auditResult.message : undefined}
      message="Audit inspection never renders raw proof files, proof-view links, signed URLs, proof contents, or broad storage identifiers."
      footer={
        <p className={authStyles.hint}>
          Request inspection uses `operator.read_verification_requests`.
          Security-event inspection uses `operator.read_audit`. Reviewer scope
          does not activate this route.
        </p>
      }
    >
      <div className={styles.stack}>
        <section className={styles.section} aria-labelledby="audit-filters">
          <h2 id="audit-filters" className={styles.sectionTitle}>
            Filters
          </h2>
          <form className={styles.searchForm} method="get">
            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label htmlFor="audit-status">Request status</label>
                <input id="audit-status" name="status" defaultValue={requestStatus ?? ""} />
              </div>
              <div className={styles.field}>
                <label htmlFor="audit-method">Request method</label>
                <input id="audit-method" name="method" defaultValue={requestMethod ?? ""} />
              </div>
              <div className={styles.field}>
                <label htmlFor="audit-event-type">Event type</label>
                <input id="audit-event-type" name="event_type" defaultValue={eventType ?? ""} />
              </div>
              <div className={styles.field}>
                <label htmlFor="audit-limit">Limit</label>
                <input id="audit-limit" name="limit" type="number" min="1" max="50" defaultValue={limit} />
              </div>
            </div>
            <div className={styles.searchActions}>
              <button className={styles.buttonSecondary} type="submit">
                Apply filters
              </button>
              <a className={styles.buttonSecondary} href={VERIFICATION_AUDIT_ROUTE}>
                Clear
              </a>
            </div>
          </form>
        </section>

        {canReadRequests ? (
          <section className={styles.section} aria-labelledby="audit-requests">
            <h2 id="audit-requests" className={styles.sectionTitle}>
              Verification requests
            </h2>
            {auditResult.ok && auditResult.requests.length > 0 ? (
              <div className={styles.recordList}>
                {auditResult.requests.map((request) => (
                  <article key={request.id} className={styles.recordCard}>
                    <div className={styles.recordHeader}>
                      <h3 className={styles.recordTitle}>{request.status}</h3>
                      <span className={styles.statusBadge}>{request.method}</span>
                    </div>
                    <dl className={styles.metadata}>
                      <div>
                        <dt>Request</dt>
                        <dd>{request.id}</dd>
                      </div>
                      <div>
                        <dt>User</dt>
                        <dd>{request.userId}</dd>
                      </div>
                      <div>
                        <dt>Counts</dt>
                        <dd>
                          {request.evidenceCount} evidence, {request.claimCount} claims,{" "}
                          {request.reviewActionCount} review actions
                        </dd>
                      </div>
                      <div>
                        <dt>Submitted</dt>
                        <dd>{formatNullable(request.submittedAt)}</dd>
                      </div>
                    </dl>
                    <a
                      className={styles.buttonSecondary}
                      href={`${VERIFICATION_AUDIT_ROUTE}?request_id=${encodeURIComponent(request.id)}&limit=${limit}`}
                    >
                      Inspect metadata
                    </a>
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.emptyState}>
                No verification request records matched the current filters.
              </p>
            )}
          </section>
        ) : null}

        {auditResult.ok && auditResult.selectedRequest ? (
          <section className={styles.section} aria-labelledby="audit-detail">
            <h2 id="audit-detail" className={styles.sectionTitle}>
              Selected request metadata
            </h2>
            <div className={styles.recordList}>
              {auditResult.selectedRequest.evidence.map((evidence) => (
                <article key={evidence.id} className={styles.recordCard}>
                  <div className={styles.recordHeader}>
                    <h3 className={styles.recordTitle}>{evidence.evidenceType}</h3>
                    <span className={styles.statusBadge}>{evidence.status}</span>
                  </div>
                  <dl className={styles.metadata}>
                    <div>
                      <dt>Evidence</dt>
                      <dd>{evidence.id}</dd>
                    </div>
                    <div>
                      <dt>Proof present</dt>
                      <dd>{evidence.proofPresent ? "yes" : "no"}</dd>
                    </div>
                    <div>
                      <dt>Deleted</dt>
                      <dd>{formatNullable(evidence.deletedAt)}</dd>
                    </div>
                    <div>
                      <dt>Metadata keys</dt>
                      <dd>{Object.keys(evidence.metadata).join(", ") || "none"}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {auditResult.ok && auditResult.selectedRequestError ? (
          <section className={styles.section} aria-labelledby="audit-detail-error">
            <h2 id="audit-detail-error" className={styles.sectionTitle}>
              Selected request metadata
            </h2>
            <p className={styles.emptyState}>{auditResult.selectedRequestError.message}</p>
          </section>
        ) : null}

        {canReadEvents ? (
          <section className={styles.section} aria-labelledby="audit-events">
            <h2 id="audit-events" className={styles.sectionTitle}>
              Security events
            </h2>
            {auditResult.ok && auditResult.events.length > 0 ? (
              <div className={styles.recordList}>
                {auditResult.events.map((event) => (
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
                    </dl>
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.emptyState}>
                No security events matched the current filters.
              </p>
            )}
          </section>
        ) : null}
      </div>
    </AdminShell>
  );
}
