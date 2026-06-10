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
  DFW_BASEBOARD_POST_CREATED_STATUS,
  DFW_BASEBOARD_POST_FAILED_STATUS,
  DFW_BASEBOARD_POST_INVALID_STATUS,
  DFW_BASEBOARD_POST_STATUS_PARAM,
} from "./boardPostActionState";

const DFW_BASEBOARD_ROUTE = "/app/hubs/dfw/baseboard";

function buildDfwBaseboardPostRedirect(status: string) {
  const search = new URLSearchParams({
    [DFW_BASEBOARD_POST_STATUS_PARAM]: status,
  });

  return `${DFW_BASEBOARD_ROUTE}?${search.toString()}`;
}

export async function createDfwBaseboardPostAction(formData: FormData) {
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
      action: "create_dfw_baseboard_post",
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
    redirect(buildDfwBaseboardPostRedirect(DFW_BASEBOARD_POST_FAILED_STATUS));
  }

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (
    title.length === 0 ||
    title.length > 120 ||
    body.length === 0 ||
    body.length > 4000
  ) {
    redirect(buildDfwBaseboardPostRedirect(DFW_BASEBOARD_POST_INVALID_STATUS));
  }

  const supabase = await createClient();
  const result = await supabase.rpc("create_open_baseboard_post", {
    p_base_code: "DFW",
    p_title: title,
    p_body: body,
    p_content_type: "note",
    p_category: "general",
  });

  if (result.error || !result.data) {
    redirect(buildDfwBaseboardPostRedirect(DFW_BASEBOARD_POST_FAILED_STATUS));
  }

  revalidatePath(DFW_BASEBOARD_ROUTE);
  redirect(buildDfwBaseboardPostRedirect(DFW_BASEBOARD_POST_CREATED_STATUS));
}
