"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentAppAccessContext } from "../betaAccess/server";
import {
  getPrivateAccessSource,
  getPrivateAppGateResult,
  getPrivateRouteAuditResult,
} from "../privateApp/access";
import { getPrivateAccessEventType } from "../securityEvents/securityEvents";
import { recordSecurityEvent } from "../securityEvents/server";
import { createClient } from "../supabase/server";
import {
  DFW_HUB_CHANNEL_REPORT_DUPLICATE_STATUS,
  DFW_HUB_CHANNEL_REPORT_FAILED_STATUS,
  DFW_HUB_CHANNEL_REPORT_INVALID_STATUS,
  DFW_HUB_CHANNEL_REPORT_REPORTED_STATUS,
  DFW_HUB_CHANNEL_REPORT_STATUS_PARAM,
  type DfwHubChannelPostActionState,
  DFW_HUB_CHANNEL_POST_FAILED_STATUS,
  DFW_HUB_CHANNEL_POST_INVALID_STATUS,
} from "./hubChannelPostActionState";
import { isUuid } from "./uuid";

const allowedHubChannelContentTypes = new Set([
  "note",
  "question",
  "recommendation",
  "guide",
]);

const allowedHubChannelCategories = new Set([
  "general",
  "food",
  "coffee",
  "transportation",
  "fitness",
  "things_to_do",
  "crew_tips",
  "safety",
  "base_q_and_a",
  "operations_note",
]);

const REPORT_REASONS = new Set([
  "spam",
  "harassment",
  "unsafe_info",
  "privacy",
  "off_topic",
  "other",
]);

type CreatedHubChannelPostRpcRow = {
  id: string;
};

type ReportHubChannelPostRpcRow = {
  report_id: string;
  result_status: "reported" | "already_reported";
};

function isAllowedHubChannelContentType(value: string) {
  return allowedHubChannelContentTypes.has(value);
}

function isAllowedHubChannelCategory(value: string) {
  return allowedHubChannelCategories.has(value);
}

function getDfwHubChannelHref(channelSlug: string) {
  return `/app/hubs/dfw/channels/${encodeURIComponent(channelSlug)}`;
}

function getDfwHubChannelPostHref(channelSlug: string, postId: string) {
  return `${getDfwHubChannelHref(channelSlug)}/${encodeURIComponent(postId)}`;
}

function buildDfwHubChannelReportRedirect(
  channelSlug: string,
  postId: string,
  status: string,
) {
  const search = new URLSearchParams({
    [DFW_HUB_CHANNEL_REPORT_STATUS_PARAM]: status,
  });

  return `${getDfwHubChannelPostHref(channelSlug, postId)}?${search.toString()}`;
}

function normalizeFormChoice(value: FormDataEntryValue | null, fallback: string) {
  return String(value ?? fallback).trim().toLowerCase() || fallback;
}

function buildDfwHubChannelPostActionState(
  status: DfwHubChannelPostActionState["status"],
  href: string | null = null,
): DfwHubChannelPostActionState {
  if (status === "created" && href) {
    return {
      status,
      href,
    };
  }

  if (
    status === DFW_HUB_CHANNEL_POST_INVALID_STATUS ||
    status === DFW_HUB_CHANNEL_POST_FAILED_STATUS
  ) {
    return {
      status,
      href: null,
    };
  }

  return {
    status: "idle",
    href: null,
  };
}

