# Auth Email Branding / Confirmation Template Ops Plan

Date: 2026-06-06

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Decision Summary

Auth email branding must be improved before founder/Yuri Vercel testing or a
public-ish Closed Beta Login entry.

The current Supabase default-looking confirmation and password emails are not
ideal for user trust because they can make the signup flow feel third-party,
unfinished, or confusing.

This plan does not change Supabase dashboard settings. It defines the manual
configuration, copy, validation, and documentation steps required before the
auth email experience is treated as launch-ready.

## 2. Goals

- Make confirmation and reset emails feel like jmpseat.
- Reduce confusion around Supabase/default auth sender branding.
- Support the private testing invite flow without implying public launch.
- Explain that access can require approved airline employee email verification
  and, during private testing, beta access.
- Avoid any official airline sponsorship, endorsement, or employer-system
  implication.
- Avoid proof upload, badge upload, document upload, or employment-document
  language.
- Preserve security clarity around confirmation and password reset links.

## 3. Emails In Scope

In scope:

- signup confirmation email
- email change confirmation, if enabled
- password reset email
- magic link email, if enabled
- invite-related email copy, if a later reviewed implementation adds invite
  distribution emails

Not in scope:

- marketing or newsletter waitlist emails unless they are intentionally sent
  through Supabase Auth
- baseboard launch emails
- community announcement campaigns
- transactional email provider finalization if a provider decision is still
  pending

## 4. Sender / SMTP Recommendation

jmpseat should use custom SMTP or a configured sender domain before testing with
non-founders if practical.

Recommended sender examples:

- `no-reply@jmpseat.app`
- `support@jmpseat.app`

Do not use a personal Gmail account as the production sender.

The selected sender domain will likely require DNS/authentication records:

- SPF
- DKIM
- DMARC

SMTP credentials must live only in the secure email provider and Supabase
project settings. They must never be committed to the repo, pasted into docs,
or printed in terminal output.

The exact email provider can be decided later. The provider decision should
include deliverability, sender authentication, cost, support workflow, and
whether the provider fits early private-testing volume.

## 5. Supabase Dashboard Configuration Checklist

Manual configuration steps:

- Open the correct Supabase project.
- Confirm the project/environment before changing settings.
- Review Auth settings.
- Review Email Templates.
- Review SMTP settings if using custom SMTP.
- Configure sender/from name and sender/from email.
- Update the signup confirmation template.
- Update email change confirmation if enabled.
- Update the password reset template.
- Update magic link copy if magic links are enabled.
- Verify Site URL and redirect URL allowlist values.
- Test with safe accounts.
- Record validation results without exposing links, tokens, secrets, or private
  identifiers.

Do not paste SMTP credentials, API keys, tokens, confirmation links, or raw
template-secret values into docs.

## 6. Confirmation Email Copy Requirements

Confirmation copy should:

- clearly identify jmpseat
- say the email confirms the user's jmpseat account
- explain that confirmation lets the user continue account setup
- mention that app access may also require an approved airline employee email
  and, during private testing, a beta invite code
- avoid implying invite code alone grants access
- avoid implying the app is publicly open
- avoid proof upload, badge upload, screenshot upload, or employment-document
  upload language
- avoid any official airline sponsorship or endorsement implication
- include safe support or help language
- include a clear "ignore this email" line for unexpected requests

## 7. Suggested Confirmation Email Template Copy

Subject:

```text
Confirm your jmpseat account
```

Body draft:

```text
Thanks for signing up for jmpseat.

Confirm your email to continue setting up your account.

During private testing, app access may also require an approved airline employee
email and a beta invite code. jmpseat is an independent community platform and
is not sponsored by any airline, airport, union, or employer.

[Confirm your email]

If you did not request this, you can ignore this email.
```

Template implementation note:

- Replace `[Confirm your email]` with the Supabase confirmation-link placeholder
  verified in the Supabase dashboard for this project.
- Do not guess or hard-code Supabase template variables in repo docs.
- Do not paste real confirmation links into docs or issue trackers.

## 8. Password Reset Template Copy

Subject:

```text
Reset your jmpseat password
```

Body draft:

