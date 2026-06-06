import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { AdminShell } from "../../../../src/components/admin/AdminShell";
import { AuthCard } from "../../../../src/components/auth/AuthCard";
import authStyles from "../../../../src/components/auth/auth.module.css";
import {
  REVIEWER_SCOPE_OPERATOR_SCOPE,
  REVIEWER_SCOPE_ROUTE,
  getReviewerScopesForOperator,
  grantVerificationReviewerScopeAction,
  revokeVerificationReviewerScopeAction,
} from "../../../../src/lib/admin/reviewerScopes";
import {
  ADMIN_ROUTES,
  buildAdminNavigation,
  getCurrentOperatorAccess,
  hasOperatorScope,
} from "../../../../src/lib/admin/access";
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
import styles from "./reviewerScopes.module.css";

type ReviewerScopesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ReviewerScopesPage({
  searchParams,
}: ReviewerScopesPageProps) {
  const params = await searchParams;
  const searchError = getValue(params.error);
  const message = getValue(params.message);
  const searchQuery = getValue(params.q)?.trim() ?? "";
  const highlightId = getValue(params.highlight);
  const appContext = await getCurrentAppAccessContext();
  const gate = getPrivateAppGateResult({
    routeKind: "private-child",
    nextPath: ADMIN_ROUTES.reviewerScopes,
    context: appContext,
  });

  await recordSecurityEvent({
    userId: appContext.user?.id,
    eventType: getPrivateAccessEventType(gate),
    route: ADMIN_ROUTES.reviewerScopes,
    result: getPrivateRouteAuditResult(gate, appContext),
    metadata: {
      route_kind: "private-child",
      section: "admin-reviewer-scopes",
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
      redirect(`${AUTH_ROUTES.login}?next=${encodeURIComponent(ADMIN_ROUTES.reviewerScopes)}`);
    }

    return (
      <AuthCard
        eyebrow="Epoch 05 Admin"
        title="Reviewer scopes need Supabase auth"
        description="This operator-only reviewer-scope surface depends on the same Supabase auth configuration used by the private web app."
        error="Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to exercise runtime reviewer-scope management."
      >
        <p className={authStyles.hint}>
          Private-app gating runs before this fallback. Runtime reviewer-scope
          management still requires configured Supabase auth plus explicit
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
        title="Reviewer scopes"
        description="This operator-only surface grants and soft-revokes bounded verification reviewer scopes without changing reviewer queue authorization rules."
        currentPath={ADMIN_ROUTES.reviewerScopes}
        navigation={navigation}
        error={operatorContext.loadError}
        message="Reviewer-scope operator tooling is not ready yet. Required operator-scope support may be unavailable, and no reviewer-scope records were loaded."
        footer={
          <p className={authStyles.hint}>
            Private-app gating passed, but operator-scope support did not load.
            This route treats that as setup/not-ready rather than a missing
            permission denial.
          </p>
        }
      >
        <section className={styles.section} aria-labelledby="reviewer-scopes-not-ready">
          <h2 id="reviewer-scopes-not-ready" className={styles.sectionTitle}>
            Operator tooling setup required
          </h2>
          <p className={styles.sectionText}>
            Reviewer-scope management depends on the operator grants foundation
            plus the E05-T04 migration. While either dependency is unavailable,
            this route stays in a safe setup state and does not load reviewer
            scope data.
          </p>
        </section>
      </AdminShell>
    );
  }

  if (
    !hasOperatorScope({
      scopes: operatorContext.scopes,
      scope: REVIEWER_SCOPE_OPERATOR_SCOPE,
    })
  ) {
    await recordSecurityEvent({
      userId: appContext.user?.id,
      eventType: "reviewer_scope.unauthorized_attempt",
      route: REVIEWER_SCOPE_ROUTE,
      result: "denied",
      metadata: {
        reason_code: "missing_manage_reviewer_scopes_scope",
      },
    });
    redirect(AUTH_ROUTES.accessRestricted);
  }

  const reviewerScopesResult = await getReviewerScopesForOperator(searchQuery);

  return (
    <AdminShell
      eyebrow="Epoch 05 Admin"
      title="Reviewer scopes"
      description="This operator-only surface grants and soft-revokes bounded verification reviewer scopes without changing reviewer queue authorization rules."
      currentPath={ADMIN_ROUTES.reviewerScopes}
      navigation={navigation}
      error={searchError ?? (!reviewerScopesResult.ok ? reviewerScopesResult.message : undefined)}
      message={
        message ??
        "Only explicit active operator grants with operator.manage_reviewer_scopes can read or mutate this tooling surface."
      }
      footer={
        <p className={authStyles.hint}>
          Reviewer-scope management does not grant operator access. Operator
          access does not grant verification review authority unless an active
          reviewer scope also exists.
        </p>
      }
    >
      <div className={styles.stack}>
        <section className={styles.section} aria-labelledby="reviewer-scopes-overview">
          <h2 id="reviewer-scopes-overview" className={styles.sectionTitle}>
            Scope and safety
          </h2>
          <p className={styles.sectionText}>
            Reviewer scopes authorize bounded verification review. Grants and
            revokes are audited, self-grant and self-revoke are blocked, and
            revocation is a soft status change that preserves historical review
            records.
          </p>
          <p className={styles.hint}>
            This slice preserves the existing global, airline, role, and base
            scope model. It does not implement reviewer policy expansion,
            audit inspection, or cleanup monitoring.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="reviewer-scopes-search">
          <h2 id="reviewer-scopes-search" className={styles.sectionTitle}>
            Search and grant
          </h2>
          <div className={styles.toolbar}>
            <form className={styles.searchForm} method="get">
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <label htmlFor="reviewer-scope-search">Search reviewer, scope, or status</label>
                  <input
                    id="reviewer-scope-search"
                    name="q"
                    type="search"
                    placeholder="user id, airline, active"
                    defaultValue={searchQuery}
                  />
                </div>
              </div>
              <div className={styles.searchActions}>
                <button className={styles.buttonSecondary} type="submit">
                  Search
                </button>
                {searchQuery ? (
                  <a className={styles.buttonSecondary} href={REVIEWER_SCOPE_ROUTE}>
                    Clear
                  </a>
                ) : null}
              </div>
            </form>

            <form className={styles.createForm} action={grantVerificationReviewerScopeAction}>
              <div className={styles.fieldPair}>
                <div className={styles.field}>
                  <label htmlFor="grant-target-user">Target auth user UUID</label>
                  <input
                    id="grant-target-user"
                    name="target_user_id"
                    type="text"
                    placeholder="00000000-0000-4000-8000-000000000001"
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="grant-scope-type">Scope type</label>
                  <select id="grant-scope-type" name="scope_type" defaultValue="airline">
                    <option value="global">global</option>
                    <option value="airline">airline</option>
                    <option value="role">role</option>
                    <option value="base">base</option>
                  </select>
                </div>
              </div>
              <div className={styles.fieldPair}>
                <div className={styles.field}>
                  <label htmlFor="grant-scope-value">Scope value</label>
                  <input
                    id="grant-scope-value"
                    name="scope_value"
                    type="text"
                    placeholder="Required except for global"
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="grant-reason">Reason</label>
                  <input
                    id="grant-reason"
                    name="reason"
                    type="text"
                    placeholder="Optional operator note"
                  />
                </div>
              </div>
              <div className={styles.formActions}>
                <button className={styles.buttonPrimary} type="submit">
                  Grant reviewer scope
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="reviewer-scopes-list">
          <h2 id="reviewer-scopes-list" className={styles.sectionTitle}>
            Reviewer scope records
          </h2>
          {!reviewerScopesResult.ok || reviewerScopesResult.reviewerScopes.length === 0 ? (
            <p className={styles.emptyState}>
              {reviewerScopesResult.ok
                ? searchQuery
                  ? "No reviewer scopes matched that search."
                  : "No reviewer scopes are configured yet."
                : "Reviewer-scope records are unavailable until the operator-management migration is present in this environment."}
            </p>
          ) : (
            <div className={styles.scopeList}>
              {reviewerScopesResult.reviewerScopes.map((scopeRecord) => (
                <article
                  key={scopeRecord.id}
                  className={`${styles.scopeCard} ${highlightId === scopeRecord.id ? styles.scopeCardHighlight : ""}`.trim()}
                >
                  <div className={styles.scopeHeader}>
                    <h3 className={styles.scopeName}>
                      {scopeRecord.scopeType}
                      {scopeRecord.scopeValue ? `: ${scopeRecord.scopeValue}` : ""}
                    </h3>
                    <span className={styles.statusBadge}>{scopeRecord.status}</span>
                  </div>
                  <div className={styles.metadata}>
                    <div>Reviewer user id: {scopeRecord.reviewerId}</div>
                    <div>Created at: {scopeRecord.createdAt}</div>
                    <div>Updated at: {scopeRecord.updatedAt}</div>
                    {scopeRecord.revokedAt ? (
                      <div>Revoked at: {scopeRecord.revokedAt}</div>
                    ) : null}
                    {scopeRecord.reason ? (
                      <div>Reason present: yes</div>
                    ) : null}
                  </div>

                  {scopeRecord.status === "active" ? (
                    <form className={styles.disableForm} action={revokeVerificationReviewerScopeAction}>
                      <input type="hidden" name="scope_id" value={scopeRecord.id} />
                      <div className={styles.field}>
                        <label htmlFor={`revoke-reason-${scopeRecord.id}`}>
                          Revoke reason
                        </label>
                        <input
                          id={`revoke-reason-${scopeRecord.id}`}
                          name="reason"
                          type="text"
                          placeholder="Optional operator note"
                        />
                      </div>
                      <div className={styles.rowActions}>
                        <button className={styles.buttonDanger} type="submit">
                          Revoke reviewer scope
                        </button>
                      </div>
                    </form>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
