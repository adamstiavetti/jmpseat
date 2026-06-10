import "server-only";

import { createClient } from "../supabase/server";

const DEFAULT_BOARD_POST_LIMIT = 20;
const FALLBACK_AUTHOR_LABEL = "jmpseat member";

export type BaseboardPostListItem = {
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

type OpenBaseboardPostRpcRow = {
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

function getSafeAuthorLabel(value: string | null | undefined) {
  const normalized = value?.trim() ?? "";
  return normalized || FALLBACK_AUTHOR_LABEL;
}

function mapOpenBaseboardPostRow(
  row: OpenBaseboardPostRpcRow,
): BaseboardPostListItem {
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

export async function listDfwBaseboardPosts(
  limit = DEFAULT_BOARD_POST_LIMIT,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("list_open_baseboard_posts", {
      p_base_code: "DFW",
      p_limit: limit,
    })
    .returns<OpenBaseboardPostRpcRow[]>();

  if (error) {
    return {
      posts: [],
      error,
    };
  }

  return {
    posts: (Array.isArray(data) ? data : []).map(mapOpenBaseboardPostRow),
    error: null,
  };
}
