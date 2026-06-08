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
        eyebrow="Restricted surface"
        title="Restricted access needs Supabase auth"
        description="This restricted jmpseat surface depends on the Supabase auth configuration used by the private web app."
        error="Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to exercise runtime restricted-surface authorization."
      >
        <p className={styles.hint}>
          Local build and tests can run without those values. Runtime
          authorization for restricted reviewer, admin, and operator surfaces
          requires a configured Supabase project.
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
      eyebrow="RESTRICTED SURFACE"
      title="Access restricted"
      description="This page requires additional jmpseat permissions. Your account may still be active, verified, or in private beta, but this surface is limited to specific reviewer, admin, or operator access."
      footer={
        <p className={styles.hint}>
          jmpseat keeps normal app access, reviewer permissions, and
          operator/admin permissions separate.
        </p>
      }
    >
      <p className={styles.hint}>
        If you believe you should have access, ask a trusted jmpseat operator
        to review your account permissions. There is no public self-service
        enrollment path for restricted tools.
      </p>
    </AuthCard>
  );
}
