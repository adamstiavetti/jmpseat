import "server-only";

import { redirect } from "next/navigation";

import {
  ADMIN_ROUTES,
  type OperatorScope,
  hasOperatorScope,
} from "./access";
import { findAuthUserIdByEmailAcrossPages } from "./operatorGrantLookup";
import { AUTH_ROUTES } from "../auth/routes";
import { recordSecurityEvent } from "../securityEvents/server";
import { getSupabaseBrowserEnv } from "../supabase/config";
import { createClient } from "../supabase/server";
import { createStorageAdminClient } from "../supabase/storageAdmin";

export const OPERATOR_ACCESS_MANAGEMENT_SCOPE =
  "operator.manage_operator_access" as const satisfies OperatorScope;
export const OPERATOR_INTERNAL_PRIVATE_APP_ACCESS_SCOPE =
  "operator.internal_private_app_access" as const satisfies OperatorScope;
export const OPERATOR_WAITLIST_CONTACT_ACCESS_SCOPE =
  "operator.view_waitlist_contacts" as const satisfies OperatorScope;
export const OPERATOR_ACCESS_ROUTE = ADMIN_ROUTES.operatorAccess;
export const OPERATOR_ACCESS_NOT_READY_MESSAGE =
  "Operator grant management is not ready yet. Apply the operator grants foundation and internal access scope migrations before using this route.";
const POST_BOOTSTRAP_GRANTABLE_OPERATOR_SCOPES = [
  OPERATOR_INTERNAL_PRIVATE_APP_ACCESS_SCOPE,
  OPERATOR_WAITLIST_CONTACT_ACCESS_SCOPE,
] as const;

type OperatorGrantMutationRpcResponse = {
  ok?: boolean;
  code?: string;
  message?: string | null;
  operator_grant_id?: string | null;
};

type PostBootstrapGrantableScope =
  (typeof POST_BOOTSTRAP_GRANTABLE_OPERATOR_SCOPES)[number];

function isPostBootstrapGrantableScope(
  scope: OperatorScope,
): scope is PostBootstrapGrantableScope {
  return POST_BOOTSTRAP_GRANTABLE_OPERATOR_SCOPES.includes(scope as PostBootstrapGrantableScope);
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function buildRedirect(
  path: string,
  params: Record<string, string | null | undefined>,
) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const suffix = search.toString();
  return suffix ? `${path}?${suffix}` : path;
}

function normalizeTargetEmail(value: string) {
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) ? normalized : null;
}

function normalizeOperatorGrantReason(value: string) {
  const normalized = value.trim();
  return normalized ? normalized.slice(0, 500) : null;
}

async function getAuthorizedOperatorGrantClient() {
  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    return {
      kind: "storage_not_ready" as const,
      message:
        "Operator grant management is not ready yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in this environment first.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      kind: "redirect_login" as const,
    };
  }

  const scopesResult = await supabase.rpc("current_user_operator_scopes");
  const scopes = Array.isArray(scopesResult.data)
    ? scopesResult.data.filter((value): value is string => typeof value === "string")
    : [];

  if (scopesResult.error) {
    return {
      kind: "not_ready" as const,
      message: OPERATOR_ACCESS_NOT_READY_MESSAGE,
    };
  }

  if (
    !hasOperatorScope({
      scopes,
      scope: OPERATOR_ACCESS_MANAGEMENT_SCOPE,
    })
  ) {
    return {
      kind: "unauthorized" as const,
      userId: user.id,
    };
  }

  return {
    kind: "authorized" as const,
    supabase,
    userId: user.id,
  };
}

async function recordOperatorGrantUnauthorizedRouteAttempt(userId: string) {
  await recordSecurityEvent({
    userId,
    eventType: "operator_access.unauthorized_attempt",
    route: OPERATOR_ACCESS_ROUTE,
    result: "denied",
    metadata: {
      reason_code: "missing_manage_operator_access_scope",
    },
  });
}

async function recordOperatorGrantDeniedAction(userId: string, reasonCode: string) {
  await recordSecurityEvent({
    userId,
    eventType: "operator_access.unauthorized_attempt",
    route: OPERATOR_ACCESS_ROUTE,
    result: "denied",
    metadata: {
      reason_code: reasonCode,
    },
  });
}

