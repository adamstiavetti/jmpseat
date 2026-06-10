import {
  DfwHubSectionReadOnlyShell,
  dfwHubSectionShells,
} from "../../../../../src/components/privateApp/HomeHubShell";
import { requireDfwHubRouteAccess } from "../../../../../src/lib/privateApp/dfwHubAccess";

const DFW_LOUNGES_ROUTE = "/app/hubs/dfw/lounges";

export const dynamic = "force-dynamic";

export default async function DfwLoungesPage() {
  await requireDfwHubRouteAccess({
    route: DFW_LOUNGES_ROUTE,
    section: "dfw-lounges",
  });

  return <DfwHubSectionReadOnlyShell section={dfwHubSectionShells.lounges} />;
}
