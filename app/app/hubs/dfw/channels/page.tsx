import { DfwChannelsOverviewShell } from "../../../../../src/components/privateApp/HomeHubShell";
import { listDfwHubChannels } from "../../../../../src/lib/community/hubChannels";
import { requireDfwHubRouteAccess } from "../../../../../src/lib/privateApp/dfwHubAccess";

const DFW_CHANNELS_ROUTE = "/app/hubs/dfw/channels";

export const dynamic = "force-dynamic";

export default async function DfwChannelsPage() {
  await requireDfwHubRouteAccess({
    route: DFW_CHANNELS_ROUTE,
    section: "dfw-channels",
  });

  const channelResult = await listDfwHubChannels();

  return (
    <DfwChannelsOverviewShell
      channels={channelResult.channels}
      channelsUnavailable={Boolean(channelResult.error)}
    />
  );
}
