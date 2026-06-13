import { DfwLayoverShell } from "../../../../../src/components/privateApp/HomeHubShell";
import {
  dfwLayoverEssentialCards,
  dfwLayoverFutureNote,
  dfwLayoverSafetyBoundary,
  dfwLayoverStartHere,
  dfwLayoverUsefulNextLinks,
} from "../../../../../src/lib/privateApp/dfwLayover";
import { requireDfwHubRouteAccess } from "../../../../../src/lib/privateApp/dfwHubAccess";

const DFW_LAYOVER_ROUTE = "/app/hubs/dfw/layover";

export const dynamic = "force-dynamic";

export default async function DfwLayoverPage() {
  await requireDfwHubRouteAccess({
    route: DFW_LAYOVER_ROUTE,
    section: "dfw-layover",
  });

  return (
    <DfwLayoverShell
      essentialCards={dfwLayoverEssentialCards}
      futureNote={dfwLayoverFutureNote}
      safetyBoundary={dfwLayoverSafetyBoundary}
      startHere={dfwLayoverStartHere}
      usefulNextLinks={dfwLayoverUsefulNextLinks}
    />
  );
}
