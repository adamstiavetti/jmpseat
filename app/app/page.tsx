import { PRIVATE_SHELL_ROUTE } from "../../src/lib/privateApp/privateShellPlaceholder";
import { HomeHubShell } from "../../src/components/privateApp/HomeHubShell";
import { redirect } from "next/navigation";
import { getCurrentAppAccessContext } from "../../src/lib/betaAccess/server";
import { getCurrentUserHomeBase } from "../../src/lib/community/homeBase";
import {
  getPrivateAccessSource,
  getPrivateAppGateResult,
  getPrivateRouteAuditResult,
} from "../../src/lib/privateApp/access";
import { getPrivateAccessEventType } from "../../src/lib/securityEvents/securityEvents";
import { recordSecurityEvent } from "../../src/lib/securityEvents/server";
import { getSupabaseBrowserEnv } from "../../src/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function AppPlaceholder() {
  const context = await getCurrentAppAccessContext();
  const gate = getPrivateAppGateResult({
    routeKind: "private-root",
    nextPath: PRIVATE_SHELL_ROUTE,
    context,
  });

  await recordSecurityEvent({
    userId: context.user?.id,
    eventType: getPrivateAccessEventType(gate),
    route: PRIVATE_SHELL_ROUTE,
    result: getPrivateRouteAuditResult(gate, context),
    metadata: {
      route_kind: "private-root",
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
  const homeBaseResult =
    env.enabled && context.user
      ? await getCurrentUserHomeBase()
      : { homeBase: null, error: null };

  return (
    <HomeHubShell
      homeBaseCode={homeBaseResult.homeBase?.baseCode}
      homeBaseName={homeBaseResult.homeBase?.baseName}
      homeBaseLoadError={Boolean(homeBaseResult.error)}
    />
  );
}
