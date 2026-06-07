import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { AuthCard } from "../../../src/components/auth/AuthCard";
import { AccountCodeInput } from "../../../src/components/auth/AccountCodeInput";
import styles from "../../../src/components/auth/auth.module.css";
import { AUTH_ROUTES } from "../../../src/lib/auth/routes";
import {
  BETA_ACCESS_ACTIVE_MESSAGE,
  type BetaAccessStatus,
} from "../../../src/lib/betaAccess/betaAccess";
import {
  getBetaInviteRedemptionMessage,
  redeemBetaInviteCodeAction,
} from "../../../src/lib/betaAccess/inviteCodes";
import { getCurrentAppAccessContext } from "../../../src/lib/betaAccess/server";
import {
  getPrivateAccessSource,
  getPrivateAppGateResult,
  getPrivateRouteAuditResult,
} from "../../../src/lib/privateApp/access";
import { doesLaunchModeRequireBeta } from "../../../src/lib/privateApp/launchMode";
import { getPrivateAccessEventType } from "../../../src/lib/securityEvents/securityEvents";
import { recordSecurityEvent } from "../../../src/lib/securityEvents/server";
import { getSupabaseBrowserEnv } from "../../../src/lib/supabase/config";
import type { AirlineEmailAccessStatus } from "../../../src/lib/verification/airlineEmailAccess";
import {
  submitWorkEmailVerificationAction,
  verifyWorkEmailConfirmationCodeAction,
} from "../../../src/lib/verification/actions";
import { getPendingWorkEmailConfirmation } from "../../../src/lib/verification/pendingWorkEmail";

type AccessHoldPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getStatusMessage(status: BetaAccessStatus) {
  switch (status) {
    case "waitlisted":
      return "Your account exists, but private beta access is still in the waitlist stage.";
    case "invited":
      return "Your profile is complete, but beta access is still being activated for this account.";
    case "denied":
      return "Your beta access is not approved for this stage of the private beta.";
    case "revoked":
      return "Your beta access is no longer active for this private beta.";
    case "paused":
      return "Your beta access is temporarily paused right now.";
    case "active":
      return BETA_ACCESS_ACTIVE_MESSAGE;
    case "none":
    default:
      return "Your account and profile are ready, but private beta access has not been approved yet.";
  }
}

function getAirlineEmailStatusMessage(status: AirlineEmailAccessStatus) {
  switch (status) {
    case "pending":
      return "Your airline employee email is still pending confirmation.";
    case "expired":
      return "Your airline employee email verification has expired and must be refreshed before app access opens.";
    case "revoked":
      return "Your airline employee email verification is no longer active.";
    case "unsupported_domain":
      return "That airline employee email domain is not currently approved for jmpseat access.";
    case "not_ready":
      return "Airline-email access checks are not ready yet.";
    case "verified":
      return "Your airline employee email is verified.";
    case "not_verified":
    default:
      return "Confirm an approved airline employee email before entering the app.";
  }
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.accessStatusIcon}>
      <path d="m6 12.5 4 4L18.5 7" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.accessStatusIcon}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3.2 2" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.accessStatusIcon}>
      <path d="M8 10V7.8a4 4 0 0 1 8 0V10" />
      <path d="M6.5 10h11v9h-11z" />
      <path d="M12 13.5v2" />
    </svg>
  );
}

function ShieldInfoIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.accessNoticeIcon}>
      <path d="M12 3.2 19.5 6v5.6c0 4.4-2.6 8.2-7.5 10.6-4.9-2.4-7.5-6.2-7.5-10.6V6z" />
      <path d="M12 10.2v5.1" />
      <path d="M12 7.4h.01" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.accessMetaIcon}>
      <path d="M6.7 10.7a5.3 5.3 0 0 1 10.6 0c0 4 1.5 5.2 2.2 6.1H4.5c.7-.9 2.2-2.1 2.2-6.1Z" />
      <path d="M10 19.2a2.3 2.3 0 0 0 4 0" />
    </svg>
  );
}

function ShieldLockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.accessMetaIcon}>
      <path d="M12 3.2 19.5 6v5.6c0 4.4-2.6 8.2-7.5 10.6-4.9-2.4-7.5-6.2-7.5-10.6V6z" />
      <path d="M9.5 13h5v4h-5z" />
      <path d="M10.5 13v-1.3a1.5 1.5 0 0 1 3 0V13" />
    </svg>
  );
}

