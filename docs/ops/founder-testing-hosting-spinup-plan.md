# Founder Testing Hosting Spin-Up Plan

Date: 2026-06-06

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Current Hosting Status

Current repo evidence shows:

- the web app has already been linked locally to a Vercel project through the
  `.vercel/` directory
- the repo contains `vercel.json`
- the repo contains a prior production deployment record for the public
  splash/waitlist app at `https://jmpseat.vercel.app`
- the app now contains Supabase-backed auth, profile, airline-email access, and
  beta invite-code foundations that were not part of the older waitlist-only
  deployment record

Important distinction:

- there is evidence of an existing Vercel deployment history
- there is not yet repo-only proof that the current founder-testing stack is
  fully configured in Vercel with all required runtime env vars for the current
  private app flow

## 2. Safe Evidence Summary

Safe evidence found in repo:

- `.vercel/project.json` exists, which means this repo directory has been linked
  to a Vercel project
- `.vercel/README.txt` confirms the folder is created by `vercel link`
- `vercel.json` exists and defines a Vercel cron entry for proof cleanup
- `docs/DEPLOYMENT_RECORD_001.md` records an older public deployment at
  `https://jmpseat.vercel.app`
- `package.json` defines standard Next.js dev/build/start scripts
- `.env.example` defines the current documented env-var surface
- `src/lib/privateApp/launchMode.ts` defaults the app to `private_testing`

Current linked-project caveat:

- the safe local Vercel metadata indicates the linked project still appears to
  use legacy naming rather than clean jmpseat naming
- that should be reviewed in Vercel before founder/Yuri testing, but not
  changed casually from inside the repo

## 3. Local Spin-Up Path

Recommended local founder-testing path:

1. Ensure the required env vars exist locally.
   Start from `.env.example` so `JMPSEAT_LAUNCH_MODE` is documented alongside
   the Supabase browser env vars.
2. Run:

```bash
npm run dev
```

3. Open:

```text
http://localhost:3000
```

Optional validation:

```bash
npm run typecheck
npm run build
```

Expected behavior:

- `/` loads the current public route
- `/login` and `/signup` load auth surfaces
- `/app` remains protected by auth/profile/airline-email/beta gates according to
  launch mode
- in `private_testing`, founder/Yuri accounts still need:
  - authenticated account
  - minimal profile completion
  - approved airline employee email verification
  - beta access

Local caveats:

- local auth flows require valid Supabase browser env vars
- confirmation/reset email behavior depends on Supabase runtime settings, not
  repo code alone
- Resend/Supabase SMTP and Google Workspace support the email side, but local
  app spin-up still depends on the correct redirect URLs and runtime auth setup

## 4. Vercel Preview Path

Recommended preview/founder-testing path:

1. Confirm the GitHub repo is connected to the intended Vercel project.
2. Review the existing Vercel link and make sure the project naming and scope
   are correct for jmpseat.
3. Add the required runtime env vars in Vercel.
   Use `.env.example` as the source-of-truth checklist for env-var names, then
   set `JMPSEAT_LAUNCH_MODE=private_testing` for founder/Yuri preview testing.
4. Create a preview deployment from the current repo state.
5. Test login, signup, redirect, profile, airline-email verification, and beta
   invite-code behavior in preview.
6. Keep `jmpseat.com` DNS unchanged until the preview is validated.
7. Do not add a Closed Beta Login landing entry yet.

Recommended protection posture:

- use Vercel preview or deployment protection if founder/Yuri testing should
  stay bounded
- keep the app in `private_testing` for founder/Yuri testing unless there is an
  explicit launch-readiness decision to move to another mode

## 5. Required Environment Variable Names

Current repo-documented env names:

- `NEXT_PUBLIC_WAITLIST_FORM_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPS_CLEANUP_SECRET`
- `OPERATOR_BOOTSTRAP_SECRET`
- `CRON_SECRET`
- `JMPSEAT_LAUNCH_MODE`

For founder/Yuri preview setup, use `.env.example` as the checklist and set:

- `JMPSEAT_LAUNCH_MODE=private_testing`

Practical founder-testing minimum:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `JMPSEAT_LAUNCH_MODE`

Additional server-side vars may still be required if founder testing touches:

- protected cleanup/cron routes
- operator bootstrap
- reviewer/operator proof-era admin tooling

## 6. Launch Mode Recommendation

For founder/Yuri testing, the safest launch mode is:

- `private_testing`

Reason:

- it preserves the intended auth + profile + airline-email + beta gate stack
- it matches the current default in source
- it avoids accidentally widening access before launch-readiness review

## 7. What Must Remain Protected

Founder/Yuri testing should still keep these protected:

- `/app` private routes behind authenticated account state
- profile completion requirements
- airline employee email eligibility checks
- beta access checks in `private_testing`
- admin/operator pages
- proof-era protected cleanup and monitoring surfaces
- reviewer/operator proof tools

What should not be widened yet:

- no DNS cutover for `jmpseat.com`
- no public-ish app opening through `first_base_launch` or `broader_launch`
- no Closed Beta Login landing entry

## 8. Manual Vercel Review Checklist Before Deployment

Before any preview or production deployment:

- confirm the intended Vercel project is the right one for jmpseat
- confirm environment variables are present in the right environments
- confirm preview and production redirect URLs match Supabase auth settings
- confirm custom auth email flow is already configured in Supabase as planned
- confirm Resend-backed SMTP behavior is working through Supabase
- confirm `JMPSEAT_LAUNCH_MODE` is explicitly set
- confirm preview access is bounded if needed
- confirm cron/protected server env vars are present only if those routes must
  work in that environment

## 9. DNS And Service Relationship Notes

Current service relationship:

- Namecheap hosts DNS for `jmpseat.com`
- Supabase provides auth, database, and backend runtime
- Resend is the transactional/auth email sender through Supabase SMTP
- Google Workspace is for human inboxes, not the transactional auth path
- Vercel is the likely frontend host for preview and production

What not to change yet:

- do not change Namecheap DNS
- do not change Vercel project settings casually
- do not change Supabase dashboard settings as part of simple hosting spin-up
- do not add the Closed Beta Login landing button

## 10. Next Recommended Step

Recommended next step:

1. Verify the intended Vercel project and env-var set manually in Vercel.
2. Keep `JMPSEAT_LAUNCH_MODE=private_testing`.
3. Create or refresh a Vercel preview deployment for founder/Yuri testing.
4. Validate the full auth/profile/airline-email/beta flow in preview before any
   domain or launch-surface changes.
