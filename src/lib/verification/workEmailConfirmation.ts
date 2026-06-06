import { createHash, randomBytes, randomInt } from "node:crypto";

export const WORK_EMAIL_CONFIRMATION_TOKEN_TTL_HOURS = 24;
export const WORK_EMAIL_CONFIRMATION_CODE_TTL_MINUTES = 15;
export const WORK_EMAIL_CONFIRMATION_CODE_LENGTH = 6;
export const WORK_EMAIL_CONFIRMATION_PENDING_COOKIE =
  "jmpseat_work_email_confirmation";
export const WORK_EMAIL_CONFIRMATION_PENDING_COOKIE_MAX_AGE_SECONDS = 10 * 60;

export const WORK_EMAIL_CONFIRMATION_EMAIL_SUBJECT =
  "Verify your airline employee email for jmpseat";

export type WorkEmailConfirmationToken = {
  token: string;
  tokenHash: string;
  expiresAt: string;
};

export type WorkEmailConfirmationCode = {
  code: string;
  codeNonce: string;
  codeHash: string;
  expiresAt: string;
};

export type WorkEmailConfirmationEmailConfig = {
  apiKey: string;
  fromEmail: string;
};

export type PendingWorkEmailConfirmation = {
  selector: string;
  token: string;
};

export type WorkEmailConfirmationAppUrlConfig =
  | { ok: true; appUrl: string }
  | { ok: false; message: string };

export function getWorkEmailConfirmationEmailConfig(
  source: Record<string, string | undefined> = process.env,
): WorkEmailConfirmationEmailConfig | null {
  const apiKey = source.RESEND_API_KEY?.trim() ?? "";
  const fromEmail = source.RESEND_FROM_EMAIL?.trim() ?? "";

  if (!apiKey || !fromEmail) {
    return null;
  }

  return { apiKey, fromEmail };
}

export function getWorkEmailConfirmationAppUrlConfig(
  source: Record<string, string | undefined> = process.env,
): WorkEmailConfirmationAppUrlConfig {
  const configuredUrl = source.NEXT_PUBLIC_APP_URL?.trim() ?? "";
  const vercelUrl = source.VERCEL_URL?.trim() ?? "";
  const candidate = configuredUrl || (vercelUrl ? `https://${vercelUrl}` : "");

  if (!candidate) {
    return {
      ok: false,
      message:
        "Work-email confirmation emails need NEXT_PUBLIC_APP_URL configured for this environment.",
    };
  }

  try {
    const url = new URL(candidate);
    url.pathname = "";
    url.search = "";
    url.hash = "";
    return { ok: true, appUrl: url.toString().replace(/\/$/, "") };
  } catch {
    return {
      ok: false,
      message:
        "Work-email confirmation emails need a valid NEXT_PUBLIC_APP_URL value.",
    };
  }
}

export function hashWorkEmailConfirmationSecret(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function hashWorkEmailConfirmationCode({
  code,
  codeNonce,
}: {
  code: string;
  codeNonce: string;
}) {
  return hashWorkEmailConfirmationSecret(`${codeNonce}:${code}`);
}

export function isWorkEmailConfirmationSelectorValid(
  selector: string | null | undefined,
) {
  return Boolean(
    selector &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        selector,
      ),
  );
}

export function isWorkEmailConfirmationTokenValid(
  token: string | null | undefined,
) {
  return Boolean(token && /^[A-Za-z0-9_-]{32,256}$/.test(token));
}

export function encodePendingWorkEmailConfirmation({
  selector,
  token,
}: PendingWorkEmailConfirmation) {
  return Buffer.from(JSON.stringify({ selector, token }), "utf8").toString(
    "base64url",
  );
}

export function decodePendingWorkEmailConfirmation(
  value: string | null | undefined,
): PendingWorkEmailConfirmation | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as Partial<PendingWorkEmailConfirmation>;
    const selector = parsed.selector;
    const token = parsed.token;

    if (
      typeof selector === "string" &&
      typeof token === "string" &&
      isWorkEmailConfirmationSelectorValid(selector) &&
      isWorkEmailConfirmationTokenValid(token)
    ) {
      return {
        selector,
        token,
      };
    }
  } catch {
    return null;
  }

  return null;
}

