import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { AUTH_ROUTES, sanitizeNextPath } from "../../../src/lib/auth/routes";
import { resolveCurrentUserAppPath } from "../../../src/lib/betaAccess/server";
import { recordSecurityEvent } from "../../../src/lib/securityEvents/server";
import { getSupabaseBrowserEnv } from "../../../src/lib/supabase/config";
import { createClient } from "../../../src/lib/supabase/server";

const SUPPORTED_EMAIL_OTP_TYPES = new Set<EmailOtpType>([
  "signup",
  "recovery",
  "invite",
  "magiclink",
  "email_change",
]);

function buildLoginErrorRedirect(request: NextRequest, message: string) {
  const redirectUrl = new URL(AUTH_ROUTES.login, request.url);
  redirectUrl.searchParams.set("error", message);
  return redirectUrl;
}

function getEmailOtpType(value: string | null) {
  if (!value) {
    return null;
  }

  return SUPPORTED_EMAIL_OTP_TYPES.has(value as EmailOtpType)
    ? (value as EmailOtpType)
    : null;
}

function buildCallbackRedirect(request: NextRequest, code: string) {
  const redirectUrl = new URL(AUTH_ROUTES.callback, request.url);
  const next = sanitizeNextPath(request.nextUrl.searchParams.get("next"));
  const mode = request.nextUrl.searchParams.get("mode");

  redirectUrl.searchParams.set("code", code);

  if (next) {
    redirectUrl.searchParams.set("next", next);
  }

  if (mode) {
    redirectUrl.searchParams.set("mode", mode);
  }

  return redirectUrl;
}

export async function GET(request: NextRequest) {
  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    await recordSecurityEvent({
      eventType: "auth.callback_resolved",
      route: AUTH_ROUTES.confirm,
      result: "auth_not_configured",
    });
    return NextResponse.redirect(
      buildLoginErrorRedirect(
        request,
        "Supabase auth is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
      ),
    );
  }

  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = getEmailOtpType(request.nextUrl.searchParams.get("type"));
  const next = sanitizeNextPath(request.nextUrl.searchParams.get("next"));
  const mode = request.nextUrl.searchParams.get("mode");

  if (code && !tokenHash) {
    await recordSecurityEvent({
      eventType: "auth.callback_resolved",
      route: AUTH_ROUTES.confirm,
      result: "code_handoff",
    });
    return NextResponse.redirect(buildCallbackRedirect(request, code));
  }

  if (!tokenHash || !type) {
    await recordSecurityEvent({
      eventType: "auth.callback_resolved",
      route: AUTH_ROUTES.confirm,
      result: "missing_or_invalid_confirmation_data",
    });
    return NextResponse.redirect(
      buildLoginErrorRedirect(
        request,
        "That authentication confirmation link is invalid or expired. Please request a new link.",
      ),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    await recordSecurityEvent({
      eventType: "auth.callback_resolved",
      route: AUTH_ROUTES.confirm,
      result: "verify_failed",
      metadata: {
        confirmation_type: type,
      },
    });
    return NextResponse.redirect(
      buildLoginErrorRedirect(
        request,
        "That authentication confirmation link could not be confirmed. Please request a new link.",
      ),
    );
  }

  if (type === "recovery" || (next === AUTH_ROUTES.resetPassword && mode === "update")) {
    await recordSecurityEvent({
      eventType: "auth.callback_resolved",
      route: AUTH_ROUTES.confirm,
      result: "password_update",
      metadata: {
        confirmation_type: type,
        next_path: AUTH_ROUTES.resetPassword,
      },
    });
    const redirectUrl = new URL(AUTH_ROUTES.resetPassword, request.url);
    redirectUrl.searchParams.set("mode", "update");
    redirectUrl.searchParams.set(
      "message",
      "Choose a new password to finish recovery.",
    );
    return NextResponse.redirect(redirectUrl);
  }

  const destination = await resolveCurrentUserAppPath(next);
  await recordSecurityEvent({
    eventType: "auth.callback_resolved",
    route: AUTH_ROUTES.confirm,
    result: "resolved",
    metadata: {
      confirmation_type: type,
      next_path: destination,
    },
  });
  return NextResponse.redirect(new URL(destination, request.url));
}