async function requireOperatorGrantManagementAccess() {
  const access = await getAuthorizedOperatorGrantClient();

  if (access.kind === "storage_not_ready" || access.kind === "not_ready") {
    redirect(
      buildRedirect(OPERATOR_ACCESS_ROUTE, {
        error: access.message,
      }),
    );
  }

  if (access.kind === "redirect_login") {
    redirect(
      buildRedirect(AUTH_ROUTES.login, {
        next: OPERATOR_ACCESS_ROUTE,
      }),
    );
  }

  if (access.kind === "unauthorized") {
    await recordOperatorGrantUnauthorizedRouteAttempt(access.userId);
    redirect(AUTH_ROUTES.accessRestricted);
  }

  return access;
}

async function resolveAuthUserIdByEmail(targetEmail: string) {
  const storageAdmin = createStorageAdminClient();

  return findAuthUserIdByEmailAcrossPages({
    targetEmail,
    listUsersPage: ({ page, perPage }) =>
      storageAdmin.auth.admin.listUsers({
        page,
        perPage,
      }),
  });
}

function getMutationMessage(
  response: OperatorGrantMutationRpcResponse | null,
  fallback: string,
) {
  if (response?.code === "target_already_active") {
    return (
      response.message?.trim() ||
      "The target account already has active operator access."
    );
  }

  if (response?.code === "self_grant_blocked") {
    return (
      response.message?.trim() ||
      "Operators cannot grant themselves operator access in this slice."
    );
  }

  return response?.message?.trim() || fallback;
}

async function grantOperatorAccessByScopeAction(
  formData: FormData,
  input: {
    scope: PostBootstrapGrantableScope;
    successMessage: string;
  },
) {
  if (!isPostBootstrapGrantableScope(input.scope)) {
    redirect(
      buildRedirect(OPERATOR_ACCESS_ROUTE, {
        error: "This operator scope is not grantable from the post-bootstrap surface.",
      }),
    );
  }

  const access = await requireOperatorGrantManagementAccess();
  const targetEmail = normalizeTargetEmail(getString(formData, "target_email"));
  const reason = normalizeOperatorGrantReason(getString(formData, "reason"));

  if (!targetEmail) {
    redirect(
      buildRedirect(OPERATOR_ACCESS_ROUTE, {
        error: "A valid target login email is required.",
      }),
    );
  }

  let targetUserId: string | null = null;

  try {
    targetUserId = await resolveAuthUserIdByEmail(targetEmail);
  } catch {
    redirect(
      buildRedirect(OPERATOR_ACCESS_ROUTE, {
        error: OPERATOR_ACCESS_NOT_READY_MESSAGE,
      }),
    );
  }

  if (!targetUserId) {
    await recordOperatorGrantDeniedAction(access.userId, "target_user_not_found");
    redirect(
      buildRedirect(OPERATOR_ACCESS_ROUTE, {
        error: "The target account could not be found.",
      }),
    );
  }

  const rpcResult = await access.supabase.rpc("grant_operator_access", {
    target_user_id: targetUserId,
    requested_scopes: [input.scope],
    reason,
  });

  if (rpcResult.error) {
    redirect(
      buildRedirect(OPERATOR_ACCESS_ROUTE, {
        error: OPERATOR_ACCESS_NOT_READY_MESSAGE,
      }),
    );
  }

  const payload =
    (rpcResult.data as OperatorGrantMutationRpcResponse | null | undefined) ?? null;

  if (!payload?.ok) {
    const message = getMutationMessage(
      payload,
      "The operator access grant could not be created.",
    );

    if (payload?.code === "target_already_active") {
      redirect(
        buildRedirect(OPERATOR_ACCESS_ROUTE, {
          message,
        }),
      );
    }

    redirect(
      buildRedirect(OPERATOR_ACCESS_ROUTE, {
        error: message,
      }),
    );
  }

  redirect(
    buildRedirect(OPERATOR_ACCESS_ROUTE, {
      message: input.successMessage,
    }),
  );
}

export async function grantOperatorInternalAccessAction(formData: FormData) {
  "use server";
  return grantOperatorAccessByScopeAction(formData, {
    scope: OPERATOR_INTERNAL_PRIVATE_APP_ACCESS_SCOPE,
    successMessage: "Internal operator access granted.",
  });
}

export async function grantOperatorWaitlistContactAccessAction(formData: FormData) {
  "use server";
  return grantOperatorAccessByScopeAction(formData, {
    scope: OPERATOR_WAITLIST_CONTACT_ACCESS_SCOPE,
    successMessage: "Waitlist contact access granted.",
  });
}
