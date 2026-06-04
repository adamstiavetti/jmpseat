import {
  PRIVATE_SHELL_MESSAGE,
  PRIVATE_SHELL_ROUTE,
} from "../../src/lib/privateApp/privateShellPlaceholder";
import { PrivateShellPlaceholder } from "../../src/components/privateApp/PrivateShellPlaceholder";
import { redirect } from "next/navigation";
import {
  getAppEntryRedirect,
  getCurrentAppAccessContext,
} from "../../src/lib/betaAccess/server";

export default async function AppPlaceholder() {
  const context = await getCurrentAppAccessContext();
  const redirectPath = getAppEntryRedirect(context, PRIVATE_SHELL_ROUTE);

  if (redirectPath) {
    redirect(redirectPath);
  }

  return (
    <PrivateShellPlaceholder
      currentPath={PRIVATE_SHELL_ROUTE}
      message={PRIVATE_SHELL_MESSAGE}
    />
  );
}
