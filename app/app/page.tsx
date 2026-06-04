import {
  PRIVATE_SHELL_MESSAGE,
  PRIVATE_SHELL_ROUTE,
} from "../../src/lib/privateApp/privateShellPlaceholder";
import { PrivateShellPlaceholder } from "../../src/components/privateApp/PrivateShellPlaceholder";
import { redirect } from "next/navigation";
import { getCurrentAppAccessContext } from "../../src/lib/betaAccess/server";
import { getPrivateAppGateResult } from "../../src/lib/privateApp/access";

export default async function AppPlaceholder() {
  const context = await getCurrentAppAccessContext();
  const gate = getPrivateAppGateResult({
    routeKind: "private-root",
    nextPath: PRIVATE_SHELL_ROUTE,
    context,
  });

  if (gate.kind === "redirect") {
    redirect(gate.path);
  }

  return (
    <PrivateShellPlaceholder
      currentPath={PRIVATE_SHELL_ROUTE}
      message={PRIVATE_SHELL_MESSAGE}
    />
  );
}
