import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminShell } from "../../../src/components/admin/AdminShell";
import { AuthCard } from "../../../src/components/auth/AuthCard";
import authStyles from "../../../src/components/auth/auth.module.css";
import {
  ADMIN_ROUTES,
  buildAdminNavigation,
  getCurrentOperatorAccess,
  OPERATOR_GRANT_IMPLEMENTATION_STATUS,
} from "../../../src/lib/admin/access";
import { getCurrentAppAccessContext } from "../../../src/lib/betaAccess/server";
import {
  getPrivateAccessSource,
  getPrivateAppGateResult,
  getPrivateRouteAuditResult,
} from "../../../src/lib/privateApp/access";
import { getPrivateAccessEventType } from "../../../src/lib/securityEvents/securityEvents";
import { recordSecurityEvent } from "../../../src/lib/securityEvents/server";
import { getSupabaseBrowserEnv } from "../../../src/lib/supabase/config";
import { getCurrentVerificationReviewerAuthorizationContext } from "../../../src/lib/verification/reviewServer";
import styles from "./admin.module.css";

export default async function AdminHomePage() {
  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    return (
      <AuthCard
        eyebrow="Epoch 05 Admin"
        title="Admin shell needs Supabase auth"
        description="This admin shell depends on the same Supabase auth configuration used by the private web app."
        error="Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to exercise runtime admin-shell behavior."
      >
        <p className={authStyles.hint}>
          Local build and tests can run without those values. Runtime admin
          routing depends on the existing private-app auth and beta-access
          gates.
        </p>
      </AuthCard>
    );
  }

  const appContext = await getCurrentAppAccessContext();
  const gate = getPrivateAppGateResult({
    routeKind: "private-child",
    nextPath: ADMIN_ROUTES.home,
    context: appContext,
  });

  await recordSecurityEvent({
    userId: appContext.user?.id,
    eventType: getPrivateAccessEventType(gate),
    route: ADMIN_ROUTES.home,
    result: getPrivateRouteAuditResult(gate, appContext),
    metadata: {
      route_kind: "private-child",
      section: "admin-home",
      access_source: getPrivateAccessSource(gate),
      ...(getPrivateAccessSource(gate) === "operator_internal"
        ? { operator_private_app_access: true }
        : {}),
    },
  });

  if (gate.kind === "redirect") {
    redirect(gate.path);
  }

  const reviewerContext =
    await getCurrentVerificationReviewerAuthorizationContext();
  const operatorContext = await getCurrentOperatorAccess();
  const navigation = buildAdminNavigation({
    reviewerAuthorized: reviewerContext.reviewerAuthorized,
    operatorScopes: operatorContext.scopes,
  });
  const implementedOperatorToolVisible = navigation.some(
    (item) => item.key !== "verification_review" && item.status === "available",
  );

  return (
    <AdminShell
      eyebrow="Epoch 05 Admin"
      title="Admin and operator shell"
      description="This safe admin landing page introduces the operational shell without loading privileged operator data. Reviewer authorization remains separate from future operator authorization."
      currentPath={ADMIN_ROUTES.home}
      navigation={navigation}
      error={operatorContext.loadError ?? undefined}
      message={
        reviewerContext.reviewerAuthorized
          ? "Your account can reach the existing verification reviewer queue through reviewer scope."
          : operatorContext.operatorGranted
            ? implementedOperatorToolVisible
              ? "Your account has explicit operator grants. Matching implemented operator tools appear in navigation, and other granted scopes may still point to future tools that are not built yet."
              : "Your account has explicit operator grants, but the scopes on this account currently map only to future operator tools that are not built yet."
            : "Operator-only sections stay unavailable until your account receives explicit active operator grants."
      }
      footer={
        <p className={authStyles.hint}>
          This shell does not infer operator access from login email, work
          email, beta access, verification claims, profile text, or reviewer
          scope. Explicit active operator grants authorize future tools, but
          only implemented routes become linkable.
        </p>
      }
    >
      <div className={styles.stack}>
        <section className={styles.section} aria-labelledby="admin-shell-overview">
          <h2 id="admin-shell-overview" className={styles.sectionTitle}>
            Safe operational landing page
          </h2>
          <p className={styles.sectionText}>
            This route is intentionally metadata-free. It does not fetch
            verification requests, proof artifacts, security events, approved
            domains, reviewer-scope records, or cleanup-run details before
            authorization for a specific tool exists.
          </p>
          <p className={styles.sectionText}>
            Approved-domain and reviewer-scope management are now available
            only to accounts with the explicit operator scopes required for
            those tools. The existing verification reviewer queue remains
            separate and only available for accounts with an active reviewer
            scope.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="admin-shell-sections">
          <h2 id="admin-shell-sections" className={styles.sectionTitle}>
            Section availability
          </h2>
          <div className={styles.toolGrid}>
            {navigation.map((item) => (
              <article key={item.path} className={styles.toolCard}>
                <div className={styles.toolHeader}>
                  <h3 className={styles.toolTitle}>{item.label}</h3>
                  <span className={styles.toolStatus}>{item.availabilityLabel}</span>
                </div>
                <p className={styles.toolDescription}>{item.description}</p>
                <p className={styles.toolReason}>{item.reason}</p>
                {item.status === "available" ? (
                  <Link className={styles.toolLink} href={item.path}>
                    Open section
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="admin-shell-boundaries">
          <h2 id="admin-shell-boundaries" className={styles.sectionTitle}>
            Boundaries preserved in E05-T02
          </h2>
          <ul className={styles.noteList}>
            <li>Reviewer scope remains separate from operator/admin access.</li>
            <li>
              Operator-only sections stay scope-gated now that the operator grant
              model is {OPERATOR_GRANT_IMPLEMENTATION_STATUS.replaceAll("_", " ")}.
            </li>
            <li>
              Existing proof-view and proof-cleanup helpers are unchanged by
              this shell.
            </li>
            <li>
              Normal active beta users do not receive privileged operational
              data from this landing page.
            </li>
          </ul>
        </section>
      </div>
    </AdminShell>
  );
}
