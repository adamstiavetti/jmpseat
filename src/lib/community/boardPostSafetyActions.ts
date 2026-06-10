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
  DFW_BASEBOARD_REPORT_FAILED_STATUS,
  DFW_BASEBOARD_REPORT_INVALID_STATUS,
  DFW_BASEBOARD_REPORT_REPORTED_STATUS,
  DFW_BASEBOARD_REPORT_STATUS_PARAM,
} from "./boardPostSafetyActionState";

const DFW_BASEBOARD_ROUTE = "/app/hubs/dfw/baseboard";
const REPORT_REASONS = new Set([
  "spam",
  "harassment",
  "unsafe_info",
  "privacy",
  "off_topic",
  "other",
]);

function buildDfwBaseboardReportRedirect(status: string) {
  const search = new URLSearchParams({
    [DFW_BASEBOARD_REPORT_STATUS_PARAM]: status,
  });

  return `${DFW_BASEBOARD_ROUTE}?${search.toString()}`;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function reportDfwBaseboardPostAction(formData: FormData) {
  const context = await getCurrentAppAccessContext();
  const gate = getPrivateAppGateResult({
    routeKind: "private-child",
    nextPath: DFW_BASEBOARD_ROUTE,
    context,
  });

  await recordSecurityEvent({
    userId: context.user?.id,
    eventType: getPrivateAccessEventType(gate),
    route: DFW_BASEBOARD_ROUTE,
    result: getPrivateRouteAuditResult(gate, context),
    metadata: {
      route_kind: "private-child",
      section: "dfw-baseboard",
      action: "report_dfw_baseboard_post",
      access_source: getPrivateAccessSource(gate),
      ...(getPrivateAccessSource(gate) === "operator_internal"
        ? { operator_private_app_access: true }
        : {}),
    },
  });

  if (gate.kind === "redirect") {
    redirect(gate.path);
  }

  if (!context.authConfigured || !context.user) {
    redirect(buildDfwBaseboardReportRedirect(DFW_BASEBOARD_REPORT_FAILED_STATUS));
  }

  const postId = String(formData.get("postId") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const details = String(formData.get("details") ?? "").trim();

  if (
    !isUuid(postId) ||
    !REPORT_REASONS.has(reason) ||
    details.length > 1000
  ) {
    redirect(buildDfwBaseboardReportRedirect(DFW_BASEBOARD_REPORT_INVALID_STATUS));
  }

  const supabase = await createClient();
  const result = await supabase.rpc("report_open_baseboard_post", {
    p_base_code: "DFW",
    p_post_id: postId,
    p_reason: reason,
    p_details: details || null,
  });

  if (result.error || !result.data) {
    redirect(buildDfwBaseboardReportRedirect(DFW_BASEBOARD_REPORT_FAILED_STATUS));
  }

  revalidatePath(DFW_BASEBOARD_ROUTE);
  redirect(buildDfwBaseboardReportRedirect(DFW_BASEBOARD_REPORT_REPORTED_STATUS));
}
