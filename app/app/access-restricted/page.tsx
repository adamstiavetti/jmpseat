import { redirect } from "next/navigation";

import { AuthCard } from "../../../src/components/auth/AuthCard";
import styles from "../../../src/components/auth/auth.module.css";
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

export default async function AccessRestrictedPage() {
  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    return (
      <AuthCard
        eyebrow="Epoch 04 Review"
        title="Restricted access needs Supabase auth"
        description="This reviewer-only restriction surface depends on the Supabase auth configuration used by the private web app."
        error="Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to exercise runtime reviewer flows."
      >
        <p className={styles.hint}>
          Local build and tests can run without those values. Reviewer runtime
          authorization requires a configured Supabase project.
        </p>
      </AuthCard>
    );
  }

  const context = await getCurrentAppAccessContext();
  const gate = getPrivateAppGateResult({
    routeKind: "private-child",
    nextPath: AUTH_ROUTES.accessRestricted,
    context,
  });

  await recordSecurityEvent({
    userId: context.user?.id,
    eventType: getPrivateAccessEventType(gate),
    route: AUTH_ROUTES.accessRestricted,
    result: getPrivateRouteAuditResult(gate, context),
    metadata: {
      route_kind: "private-child",
      section: "access-restricted",
      access_source: getPrivateAccessSource(gate),
      ...(getPrivateAccessSource(gate) === "operator_internal"
        ? { operator_private_app_access: true }
        : {}),
    },
  });

  if (gate.kind === "redirect") {
    redirect(gate.path);
  }

  return (
    <AuthCard
      eyebrow="Epoch 04 Review"
      title="Access restricted"
      description="This surface is limited to authorized verification reviewers. Reviewer authorization remains separate from signup, profile completion, beta access, and ordinary verified-user state."
      footer={
        <p className={styles.hint}>
          jmpseat does not use employer-system lookup and does not expose broad
          reviewer tools here.
        </p>
      }
    >
      <p className={styles.hint}>
        If you need reviewer access for bounded verification testing, reviewer
        scope rows must be granted manually by a trusted operator. There is no
        self-serve reviewer enrollment path.
      </p>
    </AuthCard>
  );
}