export async function createDfwHubChannelPostAction(
  channelSlug: string,
  _previousState: DfwHubChannelPostActionState,
  formData: FormData,
): Promise<DfwHubChannelPostActionState> {
  const normalizedChannelSlug = channelSlug.trim().toLowerCase();
  const channelRoute = normalizedChannelSlug
    ? getDfwHubChannelHref(normalizedChannelSlug)
    : "/app/hubs/dfw/channels";

  const context = await getCurrentAppAccessContext();
  const gate = getPrivateAppGateResult({
    routeKind: "private-child",
    nextPath: channelRoute,
    context,
  });

  await recordSecurityEvent({
    userId: context.user?.id,
    eventType: getPrivateAccessEventType(gate),
    route: channelRoute,
    result: getPrivateRouteAuditResult(gate, context),
    metadata: {
      route_kind: "private-child",
      section: "dfw-channel",
      action: "create_dfw_hub_channel_post",
      access_source: getPrivateAccessSource(gate),
      ...(getPrivateAccessSource(gate) === "operator_internal"
        ? { operator_private_app_access: true }
        : {}),
    },
  });

  if (gate.kind === "redirect") {
    redirect(gate.path);
  }

  if (!normalizedChannelSlug || !context.authConfigured || !context.user) {
    return buildDfwHubChannelPostActionState(DFW_HUB_CHANNEL_POST_FAILED_STATUS);
  }

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const contentType = normalizeFormChoice(formData.get("contentType"), "note");
  const category = normalizeFormChoice(formData.get("category"), "general");

  if (
    title.length === 0 ||
    title.length > 120 ||
    body.length === 0 ||
    body.length > 4000 ||
    !isAllowedHubChannelContentType(contentType) ||
    !isAllowedHubChannelCategory(category)
  ) {
    return buildDfwHubChannelPostActionState(DFW_HUB_CHANNEL_POST_INVALID_STATUS);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("create_open_hub_channel_post", {
      p_base_code: "DFW",
      p_channel_slug: normalizedChannelSlug,
      p_title: title,
      p_body: body,
      p_content_type: contentType,
      p_category: category,
    })
    .returns<CreatedHubChannelPostRpcRow[]>();

  const [createdPost] = Array.isArray(data) ? data : [];

  if (error || !createdPost?.id || !isUuid(createdPost.id)) {
    return buildDfwHubChannelPostActionState(DFW_HUB_CHANNEL_POST_FAILED_STATUS);
  }

  revalidatePath(channelRoute);
  return {
    status: "created",
    href: getDfwHubChannelPostHref(normalizedChannelSlug, createdPost.id),
  };
}

export async function reportDfwHubChannelPostAction(formData: FormData) {
  const normalizedChannelSlug = String(formData.get("channelSlug") ?? "")
    .trim()
    .toLowerCase();
  const postId = String(formData.get("postId") ?? "").trim();
  const detailRoute =
    normalizedChannelSlug && isUuid(postId)
      ? getDfwHubChannelPostHref(normalizedChannelSlug, postId)
      : "/app/hubs/dfw/channels";

  const context = await getCurrentAppAccessContext();
  const gate = getPrivateAppGateResult({
    routeKind: "private-child",
    nextPath: detailRoute,
    context,
  });

  await recordSecurityEvent({
    userId: context.user?.id,
    eventType: getPrivateAccessEventType(gate),
    route: detailRoute,
    result: getPrivateRouteAuditResult(gate, context),
    metadata: {
      route_kind: "private-child",
      section: "dfw-channel-post",
      action: "report_dfw_hub_channel_post",
      access_source: getPrivateAccessSource(gate),
      ...(getPrivateAccessSource(gate) === "operator_internal"
        ? { operator_private_app_access: true }
        : {}),
    },
  });

  if (gate.kind === "redirect") {
    redirect(gate.path);
  }

  if (!context.authConfigured || !context.user || !normalizedChannelSlug || !isUuid(postId)) {
    redirect(
      normalizedChannelSlug && postId
        ? buildDfwHubChannelReportRedirect(
            normalizedChannelSlug,
            postId,
            DFW_HUB_CHANNEL_REPORT_FAILED_STATUS,
          )
        : "/app/hubs/dfw/channels",
    );
  }

  const reason = String(formData.get("reason") ?? "").trim();
  const details = String(formData.get("details") ?? "").trim();

  if (!REPORT_REASONS.has(reason) || details.length > 1000) {
    redirect(
      buildDfwHubChannelReportRedirect(
        normalizedChannelSlug,
        postId,
        DFW_HUB_CHANNEL_REPORT_INVALID_STATUS,
      ),
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("report_open_hub_channel_post", {
      p_base_code: "DFW",
      p_channel_slug: normalizedChannelSlug,
      p_post_id: postId,
      p_reason: reason,
      p_details: details || null,
    })
    .returns<ReportHubChannelPostRpcRow[]>();

  const [reportResult] = Array.isArray(data) ? data : [];

  if (error || !reportResult?.report_id || !isUuid(reportResult.report_id)) {
    redirect(
      buildDfwHubChannelReportRedirect(
        normalizedChannelSlug,
        postId,
        DFW_HUB_CHANNEL_REPORT_FAILED_STATUS,
      ),
    );
  }

  revalidatePath(detailRoute);
  redirect(
    buildDfwHubChannelReportRedirect(
      normalizedChannelSlug,
      postId,
      reportResult.result_status === "already_reported"
        ? DFW_HUB_CHANNEL_REPORT_DUPLICATE_STATUS
        : DFW_HUB_CHANNEL_REPORT_REPORTED_STATUS,
    ),
  );
}
