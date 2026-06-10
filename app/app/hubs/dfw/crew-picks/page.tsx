import {
  DfwHubSectionReadOnlyShell,
  dfwHubSectionShells,
} from "../../../../../src/components/privateApp/HomeHubShell";
import { requireDfwHubRouteAccess } from "../../../../../src/lib/privateApp/dfwHubAccess";

const DFW_CREW_PICKS_ROUTE = "/app/hubs/dfw/crew-picks";

export const dynamic = "force-dynamic";

export default async function DfwCrewPicksPage() {
  await requireDfwHubRouteAccess({
    route: DFW_CREW_PICKS_ROUTE,
    section: "dfw-crew-picks",
  });

  return <DfwHubSectionReadOnlyShell section={dfwHubSectionShells["crew-picks"]} />;
}
