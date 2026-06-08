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
  WAITLIST_ADMIN_ROUTE,
  WAITLIST_ADMIN_SCOPE,
  WAITLIST_CONTACT_SCOPE,
  getWaitlistDashboardForOperator,
} from "../../../../src/lib/admin/waitlistMetrics";
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
import styles from "./waitlist.module.css";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatPercent(value: number) {
  return `${value}%`;
}

function formatList(values: string[]) {
  return values.length > 0 ? values.join(" | ") : null;
}

function TopList({
  title,
  values,
  emptyLabel,
}: {
  title: string;
  values: { label: string; count: number }[];
  emptyLabel: string;
}) {
  return (
    <article className={styles.insightCard}>
      <h3 className={styles.cardTitle}>{title}</h3>
      {values.length > 0 ? (
        <ul className={styles.topList}>
          {values.map((value) => (
            <li key={value.label} className={styles.topItem}>
              <span>{value.label}</span>
              <span className={styles.countBadge}>{value.count}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.emptyState}>{emptyLabel}</p>
      )}
    </article>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className={styles.detailRow}>
      <dt className={styles.detailLabel}>{label}</dt>
      <dd className={styles.detailValue}>{value}</dd>
    </div>
  );
}

export default async function WaitlistAdminPage() {
  const appContext = await getCurrentAppAccessContext();
  const gate = getPrivateAppGateResult({
    routeKind: "private-child",
    nextPath: ADMIN_ROUTES.waitlist,
    context: appContext,
  });

  await recordSecurityEvent({
    userId: appContext.user?.id,
    eventType: getPrivateAccessEventType(gate),
    route: ADMIN_ROUTES.waitlist,
    result: getPrivateRouteAuditResult(gate, appContext),
    metadata: {
      route_kind: "private-child",
      section: "admin-waitlist",
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
      redirect(`${AUTH_ROUTES.login}?next=${encodeURIComponent(ADMIN_ROUTES.waitlist)}`);
    }

    return (
      <AuthCard
        eyebrow="Waitlist Admin"
        title="Waitlist metrics need Supabase auth"
        description="This operator-only dashboard depends on the same Supabase auth configuration used by the private web app."
        error="Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to exercise runtime waitlist metrics."
      >
        <p className={authStyles.hint}>
          Private-app gating runs before this fallback. Runtime waitlist metrics
          still require configured Supabase auth plus an explicit operator grant.
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
        eyebrow="Waitlist Admin"
        title="Waitlist intelligence"
        description="Founder/admin waitlist contact detail, demand signals, and survey insight for invite and product decisions."
        currentPath={ADMIN_ROUTES.waitlist}
        navigation={navigation}
        error={operatorContext.loadError}
        message="Waitlist dashboard operator tooling is not ready yet. No waitlist data was loaded."
      >
        <section className={styles.section} aria-labelledby="waitlist-not-ready">
          <h2 id="waitlist-not-ready" className={styles.sectionTitle}>
            Operator tooling setup required
          </h2>
          <p className={styles.sectionText}>
            Waitlist metrics depend on the operator grants foundation plus the
            first-party waitlist tables. This route stays in a setup state until
            both are available.
          </p>
        </section>
      </AdminShell>
    );
  }

  if (
    !hasOperatorScope({
      scopes: operatorContext.scopes,
      scope: WAITLIST_ADMIN_SCOPE,
    })
  ) {
    await recordSecurityEvent({
      userId: appContext.user?.id,
      eventType: "operator_audit.unauthorized_attempt",
      route: WAITLIST_ADMIN_ROUTE,
      result: "denied",
      metadata: {
        reason_code: "missing_waitlist_metrics_scope",
      },
    });
    redirect(AUTH_ROUTES.accessRestricted);
  }

  const canViewWaitlistContacts = hasOperatorScope({
    scopes: operatorContext.scopes,
    scope: WAITLIST_CONTACT_SCOPE,
  });
  const metrics = await getWaitlistDashboardForOperator({
    includeContactDetails: canViewWaitlistContacts,
  });

  return (
    <AdminShell
      eyebrow="Waitlist Admin"
      title="Waitlist intelligence"
      description="Founder/admin waitlist contact detail, demand signals, and survey insight for invite and product decisions."
      currentPath={ADMIN_ROUTES.waitlist}
      navigation={navigation}
      error={!metrics.ok ? metrics.message : undefined}
      message={
        canViewWaitlistContacts
          ? "This restricted dashboard can show full waitlist contact emails and individual survey responses for invite/contact workflow. It does not expose row IDs, survey tokens, auth identifiers, or private beta grant data."
          : "This restricted dashboard shows aggregate waitlist metrics plus masked recent submission summaries. Full contact details and detailed per-person invite workflow context require separate waitlist contact access."
      }
      footer={
        <p className={authStyles.hint}>
          Waitlist metrics are separate from beta access, airline-email
          verification, role claims, base claims, and restricted-board claims.
        </p>
      }
    >
      {!metrics.ok ? (
        <section className={styles.section} aria-labelledby="waitlist-query-error">
          <h2 id="waitlist-query-error" className={styles.sectionTitle}>
            Metrics unavailable
          </h2>
          <p className={styles.sectionText}>{metrics.message}</p>
        </section>
      ) : (
        <div className={styles.stack}>
          <section className={styles.section} aria-labelledby="waitlist-summary">
            <h2 id="waitlist-summary" className={styles.sectionTitle}>
              Overview
            </h2>
            <div className={styles.metricGrid}>
              <article className={styles.metricCard}>
                <span className={styles.metricValue}>{metrics.totalSignups}</span>
                <p className={styles.metricLabel}>Total signups</p>
              </article>
              <article className={styles.metricCard}>
                <span className={styles.metricValue}>{metrics.signupsToday}</span>
                <p className={styles.metricLabel}>Today</p>
              </article>
              <article className={styles.metricCard}>
                <span className={styles.metricValue}>{metrics.signupsLast7Days}</span>
                <p className={styles.metricLabel}>Last 7 days</p>
              </article>
              <article className={styles.metricCard}>
                <span className={styles.metricValue}>{metrics.signupsLast30Days}</span>
                <p className={styles.metricLabel}>Last 30 days</p>
              </article>
              <article className={styles.metricCard}>
                <span className={styles.metricValue}>
                  {formatPercent(metrics.surveyCompletionRate)}
                </span>
                <p className={styles.metricLabel}>
                  Survey completion rate ({metrics.surveyCompletedCount})
                </p>
              </article>
              <article className={styles.metricCard}>
                <span className={styles.metricValue}>
                  {metrics.recentSubmissionsCount}
                </span>
                <p className={styles.metricLabel}>Recent submissions shown</p>
              </article>
              <article className={styles.metricCard}>
                <span className={styles.metricValue}>{metrics.emailOnlyCount}</span>
                <p className={styles.metricLabel}>Email-only signups</p>
              </article>
              <article className={styles.metricCard}>
                <span className={styles.metricValue}>
                  {metrics.topAcquisitionSource ?? "None yet"}
                </span>
                <p className={styles.metricLabel}>Top acquisition source</p>
              </article>
              <article className={styles.metricCard}>
                <span className={styles.metricValue}>
                  {metrics.topDesiredFeature ?? "None yet"}
                </span>
                <p className={styles.metricLabel}>Top desired first feature</p>
              </article>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="waitlist-segments">
            <h2 id="waitlist-segments" className={styles.sectionTitle}>
              Segment and demand signals
            </h2>
            <div className={styles.insightGrid}>
              <TopList
                title="Aviation connection"
                values={metrics.topAviationConnections}
                emptyLabel="No role/category responses yet."
              />
              <TopList
                title="Desired first features"
                values={metrics.topDesiredFeatures}
                emptyLabel="No feature responses yet."
              />
              <TopList
                title="Base, airport, or city priority"
                values={metrics.topBaseValues}
                emptyLabel="No safe base/community values yet."
              />
              <TopList
                title="Discovery source"
                values={metrics.topDiscoverySources}
                emptyLabel="No discovery-source responses yet."
              />
              <TopList
                title="Referral and UTM"
                values={metrics.topAttributionSources}
                emptyLabel="No attribution sources yet."
              />
              <TopList
                title="Private beta willingness"
                values={metrics.topBetaInterest}
                emptyLabel="No beta-interest responses yet."
              />
              <TopList
                title="Current tools and communities"
                values={metrics.topCurrentTools}
                emptyLabel="No current-tool responses yet."
              />
              <TopList
                title="Verification comfort"
                values={metrics.topVerificationComfort}
                emptyLabel="No verification comfort responses yet."
              />
              <TopList
                title="Privacy or trust concerns"
                values={metrics.topPrivacyConcerns}
                emptyLabel="No repeated privacy/trust concerns yet."
              />
            </div>
          </section>

          <section className={styles.section} aria-labelledby="waitlist-recent">
            <h2 id="waitlist-recent" className={styles.sectionTitle}>
              Recent waitlist submissions
            </h2>
            <p className={styles.sectionText}>
              {canViewWaitlistContacts
                ? "Use this list for founder/admin invite prioritization and direct follow-up. Email-only rows still matter because they show demand even when the optional survey was skipped."
                : "Use this list to understand near-term demand without exposing raw contact details. Email-only rows still matter because they show demand even when the optional survey was skipped."}
            </p>
            {!canViewWaitlistContacts ? (
              <p className={styles.recordDetail}>
                Contact details and full per-submission survey context require
                waitlist contact access.
              </p>
            ) : null}
            {metrics.recentSignups.length > 0 ? (
              <div className={styles.recordGrid}>
                {metrics.recentSignups.map((signup) => (
                  <article
                    key={`${signup.maskedEmail}-${signup.createdAt}`}
                    className={styles.recordCard}
                  >
                    <div className={styles.recordHeader}>
                      <div className={styles.recordIdentity}>
                          <h3 className={styles.recordTitle}>
                              {canViewWaitlistContacts
                                ? (signup.contactEmail ?? signup.maskedEmail)
                                : signup.maskedEmail}
                            </h3>
                        <p className={styles.recordMeta}>
                          Submitted {formatDate(signup.createdAt)}
                        </p>
                      </div>
                      <span className={styles.statusBadge}>
                        {signup.statusLabel}
                      </span>
                    </div>
                    <dl className={styles.detailGrid}>
                      <DetailRow
                        label="Aviation connection"
                        value={signup.aviationConnection}
                      />
                      <DetailRow
                        label="Base or airport priority"
                        value={signup.priorityBase}
                      />
                      <DetailRow
                        label="Discovery source"
                        value={signup.discoverySource}
                      />
                      <DetailRow
                        label="Acquisition source"
                        value={signup.attributionSource}
                      />
                      <DetailRow
                        label="Desired first features"
                        value={formatList(signup.desiredFeatures)}
                      />
                      {canViewWaitlistContacts ? (
                        <>
                              <DetailRow
                                label="Current tools"
                                value={formatList(signup.currentTools ?? [])}
                              />
                              <DetailRow
                                label="Private beta willingness"
                                value={formatList(signup.betaHelp ?? [])}
                              />
                              <DetailRow
                                label="Verification comfort"
                                value={signup.verificationComfort ?? null}
                              />
                              <DetailRow
                                label="Biggest problem to solve first"
                                value={signup.biggestPain ?? null}
                              />
                              <DetailRow
                                label="Privacy or trust concern"
                                value={signup.privacyConcern ?? null}
                              />
                        </>
                      ) : null}
                    </dl>
                    {!signup.surveyCompleted ? (
                      <p className={styles.recordDetail}>
                        Email captured. Optional survey was skipped or not yet
                        completed, so this row is still useful for invite demand
                        and outreach planning.
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.emptyState}>
                No waitlist submissions yet. Once public demand arrives, this
                dashboard will show aggregate signals and{" "}
                {canViewWaitlistContacts
                  ? "per-person contact/detail for invite planning."
                  : "masked recent summaries for audit-safe review."}
              </p>
            )}
          </section>
        </div>
      )}
    </AdminShell>
  );
}
