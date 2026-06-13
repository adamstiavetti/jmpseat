"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  ADMIN_ROUTES,
  COMMUNITY_MODERATION_SCOPE,
  getCurrentOperatorAccess,
  hasOperatorScope,
} from "./access";
import { recordSecurityEvent } from "../securityEvents/server";
import { createClient } from "../supabase/server";

const MODERATION_STATUS_PARAM = "moderation";

function buildCommunityModerationRedirect(status: string) {
  const search = new URLSearchParams({
    [MODERATION_STATUS_PARAM]: status,
  });

  return `${ADMIN_ROUTES.communityModeration}?${search.toString()}`;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function moderateDfwBaseboardPostAction(formData: FormData) {
  const access = await getCurrentOperatorAccess();
  const action = String(formData.get("moderationAction") ?? "").trim();
  const postId = String(formData.get("postId") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const hasScope = hasOperatorScope({
    scopes: access.scopes,
    scope: COMMUNITY_MODERATION_SCOPE,
  });

  await recordSecurityEvent({
    userId: access.user?.id,
    eventType: "operator_audit.viewed",
    route: ADMIN_ROUTES.communityModeration,
    result: hasScope ? "requested" : "denied",
    metadata: {
      section: "dfw-baseboard-community-moderation",
      action: "moderate_dfw_baseboard_post",
      moderation_action: action,
      reason_code: hasScope ? "operator_scope_present" : "missing_operator_scope",
    },
  });

  if (!hasScope) {
    redirect(buildCommunityModerationRedirect("community_moderation_denied"));
  }

  if (
    !isUuid(postId) ||
    (action !== "hide" && action !== "remove") ||
    reason.length === 0 ||
    reason.length > 1000
  ) {
    redirect(buildCommunityModerationRedirect("community_moderation_invalid"));
  }

  const supabase = await createClient();
  const result = await supabase.rpc("moderate_open_baseboard_post", {
    p_base_code: "DFW",
    p_post_id: postId,
    p_action: action,
    p_reason: reason,
  });

  if (result.error || !result.data) {
    redirect(buildCommunityModerationRedirect("community_moderation_failed"));
  }

  revalidatePath(ADMIN_ROUTES.communityModeration);
  revalidatePath("/app/hubs/dfw/baseboard");
  redirect(buildCommunityModerationRedirect("community_moderation_completed"));
}

export async function moderateDfwHubChannelPostAction(formData: FormData) {
  const access = await getCurrentOperatorAccess();
  const action = String(formData.get("moderationAction") ?? "").trim();
  const channelSlug = String(formData.get("channelSlug") ?? "").trim().toLowerCase();
  const postId = String(formData.get("postId") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const hasScope = hasOperatorScope({
    scopes: access.scopes,
    scope: COMMUNITY_MODERATION_SCOPE,
  });

  await recordSecurityEvent({
    userId: access.user?.id,
    eventType: "operator_audit.viewed",
    route: ADMIN_ROUTES.communityModeration,
    result: hasScope ? "requested" : "denied",
    metadata: {
      section: "dfw-hub-channel-community-moderation",
      action: "moderate_dfw_hub_channel_post",
      moderation_action: action,
      reason_code: hasScope ? "operator_scope_present" : "missing_operator_scope",
    },
  });

  if (!hasScope) {
    redirect(buildCommunityModerationRedirect("community_moderation_denied"));
  }

  if (
    channelSlug.length === 0 ||
    !isUuid(postId) ||
    (action !== "hide" && action !== "remove") ||
    reason.length === 0 ||
    reason.length > 1000
  ) {
    redirect(buildCommunityModerationRedirect("community_moderation_invalid"));
  }

  const supabase = await createClient();
  const result = await supabase.rpc("moderate_open_hub_channel_post", {
    p_base_code: "DFW",
    p_channel_slug: channelSlug,
    p_post_id: postId,
    p_action: action,
    p_reason: reason,
  });

  if (result.error || !result.data) {
    redirect(buildCommunityModerationRedirect("community_moderation_failed"));
  }

  revalidatePath(ADMIN_ROUTES.communityModeration);
  revalidatePath("/app/hubs/dfw/channels");
  revalidatePath(`/app/hubs/dfw/channels/${encodeURIComponent(channelSlug)}`);
  revalidatePath(
    `/app/hubs/dfw/channels/${encodeURIComponent(channelSlug)}/${encodeURIComponent(postId)}`,
  );
  redirect(buildCommunityModerationRedirect("community_moderation_completed"));
}
