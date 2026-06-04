import { redirect } from "next/navigation";

import { AuthCard } from "../../../../src/components/auth/AuthCard";
import authStyles from "../../../../src/components/auth/auth.module.css";
import styles from "./review.module.css";
import { AUTH_ROUTES } from "../../../../src/lib/auth/routes";
import { getCurrentAppAccessContext } from "../../../../src/lib/betaAccess/server";
import {
  getPrivateAppGateResult,
  getPrivateRouteAuditResult,
} from "../../../../src/lib/privateApp/access";
import { getPrivateAccessEventType } from "../../../../src/lib/securityEvents/securityEvents";
import { recordSecurityEvent } from "../../../../src/lib/securityEvents/server";
import { getSupabaseBrowserEnv } from "../../../../src/lib/supabase/config";
import { submitVerificationReviewAction } from "../../../../src/lib/verification/reviewActions";
import { getCurrentVerificationReviewContext } from "../../../../src/lib/verification/reviewServer";

type ReviewQueuePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function VerificationReviewQueuePage({
  searchParams,
}: ReviewQueuePageProps) {
  const params = await searchParams;
  const env = getSupabaseBrowserEnv();
  const searchError = getValue(params.error);
  const message = getValue(params.message);

  if (!env.enabled) {
    return (
      <AuthCard
        eyebrow="Epoch 04 Review"
        title="Reviewer queue needs Supabase auth"
        description="This reviewer-only verification queue depends on the Supabase auth configuration used by the private web app."
        error="Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to exercise runtime reviewer flows."
      >
        <p className={authStyles.hint}>
          Local build and tests can run without those values. Reviewer runtime
          authorization requires a configured Supabase project.
        </p>
      </AuthCard>
    );
  }

  const appContext = await getCurrentAppAccessContext();
  const gate = getPrivateAppGateResult({
    routeKind: "private-child",
    nextPath: "/app/admin/verification",
    context: appContext,
  });

  await recordSecurityEvent({
    userId: appContext.user?.id,
    eventType: getPrivateAccessEventType(gate),
    route: "/app/admin/verification",
    result: getPrivateRouteAuditResult(gate, appContext),
    metadata: {
      route_kind: "private-child",
      section: "admin-verification",
    },
  });

  if (gate.kind === "redirect") {
    redirect(gate.path);
  }

  const reviewContext = await getCurrentVerificationReviewContext();

  if (!reviewContext.reviewerAuthorized) {
    redirect(AUTH_ROUTES.accessRestricted);
  }

  return (
    <AuthCard
      eyebrow="Epoch 04 Review"
      title="Verification review queue"
      description="This bounded reviewer surface shows safe verification request metadata only. Reviewers must not use employer systems, internal directories, or other confidential employer resources."
      error={searchError ?? reviewContext.loadError ?? undefined}
      message={message}
      footer={
        <p className={authStyles.hint}>
          This route does not expose proof files, upload tools, storage access,
          or broader admin controls. It is limited to queue review decisions
          for approved verification requests.
        </p>
      }
    >
      <div className={styles.stack}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Reviewer scope summary</h2>
          <ul className={styles.list}>
            {reviewContext.reviewerScopes.map((scope, index) => (
              <li key={`${scope.scope_type}-${scope.scope_value ?? "global"}-${index}`} className={styles.listItem}>
                <strong>{scope.scope_type}</strong>
                {scope.scope_value ? `: ${scope.scope_value}` : ""}
                {" "}
                <span className={styles.meta}>({scope.status})</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Pending verification requests</h2>
          {reviewContext.queue.length === 0 ? (
            <p className={styles.sectionText}>
              No reviewable verification requests are currently visible for your
              reviewer scope.
            </p>
          ) : (
            <div className={styles.queue}>
              {reviewContext.queue.map((entry) => (
                <article key={entry.request.id} className={styles.card}>
                  <h3 className={styles.cardTitle}>
                    {entry.request.method} request
                  </h3>
                  <p className={styles.sectionText}>
                    Status: <strong>{entry.request.status}</strong>
                  </p>
                  <p className={styles.sectionText}>
                    Requested claims: {(entry.request.requested_claim_types ?? []).join(", ") || "none"}
                  </p>
                  <p className={styles.sectionText}>
                    Submitted at: {entry.request.submitted_at ?? entry.request.created_at}
                  </p>

                  <div className={styles.evidenceBlock}>
                    <p className={styles.evidenceTitle}>Safe evidence metadata</p>
                    <ul className={styles.list}>
                      {entry.evidence.map((evidence, index) => (
                        <li key={`${entry.request.id}-${index}`} className={styles.listItem}>
                          <strong>{evidence.evidence_type}</strong>
                          <div className={styles.meta}>
                            status: {evidence.status}
                          </div>
                          <div className={styles.meta}>
                            redaction acknowledged: {evidence.redaction_acknowledged ? "yes" : "no"}
                          </div>
                          <div className={styles.meta}>
                            uploaded at: {evidence.uploaded_at ?? evidence.created_at}
                          </div>
                          <div className={styles.meta}>
                            delete after: {evidence.delete_after ?? "not set"}
                          </div>
                          <div className={styles.meta}>
                            domain: {typeof evidence.metadata.email_domain === "string" ? evidence.metadata.email_domain : "none"}
                          </div>
                          <div className={styles.meta}>
                            airline: {typeof evidence.metadata.airline === "string" ? evidence.metadata.airline : "none"}
                          </div>
                          <div className={styles.meta}>
                            requested airline: {typeof evidence.metadata.requested_airline === "string" ? evidence.metadata.requested_airline : "none"}
                          </div>
                          <div className={styles.meta}>
                            routing context source: {typeof evidence.metadata.routing_context_source === "string" ? evidence.metadata.routing_context_source : "none"}
                          </div>
                          <div className={styles.meta}>
                            support result: {typeof evidence.metadata.support_result === "string" ? evidence.metadata.support_result : "none"}
                          </div>
                          <div className={styles.meta}>
                            mime type: {typeof evidence.metadata.mime_type === "string" ? evidence.metadata.mime_type : "none"}
                          </div>
                          <div className={styles.meta}>
                            file size: {typeof evidence.metadata.file_size_bytes === "number" ? evidence.metadata.file_size_bytes : "none"}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <form className={styles.actions} action={submitVerificationReviewAction}>
                    <input type="hidden" name="request_id" value={entry.request.id} />
                    <button className={styles.buttonApprove} type="submit" name="action" value="approve">
                      Approve
                    </button>
                    <button className={styles.buttonReject} type="submit" name="action" value="reject">
                      Reject
                    </button>
                    <button className={styles.buttonResubmit} type="submit" name="action" value="request_resubmission">
                      Request resubmission
                    </button>
                  </form>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AuthCard>
  );
}