```text
We received a request to reset the password for your jmpseat account.

If you requested this, use the link below to set a new password.

[Reset password]

If you did not request a password reset, you can ignore this email.
```

Template implementation note:

- Replace `[Reset password]` with the Supabase password-reset link placeholder
  verified in the Supabase dashboard for this project.
- Password reset copy should stay focused on account security.
- Do not include beta invite-code details unless a later reviewed support flow
  requires it.

## 9. Email Link / Redirect Requirements

Before sending real tester emails:

- Site URL must point to the correct deployed URL for the environment.
- Redirect URLs must include production and preview/testing URLs as appropriate.
- Redirect allowlists must not permit arbitrary open redirects.
- Founder/Yuri testing URL must be verified before sending test emails.
- Confirmation and reset links must not be copied into logs, docs, or chat.

Post-auth routing should land users in the existing flow:

- profile completion if profile setup is incomplete
- airline employee email verification if eligibility is missing
- access hold / invite code if beta is required and eligibility is verified
- app entry if all active gates pass

## 10. Testing Checklist

Before founder/Yuri Vercel testing or public-ish Closed Beta Login entry:

- Send signup confirmation to a founder test account.
- Send signup confirmation to a Yuri/tester account if appropriate.
- Inspect sender name and from domain.
- Inspect subject and body copy.
- Confirm the email feels like jmpseat rather than generic Supabase.
- Click confirmation link from a safe test account.
- Verify redirect target.
- Verify login works after confirmation.
- Verify profile completion routing.
- Verify airline employee email verification routing.
- Verify access-hold state.
- Verify invite-code redemption if the environment is in `private_testing` or
  `internal_test`.
- Verify password reset email.
- Verify reset link lands on the intended reset flow.
- Verify email copy does not mention proof upload, badge upload, document
  upload, screenshots, or employment documents.
- Verify email copy does not imply airline sponsorship or employer endorsement.
- Verify mobile rendering.
- Record results without exposing tokens, secrets, full private identifiers, or
  confirmation/reset links.

## 11. Security / Privacy Requirements

- No SMTP credentials in repo.
- No secrets in docs.
- No confirmation/reset tokens in docs, logs, or screenshots.
- No user session data in docs.
- No plaintext invite codes in auth emails unless a later reviewed invite
  distribution flow explicitly and safely supports it.
- No proof upload language.
- No airline sponsorship implication.
- No sensitive user data in subject lines.
- Avoid exposing full airline employee email addresses unless necessary for a
  specific reviewed support flow.
- Keep password reset copy generic and security-focused.

## 12. Environment Separation

Local, dev, staging, preview, and production environments may need different
Site URL and redirect URL settings.

Preview deployments should be tested carefully because auth links may fail if
the preview URL is not on the Supabase redirect allowlist.

The production sender/domain should not be used casually before DNS records are
configured and verified.

If Vercel preview URLs are used for founder/Yuri testing, confirm whether the
Supabase redirect allowlist supports the exact preview URL pattern or a bounded
preview-domain strategy.

## 13. What Stays Deferred

Deferred:

- Closed Beta Login landing button
- marketing or waitlist email automation
- invite-code distribution emails
- final transactional email provider choice if not yet selected
- final legal/privacy language review
- baseboard/community launch emails
- community-admin or restricted-board notification emails

## 14. Implementation / Runbook Implications

Future manual ops or implementation tasks should:

- choose the email sending domain/provider
- configure sender DNS records
- configure Supabase SMTP if custom SMTP is selected
- update Supabase confirmation email template
- update Supabase password reset template
- update email change and magic link templates if enabled
- verify Site URL and redirect URL allowlist settings
- send test emails
- validate redirect and post-auth flow
- document screenshots/results without exposing tokens, secrets, or private
  identifiers
- only then add the Closed Beta Login landing entry

## 15. Source-Of-Truth Statement

This plan defines auth email branding requirements before founder/Yuri testing
or public-ish Closed Beta Login entry.

It does not change app code, migrations, Supabase dashboard settings, SMTP
settings, DNS records, launch modes, beta gates, or invite-code behavior.

Future implementation/manual ops should follow this plan unless a later
reviewed source-of-truth document supersedes it.
