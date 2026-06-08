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
  grantOperatorInternalAccessAction,
  grantOperatorWaitlistContactAccessAction,
  OPERATOR_ACCESS_MANAGEMENT_SCOPE,
  OPERATOR_ACCESS_ROUTE,
} from "../../../../src/lib/admin/operatorGrants";
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
import styles from "./operatorAccess.module.css";

type OperatorAccessPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function OperatorAccessPage({
  searchParams,
}: OperatorAccessPageProps) {
  const params = await searchParams;
  const searchError = getValue(params.error);
  const message = getValue(params.message);
  const appContext = await getCurrentAppAccessContext();
  const gate = getPrivateAppGateResult({
    routeKind: "private-child",
    nextPath: ADMIN_ROUTES.operatorAccess,
    context: appContext,
  });

  await recordSecurityEvent({
    userId: appContext.user?.id,
    eventType: getPrivateAccessEventType(gate),
    route: ADMIN_ROUTES.operatorAccess,
    result: getPrivateRouteAuditResult(gate, appContext),
    metadata: {
      route_kind: "private-child",
      section: "admin-operator-access",
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
      redirect(`${AUTH_ROUTES.login}?next=${encodeURIComponent(ADMIN_ROUTES.operatorAccess)}`);
    }

    return (
      <AuthCard
        eyebrow="Epoch 05 Admin"
        title="Operator access needs Supabase auth"
        description="This operator-only access-management surface depends on the same Supabase auth configuration used by the private web app."
        error="Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to exercise runtime operator grant management."
      >
        <p className={authStyles.hint}>
          Private-app gating runs before this fallback. Runtime operator grant
          management still requires configured Supabase auth plus an existing
          operator with the manage-operator-access scope.
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
        title="Operator access"
        description="This operator-only surface grants bounded post-bootstrap operator scopes to another existing account after first-operator bootstrap is closed."
        currentPath={ADMIN_ROUTES.operatorAccess}
        navigation={navigation}
        error={operatorContext.loadError}
        message="Operator grant management is not ready yet. Required operator-scope support may be unavailable, and no target lookup or grant mutation was attempted."
        footer={
          <p className={authStyles.hint}>
            Private-app gating passed, but operator-scope support did not load.
            This route treats that as setup/not-ready rather than a missing
            permission denial.
          </p>
        }
      >
        <section className={styles.section} aria-labelledby="operator-access-not-ready">
          <h2 id="operator-access-not-ready" className={styles.sectionTitle}>
            Operator tooling setup required
          </h2>
          <p className={styles.sectionText}>
            Post-bootstrap operator grant management depends on the operator
            grants foundation plus the reviewed scope-allowlist migrations for
            this ticket. While either dependency is unavailable, this route
            stays in a safe setup state and does not resolve target accounts.
          </p>
        </section>
      </AdminShell>
    );
  }

  if (
    !hasOperatorScope({
      scopes: operatorContext.scopes,
      scope: OPERATOR_ACCESS_MANAGEMENT_SCOPE,
    })
  ) {
    await recordSecurityEvent({
      userId: appContext.user?.id,
      eventType: "operator_access.unauthorized_attempt",
      route: OPERATOR_ACCESS_ROUTE,
      result: "denied",
      metadata: {
        reason_code: "missing_manage_operator_access_scope",
      },
    });
    redirect(AUTH_ROUTES.accessRestricted);
  }

  return (
    <AdminShell
      eyebrow="Epoch 05 Admin"
      title="Operator access"
      description="This operator-only surface grants bounded post-bootstrap operator scopes to another existing account after first-operator bootstrap is closed."
      currentPath={ADMIN_ROUTES.operatorAccess}
      navigation={navigation}
      error={searchError}
      message={
        message ??
        "Only existing operators with operator.manage_operator_access can grant these bounded post-bootstrap operator scopes."
      }
      footer={
        <p className={authStyles.hint}>
          This grant path is separate from airline-email eligibility, beta
          invite access, reviewer scopes, and community claims. It does not
          mark internal accounts as airline-email verified or grant beta access.
        </p>
      }
    >
      <div className={styles.stack}>
        <section className={styles.section} aria-labelledby="operator-access-overview">
          <h2 id="operator-access-overview" className={styles.sectionTitle}>
            Scope and safety
          </h2>
          <p className={styles.sectionText}>
            Use these controls only to grant bounded post-bootstrap operator
            scopes to an existing account after initial bootstrap is closed.
            Each granted scope is explicit and minimal.
          </p>
          <p className={styles.hint}>
            The target account must already exist. This route does not create
            accounts, does not expose internal account identifiers, and does not create a
            public self-service operator request flow.
          </p>
          <p className={styles.hint}>
            Waitlist contact access is separate from dashboard read access. An
            account still needs the waitlist dashboard read scope before it can
            open `/app/admin/waitlist`, even if it also has waitlist contact access.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="operator-access-form">
          <h2 id="operator-access-form" className={styles.sectionTitle}>
            Grant internal private-app access
          </h2>
          <p className={styles.sectionText}>
            This scope allows operator-internal entry into `/app`. It does not
            unlock approved-domain, reviewer-scope, audit, cleanup, waitlist
            dashboard, or beta invite tooling by itself.
          </p>
          <form className={styles.createForm} action={grantOperatorInternalAccessAction}>
            <div className={styles.fieldPair}>
              <div className={styles.field}>
                <label htmlFor="operator-target-email">Target login email</label>
                <input
                  id="operator-target-email"
                  name="target_email"
                  type="email"
                  inputMode="email"
                  autoComplete="off"
                  placeholder="existing-account@example.com"
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="operator-grant-reason">Reason</label>
                <input
                  id="operator-grant-reason"
                  name="reason"
                  type="text"
                  placeholder="Optional operator note"
                />
              </div>
            </div>
            <div className={styles.formActions}>
              <button className={styles.buttonPrimary} type="submit">
                Grant internal access
              </button>
            </div>
          </form>
        </section>

        <section
          className={styles.section}
          aria-labelledby="operator-waitlist-contact-form"
        >
          <h2 id="operator-waitlist-contact-form" className={styles.sectionTitle}>
            Grant waitlist contact access
          </h2>
          <p className={styles.sectionText}>
            This scope allows viewing raw waitlist contact emails and richer
            per-person survey detail for invite/contact workflow. It does not
            by itself open `/app/admin/waitlist`; dashboard access still
            requires the separate waitlist read scope.
          </p>
          <form
            className={styles.createForm}
            action={grantOperatorWaitlistContactAccessAction}
          >
            <div className={styles.fieldPair}>
              <div className={styles.field}>
                <label htmlFor="waitlist-contact-target-email">Target login email</label>
                <input
                  id="waitlist-contact-target-email"
                  name="target_email"
                  type="email"
                  inputMode="email"
                  autoComplete="off"
                  placeholder="existing-account@example.com"
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="waitlist-contact-reason">Reason</label>
                <input
                  id="waitlist-contact-reason"
                  name="reason"
                  type="text"
                  placeholder="Optional operator note"
                />
              </div>
            </div>
            <div className={styles.formActions}>
              <button className={styles.buttonPrimary} type="submit">
                Grant waitlist contact access
              </button>
            </div>
          </form>
        </section>

        <section className={styles.section} aria-labelledby="operator-access-boundaries">
          <h2 id="operator-access-boundaries" className={styles.sectionTitle}>
            Boundaries preserved
          </h2>
          <ul className={styles.boundaryList}>
            <li>Does not grant beta access.</li>
            <li>Does not mark internal accounts as airline-email verified.</li>
            <li>Does not issue role, base, or restricted-board claims.</li>
            <li>Does not replace the first-operator bootstrap path.</li>
          </ul>
        </section>
      </div>
    </AdminShell>
  );
}
