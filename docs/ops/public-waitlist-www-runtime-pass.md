# Public Waitlist Www Runtime Pass

Date: 2026-06-08

Run time: 2026-06-08 12:48:46 CDT

Commit served: `9458543 docs: record public waitlist root cutover`

Public apex target preserved: `https://jmpseat.com`

Public www target: `https://www.jmpseat.com`

Stable beta target preserved: `https://beta.jmpseat.com`

## Summary

`www.jmpseat.com` DNS is now configured and the hostname is aliased in Vercel to
the same public waitlist deployment that serves apex `jmpseat.com`.

The `www` hostname was smoke-tested against Vercel edge and served the public
jmpseat waitlist experience. Apex `jmpseat.com` still serves the public waitlist,
and `beta.jmpseat.com` remained on the private beta/auth/admin deployment.

No waitlist submission was created during this pass.

## DNS And Vercel Status

Public DNS resolvers returned:

- `www.jmpseat.com A 76.76.21.21`

Vercel alias state after the update:

- `www.jmpseat.com` -> `jmpseat-6vu7ctlz6-adam-stiavetti-s-projects.vercel.app`
- `jmpseat.com` -> `jmpseat-6vu7ctlz6-adam-stiavetti-s-projects.vercel.app`
- `beta.jmpseat.com` -> `jmpseat-agm8yl7ta-adam-stiavetti-s-projects.vercel.app`

No env values are recorded in this note.

## Configuration Change

Applied only the `www` alias:

```bash
npx vercel alias set jmpseat-6vu7ctlz6-adam-stiavetti-s-projects.vercel.app www.jmpseat.com
```

Vercel issued the `www.jmpseat.com` certificate and completed the alias.

No DNS records were changed in this task, and no apex or beta alias was moved.

## Www Smoke Test

Confirmed on `https://www.jmpseat.com` through Vercel edge:

- page returns HTTP 200 over HTTPS
- latest public waitlist copy appears
- email-first waitlist form appears
- Privacy and Terms links are present
- Privacy page loads with `Effective date: June 8, 2026`
- Terms page loads with `Effective date: June 8, 2026`
- social metadata points to `https://jmpseat.com/jmpseat/social-preview.png`
- social preview image is reachable
- `Beta Access` is absent
- no `/login?next=/app` CTA appears on the public page
- proof-upload, badge-upload, document-upload, manual-review, and
  verification-review copy are absent from the public page

The broad word `document` can still appear in existing image alt text for a
feature illustration. The risky public waitlist prompts checked here are upload
or manual-review prompts, and those remain absent.

## Apex Preservation

Confirmed after the `www` alias:

- `https://jmpseat.com` still returns HTTP 200
- apex still serves the public waitlist deployment

## Beta Preservation

Confirmed after the `www` alias:

- `https://beta.jmpseat.com` still returns HTTP 200
- Vercel alias state still points beta to the stable beta deployment
- beta was not moved to the public root deployment

No beta grants, airline-email verification mutations, role/base claims,
restricted-board claims, or private beta auth changes were made.

## Runtime Data

No new waitlist test rows were created.

No optional survey responses were created.

No runtime data cleanup was needed.

## Caveat

Immediately after aliasing, this machine's default resolver still returned a
stale negative result for `www.jmpseat.com`, while public resolvers returned
`76.76.21.21` and Vercel edge served the page successfully when resolved to that
edge IP. This looks like local resolver cache lag after DNS propagation, not a
Vercel alias failure.

## Validation

Passed:

- `git diff --check`
