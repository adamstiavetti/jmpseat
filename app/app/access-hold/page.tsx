import { redirect } from "next/navigation";

import { AuthCard } from "../../../src/components/auth/AuthCard";
import styles from "../../../src/components/auth/auth.module.css";
import { AUTH_ROUTES } from "../../../src/lib/auth/routes";
import {
  BETA_ACCESS_ACTIVE_MESSAGE,
  type BetaAccessStatus,
} from "../../../src/lib/betaAccess/betaAccess";
import { getCurrentAppAccessContext } from "../../../src/lib/betaAccess/server";
import { getPrivateAppGateResult } from "../../../src/lib/privateApp/access";
import { getSupabaseBrowserEnv } from "../../../src/lib/supabase/config";

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

export default async function AccessHoldPage({
  searchParams,
}: AccessHoldPageProps) {
  const params = await searchParams;
  const env = getSupabaseBrowserEnv();
  const searchError = getValue(params.error);

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

  if (gate.kind === "redirect") {
    redirect(gate.path);
  }

  const error = searchError ?? context.betaLoadError ?? undefined;

  return (
    <AuthCard
      eyebrow="Epoch 03 Beta Access"
      title="Private beta access is still on hold"
      description="Your profile is complete, but jmpseat beta access is a separate approval layer from signup, profile completion, and worker verification."
      error={error}
      message={getStatusMessage(context.betaStatus)}
      footer={
        <p className={styles.hint}>
          We will notify you when your beta access is approved. This hold
          state is separate from worker verification and does not imply you are
          verified as an airline worker yet.
        </p>
      }
    >
      <p className={styles.hint}>
        No badge upload, verification workflow, or community access appears in
        this slice. Beta approval remains separate from airline/base/role
        verification claims.
      </p>
    </AuthCard>
  );
}
