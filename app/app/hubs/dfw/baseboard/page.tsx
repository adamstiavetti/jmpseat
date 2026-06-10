import {
  DfwHubSectionReadOnlyShell,
  dfwHubSectionShells,
} from "../../../../../src/components/privateApp/HomeHubShell";
import {
  DFW_BASEBOARD_POST_STATUS_PARAM,
  isDfwBaseboardPostStatus,
} from "../../../../../src/lib/community/boardPostActionState";
import { createDfwBaseboardPostAction } from "../../../../../src/lib/community/boardPostActions";
import { listDfwBaseboardPosts } from "../../../../../src/lib/community/boardPostReads";
import {
  DFW_BASEBOARD_REPORT_STATUS_PARAM,
  isDfwBaseboardReportStatus,
} from "../../../../../src/lib/community/boardPostSafetyActionState";
import { reportDfwBaseboardPostAction } from "../../../../../src/lib/community/boardPostSafetyActions";
import { requireDfwHubRouteAccess } from "../../../../../src/lib/privateApp/dfwHubAccess";

const DFW_BASEBOARD_ROUTE = "/app/hubs/dfw/baseboard";

export const dynamic = "force-dynamic";

type DfwBaseboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DfwBaseboardPage({
  searchParams,
}: DfwBaseboardPageProps) {
  await requireDfwHubRouteAccess({
    route: DFW_BASEBOARD_ROUTE,
    section: "dfw-baseboard",
  });

  const params = await searchParams;
  const postStatusValue = params[DFW_BASEBOARD_POST_STATUS_PARAM];
  const postStatus = isDfwBaseboardPostStatus(postStatusValue)
    ? postStatusValue
    : null;
  const reportStatusValue = params[DFW_BASEBOARD_REPORT_STATUS_PARAM];
  const reportStatus = isDfwBaseboardReportStatus(reportStatusValue)
    ? reportStatusValue
    : null;
  const baseboardPostResult = await listDfwBaseboardPosts();

  return (
    <DfwHubSectionReadOnlyShell
      baseboardPosts={baseboardPostResult.posts}
      baseboardPostsUnavailable={Boolean(baseboardPostResult.error)}
      baseboardPostStatus={postStatus}
      baseboardReportStatus={reportStatus}
      createBaseboardPostAction={createDfwBaseboardPostAction}
      reportBaseboardPostAction={reportDfwBaseboardPostAction}
      section={dfwHubSectionShells.baseboard}
    />
  );
}
