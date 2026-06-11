import "server-only";

import { createClient } from "../supabase/server";

const DEFAULT_REPORT_LIMIT = 50;

type CommunityModerationReportRpcRow = {
  report_id: string;
  post_id: string;
  post_title: string;
  post_body_preview: string;
  post_category: string;
  post_content_type: string;
  post_created_at: string;
  post_author_label: string | null;
  reason: string;
  details: string | null;
  report_status: string;
  reported_at: string;
};

export type CommunityModerationReport = {
  reportId: string;
  postId: string;
  postTitle: string;
  postBodyPreview: string;
  postCategory: string;
  postContentType: string;
  postCreatedAt: string;
  authorLabel: string;
  reason: string;
  details: string | null;
  reportStatus: string;
  reportedAt: string;
};

function getSafeText(value: string | null | undefined, fallback = "") {
  return value?.trim() || fallback;
}

function mapReportRow(
  row: CommunityModerationReportRpcRow,
): CommunityModerationReport {
  return {
    reportId: row.report_id,
    postId: row.post_id,
    postTitle: row.post_title,
    postBodyPreview: row.post_body_preview,
    postCategory: row.post_category,
    postContentType: row.post_content_type,
    postCreatedAt: row.post_created_at,
    authorLabel: getSafeText(row.post_author_label, "jmpseat member"),
    reason: row.reason,
    details: row.details,
    reportStatus: row.report_status,
    reportedAt: row.reported_at,
  };
}

export async function getDfwBaseboardModerationReports(
  limit = DEFAULT_REPORT_LIMIT,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("list_open_baseboard_post_reports", {
      p_base_code: "DFW",
      p_limit: limit,
    })
    .returns<CommunityModerationReportRpcRow[]>();

  if (error) {
    return {
      reports: [],
      error,
    };
  }

  return {
    reports: (Array.isArray(data) ? data : []).map(mapReportRow),
    error: null,
  };
}
