import "server-only";

import { createClient } from "../supabase/server";

export type HubChannelListItem = {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  sortOrder: number;
};

type OpenHubChannelRpcRow = {
  slug: string;
  name: string;
  short_name: string;
  description: string;
  sort_order: number;
};

function mapOpenHubChannelRow(row: OpenHubChannelRpcRow): HubChannelListItem {
  return {
    slug: row.slug,
    name: row.name,
    shortName: row.short_name,
    description: row.description,
    sortOrder: row.sort_order,
  };
}

export async function listDfwHubChannels() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("list_open_hub_channels", {
      p_base_code: "DFW",
    })
    .returns<OpenHubChannelRpcRow[]>();

  if (error) {
    return {
      channels: [],
      error,
    };
  }

  return {
    channels: (Array.isArray(data) ? data : []).map(mapOpenHubChannelRow),
    error: null,
  };
}
