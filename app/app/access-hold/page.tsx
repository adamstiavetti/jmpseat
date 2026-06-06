import { redirect } from "next/navigation";
import Link from "next/link";

import { AuthCard } from "../../../src/components/auth/AuthCard";
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

  return (
    <AuthCard
      eyebrow="App access hold"
      title="jmpseat access is still on hold"
      description="Your profile is complete, but jmpseat app access now checks launch mode, beta access when required, and confirmed approved airline employee email eligibility separately."
      error={error}
      message={
        inviteMessage ??
        `${getStatusMessage(context.betaStatus)} ${airlineEmailStatusMessage}`
      }
      footer={
        <p className={styles.hint}>
          We will notify you when private-testing beta access is approved.
          Beta access is temporary rollout control and remains separate from
          airline-email eligibility. First-base or broader launch access does
          not require a beta invite code when beta is bypassed.
        </p>
      }
    >
      {canShowInviteForm ? (
        <form className={styles.form} action={redeemBetaInviteCodeAction}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="invite_code">
              Beta invite code
            </label>
            <input
              className={styles.input}
              id="invite_code"
              name="invite_code"
              type="text"
              autoComplete="off"
              inputMode="text"
              placeholder="ABCD-EFGH-JKLM-NPQR"
              required
            />
          </div>

          <p className={styles.hint}>
            Invite codes control private-testing capacity only. Your verified
            airline employee email remains the eligibility check.
          </p>

          <button className={styles.button} type="submit">
            Redeem invite
          </button>
        </form>
      ) : null}

      {!context.airlineEmailAccessState.airlineEmailVerified ? (
        <div className={styles.form}>
          <p className={styles.hint}>
            Beta invite codes do not replace airline-email verification. Confirm
            an approved airline employee email before redeeming a code.
          </p>
          <Link className={styles.button} href={AUTH_ROUTES.verification}>
            Verify airline employee email
          </Link>
        </div>
      ) : null}

      <p className={styles.hint}>
        No badge upload, proof upload, verification files, or community access
        appears in this slice. Airline-email eligibility does not grant role,
        base, restricted-board, reviewer, operator, or community-admin authority.
      </p>
    </AuthCard>
  );
}
