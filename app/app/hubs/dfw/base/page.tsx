import { DfwBaseShell } from "../../../../../src/components/privateApp/HomeHubShell";
import {
  dfwBaseEssentialCards,
  dfwBaseFutureNote,
  dfwBaseSafetyBoundary,
  dfwBaseStartHere,
  dfwBaseUsefulNextLinks,
} from "../../../../../src/lib/privateApp/dfwBase";
import { requireDfwHubRouteAccess } from "../../../../../src/lib/privateApp/dfwHubAccess";

const DFW_BASE_ROUTE = "/app/hubs/dfw/base";

export const dynamic = "force-dynamic";

export default async function DfwBasePage() {
  await requireDfwHubRouteAccess({
    route: DFW_BASE_ROUTE,
    section: "dfw-base",
  });

  return (
    <DfwBaseShell
      essentialCards={dfwBaseEssentialCards}
      futureNote={dfwBaseFutureNote}
      safetyBoundary={dfwBaseSafetyBoundary}
      startHere={dfwBaseStartHere}
      usefulNextLinks={dfwBaseUsefulNextLinks}
    />
  );
}
