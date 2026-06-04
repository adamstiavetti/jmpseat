# Deployment Record 001

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

Product principle: Utility first. Community second. Social feed last.

Identity principle: Verified privately. Anonymous publicly. Accountable internally.

## 1. Deployment Summary

| Item | Value |
| --- | --- |
| Deployment date | May 28, 2026 |
| Production URL | https://jmpseat.vercel.app |
| Tally waitlist URL | https://tally.so/r/jav6aa |
| Vercel project | `adam-stiavetti-s-projects/jmpseat` |
| Deployment ID | `dpl_k17dPLscuejXiXUx87uvxLatkdCb` |
| Current deployed commit | `7805fddfaf3ed6b04cc34d0187bca12fc69d138c` |

## 2. Checks Passed

- Lint passed.
- Typecheck passed.
- Build passed.

## 3. Scope Confirmation

This production deployment is M1A only.

Included:

- Public splash page.
- Waitlist CTA.
- `/app` private beta placeholder.

Not included:

- Auth.
- Database.
- Supabase.
- API persistence.
- Internal waitlist capture.
- Verification uploads.
- Community features.
- AI.
- Payments.

## 4. Environment Variable

Production waitlist CTA is configured with:

```bash
NEXT_PUBLIC_WAITLIST_FORM_URL=https://tally.so/r/jav6aa
```

The app should show the external waitlist CTA instead of the fallback message.

## 5. Manual Verification Checklist

- [ ] Production site loads at https://jmpseat.vercel.app.
- [ ] Waitlist CTA opens https://tally.so/r/jav6aa.
- [ ] Fallback message is not visible.
- [ ] `/app` remains a private beta placeholder.
- [ ] Public waitlist does not request badge uploads, IDs, schedules, airline portal credentials, exact crew hotel information, passenger information, live location, or confidential company documents.

## 6. Next Actions

- Submit a test Tally response.
- Review mobile UX.
- Send to 3-5 trusted aviation contacts.
- Begin the first outreach/interview cycle.

## 7. Change Boundary

This record documents an existing production deployment and waitlist integration. It does not redeploy, change Vercel settings, alter app behavior, add product features, or create new implementation code.
