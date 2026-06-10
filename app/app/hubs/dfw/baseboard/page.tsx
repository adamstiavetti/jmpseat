import {
  DfwHubSectionReadOnlyShell,
  dfwHubSectionShells,
} from "../../../../../src/components/privateApp/HomeHubShell";
import { listDfwBaseboardPosts } from "../../../../../src/lib/community/boardPostReads";
import { requireDfwHubRouteAccess } from "../../../../../src/lib/privateApp/dfwHubAccess";

const DFW_BASEBOARD_ROUTE = "/app/hubs/dfw/baseboard";

export const dynamic = "force-dynamic";

export default async function DfwBaseboardPage() {
  await requireDfwHubRouteAccess({
    route: DFW_BASEBOARD_ROUTE,
    section: "dfw-baseboard",
  });

  const baseboardPostResult = await listDfwBaseboardPosts();

  return (
    <DfwHubSectionReadOnlyShell
      baseboardPosts={baseboardPostResult.posts}
      baseboardPostsUnavailable={Boolean(baseboardPostResult.error)}
      section={dfwHubSectionShells.baseboard}
    />
  );
}
