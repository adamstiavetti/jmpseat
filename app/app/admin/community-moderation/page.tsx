import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AdminShell } from "../../../../src/components/admin/AdminShell";
import { AuthCard } from "../../../../src/components/auth/AuthCard";
import authStyles from "../../../../src/components/auth/auth.module.css";
import {
  ADMIN_ROUTES,
  COMMUNITY_MODERATION_SCOPE,
  buildAdminNavigation,
  getCurrentOperatorAccess,
  hasOperatorScope,
} from "../../../../src/lib/admin/access";
import {
  moderateDfwBaseboardPostAction,
  moderateDfwHubChannelPostAction,
} from "../../../../src/lib/admin/communityModerationActions";
import {
  getDfwBaseboardCommentModerationReports,
  getDfwBaseboardModerationReports,
  getDfwHubChannelModerationReports,
} from "../../../../src/lib/admin/communityModerationReports";
import { moderateDfwBaseboardPostCommentAction } from "../../../../src/lib/community/boardPostCommentActions";
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
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

type CommunityModerationPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatModerationLabel(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getModerationStatusMessage(status: string | null) {
  switch (status) {
    case "community_moderation_completed":
      return "Moderation action completed. Current DFW Baseboard reads will omit hidden or removed posts.";
    case "community_moderation_invalid":
      return "Choose hide or remove and add a moderation reason before submitting.";
    case "community_moderation_failed":
      return "jmpseat could not complete that moderation action right now. Try again in a moment.";
    case "community_moderation_denied":
      return "Community moderation requires the explicit operator scope.";
    default:
      return null;
  }
}

function getCommentModerationStatusMessage(status: string | null) {
  switch (status) {
    case "dfw_baseboard_comment_moderation_applied":
      return "Comment moderation action completed. Current DFW Baseboard reads will omit hidden or removed comments.";
    case "dfw_baseboard_comment_moderation_invalid":
      return "Choose hide or remove and add a moderation reason before submitting.";
    case "dfw_baseboard_comment_moderation_failed":
      return "jmpseat could not complete that comment moderation action right now. Try again in a moment.";
    case "dfw_baseboard_comment_moderation_denied":
      return "Comment moderation requires the explicit operator scope.";
    default:
      return null;
  }
}

export default async function CommunityModerationPage({
  searchParams,
}: CommunityModerationPageProps) {
  const params = await searchParams;
  const moderationStatus = getValue(params.moderation)?.trim() || null;
  const commentModerationStatus =
    getValue(params.comment_moderation)?.trim() || null;
  const moderationStatusMessage = getModerationStatusMessage(moderationStatus);
  const commentModerationStatusMessage =
    getCommentModerationStatusMessage(commentModerationStatus);
  const appContext = await getCurrentAppAccessContext();
  const gate = getPrivateAppGateResult({
    routeKind: "private-child",
    nextPath: ADMIN_ROUTES.communityModeration,
    context: appContext,
  });

  await recordSecurityEvent({
    userId: appContext.user?.id,
    eventType: getPrivateAccessEventType(gate),
    route: ADMIN_ROUTES.communityModeration,
    result: getPrivateRouteAuditResult(gate, appContext),
    metadata: {
      route_kind: "private-child",
      section: "admin-community-moderation",
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
      redirect(
        `${AUTH_ROUTES.login}?next=${encodeURIComponent(ADMIN_ROUTES.communityModeration)}`,
      );
    }

    return (
      <AuthCard
        eyebrow="Community Moderation"
        title="Community moderation needs Supabase auth"
        description="This operator-only review surface depends on the same Supabase auth configuration used by the private web app."
        error="Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to exercise runtime moderation review."
      >
        <p className={authStyles.hint}>
          Private-app gating runs before this fallback. Runtime report review
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
        eyebrow="Community Moderation"
        title="DFW community moderation"
        description="Operator-scoped review for reported DFW Baseboard and DFW Channel posts."
        currentPath={ADMIN_ROUTES.communityModeration}
        navigation={navigation}
        error={operatorContext.loadError}
        message="Community moderation is not ready yet. Required operator-scope support may be unavailable, and no report data was loaded."
      >
        <section className={styles.section} aria-labelledby="moderation-not-ready">
          <h2 id="moderation-not-ready" className={styles.sectionTitle}>
            Operator tooling setup required
          </h2>
          <p className={styles.sectionText}>
            Community moderation depends on the operator grants foundation and
            the T18 report review RPC before report data can load.
          </p>
        </section>
      </AdminShell>
    );
  }

  const operatorCanModerate = hasOperatorScope({
    scopes: operatorContext.scopes,
    scope: COMMUNITY_MODERATION_SCOPE,
  });

  if (!operatorCanModerate) {
    await recordSecurityEvent({
      userId: appContext.user?.id,
      eventType: "operator_audit.unauthorized_attempt",
      route: ADMIN_ROUTES.communityModeration,
      result: "denied",
      metadata: {
        reason_code: "missing_operator_scope",
        required_scope: COMMUNITY_MODERATION_SCOPE,
      },
    });
    redirect(AUTH_ROUTES.accessRestricted);
  }

  const [reportResult, commentReportResult, channelReportResult] = await Promise.all([
    getDfwBaseboardModerationReports(),
    getDfwBaseboardCommentModerationReports(),
    getDfwHubChannelModerationReports(),
  ]);

  return (
    <AdminShell
      eyebrow="Community Moderation"
      title="DFW community moderation"
      description="Review open DFW Baseboard and DFW Channel reports and use scoped hide/remove actions when needed."
      currentPath={ADMIN_ROUTES.communityModeration}
      navigation={navigation}
      error={
        reportResult.error || commentReportResult.error || channelReportResult.error
          ? "DFW community reports are unavailable right now."
          : undefined
      }
      message={
        commentModerationStatusMessage ??
        moderationStatusMessage ??
        "Reporter identity is not shown. Actions use existing moderation RPCs and affect only reviewed community content available to authorized operators."
      }
      footer={
        <p className={authStyles.hint}>
          This moderation surface is limited to reviewed community content and
          DFW Channel reports available to authorized operators. Reporter
          identity is not shown. Replies, saves, reactions, search, Crew Picks,
          Layovers, and
          proof-upload scope remain outside this tool.
        </p>
      }
    >
      <div className={styles.stack}>
        <section className={styles.section} aria-labelledby="moderation-boundary">
          <h2 id="moderation-boundary" className={styles.sectionTitle}>
            Review boundary
          </h2>
          <p className={styles.sectionText}>
            This page lists open or reviewing reports for published DFW
            Baseboard posts, DFW Channel posts, and top-level comments. Hide and
            remove use existing operator-scoped RPCs, and current read surfaces
            omit hidden or removed content.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="channel-moderation-reports">
          <h2 id="channel-moderation-reports" className={styles.sectionTitle}>
            Open DFW Channel reports
          </h2>

          {channelReportResult.reports.length === 0 ? (
            <p className={styles.sectionText}>
              No open DFW Channel reports are waiting for review.
            </p>
          ) : (
            <div className={styles.toolGrid}>
              {channelReportResult.reports.map((report) => (
                <article className={styles.toolCard} key={report.reportId}>
                  <div className={styles.toolHeader}>
                    <h3 className={styles.toolTitle}>{report.postTitle}</h3>
                    <span className={styles.toolStatus}>
                      {formatModerationLabel(report.reason)}
                    </span>
                  </div>
                  <p className={styles.toolDescription}>
                    {report.postBodyPreview}
                  </p>
                  <p className={styles.toolReason}>
                    {report.channelName} / {report.channelSlug} /{" "}
                    {formatModerationLabel(report.postContentType)} /{" "}
                    {formatModerationLabel(report.postCategory)} /{" "}
                    {report.authorLabel} / posted {formatDate(report.postCreatedAt)}
                  </p>
                  {report.details ? (
                    <p className={styles.sectionText}>{report.details}</p>
                  ) : null}
                  <p className={styles.toolReason}>
                    Report status: {formatModerationLabel(report.reportStatus)} /
                    reported {formatDate(report.reportedAt)}
                  </p>
                  <form action={moderateDfwHubChannelPostAction} className={styles.stack}>
                    <input
                      name="channelSlug"
                      type="hidden"
                      value={report.channelSlug}
                    />
                    <input name="postId" type="hidden" value={report.postId} />
                    <label className={styles.sectionText}>
                      Moderation reason
                      <textarea
                        maxLength={1000}
                        name="reason"
                        placeholder="Required internal moderation reason"
                        required
                        rows={3}
                      />
                    </label>
                    <div className={styles.toolHeader}>
                      <button name="moderationAction" type="submit" value="hide">
                        Hide post
                      </button>
                      <button name="moderationAction" type="submit" value="remove">
                        Remove post
                      </button>
                    </div>
                  </form>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className={styles.section} aria-labelledby="moderation-reports">
          <h2 id="moderation-reports" className={styles.sectionTitle}>
            Open DFW Baseboard reports
          </h2>

          {reportResult.reports.length === 0 ? (
            <p className={styles.sectionText}>
              No open DFW Baseboard reports are waiting for review.
            </p>
          ) : (
            <div className={styles.toolGrid}>
              {reportResult.reports.map((report) => (
                <article className={styles.toolCard} key={report.reportId}>
                  <div className={styles.toolHeader}>
                    <h3 className={styles.toolTitle}>{report.postTitle}</h3>
                    <span className={styles.toolStatus}>
                      {formatModerationLabel(report.reason)}
                    </span>
                  </div>
                  <p className={styles.toolDescription}>
                    {report.postBodyPreview}
                  </p>
                  <p className={styles.toolReason}>
                    {formatModerationLabel(report.postContentType)} /{" "}
                    {formatModerationLabel(report.postCategory)} /{" "}
                    {report.authorLabel} / posted {formatDate(report.postCreatedAt)}
                  </p>
                  {report.details ? (
                    <p className={styles.sectionText}>{report.details}</p>
                  ) : null}
                  <p className={styles.toolReason}>
                    Report status: {formatModerationLabel(report.reportStatus)} /
                    reported {formatDate(report.reportedAt)}
                  </p>
                  <form action={moderateDfwBaseboardPostAction} className={styles.stack}>
                    <input name="postId" type="hidden" value={report.postId} />
                    <label className={styles.sectionText}>
                      Moderation reason
                      <textarea
                        maxLength={1000}
                        name="reason"
                        placeholder="Required internal moderation reason"
                        required
                        rows={3}
                      />
                    </label>
                    <div className={styles.toolHeader}>
                      <button name="moderationAction" type="submit" value="hide">
                        Hide post
                      </button>
                      <button name="moderationAction" type="submit" value="remove">
                        Remove post
                      </button>
                    </div>
                  </form>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className={styles.section} aria-labelledby="comment-moderation-reports">
          <h2 id="comment-moderation-reports" className={styles.sectionTitle}>
            Open DFW Baseboard comment reports
          </h2>

          {commentReportResult.reports.length === 0 ? (
            <p className={styles.sectionText}>
              No open DFW Baseboard comment reports are waiting for review.
            </p>
          ) : (
            <div className={styles.toolGrid}>
              {commentReportResult.reports.map((report) => (
                <article className={styles.toolCard} key={report.reportId}>
                  <div className={styles.toolHeader}>
                    <h3 className={styles.toolTitle}>
                      Comment on {report.postTitlePreview}
                    </h3>
                    <span className={styles.toolStatus}>
                      {formatModerationLabel(report.reason)}
                    </span>
                  </div>
                  <p className={styles.toolDescription}>
                    {report.commentBodyPreview}
                  </p>
                  <p className={styles.toolReason}>
                    {report.commentAuthorLabel} / reported{" "}
                    {formatDate(report.reportedAt)}
                  </p>
                  {report.details ? (
                    <p className={styles.sectionText}>{report.details}</p>
                  ) : null}
                  <p className={styles.toolReason}>
                    Report status: {formatModerationLabel(report.reportStatus)}
                  </p>
                  <form
                    action={moderateDfwBaseboardPostCommentAction}
                    className={styles.stack}
                  >
                    <input name="commentId" type="hidden" value={report.commentId} />
                    <input name="postId" type="hidden" value={report.postId} />
                    <label className={styles.sectionText}>
                      Moderation reason
                      <textarea
                        maxLength={1000}
                        name="reason"
                        placeholder="Required internal moderation reason"
                        required
                        rows={3}
                      />
                    </label>
                    <div className={styles.toolHeader}>
                      <button name="moderationAction" type="submit" value="hide">
                        Hide comment
                      </button>
                      <button name="moderationAction" type="submit" value="remove">
                        Remove comment
                      </button>
                    </div>
                  </form>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
