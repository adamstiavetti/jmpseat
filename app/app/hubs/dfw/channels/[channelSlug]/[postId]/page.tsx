import { DfwChannelPostDetailShell } from "../../../../../../../src/components/privateApp/HomeHubShell";
import { reportDfwHubChannelPostAction } from "../../../../../../../src/lib/community/hubChannelActions";
import {
  DFW_HUB_CHANNEL_REPORT_STATUS_PARAM,
  isDfwHubChannelReportStatus,
} from "../../../../../../../src/lib/community/hubChannelPostActionState";
import {
  getDfwHubChannelPost,
  listDfwHubChannels,
} from "../../../../../../../src/lib/community/hubChannels";
import { requireDfwHubRouteAccess } from "../../../../../../../src/lib/privateApp/dfwHubAccess";

type DfwChannelPostDetailPageProps = {
  params: Promise<{
    channelSlug: string;
    postId: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export default async function DfwChannelPostDetailPage({
  params,
  searchParams,
}: DfwChannelPostDetailPageProps) {
  const { channelSlug, postId } = await params;
  const search = await searchParams;
  const normalizedChannelSlug = channelSlug.trim().toLowerCase();
  const normalizedPostId = postId.trim();
  const route = `/app/hubs/dfw/channels/${encodeURIComponent(normalizedChannelSlug)}/${encodeURIComponent(normalizedPostId)}`;
  const reportStatusParam = search[DFW_HUB_CHANNEL_REPORT_STATUS_PARAM];
  const reportStatus = isDfwHubChannelReportStatus(reportStatusParam)
    ? reportStatusParam
    : null;

  await requireDfwHubRouteAccess({
    route,
    section: "dfw-channel-post",
  });

  const [channelResult, postResult] = await Promise.all([
    listDfwHubChannels(),
    getDfwHubChannelPost(normalizedChannelSlug, normalizedPostId),
  ]);
  const selectedChannel =
    channelResult.channels.find((channel) => channel.slug === normalizedChannelSlug) ?? null;

  return (
    <DfwChannelPostDetailShell
      channel={selectedChannel}
      channelsUnavailable={Boolean(channelResult.error)}
      post={postResult.post}
      postUnavailable={Boolean(postResult.error)}
      reportAction={reportDfwHubChannelPostAction}
      reportStatus={reportStatus}
    />
  );
}
