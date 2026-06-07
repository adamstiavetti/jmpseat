import { cookies } from "next/headers";

export const PENDING_WORK_EMAIL_CONFIRMATION_COOKIE =
  "jmpseat_pending_work_email_confirmation";
export const PENDING_WORK_EMAIL_CONFIRMATION_MAX_AGE_SECONDS = 10 * 60;

type PendingWorkEmailConfirmation = {
  maskedEmail: string;
};

export function maskWorkEmailForDisplay(email: string) {
  const [localPart = "", domain = ""] = email.trim().toLowerCase().split("@");

  if (!localPart || !domain) {
    return "";
  }

  const visiblePrefix = localPart.slice(0, Math.min(2, localPart.length));
  const visibleSuffix = localPart.length > 3 ? localPart.slice(-1) : "";

  return `${visiblePrefix}${"*".repeat(Math.max(2, Math.min(5, localPart.length - visiblePrefix.length - visibleSuffix.length)))}${visibleSuffix}@${domain}`;
}

function encodePendingWorkEmailConfirmation(pending: PendingWorkEmailConfirmation) {
  return Buffer.from(JSON.stringify(pending), "utf8").toString("base64url");
}

function decodePendingWorkEmailConfirmation(
  value: string | null | undefined,
): PendingWorkEmailConfirmation | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as Partial<PendingWorkEmailConfirmation>;

    return typeof parsed.maskedEmail === "string" && parsed.maskedEmail.includes("@")
      ? { maskedEmail: parsed.maskedEmail }
      : null;
  } catch {
    return null;
  }
}

export async function setPendingWorkEmailConfirmation(email: string) {
  const maskedEmail = maskWorkEmailForDisplay(email);

  if (!maskedEmail) {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(
    PENDING_WORK_EMAIL_CONFIRMATION_COOKIE,
    encodePendingWorkEmailConfirmation({ maskedEmail }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/app/access-hold",
      maxAge: PENDING_WORK_EMAIL_CONFIRMATION_MAX_AGE_SECONDS,
    },
  );
}

export async function getPendingWorkEmailConfirmation() {
  const cookieStore = await cookies();
  return decodePendingWorkEmailConfirmation(
    cookieStore.get(PENDING_WORK_EMAIL_CONFIRMATION_COOKIE)?.value,
  );
}

export async function clearPendingWorkEmailConfirmation() {
  const cookieStore = await cookies();
  cookieStore.set(PENDING_WORK_EMAIL_CONFIRMATION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/app/access-hold",
    maxAge: 0,
  });
}