function normalizeConfirmationWorkEmail(email: string | null | undefined) {
  const normalized = email?.trim().toLowerCase() ?? "";
  return normalized.length > 0 ? normalized : null;
}

function extractConfirmationWorkEmailDomain(email: string | null | undefined) {
  const normalized = normalizeConfirmationWorkEmail(email);

  if (!normalized) {
    return null;
  }

  const atIndex = normalized.lastIndexOf("@");
  const dotIndex = normalized.lastIndexOf(".");

  if (
    atIndex <= 0 ||
    dotIndex <= atIndex + 1 ||
    dotIndex >= normalized.length - 1
  ) {
    return null;
  }

  return normalized.slice(atIndex + 1);
}

export function generateWorkEmailConfirmationToken({
  now = new Date(),
}: {
  now?: Date;
} = {}): WorkEmailConfirmationToken {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(
    now.getTime() + WORK_EMAIL_CONFIRMATION_TOKEN_TTL_HOURS * 60 * 60 * 1000,
  ).toISOString();

  return {
    token,
    tokenHash: hashWorkEmailConfirmationSecret(token),
    expiresAt,
  };
}

export function generateWorkEmailConfirmationCode({
  now = new Date(),
}: {
  now?: Date;
} = {}): WorkEmailConfirmationCode {
  const code = randomInt(
    0,
    10 ** WORK_EMAIL_CONFIRMATION_CODE_LENGTH,
  )
    .toString()
    .padStart(WORK_EMAIL_CONFIRMATION_CODE_LENGTH, "0");
  const codeNonce = randomBytes(16).toString("base64url");
  const expiresAt = new Date(
    now.getTime() + WORK_EMAIL_CONFIRMATION_CODE_TTL_MINUTES * 60 * 1000,
  ).toISOString();

  return {
    code,
    codeNonce,
    codeHash: hashWorkEmailConfirmationCode({ code, codeNonce }),
    expiresAt,
  };
}

export function getWorkEmailHash(workEmail: string) {
  const normalizedEmail = normalizeConfirmationWorkEmail(workEmail);

  if (!normalizedEmail) {
    return null;
  }

  return hashWorkEmailConfirmationSecret(normalizedEmail);
}

export function buildWorkEmailConfirmationUrl({
  appUrl,
  selector,
  token,
}: {
  appUrl: string;
  selector: string;
  token: string;
}) {
  const url = new URL("/app/verification/confirm", appUrl);
  url.searchParams.set("selector", selector);
  url.searchParams.set("token", token);
  return url.toString();
}

export function buildWorkEmailConfirmationEmail({
  confirmationCode,
}: {
  confirmationCode: string;
}) {
  const text = [
    "Verify your airline employee email for jmpseat.",
    "",
    "Enter this six-digit code in jmpseat to continue app access setup.",
    "",
    `Verification code: ${confirmationCode}`,
    "",
    "This verifies control of this email address only.",
    "It does not verify role, base, seniority, or employer endorsement.",
    "jmpseat is independent and not sponsored by any airline.",
    "",
    "If you did not request this, ignore this email.",
  ].join("\n");

  const html = [
    "<p>Verify your airline employee email for jmpseat.</p>",
    "<p>Enter this six-digit code in jmpseat to continue app access setup.</p>",
    `<p><strong>${confirmationCode}</strong></p>`,
    "<p>This verifies control of this email address only.</p>",
    "<p>It does not verify role, base, seniority, or employer endorsement.</p>",
    "<p>jmpseat is independent and not sponsored by any airline.</p>",
    "<p>If you did not request this, ignore this email.</p>",
  ].join("");

  return {
    subject: WORK_EMAIL_CONFIRMATION_EMAIL_SUBJECT,
    text,
    html,
  };
}

export function getWorkEmailConfirmationDomain(workEmail: string) {
  return extractConfirmationWorkEmailDomain(workEmail);
}
