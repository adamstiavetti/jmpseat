import { redirect } from "next/navigation";

import { AuthCard } from "../../../src/components/auth/AuthCard";
import authStyles from "../../../src/components/auth/auth.module.css";
import styles from "./verification.module.css";
import { AUTH_ROUTES } from "../../../src/lib/auth/routes";
import { getCurrentAppAccessContext } from "../../../src/lib/betaAccess/server";
import {
  getPrivateAccessSource,
  getPrivateAppGateResult,
  getPrivateRouteAuditResult,
} from "../../../src/lib/privateApp/access";
import { getPrivateAccessEventType } from "../../../src/lib/securityEvents/securityEvents";
import { recordSecurityEvent } from "../../../src/lib/securityEvents/server";
import { getSupabaseBrowserEnv } from "../../../src/lib/supabase/config";
import { submitWorkEmailVerificationAction } from "../../../src/lib/verification/actions";
import { getCurrentVerificationSurfaceContext } from "../../../src/lib/verification/server";
import {
  formatClaimDisplayValue,
  formatVerificationMethodLabel,
  getVerificationSurfaceSummary,
  getWorkEmailSurfaceState,
} from "../../../src/lib/verification/surface";

type VerificationPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function VerificationPage({ searchParams }: VerificationPageProps) {
  const params = await searchParams;
  const env = getSupabaseBrowserEnv();
  const searchError = getValue(params.error);
  const message = getValue(params.message);

  if (!env.enabled) {
    return (
      <AuthCard
        eyebrow="Verification"
        title="Verification needs Supabase auth"
        description="This verification surface depends on the Supabase auth configuration used by the private web app."
        error="Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to exercise runtime verification flows."
      >
        <p className={authStyles.hint}>
          Local build and tests can run without those values. Runtime
          verification reads require a configured Supabase project and the
          applied verification migrations.
        </p>
      </AuthCard>
    );
  }

  const accessContext = await getCurrentAppAccessContext();
  const gate = getPrivateAppGateResult({
    routeKind: "verification",
    nextPath: AUTH_ROUTES.verification,
    context: accessContext,
  });

  await recordSecurityEvent({
    userId: accessContext.user?.id,
    eventType: getPrivateAccessEventType(gate),
    route: AUTH_ROUTES.verification,
    result: getPrivateRouteAuditResult(gate, accessContext),
    metadata: {
      route_kind: "verification",
      section: "verification",
      access_source: getPrivateAccessSource(gate),
      ...(getPrivateAccessSource(gate) === "operator_internal"
        ? { operator_private_app_access: true }
        : {}),
    },
  });

  if (gate.kind === "redirect") {
    redirect(gate.path);
  }

  const verificationContext = await getCurrentVerificationSurfaceContext();
  const summary = getVerificationSurfaceSummary({
    requests: verificationContext.requests,
    claims: verificationContext.claims,
    evidence: verificationContext.evidence,
  });
  const workEmailState = getWorkEmailSurfaceState({
    approvedDomainCount: verificationContext.approvedDomainCount,
  });

  return (
    <AuthCard
      eyebrow="Airline employee email"
      title="Airline-email access status"
      description="jmpseat app access uses confirmed approved airline employee email as the eligibility credential. Badge, document, and proof upload are frozen as forward access paths."
      error={searchError ?? verificationContext.loadError ?? undefined}
      message={message}
      footer={
        <p className={authStyles.hint}>
          jmpseat uses no employer-system lookup and does not ask reviewers to
          use employer systems or internal directories. Work email is not
          public. Future restricted-board access is separate from general
          airline-email eligibility and will use board/community-admin approval
          instead of badge or document upload.
        </p>
      }
    >
      <div className={styles.stack}>
        <section className={styles.section} aria-labelledby="verification-summary-title">
          <h2 id="verification-summary-title" className={styles.sectionTitle}>
            {summary.title}
          </h2>
          <p className={styles.sectionText}>{summary.description}</p>
          <div className={styles.pillRow}>
            <span className={styles.pill}>Account signup is separate</span>
            <span className={styles.pill}>Profile completion is separate</span>
            <span className={styles.pill}>Airline employee email is the forward path</span>
            <span className={styles.pill}>Proof upload is frozen</span>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="verification-requests-title">
          <h2 id="verification-requests-title" className={styles.sectionTitle}>
            Legacy request and claim status
          </h2>
          {verificationContext.requests.length === 0 ? (
            <p className={styles.sectionText}>No legacy verification request on file.</p>
          ) : (
            <ul className={styles.list}>
              {verificationContext.requests.map((request) => (
                <li key={request.id} className={styles.listItem}>
                  <strong>{formatVerificationMethodLabel(request.method)}</strong>
                  {" "}
                  request: <span>{request.status}</span>
                  <div className={styles.meta}>
                    Requested claims: {(request.requested_claim_types ?? []).join(", ") || "none"}.
                  </div>
                </li>
              ))}
            </ul>
          )}

          {verificationContext.claims.length > 0 ? (
            <>
              <p className={styles.sectionText}>
                Existing approved claims remain historical account status until
                future airline-email access state is implemented. Restricted
                board access remains separate.
              </p>
              <ul className={styles.list}>
                {verificationContext.claims.map((claim) => (
                  <li key={claim.id} className={styles.listItem}>
                    <strong>{formatClaimDisplayValue({
                      claimType: claim.claim_type,
                      claimValue: claim.claim_value,
                    })}</strong>
                    {" "}
                    claim: <span>{claim.status}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>

        <section className={styles.section} aria-labelledby="work-email-title">
          <h2 id="work-email-title" className={styles.sectionTitle}>
            Airline employee email
          </h2>
          <p className={styles.sectionText}>
            Confirmed approved airline employee email is the intended
            general-access direction for jmpseat. It may be different from your
            login email, and your employee email is not public.
          </p>
          <p className={styles.sectionText}>
            App entry now checks your profile, airline-email eligibility, and
            beta access when private testing requires it. Airline-email
            eligibility does not grant role, base, or restricted-board
            membership.
          </p>
          <p className={styles.sectionText}>
            Only approved airline-controlled domains are currently supported.
            Submitting an approved airline employee email sends a confirmation
            link to that inbox. Confirmation verifies email control only and
            does not issue role, base, or restricted-board claims.
          </p>
          <p className={styles.sectionText}>{workEmailState.description}</p>
          <form className={styles.form} action={submitWorkEmailVerificationAction}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="work-email">
                Work email
              </label>
              <input
                className={styles.input}
                id="work-email"
                name="work_email"
                type="email"
                placeholder="crew.member@airline.example"
                autoComplete="email"
                required
              />
            </div>
            <button className={styles.button} type="submit">
              Send confirmation email
            </button>
          </form>
          <p className={styles.muted}>
            Check your airline employee email inbox after submitting. jmpseat
            stores metadata and hashed confirmation tokens only; it does not
            store your raw work email in verification evidence metadata.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="proof-title">
          <h2 id="proof-title" className={styles.sectionTitle}>
            Proof upload is frozen
          </h2>
          <p className={styles.sectionText}>
            jmpseat no longer asks normal users to upload badges, proof files,
            redacted documents, employment screenshots, or similar sensitive
            evidence as a forward access path.
          </p>
          <p className={styles.sectionText}>
            Existing proof infrastructure remains historical, runtime-applied
            safety and cleanup infrastructure. This page does not expose a new
            proof upload form or proof-review call to action.
          </p>
          <p className={styles.sectionText}>
            General app and general baseboard access should use confirmed
            approved airline employee email. Restricted boards remain separate
            and will require board/community-admin approval rather than
            badge-document upload.
          </p>
        </section>
      </div>
    </AuthCard>
  );
}
