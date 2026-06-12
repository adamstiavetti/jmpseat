import "server-only";

import { createClient } from "../supabase/server";
export {
  DFW_HUB_CHANNEL_POST_FAILED_STATUS,
  DFW_HUB_CHANNEL_POST_INVALID_STATUS,
  DFW_HUB_CHANNEL_POST_STATUS_PARAM,
  type DfwHubChannelPostStatus,
} from "./hubChannelPostActionState";
import {
  type DfwHubChannelPostStatus,
  DFW_HUB_CHANNEL_POST_FAILED_STATUS,
  DFW_HUB_CHANNEL_POST_INVALID_STATUS,
} from "./hubChannelPostActionState";
import { isUuid } from "./uuid";

const DEFAULT_CHANNEL_POST_LIMIT = 20;
const FALLBACK_AUTHOR_LABEL = "jmpseat member";

export type HubChannelListItem = {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  sortOrder: number;
};

export type HubChannelPostListItem = {
  id: string;
  title: string;
  body: string;
  contentType: string;
  category: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  authorLabel: string;
};

export type HubChannelPostDetail = HubChannelPostListItem & {
  channelSlug: string;
  channelName: string;
};

type OpenHubChannelRpcRow = {
  slug: string;
  name: string;
  short_name: string;
  description: string;
  sort_order: number;
};

type OpenHubChannelPostRpcRow = {
  id: string;
  title: string;
  body: string;
  content_type: string;
  category: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  author_label: string | null;
};

type OpenHubChannelPostDetailRpcRow = OpenHubChannelPostRpcRow & {
  channel_slug: string;
  channel_name: string;
};

const dfwHubChannelPostStatuses = new Set<string>([
  DFW_HUB_CHANNEL_POST_INVALID_STATUS,
  DFW_HUB_CHANNEL_POST_FAILED_STATUS,
]);

export function isDfwHubChannelPostStatus(
  value: string | string[] | undefined,
): value is DfwHubChannelPostStatus {
  return typeof value === "string" && dfwHubChannelPostStatuses.has(value);
}

function mapOpenHubChannelRow(row: OpenHubChannelRpcRow): HubChannelListItem {
  return {
    slug: row.slug,
    name: row.name,
    shortName: row.short_name,
    description: row.description,
    sortOrder: row.sort_order,
  };
}

function getSafeAuthorLabel(value: string | null | undefined) {
  const normalized = value?.trim() ?? "";
  return normalized || FALLBACK_AUTHOR_LABEL;
}

function mapOpenHubChannelPostRow(
  row: OpenHubChannelPostRpcRow,
): HubChannelPostListItem {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    contentType: row.content_type,
    category: row.category,
    isPinned: row.is_pinned,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    authorLabel: getSafeAuthorLabel(row.author_label),
  };
}

function mapOpenHubChannelPostDetailRow(
  row: OpenHubChannelPostDetailRpcRow,
): HubChannelPostDetail {
  return {
    ...mapOpenHubChannelPostRow(row),
    channelSlug: row.channel_slug,
    channelName: row.channel_name,
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

export async function listDfwHubChannelPosts(
  channelSlug: string,
  limit = DEFAULT_CHANNEL_POST_LIMIT,
) {
  const normalizedChannelSlug = channelSlug.trim().toLowerCase();

  if (!normalizedChannelSlug) {
    return {
      posts: [],
      error: null,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("list_open_hub_channel_posts", {
      p_base_code: "DFW",
      p_channel_slug: normalizedChannelSlug,
      p_limit: limit,
    })
    .returns<OpenHubChannelPostRpcRow[]>();

  if (error) {
    return {
      posts: [],
      error,
    };
  }

  return {
    posts: (Array.isArray(data) ? data : []).map(mapOpenHubChannelPostRow),
    error: null,
  };
}

export async function getDfwHubChannelPost(
  channelSlug: string,
  postId: string,
) {
  const normalizedChannelSlug = channelSlug.trim().toLowerCase();
  const normalizedPostId = postId.trim();

  if (!normalizedChannelSlug || !isUuid(normalizedPostId)) {
    return {
      post: null,
      error: null,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("get_open_hub_channel_post", {
      p_base_code: "DFW",
      p_channel_slug: normalizedChannelSlug,
      p_post_id: normalizedPostId,
    })
    .returns<OpenHubChannelPostDetailRpcRow[]>();

  if (error) {
    return {
      post: null,
      error,
    };
  }

  const [row] = Array.isArray(data) ? data : [];

  return {
    post: row ? mapOpenHubChannelPostDetailRow(row) : null,
    error: null,
  };
}
