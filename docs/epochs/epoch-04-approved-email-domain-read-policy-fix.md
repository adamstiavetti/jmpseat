# Epoch 04 Approved Email Domain Read Policy Fix

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

## Purpose

This note records a narrow runtime bug fix discovered during the Epoch 04 operator verification pass.

## Runtime Bug

During the verification smoke test:

- an operator seeded `aa.com` as an active approved email domain for `American Airlines`
- the applicant could reach `/app/verification`
- the page still reported that no supported work-email domains were available
- submitting `test@aa.com` returned the unsupported-domain path

That behavior prevented the intended work-email verification request from being created even though the operator-managed domain seed existed and was active.

## Root Cause

`public.approved_email_domains` was created with RLS enabled in the verification foundation migration, but the runtime path queried that table as an authenticated app user without any authenticated read policy.

That meant:

- the domain seed could exist
- the authenticated verification surface and action could still fail to see it
- the runtime flow fell back to unsupported-domain behavior

## Fix

Added a narrow policy migration:

- authenticated users can `select` from `public.approved_email_domains`
- only rows with `status = 'active'` are readable

Policy shape:

```sql
create policy "Authenticated users can read active approved email domains"
on public.approved_email_domains
for select
to authenticated
using (status = 'active');
```

## Security Posture

This fix keeps the scope intentionally narrow:

- RLS remains enabled
- no authenticated insert, update, or delete access was added
- disabled domains remain unreadable to ordinary authenticated app users through this policy
- no service-role key was introduced into app or browser code

## Domain Management Posture

Approved email domains remain operator-managed.

This fix does not:

- guess airline domains
- seed additional domains in app code
- hard-code `aa.com` or any other airline domain into runtime logic

The policy only allows the existing operator-managed active domain table to be read by the authenticated verification runtime path.

## Remote State

This change creates a local migration only.

Remote `db push` is intentionally deferred until after review and merge.
