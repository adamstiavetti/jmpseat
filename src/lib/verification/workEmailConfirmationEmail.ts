import "server-only";

import {
  buildWorkEmailConfirmationEmail,
  getWorkEmailConfirmationEmailConfig,
} from "./workEmailConfirmation";

export type SendWorkEmailConfirmationEmailResult =
  | { ok: true }
  | { ok: false; message: string; status?: number };

export async function sendWorkEmailConfirmationEmail({
  to,
  confirmationUrl,
  source = process.env,
  fetchImpl = fetch,
}: {
  to: string;
  confirmationUrl: string;
  source?: Record<string, string | undefined>;
  fetchImpl?: typeof fetch;
}): Promise<SendWorkEmailConfirmationEmailResult> {
  const config = getWorkEmailConfirmationEmailConfig(source);

  if (!config) {
    return {
      ok: false,
      message:
        "Work-email confirmation email is not configured for this environment yet.",
    };
  }

  const email = buildWorkEmailConfirmationEmail({ confirmationUrl });
  const response = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.fromEmail,
      to,
      subject: email.subject,
      text: email.text,
      html: email.html,
    }),
  });

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message:
        "The confirmation email could not be sent yet. Try again in a moment.",
    };
  }

  return { ok: true };
}
