import { redirect } from "next/navigation";

import { AuthCard } from "../../../src/components/auth/AuthCard";
import authStyles from "../../../src/components/auth/auth.module.css";
import styles from "./verification.module.css";
import { getCurrentAppAccessContext } from "../../../src/lib/betaAccess/server";
import {
  getPrivateAppGateResult,
  getPrivateRouteAuditResult,
} from "../../../src/lib/privateApp/access";
import { getPrivateAccessEventType } from "../../../src/lib/securityEvents/securityEvents";
import { recordSecurityEvent } from "../../../src/lib/securityEvents/server";
import { getSupabaseBrowserEnv } from "../../../src/lib/supabase/config";
import { getCurrentVerificationSurfaceContext } from "../../../src/lib/verification/server";
import {
  formatClaimDisplayValue,
  formatVerificationMethodLabel,
  getVerificationSurfaceSummary,
  getWorkEmailSurfaceState,
} from "../../../src/lib/verification/surface";

export default async function VerificationPage() {
  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    return (
      <AuthCard
        eyebrow="Epoch 04 Verification"
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
    routeKind: "private-child",
    nextPath: "/app/verification",
    context: accessContext,
  });

  await recordSecurityEvent({
    userId: accessContext.user?.id,
    eventType: getPrivateAccessEventType(gate),
    route: "/app/verification",
    result: getPrivateRouteAuditResult(gate, accessContext),
    metadata: {
      route_kind: "private-child",
      section: "verification",
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
      eyebrow="Epoch 04 Verification"
      title="Verification status and method guidance"
      description="Verification is separate from signup, profile completion, and beta access. This page shows your verification status and the currently supported verification paths."
      error={verificationContext.loadError ?? undefined}
      footer={
        <p className={authStyles.hint}>
          jmpseat uses no employer-system lookup and does not ask reviewers to
          use employer systems or internal directories. Work email is not
          public, and redacted proof will require short retention and strict
          redaction when that upload path opens later.
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
            <span className={styles.pill}>Beta access is separate</span>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="verification-requests-title">
          <h2 id="verification-requests-title" className={styles.sectionTitle}>
            Current request and claim status
          </h2>
          {verificationContext.requests.length === 0 ? (
            <p className={styles.sectionText}>No verification request yet.</p>
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
                Approved claims are separate from self-declared profile fields.
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
            Work-email verification
          </h2>
          <p className={styles.sectionText}>
            Work-email verification checks access to an approved airline-controlled domain where available. Work email may be different from your login email, and your work email is not public.
          </p>
          <p className={styles.sectionText}>
            This path is for broad airline-worker verification and can support
            an airline-specific claim later. Role and base claims remain
            separate and are not proven by work email alone.
          </p>
          <p className={styles.sectionText}>{workEmailState.description}</p>
          <form className={styles.disabledForm}>
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
                disabled
              />
            </div>
            <button className={styles.button} type="button" disabled>
              Coming next: submission opens in a later verification flow
            </button>
          </form>
          <p className={styles.muted}>
            This page does not send a work-email verification message yet and
            does not issue claims automatically.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="proof-title">
          <h2 id="proof-title" className={styles.sectionTitle}>
            Redacted badge or proof
          </h2>
          <p className={styles.sectionText}>
            Redacted proof is the next verification method, but upload is not live yet in this ticket. When it opens, proof will require private storage, short retention, and strict redaction rules.
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>Redact employee IDs.</li>
            <li className={styles.listItem}>Redact badge numbers.</li>
            <li className={styles.listItem}>Redact barcodes and QR codes.</li>
            <li className={styles.listItem}>Do not upload badge backsides or security/access markings.</li>
            <li className={styles.listItem}>Do not upload passenger or customer info.</li>
            <li className={styles.listItem}>Do not upload trip or schedule screenshots.</li>
            <li className={styles.listItem}>Do not upload crew hotel info.</li>
          </ul>
          <p className={styles.muted}>
            Role and base claims remain separate or later steps. This page does
            not contain a proof upload input yet.
          </p>
        </section>
      </div>
    </AuthCard>
  );
}
