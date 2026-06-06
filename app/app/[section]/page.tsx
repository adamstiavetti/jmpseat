import { notFound, redirect } from "next/navigation";
import { PrivateShellPlaceholder } from "../../../src/components/privateApp/PrivateShellPlaceholder";
import { getCurrentAppAccessContext } from "../../../src/lib/betaAccess/server";
import {
  getPrivateAccessSource,
  getPrivateAppGateResult,
  getPrivateRouteAuditResult,
} from "../../../src/lib/privateApp/access";
import { getPrivateShellChildRoute } from "../../../src/lib/privateApp/privateShellPlaceholder";
import { getPrivateAccessEventType } from "../../../src/lib/securityEvents/securityEvents";
import { recordSecurityEvent } from "../../../src/lib/securityEvents/server";

type PrivateRoutePlaceholderPageProps = {
  params: Promise<{
    section: string;
  }>;
};

export default async function PrivateRoutePlaceholderPage({
  params,
}: PrivateRoutePlaceholderPageProps) {
  const { section } = await params;
  const route = getPrivateShellChildRoute(section);

  if (!route) {
    notFound();
  }

  const context = await getCurrentAppAccessContext();
  const gate = getPrivateAppGateResult({
    routeKind: "private-child",
    nextPath: route.path,
    context,
  });

  await recordSecurityEvent({
    userId: context.user?.id,
    eventType: getPrivateAccessEventType(gate),
    route: route.path,
    result: getPrivateRouteAuditResult(gate, context),
    metadata: {
      route_kind: "private-child",
      section,
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
    <PrivateShellPlaceholder
      currentPath={route.path}
      message={route.message}
      subbrand={`${route.navLabel} placeholder`}
    />
  );
}
