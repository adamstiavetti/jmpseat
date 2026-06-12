import { DfwTodayShell } from "../../../../../src/components/privateApp/HomeHubShell";
import {
  dfwTodayFutureNote,
  dfwTodayQuickChecks,
  dfwTodaySafetyBoundary,
  dfwTodayUtilityCards,
} from "../../../../../src/lib/privateApp/dfwToday";
import { requireDfwHubRouteAccess } from "../../../../../src/lib/privateApp/dfwHubAccess";

const DFW_TODAY_ROUTE = "/app/hubs/dfw/today";

export const dynamic = "force-dynamic";

export default async function DfwTodayPage() {
  await requireDfwHubRouteAccess({
    route: DFW_TODAY_ROUTE,
    section: "dfw-today",
  });

  return (
    <DfwTodayShell
      futureNote={dfwTodayFutureNote}
      quickChecks={dfwTodayQuickChecks}
      safetyBoundary={dfwTodaySafetyBoundary}
      utilityCards={dfwTodayUtilityCards}
    />
  );
}

