import {
  DfwHubSectionReadOnlyShell,
  dfwHubSectionShells,
} from "../../../../../src/components/privateApp/HomeHubShell";
import { requireDfwHubRouteAccess } from "../../../../../src/lib/privateApp/dfwHubAccess";

const DFW_LAYOVERS_ROUTE = "/app/hubs/dfw/layovers";

export const dynamic = "force-dynamic";

export default async function DfwLayoversPage() {
  await requireDfwHubRouteAccess({
    route: DFW_LAYOVERS_ROUTE,
    section: "dfw-layovers",
  });

  return <DfwHubSectionReadOnlyShell section={dfwHubSectionShells.layovers} />;
}
