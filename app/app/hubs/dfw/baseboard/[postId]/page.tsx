import {
  DfwBaseboardPostDetailShell,
} from "../../../../../../src/components/privateApp/HomeHubShell";
import { getDfwBaseboardPost } from "../../../../../../src/lib/community/boardPostReads";
import {
  DFW_BASEBOARD_REPORT_STATUS_PARAM,
  isDfwBaseboardReportStatus,
} from "../../../../../../src/lib/community/boardPostSafetyActionState";
import { reportDfwBaseboardPostAction } from "../../../../../../src/lib/community/boardPostSafetyActions";
import { requireDfwHubRouteAccess } from "../../../../../../src/lib/privateApp/dfwHubAccess";

const DFW_BASEBOARD_ROUTE = "/app/hubs/dfw/baseboard";

export const dynamic = "force-dynamic";

type DfwBaseboardPostDetailPageProps = {
  params: Promise<{
    postId: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DfwBaseboardPostDetailPage({
  params,
  searchParams,
}: DfwBaseboardPostDetailPageProps) {
  await requireDfwHubRouteAccess({
    route: DFW_BASEBOARD_ROUTE,
    section: "dfw-baseboard",
  });

  const [{ postId }, query] = await Promise.all([params, searchParams]);
  const reportStatusValue = query[DFW_BASEBOARD_REPORT_STATUS_PARAM];
  const reportStatus = isDfwBaseboardReportStatus(reportStatusValue)
    ? reportStatusValue
    : null;
  const postResult = await getDfwBaseboardPost(postId);

  return (
    <DfwBaseboardPostDetailShell
      post={postResult.post}
      postUnavailable={Boolean(postResult.error)}
      reportAction={reportDfwBaseboardPostAction}
      reportStatus={reportStatus}
    />
  );
}
