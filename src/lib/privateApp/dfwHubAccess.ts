import "server-only";

import { redirect } from "next/navigation";

import { getCurrentAppAccessContext } from "../betaAccess/server";
import {
  getPrivateAccessSource,
  getPrivateAppGateResult,
  getPrivateRouteAuditResult,
} from "./access";
import { getPrivateAccessEventType } from "../securityEvents/securityEvents";
import { recordSecurityEvent } from "../securityEvents/server";

type RequireDfwHubRouteAccessOptions = {
  route: string;
  section: string;
};

export async function requireDfwHubRouteAccess({
  route,
  section,
}: RequireDfwHubRouteAccessOptions) {
  const context = await getCurrentAppAccessContext();
  const gate = getPrivateAppGateResult({
    routeKind: "private-child",
    nextPath: route,
    context,
  });
  const accessSource = getPrivateAccessSource(gate);

  await recordSecurityEvent({
    userId: context.user?.id,
    eventType: getPrivateAccessEventType(gate),
    route,
    result: getPrivateRouteAuditResult(gate, context),
    metadata: {
      route_kind: "private-child",
      section,
      access_source: accessSource,
      ...(accessSource === "operator_internal"
        ? { operator_private_app_access: true }
        : {}),
    },
  });

  if (gate.kind === "redirect") {
    redirect(gate.path);
  }
}
