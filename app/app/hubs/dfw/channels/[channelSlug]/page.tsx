import { DfwChannelThreadListShell } from "../../../../../../src/components/privateApp/HomeHubShell";
import {
  listDfwHubChannelPosts,
  listDfwHubChannels,
} from "../../../../../../src/lib/community/hubChannels";
import { requireDfwHubRouteAccess } from "../../../../../../src/lib/privateApp/dfwHubAccess";

type DfwChannelPageProps = {
  params: Promise<{
    channelSlug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function DfwChannelPage({ params }: DfwChannelPageProps) {
  const { channelSlug } = await params;
  const normalizedChannelSlug = channelSlug.trim().toLowerCase();
  const route = `/app/hubs/dfw/channels/${encodeURIComponent(normalizedChannelSlug)}`;

  await requireDfwHubRouteAccess({
    route,
    section: "dfw-channel",
  });

  const channelResult = await listDfwHubChannels();
  const selectedChannel =
    channelResult.channels.find((channel) => channel.slug === normalizedChannelSlug) ?? null;
  const postResult = selectedChannel
    ? await listDfwHubChannelPosts(selectedChannel.slug)
    : { posts: [], error: null };

  return (
    <DfwChannelThreadListShell
      channel={selectedChannel}
      channelsUnavailable={Boolean(channelResult.error)}
      posts={postResult.posts}
      postsUnavailable={Boolean(postResult.error)}
    />
  );
}
