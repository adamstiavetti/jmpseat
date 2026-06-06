import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { AUTH_ROUTES } from "../../../../src/lib/auth/routes";
import { getCurrentAppAccessContext } from "../../../../src/lib/betaAccess/server";
import { getPrivateAppGateResult } from "../../../../src/lib/privateApp/access";
import { recordSecurityEvent } from "../../../../src/lib/securityEvents/server";
import { getSupabaseBrowserEnv } from "../../../../src/lib/supabase/config";
import { createClient } from "../../../../src/lib/supabase/server";
import {
  WORK_EMAIL_CONFIRMATION_PENDING_COOKIE,
  WORK_EMAIL_CONFIRMATION_PENDING_COOKIE_MAX_AGE_SECONDS,
  decodePendingWorkEmailConfirmation,
  encodePendingWorkEmailConfirmation,
  hashWorkEmailConfirmationSecret,
  isWorkEmailConfirmationSelectorValid,
  isWorkEmailConfirmationTokenValid,
} from "../../../../src/lib/verification/workEmailConfirmation";

type ConfirmWorkEmailRpcResult = {
  ok?: boolean;
  code?: string;
  verification_request_id?: string | null;
  email_domain?: string | null;
};

function buildRedirect(
  request: NextRequest,
  path: string,
  params: Record<string, string | null | undefined> = {},
) {
  const url = new URL(path, request.url);

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  return url;
}

function getSafeFailureMessage(code: string | null | undefined) {
  switch (code) {
    case "expired_token":
      return "That work-email confirmation link has expired. Submit your airline employee email again to request a new link.";
    case "already_used":
      return "That work-email confirmation link has already been used.";
    case "wrong_user":
      return "That work-email confirmation link cannot be confirmed for the current account.";
    case "verification_request_not_confirmable":
      return "That work-email confirmation link no longer matches an active approved-domain request.";
    default:
      return "That work-email confirmation link could not be confirmed. Submit your airline employee email again to request a new link.";
  }
}

function getRpcPayload(data: unknown): ConfirmWorkEmailRpcResult {
  return data && typeof data === "object" ? data as ConfirmWorkEmailRpcResult : {};
}

function redirectWithClearedPendingCookie(request: NextRequest, url: URL) {
  const response = NextResponse.redirect(url);
  response.cookies.set(WORK_EMAIL_CONFIRMATION_PENDING_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: AUTH_ROUTES.verificationConfirm,
    maxAge: 0,
  });
  return response;
}

function redirectToVerificationError(request: NextRequest, code?: string | null) {
  return redirectWithClearedPendingCookie(
    request,
    buildRedirect(request, AUTH_ROUTES.verification, {
      error: getSafeFailureMessage(code),
    }),
  );
}

function getConfirmationInput(request: NextRequest) {
  const selector = request.nextUrl.searchParams.get("selector");
  const token = request.nextUrl.searchParams.get("token");

  if (selector || token) {
    return {
      selector,
      token,
      source: "query" as const,
    };
  }

  const pending = decodePendingWorkEmailConfirmation(
    request.cookies.get(WORK_EMAIL_CONFIRMATION_PENDING_COOKIE)?.value,
  );

  return {
    selector: pending?.selector ?? null,
    token: pending?.token ?? null,
    source: pending ? "cookie" as const : "missing" as const,
  };
}

function isConfirmationInputValid({
  selector,
  token,
}: {
  selector: string | null;
  token: string | null;
}) {
  return (
    isWorkEmailConfirmationSelectorValid(selector) &&
    isWorkEmailConfirmationTokenValid(token)
  );
}

export async function GET(request: NextRequest) {
  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    return NextResponse.redirect(
      buildRedirect(request, AUTH_ROUTES.verification, {
        error:
          "Supabase auth is not configured yet. Work-email confirmation is unavailable in this environment.",
      }),
    );
  }

  const input = getConfirmationInput(request);

  if (
    !input.selector ||
    !input.token ||
    !isConfirmationInputValid({ selector: input.selector, token: input.token })
  ) {
    return redirectToVerificationError(request, "invalid_token");
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    const response = NextResponse.redirect(
      buildRedirect(request, AUTH_ROUTES.login, {
        next: AUTH_ROUTES.verificationConfirm,
      }),
    );
    response.cookies.set(
      WORK_EMAIL_CONFIRMATION_PENDING_COOKIE,
      encodePendingWorkEmailConfirmation({
        selector: input.selector,
        token: input.token,
      }),
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: AUTH_ROUTES.verificationConfirm,
        maxAge: WORK_EMAIL_CONFIRMATION_PENDING_COOKIE_MAX_AGE_SECONDS,
      },
    );
    return response;
  }

  const tokenHash = hashWorkEmailConfirmationSecret(input.token);
  const confirmResult = await supabase.rpc(
    "confirm_work_email_confirmation_token_for_user",
    {
      requested_token_id: input.selector,
      requested_token_hash: tokenHash,
    },
  );
  const payload = getRpcPayload(confirmResult.data);

  if (confirmResult.error || !payload.ok) {
    await recordSecurityEvent({
      userId: user.id,
      eventType: "work_email_verification.confirm_failed",
      route: AUTH_ROUTES.verificationConfirm,
      result: payload.code ?? "confirm_failed",
      metadata: {
        verification_request_id: payload.verification_request_id ?? null,
        email_domain: payload.email_domain ?? null,
        verification_method: "work_email",
        confirmation_source: input.source,
      },
    });

    return redirectToVerificationError(request, payload.code);
  }

  await recordSecurityEvent({
    userId: user.id,
    eventType: "work_email_verification.confirmed",
    route: AUTH_ROUTES.verificationConfirm,
    result: "confirmed",
    metadata: {
      verification_request_id: payload.verification_request_id ?? null,
      email_domain: payload.email_domain ?? null,
      verification_method: "work_email",
      confirmation_source: input.source,
    },
  });

  const appContext = await getCurrentAppAccessContext();
  const gate = getPrivateAppGateResult({
    routeKind: "private-root",
    nextPath: AUTH_ROUTES.app,
    context: appContext,
  });

  return redirectWithClearedPendingCookie(
    request,
    buildRedirect(request, gate.kind === "allow" ? AUTH_ROUTES.app : gate.path),
  );
}
