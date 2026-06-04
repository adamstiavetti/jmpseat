import { notFound, redirect } from "next/navigation";
import { PrivateShellPlaceholder } from "../../../src/components/privateApp/PrivateShellPlaceholder";
import { getCurrentAppAccessContext } from "../../../src/lib/betaAccess/server";
import { getPrivateAppGateResult } from "../../../src/lib/privateApp/access";
import { getPrivateShellChildRoute } from "../../../src/lib/privateApp/privateShellPlaceholder";

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