export default async function AccessHoldPage({
  searchParams,
}: AccessHoldPageProps) {
  const params = await searchParams;
  const env = getSupabaseBrowserEnv();
  const searchError = getValue(params.error);
  const inviteResult = getValue(params.invite_result);

  if (!env.enabled) {
    return (
      <AuthCard
        eyebrow="Epoch 03 Beta Access"
        title="Beta access needs Supabase auth"
        description="This hold-state surface depends on the Supabase auth configuration used by the private web app."
        error="Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to exercise runtime beta-access flows."
      >
        <p className={styles.hint}>
          Local build and tests can run without those values. Runtime beta-access
          checks require a configured Supabase project and applied migrations.
        </p>
      </AuthCard>
    );
  }

  const context = await getCurrentAppAccessContext();
  const gate = getPrivateAppGateResult({
    routeKind: "access-hold",
    nextPath: AUTH_ROUTES.accessHold,
    context,
  });

  await recordSecurityEvent({
    userId: context.user?.id,
    eventType: getPrivateAccessEventType(gate),
    route: AUTH_ROUTES.accessHold,
    result: getPrivateRouteAuditResult(gate, context),
    metadata: {
      route_kind: "access-hold",
      beta_status: context.betaStatus,
      access_source: getPrivateAccessSource(gate),
      ...(getPrivateAccessSource(gate) === "operator_internal"
        ? { operator_private_app_access: true }
        : {}),
    },
  });

  if (gate.kind === "redirect") {
    redirect(gate.path);
  }

  const error = searchError ?? context.betaLoadError ?? undefined;
  const airlineEmailStatusMessage = getAirlineEmailStatusMessage(
    context.airlineEmailAccessState.status,
  );
  const inviteMessage = getBetaInviteRedemptionMessage(inviteResult);
  const canShowInviteForm =
    doesLaunchModeRequireBeta(context.launchMode) &&
    !context.betaActive &&
    !context.operatorPrivateAppAccess &&
    context.airlineEmailAccessState.airlineEmailVerified;
  const airlineEmailComplete =
    context.airlineEmailAccessState.airlineEmailVerified;
  const betaAccessComplete = context.betaActive;
  const pendingWorkEmailConfirmation =
    await getPendingWorkEmailConfirmation();

  return (
    <main className={`${styles.loginPage} ${styles.accessHoldPage}`}>
      <Image
        src="/images/auth/jmpseat-auth-hero-desktop.webp"
        alt=""
        fill
        priority
        className={styles.accessHoldBackdropImage}
        sizes="100vw"
      />
      <section className={styles.accessHoldShell} aria-labelledby="access-hold-title">
        <Link className={styles.accessHoldWordmark} href="/" aria-label="jmpseat home">
          jmpseat<span>.</span>
        </Link>

        <div className={styles.accessHoldHero}>
          <p className={styles.accessHoldEyebrow}>ACCESS STATUS</p>
          <h1 id="access-hold-title" className={styles.accessHoldTitle}>
            Access is still on hold
          </h1>
          <p className={styles.accessHoldDescription}>
            Your account and profile are ready. We still need an approved
            airline employee email before access can be granted.
          </p>
        </div>

        <div className={styles.accessHoldCard}>
          {error ? (
            <p className={styles.loginError} role="alert">
              {error}
            </p>
          ) : null}

          {inviteMessage ? (
            <p className={styles.loginMessage} role="status">
              {inviteMessage}
            </p>
          ) : null}

          <div className={styles.accessStatusList} aria-label="Access checklist">
            <div className={styles.accessStatusRow}>
              <span className={`${styles.accessStatusMark} ${styles.accessStatusMarkComplete}`}>
                <CheckIcon />
              </span>
              <strong>Account created</strong>
              <span className={`${styles.accessStatusPill} ${styles.accessStatusPillComplete}`}>
                Complete
              </span>
            </div>

            <div className={styles.accessStatusRow}>
              <span className={`${styles.accessStatusMark} ${styles.accessStatusMarkComplete}`}>
                <CheckIcon />
              </span>
              <strong>Profile complete</strong>
              <span className={`${styles.accessStatusPill} ${styles.accessStatusPillComplete}`}>
                Complete
              </span>
            </div>

            <div className={styles.accessStatusRow}>
              <span
                className={`${styles.accessStatusMark} ${
                  airlineEmailComplete
                    ? styles.accessStatusMarkComplete
                    : styles.accessStatusMarkPending
                }`}
              >
                {airlineEmailComplete ? <CheckIcon /> : <ClockIcon />}
              </span>
              <strong>Airline employee email</strong>
              <span
                className={`${styles.accessStatusPill} ${
                  airlineEmailComplete
                    ? styles.accessStatusPillComplete
                    : styles.accessStatusPillPending
                }`}
              >
                {airlineEmailComplete ? "Complete" : "Pending"}
              </span>
            </div>

            <div className={styles.accessStatusRow}>
              <span
                className={`${styles.accessStatusMark} ${
                  betaAccessComplete
                    ? styles.accessStatusMarkComplete
                    : styles.accessStatusMarkLocked
                }`}
              >
                {betaAccessComplete ? <CheckIcon /> : <LockIcon />}
              </span>
              <strong>Beta access</strong>
              <span className={styles.accessStatusMuted}>
                {betaAccessComplete
                  ? "Complete"
                  : "If required, approved separately"}
              </span>
            </div>
          </div>

          {!context.airlineEmailAccessState.airlineEmailVerified ? (
            <div className={styles.accessHoldNotice}>
              <ShieldInfoIcon />
              <p>
                Airline employee email verification is required before app
                access.
              </p>
            </div>
          ) : null}

          {!context.airlineEmailAccessState.airlineEmailVerified ? (
            pendingWorkEmailConfirmation ? (
              <div className={styles.accessHoldConfirmation}>
                <div className={styles.accessHoldSentState}>
                  <h2>We sent a confirmation to</h2>
                  <p>{pendingWorkEmailConfirmation.maskedEmail}</p>
                </div>

                <form
                  className={styles.accessHoldActionBlock}
                  action={verifyWorkEmailConfirmationCodeAction}
                >
                  <input
                    type="hidden"
                    name="return_to"
                    value={AUTH_ROUTES.accessHold}
                  />
                  <AccountCodeInput
                    codeName="verification_code"
                    label="Six-digit airline employee email verification code"
                  />
                  <button className={styles.loginButton} type="submit">
                    <span>Verify airline employee email</span>
                    <span aria-hidden="true">→</span>
                  </button>
                </form>
              </div>
            ) : (
              <form
                className={styles.accessHoldActionBlock}
                action={submitWorkEmailVerificationAction}
              >
                <p className={styles.loginSrOnly}>
                  Beta invite codes do not replace airline-email verification.
                  Confirm an approved airline employee email before redeeming a
                  code.
                </p>
                <div className={styles.loginField}>
                  <label className={styles.loginLabel} htmlFor="work-email">
                    Airline employee email
                  </label>
                  <div className={styles.loginInputShell}>
                    <input
                      className={styles.loginInput}
                      id="work-email"
                      name="work_email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@airline.com"
                      required
                    />
                  </div>
                </div>
                <input
                  type="hidden"
                  name="return_to"
                  value={AUTH_ROUTES.accessHold}
                />
                <button className={styles.loginButton} type="submit">
                  <span>Verify airline employee email</span>
                  <span aria-hidden="true">→</span>
                </button>
              </form>
            )
          ) : null}

          {canShowInviteForm ? (
            <form className={styles.accessInviteForm} action={redeemBetaInviteCodeAction}>
              <div className={styles.loginField}>
                <label className={styles.loginLabel} htmlFor="invite_code">
                  Beta invite code
                </label>
                <div className={styles.loginInputShell}>
                  <input
                    className={styles.loginInput}
                    id="invite_code"
                    name="invite_code"
                    type="text"
                    autoComplete="off"
                    inputMode="text"
                    placeholder="ABCD-EFGH-JKLM-NPQR"
                    required
                  />
                </div>
              </div>

              <p className={styles.signupHint}>
                Invite codes control private-testing capacity only. Your verified
                airline employee email remains the eligibility check.
              </p>

              <button className={styles.loginButton} type="submit">
                <span>Redeem invite</span>
                <span aria-hidden="true">→</span>
              </button>
            </form>
          ) : null}

          <div className={styles.accessHoldMeta}>
            <p>
              <BellIcon />
              <span>We’ll notify you when access is approved.</span>
            </p>
            <p>
              <ShieldLockIcon />
              <span>
                Role, base, and beta permissions remain separate from email
                eligibility.
              </span>
            </p>
          </div>

          <p className={styles.loginSrOnly}>
            {getStatusMessage(context.betaStatus)} {airlineEmailStatusMessage} We
            will notify you when private-testing beta access is approved. Beta
            access is temporary rollout control and remains separate from
            airline-email eligibility. First-base or broader launch access does
            not require a beta invite code when beta is bypassed. No badge
            upload, proof upload, verification files, or community access appears
            in this slice. Airline-email eligibility does not grant role, base,
            restricted-board, reviewer, operator, or community-admin authority.
          </p>
        </div>
      </section>
    </main>
  );
}
