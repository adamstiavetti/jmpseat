import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { AdminShell } from "../../../../src/components/admin/AdminShell";
import { AuthCard } from "../../../../src/components/auth/AuthCard";
import authStyles from "../../../../src/components/auth/auth.module.css";
import {
  createApprovedEmailDomainAction,
  disableApprovedEmailDomainAction,
  getApprovedDomainsForOperator,
  APPROVED_DOMAIN_OPERATOR_SCOPE,
  APPROVED_DOMAIN_ROUTE,
  updateApprovedEmailDomainAction,
} from "../../../../src/lib/admin/approvedDomains";
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
import styles from "./approvedDomains.module.css";

type ApprovedDomainsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ApprovedDomainsPage({
  searchParams,
}: ApprovedDomainsPageProps) {
  const params = await searchParams;
  const searchError = getValue(params.error);
  const message = getValue(params.message);
  const searchQuery = getValue(params.q)?.trim() ?? "";
  const highlightId = getValue(params.highlight);
  const appContext = await getCurrentAppAccessContext();
  const gate = getPrivateAppGateResult({
    routeKind: "private-child",
    nextPath: ADMIN_ROUTES.approvedDomains,
    context: appContext,
  });

  await recordSecurityEvent({
    userId: appContext.user?.id,
    eventType: getPrivateAccessEventType(gate),
    route: ADMIN_ROUTES.approvedDomains,
    result: getPrivateRouteAuditResult(gate, appContext),
    metadata: {
      route_kind: "private-child",
      section: "admin-approved-domains",
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
      redirect(`${AUTH_ROUTES.login}?next=${encodeURIComponent(ADMIN_ROUTES.approvedDomains)}`);
    }

    return (
      <AuthCard
        eyebrow="Epoch 05 Admin"
        title="Approved domains need Supabase auth"
        description="This operator-only approved-domain surface depends on the same Supabase auth configuration used by the private web app."
        error="Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to exercise runtime approved-domain management."
      >
        <p className={authStyles.hint}>
          Private-app gating runs before this fallback. Runtime approved-domain
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
        title="Approved email domains"
        description="This operator-only surface manages approved work-email domains without exposing disabled records to normal authenticated users."
        currentPath={ADMIN_ROUTES.approvedDomains}
        navigation={navigation}
        error={operatorContext.loadError}
        message="Approved-domain operator tooling is not ready yet. Required operator-scope support may be unavailable, and no privileged domain data was loaded."
        footer={
          <p className={authStyles.hint}>
            Private-app gating passed, but operator-scope support did not load.
            This route does not treat that setup state as missing permission,
            and it does not load approved-domain records while the dependency is
            unavailable.
          </p>
        }
      >
        <section className={styles.section} aria-labelledby="approved-domains-not-ready">
          <h2 id="approved-domains-not-ready" className={styles.sectionTitle}>
            Operator tooling setup required
          </h2>
          <p className={styles.sectionText}>
            Approved-domain management depends on the operator grants
            foundation plus the approved-domain migration for this ticket. If
            either operator-scope support or the approved-domain RPC layer is
            unavailable, this route stays in a safe setup state instead of
            exposing data or treating the account as unauthorized.
          </p>
          <p className={styles.hint}>
            No approved-domain rows, inactive records, or internal metadata
            were loaded while this dependency was unavailable.
          </p>
        </section>
      </AdminShell>
    );
  }

  if (
    !hasOperatorScope({
      scopes: operatorContext.scopes,
      scope: APPROVED_DOMAIN_OPERATOR_SCOPE,
    })
  ) {
    await recordSecurityEvent({
      userId: appContext.user?.id,
      eventType: "approved_email_domain.unauthorized_attempt",
      route: APPROVED_DOMAIN_ROUTE,
      result: "denied",
      metadata: {
        reason_code: "missing_manage_approved_domains_scope",
      },
    });
    redirect(AUTH_ROUTES.accessRestricted);
  }

  const approvedDomainsResult = await getApprovedDomainsForOperator(searchQuery);

  return (
    <AdminShell
      eyebrow="Epoch 05 Admin"
      title="Approved email domains"
      description="This operator-only surface manages approved work-email domains without exposing disabled records to normal authenticated users."
      currentPath={ADMIN_ROUTES.approvedDomains}
      navigation={navigation}
      error={searchError ?? (!approvedDomainsResult.ok ? approvedDomainsResult.message : undefined)}
      message={
        message ??
        "Only explicit active operator grants with operator.manage_approved_domains can read or mutate this tooling surface."
      }
      footer={
        <p className={authStyles.hint}>
          Domain mutations are soft-disable only, audited, and separate from
          verification claim issuance. Reviewer scope, beta access, verification
          claims, login email, work email, and profile text do not authorize this route.
        </p>
      }
    >
      <div className={styles.stack}>
        <section className={styles.section} aria-labelledby="approved-domains-overview">
          <h2 id="approved-domains-overview" className={styles.sectionTitle}>
            Scope and safety
          </h2>
          <p className={styles.sectionText}>
            Approved domains determine whether the work-email verification path can
            start. This tool does not issue claims, mutate historical verification
            evidence, or expose inactive domain records to ordinary authenticated users.
          </p>
          <p className={styles.hint}>
            Use only organization-controlled work-email domains. Personal email
            providers, protocol-prefixed inputs, and path-like values are rejected.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="approved-domains-search">
          <h2 id="approved-domains-search" className={styles.sectionTitle}>
            Search and create
          </h2>
          <div className={styles.toolbar}>
            <form className={styles.searchForm} method="get">
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <label htmlFor="approved-domain-search">Search domains or labels</label>
                  <input
                    id="approved-domain-search"
                    name="q"
                    type="search"
                    placeholder="airline.test or airline label"
                    defaultValue={searchQuery}
                  />
                </div>
              </div>
              <div className={styles.searchActions}>
                <button className={styles.buttonSecondary} type="submit">
                  Search
                </button>
                {searchQuery ? (
                  <a className={styles.buttonSecondary} href={APPROVED_DOMAIN_ROUTE}>
                    Clear
                  </a>
                ) : null}
              </div>
            </form>

            <form className={styles.createForm} action={createApprovedEmailDomainAction}>
              <div className={styles.fieldPair}>
                <div className={styles.field}>
                  <label htmlFor="create-domain">Domain</label>
                  <input
                    id="create-domain"
                    name="domain"
                    type="text"
                    inputMode="email"
                    placeholder="airline.test"
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="create-airline">Airline / organization label</label>
                  <input
                    id="create-airline"
                    name="airline"
                    type="text"
                    placeholder="Optional display label"
                  />
                </div>
              </div>
              <div className={styles.fieldPair}>
                <div className={styles.field}>
                  <label htmlFor="create-status">Status</label>
                  <select id="create-status" name="status" defaultValue="active">
                    <option value="active">active</option>
                    <option value="disabled">disabled</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label htmlFor="create-reason">Reason</label>
                  <input
                    id="create-reason"
                    name="reason"
                    type="text"
                    placeholder="Optional operator note"
                  />
                </div>
              </div>
              <div className={styles.formActions}>
                <button className={styles.buttonPrimary} type="submit">
                  Create approved domain
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="approved-domains-list">
          <h2 id="approved-domains-list" className={styles.sectionTitle}>
            Approved domain records
          </h2>
          {!approvedDomainsResult.ok || approvedDomainsResult.domains.length === 0 ? (
            <p className={styles.emptyState}>
              {approvedDomainsResult.ok
                ? searchQuery
                  ? "No approved domains matched that search."
                  : "No approved domains are configured yet."
                : "Approved-domain records are unavailable until the operator-management migration is present in this environment."}
            </p>
          ) : (
            <div className={styles.domainList}>
              {approvedDomainsResult.domains.map((domainRecord) => (
                <article
                  key={domainRecord.id}
                  className={`${styles.domainCard} ${highlightId === domainRecord.id ? styles.domainCardHighlight : ""}`.trim()}
                >
                  <div className={styles.domainHeader}>
                    <h3 className={styles.domainName}>{domainRecord.domain}</h3>
                    <span className={styles.statusBadge}>{domainRecord.status}</span>
                  </div>
                  <div className={styles.metadata}>
                    <div>
                      Airline / organization label: {domainRecord.airline ?? "none"}
                    </div>
                    <div>Created at: {domainRecord.createdAt}</div>
                    <div>Updated at: {domainRecord.updatedAt}</div>
                  </div>

                  <form className={styles.rowForm} action={updateApprovedEmailDomainAction}>
                    <input type="hidden" name="domain_id" value={domainRecord.id} />
                    <div className={styles.fieldPair}>
                      <div className={styles.field}>
                        <label htmlFor={`domain-${domainRecord.id}`}>Domain</label>
                        <input
                          id={`domain-${domainRecord.id}`}
                          name="domain"
                          type="text"
                          defaultValue={domainRecord.domain}
                          required
                        />
                      </div>
                      <div className={styles.field}>
                        <label htmlFor={`airline-${domainRecord.id}`}>
                          Airline / organization label
                        </label>
                        <input
                          id={`airline-${domainRecord.id}`}
                          name="airline"
                          type="text"
                          defaultValue={domainRecord.airline ?? ""}
                        />
                      </div>
                    </div>
                    <div className={styles.fieldPair}>
                      <div className={styles.field}>
                        <label htmlFor={`status-${domainRecord.id}`}>Status</label>
                        <select
                          id={`status-${domainRecord.id}`}
                          name="status"
                          defaultValue={domainRecord.status}
                        >
                          <option value="active">active</option>
                          <option value="disabled">disabled</option>
                        </select>
                      </div>
                      <div className={styles.field}>
                        <label htmlFor={`reason-${domainRecord.id}`}>Reason</label>
                        <input
                          id={`reason-${domainRecord.id}`}
                          name="reason"
                          type="text"
                          placeholder="Optional operator note"
                        />
                      </div>
                    </div>
                    <div className={styles.rowActions}>
                      <button className={styles.buttonPrimary} type="submit">
                        Save changes
                      </button>
                    </div>
                  </form>

                  {domainRecord.status === "active" ? (
                    <form className={styles.disableForm} action={disableApprovedEmailDomainAction}>
                      <input type="hidden" name="domain_id" value={domainRecord.id} />
                      <div className={styles.field}>
                        <label htmlFor={`disable-reason-${domainRecord.id}`}>
                          Disable reason
                        </label>
                        <input
                          id={`disable-reason-${domainRecord.id}`}
                          name="reason"
                          type="text"
                          placeholder="Optional operator note"
                        />
                      </div>
                      <div className={styles.rowActions}>
                        <button className={styles.buttonDanger} type="submit">
                          Disable domain
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
